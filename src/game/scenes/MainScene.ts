import Phaser from "phaser";
import { network } from "../../network/NetworkManager";
import { createBungee, createPlayerBody } from "../utils/PhysicsUtils";
import { useGameStore } from "../../store";

interface InputState {
  left: boolean;
  right: boolean;
  up: boolean;
}

export class MainScene extends Phaser.Scene {
  player1!: Phaser.Physics.Matter.Image;
  player2!: Phaser.Physics.Matter.Image;
  ropeBodies: Phaser.Types.Physics.Matter.MatterBody[] = [];
  graphics!: Phaser.GameObjects.Graphics;

  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  wasd!: any;

  // Network Inputs
  remoteInput: InputState = { left: false, right: false, up: false };

  // Debug
  debugText!: Phaser.GameObjects.Text;
  packetCount: number = 0; // Incoming
  sentCount: number = 0; // Outgoing

  // Interpolation
  targetState: any = null;
  lerpFactor: number = 0.2; // 20% per frame smoothing

  constructor() {
    super({ key: "MainScene" });
  }

  create() {
    const { isHost } = network;
    const state = useGameStore.getState();

    // Debug Text
    this.debugText = this.add.text(
      20,
      20,
      `Role: ${isHost ? "HOST" : "CLIENT"}\nWaiting...`,
      {
        font: "32px monospace", // Larger Font
        color: "#ffffff",
        backgroundColor: "#00000088", // detailed background for readability
      }
    );
    this.debugText.setScrollFactor(0);
    this.debugText.setDepth(100);

    // 1. Setup World Boundaries
    this.matter.world.setBounds(0, 0, 800, 600);

    // 3. Create Players
    // P1 = Host (Blue), P2 = Client (Pink)
    this.player1 = createPlayerBody(
      this,
      200,
      400,
      0x0095dd,
      state.role === "HOST" ? state.selectedTraitId : "balanced"
    );
    this.player2 = createPlayerBody(
      this,
      300,
      400,
      0xff0055,
      state.role === "CLIENT" ? state.selectedTraitId : "balanced"
    );

    // 4. Create Bungee (Only Host needs to simulate it properly)
    if (isHost) {
      this.ropeBodies = createBungee(
        this,
        this.player1.body as any,
        this.player2.body as any
      );

      // --- COIN LOGIC ---
      // Spawn some coins
      for (let i = 0; i < 5; i++) {
        const coin = this.matter.add.circle(300 + i * 50, 200, 10, {
          isStatic: true,
          label: "COIN",
          isSensor: true, // Don't block players
        });
        // Visual for coin
        // Note: We don't link visual to body here for simplicity, but strictly should.
        // Or just draw them in graphics.
        // For this prototype, we'll verify logic via Store Coin Count update.
      }

      // Collision Handling
      this.matter.world.on("collisionstart", (event: any) => {
        event.pairs.forEach((pair: any) => {
          const { bodyA, bodyB } = pair;
          // Check if Player hit Coin
          if (bodyA.label === "COIN" || bodyB.label === "COIN") {
            const coinBody = bodyA.label === "COIN" ? bodyA : bodyB;

            // Check if other body is a player (not strictly checked here but safe assumption in empty world)
            // In real game, check bodyA.label === 'PLAYER' etc.

            // "Collect" coin
            this.matter.world.remove(coinBody);
            useGameStore.getState().addCoins(10);
            console.log("Coin Collected! +10");
          }
        });
      });
    } else {
      // Client: Disable physics for players so they don't fall by themselves
      (this.player1.body as any).isStatic = true;
      (this.player2.body as any).isStatic = true;
    }

    // 5. Setup Inputs
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys({
      W: Phaser.Input.Keyboard.KeyCodes.W,
      A: Phaser.Input.Keyboard.KeyCodes.A,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      D: Phaser.Input.Keyboard.KeyCodes.D,
    });

    // 6. Graphics for Rope
    this.graphics = this.add.graphics();

    // 7. Network Listeners
    this.setupNetworkListeners();
  }

  lastSendTime: number = 0;

  shutdown() {
    // Cleanup listeners to prevent duplicates on remount
    network.off("data", this.handleNetworkData);
  }

