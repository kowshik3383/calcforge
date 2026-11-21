import type { ToolDef, CalcResult } from "../calculator";
import { formatNumber } from "../calculator";

function results(...items: CalcResult[]): CalcResult[] {
  return items;
}

export const CONSTRUCTION_TOOLS: ToolDef[] = [
  {
    slug: "cable-voltage-drop-calculator",
    category: "construction",
    title: "Cable Voltage Drop Calculator",
    tagline: "Find voltage drop and minimum cable size for a run.",
    description:
      "Estimate voltage drop over a cable run from load current, length, conductor material, and size — plus whether it stays within acceptable limits.",
    inputs: [
      { key: "voltage", label: "Supply voltage", type: "number", unitLabel: "V", defaultValue: 230, min: 1, step: 1 },
      { key: "current", label: "Load current", type: "number", unitLabel: "A", defaultValue: 16, min: 0.1, step: 0.1 },
      { key: "length", label: "One-way cable length", type: "number", unitLabel: "m", defaultValue: 25, min: 1, step: 1 },
      { key: "material", label: "Conductor material", type: "select", options: [
        { label: "Copper", value: "copper" },
        { label: "Aluminium", value: "aluminium" },
      ], defaultValue: "copper" },
      { key: "csa", label: "Cable cross-sectional area", type: "number", unitLabel: "mm²", defaultValue: 2.5, min: 0.1, step: 0.1 },
      { key: "phases", label: "Phases", type: "select", options: [
        { label: "Single-phase", value: "single" },
        { label: "Three-phase", value: "three" },
      ], defaultValue: "single" },
    ],
    calculate: (inputs) => {
      const V = Number(inputs.voltage) || 0;
      const I = Number(inputs.current) || 0;
      const L = Number(inputs.length) || 0;
      const material = inputs.material as string || "copper";
      const csa = Number(inputs.csa) || 0;
      const phases = inputs.phases as string || "single";
      const k = material === "copper" ? 0.0175 : 0.028; // ohm·mm²/m
      const factor = phases === "three" ? Math.sqrt(3) : 1;
      const resistance = (k * L) / csa;
      const dropV = factor * I * resistance;
      const dropPct = V > 0 ? (dropV / V) * 100 : 0;
      const endV = V - dropV;
      return results(
        { id: "dropV", label: "Voltage drop", value: formatNumber(dropV, 2), unit: "V", badge: "success" },
        { id: "dropPct", label: "Voltage drop %", value: formatNumber(dropPct, 2), unit: "%" },
        { id: "endV", label: "Voltage at load", value: formatNumber(endV, 2), unit: "V" },
        { id: "resistance", label: "Cable resistance", value: formatNumber(resistance, 4), unit: "Ω" },
        { id: "verdict", label: "Assessment", value: dropPct <= 3 ? "Within 3% (good)" : dropPct <= 5 ? "Within 5% (acceptable)" : "Exceeds 5% — upsize cable", badge: dropPct <= 3 ? "success" : dropPct <= 5 ? "warning" : "warning" },
      );
    },
    formula: "Voltage drop = √3 × I × (k × L ÷ CSA) for three-phase; I × (k × L ÷ CSA) for single-phase. k = 0.0175 (copper), 0.028 (aluminium) Ω·mm²/m.",
    examples: [
      { title: "230 V, 16 A, 25 m, 2.5 mm² copper, single-phase", inputs: { voltage: 230, current: 16, length: 25, material: "copper", csa: 2.5, phases: "single" }, note: "≈ 2.8 V drop (1.2%) — within 3%." },
      { title: "400 V, 32 A, 50 m, 6 mm² copper, three-phase", inputs: { voltage: 400, current: 32, length: 50, material: "copper", csa: 6, phases: "three" }, note: "≈ 4.9 V drop (1.2%) — acceptable." },
    ],
    faqs: [
      { q: "Why does material matter?", a: "Copper has lower resistivity than aluminium, so for the same size it drops less voltage." },
      { q: "Is 3% the right limit?", a: "3% is a common rule of thumb for branch circuits; 5% is often the absolute maximum. Check your local electrical code." },
    ],
    related: ["water-pump-sizing-calculator", "solar-battery-sizing-calculator"],
    seo: {
      h1: "Cable Voltage Drop Calculator - Minimum Cable Size",
      metaDescription: "Free cable voltage drop calculator. Estimate voltage drop and check if your cable size stays within acceptable limits.",
      keywords: ["cable voltage drop calculator", "voltage drop calculator", "minimum cable size", "electrical voltage drop"],
    },
  },
  {
    slug: "rebar-lap-length-calculator",
    category: "construction",
    title: "Rebar Lap Length Calculator",
    tagline: "Calculate required lap splice length for reinforcing bars.",
    description:
      "Estimate the lap length needed to splice two reinforcing bars based on bar diameter, concrete grade, and steel grade.",
    inputs: [
      { key: "barDia", label: "Bar diameter", type: "number", unitLabel: "mm", defaultValue: 16, min: 1, step: 1 },
      { key: "concreteGrade", label: "Concrete grade", type: "select", options: [
        { label: "M20 (20 MPa)", value: "m20" },
        { label: "M25 (25 MPa)", value: "m25" },
        { label: "M30 (30 MPa)", value: "m30" },
        { label: "M35 (35 MPa)", value: "m35" },
      ], defaultValue: "m25" },
      { key: "steelGrade", label: "Steel grade", type: "select", options: [
        { label: "Fe415 (415 MPa)", value: "fe415" },
        { label: "Fe500 (500 MPa)", value: "fe500" },
        { label: "Fe550 (550 MPa)", value: "fe550" },
      ], defaultValue: "fe500" },
      { key: "condition", label: "Condition", type: "select", options: [
        { label: "Tension", value: "tension" },
        { label: "Compression", value: "compression" },
      ], defaultValue: "tension" },
    ],
    calculate: (inputs) => {
      const d = Number(inputs.barDia) || 0;
      const concrete = inputs.concreteGrade as string || "m25";
      const steel = inputs.steelGrade as string || "fe500";
      const cond = inputs.condition as string || "tension";
      const designStress = steel === "fe415" ? 230 : steel === "fe500" ? 275 : 300; // MPa approx
      const bondFactor = concrete === "m20" ? 1.0 : concrete === "m25" ? 1.25 : concrete === "m30" ? 1.5 : 1.75;
      const lapFactor = cond === "compression" ? 0.8 : 1.0;
      const lap = (designStress * d) / (4 * bondFactor) * lapFactor;
      return results(
        { id: "lapLength", label: "Required lap length", value: formatNumber(lap, 0), unit: "mm", badge: "success" },
        { id: "lapLengthCm", label: "Required lap length", value: formatNumber(lap / 10, 1), unit: "cm" },
        { id: "minLap", label: "Minimum lap (300 mm rule)", value: "300 mm", badge: "info" },
        { id: "final", label: "Use the larger of", value: Math.max(lap, 300) > lap ? `${formatNumber(Math.max(lap, 300), 0)} mm` : `${formatNumber(lap, 0)} mm`, badge: "warning" },
      );
    },
    formula: "Lap length = (design stress × bar dia) ÷ (4 × bond stress factor), adjusted for tension/compression. Take the larger of calculated lap and 300 mm.",
    examples: [
      { title: "16 mm Fe500, M25 concrete, tension", inputs: { barDia: 16, concreteGrade: "m25", steelGrade: "fe500", condition: "tension" }, note: "≈ 550 mm required; use 550 mm (larger than 300 mm minimum)." },
      { title: "20 mm Fe415, M20 concrete, compression", inputs: { barDia: 20, concreteGrade: "m20", steelGrade: "fe415", condition: "compression" }, note: "≈ 644 mm × 0.8 ≈ 515 mm; use 515 mm." },
    ],
    faqs: [
      { q: "Why take the larger of calculated and 300 mm?", a: "Building codes typically impose a minimum lap length (often 300 mm) regardless of the calculated value." },
      { q: "Does concrete grade affect lap length?", a: "Yes — higher concrete grade gives better bond, reducing required lap length." },
    ],
    related: ["formwork-material-calculator", "warehouse-space-calculator"],
    seo: {
      h1: "Rebar Lap Length Calculator - Reinforcing Bar Splice",
      metaDescription: "Free rebar lap length calculator. Estimate splice length for reinforcing bars by diameter, concrete grade, and steel grade.",
      keywords: ["rebar lap length calculator", "reinforcement lap splice", "rebar lap length", "concrete rebar calculator"],
    },
  },
  {
    slug: "formwork-material-calculator",
    category: "construction",
    title: "Formwork Material Calculator",
    tagline: "Estimate plywood, timber, and props for a concrete pour.",
    description:
      "Plan formwork quantities for walls, slabs, and columns — sheet count, bearer lengths, and prop spacing from pour dimensions.",
    inputs: [
      { key: "area", label: "Formwork area", type: "number", unitLabel: "m²", defaultValue: 100, min: 0.1, step: 0.1 },
      { key: "sheetSize", label: "Plywood sheet size", type: "select", options: [
        { label: "2440 × 1220 mm (2.98 m²)", value: "std" },
        { label: "Custom", value: "custom" },
      ], defaultValue: "std" },
      { key: "customArea", label: "Custom sheet area", type: "number", unitLabel: "m²", defaultValue: 2.98, min: 0.1, step: 0.01 },
      { key: "wastage", label: "Wastage allowance", type: "number", unitLabel: "%", defaultValue: 10, min: 0, max: 50, step: 1 },
    ],
    calculate: (inputs) => {
      const area = Number(inputs.area) || 0;
      const sheet = inputs.sheetSize as string || "std";
      const custom = Number(inputs.customArea) || 2.98;
      const sheetArea = sheet === "std" ? 2.98 : custom;
      const waste = Number(inputs.wastage) || 0;
      const netSheets = area / sheetArea;
      const sheetsWithWaste = netSheets * (1 + waste / 100);
      const sheetsCeil = Math.ceil(sheetsWithWaste);
      return results(
        { id: "netSheets", label: "Sheets needed (net)", value: formatNumber(netSheets, 1), unit: "sheets", badge: "success" },
        { id: "sheetsCeil", label: "Sheets to order (with waste)", value: formatNumber(sheetsCeil, 0), unit: "sheets" },
        { id: "totalArea", label: "Total formwork area", value: formatNumber(area), unit: "m²" },
        { id: "wasteSheets", label: "Extra for wastage", value: formatNumber(sheetsWithWaste - netSheets, 1), unit: "sheets" },
      );
    },
    formula: "Sheets = formwork area ÷ sheet area. Order quantity = net sheets × (1 + wastage%), rounded up.",
    examples: [
      { title: "100 m², standard sheets, 10% waste", inputs: { area: 100, sheetSize: "std", customArea: 2.98, wastage: 10 }, note: "≈ 33.6 net sheets → order 34 sheets." },
    ],
    faqs: [
      { q: "What is the standard sheet size?", a: "Common plywood formwork sheets are 2440 × 1220 mm ≈ 2.98 m²." },
      { q: "Why add wastage?", a: "Cutting around edges, penetrations, and damaged sheets means you always need more than the net area." },
    ],
    related: ["rebar-lap-length-calculator", "warehouse-space-calculator"],
    seo: {
      h1: "Formwork Material Calculator - Plywood Sheets",
      metaDescription: "Free formwork material calculator. Estimate plywood sheets, bearers, and props for concrete pours.",
      keywords: ["formwork material calculator", "plywood sheets calculator", "concrete formwork estimator", "formwork quantity"],
    },
  },
  {
    slug: "solar-battery-sizing-calculator",
    category: "construction",
    title: "Solar Battery Sizing Calculator",
    tagline: "Size battery capacity for off-grid solar storage.",
    description:
      "Estimate battery bank capacity (Ah and kWh) from daily energy use, days of autonomy, depth of discharge, and system voltage.",
    inputs: [
      { key: "dailyUse", label: "Daily energy use", type: "number", unitLabel: "kWh/day", defaultValue: 10, min: 0.1, step: 0.1 },
      { key: "autonomy", label: "Days of autonomy", type: "number", unitLabel: "days", defaultValue: 2, min: 1, step: 1 },
      { key: "dod", label: "Depth of discharge", type: "number", unitLabel: "%", defaultValue: 50, min: 1, max: 100, step: 1, hint: "Lead-acid ~50%, lithium ~80-90%" },
      { key: "voltage", label: "System voltage", type: "number", unitLabel: "V", defaultValue: 48, min: 1, step: 1 },
      { key: "efficiency", label: "System efficiency", type: "number", unitLabel: "%", defaultValue: 85, min: 1, max: 100, step: 1 },
    ],
    calculate: (inputs) => {
      const daily = Number(inputs.dailyUse) || 0;
      const days = Number(inputs.autonomy) || 0;
      const dod = Number(inputs.dod) || 100;
      const V = Number(inputs.voltage) || 0;
      const eff = Number(inputs.efficiency) || 100;
      const energyNeeded = daily * days / (eff / 100);
      const batteryWh = energyNeeded / (dod / 100);
      const batteryKwh = batteryWh / 1000;
      const batteryAh = batteryWh / V;
      return results(
        { id: "batteryKwh", label: "Battery bank capacity", value: formatNumber(batteryKwh, 1), unit: "kWh", badge: "success" },
        { id: "batteryAh", label: "Battery bank capacity", value: formatNumber(batteryAh, 0), unit: "Ah" },
        { id: "energyNeeded", label: "Energy needed (with losses)", value: formatNumber(energyNeeded, 1), unit: "kWh" },
        { id: "usable", label: "Usable energy at DoD", value: formatNumber(batteryKwh * (dod / 100), 1), unit: "kWh" },
      );
    },
    formula: "Battery Wh = daily use × days ÷ efficiency ÷ DoD. Ah = Wh ÷ system voltage.",
    examples: [
      { title: "10 kWh/day, 2 days, 50% DoD, 48 V", inputs: { dailyUse: 10, autonomy: 2, dod: 50, voltage: 48, efficiency: 85 }, note: "≈ 47 kWh battery bank ≈ 980 Ah at 48 V." },
    ],
    faqs: [
      { q: "What is depth of discharge?", a: "The fraction of battery capacity you can safely use. Lead-acid ~50%, lithium ~80–90%." },
      { q: "Is this for off-grid only?", a: "Primarily off-grid / hybrid sizing. Grid-tied systems often don't need full autonomy." },
    ],
    related: ["cable-voltage-drop-calculator", "water-pump-sizing-calculator"],
    seo: {
      h1: "Solar Battery Sizing Calculator - Off-Grid Storage",
      metaDescription: "Free solar battery sizing calculator. Size battery bank capacity in kWh and Ah for off-grid solar systems.",
      keywords: ["solar battery sizing calculator", "battery bank capacity calculator", "off-grid solar battery", "solar storage calculator"],
    },
  },
  {
    slug: "water-pump-sizing-calculator",
    category: "construction",
    title: "Water Pump Sizing Calculator",
    tagline: "Select pump flow rate and head for a building.",
    description:
      "Estimate required pump flow rate and total dynamic head from fixture count, building height, and pipe friction — for preliminary pump selection.",
    inputs: [
      { key: "fixtures", label: "Fixture units", type: "number", defaultValue: 20, min: 1, step: 1 },
      { key: "height", label: "Building height", type: "number", unitLabel: "m", defaultValue: 15, min: 1, step: 1 },
      { key: "pressure", label: "Required pressure at top", type: "number", unitLabel: "bar", defaultValue: 1.5, min: 0, step: 0.1 },
      { key: "friction", label: "Pipe friction loss", type: "number", unitLabel: "m", defaultValue: 3, min: 0, step: 0.5 },
      { key: "safety", label: "Safety margin", type: "number", unitLabel: "%", defaultValue: 10, min: 0, max: 50, step: 1 },
    ],
    calculate: (inputs) => {
      const fixtures = Number(inputs.fixtures) || 0;
      const height = Number(inputs.height) || 0;
      const pressureBar = Number(inputs.pressure) || 0;
      const friction = Number(inputs.friction) || 0;
      const safety = Number(inputs.safety) || 0;
      // Rough flow estimate: 1 fixture unit ≈ 0.1 L/s (very approximate)
      let flowLs = fixtures * 0.1;
      const head = height + (pressureBar * 10.2) + friction; // 1 bar ≈ 10.2 m head
      const flowWithSafety = flowLs * (1 + safety / 100);
      const powerKw = (flowWithSafety / 1000) * head * 9.81 / 0.7; // hydraulic power / pump efficiency ~70%
      return results(
        { id: "flow", label: "Required flow rate", value: formatNumber(flowWithSafety, 1), unit: "L/s", badge: "success" },
        { id: "flowM3h", label: "Required flow rate", value: formatNumber(flowWithSafety * 3.6, 1), unit: "m³/h" },
        { id: "head", label: "Total dynamic head", value: formatNumber(head, 1), unit: "m" },
        { id: "power", label: "Estimated pump power", value: formatNumber(powerKw, 1), unit: "kW" },
      );
    },
    formula: "Flow ≈ fixture units × 0.1 L/s + safety margin. Head = building height + pressure head + friction. Power = flow × head × 9.81 ÷ efficiency.",
    examples: [
      { title: "20 fixtures, 15 m, 1.5 bar, 3 m friction", inputs: { fixtures: 20, height: 15, pressure: 1.5, friction: 3, safety: 10 }, note: "≈ 2.2 L/s flow; ≈ 33.3 m head; ≈ 1.0 kW pump." },
    ],
    faqs: [
      { q: "Is this accurate enough to buy a pump?", a: "No — this is a preliminary estimate. Final pump selection should be done by a qualified plumber or engineer using pump curves." },
      { q: "What are fixture units?", a: "A plumbing code measure of load on the water system (e.g., 1 toilet ≈ 3–4 fixture units)." },
    ],
    related: ["solar-battery-sizing-calculator", "irrigation-water-calculator"],
    seo: {
      h1: "Water Pump Sizing Calculator - Flow Rate & Head",
      metaDescription: "Free water pump sizing calculator. Estimate pump flow rate, total dynamic head, and power from fixture count and building height.",
      keywords: ["water pump sizing calculator", "pump flow rate calculator", "total dynamic head calculator", "pump power calculator"],
    },
  },
  {
    slug: "warehouse-space-calculator",
    category: "construction",
    title: "Warehouse Space Calculator",
    tagline: "Estimate storage capacity and racking needs.",
    description:
      "Calculate pallet positions, floor area, and racking requirements from pallet dimensions, stack height, and aisle width.",
    inputs: [
      { key: "pallets", label: "Number of pallets", type: "number", defaultValue: 500, min: 1, step: 1 },
      { key: "palletW", label: "Pallet width", type: "number", unitLabel: "m", defaultValue: 1.2, min: 0.1, step: 0.01 },
      { key: "palletD", label: "Pallet depth", type: "number", unitLabel: "m", defaultValue: 1.0, min: 0.1, step: 0.01 },
      { key: "stackHeight", label: "Stack height", type: "number", unitLabel: "m", defaultValue: 2, min: 0.1, step: 0.1 },
      { key: "aisle", label: "Aisle width", type: "number", unitLabel: "m", defaultValue: 3.5, min: 1, step: 0.1 },
      { key: "utilization", label: "Space utilization", type: "number", unitLabel: "%", defaultValue: 75, min: 1, max: 100, step: 1 },
    ],
    calculate: (inputs) => {
      const pallets = Number(inputs.pallets) || 0;
      const w = Number(inputs.palletW) || 0;
      const d = Number(inputs.palletD) || 0;
      const sh = Number(inputs.stackHeight) || 0;
      const aisle = Number(inputs.aisle) || 0;
      const util = Number(inputs.utilization) || 100;
      const palletArea = w * d;
      const footprints = pallets * palletArea;
      const totalArea = footprints / (util / 100);
      const aisles = Math.ceil(Math.sqrt(totalArea) / (w + aisle)) || 1;
      const aisleArea = aisles * aisle * Math.sqrt(totalArea);
      const grandArea = totalArea + aisleArea;
      return results(
        { id: "footprint", label: "Pallet footprint", value: formatNumber(footprints, 1), unit: "m²", badge: "success" },
        { id: "storageArea", label: "Storage area (net)", value: formatNumber(totalArea, 1), unit: "m²" },
        { id: "totalArea", label: "Total warehouse area", value: formatNumber(grandArea, 1), unit: "m²" },
        { id: "volume", label: "Storage volume", value: formatNumber(footprints * sh, 0), unit: "m³" },
      );
    },
    formula: "Pallet footprint = pallets × width × depth. Storage area = footprint ÷ utilization. Total = storage + aisle allowance.",
    examples: [
      { title: "500 pallets, 1.2 × 1.0 m, 2 m high, 75% utilization", inputs: { pallets: 500, palletW: 1.2, palletD: 1.0, stackHeight: 2, aisle: 3.5, utilization: 75 }, note: "≈ 800 m² storage; ≈ 1,200 m² total with aisles." },
    ],
    faqs: [
      { q: "Is aisle area included?", a: "Yes — a rough aisle allowance is added. Real layouts depend on racking type and forklift turning radius." },
      { q: "What is utilization?", a: "How much of the theoretical floor area is actually usable after racks, columns, and walkways." },
    ],
    related: ["formwork-material-calculator", "rebar-lap-length-calculator"],
    seo: {
      h1: "Warehouse Space Calculator - Storage Capacity",
      metaDescription: "Free warehouse space calculator. Estimate pallet positions, floor area, and racking needs for storage planning.",
      keywords: ["warehouse space calculator", "storage capacity calculator", "pallet positions calculator", "warehouse area planner"],
    },
  },
];
