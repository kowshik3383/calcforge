import { ALL_TOOLS } from "../static-site/catalog/tools";
import { convert, flooring, type Model } from "./new-calculations";

type FAQ = { q: string; a: string };
type Example = { title: string; note: string };

export type Tool = {
  slug: string; title: string; h1: string; metaDescription: string;
  primaryKeyword: string; secondaryKeywords: string[]; longTailKeywords: string[];
  commonMisspellings: string[]; regionalTerms: string[];
  formulaText: string; workedExample: Example; faqs: FAQ[];
  relatedTools: string[]; category: string; description: string;
  howItWorks: string[]; examples: Example[]; alsoSearchedAs: string[];
  model?: Model; exampleInput?: number;
};

export const categories = {
  agriculture: { title: "Agriculture and gardening calculators", description: "Plan field measurements, irrigation, planting layouts and garden material quantities." },
  construction: { title: "Construction and flooring calculators", description: "Estimate tile, flooring, wallpaper, paint and other materials before buying." },
  manufacturing: { title: "Workshop and materials calculators", description: "Plan stock lengths, sheet layouts, yields and other workshop measurements." },
  "animal-care": { title: "Animal care calculators", description: "Estimate routine feed quantities using the weight and feeding rate you supply." },
  conversions: { title: "Unit and land area conversions", description: "Convert length, area, volume, mass, temperature and regional Indian land units." },
} as const;

const format = new Intl.NumberFormat("en-IN", { maximumSignificantDigits: 9 });
const unitTerms: Record<string, string[]> = {
  "m²": ["sq m", "square metres", "square meters"],
  "ft²": ["sq ft", "square feet", "sqft"],
  "m³": ["cubic metres", "cubic meters"],
  "ft³": ["cubic feet", "cu ft"],
  L: ["litres", "liters"], ft: ["feet"], m: ["metres", "meters"], acre: ["acres"],
};

function fieldGuide(label: string, unit?: string) {
  if (/coverage|yield/i.test(label)) return "Read coverage on the product label for the actual material and pack size you intend to buy. If the label quotes coverage per coat, per roll or per bag, keep that denominator with your notes.";
  if (/waste|allowance|scrap/i.test(label)) return "Use the allowance you intend to budget for this job. A layout with repeating cuts can leave usable pieces, while a change of direction or a patterned finish can use extra stock.";
  if (/price|cost|delivery/i.test(label)) return "Use a quote for the selected quantity and currency. Keep delivery separate when comparing suppliers, and record whether the price includes tax.";
  if (/depth|height|length|width|diameter|radius|spacing|edge|gap/i.test(label)) return "Measure between the two points that define this dimension. Note where the tape starts and stops so a second person can check the same line, and keep unrounded readings for the calculation.";
  if (unit === "%") return "Enter a percentage as shown on your measurement or plan, such as 10 for ten percent. Keep the percentage basis consistent with the other entries.";
  if (/count|pieces|packs|rolls|rows|trays/i.test(label)) return "Count complete items in the stated group. Keep damaged pieces and stock already committed to another job out of the available count.";
  return "Use the reading from the same sample, product or area as the other inputs. Record its source so you can compare the estimate later if the measurement changes.";
}