  setupNetworkListeners() {
    // Use named function for easier removal
    this.handleNetworkData = this.handleNetworkData.bind(this);
    network.on("data", this.handleNetworkData);

    // Also listen for scene shutdown/destroy to ensure cleanup
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);
    this.events.on(Phaser.Scenes.Events.DESTROY, this.shutdown, this);
  }

  handleNetworkData(data: any) {
    // Guard against processing on a destroyed/inactive scene
    if (
      !this.sys ||
      !this.sys.isActive() ||
      !this.player1 ||
      !this.player1.body
    ) {
      // console.warn("Ignoring network data on inactive scene");
      return;
    }

    this.packetCount++;
    this.updateDebugText();

    if (network.isHost) {
      if (data.input) {
        this.remoteInput = data.input;
      }
    } else {
      if (data.p1 && data.p2) {
        this.updateClientState(data);
      }
    }
  }

  updateDebugText() {
    if (this.debugText) {
      this.debugText.setText(
        `Role: ${network.isHost ? "HOST" : "CLIENT"}\nIN: ${this.packetCount}\nOUT: ${this.sentCount}`
      );
    }
  }

  updateClientState(data: any) {
    // Store target state for interpolation in update()
    this.targetState = data;

    // We can update rope immediately or interpolate it too.
    // For now, immediate update for rope is usually fine or we can defer it.
    if (data.rope) {
      this.drawRopeFromPoints(data.rope);
    }
  }

  update(time: number, delta: number) {
    const { isHost } = network;
    const input = this.getLocalInput();

    // Update debug text every frame primarily for Sent count
    this.updateDebugText();

    if (isHost) {
      // Apply Physics
      this.handlePlayerPhysics(this.player1, input);
      this.handlePlayerPhysics(this.player2, this.remoteInput);

      // Send State (Every Frame / 60 FPS)
      const ropePoints = this.ropeBodies.map((b) => ({
        x: (b as any).position.x,
        y: (b as any).position.y,
      }));

      const stateToSend = {
        p1: {
          x: this.player1.x,
          y: this.player1.y,
          angle: this.player1.rotation,
        },
        p2: {
          x: this.player2.x,
          y: this.player2.y,
          angle: this.player2.rotation,
        },
        rope: ropePoints,
      };

      network.send(stateToSend);
      this.sentCount++; // Track sent packets

      // Draw Rope Locally
      this.drawRopeFromPoints(ropePoints);
    } else {
      // Client: Interpolate towards target
      if (this.targetState) {
        const { p1, p2 } = this.targetState;

        // P1
        this.player1.x = Phaser.Math.Linear(
          this.player1.x,
          p1.x,
          this.lerpFactor
        );
        this.player1.y = Phaser.Math.Linear(
          this.player1.y,
          p1.y,
          this.lerpFactor
        );
        this.player1.setRotation(
          Phaser.Math.Linear(this.player1.rotation, p1.angle, this.lerpFactor)
        );

        // P2
        this.player2.x = Phaser.Math.Linear(
          this.player2.x,
          p2.x,
          this.lerpFactor
        );
        this.player2.y = Phaser.Math.Linear(
          this.player2.y,
          p2.y,
          this.lerpFactor
        );
        this.player2.setRotation(
          Phaser.Math.Linear(this.player2.rotation, p2.angle, this.lerpFactor)
        );
      }

      // Client: Send Input (Every Frame is mostly fine, or throttle too)
      network.send({ input });
      this.sentCount++; // Track sent packets
    }
  }

  getLocalInput(): InputState {
    const left = this.cursors.left.isDown || this.wasd.A.isDown;
    const right = this.cursors.right.isDown || this.wasd.D.isDown;
    const up = this.cursors.up.isDown || this.wasd.W.isDown;

    return { left, right, up };
  }

  handlePlayerPhysics(player: Phaser.Physics.Matter.Image, input: InputState) {
    const speed = 5;
    const jumpForce = 12;

    if (input.left) {
      player.setVelocityX(-speed);
    } else if (input.right) {
      player.setVelocityX(speed);
    }

    if (input.up) {
      if (Math.abs(player.body!.velocity.y) < 0.2) {
        player.setVelocityY(-jumpForce);
      }
    }
  }

  drawRopeFromPoints(points: { x: number; y: number }[]) {
    this.graphics.clear();
    this.graphics.lineStyle(4, 0xffffff, 1);

    if (!points || points.length === 0) return;

    this.graphics.beginPath();
    this.graphics.moveTo(this.player1.x, this.player1.y);

    points.forEach((p) => {
      this.graphics.lineTo(p.x, p.y);
    });

    this.graphics.lineTo(this.player2.x, this.player2.y);
    this.graphics.strokePath();
  }
}
