import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useGameStore } from "../store";
import { TRAIT_DATABASE } from "../config/traits";

export const Route = createFileRoute("/character-creation")({
  component: CharacterCreation,
});

function CharacterCreation() {
  const navigate = useNavigate();
  const { setSelectedTraitId, selectedTraitId } = useGameStore();

  const handleNext = () => {
    if (selectedTraitId) {
      navigate({ to: "/lobby" });
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10">
      <h2 className="text-3xl font-bold mb-8 text-center text-white">
        Choose Your Baggage
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-10">
        {TRAIT_DATABASE.map((trait) => (
          <div
            key={trait.id}
            onClick={() => setSelectedTraitId(trait.id)}
            className={`
              cursor-pointer p-6 rounded-xl border-2 transition-all duration-200 relative overflow-hidden group
              ${
                selectedTraitId === trait.id
                  ? "border-pink-500 bg-gray-800 shadow-xl shadow-pink-500/20 scale-[1.02]"
                  : "border-gray-700 bg-gray-800/50 hover:border-gray-500 hover:bg-gray-800"
              }
            `}
          >
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-2 text-white group-hover:text-pink-400 transition-colors">
                {trait.name}
              </h3>
              <p className="text-gray-400 text-sm mb-4 min-h-[40px]">
                {trait.description}
              </p>

              <div className="flex gap-2 text-xs flex-wrap">
                {Object.entries(trait.modifiers).map(([key, val]) => (
                  <span
                    key={key}
                    className="px-2 py-1 bg-gray-900 rounded text-gray-300 font-mono"
                  >
                    {key}: {val}
                  </span>
                ))}
              </div>
            </div>

            {selectedTraitId === trait.id && (
              <div className="absolute top-2 right-2 text-pink-500">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleNext}
          disabled={!selectedTraitId}
          className={`
            px-12 py-4 rounded-full font-bold text-lg transition-all
            ${
              selectedTraitId
                ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/30 hover:scale-105"
                : "bg-gray-700 text-gray-500 cursor-not-allowed"
            }
          `}
        >
          To The Lobby →
        </button>
      </div>
    </div>
  );
}