function legacyTool(raw: (typeof ALL_TOOLS)[number]): Tool {
  const { slug, category, title, description, inputs, formula } = raw;
  const primaryKeyword = title.toLowerCase();
  const initial = raw.examples[0];
  const values = Object.fromEntries(inputs.map(field => [field.key, initial.inputs[field.key] ?? field.defaultValue ?? 0]));
  const fieldValues = inputs.map(field => `${field.label}: ${typeof values[field.key] === "number" ? format.format(values[field.key] as number) : String(values[field.key])}${field.unitLabel ? " " + field.unitLabel : ""}`);
  const rows = raw.calculate(values).filter(row => row.badge !== "warning" && (typeof row.value !== "number" || Number.isFinite(row.value)));
  const result = rows.map(row => `${row.label}: ${typeof row.value === "number" ? format.format(row.value) : row.value}${row.unit ? " " + row.unit : ""}`).filter(row => row.length < 180).join("; ");
  const example: Example = { title: "Reproduce the calculator example",
    note: `Enter ${fieldValues.join("; ")}. ${result ? "The calculator returns " + result + "." : initial.note} Compare the result with the unit beside its label before copying the number into a worksheet or order.` };
  const first = inputs[0];
  const last = inputs.at(-1)!;
  const unitVariants = [...new Set(inputs.flatMap(field => unitTerms[field.unitLabel || ""] ?? []))];
  const regionalTerms = /field|land|plot|acre|hectare/.test(slug) ? ["gunta", "guntha", "gaj", "square yard"] : [];
  const typo = /wallpaper/.test(slug) ? "wallpapper" : /mulch/.test(slug) ? "mulsh"
    : /hectare/.test(slug) ? "hectre" : /flooring/.test(slug) ? "flouring" : "calculater";
  const misspelledQuery = typo === "calculater" ? primaryKeyword.replace(/calculator$/, typo)
    : primaryKeyword.replace(/wallpaper|mulch|hectare|flooring/, typo);
  const secondaryKeywords = [...new Set([...raw.seo.keywords, ...unitVariants])].filter(term => term.toLowerCase() !== primaryKeyword);
  const faqs = [...raw.faqs.slice(0, 3),
    { q: `What should I enter for ${first.label.toLowerCase()}?`, a: `${first.unitLabel ? "The field expects " + first.unitLabel + ". " : ""}${first.hint ? first.hint.replace(/\.?$/, ".") + " " : ""}${fieldGuide(first.label, first.unitLabel)}` },
    { q: `How can I check ${title.toLowerCase()} with real measurements?`, a: `Start with ${fieldValues.slice(0, 3).join(", ")} from the worked example. Keep the same units when substituting your own measurements. If your estimate differs, check ${last.label.toLowerCase()} and the formula before adjusting the result.` },
    { q: `Can I reuse a ${title.toLowerCase().replace(/ calculator$/, "")} estimate for a second job?`, a: `Keep the first result and make a separate calculation with the second job's ${first.label.toLowerCase()}. For a comparison, write down which values changed and keep the unit and precision consistent. Combine results only when the quantities measure the same thing.` },
  ];
  const howItWorks = [
    `Use this calculation when your plan calls for ${title.toLowerCase().replace(/ calculator$/, "")}. Begin with ${first.label.toLowerCase()}${first.unitLabel ? " in " + first.unitLabel : ""} and check the input labels before transferring figures from a quote, drawing or site note. ${raw.faqs[0]?.a || fieldGuide(first.label, first.unitLabel)}`,
    ...inputs.slice(1, 4).map(field => `${field.label}${field.unitLabel ? " (" + field.unitLabel + ")" : ""}. ${fieldGuide(field.label, field.unitLabel)} ${field.hint ? field.hint.replace(/\.?$/, ".") : ""}`.trim()),
    `Read the example once before changing any values. Then replace the figures with your own readings and repeat the calculation using the smallest and largest plausible values for ${first.label.toLowerCase()}. The spread shows how sensitive the estimate is to that input. If both readings round to the same planning quantity, keep the unrounded result in your notes anyway.`,
    `Record the original units and the value entered for ${last.label.toLowerCase()} alongside the answer. For an order, record the required amount separately from the supplier’s quoted size or minimum so the two quantities stay easy to compare.`,
  ];
  if (regionalTerms.length) howItWorks.push("For land measurements in Telangana, verify whether the record uses acres, gunta (also written guntha) or square yards. A gaj commonly refers to a square yard in property listings, but check that the listing describes area. Convert a recorded area separately before entering it in a field that expects a different unit.");
  const metaDescription = raw.seo.metaDescription.length < 155 && raw.seo.metaDescription.toLowerCase().includes(primaryKeyword)
    ? raw.seo.metaDescription : `Use the ${primaryKeyword} with ${first.label.toLowerCase()}. See the formula, a worked example and measurement checks.`;
  return { slug, category, title, h1: title, description, primaryKeyword, secondaryKeywords,
    longTailKeywords: faqs.map(faq => faq.q), commonMisspellings: [misspelledQuery], regionalTerms,
    formulaText: formula, workedExample: example, examples: [example], faqs, relatedTools: raw.related,
    metaDescription: metaDescription.length < 155 ? metaDescription : `Use the ${primaryKeyword}. Check the formula, a worked example and input units.`,
    howItWorks, alsoSearchedAs: [...new Set([...secondaryKeywords.slice(0, 2), ...unitVariants.slice(0, 3), misspelledQuery])].slice(0, 6),
  };
}

