export type Model =
  | { kind: "conversion"; factor: number; offset: number; from: string; to: string; variable?: boolean }
  | { kind: "flooring"; length: number; width: number; coverage: number; waste: number };

export function convert(value: number, model: Extract<Model, { kind: "conversion" }>, localSize = model.factor) {
  return value * (model.variable ? localSize : model.factor) + model.offset;
}

export function flooring(length: number, width: number, coverage: number, waste: number) {
  const area = length * width;
  const adjusted = area * (1 + waste / 100);
  const quotient = adjusted / coverage;
  const nearest = Math.round(quotient);
  const packs = Math.abs(nearest - quotient) <= Number.EPSILON * Math.abs(quotient) * 4
    ? nearest : Math.ceil(quotient);
  return { area, adjusted, packs: Math.max(1, packs) };
}
