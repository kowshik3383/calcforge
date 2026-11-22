const text = (key, label, value = "", required = true) => ({ key, label, value, required, type: "text" });
const number = (key, label, value, min = 0, max = 1000000, step = "any") =>
  ({ key, label, value, type: "number", required: true, min, max, step });
const select = (key, label, options) => ({ key, label, value: Object.keys(options)[0], options, type: "select" });
const date = { key: "date", label: "Date", value: "", type: "date" };
const group = (key, label, singular, fields, initial = 1) => ({ key, label, singular, fields, initial });
const dimensions = (unit, length, width, minimum = 0.01) => [
  number("length", `Length (${unit})`, length, minimum),
  number("width", `Width (${unit})`, width, minimum),
];
const numberFormat = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const n = value => numberFormat.format(value);
const moneyUnits = { INR: "INR (₹)", USD: "USD ($)", GBP: "GBP (£)", EUR: "EUR (€)" };
const money = (value, currency) => new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(value);
const table = (title, headings, rows) => ({ title, headings, rows });
const rectangle = (x, y, width, height, label, kind = "area") => ({ x, y, width, height, label, kind });
const drawing = (title, width, height, shapes, unit) => ({ title, width, height, shapes, unit });
const ceil = value => Math.ceil(Number(value.toPrecision(12)));

export const landUnits = {
  m2: ["Square metres", 1],
  ft2: ["Square feet", 0.09290304],
  yd2: ["Square yards / gaj", 0.83612736],
  acre: ["Acres", 4046.8564224],
  hectare: ["Hectares", 10000],
  gunta: ["Gunta (1/40 acre)", 101.17141056],
  cent: ["Cent (1/100 acre)", 40.468564224],
  ground: ["Ground (2,400 sq ft)", 222.967296],
  local: ["Local unit (e.g. bigha or kanal)", null],
};

export const rounds = {
  "wa-18": { label: "18 m indoor practice (60 arrows)", arrows: 60, perEnd: 3 },
  "wa-70": { label: "70 m recurve ranking practice (72 arrows)", arrows: 72, perEnd: 6 },
  "short-30": { label: "Short practice (30 arrows)", arrows: 30, perEnd: 3 },
};