type Conversion = [slug: string, from: string, to: string, multiplier: number, value: number,
  sourceContext: string, destinationContext: string, offset?: number, variable?: true];

const conversions: Conversion[] = [
  ["square-feet-to-square-metres", "square feet", "square metres", 0.09290304, 725, "an apartment floor plan quoted in sq ft", "a flooring pack or finish quoted in m²"],
  ["square-metres-to-square-feet", "square metres", "square feet", 1 / 0.09290304, 84.5, "a metric carpet area on an apartment drawing", "a Hyderabad property comparison quoted in sq ft"],
  ["square-yards-to-square-metres", "square yards", "square metres", 0.83612736, 183, "a Telangana plot listing in square yards (gaj)", "a plan whose area schedule is in square metres"],
  ["square-metres-to-square-yards", "square metres", "square yards", 1 / 0.83612736, 105, "a metric registration or drawing area", "a local comparison corresponding to gaj where the listing denotes square yards"],
  ["square-yards-to-square-feet", "square yards", "square feet", 9, 167, "a plot of 167 square yards", "a contractor's unit rate per square foot"],
  ["square-feet-to-square-yards", "square feet", "square yards", 1 / 9, 1512, "a plot area measured in square feet", "a comparison with plots advertised per square yard"],
  ["acres-to-square-feet", "acres", "square feet", 43560, 1.35, "a parcel recorded as a decimal acre", "a fencing or site brief that lists surface area in square feet"],
  ["square-feet-to-acres", "square feet", "acres", 1 / 43560, 22968, "a surveyed footprint in square feet", "an acreage register for comparing parcel sizes"],
  ["acres-to-hectares", "acres", "hectares", 0.40468564224, 3.75, "a field recorded in acres", "an agricultural table that reports area by hectare"],
  ["hectares-to-acres", "hectares", "acres", 1 / 0.40468564224, 2.46, "a land plan supplied in hectares", "an estimate expressed in acres for a grower"],
  ["square-metres-to-hectares", "square metres", "hectares", 0.0001, 18450, "a mapped field polygon in m²", "an input rate specified per hectare"],
  ["hectares-to-square-metres", "hectares", "square metres", 10000, 0.625, "a fractional hectare bed block", "an irrigation design that uses square metres"],
  ["feet-to-metres", "feet", "metres", 0.3048, 14.75, "a room span measured in decimal feet", "a metric material layout or cut list"],
  ["metres-to-feet", "metres", "feet", 1 / 0.3048, 3.42, "a metric wall measurement", "a drawing that uses decimal feet"],
  ["inches-to-centimetres", "inches", "centimetres", 2.54, 27.5, "an imported product dimension in inches", "a cabinet opening measured in centimetres"],
  ["centimetres-to-inches", "centimetres", "inches", 1 / 2.54, 63, "the width of a tape-measured shelf", "a hardware catalogue dimension in inches"],
  ["millimetres-to-metres", "millimetres", "metres", 0.001, 2860, "a drawing dimension labelled in mm", "a room-length estimate in metres"],
  ["metres-to-millimetres", "metres", "millimetres", 1000, 1.835, "a wall opening measured to three decimal places in metres", "a fabrication drawing in millimetres"],
  ["kilometres-to-miles", "kilometres", "miles", 1 / 1.609344, 28.4, "a route in kilometres", "a mileage sheet using statute miles"],
  ["miles-to-kilometres", "miles", "kilometres", 1.609344, 16.2, "a trip recorded in statute miles", "a route estimate in kilometres"],
  ["litres-to-us-gallons", "litres", "US gallons", 1 / 3.785411784, 115, "the usable fill of a metric tank", "equipment labelled in US liquid gallons"],
  ["us-gallons-to-litres", "US gallons", "litres", 3.785411784, 37, "a container marked in US liquid gallons", "a pump calculation using litres"],
  ["litres-to-imperial-gallons", "litres", "imperial gallons", 1 / 4.54609, 82, "a volume measured in litres", "a UK specification that explicitly uses imperial gallons"],
  ["imperial-gallons-to-litres", "imperial gallons", "litres", 4.54609, 9.5, "an older tank capacity in imperial gallons", "a fill estimate in metric litres"],
  ["cubic-metres-to-litres", "cubic metres", "litres", 1000, 0.735, "the internal volume of a rectangular water tank", "a fill plan in litres"],
  ["litres-to-cubic-metres", "litres", "cubic metres", 0.001, 8650, "a measured water use in litres", "a bulk capacity or delivery estimate in cubic metres"],
  ["cubic-feet-to-cubic-yards", "cubic feet", "cubic yards", 1 / 27, 76, "the total volume of several bed sections", "a supplier quantity quoted by the cubic yard"],
  ["cubic-yards-to-cubic-feet", "cubic yards", "cubic feet", 27, 2.75, "a delivery quote in cubic yards", "a bin or bed volume figure in cubic feet"],
  ["kilograms-to-pounds", "kilograms", "pounds", 1 / 0.45359237, 18.6, "a shipment weight in kg", "a carrier label asking for avoirdupois pounds"],
  ["pounds-to-kilograms", "pounds", "kilograms", 0.45359237, 52.5, "a package label in pounds", "a loading or stock sheet that uses kilograms"],
  ["celsius-to-fahrenheit", "Celsius", "Fahrenheit", 9 / 5, 37, "a temperature reading from a metric sensor", "a thermostat display in degrees Fahrenheit", 32],
  ["fahrenheit-to-celsius", "Fahrenheit", "Celsius", 5 / 9, 95, "a Fahrenheit weather or equipment reading", "a Celsius temperature log", -32 * 5 / 9],
  ["square-inches-to-square-feet", "square inches", "square feet", 1 / 144, 864, "a part surface outlined in square inches", "a stock coverage estimate in square feet"],
  ["square-feet-to-square-inches", "square feet", "square inches", 144, 3.5, "a sheet area in square feet", "a template measured in square inches"],
  ["acres-to-square-yards", "acres", "square yards", 4840, 0.32, "a fractional acre shown on a land schedule", "a local property comparison quoted per square yard"],
  ["square-yards-to-acres", "square yards", "acres", 1 / 4840, 2420, "a surveyed area assembled from several adjacent plots", "a register that stores total acreage"],
  ["centimetres-to-metres", "centimetres", "metres", 0.01, 175.5, "a repeated tape measurement across a seed bed", "a planting plan expressed in metres"],
  ["metres-to-centimetres", "metres", "centimetres", 100, 2.325, "a timber span specified in decimal metres", "a marked cut line on a centimetre scale"],
  ["grams-to-kilograms", "grams", "kilograms", 0.001, 2750, "a small batch weighed on a gram scale", "an inventory total maintained in kilograms"],
  ["kilograms-to-grams", "kilograms", "grams", 1000, 1.825, "a combined order weighed in kilograms", "a small batch worksheet measured in grams"],
  ["litres-to-millilitres", "litres", "millilitres", 1000, 1.275, "a liquid portion recorded as a decimal litre", "a graduated vessel marked in millilitres"],
  ["millilitres-to-litres", "millilitres", "litres", 0.001, 875, "a combined fill measured in millilitres", "a container label stating capacity in litres"],
  ["kilograms-to-tonnes", "kilograms", "tonnes", 0.001, 1375, "a weighbridge net mass in kilograms", "a delivery schedule stated in metric tonnes"],
  ["tonnes-to-kilograms", "tonnes", "kilograms", 1000, 2.35, "a bulk supply contract written in metric tonnes", "a stock log that records individual loads in kilograms"],
];

