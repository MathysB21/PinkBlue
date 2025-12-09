import { create } from "zustand";
import { persist } from "zustand/middleware";

// --- Types ---
export type GamePhase = "LANDING" | "LOBBY" | "GAME";
export type PlayerRole = "HOST" | "CLIENT" | null;

interface GameState {
  // UI Navigation
  phase: GamePhase;
  setPhase: (phase: GamePhase) => void;

  // Network State
  roomId: string | null;
  setRoomId: (id: string | null) => void;

  role: PlayerRole;
  setRole: (role: PlayerRole) => void;

  isConnected: boolean;
  setIsConnected: (connected: boolean) => void;

  // Player Stats (Persisted)
  playerName: string;
  setPlayerName: (name: string) => void;

  // Traits (SWOT)
  selectedTraitId: string | null;
  setSelectedTraitId: (id: string) => void;

  // Economy
  coins: number;
  addCoins: (amount: number) => void;
  subtractCoins: (amount: number) => void;
  unlockedUpgrades: string[]; // IDs of unlocked items
  unlockUpgrade: (id: string) => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      // UI Navigation
      phase: "LANDING",
      setPhase: (phase) => set({ phase }),

      // Network
      roomId: null,
      setRoomId: (roomId) => set({ roomId }),

      role: null,
      setRole: (role) => set({ role }),

      isConnected: false,
      setIsConnected: (isConnected) => set({ isConnected }),

      // Player Stats
      playerName: "Player",
      setPlayerName: (playerName) => set({ playerName }),

      selectedTraitId: null,
      setSelectedTraitId: (selectedTraitId) => set({ selectedTraitId }),

      // Economy
      coins: 0,
      addCoins: (amount) => set((state) => ({ coins: state.coins + amount })),
      subtractCoins: (amount) =>
        set((state) => ({ coins: Math.max(0, state.coins - amount) })),

      unlockedUpgrades: [],
      unlockUpgrade: (id) =>
        set((state) => ({
          unlockedUpgrades: state.unlockedUpgrades.includes(id)
            ? state.unlockedUpgrades
            : [...state.unlockedUpgrades, id],
        })),
    }),
    {
      name: "pinkblue-storage", // name of item in localStorage
      partialize: (state) => ({
        // Only persist these fields
        playerName: state.playerName,
        selectedTraitId: state.selectedTraitId,
        coins: state.coins,
        unlockedUpgrades: state.unlockedUpgrades,
      }),
    }
  )
);
