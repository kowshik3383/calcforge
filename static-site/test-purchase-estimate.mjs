import assert from "node:assert/strict";
import { purchaseEstimate } from "./purchase-estimate.mjs";

const floor = purchaseEstimate({ required: 24, unitCapacity: 2.2, quantity: 12, price: 900, delivery: 500 });
assert.equal(floor.quantity, 12);
assert.ok(Math.abs(floor.extra - 2.4) < 1e-10);
assert.equal(floor.total, 11300);

assert.deepEqual(purchaseEstimate({ required: 500, unitCapacity: 40, price: 300, delivery: 100 }),
  { quantity: 13, extra: 20, total: 4000 });
assert.equal(purchaseEstimate({ required: 0.3, unitCapacity: 0.1 }).quantity, 3);
assert.equal(purchaseEstimate({ required: 500, unitCapacity: 40 }).total, undefined);
assert.equal(purchaseEstimate({ required: 500, unitCapacity: 40, price: 0 }).total, 0);
assert.equal(purchaseEstimate({ required: 500, unitCapacity: 0 }), null);
assert.equal(purchaseEstimate({ required: 500, unitCapacity: 40, price: -1 }), null);
console.log("Flooring and soil purchase estimates passed.");