for (const [from, perAcre, start] of [["gunta", 40, 7.5], ["cent", 100, 18]] as const) {
  for (const [to, per, label] of [["acres", 1, "the acreage column of a land record"],
    ["square feet", 43560, "a site estimate or local quote in sq ft"], ["square metres", 4046.8564224, "a metric area schedule"]] as const) {
    conversions.push([`${from}-to-${to.replaceAll(" ", "-")}`, from, to, per / perAcre,
      start + (to === "square feet" ? 4 : to === "square metres" ? 9 : 0),
      from === "gunta" ? "a Telangana land description using 40 guntas to an acre" : "a land description that defines a cent as one hundredth of an acre", label]);
  }
}
for (const [to, label, count] of [["acres", "an acreage comparison", 2.25],
  ["square feet", "a local area or cost estimate in sq ft", 1.75],
  ["square metres", "a metric plan or measurement report", 3.5]] as const) {
  conversions.push([`bigha-to-${to.replaceAll(" ", "-")}`, "bigha", to, 1, count,
    "a document that gives a local definition of bigha", label, 0, true]);
}
conversions.push(["ground-to-square-feet", "ground", "square feet", 2400, 1.6,
  "a document expressly using the Chennai convention of 2,400 sq ft per ground", "a quote per square foot"]);

