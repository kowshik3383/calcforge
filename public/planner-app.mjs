import { planners, projectDefaults, rounds, rowDefaults } from "./planner-models.mjs";

const root = document.querySelector("[data-planner]");
const slug = root.dataset.planner;
const config = planners[slug];
const storageKey = `measureforge.planner.${slug}.v1`;
let projects = [];
let storageAvailable = true;
try {
  const saved = JSON.parse(localStorage.getItem(storageKey) ?? "[]");
  if (Array.isArray(saved)) projects = saved;
} catch {
  storageAvailable = false;
}
let activeId = null;
let title = "";
let data = projectDefaults(config);
let step = 0;
let result;
let fieldId = 0;

function element(tag, value, className) {
  const node = document.createElement(tag);
  if (value) node.textContent = value;
  if (className) node.className = className;
  return node;
}

function button(label, action, className = "outline") {
  const node = element("button", label, `btn ${className}`);
  node.type = "button";
  node.addEventListener("click", action);
  return node;
}

const bar = element("div", "", "planner-actions planner-controls");
const savedLabel = element("label", "Saved projects");
const savedSelect = element("select");
savedSelect.id = "planner-saved";
savedLabel.htmlFor = savedSelect.id;
const savedField = element("div");
savedField.append(savedLabel, savedSelect);
const remove = button("Delete saved project", deleteProject);
bar.append(savedField, button("Open project", openProject), button("New project", startProject), remove);
savedSelect.addEventListener("change", () => { remove.disabled = !savedSelect.value; });
const nav = element("ol", "", "planner-steps planner-controls");
const panel = element("section");
const status = element("p", "", "planner-controls");
status.setAttribute("role", "status");
root.append(bar, nav, panel, status);
refreshSaved();
showStep(0, false);
if (!storageAvailable) status.textContent = "Saved projects are unavailable in this browser.";

function refreshSaved() {
  const empty = element("option", projects.length ? "Choose a project" : "No saved projects");
  empty.value = "";
  savedSelect.replaceChildren(empty);
  for (const project of projects) {
    const option = element("option", project.title);
    option.value = project.id;
    savedSelect.append(option);
  }
  savedSelect.value = activeId ?? "";
  remove.disabled = !savedSelect.value;
}

function openProject() {
  const project = projects.find(item => item.id === savedSelect.value);
  if (!project) return;
  activeId = project.id;
  title = project.title;
  data = structuredClone(project.data);
  showStep(0);
  status.textContent = `Opened ${title}.`;
}

function deleteProject() {
  const project = projects.find(item => item.id === savedSelect.value);
  if (!project || !window.confirm(`Delete “${project.title}” from this device?`)) return;
  const updated = projects.filter(item => item.id !== project.id);
  try {
    localStorage.setItem(storageKey, JSON.stringify(updated));
  } catch {
    status.textContent = "Could not delete the saved project.";
    return;
  }
  projects = updated;
  if (activeId === project.id) startProject();
  else refreshSaved();
  status.textContent = `Deleted ${project.title}.`;
}

function startProject() {
  activeId = null;
  title = "";
  data = projectDefaults(config);
  refreshSaved();
  showStep(0);
  status.textContent = "Started a new project.";
}

function showStep(index, focus = true) {
  step = index;
  status.textContent = "";
  nav.replaceChildren(...config.steps.map((label, position) => {
    const item = element("li", `${position + 1}. ${label}`);
    if (position === step) item.setAttribute("aria-current", "step");
    return item;
  }));
  panel.replaceChildren();
  const heading = element("h2", config.steps[step], "planner-heading");
  heading.tabIndex = -1;
  panel.append(heading);
  if (step === 0) {
    if (slug === "archery") renderHistory();
    renderForm();
  }
  else if (step === 1) renderReview();
  else renderSave();
  if (focus) heading.focus();
}

