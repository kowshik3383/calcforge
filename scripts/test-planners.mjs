import assert from "node:assert/strict";
import { planners, projectDefaults } from "../public/planner-models.mjs";

function estimate(slug, updates = {}) {
  const planner = planners[slug];
  return planner.calculate({ ...projectDefaults(planner), ...updates });
}

const flooring = projectDefaults(planners.flooring);
const room = { ...flooring.rooms[0], extensionLength: 2, extensionWidth: 2, cutLength: 1, cutWidth: 1 };
const quotes = [
  { name: "A", coverage: 2.5, price: 100, waste: 0, delivery: 20 },
  { name: "B", coverage: 3, price: 90, waste: 10, delivery: 30 },
];
const floor = estimate("flooring", { rooms: [room, flooring.rooms[0]], quotes });
assert.match(floor.summary, /43 m²/);
assert.equal(floor.diagrams[0].shapes.length, 3);
assert.deepEqual(floor.tables[1].rows.map(row => [row[2], row[5]]), [["18", "₹1,820.00"], ["16", "₹1,470.00"]]);
assert.throws(() => estimate("flooring", { rooms: [{ ...room, cutX: 5 }] }), /must fit/);

assert.equal(estimate("land", { areaUnit: "ft2" }).tables[0].rows[0].at(-1), "2,400 Square feet");
assert.equal(estimate("land", { areaUnit: "local", localFactor: 100 }).tables[0].rows[0].at(-1), "2.23 bigha");
assert.throws(() => estimate("land", { areaUnit: "local" }), /positive local/);

const workshop = estimate("workshop", {
  parts: [{ name: "Door", length: 300, width: 500, quantity: 2, rotation: "yes" }],
  stock: [{ name: "Remnant", length: 500, width: 300 }],
  sheetLength: 500, sheetWidth: 300, sheetPrice: 500,
  hardware: [{ name: "Hinge", quantity: 2, price: 125 }],
});
assert.match(workshop.summary, /1 new sheet\(s\) and 1 reused offcut\(s\).*₹750/);
assert.equal(workshop.diagrams.length, 2);
const tooWide = estimate("workshop", {
  parts: [{ name: "Door", length: 300, width: 500, quantity: 2, rotation: "no" }],
  sheetLength: 500, sheetWidth: 300,
});
assert.deepEqual(tooWide.tables[1].rows, [["Door", "2"]]);

assert.match(estimate("garden").summary, /27 seeds, 400 L soil and 100 L mulch/);
assert.equal(estimate("garden").diagrams[0].shapes.length, 25);

const archery = estimate("archery", {
  round: "short-30", ends: Array.from({ length: 10 }, () => ({ scores: "X, 9, 8" })),
});
assert.equal(archery.record.score, 270);
assert.equal(archery.record.innerTens, 10);
assert.equal(archery.record.complete, true);
assert.equal(estimate("archery", { ends: [{ scores: "10 M" }] }).record.complete, false);
assert.throws(() => estimate("archery", { ends: [{ scores: "11 9 8" }] }), /legal arrow scores/);

console.log("Verified all five planner calculation models.");
