import { getTool } from "./catalog/tools/index.mjs";

import { purchaseEstimate, purchaseTools } from "./purchase-estimate.mjs";

const form = document.querySelector("#tool-form");
const result = document.querySelector("#tool-result");
const tool = getTool(form.dataset.tool);

const purchase = purchaseTools[tool.slug];
const supplier = document.querySelector("#purchase-supplier");

function addRow(list, label, value) {
  const term = document.createElement("dt");
  const detail = document.createElement("dd");
  term.textContent = label;
  detail.textContent = value;
  list.append(term, detail);
}

function optionalNumber(name) {
  const input = form.elements.namedItem(name);
  return input?.value ? input.valueAsNumber : undefined;
}

function appendPurchaseResult(list, inputs, value) {
  const isFlooring = purchase.unit === "pack";
  const capacity = isFlooring ? inputs.value2 : optionalNumber("purchase-capacity");
  if (!capacity) return;
  const price = optionalNumber("purchase-price");
  const estimate = purchaseEstimate({
    required: isFlooring ? inputs.value1 : value,
    unitCapacity: capacity,
    quantity: isFlooring ? value : undefined,
    price,
    delivery: optionalNumber("purchase-delivery"),
  });
  if (!estimate) return;
  const format = new Intl.NumberFormat(undefined, { maximumFractionDigits: 4 });
  if (!isFlooring) {
    addRow(list, "Bags to buy", format.format(estimate.quantity));
  }
  addRow(list, isFlooring ? "Extra coverage above measured floor area (includes waste allowance)" :
    "Extra soil after rounding to whole bags", format.format(estimate.extra) + (isFlooring ? " m²" : " L"));
  if (estimate.total !== undefined) {
    const currency = form.elements.namedItem("purchase-currency").value;
    const money = new Intl.NumberFormat(undefined, { style: "currency", currency });
    addRow(list, "Estimated order cost", money.format(estimate.total));
  }
}

supplier?.addEventListener("click", event => {
  const link = event.target.closest("[data-supplier]");
  if (!link) return;
  document.dispatchEvent(new CustomEvent("calcforge:supplier-click", {
    detail: { tool: tool.slug, linkType: link.dataset.supplier },
  }));
});

function calculate() {
  const values = Object.fromEntries(tool.inputs.map(field => {
    const input = form.elements.namedItem(field.key);
    const value = field.type === "checkbox" ? input.checked :
      field.type === "number" ? input.valueAsNumber : input.value;
    return [field.key, value];
  }));
  if (supplier) supplier.hidden = true;
  const rows = tool.calculate(values);
  if (rows.some(row => !Number.isFinite(typeof row.value === "number" ? row.value : 0) ||
    /\b(?:NaN|Infinity|∞)\b/.test(String(row.value)))) {
    result.textContent = "These measurements do not produce a usable result. Check the inputs and try again.";
    return;
  }
  const list = document.createElement("dl");
  for (const row of rows) {
    addRow(list, row.label, [row.value, row.unit, row.note].filter(part => part != null).join(" · "));
  }
  const usable = purchase ? rows[0]?.badge === "success" : rows.length > 0;
  if (purchase && usable) {
    appendPurchaseResult(list, values, rows[0].value);
    supplier.hidden = false;
  }
  result.replaceChildren(list);
  if (usable) document.dispatchEvent(new CustomEvent("calcforge:calculation", { detail: { tool: tool.slug } }));
}

form.addEventListener("submit", event => {
  event.preventDefault();
  calculate();
});
form.addEventListener("input", () => {
  result.textContent = "Calculate again to update your result.";
  if (supplier) supplier.hidden = true;
});
form.querySelector("fieldset").disabled = false;
