import Phaser from "phaser";
import { applyTraits } from "../../config/traits";

// Configuration for the Bungee Rope
const BUNGEE_CONFIG = {
  segments: 12, // Number of chain links
  stiffness: 0.5, // Spring stiffness (0.1 loose, 1.0 rigid)
  damping: 0.05, // Damping for stability
  length: 20, // Distance between segments
};

export const PHYSICS_GROUPS = {
  PLAYERS: 0x0001,
  TERRAIN: 0x0002,
  ROPE: 0x0004,
};

/**
 * Creates a physical Bungee Cord connecting two bodies.
 * Returns the list of rope segment bodies (circles) for rendering.
 */
export function createBungee(
  scene: Phaser.Scene,
  bodyA: Phaser.Types.Physics.Matter.MatterBody,
  bodyB: Phaser.Types.Physics.Matter.MatterBody
): Phaser.Types.Physics.Matter.MatterBody[] {
  const { segments, stiffness, damping, length } = BUNGEE_CONFIG;

  // Calculate start/end positions from bodies
  // Note: body.position is {x, y}
  const startX = (bodyA as any).position.x;
  const startY = (bodyA as any).position.y;
  const endX = (bodyB as any).position.x;
  const endY = (bodyB as any).position.y;

  const dx = (endX - startX) / (segments + 1);
  const dy = (endY - startY) / (segments + 1);

  let previousBody = bodyA;
  const ropeBodies: Phaser.Types.Physics.Matter.MatterBody[] = [];

  for (let i = 1; i <= segments; i++) {
    const x = startX + dx * i;
    const y = startY + dy * i;

    // Create invisible physics circle for the chain link
    const circle = scene.matter.add.circle(x, y, 5, {
      mass: 0.1,
      frictionAir: 0.05,
      collisionFilter: { group: -1 }, // Negative group means they don't collide with each other usually, or we can use categories
    });

    ropeBodies.push(circle);

    // Constraint to previous body
    scene.matter.add.constraint(
      previousBody as any,
      circle as any,
      length,
      stiffness,
      {
        damping: damping,
        render: { visible: false }, // We draw it ourselves
      }
    );

    previousBody = circle;
  }

  // Connect last link to Body B
  scene.matter.add.constraint(
    previousBody as any,
    bodyB as any,
    length,
    stiffness,
    {
      damping: damping,
      render: { visible: false },
    }
  );

  return ropeBodies;
}

/**
 * Creates a Player Body (Rectangle) with specific Traits.
 */
export function createPlayerBody(
  scene: Phaser.Scene,
  x: number,
  y: number,
  color: number,
  traitId: string | null
) {
  // Visual
  const player = scene.add.rectangle(x, y, 40, 40, color);

  // Physics
  const body = scene.matter.add.gameObject(player, {
    shape: "rectangle",
    width: 40,
    height: 40,
  }) as Phaser.Physics.Matter.Image; // Casting for convenience, though it's a Rect

  // Apply Traits (Mass, Friction, etc.)
  applyTraits(body.body!, traitId);

  // Initial settings
  body.setFixedRotation(); // Prevent player from tumbling

  return body;
}
