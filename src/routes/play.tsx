import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { GameCanvas } from "../components/GameCanvas";
import { ShopOverlay } from "../components/ShopOverlay";
import { useGameStore } from "../store";
import { network } from "../network/NetworkManager";

export const Route = createFileRoute("/play")({
  component: Play,
});

function Play() {
  const { coins, role } = useGameStore();
  const navigate = useNavigate();

  useEffect(() => {
    // Session Validation:
    // If we are meant to be HOST but network says we aren't,
    // OR if we are CLIENT but have no connection,
    // prevent playing in a broken state.
    const isSessionValid =
      (role === "HOST" && network.isHost) ||
      (role === "CLIENT" && network.conn && network.conn.open);

    if (!isSessionValid) {
      console.warn(
        "Session invalid (Refresh detected?), redirecting to Lobby."
      );
      navigate({ to: "/lobby" });
    }
  }, [role, navigate]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <ShopOverlay />
      <GameCanvas />
    </div>
  );
}
