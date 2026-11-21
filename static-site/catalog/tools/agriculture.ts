import type { ToolDef, CalcResult } from "../calculator";
import { formatNumber } from "../calculator";

function results(...items: CalcResult[]): CalcResult[] {
  return items;
}

export const AGRICULTURE_TOOLS: ToolDef[] = [
  {
    slug: "grain-moisture-shrink-calculator",
    category: "agriculture",
    title: "Grain Moisture Shrink Calculator",
    tagline: "Calculate weight loss when drying grain to a target moisture level.",
    description:
      "Estimate how much grain weight is lost (shrink) when drying from harvest moisture to safe storage moisture, plus the final sellable weight.",
    inputs: [
      { key: "weight", label: "Initial grain weight", type: "number", unitLabel: "kg", defaultValue: 1000, min: 0, step: 1, hint: "Wet grain weight at harvest" },
      { key: "moisture", label: "Initial moisture content", type: "number", unitLabel: "%", defaultValue: 24, min: 0, max: 50, step: 0.5, hint: "Percent wet basis" },
      { key: "target", label: "Target moisture content", type: "number", unitLabel: "%", defaultValue: 14, min: 0, max: 30, step: 0.5, hint: "Safe storage moisture (e.g., 13-15% for corn)" },
    ],
    calculate: (inputs) => {
      const w = Number(inputs.weight) || 0;
      const mc = Number(inputs.moisture) || 0;
      const tm = Number(inputs.target) || 0;
      const dryMatter = w * (1 - mc / 100);
      const finalWeight = dryMatter / (1 - tm / 100);
      const loss = w - finalWeight;
      const shrinkPct = w > 0 ? (loss / w) * 100 : 0;
      return results(
        { id: "finalWeight", label: "Final dried weight", value: formatNumber(finalWeight), unit: "kg", badge: "success" },
        { id: "weightLoss", label: "Weight lost (shrink)", value: formatNumber(loss), unit: "kg" },
        { id: "shrinkPct", label: "Shrink percentage", value: formatNumber(shrinkPct, 1), unit: "%", note: "Moisture + handling loss" },
        { id: "dryMatter", label: "Dry matter retained", value: formatNumber(dryMatter), unit: "kg" },
      );
    },
    formula: "Dry matter = weight × (1 − moisture%). Final weight = dry matter ÷ (1 − target moisture%). Shrink = initial − final.",
    examples: [
      { title: "1,000 kg corn at 24% → 14%", inputs: { weight: 1000, moisture: 24, target: 14 }, note: "Loses ~117 kg; you keep ~883 kg of sellable grain." },
      { title: "5,000 kg wheat at 18% → 13.5%", inputs: { weight: 5000, moisture: 18, target: 13.5 }, note: "Final weight ≈ 4,786 kg; shrink ≈ 4.3%." },
    ],
    faqs: [
      { q: "What is grain shrink?", a: "Shrink is the weight lost when grain is dried — mostly water removed, plus a small handling allowance." },
      { q: "What is safe storage moisture?", a: "Corn: 13–15%; wheat: 12–14%; soybeans: 11–13%. Higher moisture risks mold and spoilage." },
    ],
    related: ["grain-bin-capacity-calculator", "fertilizer-blend-calculator"],
    seo: {
      h1: "Grain Moisture Shrink Calculator - Free Online Tool",
      metaDescription: "Calculate grain weight loss when drying to target moisture. Free online shrink calculator for corn, wheat, and other grains.",
      keywords: ["grain moisture shrink calculator", "grain drying shrink", "corn shrink calculator", "grain moisture calculator"],
    },
  },
  {
    slug: "grain-bin-capacity-calculator",
    category: "agriculture",
    title: "Grain Bin Capacity Calculator",
    tagline: "Find bushels and tonnage your grain bin can hold.",
    description:
      "Estimate grain bin storage capacity in bushels, cubic meters, and weight from bin diameter and height.",
    inputs: [
      { key: "diameter", label: "Bin diameter", type: "number", unitLabel: "ft", defaultValue: 30, min: 1, step: 1 },
      { key: "eaveHeight", label: "Eave height (wall height)", type: "number", unitLabel: "ft", defaultValue: 20, min: 1, step: 1 },
      { key: "peakHeight", label: "Peak height above eave", type: "number", unitLabel: "ft", defaultValue: 5, min: 0, step: 1 },
      { key: "unitWeight", label: "Grain test weight", type: "number", unitLabel: "lb/bu", defaultValue: 56, min: 1, step: 1, hint: "Corn ~56 lb/bu, wheat ~60 lb/bu" },
    ],
    calculate: (inputs) => {
      const d = Number(inputs.diameter) || 0;
      const h = Number(inputs.eaveHeight) || 0;
      const p = Number(inputs.peakHeight) || 0;
      const uw = Number(inputs.unitWeight) || 0;
      const radiusM = (d * 0.3048) / 2;
      const heightM = (h + p) * 0.3048;
      const volumeM3 = Math.PI * radiusM ** 2 * heightM;
      const bushels = volumeM3 * 28.3776;
      const weightLb = bushels * uw;
      return results(
        { id: "bushels", label: "Capacity (bushels)", value: formatNumber(bushels, 0), unit: "bu", badge: "success" },
        { id: "volume", label: "Volume", value: formatNumber(volumeM3), unit: "m³" },
        { id: "weight", label: "Approx. grain weight", value: formatNumber(weightLb / 2000, 0), unit: "tons (US)" },
        { id: "weightKg", label: "Approx. grain weight", value: formatNumber(weightLb * 0.453592 / 1000, 0), unit: "tonnes" },
      );
    },
    formula: "Volume = π × radius² × height. Bushels = volume × 28.38. Weight = bushels × test weight.",
    examples: [
      { title: "30 ft diameter × 25 ft tall bin, corn", inputs: { diameter: 30, eaveHeight: 20, peakHeight: 5, unitWeight: 56 }, note: "≈ 5,300 bushels ≈ 148 tons of corn." },
      { title: "48 ft diameter × 30 ft tall bin, wheat", inputs: { diameter: 48, eaveHeight: 25, peakHeight: 5, unitWeight: 60 }, note: "≈ 16,200 bushels ≈ 486 tons of wheat." },
    ],
    faqs: [
      { q: "Does this include the peaked roof?", a: "Yes — enter peak height above the eave; it is added to the wall height." },
      { q: "Is this exact capacity?", a: "It is a geometric estimate. Actual usable capacity varies with grain compaction, unloading sump, and bin style." },
    ],
    related: ["grain-moisture-shrink-calculator", "fertilizer-blend-calculator"],
    seo: {
      h1: "Grain Bin Capacity Calculator - Bushels & Tonnage",
      metaDescription: "Free grain bin capacity calculator. Estimate bushels, volume, and tonnage from bin diameter and height.",
      keywords: ["grain bin capacity calculator", "grain bin bushel calculator", "grain storage capacity", "bushels per bin"],
    },
  },
  {
    slug: "seed-plant-population-calculator",
    category: "agriculture",
    title: "Seed & Plant Population Calculator",
    tagline: "Calculate seeds needed and final plant population per acre.",
    description:
      "Plan seed purchases and expected plant population from field size, row spacing, seed spacing, and germination rate.",
    inputs: [
      { key: "area", label: "Field area", type: "number", unitLabel: "acre", defaultValue: 100, min: 0.1, step: 0.1 },
      { key: "rowSpacing", label: "Row spacing", type: "number", unitLabel: "ft", defaultValue: 30, min: 1, step: 1 },
      { key: "seedSpacing", label: "In-row seed spacing", type: "number", unitLabel: "ft", defaultValue: 0.25, min: 0.05, step: 0.01 },
      { key: "germination", label: "Expected germination", type: "number", unitLabel: "%", defaultValue: 85, min: 1, max: 100, step: 1 },
      { key: "seedsPerLb", label: "Seeds per pound (optional)", type: "number", defaultValue: 0, min: 0, step: 100, hint: "Leave 0 to skip seed weight estimate" },
      { key: "seedPricePerLb", label: "Seed price per pound ($)", type: "number", defaultValue: 3, min: 0, step: 0.1 },
    ],
    calculate: (inputs) => {
      const areaAcres = Number(inputs.area) || 0;
      const rowFt = Number(inputs.rowSpacing) || 0;
      const seedFt = Number(inputs.seedSpacing) || 0;
      const germ = Number(inputs.germination) || 100;
      const spLb = Number(inputs.seedsPerLb) || 0;
      const price = Number(inputs.seedPricePerLb) || 0;
      const sqFtPerAcre = 43560;
      const totalSqFt = areaAcres * sqFtPerAcre;
      const linearRowFt = totalSqFt / rowFt;
      const seedsPlanted = linearRowFt / seedFt;
      const plants = seedsPlanted * (germ / 100);
      const plantsPerAcre = plants / areaAcres;
      let seedLb = 0, seedCost = 0;
      if (spLb > 0) { seedLb = seedsPlanted / spLb; seedCost = seedLb * price; }
      return results(
        { id: "plantsPerAcre", label: "Expected plants per acre", value: formatNumber(plantsPerAcre, 0), unit: "plants/acre", badge: "success" },
        { id: "totalPlants", label: "Total expected plants", value: formatNumber(plants, 0), unit: "plants" },
        { id: "seedsPlanted", label: "Seeds to plant", value: formatNumber(seedsPlanted, 0), unit: "seeds" },
        { id: "seedLb", label: "Seed required", value: seedLb > 0 ? formatNumber(seedLb) : "n/a", unit: seedLb > 0 ? "lb" : "—" },
        { id: "seedCost", label: "Estimated seed cost", value: seedCost > 0 ? `$${formatNumber(seedCost)}` : "n/a" },
      );
    },
    formula: "Linear row feet = field area ÷ row spacing. Seeds planted = row feet ÷ in-row spacing. Plants = seeds × germination%.",
    examples: [
      { title: "100 acres corn, 30\" rows, 6\" spacing", inputs: { area: 100, rowSpacing: 2.5, seedSpacing: 0.5, germination: 85, seedsPerLb: 0 }, note: "≈ 32,800 plants/acre." },
      { title: "50 acres soybeans, 15\" rows, 3\" spacing", inputs: { area: 50, rowSpacing: 1.25, seedSpacing: 0.25, germination: 88, seedsPerLb: 2800, seedPricePerLb: 18 }, note: "≈ 739,200 plants/acre; ≈ 242 lb seed." },
    ],
    faqs: [
      { q: "Why is germination included?", a: "Not every seed emerges. Multiplying by germination% gives a realistic stand count rather than a theoretical maximum." },
      { q: "What units should I use?", a: "Enter row and seed spacing in feet (or convert inches: 30\" = 2.5 ft, 6\" = 0.5 ft)." },
    ],
    related: ["fertilizer-blend-calculator", "irrigation-water-calculator"],
    seo: {
      h1: "Seed & Plant Population Calculator - Seeds Per Acre",
      metaDescription: "Calculate seeds needed and expected plant population per acre from field size, row spacing, and germination rate.",
      keywords: ["seed population calculator", "seeds per acre calculator", "plant population calculator", "seeding rate calculator"],
    },
  },
  {
    slug: "fertilizer-blend-calculator",
    category: "agriculture",
    title: "Fertilizer Blend Calculator",
    tagline: "Plan N-P-K fertilizer bags and cost per acre.",
    description:
      "Estimate bags of common fertilizers (urea, DAP, MOP) needed to hit target N-P-K rates across your acres, plus total cost.",
    inputs: [
      { key: "acres", label: "Field area", type: "number", unitLabel: "acre", defaultValue: 50, min: 0.1, step: 0.1 },
      { key: "targetN", label: "Target nitrogen (N)", type: "number", unitLabel: "lb N/acre", defaultValue: 150, min: 0, step: 5 },
      { key: "targetP", label: "Target phosphorus (P₂O₅)", type: "number", unitLabel: "lb P₂O₅/acre", defaultValue: 60, min: 0, step: 5 },
      { key: "targetK", label: "Target potassium (K₂O)", type: "number", unitLabel: "lb K₂O/acre", defaultValue: 60, min: 0, step: 5 },
      { key: "ureaPrice", label: "Urea price ($/ton)", type: "number", defaultValue: 450, min: 0, step: 10 },
      { key: "dapPrice", label: "DAP price ($/ton)", type: "number", defaultValue: 600, min: 0, step: 10 },
      { key: "mopPrice", label: "MOP price ($/ton)", type: "number", defaultValue: 400, min: 0, step: 10 },
    ],
    calculate: (inputs) => {
      const acres = Number(inputs.acres) || 0;
      const n = Number(inputs.targetN) || 0;
      const p = Number(inputs.targetP) || 0;
      const k = Number(inputs.targetK) || 0;
      const urea = n / 0.46;
      const dap = p / 0.46;
      const mop = k / 0.60;
      const ureaN = urea * 0.46;
      const dapN = dap * 0.18;
      const totalN = ureaN + dapN;
      const totalP = dap * 0.46;
      const totalK = mop * 0.60;
      const ureaTons = (urea * acres) / 2000;
      const dapTons = (dap * acres) / 2000;
      const mopTons = (mop * acres) / 2000;
      const cost = ureaTons * Number(inputs.ureaPrice) + dapTons * Number(inputs.dapPrice) + mopTons * Number(inputs.mopPrice);
      return results(
        { id: "ureaBags", label: "Urea (46-0-0)", value: formatNumber(urea / 50, 0), unit: "50-lb bags/acre", badge: "success" },
        { id: "dapBags", label: "DAP (18-46-0)", value: formatNumber(dap / 50, 0), unit: "50-lb bags/acre" },
        { id: "mopBags", label: "MOP (0-0-60)", value: formatNumber(mop / 50, 0), unit: "50-lb bags/acre" },
        { id: "deliveredNPK", label: "Delivered N-P-K", value: `${formatNumber(totalN)} - ${formatNumber(totalP)} - ${formatNumber(totalK)} lb/acre` },
        { id: "totalCost", label: "Estimated total cost", value: `$${formatNumber(cost, 0)}`, unit: "for all acres" },
        { id: "costPerAcre", label: "Cost per acre", value: `$${formatNumber(cost / acres, 0)}` },
      );
    },
    formula: "Bags per acre = (target lb nutrient ÷ fertilizer analysis) ÷ 50 lb. Cost = tons × price per ton.",
    examples: [
      { title: "50 acres, target 150-60-60", inputs: { acres: 50, targetN: 150, targetP: 60, targetK: 60, ureaPrice: 450, dapPrice: 600, mopPrice: 400 }, note: "≈ 163 bags urea, 13 bags DAP, 10 bags MOP." },
    ],
    faqs: [
      { q: "Why urea/DAP/MOP?", a: "Common straight fertilizers. DAP also supplies nitrogen, which is included in the delivered N total." },
      { q: "Is this a replacement for a soil test?", a: "No. Target rates should come from a soil test and local extension recommendations." },
    ],
    related: ["seed-plant-population-calculator", "grain-moisture-shrink-calculator"],
    seo: {
      h1: "Fertilizer Blend Calculator - N-P-K Bags Per Acre",
      metaDescription: "Free fertilizer calculator. Plan urea, DAP, and MOP bags and cost per acre for target N-P-K rates.",
      keywords: ["fertilizer calculator", "NPK calculator", "fertilizer bags per acre", "urea DAP MOP calculator"],
    },
  },
  {
    slug: "poultry-feed-calculator",
    category: "agriculture",
    title: "Poultry Feed Calculator",
    tagline: "Estimate total feed, cost, and feed conversion for a flock.",
    description:
      "Plan broiler or layer feed requirements from bird count, age range, target weight, and feed price.",
    inputs: [
      { key: "birds", label: "Number of birds", type: "number", defaultValue: 1000, min: 1, step: 1 },
      { key: "startAge", label: "Current age", type: "number", unitLabel: "weeks", defaultValue: 0, min: 0, step: 1 },
      { key: "endAge", label: "Target age", type: "number", unitLabel: "weeks", defaultValue: 6, min: 1, step: 1 },
      { key: "targetWeight", label: "Target weight per bird", type: "number", unitLabel: "lb", defaultValue: 6, min: 0.5, step: 0.1 },
      { key: "feedPrice", label: "Feed price ($/ton)", type: "number", defaultValue: 400, min: 0, step: 10 },
    ],
    calculate: (inputs) => {
      const birds = Number(inputs.birds) || 0;
      const weeks = Math.max(1, Number(inputs.endAge) || 0 - Number(inputs.startAge) || 1);
      const tw = Number(inputs.targetWeight) || 0;
      const price = Number(inputs.feedPrice) || 0;
      const dailyLbPerBird = tw * 0.04;
      const totalDays = weeks * 7;
      const feedLb = birds * dailyLbPerBird * totalDays;
      const gainLb = birds * tw;
      const fcr = feedLb / gainLb;
      const cost = (feedLb / 2000) * price;
      return results(
        { id: "totalFeed", label: "Total feed required", value: formatNumber(feedLb / 2000, 1), unit: "tons", badge: "success" },
        { id: "feedLb", label: "Total feed required", value: formatNumber(feedLb, 0), unit: "lb" },
        { id: "fcr", label: "Feed conversion ratio (FCR)", value: formatNumber(fcr, 2), unit: "lb feed / lb gain", note: "Lower is better" },
        { id: "totalCost", label: "Estimated feed cost", value: `$${formatNumber(cost, 0)}` },
        { id: "costPerBird", label: "Feed cost per bird", value: `$${formatNumber(cost / birds, 2)}` },
      );
    },
    formula: "Daily feed ≈ 4% of target body weight per bird. Total feed = birds × daily feed × days. FCR = feed ÷ weight gain.",
    examples: [
      { title: "1,000 broilers to 6 lb at 6 weeks", inputs: { birds: 1000, startAge: 0, endAge: 6, targetWeight: 6, feedPrice: 400 }, note: "≈ 10 tons of feed; FCR ≈ 1.8." },
    ],
    faqs: [
      { q: "What is FCR?", a: "Feed Conversion Ratio — pounds of feed needed to produce one pound of live weight. Lower is more efficient." },
      { q: "Does this work for layers?", a: "Roughly, but layers eat less and over longer periods. Treat the output as a planning estimate." },
    ],
    related: ["poultry-fcr-calculator", "livestock-water-requirement-calculator"],
    seo: {
      h1: "Poultry Feed Calculator - Flock Feed Requirements",
      metaDescription: "Free poultry feed calculator. Estimate total feed tons, FCR, and cost for broiler or layer flocks.",
      keywords: ["poultry feed calculator", "broiler feed calculator", "chicken feed requirement calculator", "feed conversion ratio calculator"],
    },
  },
  {
    slug: "poultry-fcr-calculator",
    category: "agriculture",
    title: "Poultry FCR Calculator",
    tagline: "Calculate feed conversion ratio and cost per pound of gain.",
    description:
      "Measure flock efficiency: feed conversion ratio, cost per pound of gain, and adjusted for mortality.",
    inputs: [
      { key: "feedGiven", label: "Total feed given", type: "number", unitLabel: "lb", defaultValue: 5000, min: 0, step: 10 },
      { key: "birdsStart", label: "Birds placed", type: "number", defaultValue: 1000, min: 1, step: 1 },
      { key: "mortality", label: "Mortality", type: "number", unitLabel: "%", defaultValue: 4, min: 0, max: 50, step: 0.5 },
      { key: "avgWeightGain", label: "Average weight gain per bird", type: "number", unitLabel: "lb", defaultValue: 5.5, min: 0, step: 0.1 },
      { key: "feedPrice", label: "Feed price ($/ton)", type: "number", defaultValue: 400, min: 0, step: 10 },
    ],
    calculate: (inputs) => {
      const feed = Number(inputs.feedGiven) || 0;
      const birds = Number(inputs.birdsStart) || 0;
      const mort = Number(inputs.mortality) || 0;
      const gain = Number(inputs.avgWeightGain) || 0;
      const price = Number(inputs.feedPrice) || 0;
      const liveBirds = birds * (1 - mort / 100);
      const totalGain = liveBirds * gain;
      const fcr = totalGain > 0 ? feed / totalGain : 0;
      const cost = (feed / 2000) * price;
      const costPerLb = totalGain > 0 ? cost / totalGain : 0;
      return results(
        { id: "fcr", label: "Feed conversion ratio (FCR)", value: formatNumber(fcr, 2), unit: "lb feed / lb gain", badge: "success" },
        { id: "liveBirds", label: "Surviving birds", value: formatNumber(liveBirds, 0), unit: "birds" },
        { id: "totalGain", label: "Total live weight gain", value: formatNumber(totalGain, 0), unit: "lb" },
        { id: "costPerGain", label: "Cost per lb of gain", value: `$${formatNumber(costPerLb, 2)}`, badge: "warning" },
        { id: "totalCost", label: "Total feed cost", value: `$${formatNumber(cost, 0)}` },
      );
    },
    formula: "FCR = total feed ÷ total live weight gain. Gain = surviving birds × average weight gain per bird.",
    examples: [
      { title: "1,000 birds, 4% mortality, 5.5 lb gain", inputs: { feedGiven: 5000, birdsStart: 1000, mortality: 4, avgWeightGain: 5.5, feedPrice: 400 }, note: "FCR ≈ 1.89; ≈ $0.34/lb of gain." },
    ],
    faqs: [
      { q: "What is a good broiler FCR?", a: "Modern broilers often achieve 1.5–1.9. Higher values mean poorer efficiency or health issues." },
      { q: "Should I use live or dressed weight?", a: "Use live weight for consistency; note it in your records so comparisons are apples-to-apples." },
    ],
    related: ["poultry-feed-calculator", "poultry-coop-ventilation-calculator"],
    seo: {
      h1: "Poultry FCR Calculator - Feed Conversion Ratio",
      metaDescription: "Calculate poultry feed conversion ratio, cost per pound of gain, and mortality-adjusted flock performance.",
      keywords: ["poultry FCR calculator", "feed conversion ratio calculator", "broiler FCR calculator", "chicken feed efficiency"],
    },
  },
  {
    slug: "fish-pond-stocking-calculator",
    category: "agriculture",
    title: "Fish Pond Stocking Calculator",
    tagline: "Estimate pond volume and safe stocking density by species.",
    description:
      "Calculate pond volume and recommended stocking scenarios (extensive, standard, intensive) for tilapia, catfish, and trout.",
    inputs: [
      { key: "length", label: "Pond length", type: "number", unitLabel: "ft", defaultValue: 100, min: 1, step: 1 },
      { key: "width", label: "Pond width", type: "number", unitLabel: "ft", defaultValue: 50, min: 1, step: 1 },
      { key: "depth", label: "Average depth", type: "number", unitLabel: "ft", defaultValue: 6, min: 0.5, step: 0.5 },
      { key: "species", label: "Species", type: "select", options: [
        { label: "Tilapia", value: "tilapia" },
        { label: "Catfish", value: "catfish" },
        { label: "Trout", value: "trout" },
      ], defaultValue: "tilapia" },
      { key: "aeration", label: "Aeration", type: "select", options: [
        { label: "None", value: "none" },
        { label: "Partial", value: "partial" },
        { label: "Full", value: "full" },
      ], defaultValue: "partial" },
    ],
    calculate: (inputs) => {
      const len = Number(inputs.length) || 0;
      const wid = Number(inputs.width) || 0;
      const dep = Number(inputs.depth) || 0;
      const species = inputs.species as string || "tilapia";
      const aer = inputs.aeration as string || "partial";
      const volFt3 = len * wid * dep;
      const volM3 = volFt3 * 0.0283168;
      const volGal = volFt3 * 7.48052;
      const surfaceAcres = (len * wid) / 43560;
      const base = species === "tilapia" ? 1500 : species === "catfish" ? 1000 : 600;
      const mult = aer === "none" ? 0.5 : aer === "partial" ? 1 : 2.5;
      const extensive = Math.round(base * surfaceAcres * mult * 0.5);
      const standard = Math.round(base * surfaceAcres * mult);
      const intensive = Math.round(base * surfaceAcres * mult * 4);
      const biomassLb = standard * 0.5;
      return results(
        { id: "volume", label: "Pond volume", value: formatNumber(volM3, 1), unit: "m³", badge: "success" },
        { id: "volumeGal", label: "Pond volume", value: formatNumber(volGal, 0), unit: "gallons" },
        { id: "surface", label: "Surface area", value: formatNumber(surfaceAcres, 2), unit: "acres" },
        { id: "extensive", label: "Extensive stocking", value: formatNumber(extensive, 0), unit: "fingerlings" },
        { id: "standard", label: "Standard stocking", value: formatNumber(standard, 0), unit: "fingerlings" },
        { id: "intensive", label: "Intensive stocking (with aeration)", value: formatNumber(intensive, 0), unit: "fingerlings" },
        { id: "biomass", label: "Est. harvest biomass (standard)", value: formatNumber(biomassLb, 0), unit: "lb" },
      );
    },
    formula: "Volume = length × width × depth. Stocking rates are species- and aeration-dependent rules of thumb per surface acre.",
    examples: [
      { title: "100 × 50 × 6 ft pond, tilapia, partial aeration", inputs: { length: 100, width: 50, depth: 6, species: "tilapia", aeration: "partial" }, note: "≈ 850 m³; standard ≈ 4,300 fingerlings." },
    ],
    faqs: [
      { q: "Why three stocking levels?", a: "Extensive needs no inputs, standard fits most farm ponds, intensive requires aeration and water exchange." },
      { q: "Do I need to subtract volume for slope?", a: "Use average depth; for steep-sided ponds the estimate is slightly generous." },
    ],
    related: ["livestock-water-requirement-calculator", "poultry-feed-calculator"],
    seo: {
      h1: "Fish Pond Stocking Calculator - Density by Species",
      metaDescription: "Free fish pond stocking calculator. Volume and fingerling recommendations for tilapia, catfish, and trout ponds.",
      keywords: ["fish pond stocking calculator", "pond stocking density", "tilapia stocking calculator", "fish farm pond calculator"],
    },
  },
  {
    slug: "dairy-farm-profit-calculator",
    category: "agriculture",
    title: "Dairy Farm Profit Calculator",
    tagline: "Monthly milk income minus feed, vet, and operating costs.",
    description:
      "Estimate monthly dairy profitability from cow count, daily milk yield, milk price, and per-cow operating costs.",
    inputs: [
      { key: "cows", label: "Milking cows", type: "number", defaultValue: 50, min: 1, step: 1 },
      { key: "milkPerCow", label: "Milk per cow per day", type: "number", unitLabel: "L", defaultValue: 30, min: 0, step: 0.5 },
      { key: "milkPrice", label: "Milk price ($/L)", type: "number", defaultValue: 0.45, min: 0, step: 0.01 },
      { key: "feedCostPerCow", label: "Feed cost per cow per day ($)", type: "number", defaultValue: 6, min: 0, step: 0.1 },
      { key: "vetCostPerMonth", label: "Vet & breeding per cow per month ($)", type: "number", defaultValue: 12, min: 0, step: 0.5 },
      { key: "otherCostPerMonth", label: "Other fixed costs per month ($)", type: "number", defaultValue: 500, min: 0, step: 50 },
    ],
    calculate: (inputs) => {
      const cows = Number(inputs.cows) || 0;
      const milk = Number(inputs.milkPerCow) || 0;
      const price = Number(inputs.milkPrice) || 0;
      const feed = Number(inputs.feedCostPerCow) || 0;
      const vet = Number(inputs.vetCostPerMonth) || 0;
      const fixed = Number(inputs.otherCostPerMonth) || 0;
      const days = 30;
      const revenue = cows * milk * price * days;
      const feedCost = cows * feed * days;
      const vetCost = cows * vet;
      const totalCost = feedCost + vetCost + fixed;
      const profit = revenue - totalCost;
      return results(
        { id: "monthlyMilk", label: "Monthly milk production", value: formatNumber(cows * milk * days, 0), unit: "liters", badge: "success" },
        { id: "revenue", label: "Monthly milk revenue", value: `$${formatNumber(revenue, 0)}` },
        { id: "totalCost", label: "Monthly total cost", value: `$${formatNumber(totalCost, 0)}` },
        { id: "profit", label: "Estimated monthly profit", value: `$${formatNumber(profit, 0)}`, badge: profit >= 0 ? "success" : "warning" },
        { id: "profitPerCow", label: "Profit per cow per month", value: `$${formatNumber(profit / cows, 2)}` },
        { id: "costPerLiter", label: "Cost per liter of milk", value: `$${formatNumber(totalCost / (cows * milk * days), 3)}` },
      );
    },
    formula: "Revenue = cows × liters/day × price × 30. Cost = feed + vet + fixed. Profit = revenue − cost.",
    examples: [
      { title: "50 cows, 30 L/day, $0.45/L", inputs: { cows: 50, milkPerCow: 30, milkPrice: 0.45, feedCostPerCow: 6, vetCostPerMonth: 12, otherCostPerMonth: 500 }, note: "≈ $1,475 monthly profit." },
    ],
    faqs: [
      { q: "Does this include replacement heifers?", a: "No — it covers the milking herd only. Add heifer rearing costs separately for a full-farm view." },
      { q: "Is the milk price per liter?", a: "Yes. Convert from $/cwt if needed (1 cwt ≈ 44 lb ≈ 20 liters of milk)." },
    ],
    related: ["dairy-milk-cost-calculator", "livestock-water-requirement-calculator"],
    seo: {
      h1: "Dairy Farm Profit Calculator - Monthly Milk Income",
      metaDescription: "Free dairy farm profit calculator. Monthly milk revenue, costs, and profit per cow.",
      keywords: ["dairy farm profit calculator", "milk production cost calculator", "dairy cow profitability calculator", "cost per litre of milk calculator"],
    },
  },
  {
    slug: "dairy-milk-cost-calculator",
    category: "agriculture",
    title: "Dairy Milk Cost per Litre Calculator",
    tagline: "Find your true cost to produce one liter of milk.",
    description:
      "Divide total monthly dairy operating costs by total liters shipped to get cost per liter — the break-even milk price.",
    inputs: [
      { key: "totalCost", label: "Total monthly operating cost ($)", type: "number", defaultValue: 4500, min: 0, step: 50 },
      { key: "totalLiters", label: "Total milk shipped per month", type: "number", unitLabel: "L", defaultValue: 45000, min: 0, step: 100 },
      { key: "milkPrice", label: "Current milk price ($/L)", type: "number", defaultValue: 0.45, min: 0, step: 0.01 },
    ],
    calculate: (inputs) => {
      const cost = Number(inputs.totalCost) || 0;
      const liters = Number(inputs.totalLiters) || 0;
      const price = Number(inputs.milkPrice) || 0;
      const cpl = liters > 0 ? cost / liters : 0;
      const margin = price - cpl;
      return results(
        { id: "cpl", label: "Cost per liter", value: `$${formatNumber(cpl, 3)}`, badge: "success" },
        { id: "margin", label: "Margin per liter", value: `$${formatNumber(margin, 3)}`, badge: margin >= 0 ? "success" : "warning" },
        { id: "breakeven", label: "Break-even milk price", value: `$${formatNumber(cpl, 3)}` },
        { id: "monthlyMargin", label: "Monthly margin at current price", value: `$${formatNumber(margin * liters, 0)}` },
      );
    },
    formula: "Cost per liter = total monthly cost ÷ total liters shipped. Margin = price − cost per liter.",
    examples: [
      { title: "$4,500 cost, 45,000 L shipped, $0.45/L price", inputs: { totalCost: 4500, totalLiters: 45000, milkPrice: 0.45 }, note: "Cost = $0.100/L; margin = $0.35/L." },
    ],
    faqs: [
      { q: "What counts as operating cost?", a: "Feed, vet, breeding, labor, electricity, fuel, repairs, and anything else paid to produce that month's milk." },
      { q: "Why track this weekly?", a: "Feed prices and yields change; a rising cost per liter is your earliest warning sign." },
    ],
    related: ["dairy-farm-profit-calculator", "fertilizer-blend-calculator"],
    seo: {
      h1: "Milk Cost per Litre Calculator - Dairy Break-Even Price",
      metaDescription: "Calculate cost per liter of milk and break-even price from total monthly dairy costs and volume shipped.",
      keywords: ["cost per litre of milk calculator", "dairy milk cost calculator", "milk production cost per liter", "dairy break even price"],
    },
  },
  {
    slug: "irrigation-water-calculator",
    category: "agriculture",
    title: "Irrigation Water Calculator",
    tagline: "How much water your crop needs and how long to run the pump.",
    description:
      "Estimate irrigation volume from field area and crop water use, then pump runtime from your flow rate.",
    inputs: [
      { key: "area", label: "Field area", type: "number", unitLabel: "acre", defaultValue: 40, min: 0.1, step: 0.1 },
      { key: "waterNeed", label: "Crop water need", type: "number", unitLabel: "mm/week", defaultValue: 25, min: 0, step: 1 },
      { key: "efficiency", label: "Irrigation efficiency", type: "number", unitLabel: "%", defaultValue: 75, min: 1, max: 100, step: 1, hint: "Drip ~90%, sprinkler ~75%, flood ~60%" },
      { key: "flowRate", label: "Pump flow rate", type: "number", unitLabel: "gpm", defaultValue: 500, min: 1, step: 10, hint: "gallons per minute" },
    ],
    calculate: (inputs) => {
      const areaAcres = Number(inputs.area) || 0;
      const mm = Number(inputs.waterNeed) || 0;
      const eff = Number(inputs.efficiency) || 100;
      const gpm = Number(inputs.flowRate) || 0;
      const inches = mm / 25.4;
      const gallons = areaAcres * inches * 27154;
      const netGallons = gallons / (eff / 100);
      const minutes = gpm > 0 ? netGallons / gpm : 0;
      const hours = minutes / 60;
      const days = hours / 24;
      return results(
        { id: "grossWater", label: "Gross water needed", value: formatNumber(gallons, 0), unit: "gallons", badge: "success" },
        { id: "netWater", label: "Water to pump (after efficiency)", value: formatNumber(netGallons, 0), unit: "gallons" },
        { id: "liters", label: "Water to pump", value: formatNumber(netGallons * 3.78541, 0), unit: "liters" },
        { id: "pumpHours", label: "Pump runtime", value: formatNumber(hours, 1), unit: "hours per week" },
        { id: "pumpDays", label: "Pump runtime", value: formatNumber(days, 1), unit: "days per week (24/7 basis)" },
      );
    },
    formula: "Gallons = acres × inches × 27,154. Pumped gallons = gross ÷ efficiency%. Runtime = gallons ÷ flow rate (gpm).",
    examples: [
      { title: "40 acres, 25 mm/week, 75% efficiency, 500 gpm", inputs: { area: 40, waterNeed: 25, efficiency: 75, flowRate: 500 }, note: "≈ 357,000 gallons to pump; ≈ 11.9 hours/week." },
    ],
    faqs: [
      { q: "Where does 27,154 come from?", a: "One acre-inch of water = 27,154 US gallons." },
      { q: "Is this per week or per season?", a: "Enter the weekly crop water need; output is per week. Multiply by weeks of the season for seasonal totals." },
    ],
    related: ["seed-plant-population-calculator", "livestock-water-requirement-calculator"],
    seo: {
      h1: "Irrigation Water Calculator - Pump Runtime & Volume",
      metaDescription: "Free irrigation calculator. Water volume needed per week and pump runtime from flow rate and field area.",
      keywords: ["irrigation water calculator", "irrigation pump runtime calculator", "acre inch of water", "irrigation requirement calculator"],
    },
  },
  {
    slug: "livestock-water-requirement-calculator",
    category: "agriculture",
    title: "Livestock Water Requirement Calculator",
    tagline: "Daily water needs by animal type, weight, and weather.",
    description:
      "Estimate daily drinking water for cattle, sheep, goats, horses, and pigs, adjusted for temperature and lactation.",
    inputs: [
      { key: "animal", label: "Animal type", type: "select", options: [
        { label: "Beef cattle", value: "beef" },
        { label: "Dairy cow", value: "dairy" },
        { label: "Horse", value: "horse" },
        { label: "Sheep / goat", value: "sheep" },
        { label: "Pig (finisher)", value: "pig" },
      ], defaultValue: "beef" },
      { key: "count", label: "Number of animals", type: "number", defaultValue: 50, min: 1, step: 1 },
      { key: "weight", label: "Average weight", type: "number", unitLabel: "lb", defaultValue: 1200, min: 10, step: 10 },
      { key: "temp", label: "Temperature", type: "number", unitLabel: "°F", defaultValue: 70, min: -20, max: 120, step: 5 },
      { key: "lactating", label: "Lactating dairy cows", type: "checkbox", defaultValue: false },
    ],
    calculate: (inputs) => {
      const animal = inputs.animal as string || "beef";
      const count = Number(inputs.count) || 0;
      const wt = Number(inputs.weight) || 0;
      const f = Number(inputs.temp) || 70;
      const lact = inputs.lactating === true;
      let basePct = 0.025;
      if (animal === "dairy") basePct = 0.04;
      if (animal === "horse") basePct = 0.05;
      if (animal === "sheep") basePct = 0.03;
      if (animal === "pig") basePct = 0.04;
      let tempFactor = 1;
      if (f > 80) tempFactor = 1.5;
      if (f > 90) tempFactor = 2;
      if (f < 32) tempFactor = 1.2;
      let galPerHead = (wt * basePct) / 8.34;
      if (lact) galPerHead *= 1.3;
      galPerHead *= tempFactor;
      const perDay = galPerHead * count;
      const perMonth = perDay * 30;
      return results(
        { id: "perHead", label: "Water per head per day", value: formatNumber(galPerHead, 1), unit: "gallons", badge: "success" },
        { id: "perDay", label: "Total water per day", value: formatNumber(perDay, 0), unit: "gallons/day" },
        { id: "perMonth", label: "Total water per month", value: formatNumber(perMonth, 0), unit: "gallons/month" },
        { id: "perMonthLiters", label: "Total water per month", value: formatNumber(perMonth * 3.78541, 0), unit: "liters/month" },
      );
    },
    formula: "Water per head ≈ body weight × species factor ÷ 8.34, adjusted for temperature and lactation.",
    examples: [
      { title: "50 beef cows, 1,200 lb, 85°F", inputs: { animal: "beef", count: 50, weight: 1200, temp: 85, lactating: false }, note: "≈ 181 gallons/day ≈ 5,430 gallons/month." },
    ],
    faqs: [
      { q: "Does this include water for cleaning?", a: "No — drinking water only. Add parlor wash-down, equipment cleaning, and livestock housing separately." },
      { q: "Why does temperature matter?", a: "Cattle can drink 50–100% more water in hot weather than in cool weather." },
    ],
    related: ["dairy-farm-profit-calculator", "poultry-coop-ventilation-calculator"],
    seo: {
      h1: "Livestock Water Requirement Calculator - Daily Water Needs",
      metaDescription: "Calculate daily livestock water needs for cattle, horses, sheep, goats, and pigs by weight and temperature.",
      keywords: ["livestock water requirement calculator", "cattle water intake calculator", "horse water requirement", "animal water consumption calculator"],
    },
  },
  {
    slug: "poultry-coop-ventilation-calculator",
    category: "agriculture",
    title: "Poultry Coop Ventilation Calculator",
    tagline: "Suggested ventilation openings and airflow for a poultry house.",
    description:
      "Rule-of-thumb ventilation area and fan airflow recommendations from bird count, house size, and climate.",
    inputs: [
      { key: "birds", label: "Number of birds", type: "number", defaultValue: 500, min: 1, step: 1 },
      { key: "houseArea", label: "House floor area", type: "number", unitLabel: "sq ft", defaultValue: 1000, min: 10, step: 10 },
      { key: "climate", label: "Climate", type: "select", options: [
        { label: "Cool", value: "cool" },
        { label: "Moderate", value: "moderate" },
        { label: "Hot", value: "hot" },
      ], defaultValue: "moderate" },
    ],
    calculate: (inputs) => {
      const birds = Number(inputs.birds) || 0;
      const area = Number(inputs.houseArea) || 0;
      const climate = inputs.climate as string || "moderate";
      let cfmPerBird = climate === "cool" ? 0.5 : climate === "moderate" ? 1 : 2;
      let openingSqFtPerBird = climate === "cool" ? 0.05 : climate === "moderate" ? 0.1 : 0.2;
      const cfm = birds * cfmPerBird;
      const openings = birds * openingSqFtPerBird;
      const ach = area > 0 ? (cfm * 60) / (area * 8) : 0;
      return results(
        { id: "cfm", label: "Suggested airflow", value: formatNumber(cfm, 0), unit: "CFM", badge: "success" },
        { id: "openings", label: "Total inlet opening area", value: formatNumber(openings, 1), unit: "sq ft" },
        { id: "ach", label: "Air changes per hour (est.)", value: formatNumber(ach, 1), unit: "ACH", note: "8 ft ceiling assumed" },
        { id: "perSide", label: "Opening per sidewall", value: formatNumber(openings / 2, 1), unit: "sq ft (each side)" },
      );
    },
    formula: "CFM = birds × climate factor. Opening area = birds × per-bird opening. ACH = CFM × 60 ÷ house volume.",
    examples: [
      { title: "500 birds, 1,000 sq ft house, hot climate", inputs: { birds: 500, houseArea: 1000, climate: "hot" }, note: "≈ 1,000 CFM; ≈ 100 sq ft total openings." },
    ],
    faqs: [
      { q: "Is this a substitute for engineering design?", a: "No. Large commercial houses need a ventilation engineer; this suits small-to-mid farm planning." },
      { q: "Why more openings in hot weather?", a: "Birds release heat through respiration; more airflow prevents heat stress and mortality." },
    ],
    related: ["poultry-feed-calculator", "livestock-water-requirement-calculator"],
    seo: {
      h1: "Poultry Coop Ventilation Calculator - CFM & Opening Area",
      metaDescription: "Free poultry ventilation calculator. Airflow and inlet opening recommendations for broiler and layer houses.",
      keywords: ["poultry coop ventilation calculator", "chicken house CFM calculator", "poultry house ventilation", "broiler ventilation calculator"],
    },
  },
  {
    slug: "poultry-feed-procurement-planner",
    category: "agriculture",
    title: "Poultry Feed Procurement Planner",
    tagline: "Plan feed bags by growth phase and total cost.",
    description:
      "Plan how many bags of starter, grower, and finisher feed to buy for a flock across growth phases, plus total procurement cost.",
    inputs: [
      { key: "birds", label: "Number of birds", type: "number", defaultValue: 1000, min: 1, step: 1 },
      { key: "starterDays", label: "Starter phase days", type: "number", defaultValue: 14, min: 0, step: 1 },
      { key: "growerDays", label: "Grower phase days", type: "number", defaultValue: 21, min: 0, step: 1 },
      { key: "finisherDays", label: "Finisher phase days", type: "number", defaultValue: 14, min: 0, step: 1 },
      { key: "starterFeed", label: "Starter feed per bird per day", type: "number", unitLabel: "g", defaultValue: 30, min: 0, step: 1 },
      { key: "growerFeed", label: "Grower feed per bird per day", type: "number", unitLabel: "g", defaultValue: 80, min: 0, step: 1 },
      { key: "finisherFeed", label: "Finisher feed per bird per day", type: "number", unitLabel: "g", defaultValue: 110, min: 0, step: 1 },
      { key: "bagSize", label: "Bag size", type: "number", unitLabel: "kg", defaultValue: 25, min: 1, step: 1 },
      { key: "bagPrice", label: "Price per bag ($)", type: "number", defaultValue: 30, min: 0, step: 0.5 },
    ],
    calculate: (inputs) => {
      const birds = Number(inputs.birds) || 0;
      const sDays = Number(inputs.starterDays) || 0;
      const gDays = Number(inputs.growerDays) || 0;
      const fDays = Number(inputs.finisherDays) || 0;
      const sFeed = Number(inputs.starterFeed) || 0;
      const gFeed = Number(inputs.growerFeed) || 0;
      const fFeed = Number(inputs.finisherFeed) || 0;
      const bagKg = Number(inputs.bagSize) || 0;
      const price = Number(inputs.bagPrice) || 0;
      const sKg = birds * sFeed * sDays / 1000;
      const gKg = birds * gFeed * gDays / 1000;
      const fKg = birds * fFeed * fDays / 1000;
      const totalKg = sKg + gKg + fKg;
      const sBags = Math.ceil(sKg / bagKg);
      const gBags = Math.ceil(gKg / bagKg);
      const fBags = Math.ceil(fKg / bagKg);
      const totalBags = sBags + gBags + fBags;
      return results(
        { id: "starterKg", label: "Starter feed", value: formatNumber(sKg, 1), unit: "kg", badge: "info" },
        { id: "growerKg", label: "Grower feed", value: formatNumber(gKg, 1), unit: "kg" },
        { id: "finisherKg", label: "Finisher feed", value: formatNumber(fKg, 1), unit: "kg" },
        { id: "totalKg", label: "Total feed", value: formatNumber(totalKg, 0), unit: "kg", badge: "success" },
        { id: "totalBags", label: "Total bags", value: formatNumber(totalBags, 0), unit: "bags" },
        { id: "totalCost", label: "Total procurement cost", value: `$${formatNumber(totalBags * price, 0)}` },
        { id: "bagsBreakdown", label: "Bags (starter / grower / finisher)", value: `${sBags} / ${gBags} / ${fBags}` },
      );
    },
    formula: "Phase kg = birds × daily g × days ÷ 1000. Bags = ceil(kg ÷ bag size). Cost = bags × price per bag.",
    examples: [
      { title: "1,000 birds, 14/21/14 day phases", inputs: { birds: 1000, starterDays: 14, growerDays: 21, finisherDays: 14, starterFeed: 30, growerFeed: 80, finisherFeed: 110, bagSize: 25, bagPrice: 30 }, note: "≈ 1,134 kg total → ≈ 46 bags → ≈ $1,371." },
    ],
    faqs: [
      { q: "Why ceil on bags?", a: "You buy whole bags; round each phase up so you don't run short mid-phase." },
      { q: "Can I use this for layers?", a: "Adjust the days and daily feed to a layer cycle; the math works for any phased feeding program." },
    ],
    related: ["poultry-feed-calculator", "poultry-fcr-calculator"],
    seo: {
      h1: "Poultry Feed Procurement Planner - Feed Bags by Phase",
      metaDescription: "Free poultry feed procurement planner. Plan starter, grower, and finisher feed bags and total cost by growth phase.",
      keywords: ["poultry feed procurement planner", "broiler feed planner", "feed bags by growth phase", "chicken feed purchasing plan"],
    },
  },
];

// Registry lives in index.ts and combines all categories.
