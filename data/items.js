// Catalog of resources for sale. pricePer is the price in USD for one "batch" of `batch` units.
// Displayed quantities always move in steps of `batch`.
module.exports = [
  {
    id: "wood",
    name: "Wood",
    icon: "🪵",
    batch: 1000,
    pricePer: 0.45,
    min: 1000,
    max: 200000,
    blurb: "Basic building and crafting material."
  },
  {
    id: "stone",
    name: "Stone",
    icon: "🪨",
    batch: 1000,
    pricePer: 0.55,
    min: 1000,
    max: 200000,
    blurb: "For stone tier walls and foundations."
  },
  {
    id: "metal-ore",
    name: "Metal Ore",
    icon: "⛏️",
    batch: 1000,
    pricePer: 0.70,
    min: 1000,
    max: 100000,
    blurb: "Smelt it yourself or skip the furnace queue."
  },
  {
    id: "metal-fragments",
    name: "Metal Fragments",
    icon: "🔩",
    batch: 1000,
    pricePer: 1.30,
    min: 1000,
    max: 100000,
    blurb: "Sheet metal doors, workbenches, weapons."
  },
  {
    id: "high-quality-metal",
    name: "High Quality Metal",
    icon: "🔧",
    batch: 10,
    pricePer: 3.20,
    min: 10,
    max: 2000,
    blurb: "Locks, tool cupboards, endgame gear."
  },
  {
    id: "sulfur-ore",
    name: "Sulfur Ore",
    icon: "🟡",
    batch: 1000,
    pricePer: 0.60,
    min: 1000,
    max: 100000,
    blurb: "Raw sulfur, straight off the node."
  },
  {
    id: "sulfur",
    name: "Sulfur",
    icon: "💥",
    batch: 1000,
    pricePer: 1.10,
    min: 1000,
    max: 100000,
    blurb: "Gunpowder and explosives feedstock."
  },
  {
    id: "gunpowder",
    name: "Gunpowder",
    icon: "🧨",
    batch: 1000,
    pricePer: 1.60,
    min: 1000,
    max: 50000,
    blurb: "Ammo and explosives, ready mixed."
  },
  {
    id: "scrap",
    name: "Scrap",
    icon: "⚙️",
    batch: 100,
    pricePer: 1.80,
    min: 100,
    max: 20000,
    blurb: "Workbench unlocks, blueprints, the works."
  },
  {
    id: "cloth",
    name: "Cloth",
    icon: "🧵",
    batch: 1000,
    pricePer: 0.50,
    min: 1000,
    max: 50000,
    blurb: "Bandages, hazmat, early armor."
  },
  {
    id: "leather",
    name: "Leather",
    icon: "🦬",
    batch: 1000,
    pricePer: 0.55,
    min: 1000,
    max: 50000,
    blurb: "Roadsign and leather armor sets."
  },
  {
    id: "low-grade-fuel",
    name: "Low Grade Fuel",
    icon: "🛢️",
    batch: 1000,
    pricePer: 0.90,
    min: 1000,
    max: 50000,
    blurb: "Furnaces, torches, vehicles."
  },
  {
    id: "charcoal",
    name: "Charcoal",
    icon: "🔥",
    batch: 1000,
    pricePer: 0.40,
    min: 1000,
    max: 50000,
    blurb: "Smelting byproduct, sold direct."
  }
];