export const planners = {
  flooring: {
    steps: ["Measure rooms", "Compare products", "Save estimate"],
    note: "Use the same units throughout. For an L-shaped room, add an adjoining rectangle. Use offsets to place any uncovered rectangle inside the main room.",
    groups: [
      group("rooms", "Rooms", "Room", [text("name", "Room name", "Living room"), ...dimensions("m", 5, 4),
        number("extensionLength", "Extension length (m, optional)", 0), number("extensionWidth", "Extension width (m, optional)", 0),
        number("cutLength", "Uncovered length (m, optional)", 0), number("cutWidth", "Uncovered width (m, optional)", 0),
        number("cutX", "Uncovered offset from left (m)", 0), number("cutY", "Uncovered offset from top (m)", 0)]),
      group("quotes", "Supplier quotes", "Quote", [text("name", "Supplier or product", "Product A"),
        number("coverage", "Coverage per box (m²)", 2.2, 0.001), number("price", "Price per box", 1500),
        number("waste", "Waste allowance (%)", 10, 0, 100), number("delivery", "Delivery", 0)]),
    ],
    options: [select("currency", "Currency", moneyUnits)],
    calculate({ rooms, quotes, currency }) {
      const diagrams = [];
      let area = 0;
      const rows = rooms.map(room => {
        const { name, length, width, extensionLength, extensionWidth, cutLength, cutWidth, cutX, cutY } = room;
        if (Boolean(extensionLength) !== Boolean(extensionWidth) || Boolean(cutLength) !== Boolean(cutWidth)) {
          throw Error(`${name}: enter both dimensions for each extension or uncovered area.`);
        }
        if (cutLength && (cutX + cutLength > length || cutY + cutWidth > width)) {
          throw Error(`${name}: the uncovered area must fit inside the main rectangle.`);
        }
        const net = length * width + extensionLength * extensionWidth - cutLength * cutWidth;
        if (net <= 0) throw Error(`${name}: leave some area to cover.`);
        area += net;
        const shapes = [rectangle(0, 0, length, width, "Main room")];
        if (extensionLength) shapes.push(rectangle(length, 0, extensionLength, extensionWidth, "Extension"));
        if (cutLength) shapes.push(rectangle(cutX, cutY, cutLength, cutWidth, "Uncovered", "excluded"));
        diagrams.push(drawing(name, length + extensionLength, Math.max(width, extensionWidth), shapes, "m"));
        const size = (a, b) => `${n(a)} × ${n(b)} m`;
        return [name, size(length, width), extensionLength ? size(extensionLength, extensionWidth) : "—",
          cutLength ? size(cutLength, cutWidth) : "—", `${n(net)} m²`];
      });
      return { summary: `${n(area)} m² to cover across ${rooms.length} room(s).`, diagrams, tables: [
        table("Room measurements", ["Room", "Main room", "Extension", "Uncovered", "Net area"], rows),
        table("Supplier shopping list", ["Product", "Allow for", "Boxes", "Left over after allowance", "Delivery", "Total", "Coverage per box", "Price per box"],
          quotes.map(quote => {
            const allowed = area * (1 + quote.waste / 100);
            const boxes = ceil(allowed / quote.coverage);
            return [quote.name, `${n(allowed)} m²`, n(boxes),
              `${n(Math.max(0, boxes * quote.coverage - allowed))} m²`,
              money(quote.delivery, currency), money(boxes * quote.price + quote.delivery, currency),
              `${n(quote.coverage)} m²`, money(quote.price, currency)];
          })),
      ] };
    },
  },
  land: {
    steps: ["Measure plots", "Compare and convert", "Save measurement sheet"],
    note: "Enter both front and rear widths and the perpendicular depth. Use surveyed dimensions for irregular plots. For a local unit, enter the square metres per unit from your local record.",
    groups: [group("plots", "Plots", "Plot", [text("name", "Plot or listing", "Plot A"),
      select("unit", "Dimension unit", { ft: "Feet", m: "Metres" }),
      number("front", "Road frontage", 40, 0.01), number("rear", "Rear width", 40, 0.01),
      number("depth", "Perpendicular depth", 60, 0.01),
      number("offset", "Rear left offset (negative moves left)", 0, -1000000),
      text("reference", "Listing or survey reference", "", false)])],
    options: [select("areaUnit", "Compare in", Object.fromEntries(Object.entries(landUnits).map(([key, [label]]) => [key, label]))),
      number("localFactor", "Square metres per local unit (required only for a local unit)", 0),
      text("localLabel", "Local unit name", "bigha")],
    calculate({ plots, areaUnit, localFactor, localLabel }) {
      const [label, fixedFactor] = landUnits[areaUnit];
      if (areaUnit === "local" && localFactor <= 0) throw Error("Enter a positive local conversion factor.");
      const diagrams = [];
      const outputUnit = fixedFactor ? label : localLabel;
      const rows = plots.map(({ name, unit, front, rear, depth, offset, reference }) => {
        const metres = unit === "ft" ? 0.3048 : 1;
        const area = (front + rear) / 2 * depth * metres ** 2;
        const left = Math.min(0, offset);
        const right = Math.max(front, offset + rear);
        diagrams.push(drawing(name + " · road at bottom", right - left, depth, [{
          label: "Plot boundary", kind: "area",
          points: [[offset - left, 0], [offset + rear - left, 0], [front - left, depth], [-left, depth]],
        }], unit));
        return [name, reference || "—", `${n(front)} ${unit}`, `${n(rear)} ${unit}`, `${n(depth)} ${unit}`,
          `${n(area)} m²`, `${n(area / (fixedFactor ?? localFactor))} ${outputUnit}`];
      });
      return { summary: `${plots.length} plot measurement(s). Each estimate assumes parallel front and rear boundaries.`,
        diagrams, tables: [table("Plot measurement sheet", ["Plot", "Reference", "Frontage", "Rear", "Depth", "Area", "Converted area"], rows)] };
    },
  },
  workshop: {
    steps: ["Enter cuts and stock", "Review layouts and costs", "Save cut list"],
    note: "All dimensions are in millimetres. Cuts use a shelf layout with blade kerf between pieces. Rotation is optional to preserve grain direction. Enter previously saved offcuts to reuse them before opening new stock.",
    groups: [
      group("parts", "Cut list", "Part", [text("name", "Part name", "Shelf"), ...dimensions("mm", 500, 300, 1),
        number("quantity", "Quantity", 2, 1, 200, 1),
        select("rotation", "Rotation", { no: "Keep grain direction", yes: "Allow 90° rotation" })]),
      group("stock", "Reusable offcuts", "Offcut", [text("name", "Offcut label", "Offcut A"), ...dimensions("mm", 600, 400, 1)], 0),
      group("hardware", "Hardware", "Item", [text("name", "Item", "Screw"), number("quantity", "Quantity", 8, 1, 100000, 1),
        number("price", "Unit price", 0)], 0),
    ],
    options: [number("sheetLength", "New sheet length (mm)", 2440, 1), number("sheetWidth", "New sheet width (mm)", 1220, 1),
      number("kerf", "Blade kerf (mm)", 3, 0, 100), number("sheetPrice", "New sheet price", 0),
      select("currency", "Currency", moneyUnits)],
    calculate({ parts, stock, hardware, sheetLength, sheetWidth, kerf, sheetPrice, currency }) {
      const sheets = stock.map(({ name, length, width }) => ({ name, length, width, rows: [], reused: true }));
      const totalParts = parts.reduce((sum, part) => sum + part.quantity, 0);
      if (totalParts > 300) throw Error("Use up to 300 pieces per project.");
      const ordered = [...parts].sort((a, b) => Math.max(b.length, b.width) - Math.max(a.length, a.width));
      let newSheets = 0;
      const unplaced = [];
      for (const part of ordered) {
        let remaining = part.quantity;
        while (remaining > 0) {
          if (!sheets.some(sheet => placeCut(sheet, part, kerf))) {
            const sheet = { name: `Sheet ${newSheets + 1}`, length: sheetLength, width: sheetWidth, rows: [], reused: false };
            if (!placeCut(sheet, part, kerf)) {
              unplaced.push([part.name, n(remaining)]);
              break;
            }
            sheets.push(sheet);
            newSheets++;
          }
          remaining--;
        }
      }
      const diagrams = [];
      const offcuts = [];
      const layout = [];
      function record(sheet, shapes, x, y, length, width) {
        if (length <= 0 || width <= 0) return;
        offcuts.push([sheet.name, n(length), n(width)]);
        shapes.push(rectangle(x, y, length, width, "Offcut", "offcut"));
      }
      for (const sheet of sheets) {
        const shapes = [];
        for (const row of sheet.rows) {
          shapes.push(...row.cuts);
          for (const cut of row.cuts) layout.push([sheet.name, cut.label, `${n(cut.width)} × ${n(cut.height)}`,
            `${n(cut.x)}, ${n(cut.y)}`]);
          const x = row.end + kerf;
          record(sheet, shapes, x, row.y, sheet.length - x, row.height);
        }
        const last = sheet.rows.at(-1);
        const y = last ? last.y + last.height + kerf : 0;
        record(sheet, shapes, 0, y, sheet.length, sheet.width - y);
        if (last) diagrams.push(drawing(sheet.name, sheet.length, sheet.width, shapes, "mm"));
      }
      const hardwareCost = hardware.reduce((sum, item) => sum + item.quantity * item.price, 0);
      return { summary: `${newSheets} new sheet(s) and ${sheets.filter(sheet => sheet.reused && sheet.rows.length).length} reused offcut(s). Estimated stock and hardware cost ${money(newSheets * sheetPrice + hardwareCost, currency)}.`,
        diagrams, tables: [
          table("Cut list", ["Part", "Size (mm)", "Quantity"], parts.map(part => [part.name, `${n(part.length)} × ${n(part.width)}`, n(part.quantity)])),
          table("Cuts that need larger stock", ["Part", "Unplaced"], unplaced),
          table("Rectangular offcuts to keep", ["Source", "Length (mm)", "Width (mm)"], offcuts),
          table("Hardware", ["Item", "Quantity", "Cost"], hardware.map(item => [item.name, n(item.quantity), money(item.quantity * item.price, currency)])),
          table("Sheet placement", ["Stock", "Part", "Cut size (mm)", "Left and top offsets (mm)"], layout),
        ] };
    },
  },
  garden: {
    steps: ["Plan beds", "Review planting and materials", "Save garden records"],
    note: "The sketch uses a rectangular grid. A planting position uses one spacing interval in each direction. Choose the actual soil and mulch depths you need to add.",
    groups: [group("beds", "Garden beds", "Bed", [text("name", "Bed name", "Bed A"), text("crop", "Crop", "Lettuce"),
      ...dimensions("m", 2, 1), number("plantSpacing", "In-row spacing (cm)", 25, 1),
      number("rowSpacing", "Between-row spacing (cm)", 30, 1),
      number("seedsPerSite", "Seeds per position", 1, 1, 100, 1),
      number("soil", "Soil depth to add (cm)", 20), number("mulch", "Mulch depth to add (cm)", 5),
      date, text("notes", "Planting notes", "", false)])],
    options: [number("extra", "Extra seed allowance (%)", 10, 0, 100)],
    calculate({ beds, extra }) {
      let seeds = 0;
      let soil = 0;
      let mulch = 0;
      const diagrams = [];
      const rows = beds.map(bed => {
        const across = Math.floor(Number((bed.length * 100 / bed.plantSpacing).toPrecision(12)));
        const down = Math.floor(Number((bed.width * 100 / bed.rowSpacing).toPrecision(12)));
        const count = across * down;
        const seedCount = ceil(count * bed.seedsPerSite * (1 + extra / 100));
        const soilLitres = bed.length * bed.width * bed.soil * 10;
        const mulchLitres = bed.length * bed.width * bed.mulch * 10;
        seeds += seedCount;
        soil += soilLitres;
        mulch += mulchLitres;
        const shapes = [rectangle(0, 0, bed.length, bed.width, bed.crop)];
        if (count <= 180) {
          for (let row = 0; count && row < down; row++) {
            for (let col = 0; col < across; col++) {
              shapes.push({ kind: "plant", x: (col + 0.5) * bed.plantSpacing / 100,
                y: (row + 0.5) * bed.rowSpacing / 100, radius: Math.min(bed.plantSpacing, bed.rowSpacing) / 500 });
            }
          }
        }
        diagrams.push(drawing(`${bed.name} · ${n(down)} rows × ${n(across)} positions`, bed.length, bed.width, shapes, "m"));
        return [bed.name, bed.crop, bed.date || "—", n(count), n(seedCount), `${n(soilLitres)} L`, `${n(mulchLitres)} L`, bed.notes || "—"];
      });
      return { summary: `${n(seeds)} seeds, ${n(soil)} L soil and ${n(mulch)} L mulch.`,
        diagrams, tables: [table("Planting and materials record", ["Bed", "Crop", "Date", "Positions", "Seeds", "Soil", "Mulch", "Notes"], rows)] };
    },
  },
  archery: {
    steps: ["Enter arrow scores", "Review scorecard", "Save and share"],
    note: "Enter one end per row. Use 0–10, X for an inner ten, or M for a miss. A personal best requires a complete round for the same archer and preset.",
    groups: [group("ends", "Ends", "End", [text("scores", "Arrow scores separated by spaces or commas")])],
    options: [text("archer", "Archer name", "Archer"), text("club", "Club or event", "", false), date,
      select("round", "Round preset", Object.fromEntries(Object.entries(rounds).map(([key, round]) => [key, round.label])))],
    calculate({ ends, archer, club, date: roundDate, round }) {
      const preset = rounds[round];
      let arrowCount = 0;
      let score = 0;
      let innerTens = 0;
      const rows = ends.map(({ scores }, index) => {
        const arrows = scores.trim().toUpperCase().split(/[\s,]+/);
        if (arrows.some(arrow => !/^(?:[0-9]|10|X|M)$/.test(arrow)) || arrows.length > preset.perEnd
          || (arrows.length < preset.perEnd && index !== ends.length - 1)) {
          throw Error(`End ${index + 1}: enter ${preset.perEnd} legal arrow scores, or leave the final end incomplete.`);
        }
        const total = arrows.reduce((sum, arrow) => sum + (arrow === "X" ? 10 : arrow === "M" ? 0 : Number(arrow)), 0);
        arrowCount += arrows.length;
        score += total;
        innerTens += arrows.filter(arrow => arrow === "X").length;
        return [String(index + 1), arrows.join(" · "), String(total), String(score)];
      });
      if (arrowCount > preset.arrows) throw Error(`This preset allows at most ${preset.arrows} arrows.`);
      const summary = `${archer}${club ? " · " + club : ""}${roundDate ? " · " + roundDate : ""} · ${preset.label} · ${score}/${preset.arrows * 10} · ${arrowCount}/${preset.arrows} arrows · ${innerTens} Xs`;
      return { summary, tables: [table("End scores", ["End", "Arrows", "End score", "Running total"], rows)],
        record: { archer, round, score, innerTens, complete: arrowCount === preset.arrows } };
    },
  },
};

function placeCut(sheet, part, kerf) {
  const orientations = [[part.length, part.width]];
  if (part.rotation === "yes" && part.length !== part.width) orientations.push([part.width, part.length]);
  for (const [length, width] of orientations) {
    for (const row of sheet.rows) {
      const x = row.end + kerf;
      if (x + length <= sheet.length && width <= row.height) {
        row.cuts.push(rectangle(x, row.y, length, width, part.name));
        row.end = x + length;
        return true;
      }
    }
  }
  const last = sheet.rows.at(-1);
  const y = last ? last.y + last.height + kerf : 0;
  for (const [length, width] of orientations) {
    if (length > sheet.length || y + width > sheet.width) continue;
    sheet.rows.push({ y, height: width, end: length, cuts: [rectangle(0, y, length, width, part.name)] });
    return true;
  }
  return false;
}

export function projectDefaults(config) {
  return Object.fromEntries([
    ...config.options.map(field => [field.key, field.value]),
    ...config.groups.map(({ key, fields, initial }) => [
      key, Array.from({ length: initial }, () => rowDefaults(fields)),
    ]),
  ]);
}

export function rowDefaults(fields) {
  return Object.fromEntries(fields.map(field => [field.key, field.value]));
}
