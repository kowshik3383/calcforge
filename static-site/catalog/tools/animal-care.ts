import type { ToolDef, CalcResult } from "../calculator";
import { formatNumber } from "../calculator";

function results(...items: CalcResult[]): CalcResult[] {
  return items;
}

export const ANIMAL_CARE_TOOLS: ToolDef[] = [
  {
    slug: "horse-blanket-weather-calculator",
    category: "animal-care",
    title: "Horse Blanket Weather Calculator",
    tagline: "Decide what weight rug your horse needs tonight.",
    description:
      "Enter the temperature and your horse's details to get a blanket-weight recommendation (light, medium, or heavy) plus neck-cover advice.",
    inputs: [
      { key: "temp", label: "Temperature", type: "number", unitLabel: "°C", defaultValue: 5, min: -20, max: 30, step: 1, hint: "Expected overnight low" },
      { key: "clip", label: "Coat", type: "select", options: [
        { label: "Unclipped (full coat)", value: "unclipped" },
        { label: "Clipped", value: "clipped" },
        { label: "Trace clipped", value: "trace" },
      ], defaultValue: "unclipped" },
      { key: "age", label: "Age", type: "select", options: [
        { label: "Young adult", value: "young" },
        { label: "Senior", value: "senior" },
        { label: "Foal", value: "foal" },
      ], defaultValue: "young" },
      { key: "condition", label: "Body condition", type: "select", options: [
        { label: "Good (healthy weight)", value: "good" },
        { label: "Poor (thin)", value: "poor" },
        { label: "Overweight", value: "overweight" },
      ], defaultValue: "good" },
      { key: "shelter", label: "Shelter", type: "select", options: [
        { label: "Stabled / indoor", value: "stabled" },
        { label: "Field with shelter", value: "field" },
        { label: "Open field (no shelter)", value: "open" },
      ], defaultValue: "field" },
      { key: "wind", label: "Wind & rain", type: "select", options: [
        { label: "Calm, dry", value: "calm" },
        { label: "Windy or damp", value: "windy" },
        { label: "Wet and windy", value: "wet" },
      ], defaultValue: "calm" },
    ],
    calculate: (inputs) => {
      const t = Number(inputs.temp) || 0;
      const clip = inputs.clip as string || "unclipped";
      const age = inputs.age as string || "young";
      const cond = inputs.condition as string || "good";
      const shelter = inputs.shelter as string || "field";
      const weather = inputs.wind as string || "calm";

      // Base threshold (temp below which blanketing starts) by clip
      let threshold = clip === "clipped" ? 10 : clip === "trace" ? 5 : 0;
      if (age === "senior" || age === "foal") threshold += 3;
      if (cond === "poor") threshold += 2;
      if (cond === "overweight") threshold -= 2;
      if (shelter === "open") threshold += 3;
      if (shelter === "stabled") threshold -= 3;
      if (weather === "windy") threshold += 2;
      if (weather === "wet") threshold += 3;

      let weight: string;
      let neck: string;
      if (t >= threshold + 5) {
        weight = "No blanket";
        neck = "No neck cover";
      } else if (t >= threshold) {
        weight = "Lightweight (0–100 g)";
        neck = "No neck cover";
      } else if (t >= threshold - 5) {
        weight = "Mediumweight (150–250 g)";
        neck = "Optional neck cover";
      } else {
        weight = "Heavyweight (300+ g)";
        neck = "Neck cover recommended";
      }

      return results(
        { id: "weight", label: "Recommended blanket", value: weight, badge: "success" },
        { id: "neck", label: "Neck cover", value: neck },
        { id: "threshold", label: "Blanketing threshold", value: `${threshold}°C`, unit: "overnight low" },
        { id: "advice", label: "Bottom line", value: t <= threshold ? "Blanket recommended" : "Likely fine unblanketed", badge: t <= threshold ? "warning" : "info" },
      );
    },
    formula: "Blanketing threshold starts at 0 °C for an unclipped adult horse in good condition with shelter, then shifts up for clipping, age, poor condition, exposure, and wet/windy weather.",
    examples: [
      { title: "2 °C, clipped senior, field, windy", inputs: { temp: 2, clip: "clipped", age: "senior", condition: "good", shelter: "field", wind: "windy" }, note: "Threshold ≈ 18 °C → Heavyweight + neck cover." },
      { title: "8 °C, unclipped, stabled, calm", inputs: { temp: 8, clip: "unclipped", age: "young", condition: "good", shelter: "stabled", wind: "calm" }, note: "Threshold ≈ -3 °C → No blanket." },
    ],
    faqs: [
      { q: "Is this a veterinary recommendation?", a: "No — it's a general guide. Observe your horse and consult your vet or stable manager for individual needs." },
      { q: "Why does clipping matter?", a: "A clipped horse loses its natural insulation and needs a warmer blanket at higher temperatures." },
    ],
    related: ["livestock-water-requirement-calculator", "dairy-farm-profit-calculator"],
    seo: {
      h1: "Horse Blanket Weather Calculator - What Rug Tonight",
      metaDescription: "Free horse blanket calculator. Get a blanket-weight recommendation from temperature, clip, age, and shelter.",
      keywords: ["horse blanket calculator", "what rug to put on horse", "horse rug temperature guide", "horse blanket weather"],
    },
  },
];
