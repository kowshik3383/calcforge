import type { InputField, ToolDef } from "../calculator";

type Field = [label: string, unit: string, example: number, min?: number, max?: number];
type Rank = [slug: string, title: string, unit: string, fields: Field[], formula: string, run: (...values: number[]) => number, expected: number, limitation: string];
type Category = ToolDef["category"];

const field = (label: string, unit: string, example: number, min = 0.000001, max = 1e9): Field => [label, unit, example, min, max];
const count = (label: string, example: number, min = 1): Field => field(label, "count", example, min);
const pct = (label: string, example = 10): Field => field(label, "%", example, 0, 100);
const metres = (label: string, example: number): Field => field(label, "m", example);
const area = (label: string, example: number): Field => field(label, "m²", example);
const volume = (label: string, example: number): Field => field(label, "L", example);
const roundUp = (value: number) => {
  const nearest = Math.round(value);
  return Math.abs(value - nearest) <= Number.EPSILON * Math.abs(value) * 4 ? nearest : Math.ceil(value);
};
const printable = (value: number) => Number(value.toPrecision(10)).toString();
const agriculture: Rank[] = [
  ["field-area", "Rectangular Field Area", "m²", [metres("Length", 120), metres("Width", 80)], "Length × width", (l,w) => l*w, 9600, "Use the horizontal distances for a map-area estimate."],
  ["triangular-field-area", "Triangular Field Area", "m²", [metres("Base", 54), metres("Perpendicular height", 32)], "Base × perpendicular height ÷ 2", (b,h) => b*h/2, 864, "The height must meet the base line at a right angle."],
  ["trapezoid-field-area", "Trapezoid Field Area", "m²", [metres("First parallel edge", 42), metres("Second parallel edge", 58), metres("Perpendicular gap", 30)], "Average parallel edge × perpendicular gap", (a,b,h) => (a+b)*h/2, 1500, "The two measured edges must be parallel."],
  ["plantable-land-area", "Plantable Land Area", "m²", [area("Gross field area", 9000), field("Total excluded area", "m²", 600, 0)], "Gross area − excluded area", (a,b) => a-b, 8400, "Count overlapping exclusions once."],
  ["field-headland-area", "Field Headland Area", "m²", [metres("Field length", 80), metres("Field width", 50), metres("Border width", 3)], "Gross area − inner rectangle area", (l,w,b) => 2*b<=Math.min(l,w) ? l*w-(l-2*b)*(w-2*b) : NaN, 744, "Use a uniform border width on all four sides."],
  ["square-plot-side", "Square Plot Side Length", "m", [area("Plot area", 625)], "Square root of area", Math.sqrt, 25, "Many non-square plots have the same area."],
  ["fence-perimeter", "Rectangular Fence Length", "m", [metres("Plot length", 45), metres("Plot width", 28), field("Total gate openings", "m", 4, 0)], "2 × (length + width) − gate openings", (l,w,g) => 2*(l+w)-g, 142, "Plan corners and hardware separately."],
  ["map-scale-distance", "Map Scale Distance", "m", [field("Measured map distance", "cm", 3), field("Printed scale-bar length", "cm", 4), metres("Ground distance shown on scale bar", 100)], "Map distance ÷ printed scale bar × ground distance", (d,s,g) => d/s*g, 75, "Measure both distances on the same printout."],
  ["raised-bed-soil", "Raised Bed Soil Volume", "L", [metres("Inside length", 2), metres("Inside width", 1), field("Fill depth", "cm", 25)], "Length × width × depth in centimetres × 10", (l,w,d) => l*w*d*10, 500, "Measure fill depth instead of wall height."],
  ["mulch-volume", "Garden Mulch Volume", "L", [area("Bed area",12), field("Chosen depth", "cm", 4)], "Area × depth in centimetres × 10", (a,d) => a*d*10, 480, "Enter your chosen depth from the product or planting plan."],
  ["soil-bag-count", "Bagged Soil Quantity", "bags", [volume("Required soil volume",385), volume("Volume per bag",35)], "Round up required volume ÷ bag volume", (v,b) => roundUp(v/b), 11, "Use labeled volume rather than bag weight."],
  ["round-planter-volume", "Round Planter Volume", "L", [field("Inside diameter","cm",40),field("Fill depth","cm",30)], "π × radius in cm squared × depth ÷ 1,000", (d,h) => Math.PI*(d/2)**2*h/1000, 37.69911184307752, "This estimates a straight-sided planter."],
  ["garden-row-count", "Garden Row Count", "rows", [field("Inside bed width","cm",120),field("Margin at each edge","cm",15,0),field("Row centre spacing","cm",30)], "Floor((bed width − two margins) ÷ spacing) + 1", (w,m,s) => w>=2*m ? Math.floor((w-2*m)/s)+1 : 0, 4, "Select crop spacing independently of this layout calculation."],
  ["plant-grid-count", "Planting Grid Count", "positions", [count("Row count", 5),count("Positions per row",3)], "Rows × positions per row", (r,p) => r*p, 15, "Subtract blocked positions from the final count."],
  ["seed-tray-shelf", "Seed Tray Shelf Capacity", "trays", [field("Shelf width","cm",110),field("Shelf depth","cm",62),field("Tray width","cm",54),field("Tray depth","cm",28)], "Maximum of the two uniform grid orientations", (w,d,a,b) => Math.max(Math.floor(w/a)*Math.floor(d/b),Math.floor(w/b)*Math.floor(d/a)), 4, "Mixed orientations may fit more trays."],
  ["rainfall-litres", "Rainfall to Litres", "L", [area("Catchment area",18),field("Rain depth","mm",12,0)], "Area in m² × rain depth in mm", (a,d) => a*d, 216, "This is gross rainfall before runoff or collection losses."],
  ["sprinkler-depth-rate", "Sprinkler Application Rate", "mm/h", [field("Average catch depth","mm",5,0),field("Test duration","min",15)], "Catch depth × 60 ÷ minutes", (d,m) => d*60/m, 20, "Average comparable catch containers within one zone."],
  ["hose-bucket-flow", "Hose Bucket Test Flow", "L/min", [volume("Bucket fill volume",10),field("Fill time","s",25)], "Litres × 60 ÷ seconds", (v,s) => v*60/s, 24, "Test with the nozzle and tap setting you intend to use."],
  ["watering-runtime", "Watering Runtime", "min", [volume("Target water volume",90),field("Measured flow","L/min",12)], "Target volume ÷ measured flow", (v,f) => v/f, 7.5, "The target is supplied by the user."],
  ["drip-emitter-flow", "Drip Emitter Flow", "L/h", [field("Collected water","mL",420,0),field("Collection time","min",15)], "Collected millilitres × 60 ÷ minutes ÷ 1,000", (v,t) => v*60/t/1000, 1.68, "Keep position notes when comparing emitters."],
  ["drip-zone-volume", "Drip Zone Water Volume", "L", [count("Emitter count",8),field("Average emitter flow","L/h",2,0),field("Runtime","min",45,0)], "Emitters × average flow × minutes ÷ 60", (n,f,m) => n*f*m/60, 12, "Estimate unlike emitter groups separately if no measured group average is available."],
  ["rain-barrel-spare", "Rain Barrel Spare Capacity", "L", [volume("Barrel capacity",200),field("Current contents","L",55,0)], "Capacity − current contents", (a,b) => a-b, 145, "Actual capture depends on the connected catchment."],
  ["garden-water-depth", "Litres Applied to Water Depth", "mm", [field("Applied volume","L",30,0),area("Covered area",6)], "Litres ÷ square metres", (v,a) => v/a, 5, "The output is an equivalent average depth."],
  ["soil-top-up", "Raised Bed Soil Top-Up", "L", [area("Bed area",1.8),field("Average missing depth","cm",5)], "Bed area × missing centimetres × 10", (a,d) => a*d*10, 90, "Measure multiple gaps across the existing surface."],
  ["garden-path-gravel", "Garden Path Gravel Volume", "m³", [metres("Path length",8),metres("Path width",1),field("Chosen gravel depth","cm",5)], "Length × width × depth ÷ 100", (l,w,d) => l*w*d/100, 0.4, "Estimate intersections only once and handle compaction separately."],
];
const construction: Rank[] = [
  ["flooring-pack", "Flooring Pack Count", "packs", [area("Floor area",24),area("Coverage per pack",2.2),pct("Waste allowance")], "Round up floor area × (1 + waste ÷ 100) ÷ per-pack coverage", (a,c,w) => roundUp(a*(1+w/100)/c), 12, "Use the coverage printed on the box."],
  ["l-shaped-floor-area", "L-Shaped Floor Area", "m²", [metres("Outer length",5),metres("Outer width",4),metres("Cutout length",2),metres("Cutout width",1.5)], "Outer rectangle − corner cutout", (l,w,a,b) => a<=l && b<=w ? l*w-a*b : NaN, 17, "Compare the cutout dimensions with the matching outer axes."],
  ["floor-area-with-alcove", "Room Floor Area With an Alcove", "m²", [metres("Room length",4.2),metres("Room width",3.8),metres("Alcove depth",0.6),metres("Alcove width",1.2)], "Main rectangle area + separate alcove area", (l,w,a,b) => l*w+a*b, 16.68, "Make sure the alcove was not included in the main rectangle."],
  ["wall-tile-net-area", "Net Wall Tile Area", "m²", [metres("Wall width",3),metres("Tiled height",2.4),field("Untiled openings","m²",0.96,0)], "Width × tiled height − untiled opening area", (w,h,o) => w*h-o, 6.24, "Measure returns and reveals separately."],
  ["tile-box-count", "Wall Tile Box Count", "boxes", [area("Tiled surface area",14),area("Area per box",1.2),pct("Waste allowance")], "Round up adjusted tiled area ÷ box coverage", (a,c,w) => roundUp(a*(1+w/100)/c), 13, "Keep wall and floor products as separate orders."],
  ["underlay-roll-count", "Underlay Roll Count", "rolls", [area("Floor area",24),area("Coverage per roll",10)], "Round up floor area ÷ roll coverage", (a,c) => roundUp(a/c), 3, "Review seam placement and usable widths against the estimate."],
  ["skirting-length", "Skirting Board Length", "m", [metres("Room length",4),metres("Room width",3),field("Total door gaps","m",0.9,0)], "2 × (length + width) − door gaps", (l,w,g) => 2*(l+w)-g, 13.1, "Measure recesses separately and plan joints before ordering."],
  ["paint-wall-net-area", "Paintable Wall Area", "m²", [metres("Room length",4),metres("Room width",3),metres("Wall height",2.5),field("Unpainted openings","m²",3.5,0)], "2 × (length + width) × height − openings", (l,w,h,o) => 2*(l+w)*h-o, 31.5, "For variable heights, estimate each face separately."],
  ["paint-coat-volume", "Paint Litres by Coat Count", "L", [area("Paintable surface",34),count("Coats",2),field("Paint label coverage","m²/L",11)], "Area × coats ÷ coverage per litre", (a,n,c) => a*n/c, 6.181818181818182, "Use the actual product coverage and round to available can sizes separately."],
  ["ceiling-paint-area", "Two-Slope Ceiling Area", "m²", [metres("Building length along ridge",4),metres("First slope face length",2.4),metres("Second slope face length",2.4)], "Ridge length × combined slope lengths", (l,a,b) => l*(a+b), 19.2, "Measure on the face of each slope instead of the projected floor span."],
  ["door-paint-area", "Door Paint Surface Area", "m²", [metres("Door height",2.04),metres("Door width",0.82),field("Door thickness","mm",35,0),field("Painted faces","count",2,1,2)], "Face count × height × width + two vertical edges", (h,w,t,n) => n*h*w+2*h*t/1000, 3.4884, "Includes two vertical edges and excludes top, bottom, and profile recesses."],
  ["wallpaper-drop-count", "Wallpaper Drop Count", "drops", [metres("Wall width",3.1),metres("Usable drop width",0.53)], "Round up wall width ÷ usable wallpaper width", (a,b) => roundUp(a/b), 6, "Openings may still occupy whole drop positions."],
  ["wallpaper-straight-match-rolls", "Straight-Match Wallpaper Rolls", "rolls", [count("Full drops needed",6),metres("Drop length including trim",2.48),metres("Pattern repeat",0.32),metres("Usable roll length",10)], "Round up drops needed ÷ full aligned drops per roll", (n,d,p,r) => roundUp(n/Math.floor(r/(roundUp(d/p)*p))), 2, "Use usable roll length after starting alignment. Offset patterns need a separate cut plan."],
  ["decorative-panel-packs", "Decorative Wall Panel Packs", "packs", [area("Net wall surface",7.6),area("Effective coverage per pack",1.8)], "Round up wall area ÷ effective coverage", (a,b) => roundUp(a/b), 5, "Confirm seam overlap and whether offcuts are usable."],
  ["bulk-fill-volume", "Bulk Fill Volume", "m³", [area("Surface area",9),field("Layer depth","mm",45)], "Square metres × millimetres ÷ 1,000", (a,d) => a*d/1000, 0.405, "Compaction, settlement, and delivery increments are separate."],
  ["partition-finish-area", "Two-Sided Partition Finish Area", "m²", [metres("Wall run",6),metres("Wall height",2.4),field("Opening area on one face","m²",2,0)], "2 × (run × height − one-face openings)", (l,h,o) => 2*(l*h-o), 24.8, "Both sides must have the same openings and treated area."],
  ["flooring-pack-surplus", "Flooring Pack Surplus", "m²", [count("Packs ordered",9),area("Coverage per pack",2.4),area("Adjusted area required",20.7)], "Packs × coverage − adjusted area", (n,c,a) => n*c-a, 0.9, "A negative value is a shortfall.",],
  ["trim-stock-count", "Trim Stock Length Count", "pieces", [metres("Combined run",13.1),metres("Length per piece",2.4)], "Round up combined run ÷ length per piece", (a,b) => roundUp(a/b), 6, "This is a lower bound before segment cuts and joints."],
  ["tile-coverage-quantity", "Individual Tile Quantity", "tiles", [area("Net installation area",8.3),field("Tile length","cm",30),field("Tile width","cm",30),pct("Waste allowance")], "Round up adjusted area ÷ area of one tile", (a,l,w,p) => roundUp(a*(1+p/100)/(l*w/10000)), 102, "Use a layout to verify the number of edge cuts and whole pieces."],
  ["paving-slab-grid", "Paving Slab Grid Count", "slabs", [metres("Paved length",3),metres("Paved width",2.4),metres("Slab pitch along length",0.6),metres("Slab pitch along width",0.6)], "Round up row count × round up column count", (l,w,x,y) => roundUp(l/x)*roundUp(w/y), 20, "Use actual grid pitch including the intended joint spacing."],
];
const manufacturing: Rank[] = [
  ["sheet-area-lower-bound", "Sheet Goods Area Lower Bound", "sheets", [area("Total finished part area",2.63),area("Usable area per sheet",2.9768)], "Round up finished area ÷ usable sheet area", (a,b) => roundUp(a/b), 1, "This is a lower bound. Part dimensions, grain, and kerf determine the cut layout."],
  ["saw-kerf-stock-length", "Saw Kerf Stock Length", "mm", [count("Parts",4),field("Length per part","mm",290),count("Number of cuts",4,0),field("Kerf per cut","mm",3,0),field("End trim allowance","mm",0,0)], "Part count × length + cuts × kerf + end trim", (n,l,c,k,t) => n*l+c*k+t, 1172, "Use the actual number of cuts from your layout."],
  ["edge-banding-length", "Edge Banding Length", "m", [count("Matching panels",4),metres("Panel length",0.6),metres("Panel depth",0.35),pct("Trim allowance",0)], "Panels × (length + two depths) × allowance multiplier", (n,l,d,p) => n*(l+2*d)*(1+p/100), 5.2, "This covers the front and two sides of every panel."],
  ["board-foot-volume", "Board Foot Volume", "board ft", [field("Thickness","in",2),field("Width","in",6),field("Length","ft",8)], "Thickness in inches × width in inches × length in feet ÷ 12", (t,w,l) => t*w*l/12, 8, "Ask whether the quote uses nominal or actual measurements."],
  ["panel-material-area", "Repeated Panel Material Area", "m²", [count("Part count",6),metres("Part length",0.8),metres("Part width",0.3)], "Part count × part length × part width", (n,l,w) => n*l*w, 1.44, "Use a cutting plan before ordering sheet stock."],
  ["fabric-panel-yardage", "Fabric Panel Yardage", "yd", [count("Required panels",5),field("Usable roll width","cm",140),field("Panel cut width","cm",62),field("Panel cut length","cm",90)], "Round up panels ÷ panels across, then × cut length ÷ 91.44", (n,w,p,l) => roundUp(n/Math.floor(w/p))*l/91.44, 2.952755905511811, "Enter panel sizes with allowances and keep the fabric direction consistent."],
  ["fabric-area-from-roll", "Fabric Roll Surface Area", "m²", [metres("Usable roll length",100),metres("Usable width",1.5)], "Usable length × usable width", (l,w) => l*w, 150, "Subtract unusable selvage width before calculating."],
  ["roll-strip-length", "Roll Material Strip Length", "m", [metres("Width across strips",2.4),metres("Strip length",3),metres("Effective strip width",1)], "Round up width ÷ effective strip width, then × strip length", (w,l,s) => roundUp(w/s)*l, 9, "Effective width should already exclude seam overlap."],
  ["material-yield", "Finished Material Yield", "%", [area("Finished part area",2.1),area("Area issued",3)], "Finished area ÷ issued area × 100", (a,b) => a<=b ? a/b*100 : NaN, 70, "Record reusable offcuts separately."],
  ["material-scrap-area", "Material Scrap Area", "m²", [area("Issued sheet area",3),field("Finished part area","m²",2.1,0),field("Reusable offcut area","m²",0.5,0)], "Issued area − finished area − reusable offcut area", (a,b,c) => a-b-c, 0.4, "Always measure finished pieces and offcuts on the same area basis."],
  ["roll-label-count", "Label Roll Quantity", "rolls", [count("Labels needed",1120),count("Usable labels per roll",500)], "Round up labels needed ÷ usable labels per roll", (n,r) => roundUp(n/r), 3, "Use usable quantity after your setup allowance."],
  ["carton-order-count", "Units to Shipping Cartons", "cartons", [count("Total items",120),count("Items per carton",18)], "Round up total items ÷ carton capacity", (n,c) => roundUp(n/c), 7, "Check the allowable dimensions and weight separately."],
  ["pack-price-per-area", "Box Price per Square Metre", "currency/m²", [field("Price per box","currency",1200,0),area("Area per box",2)], "Box price ÷ coverage", (p,a) => p/a, 600, "Compare prices in the same currency and on the same tax basis."],
  ["pack-order-cost", "Pack Order Cost", "currency", [count("Packs ordered",9),field("Price per pack","currency",900,0),field("Delivery charge","currency",500,0)], "Packs × price + delivery", (n,p,d) => n*p+d, 8600, "Use consistent tax treatment across inputs."],
  ["bulk-material-order", "Bulk Material Order Increment", "m³", [field("Measured requirement","m³",0.72),field("Minimum order","m³",1,0),field("Sales increment","m³",0.25)], "Round up max(requirement, minimum) ÷ increment, then × increment", (r,m,i) => roundUp(Math.max(r,m)/i)*i, 1, "Assumes sale increments are counted from zero."],
  ["budget-contingency-amount", "Budget Contingency Amount", "currency", [field("Current estimate","currency",12000,0),pct("Contingency")], "Estimate × (1 + contingency ÷ 100)", (a,p) => a*(1+p/100), 13200, "The result is a planning budget."],
  ["stock-repair-reserve", "Spare Stock Reserve", "packs", [count("Installation packs",8,0),count("Reserved repair packs",1,0)], "Installation packs + reserved repair packs", (a,b) => a+b, 9, "Keep sealed repair stock on a separate inventory line."],
  ["single-pattern-stock-count", "Identical Parts per Stock Length", "pieces", [field("Usable stock length","mm",1200),field("Length per part","mm",290),field("Kerf allowance per part","mm",3,0)], "Floor(stock length ÷ (part length + kerf allowance))", (s,l,k) => Math.floor(s/(l+k)), 4, "Assumes a kerf allowance for every part."],
  ["surface-opening-area", "Surface Area After a Cutout", "m²", [metres("Surface length",1.8),metres("Surface width",0.7),metres("Cutout length",0.2),metres("Cutout width",0.15)], "Outer rectangle area − cutout rectangle area", (l,w,a,b) => a<=l&&b<=w ? l*w-a*b : NaN, 1.23, "The stock blank still has to cover the full outer rectangle."],
  ["production-uptime", "Production Uptime Percentage", "%", [field("Scheduled time","min",480),field("Unplanned downtime","min",35,0)], "(Scheduled − downtime) ÷ scheduled × 100", (s,d) => (s-d)/s*100, 92.70833333333333, "State how planned stops are handled before comparing shifts."],
];
const conversions: Rank[] = [
  ["acres-to-hectares", "Acres to Hectares", "ha", [field("Area","ac",6,0)], "Acres × 0.40468564224", a=>a*0.40468564224, 2.42811385344, "Uses the international acre."],
  ["hectares-to-acres", "Hectares to Acres", "ac", [field("Area","ha",3.2,0)], "Hectares ÷ 0.40468564224", a=>a/0.40468564224, 7.90737220694929, "Uses the international acre."],
  ["square-metres-to-hectares", "Square Metres to Hectares", "ha", [area("Area",18400)], "Square metres ÷ 10,000", a=>a/10000, 1.84, "Use area rather than length."],
  ["acres-to-square-feet", "Acres to Square Feet", "ft²", [field("Area","ac",0.5,0)], "Acres × 43,560", a=>a*43560, 21780, "Area alone does not specify parcel dimensions."],
  ["square-feet-to-square-metres", "Square Feet to Square Metres", "m²", [field("Area","ft²",160,0)], "Square feet × 0.09290304", a=>a*0.09290304, 14.8644864, "Use square feet rather than running feet."],
  ["square-metres-to-square-feet", "Square Metres to Square Feet", "ft²", [area("Area",20)], "Square metres ÷ 0.09290304", a=>a/0.09290304, 215.27820833419446, "Keep precision until the final material order."],
  ["square-yards-to-square-feet", "Square Yards to Square Feet", "ft²", [field("Area","yd²",14,0)], "Square yards × 9", a=>a*9, 126, "A linear yard needs a roll width before it can be converted to area."],
  ["square-inches-to-square-feet", "Square Inches to Square Feet", "ft²", [field("Area","in²",288,0)], "Square inches ÷ 144", a=>a/144, 2, "Convert total area before rounding."],
  ["cubic-feet-to-cubic-yards", "Cubic Feet to Cubic Yards", "yd³", [field("Volume","ft³",81,0)], "Cubic feet ÷ 27", a=>a/27, 3, "Confirm that the quote uses volume units."],
  ["cubic-yards-to-cubic-metres", "Cubic Yards to Cubic Metres", "m³", [field("Volume","yd³",3,0)], "Cubic yards × 0.9144³", a=>a*0.9144**3, 2.293664573952, "Delivery increments and settlement are separate."],
  ["cubic-metres-to-litres", "Cubic Metres to Litres", "L", [field("Volume","m³",0.72,0)], "Cubic metres × 1,000", a=>a*1000, 720, "Litres describe volume; weight requires density."],
  ["litres-to-us-gallons", "Litres to US Gallons", "US gal", [field("Volume","L",95,0)], "Litres ÷ 3.785411784", a=>a/3.785411784, 25.096344973, "Uses the US liquid gallon."],
  ["us-gallons-to-litres", "US Gallons to Litres", "L", [field("Volume","US gal",10,0)], "US gallons × 3.785411784", a=>a*3.785411784, 37.85411784, "Imperial gallons have a different conversion factor."],
  ["feet-inches-to-decimal-feet", "Feet and Inches to Decimal Feet", "ft", [count("Whole feet",11,0),field("Remaining inches","in",9,0,11.999999)], "Whole feet + inches ÷ 12", (a,b)=>a+b/12, 11.75, "Enter the inches in their own field."],
  ["litres-per-minute-to-hour", "Litres per Minute to Litres per Hour", "L/h", [field("Flow","L/min",12,0)], "Litres per minute × 60", a=>a*60, 720, "This is a flow conversion and assumes the rate stays constant."],
  ["rectangular-tank-volume", "Rectangular Tank Water Volume", "L", [metres("Inside length",1.2),metres("Inside width",0.8),metres("Usable depth",0.55)], "Length × width × depth × 1,000", (a,b,c)=>a*b*c*1000, 528, "Compartments and rounded corners can lower usable volume."],
  ["vertical-tank-volume", "Vertical Cylindrical Tank Volume", "L", [metres("Inside diameter",1),metres("Liquid depth",0.6)], "π × (diameter ÷ 2)² × depth × 1,000", (d,h)=>Math.PI*(d/2)**2*h*1000, 471.23889803846896, "Requires a vertical, straight-sided cylinder."],
  ["horizontal-run-from-slope", "Horizontal Run From Slope Length", "m", [metres("Straight slope length",5),field("Vertical rise","m",3,0)], "Square root of (slope length squared − rise squared)", (s,r)=>Math.sqrt(s*s-r*r), 4, "Requires a straight cross-section and a rise no greater than the slope length."],
];

