export type InputField = {
  key: string;
  label: string;
  unitLabel?: string;
  type: "number" | "select" | "checkbox";
  options?: { label: string; value: string | number }[];
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number | string | boolean;
  required?: boolean;
  hint?: string;
};

export type CalcResult = {
  id: string;
  label: string;
  value: string | number;
  unit?: string;
  note?: string;
  badge?: "info" | "success" | "warning";
};

export type ToolDef = {
  slug: string;
  category: string;
  title: string;
  tagline: string;
  description: string;
  inputs: InputField[];
  calculate: (inputs: Record<string, unknown>) => CalcResult[];
  formula: string;
  examples: { title: string; inputs: Record<string, unknown>; note: string }[];
  faqs: { q: string; a: string }[];
  related: string[];
  seo: {
    h1: string;
    metaDescription: string;
    keywords: string[];
  };
};

export type ToolConfig = Omit<ToolDef, "calculate">;

export function defaultInputValue(field: InputField): unknown {
  if (field.defaultValue !== undefined) return field.defaultValue;
  if (field.type === "checkbox") return false;
  return 0;
}

export function formatNumber(v: number, decimals = 2): string {
  return v.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}
