// 1. Define what parts of physics we can tweak
export interface PhysicsModifiers {
  massMultiplier?: number; // 1.0 is normal. 2.0 is heavy.
  frictionAir?: number; // 0.01 is normal. 0.1 is "Draggy/Slow".
  jumpForce?: number; // Negative value (y-axis up).
  scale?: number; // Visual size (0.8 to 1.2).
}

// 2. Define the "Real Life" Trait
export interface Trait {
  id: string;
  name: string;
  description: string;
  modifiers: PhysicsModifiers;
}

// 3. The Database of Traits
export const TRAIT_DATABASE: Trait[] = [
  {
    id: "balanced",
    name: "The BalancedOne",
    description: "Just a regular square. No baggage.",
    modifiers: {},
  },
  {
    id: "gym_rat",
    name: "The Gym Rat",
    description: "Strong but heavy. Great anchor, bad at jumping high.",
    modifiers: {
      massMultiplier: 2.5, // Very heavy, good for anchoring the bungee
      jumpForce: 0.8, // Can't jump as high (80% power)
      scale: 1.2, // Look bigger
    },
  },
  {
    id: "anxious",
    name: "The Overthinker",
    description: "Moves erratically. High friction (stops instantly).",
    modifiers: {
      frictionAir: 0.2, // Stops instantly when key released
      massMultiplier: 0.8, // Light, gets flung easily
    },
  },
  {
    id: "slippery",
    name: "The Smooth Talker",
    description: "Hard to pin down. Low friction.",
    modifiers: {
      frictionAir: 0.001, // Slides like on ice
    },
  },
];

// 4. Helper to apply traits to a Matter Body
// Note: We use 'any' for the body for now to avoid tight coupling with Phaser types in config,
// but in usage it will be Phaser.Physics.Matter.MatterBody
export function applyTraits(body: any, traitId: string | null) {
  const baseStats = { mass: 5, frictionAir: 0.05 };

  if (!traitId) return;

  const trait = TRAIT_DATABASE.find((t) => t.id === traitId);
  if (!trait) return;

  let mass = baseStats.mass;
  let frictionAir = baseStats.frictionAir;

  if (trait.modifiers.massMultiplier) mass *= trait.modifiers.massMultiplier;
  if (trait.modifiers.frictionAir) frictionAir = trait.modifiers.frictionAir;

  // Apply to Physics Body
  // MatterJS body methods
  if (body.setMass) body.setMass(mass);
  if (body.setFrictionAir) body.setFrictionAir(frictionAir);
}