type Group = [Category, Rank[]];
const groups: Group[] = [["agriculture", agriculture], ["construction", construction], ["manufacturing", manufacturing], ["conversions", conversions]];
export const MEASUREMENT_EXAMPLES = groups.flatMap(([, rows]) => rows.map(([slug, , , , , , expected]) => [slug + "-calculator", expected] as const));

export const MEASUREMENT_TOOLS: ToolDef[] = groups.flatMap(([category, rows]) =>
  rows.map(([id, title, unit, fields, formula, run, expected, limitation], index) => {
    const slug = id + "-calculator";
    const label = title + " Calculator";
    const inputs: InputField[] = fields.map(([name, fieldUnit, defaultValue, min, max], i) => ({
      key: "value" + (i + 1), label: name, unitLabel: fieldUnit === "count" ? undefined : fieldUnit,
      type: "number", defaultValue, min, max, step: fieldUnit === "count" ? 1 : undefined,
    }));
    const exampleValues = Object.fromEntries(inputs.map(input => [input.key, input.defaultValue]));
    return {
      slug, category, title: label,
      tagline: formula + ".",
      description: "Calculate " + title.toLowerCase() + " using " + fields.map(f => f[0].toLowerCase()).join(", ") + ". " + limitation,
      inputs, formula,
      calculate(values) {
        const numbers = inputs.map(field => Number(values[field.key]));
        const valid = numbers.every((value, i) =>
          values[inputs[i].key] !== "" && values[inputs[i].key] != null &&
          Number.isFinite(value) && value >= (inputs[i].min ?? 0) &&
          value <= (inputs[i].max ?? 1e9) && (inputs[i].step !== 1 || Number.isInteger(value))
        );
        const result = valid ? run(...numbers) : NaN;
        if (!Number.isFinite(result) || (id !== "flooring-pack-surplus" && result < -1e-12)) {
          return [{ id: "result", label: "Check your measurements", value: "These inputs do not produce a usable result.", badge: "warning" }];
        }
        return [{ id: "result", label: "Estimated result", value: Number(printable(Math.abs(result) < 1e-12 ? 0 : result)), unit, badge: "success" }];
      },
      examples: [{
        title: fields.map(f => f[0] + ": " + f[2] + (f[1] === "count" ? "" : " " + f[1])).join(" · "),
        inputs: exampleValues, note: "Expected output: " + printable(expected) + " " + unit + ".",
      }],
      faqs: [{ q: "Which assumptions should I check?", a: limitation }],
      related: [1, 2].map(offset => rows[(index + offset) % rows.length][0] + "-calculator"),
      seo: { h1: label, metaDescription: "Estimate " + title.toLowerCase() + ". " + limitation, keywords: [label.toLowerCase(), title.toLowerCase()] },
    };
  })
);