function renderField(field, entry) {
  const container = element("div", "", "field");
  const label = element("label", field.label);
  const input = element(field.type === "select" ? "select" : "input");
  input.id = `planner-field-${++fieldId}`;
  label.htmlFor = input.id;
  if (field.type === "select") {
    for (const [key, name] of Object.entries(field.options)) {
      const option = element("option", name);
      option.value = key;
      input.append(option);
    }
  } else {
    input.type = field.type;
    input.required = Boolean(field.required);
    if (field.type === "number") {
      input.min = field.min;
      input.max = field.max;
      input.step = field.step;
    } else if (field.type === "text") {
      input.maxLength = 160;
    }
  }
  input.value = entry[field.key];
  input.addEventListener("input", () => {
    entry[field.key] = field.type === "number" && input.value !== "" ? input.valueAsNumber : input.value;
    if (field.type === "text") input.setCustomValidity("");
  });
  if (field.type === "text" && field.required) {
    input.addEventListener("change", () => {
      input.setCustomValidity(input.value.trim() ? "" : "Enter a value.");
    });
  }
  container.append(label, input);
  return container;
}

function renderForm() {
  const form = element("form");
  const error = element("p", "", "error");
  error.setAttribute("role", "alert");
  form.append(element("p", config.note, "intro"));
  const options = element("div", "", "planner-fields");
  for (const field of config.options) options.append(renderField(field, data));
  form.append(options);
  for (const group of config.groups) {
    const section = element("section", "", "planner-group");
    const rows = element("div");
    const add = button(`Add ${group.singular.toLowerCase()}`, () => {
      if (data[group.key].length >= 80) return;
      data[group.key].push(rowDefaults(group.fields));
      refreshRows();
      rows.lastElementChild?.querySelector("input, select")?.focus();
    });

    function refreshRows() {
      rows.replaceChildren();
      data[group.key].forEach((entry, index) => {
        const fieldset = element("fieldset", "", "planner-row");
        const fields = element("div", "", "planner-fields");
        fieldset.append(element("legend", `${group.singular} ${index + 1}`));
        for (const field of group.fields) fields.append(renderField(field, entry));
        fieldset.append(fields);
        if (data[group.key].length > Math.min(group.initial, 1)) {
          fieldset.append(button(`Remove ${group.singular.toLowerCase()} ${index + 1}`, () => {
            data[group.key].splice(index, 1);
            refreshRows();
            add.focus();
          }));
        }
        rows.append(fieldset);
      });
      add.disabled = data[group.key].length >= 80;
    }

    section.append(element("h3", group.label), rows, add);
    form.append(section);
    refreshRows();
  }
  const submit = element("button", config.steps[1], "btn");
  submit.type = "submit";
  form.append(error, submit);
  form.addEventListener("submit", event => {
    event.preventDefault();
    try {
      result = config.calculate(data);
      showStep(1);
    } catch (failure) {
      error.textContent = failure.message;
      error.tabIndex = -1;
      error.focus();
    }
  });
  panel.append(form);
}

function renderReview() {
  renderResult(panel, result);
  const actions = element("div", "", "planner-actions planner-controls");
  actions.append(button("Back to inputs", () => showStep(0)), button(config.steps[2], () => showStep(2), ""));
  panel.append(actions);
}

function renderResult(target, report) {
  target.append(element("p", report.summary, "result"));
  if (report.record) appendPersonalBest(target, report.record);
  renderTables(target, report.tables);
  if (report.diagrams?.length) {
    const diagrams = element("div", "", "planner-diagrams");
    for (const diagram of report.diagrams) diagrams.append(renderDiagram(diagram));
    target.append(diagrams);
  }
}

function renderHistory() {
  const records = projects.filter(project => project.record);
  if (!records.length) return;
  const history = element("details");
  history.append(element("summary", `Practice history (${records.length})`));
  renderTables(history, [{
    title: "Saved rounds", headings: ["Project", "Archer", "Date", "Preset", "Score", "Status"],
    rows: records.map(({ title, data, record }) => [title, record.archer, data.date || "—",
      rounds[record.round].label, String(record.score), record.complete ? "Complete" : "In progress"]),
  }]);
  panel.append(history);
}

function renderTables(target, tables) {
  for (const { title: caption, headings, rows } of tables) {
    if (!rows.length) continue;
    const scroll = element("div", "", "planner-table");
    scroll.tabIndex = 0;
    scroll.setAttribute("role", "region");
    scroll.setAttribute("aria-label", caption);
    const table = element("table");
    const head = element("thead");
    const header = element("tr");
    table.append(element("caption", caption), head);
    for (const column of headings) {
      const cell = element("th", column);
      cell.scope = "col";
      header.append(cell);
    }
    head.append(header);
    const body = element("tbody");
    for (const row of rows) {
      const tr = element("tr");
      for (const value of row) tr.append(element("td", String(value)));
      body.append(tr);
    }
    table.append(body);
    scroll.append(table);
    target.append(scroll);
  }
}

