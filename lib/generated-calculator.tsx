import type { Model } from "./new-calculations";

export function GeneratedCalculator({ model, exampleInput }: { model: Model; exampleInput?: number }) {
  return <>
    <div className="grid">
      <form className="card" id="generated-calculator" data-model={JSON.stringify(model)}>
        <fieldset disabled>
          <legend>Enter measurements</legend>
          {model.kind === "conversion" ? <>
            <div className="field"><label htmlFor="quantity">Value in {model.from}</label>
              <input id="quantity" name="quantity" type="number" inputMode="decimal" defaultValue={exampleInput}
                step="any" min={model.offset === 0 ? 0 : undefined} required /></div>
            {model.variable && <div className="field"><label htmlFor="local-size">Documented {model.to} per bigha</label>
              <input id="local-size" name="localSize" type="number" inputMode="decimal" min="0.000000001" step="any" required /></div>}
          </> : <>
            <div className="field"><label htmlFor="coverage">Coverage per box (sq ft)</label>
              <input id="coverage" name="coverage" type="number" inputMode="decimal" min="0.01"
                step="any" defaultValue={model.coverage} required /></div>
            <div className="field"><label htmlFor="waste">Cutting allowance (%)</label>
              <input id="waste" name="waste" type="number" inputMode="decimal" min="0" max="100"
                step="any" defaultValue={model.waste} required /></div>
          </>}
          <button className="btn">Calculate</button>
        </fieldset>
      </form>
      <div className="card"><h2>Result</h2><div id="generated-result" role="status">Enter measurements to calculate a result.</div></div>
    </div>
    <script type="module" src="/generated-calculator.mjs" />
  </>;
}
