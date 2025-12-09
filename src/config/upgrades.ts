export type UpgradeType = "PASSIVE" | "ACTIVE_TOOL";

export interface UpgradeEffect {
  // PASSIVE EFFECTS
  maxHealthBonus?: number; // Add hearts
  coinMultiplier?: number; // 1.2x coins
  magnetRadius?: number; // Range to suck in coins (pixels)

  // ACTIVE TOOL EFFECTS
  cooldown?: number; // Time between uses (ms)
  toolId?: string; // 'slingshot', 'grapple', 'heal_burst'
}

export interface UpgradeItem {
  id: string;
  name: string;
  type: UpgradeType;
  cost: number;
  description: string;
  icon: string; // Emoji or asset path
  effect: UpgradeEffect;
  prerequisite?: string; // e.g., need 'health_1' before 'health_2'
}

export const SHOP_INVENTORY: UpgradeItem[] = [
  // --- TIER 1: BASICS ---
  {
    id: "health_1",
    name: "Extra Padding",
    type: "PASSIVE",
    cost: 50,
    description: "Adds +1 Max Health.",
    icon: "❤️",
    effect: { maxHealthBonus: 1 },
  },
  {
    id: "magnet_1",
    name: "Coin Magnet",
    type: "PASSIVE",
    cost: 100,
    description: "Attracts coins from a short distance.",
    icon: "🧲",
    effect: { magnetRadius: 100 },
  },

  // --- TIER 2: ECONOMY ---
  {
    id: "greed_1",
    name: "Golden Pockets",
    type: "PASSIVE",
    cost: 300,
    description: "Gain 20% more coins from pickups.",
    icon: "💰",
    effect: { coinMultiplier: 1.2 },
  },

  // --- TIER 3: ACTIVE TOOLS (New Mechanics) ---
  {
    id: "tool_heal",
    name: "First Aid Kit",
    type: "ACTIVE_TOOL",
    cost: 500,
    description: "Press [E] to heal your partner (30s Cooldown).",
    icon: "🩹",
    effect: {
      toolId: "heal_burst",
      cooldown: 30000,
    },
  },
  {
    id: "tool_slingshot",
    name: "Bungee Slingshot",
    type: "ACTIVE_TOOL",
    cost: 800,
    description: "Press [SPACE] while hanging to launch yourself forward.",
    icon: "🚀",
    effect: {
      toolId: "slingshot",
      cooldown: 5000,
    },
  },
];

// Helper to calculate total stats based on unlocked IDs
export function calculatePlayerStats(unlockedIds: string[]) {
  const stats = {
    maxHealth: 3, // Base
    magnetRadius: 0, // Base
    coinMultiplier: 1, // Base
    tools: [] as string[],
  };

  unlockedIds.forEach((id) => {
    const item = SHOP_INVENTORY.find((i) => i.id === id);
    if (!item) return;

    if (item.effect.maxHealthBonus)
      stats.maxHealth += item.effect.maxHealthBonus;
    if (item.effect.magnetRadius)
      stats.magnetRadius += item.effect.magnetRadius;
    if (item.effect.coinMultiplier)
      stats.coinMultiplier *= item.effect.coinMultiplier;
    if (item.effect.toolId) stats.tools.push(item.effect.toolId);
  });

  return stats;
}
