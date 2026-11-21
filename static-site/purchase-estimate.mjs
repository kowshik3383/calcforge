export const purchaseTools = {
  "flooring-pack-calculator": {
    supplierName: "Somany floor tiles",
    supplierUrl: "https://www.somanyceramics.com/tiles/floor-tiles",
    affiliateEnv: "FLOORING_AFFILIATE_URL",
    supplierNote: "Confirm the exact product’s coverage per box before ordering.",
    unit: "pack",
    guides: [
      ["flooring-box-coverage.html", "How to read flooring box coverage"],
      ["flooring-waste.html", "Plan for flooring cuts and waste"],
    ],
  },
  "raised-bed-soil-calculator": {
    supplierName: "Ugaoo garden soil",
    supplierUrl: "https://www.ugaoo.com/products/garden-soil-mix-5-kg",
    affiliateEnv: "SOIL_AFFILIATE_URL",
    supplierNote: "Some bags are sold by weight. Confirm the package volume in litres before using this bag estimate.",
    unit: "bag",
    guides: [
      ["raised-bed-soil-volume.html", "Calculate soil volume for a raised bed"],
      ["bagged-soil-quantity.html", "Convert raised-bed fill into bags of soil"],
    ],
  },
};

export function purchaseEstimate({ required, unitCapacity, quantity, price, delivery }) {
  if (![required, unitCapacity].every(value => Number.isFinite(value) && value > 0)) return null;
  if (quantity === undefined) {
    const units = required / unitCapacity;
    const nearest = Math.round(units);
    quantity = Math.max(1, Math.abs(units - nearest) <= Number.EPSILON * units * 4
      ? nearest : Math.ceil(units));
  }
  if (!Number.isSafeInteger(quantity) || quantity < 1) return null;
  if ((price !== undefined && (!Number.isFinite(price) || price < 0)) ||
      (delivery !== undefined && (!Number.isFinite(delivery) || delivery < 0))) return null;
  return {
    quantity,
    extra: Math.max(0, quantity * unitCapacity - required),
    total: price === undefined ? undefined : quantity * price + (delivery ?? 0),
  };
}