function conversionTool(data: Conversion): Tool {
  const [slug, from, to, factor, value, source, destination, offset = 0, variable = false] = data;
  const model = { kind: "conversion", factor, offset, from, to, variable } as const;
  const title = `${from[0].toUpperCase()}${from.slice(1)} to ${to}`;
  const keyword = title.toLowerCase();
  const aliases: Record<string, string> = { "square feet": "sq ft", "square metres": "sq m", "square yards": "sq yd",
    "cubic metres": "m³", "cubic feet": "cu ft", kilograms: "kg", grams: "g", litres: "L", millilitres: "mL" };
  const abbreviated = `${aliases[from] ?? from} to ${aliases[to] ?? to}`;
  const regionalTerms = /gunta|cent|bigha|ground|yard/.test(from) || /square yards/.test(to)
    ? from === "gunta" ? ["gunta", "guntha", "guntalu"] : from === "bigha" ? ["bigha", "बीघा"] : /yard/.test(from + to) ? ["gaj", "gajam", "square yard"] : [from]
    : [];
  const localSize = to === "acres" ? 0.625 : to === "square feet" ? 27225 : 2529.285264;
  const answer = format.format(convert(value, model, localSize));
  const example = { title: `${format.format(value)} ${from} in ${to}`,
    note: variable
      ? `For arithmetic practice only, suppose the record says one bigha equals ${format.format(localSize)} ${to}. Enter the count ${value} and that local size. Multiplying gives ${answer} ${to}. The example size is not a default or a rule for a district.`
      : `Start with ${format.format(value)} ${from} from ${source}. Apply the formula to get ${answer} ${to}. Keep an extra digit in a worksheet if you are chaining another conversion, and round the number you report to match the precision of the original reading.` };
  const formula = variable ? `Bigha count × locally documented ${to} per bigha`
    : from === "Fahrenheit" ? "(°F − 32) × 5 ÷ 9" : from === "Celsius" ? "°C × 9 ÷ 5 + 32"
    : `Multiply ${from} by ${format.format(factor)} to get ${to}`;
  const faqs = [
    { q: `How do I convert ${format.format(value)} ${from} to ${to}?`, a: example.note },
    { q: `When is the ${to} result useful?`, a: `Use it for ${destination}. Retain the original ${from} measurement alongside the converted one so the source figure stays traceable if the result is copied to another document.` },
    { q: variable ? "Which bigha size should I enter?" : `What should I check before converting ${from}?`,
      a: variable ? `Read a survey or official document that defines a local bigha in ${to}. If the document gives a different base unit, convert the area per bigha into ${to} first. Ask the local survey or registration office to confirm a disputed definition.`
        : `Confirm the source really describes ${from}, particularly when an abbreviation omits a square, cubic or regional qualifier. Keep length, area and volume in their own columns when compiling a schedule.` },
    { q: `How many digits should I keep in ${to}?`, a: `Keep the full available conversion until the end of a calculation or quote comparison. When communicating the result from ${source}, round to the precision the input supports. Extra display digits do not make the source measurement more accurate.` },
  ];
  return {
    slug, title, h1: `${title} converter`, primaryKeyword: keyword, metaDescription: `Convert ${from} to ${to}. Use the conversion formula and a worked example to check your result before copying it into a plan.`,
    secondaryKeywords: [...new Set([`${keyword} converter`, `${from} in ${to}`, abbreviated])],
    longTailKeywords: faqs.map(faq => faq.q), commonMisspellings: ["convertor"], regionalTerms,
    description: `Convert ${from} to ${to} for ${destination}. ${variable ? "Enter the area of one bigha from your local record before calculating." : "Enter a value in the source unit and use the result in the destination unit."}`,
    howItWorks: [
      `Start with ${source}. Copy the numeric value and the unit from the same line of the document. This matters when a document contains side lengths and total area together, or when two models in a catalogue list the same dimension using different units. Mark the copied value as ${from} so a later revision cannot silently change its meaning.`,
      `The destination for this conversion is ${destination}. ${variable ? "Because bigha varies by locality, the calculator requires a documented area per bigha. The count alone is insufficient." : `The calculator uses a fixed relationship between ${from} and ${to}. If an estimate also uses a price or application rate, convert the quantity first and then apply that rate in its stated denominator.`}`,
      `For a comparison, put both figures into ${to} before adding them or comparing them. If the converted amount is assembled from multiple readings, retain the original precision for each line and round only the final total. Note any separately stated tolerances. A clean numerical conversion cannot account for a boundary change, a different product or an incorrect input label.`,
    ],
    formulaText: formula, workedExample: example, examples: [example], faqs,
    category: "conversions", relatedTools: [], alsoSearchedAs: [...new Set([`${from} in ${to}`, abbreviated, ...regionalTerms, `${keyword} convertor`])].slice(0, 8),
    model, exampleInput: value,
  };
}

