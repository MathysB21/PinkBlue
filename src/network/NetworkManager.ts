import Peer from "peerjs";
import type { DataConnection } from "peerjs";

export type NetworkEventCallback = (data: any) => void;

export class NetworkManager {
  peer: Peer;
  conn: DataConnection | null = null;
  isHost: boolean = false;
  myId: string = "";

  // Simple event emitter replacement
  private listeners: Map<string, NetworkEventCallback[]> = new Map();

  constructor() {
    this.peer = new Peer();
    this.peer.on("open", (id) => {
      this.myId = id;
      console.log("My Peer ID:", id);
    });

    // If someone connects to us (we are host)
    this.peer.on("connection", (conn) => {
      console.log("Incoming connection from", conn.peer);

      const onOpen = () => {
        console.log("Connection Fully Open!");
        this.handleConnection(conn);
      };

      if (conn.open) {
        onOpen();
      } else {
        conn.on("open", onOpen);
      }
    });

    // Handle errors
    this.peer.on("error", (err) => {
      console.error("PeerJS Error:", err);
      this.emit("error", err);
    });
  }

  // Host a game
  async hostGame(): Promise<string> {
    this.isHost = true;

    if (this.myId) return this.myId;

    return new Promise((resolve) => {
      this.peer.on("open", (id) => {
        resolve(id);
      });
    });
  }

  // Join a game
  joinGame(hostId: string): Promise<void> {
    this.isHost = false;
    const conn = this.peer.connect(hostId, {
      reliable: true,
      serialization: "json",
    });

    return new Promise((resolve, reject) => {
      conn.on("open", () => {
        console.log("Connected to Host!");
        this.handleConnection(conn);
        resolve();
      });
      conn.on("error", (err) => {
        console.error("Connection Error:", err);
        reject(err);
      });
    });
  }

  private handleConnection(conn: DataConnection) {
    this.conn = conn;

    this.conn.on("data", (data) => {
      // console.log("NetworkManager Received:", data); // Verbose
      this.emit("data", data);
    });

    this.conn.on("close", () => {
      console.log("Connection closed");
      this.emit("disconnected", null);
      this.conn = null;
    });

    this.emit("connected", conn.peer);
  }

  send(data: any) {
    if (!this.conn) {
      console.warn("NetworkManager: No connection to send to.");
      return;
    }
    if (!this.conn.open) {
      console.warn("NetworkManager: Connection is not open.");
      return;
    }
    this.conn.send(data);
  }

  // --- Simple Event System ---

  on(event: string, callback: NetworkEventCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  off(event: string, callback: NetworkEventCallback) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      this.listeners.set(
        event,
        callbacks.filter((cb) => cb !== callback)
      );
    }
  }

  private emit(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((cb) => cb(data));
    }
  }
}

// Singleton instance
export const network = new NetworkManager();
