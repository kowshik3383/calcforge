"use strict";

const menuButton = document.querySelector("#menu-toggle");
const menu = document.querySelector("#main-menu");
const narrow = matchMedia("(max-width: 780px)");

function updateMenu(open = false) {
  menuButton.hidden = !narrow.matches;
  menuButton.setAttribute("aria-expanded", String(open));
  menu.hidden = narrow.matches && !open;
}

menuButton.addEventListener("click", () => updateMenu(menu.hidden));
menuButton.closest("nav").addEventListener("keydown", (event) => {
  if (event.key === "Escape" && narrow.matches && !menu.hidden) {
    updateMenu();
    menuButton.focus();
  }
});
narrow.addEventListener("change", () => {
  const focusWasInMenu = menu.contains(document.activeElement);
  updateMenu();
  if (narrow.matches && focusWasInMenu) menuButton.focus();
});
updateMenu();

const ticker = document.querySelector("[data-ticker]");
if (ticker) {
  const reduction = matchMedia("(prefers-reduced-motion: reduce)");
  const updateTicker = () => {
    ticker.hidden = reduction.matches;
    ticker.parentElement.classList.toggle("animated", !reduction.matches);
  };
  updateTicker();
  reduction.addEventListener("change", updateTicker);
  ticker.addEventListener("click", () => {
    const paused = ticker.parentElement.classList.toggle("paused");
    ticker.setAttribute("aria-pressed", String(paused));
  });
}

const toast = document.querySelector("#toast");
let toastTimer;
function notify(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toastTimer = setTimeout(() => { toast.textContent = ""; }, 5000);
}

function fieldError(field) {
  const rule = field.validity;
  if (rule.badInput) return "Enter a number.";
  if (rule.valueMissing || !field.value.trim()) return "Fill in this field.";
  if (rule.typeMismatch) return "Enter an email address such as name@example.com.";
  if (rule.rangeUnderflow || rule.rangeOverflow) {
    return `Enter a value between ${field.min} and ${field.max}.`;
  }
  if (field.minLength > 0 && field.value.trim().length < field.minLength) {
    return `Enter at least ${field.minLength} characters.`;
  }
  return rule.valid ? "" : field.validationMessage;
}

function validate(field) {
  const message = fieldError(field);
  document.getElementById(`${field.id}-error`).textContent = message;
  if (message) field.setAttribute("aria-invalid", "true");
  else field.removeAttribute("aria-invalid");
  return !message;
}

function bindForm(form, onValid) {
  form.noValidate = true;
  form.querySelector("fieldset").disabled = false;
  const fields = [...form.querySelectorAll("input, textarea, select")];
  fields.forEach((field) => {
    field.addEventListener("input", () => {
      if (field.hasAttribute("aria-invalid")) validate(field);
    });
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const invalid = fields.filter((field) => !validate(field));
    if (invalid.length) {
      invalid[0].focus();
      return;
    }
    onValid(new FormData(form));
  });
}

const displayNumber = new Intl.NumberFormat(undefined, { maximumSignificantDigits: 10 });
const format = (number) => displayNumber.format(number);
function wholePacks(quotient) {
  const nearest = Math.round(quotient);
  const roundingNoise = Number.EPSILON * Math.abs(quotient) * 4;
  return Math.max(1, Math.abs(quotient - nearest) <= roundingNoise ? nearest : Math.ceil(quotient));
}

document.querySelectorAll("[data-calculator]").forEach((form) => {
  const type = form.dataset.calculator;
  const result = document.getElementById(`${type}-result`);
  form.addEventListener("input", () => {
    if (result.dataset.calculated) {
      result.textContent = "Calculate again to update your result.";
      delete result.dataset.calculated;
    }
  });
  bindForm(form, (data) => {
    if (type === "field") {
      const area = Number(data.get("length")) * Number(data.get("width"));
      result.textContent = `${format(area)} m² · ${format(area / 10000)} ha · ${format(area / 4046.8564224)} ac`;
    } else {
      const adjusted = Number(data.get("area")) * (1 + Number(data.get("waste")) / 100);
      const packs = wholePacks(adjusted / Number(data.get("coverage")));
      result.textContent = `${packs.toLocaleString()} ${packs === 1 ? "pack" : "packs"} · ${format(adjusted)} m² including waste`;
    }
    result.dataset.calculated = "true";
    document.dispatchEvent(new CustomEvent("calcforge:calculation", { detail: { tool: type } }));
  });
});

const filters = document.querySelector("#filters");
if (filters) {
  const search = document.querySelector("#search");
  const category = document.querySelector("#category");
  const status = document.querySelector("#guide-status");
  const guides = [...document.querySelectorAll("#guides article")];
  const groups = [...document.querySelectorAll("[data-guide-group]")];
  const keywords = guides.map((guide) =>
    `${guide.textContent} ${guide.dataset.search || ""}`.toLowerCase()
  );
  function filterGuides() {
    const terms = search.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
    let visible = 0;
    guides.forEach((guide, index) => {
      const copy = keywords[index];
      guide.hidden = (category.value && category.value !== guide.dataset.category)
        || terms.some((term) => !copy.includes(term));
      if (!guide.hidden) visible += 1;
    });
    groups.forEach((group) => { group.hidden = !group.querySelector('article:not([hidden])'); });
    status.textContent = visible
      ? `${visible} ${visible === 1 ? "guide" : "guides"} found.`
      : "No guides match. Try fewer words or choose All categories.";
  }
  filters.hidden = false;
  search.addEventListener("input", filterGuides);
  category.addEventListener("change", filterGuides);
  document.querySelectorAll('.guide-categories a').forEach((link) => {
    link.addEventListener('click', () => {
      category.value = '';
      search.value = '';
      filterGuides();
    });
  });
  filterGuides();
}

const catalogFilter = document.querySelector("[data-catalog-filter]");
if (catalogFilter) {
  const input = catalogFilter.querySelector("input");
  const status = catalogFilter.querySelector('[role="status"]');
  const groups = [...document.querySelectorAll("#catalog .guide-group")].map(section => ({
    section,
    items: [...section.querySelectorAll("li")].map(item => ({
      item,
      keywords: (item.textContent + " " + item.querySelector("a").dataset.search).toLowerCase(),
    })),
  }));
  catalogFilter.hidden = false;
  input.addEventListener("input", () => {
    const terms = input.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
    let count = 0;
    for (const { section, items } of groups) {
      let visible = 0;
      for (const { item, keywords } of items) {
        item.hidden = !terms.every(term => keywords.includes(term));
        if (!item.hidden) visible++;
      }
      section.hidden = visible === 0;
      count += visible;
    }
    status.textContent = count ? `${count} matching calculators` : "No matching calculators.";
  });
}
