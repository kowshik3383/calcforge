import { convert, flooring } from "./new-calculations.mjs";

const form = document.querySelector("#generated-calculator");
const result = document.querySelector("#generated-result");
const model = JSON.parse(form.dataset.model);
const formatter = new Intl.NumberFormat("en-IN", { maximumSignificantDigits: 11 });
const format = value => formatter.format(value);
form.addEventListener("submit", event => {
  event.preventDefault();
  const data = new FormData(form);
  if (model.kind === "conversion") {
    const value = Number(data.get("quantity"));
    const answer = convert(value, model, Number(data.get("localSize")));
    result.textContent = Number.isFinite(answer)
      ? `${format(value)} ${model.from} = ${format(answer)} ${model.to}` : "Enter a smaller value.";
    return;
  }
  const estimate = flooring(model.length, model.width, Number(data.get("coverage")), Number(data.get("waste")));
  result.textContent = `${format(estimate.area)} sq ft before allowance · ${format(estimate.adjusted)} sq ft including allowance · ${format(estimate.packs)} boxes`;
});
form.addEventListener("input", () => { result.textContent = "Calculate again to update your result."; });
form.querySelector("fieldset").disabled = false;
