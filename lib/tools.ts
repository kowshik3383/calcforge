import { ALL_TOOLS } from "../static-site/catalog/tools";

export const tools = ALL_TOOLS.map(tool => ({
  ...tool,
  h1: tool.seo.h1,
  metaDescription: tool.seo.metaDescription,
  primaryKeyword: tool.seo.keywords[0] ?? tool.title,
  secondaryKeywords: tool.seo.keywords.slice(1),
  longTailKeywords: tool.faqs.map(faq => faq.q),
  commonMisspellings: [] as string[],
  regionalTerms: [] as string[],
  formulaText: tool.formula,
  workedExample: tool.examples[0],
  relatedTools: tool.related,
}));
