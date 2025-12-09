import { useState } from "react";
import { useGameStore } from "../store";
import { SHOP_INVENTORY } from "../config/upgrades";
import { X, ShoppingBag } from "lucide-react";

export const ShopOverlay = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { coins, unlockedUpgrades, unlockUpgrade, subtractCoins } =
    useGameStore();

  const handleBuy = (id: string, cost: number) => {
    if (coins >= cost && !unlockedUpgrades.includes(id)) {
      subtractCoins(cost);
      unlockUpgrade(id);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="absolute top-4 right-4 z-20 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold p-3 rounded-full shadow-lg transition-transform hover:scale-110"
      >
        <ShoppingBag size={24} />
      </button>
    );
  }

  return (
    <div className="absolute inset-0 z-20 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-gray-800 w-full max-w-4xl rounded-2xl shadow-2xl border border-gray-700 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gray-900 p-6 flex justify-between items-center border-b border-gray-700">
          <div>
            <h2 className="text-3xl font-black text-yellow-400 uppercase italic">
              The Shop
            </h2>
            <p className="text-gray-400 text-sm">
              Spend your hard-earned coins!
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="bg-gray-800 px-4 py-2 rounded-lg border border-yellow-500/30 text-yellow-400 font-mono font-bold text-xl">
              Coins: {coins}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={32} />
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SHOP_INVENTORY.map((item) => {
            const isUnlocked = unlockedUpgrades.includes(item.id);
            const canAfford = coins >= item.cost;

            return (
              <div
                key={item.id}
                className={`
                                    relative p-6 rounded-xl border-2 flex flex-col gap-4 transition-all
                                    ${
                                      isUnlocked
                                        ? "border-green-500/50 bg-green-900/10 opacity-75"
                                        : "border-gray-600 bg-gray-700/50 hover:border-gray-500"
                                    }
                                `}
              >
                <div className="flex justify-between items-start">
                  <div className="text-4xl">{item.icon}</div>
                  <div
                    className={`
                                        px-3 py-1 rounded text-sm font-bold
                                        ${isUnlocked ? "bg-green-500 text-black" : "bg-gray-900 text-yellow-400"}
                                    `}
                  >
                    {isUnlocked ? "OWNED" : `${item.cost} G`}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    {item.name}
                  </h3>
                  <p className="text-gray-400 text-sm">{item.description}</p>
                </div>

                <div className="mt-auto">
                  <button
                    onClick={() => handleBuy(item.id, item.cost)}
                    disabled={isUnlocked || !canAfford}
                    className={`
                                            w-full py-2 rounded-lg font-bold text-sm uppercase tracking-wide transition-colors
                                            ${
                                              isUnlocked
                                                ? "bg-gray-800 text-green-500 cursor-default"
                                                : canAfford
                                                  ? "bg-yellow-500 hover:bg-yellow-400 text-black hover:scale-[1.02]"
                                                  : "bg-gray-800 text-gray-500 cursor-not-allowed"
                                            }
                                        `}
                  >
                    {isUnlocked
                      ? "Purchased"
                      : canAfford
                        ? "Buy Now"
                        : "Not Enough Coins"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
