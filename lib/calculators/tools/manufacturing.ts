import type { ToolDef, CalcResult } from "../calculator";
import { formatNumber } from "../calculator";

function results(...items: CalcResult[]): CalcResult[] {
  return items;
}

export const MANUFACTURING_TOOLS: ToolDef[] = [
  {
    slug: "fabric-wastage-calculator",
    category: "manufacturing",
    title: "Fabric Wastage Calculator",
    tagline: "Calculate fabric yield and wastage for garment cutting.",
    description:
      "Estimate usable fabric, waste percentage, and cost impact from roll length, marker efficiency, and garment consumption.",
    inputs: [
      { key: "rollLength", label: "Roll length", type: "number", unitLabel: "m", defaultValue: 100, min: 0.1, step: 0.1 },
      { key: "rollWidth", label: "Roll width", type: "number", unitLabel: "m", defaultValue: 1.5, min: 0.1, step: 0.01 },
      { key: "consumption", label: "Consumption per garment", type: "number", unitLabel: "m", defaultValue: 1.2, min: 0.01, step: 0.01 },
      { key: "garments", label: "Number of garments", type: "number", defaultValue: 50, min: 1, step: 1 },
      { key: "markerEff", label: "Marker efficiency", type: "number", unitLabel: "%", defaultValue: 85, min: 1, max: 100, step: 1 },
      { key: "price", label: "Fabric price", type: "number", unitLabel: "$/m", defaultValue: 8, min: 0, step: 0.1 },
    ],
    calculate: (inputs) => {
      const rollL = Number(inputs.rollLength) || 0;
      const rollW = Number(inputs.rollWidth) || 0;
      const cons = Number(inputs.consumption) || 0;
      const garments = Number(inputs.garments) || 0;
      const eff = Number(inputs.markerEff) || 100;
      const price = Number(inputs.price) || 0;
      const fabricNeeded = garments * cons / (eff / 100);
      const rollsNeeded = fabricNeeded / rollL;
      const usedArea = garments * cons;
      const totalArea = rollL * rollW;
      const wastePct = totalArea > 0 ? ((totalArea - usedArea) / totalArea) * 100 : 0;
      const wasteCost = Math.max(0, fabricNeeded - garments * cons) * price;
      return results(
        { id: "fabricNeeded", label: "Fabric needed", value: formatNumber(fabricNeeded, 1), unit: "m", badge: "success" },
        { id: "rollsNeeded", label: "Rolls needed", value: formatNumber(rollsNeeded, 1), unit: "rolls" },
        { id: "wastePct", label: "Material wastage", value: formatNumber(wastePct, 1), unit: "%", badge: "warning" },
        { id: "wasteCost", label: "Wastage cost", value: `$${formatNumber(wasteCost, 0)}`, badge: "info" },
      );
    },
    formula: "Fabric needed = garments × consumption ÷ marker efficiency. Rolls = fabric needed ÷ roll length. Wastage = unused area ÷ total roll area.",
    examples: [
      { title: "50 garments, 1.2 m each, 85% marker efficiency", inputs: { rollLength: 100, rollWidth: 1.5, consumption: 1.2, garments: 50, markerEff: 85, price: 8 }, note: "≈ 70.6 m fabric needed → 0.71 rolls." },
    ],
    faqs: [
      { q: "What is marker efficiency?", a: "How well pattern pieces nest on the fabric. 80–85% is typical for apparel; higher means less waste." },
      { q: "Does roll width matter?", a: "Only for area-based wastage; length-based need depends on consumption per garment." },
    ],
    related: ["flooring-material-waste-calculator", "recipe-scaling-calculator"],
    seo: {
      h1: "Fabric Wastage Calculator - Garment Cutting Yield",
      metaDescription: "Free fabric wastage calculator. Estimate fabric yield, waste percentage, and cost for garment cutting.",
      keywords: ["fabric wastage calculator", "garment cutting calculator", "fabric yield calculator", "marker efficiency calculator"],
    },
  },
  {
    slug: "flooring-material-waste-calculator",
    category: "manufacturing",
    title: "Flooring Material Waste Calculator",
    tagline: "Order the right amount of flooring with waste included.",
    description:
      "Calculate total flooring to order from room area, tile/board size, and a waste factor for cuts and breakage.",
    inputs: [
      { key: "roomArea", label: "Room area", type: "number", unitLabel: "m²", defaultValue: 40, min: 0.1, step: 0.1 },
      { key: "tileArea", label: "Single tile area", type: "number", unitLabel: "m²", defaultValue: 0.09, min: 0.001, step: 0.001 },
      { key: "wasteFactor", label: "Waste factor", type: "number", unitLabel: "%", defaultValue: 10, min: 0, max: 30, step: 1, hint: "10% straight lay, 15% diagonal" },
      { key: "price", label: "Price per m²", type: "number", unitLabel: "$/m²", defaultValue: 35, min: 0, step: 0.1 },
    ],
    calculate: (inputs) => {
      const area = Number(inputs.roomArea) || 0;
      const tile = Number(inputs.tileArea) || 0;
      const waste = Number(inputs.wasteFactor) || 0;
      const price = Number(inputs.price) || 0;
      const netTiles = area / tile;
      const totalTiles = netTiles * (1 + waste / 100);
      const tilesCeil = Math.ceil(totalTiles);
      const orderArea = tilesCeil * tile;
      const cost = orderArea * price;
      return results(
        { id: "tilesCeil", label: "Tiles to order", value: formatNumber(tilesCeil, 0), unit: "tiles", badge: "success" },
        { id: "orderArea", label: "Area to order", value: formatNumber(orderArea, 1), unit: "m²" },
        { id: "netTiles", label: "Tiles needed (net)", value: formatNumber(netTiles, 0), unit: "tiles" },
        { id: "cost", label: "Estimated material cost", value: `$${formatNumber(cost, 0)}` },
      );
    },
    formula: "Tiles needed = room area ÷ tile area. Order = tiles × (1 + waste%). Round up to whole tiles.",
    examples: [
      { title: "40 m², 0.09 m² tiles, 10% waste", inputs: { roomArea: 40, tileArea: 0.09, wasteFactor: 10, price: 35 }, note: "≈ 444 net tiles → order 490 tiles ≈ 44.1 m²." },
    ],
    faqs: [
      { q: "What waste factor should I use?", a: "10% for straight-lay, 15% for diagonal/herringbone, more for irregular rooms or expensive tile where you want spare pieces." },
      { q: "Why round up?", a: "You can't buy partial tiles; round up so you have enough plus spare for future repairs." },
    ],
    related: ["fabric-wastage-calculator", "recipe-scaling-calculator"],
    seo: {
      h1: "Flooring Material Waste Calculator - Tiles to Order",
      metaDescription: "Free flooring waste calculator. Calculate tiles to order from room area, tile size, and waste factor.",
      keywords: ["flooring waste calculator", "tiles to order calculator", "flooring material calculator", "tile waste factor"],
    },
  },
  {
    slug: "greenhouse-heating-cost-calculator",
    category: "manufacturing",
    title: "Greenhouse Heating Cost Calculator",
    tagline: "Estimate winter heating cost for a greenhouse.",
    description:
      "Estimate monthly heating energy and cost from greenhouse area, temperature difference, insulation (U-value), and fuel price.",
    inputs: [
      { key: "area", label: "Greenhouse area", type: "number", unitLabel: "m²", defaultValue: 100, min: 0.1, step: 0.1 },
      { key: "tempDiff", label: "Temperature difference", type: "number", unitLabel: "°C", defaultValue: 15, min: 1, step: 1, hint: "Inside target minus outside cold" },
      { key: "uValue", label: "Heat transfer coefficient (U)", type: "number", unitLabel: "W/m²K", defaultValue: 5.5, min: 0.1, step: 0.1, hint: "Single glass ~5.5, double poly ~3.5" },
      { key: "hours", label: "Heating hours per day", type: "number", unitLabel: "h", defaultValue: 12, min: 1, max: 24, step: 1 },
      { key: "days", label: "Heating days per month", type: "number", unitLabel: "days", defaultValue: 30, min: 1, max: 31, step: 1 },
      { key: "fuelPrice", label: "Energy price", type: "number", unitLabel: "$/kWh", defaultValue: 0.18, min: 0, step: 0.01 },
      { key: "efficiency", label: "Heater efficiency", type: "number", unitLabel: "%", defaultValue: 85, min: 1, max: 100, step: 1 },
    ],
    calculate: (inputs) => {
      const area = Number(inputs.area) || 0;
      const dT = Number(inputs.tempDiff) || 0;
      const u = Number(inputs.uValue) || 0;
      const h = Number(inputs.hours) || 0;
      const days = Number(inputs.days) || 0;
      const price = Number(inputs.fuelPrice) || 0;
      const eff = Number(inputs.efficiency) || 100;
      const loadW = area * dT * u;
      const kWhPerMonth = (loadW / 1000) * h * days / (eff / 100);
      const cost = kWhPerMonth * price;
      return results(
        { id: "loadW", label: "Heat loss", value: formatNumber(loadW, 0), unit: "W", badge: "success" },
        { id: "kWh", label: "Energy per month", value: formatNumber(kWhPerMonth, 0), unit: "kWh" },
        { id: "cost", label: "Heating cost per month", value: `$${formatNumber(cost, 0)}`, badge: "warning" },
        { id: "costPerSqm", label: "Cost per m²", value: `$${formatNumber(cost / area, 2)}` },
      );
    },
    formula: "Heat loss = area × ΔT × U. Energy = heat loss × hours × days ÷ efficiency. Cost = energy × price.",
    examples: [
      { title: "100 m², ΔT 15°C, U 5.5, 12 h/day, $0.18/kWh", inputs: { area: 100, tempDiff: 15, uValue: 5.5, hours: 12, days: 30, fuelPrice: 0.18, efficiency: 85 }, note: "≈ 3,490 kWh/month ≈ $628." },
    ],
    faqs: [
      { q: "What is a U-value?", a: "How easily heat passes through the greenhouse covering. Lower = better insulation." },
      { q: "Is this per month?", a: "Yes — assumes constant ΔT and hours for the whole month. Real use varies with weather." },
    ],
    related: ["irrigation-water-calculator", "solar-battery-sizing-calculator"],
    seo: {
      h1: "Greenhouse Heating Cost Calculator - Winter Energy",
      metaDescription: "Free greenhouse heating cost calculator. Estimate monthly heating energy and cost from area, temperature difference, and U-value.",
      keywords: ["greenhouse heating cost calculator", "greenhouse heater size calculator", "greenhouse heat loss", "greenhouse heating calculator"],
    },
  },
  {
    slug: "recipe-scaling-calculator",
    category: "manufacturing",
    title: "Recipe Scaling Calculator",
    tagline: "Scale ingredient quantities up or down.",
    description:
      "Scale a recipe from one batch size to another while keeping ingredient ratios exact — for baking, production, or catering.",
    inputs: [
      { key: "origYield", label: "Original yield", type: "number", defaultValue: 10, min: 0.01, step: 0.01, hint: "e.g., 10 loaves or 5 kg" },
      { key: "targetYield", label: "Target yield", type: "number", defaultValue: 25, min: 0.01, step: 0.01 },
      { key: "ingredient", label: "Ingredient amount (original)", type: "number", defaultValue: 500, min: 0, step: 0.1, hint: "e.g., grams of flour" },
    ],
    calculate: (inputs) => {
      const orig = Number(inputs.origYield) || 0;
      const target = Number(inputs.targetYield) || 0;
      const amt = Number(inputs.ingredient) || 0;
      const factor = orig > 0 ? target / orig : 0;
      const scaled = amt * factor;
      return results(
        { id: "factor", label: "Scaling factor", value: formatNumber(factor, 3), badge: "success" },
        { id: "scaled", label: "Scaled ingredient amount", value: formatNumber(scaled, 2), unit: "same unit" },
        { id: "ratio", label: "Target ÷ original", value: formatNumber(target / orig, 2), unit: "×" },
      );
    },
    formula: "Scaling factor = target yield ÷ original yield. Scaled amount = original amount × scaling factor.",
    examples: [
      { title: "10 → 25 loaves, 500 g flour", inputs: { origYield: 10, targetYield: 25, ingredient: 500 }, note: "Scaling factor 2.5× → 1,250 g flour." },
    ],
    faqs: [
      { q: "Does this work for any unit?", a: "Yes — grams, kilograms, cups, or pieces, as long as the original and scaled amounts use the same unit." },
      { q: "What about baking powder or salt?", a: "Scale them by the same factor, though very large batches sometimes need slight seasoning adjustments." },
    ],
    related: ["fabric-wastage-calculator", "flooring-material-waste-calculator"],
    seo: {
      h1: "Recipe Scaling Calculator - Scale Ingredients",
      metaDescription: "Free recipe scaling calculator. Scale ingredient quantities from one batch size to another with exact ratios.",
      keywords: ["recipe scaling calculator", "scale recipe ingredients", "baking conversion calculator", "recipe multiplier"],
    },
  },
];
