export const planners = [
  { slug: "flooring", title: "Flooring & Tile Planner", description: "Sketch rooms, compare flooring quotes, and print a box-by-box shopping list.", category: "construction" },
  { slug: "land", title: "Indian Land & Plot Planner", description: "Compare plot dimensions, frontage, and regional land units in a printable measurement sheet.", category: "conversions" },
  { slug: "workshop", title: "Workshop Cut List Planner", description: "Lay out sheet cuts, record offcuts and hardware, and estimate job costs.", category: "manufacturing" },
  { slug: "garden", title: "Garden Bed Planner", description: "Sketch beds, estimate seeds, soil and mulch, and keep a planting record.", category: "agriculture" },
  { slug: "archery", title: "Archery Practice Scorecard", description: "Score target rounds, track practice and personal bests, and share club results." },
] as const;

export const plannersCrumb = { name: "Project planners", path: "/planners" };
