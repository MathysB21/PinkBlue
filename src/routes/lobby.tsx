import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { network } from "../network/NetworkManager";
import { useGameStore } from "../store";

export const Route = createFileRoute("/lobby")({
  component: Lobby,
});

function Lobby() {
  const navigate = useNavigate();
  const { setRole, setRoomId, roomId } = useGameStore();
  const [joinId, setJoinId] = useState("");
  const [status, setStatus] = useState<
    "idle" | "hosting" | "connecting" | "connected"
  >("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Listen for successful connections to navigate
    const handleConnected = () => {
      setStatus("connected");
      setTimeout(() => {
        navigate({ to: "/play" });
      }, 500); // Brief delay to show "Connected!"
    };

    network.on("connected", handleConnected);
    network.on("error", (err: any) =>
      setError(err.message || "Connection failed")
    );

    return () => {
      network.off("connected", handleConnected);
    };
  }, [navigate]);

  const handleHost = async () => {
    setStatus("hosting");
    setRole("HOST");
    try {
      const id = await network.hostGame();
      setRoomId(id);
    } catch (e: any) {
      setError(e.message);
      setStatus("idle");
    }
  };

  const handleJoin = async () => {
    if (!joinId) return;
    setStatus("connecting");
    setRole("CLIENT");
    try {
      await network.joinGame(joinId);
      setRoomId(joinId);
      // Navigation happens in useEffect on 'connected' event
    } catch (e: any) {
      setError(e.message);
      setStatus("idle");
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-20 px-4">
      <h2 className="text-4xl font-bold mb-12 text-center text-white">Lobby</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Host Card */}
        <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 flex flex-col items-center">
          <h3 className="text-2xl font-bold mb-4 text-blue-400">Host Game</h3>
          <p className="text-gray-400 mb-8 text-center text-sm">
            Create a room and invite your partner.
          </p>

          {status === "hosting" && roomId ? (
            <div className="w-full">
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-1 text-center">
                Room ID
              </p>
              <div className="bg-gray-900 p-4 rounded-lg font-mono text-center text-lg mb-4 break-all select-all border border-blue-500/30">
                {roomId}
              </div>
              <div className="flex items-center justify-center gap-2 text-yellow-400 animate-pulse">
                <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                <span>Waiting for player 2...</span>
              </div>
            </div>
          ) : (
            <button
              onClick={handleHost}
              disabled={status !== "idle"}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {status === "hosting" ? "Creating..." : "Create Room"}
            </button>
          )}
        </div>

        {/* Join Card */}
        <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 flex flex-col items-center">
          <h3 className="text-2xl font-bold mb-4 text-pink-400">Join Game</h3>
          <p className="text-gray-400 mb-8 text-center text-sm">
            Enter the Room ID from your partner.
          </p>

          <input
            type="text"
            placeholder="Paste Room ID here"
            value={joinId}
            onChange={(e) => setJoinId(e.target.value)}
            className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white mb-4 focus:border-pink-500 focus:outline-none transition-colors"
          />

          <button
            onClick={handleJoin}
            disabled={status !== "idle" || !joinId}
            className="w-full py-3 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {status === "connecting" ? "Connecting..." : "Join Room"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-8 p-4 bg-red-900/50 border border-red-500 text-red-200 rounded-lg text-center">
          Error: {error}
        </div>
      )}
    </div>
  );
}
