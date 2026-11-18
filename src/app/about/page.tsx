export default function About() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-4">About CalcForge</h1>
      <p className="mb-6 text-gray-700">
        CalcForge publishes free, client-side online calculators. Every tool runs in your browser — nothing is uploaded, and no personal data is collected.
      </p>
      <h2 className="text-xl font-bold mt-8 mb-2">Our approach</h2>
      <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
        <li>One dedicated page per tool, built around a real search query.</li>
        <li>Formulas and worked examples are shown on every page.</li>
        <li>No signup, no ads-heavy thin pages — just working tools.</li>
      </ul>
      <p className="text-gray-600">
        Tools are estimates only. Verify inputs against local regulations and professional advice before making purchasing or production decisions.
      </p>
    </div>
  );
}
