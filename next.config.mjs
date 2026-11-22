import { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD } from "next/constants.js";
import { prepareLegacy } from "./scripts/prepare-legacy.mjs";

export default async function config(phase) {
  if (phase === PHASE_DEVELOPMENT_SERVER || phase === PHASE_PRODUCTION_BUILD) {
    await prepareLegacy();
  }
  return {
    output: "export",
    images: { unoptimized: true },
    devIndicators: false,
  };
}