function renderDiagram({ title, width, height, shapes, unit }) {
  const figure = element("figure");
  const svg = createSvg("svg", { viewBox: `0 0 ${width} ${height}`, role: "img", "aria-label": title });
  const stock = createSvg("rect", { width, height, class: "planner-stock" });
  svg.append(stock);
  for (const shape of shapes) {
    const attributes = { class: `planner-shape planner-${shape.kind}` };
    let node;
    if (shape.points) {
      node = createSvg("polygon", { ...attributes, points: shape.points.map(point => point.join(",")).join(" ") });
    } else if (shape.kind === "plant") {
      node = createSvg("circle", { ...attributes, cx: shape.x, cy: shape.y, r: shape.radius });
    } else {
      node = createSvg("rect", { ...attributes, x: shape.x, y: shape.y, width: shape.width, height: shape.height });
    }
    if (shape.label) {
      const description = createSvg("title", {});
      description.textContent = shape.label;
      node.append(description);
    }
    svg.append(node);
  }
  figure.append(svg, element("figcaption", `${title} · ${readDimension(width)} × ${readDimension(height)} ${unit}`));
  return figure;
}

function createSvg(name, attributes) {
  const node = document.createElementNS("http://www.w3.org/2000/svg", name);
  for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value);
  return node;
}

function readDimension(value) {
  return Number(value.toFixed(3)).toString();
}

function appendPersonalBest(target, record) {
  const archer = record.archer.trim().toLowerCase();
  const scores = projects.filter(project => project.id !== activeId).map(project => project.record);
  scores.push(record);
  const best = scores.filter(item => item?.complete && item.round === record.round
    && item.archer.trim().toLowerCase() === archer)
    .sort((a, b) => b.score - a.score || b.innerTens - a.innerTens)[0];
  target.append(element("p", best ? `Personal best for this preset: ${best.score} (${best.innerTens} Xs).`
    : "Complete a round to record a personal best for this preset."));
}

function renderSave() {
  const form = element("form", "", "planner-actions planner-controls");
  const label = element("label", "Project name");
  const name = element("input");
  name.id = "planner-name";
  label.htmlFor = name.id;
  name.required = true;
  name.maxLength = 100;
  name.value = title || (slug === "archery" ? `${data.archer} · ${data.date || "Practice"}` : "");
  const field = element("div");
  field.append(label, name);
  const save = element("button", "Save on this device", "btn");
  form.append(field, save, button("Print report", () => window.print()));
  if (slug === "archery") form.append(button("Share scorecard", shareScore));
  form.append(button("Back to review", () => showStep(1)));
  form.addEventListener("submit", event => {
    event.preventDefault();
    const trimmed = name.value.trim();
    if (!trimmed) {
      status.textContent = "Enter a project name.";
      return;
    }
    const id = activeId ?? crypto.randomUUID();
    const project = { id, title: trimmed, data: structuredClone(data), record: result.record };
    const updated = [project, ...projects.filter(item => item.id !== id)];
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
      projects = updated;
      activeId = id;
      title = trimmed;
      reportTitle.textContent = title;
      refreshSaved();
      status.textContent = `Saved ${title} on this device.`;
    } catch {
      status.textContent = "Could not save on this device. You can still print the report.";
    }
  });
  const reportTitle = element("h3", title || name.value);
  name.addEventListener("input", () => { reportTitle.textContent = name.value.trim(); });
  panel.append(form, reportTitle);
  renderResult(panel, result);
}

async function shareScore() {
  const text = [result.summary, ...result.tables[0].rows.map(([end, arrows, score]) =>
    `End ${end}: ${arrows} (${score})`)].join("\n");
  try {
    if (navigator.share) {
      await navigator.share({ title: "Archery scorecard", text });
      return;
    }
    await navigator.clipboard.writeText(text);
    status.textContent = "Scorecard copied to clipboard.";
  } catch (error) {
    if (error.name === "AbortError") return;
    const file = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(file);
    const link = element("a", "Download scorecard");
    link.href = url;
    link.download = "archery-scorecard.txt";
    link.addEventListener("click", () => setTimeout(() => URL.revokeObjectURL(url), 1000), { once: true });
    status.replaceChildren(link);
  }
}