function roomTool(length: number, width: number, coverage: number, waste: number, context: string): Tool {
  const slug = `flooring-for-${length}x${width}-room`;
  const title = `Flooring for a ${length}×${width} ft room`;
  const keyword = title.toLowerCase();
  const model = { kind: "flooring", length, width, coverage, waste } as const;
  const { area, adjusted, packs } = flooring(length, width, coverage, waste);
  const example = { title: `${length} × ${width} ft with ${coverage} sq ft per box`,
    note: `The rectangle covers ${area} sq ft. Adding ${waste}% gives ${format.format(adjusted)} sq ft. Divide by the ${coverage} sq ft printed on each box and round up to ${packs} boxes. Those boxes cover ${packs * coverage} sq ft, leaving ${format.format(packs * coverage - adjusted)} sq ft above the waste-adjusted target.` };
  const faqs = [
    { q: `How many boxes for a ${length} by ${width} room?`, a: example.note },
    { q: `How do I measure the ${length} ft side?`, a: "Measure the clear finished floor between the two edges where the material starts and stops. Repeat the measurement at both ends of the opposite walls if the room might be out of square." },
    { q: "Which box coverage should I use?", a: `Enter your own product label in square feet per box. For the example, ${coverage} sq ft is an assumption. A smaller box gives a higher whole-box count even when net room area is unchanged.` },
    { q: "How should I treat a recess or threshold?", a: context + " If the recess will use the same material, estimate its area separately and add it before applying the allowance. Keep trims or transitions on a separate line." },
  ];
  return { slug, title, h1: title, primaryKeyword: keyword,
    metaDescription: `Estimate flooring for a ${length}×${width} ft room. Calculate square feet, cutting allowance and whole boxes from the coverage on your pack.`,
    description: `Estimate flooring for a ${length}×${width} ft room. Start with ${area} square feet and enter the box coverage and cutting allowance for your layout.`,
    secondaryKeywords: [`${length}x${width} room flooring`, "flooring boxes", "floor area in square feet"],
    longTailKeywords: faqs.map(faq => faq.q), commonMisspellings: ["flouring"], regionalTerms: [],
    formulaText: "Area = length × width. Adjusted area = area × (1 + allowance ÷ 100). Boxes = round adjusted area ÷ coverage per box up to a whole box.",
    howItWorks: [
      context,
      `Mark the planned plank or tile direction on a sketch of this ${length} by ${width} ft room. Mark where joints need to avoid a doorway and where a leftover cut can be reused. That is a better starting point for selecting an allowance than choosing a percentage without seeing the layout. The ${waste}% in the example is a scenario you can replace.`,
      `Check whether the supplier sells only full cartons and whether the coverage reflects the finished joint dimensions. For the example, ${packs} cartons arrive as ${packs * coverage} square feet of stock. Keep the stock total separate from the ${area} square feet of finished room area when comparing different products or box sizes.`,
      "If the drawing is metric, convert the room dimensions to feet or convert the product label to square feet first. Use the same area unit on both sides of the division. For a room that tapers, record the separate floor sections and ask the installer which boundary to use for ordering.",
    ],
    workedExample: example, examples: [example], faqs, category: "construction",
    relatedTools: ["flooring-pack-calculator", "flooring-waste-calculator", "square-metres-to-square-feet-calculator"],
    alsoSearchedAs: [`${length}x${width} room flooring`, "flooring boxes per sq ft", "flouring calculator"], model,
  };
}

