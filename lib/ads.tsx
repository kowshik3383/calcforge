export const publisher = "ca-pub-2022115608131722";
export const slot = process.env.ADSENSE_TOOL_SLOT;
if (slot && !/^\d+$/.test(slot)) throw new Error("ADSENSE_TOOL_SLOT must be a numeric ad unit ID.");

export function CalculatorAd() {
  if (!slot) return null;
  return <aside aria-label="Advertisement" className="calculator-ad">
    <ins className="adsbygoogle" style={{ display: "block" }}
      data-ad-client={publisher} data-ad-slot={slot} data-ad-format="horizontal" />
  </aside>;
}
