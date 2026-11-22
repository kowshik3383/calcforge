import { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD } from "next/constants.js";
import { prepareAssets } from "./scripts/prepare-assets.mjs";

export default async function config(phase) {
  if (phase === PHASE_DEVELOPMENT_SERVER || phase === PHASE_PRODUCTION_BUILD) {
    await prepareAssets();
  }
  return {
    output: "export",
    images: { unoptimized: true },
    devIndicators: false,
  };
}
