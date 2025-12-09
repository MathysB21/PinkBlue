import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <h1 className="text-6xl font-black mb-4 bg-gradient-to-r from-pink-500 to-blue-500 text-transparent bg-clip-text">
        PinkBlue
      </h1>
      <p className="text-xl text-gray-400 mb-12 max-w-md text-center">
        A co-op platformer about relationships, tethered together by fate (and
        physics).
      </p>

      <Link
        to="/character-creation"
        className="px-8 py-4 bg-white text-gray-900 font-bold rounded-full hover:scale-105 hover:bg-gray-100 transition-transform shadow-lg shadow-pink-500/20 text-xl"
      >
        Start Game
      </Link>
    </div>
  );
}
