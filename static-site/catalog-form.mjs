import { getTool } from "./catalog/tools/index.mjs";

const form = document.querySelector("#tool-form");
const result = document.querySelector("#tool-result");
const tool = getTool(form.dataset.tool);

function calculate() {
  const values = Object.fromEntries(tool.inputs.map(field => {
    const input = form.elements.namedItem(field.key);
    const value = field.type === "checkbox" ? input.checked :
      field.type === "number" ? input.valueAsNumber : input.value;
    return [field.key, value];
  }));
  const rows = tool.calculate(values);
  if (rows.some(row => !Number.isFinite(typeof row.value === "number" ? row.value : 0) ||
    /\b(?:NaN|Infinity|∞)\b/.test(String(row.value)))) {
    result.textContent = "These measurements do not produce a usable result. Check the inputs and try again.";
    return;
  }
  const list = document.createElement("dl");
  for (const row of rows) {
    const label = document.createElement("dt");
    const value = document.createElement("dd");
    label.textContent = row.label;
    value.textContent = [row.value, row.unit, row.note].filter(part => part != null).join(" · ");
    list.append(label, value);
  }
  result.replaceChildren(list);
}

form.addEventListener("submit", event => {
  event.preventDefault();
  calculate();
});
form.addEventListener("input", () => {
  result.textContent = "Calculate again to update your result.";
});
form.querySelector("fieldset").disabled = false;