const oldSlugs = new Set(ALL_TOOLS.map(tool => tool.slug));
const newTools = [
  ...conversions.filter(([slug]) => !oldSlugs.has(slug + "-calculator")).map(conversionTool),
  roomTool(10, 10, 18, 8, "In a square spare room, compare laying the long edge toward the doorway with laying across it. The same floor area can produce a different last-row width at the threshold."),
  roomTool(12, 12, 22, 10, "In a 12 ft square room, mark the centreline if you plan a centred tile pattern. Check the border width on both walls before deciding whether full or cut pieces start the first row."),
  roomTool(12, 15, 24, 12, "In a 12 by 15 ft living room, sketch plank rows along the 15 ft direction and note the starter length at each doorway. Long rows can require different staggered end cuts even when offcuts can be reused."),
];
const newConversionTools = conversions.map(conversionTool);
for (const tool of newTools.filter(item => item.model?.kind === "conversion")) {
  const model = tool.model as Extract<Model, { kind: "conversion" }>;
  tool.relatedTools = newConversionTools.filter(other => other.slug !== tool.slug &&
    other.model?.kind === "conversion" && (other.model.from === model.from || other.model.to === model.from || other.model.from === model.to))
    .slice(0, 4).map(other => oldSlugs.has(other.slug + "-calculator") ? other.slug + "-calculator" : other.slug);
}

export const tools = [...ALL_TOOLS.map(legacyTool), ...newTools];
