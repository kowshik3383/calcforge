export const publisher = "ca-pub-2022115608131722";
const slot = process.env.ADSENSE_TOOL_SLOT;

export function CalculatorAd() {
  if (!slot || !/^\d+$/.test(slot)) return null;
  return <aside aria-label="Advertisement" className="calculator-ad">
    <ins className="adsbygoogle" style={{ display: "block" }}
      data-ad-client={publisher} data-ad-slot={slot} data-ad-format="horizontal" />
  </aside>;
}
