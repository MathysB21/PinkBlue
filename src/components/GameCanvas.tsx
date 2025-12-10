import React, { useEffect, useRef } from "react";
import Phaser from "phaser";
import { MainScene } from "../game/scenes/MainScene";

export const GameCanvas = () => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: containerRef.current!,
      backgroundColor: "#2d2d2d",
      physics: {
        default: "matter",
        matter: {
          gravity: { x: 0, y: 1 },
          debug: false,
        },
      },
      scene: [MainScene],
    };

    gameRef.current = new Phaser.Game(config);

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return (
    <div className="flex justify-center items-center h-screen bg-gray-900">
      <div
        ref={containerRef}
        className="rounded-lg overflow-hidden shadow-2xl border-4 border-gray-700"
      />
    </div>
  );
};
