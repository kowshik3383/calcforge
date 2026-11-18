import { AGRICULTURE_TOOLS } from "./agriculture";
import { CONSTRUCTION_TOOLS } from "./construction";
import { MANUFACTURING_TOOLS } from "./manufacturing";
import { ANIMAL_CARE_TOOLS } from "./animal-care";
import type { ToolDef } from "../calculator";

const ALL = [...AGRICULTURE_TOOLS, ...CONSTRUCTION_TOOLS, ...MANUFACTURING_TOOLS, ...ANIMAL_CARE_TOOLS];

export function getTool(slug: string): ToolDef | undefined {
  return ALL.find((t) => t.slug === slug);
}

export function allTools(): ToolDef[] {
  return ALL;
}

export function getToolsByCategory(category: string): ToolDef[] {
  return ALL.filter((t) => t.category === category);
}

export const ALL_TOOLS = ALL;
