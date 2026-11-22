import type { InputField } from "./calculators/calculator";
import { purchaseTools } from "../public/purchase-estimate.mjs";
import { Markup } from "./legacy-content";
import { canonicalPath } from "./site";

type Purchase = (typeof purchaseTools)[keyof typeof purchaseTools];

const escape = (value: unknown) => String(value).replace(/[&<>"']/g, char => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[char]!);

function formField(field: InputField) {
  const { key, label, defaultValue, unitLabel, hint, type, options, min, max, step } = field;
  const id = "input-" + key;
  const attributes = `id="${escape(id)}" name="${escape(key)}"${hint ? ` aria-describedby="${escape(id)}-hint"` : ""}`;
  let input;
  if (type === "select") {
    input = `<select ${attributes} required>${(options || []).map(option => `<option value="${escape(option.value)}"${String(defaultValue) === String(option.value) ? " selected" : ""}>${escape(option.label)}</option>`).join("")}</select>`;
  } else if (type === "checkbox") {
    input = `<input ${attributes} type="checkbox"${defaultValue ? " checked" : ""}>`;
  } else {
    input = `<input ${attributes} type="number" inputmode="decimal" required step="${escape(step === 1 ? 1 : "any")}"${min == null ? "" : ` min="${escape(min)}"`}${max == null ? "" : ` max="${escape(max)}"`} value="${escape(defaultValue ?? "")}">`;
  }
  return `<div class="field"><label for="${escape(id)}">${escape(label)}${unitLabel ? ` (${escape(unitLabel)})` : ""}</label>${input}${hint ? `<small id="${escape(id)}-hint">${escape(hint)}</small>` : ""}</div>`;
}

function purchaseFields(config?: Purchase) {
  if (!config) return "";
  const bag = config.unit === "bag";
  return `<fieldset class="purchase-fields"><legend>Optional purchase estimate</legend>
    ${bag ? '<div class="field"><label for="purchase-capacity">Bag volume (L)</label><input id="purchase-capacity" name="purchase-capacity" type="number" inputmode="decimal" min="0.01" max="10000" step="any" placeholder="40"></div>' : ""}
    <div class="field"><label for="purchase-price">Price per ${config.unit}</label><input id="purchase-price" name="purchase-price" type="number" inputmode="decimal" min="0" max="100000000" step="any"></div>
    <div class="field"><label for="purchase-delivery">Delivery charge</label><input id="purchase-delivery" name="purchase-delivery" type="number" inputmode="decimal" min="0" max="100000000" step="any"></div>
    <div class="field"><label for="purchase-currency">Currency</label><select id="purchase-currency" name="purchase-currency"><option value="INR">INR</option><option value="USD">USD</option><option value="EUR">EUR</option><option value="GBP">GBP</option></select></div>
  </fieldset>`;
}

function supplierSection(config?: Purchase) {
  if (!config) return "";
  const affiliate = process.env[config.affiliateEnv]?.trim();
  const target = new URL(affiliate || config.supplierUrl);
  if (target.protocol !== "https:" || target.username || target.password) {
    throw new Error(config.affiliateEnv + " must be an HTTPS URL without credentials.");
  }
  return `<section id="purchase-supplier" class="card purchase-supplier" aria-labelledby="supplier-heading" hidden>
    <h2 id="supplier-heading">Check supplier options</h2>
    <p>${escape(config.supplierNote)}</p>
    ${affiliate ? "<p>Affiliate disclosure: MeasureForge may earn a commission if you buy through this link.</p>" : ""}
    <p><a href="${escape(target.href)}" data-supplier="${affiliate ? "affiliate" : "direct"}"${affiliate ? ' rel="sponsored"' : ""}>${affiliate ? "Visit supplier (affiliate link)" : escape(config.supplierName)} ↗</a></p>
  </section>`;
}

function getPurchase(slug: string) {
  return Object.entries(purchaseTools).find(([key]) => key === slug)?.[1];
}

export function CalculatorForm({ tool }: { tool: { slug: string; inputs: InputField[] } }) {
  const purchase = getPurchase(tool.slug);
  return <Markup html={`  <div class="grid">
    <form class="card" id="tool-form" data-tool="${escape(tool.slug)}">
      <fieldset disabled><legend>Enter measurements</legend>${tool.inputs.map(formField).join("")}${purchaseFields(purchase)}<button class="btn">Calculate</button></fieldset>
    </form>
    <div class="card"><h2 class="page-title">Result</h2><div id="tool-result" role="status">Enter measurements to calculate a result.</div></div>
  </div>
  ${supplierSection(purchase)}
  <noscript><p>JavaScript is required to run the calculator. The formula and worked examples are below.</p></noscript>
`} />;
}

export function BuyingGuides({ slug }: { slug: string }) {
  const purchase = getPurchase(slug);
  if (!purchase) return null;
  return <><h2>Buying guides</h2><ul>{purchase.guides.map(([path, label]) =>
    <li key={path}><a href={canonicalPath("/" + path)}>{label}</a></li>
  )}</ul></>;
}
