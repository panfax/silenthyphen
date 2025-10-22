/**
 * Example texts for demonstration
 */

export interface ExampleText {
  id: string;
  language: 'de' | 'en';
  title: string;
  text: string;
}

export const GERMAN_EXAMPLE: ExampleText = {
  id: 'de-product',
  language: 'de',
  title: 'Produktbeschreibung (DE)',
  text: `Ladungssicherung ist entscheidend für den sicheren Transport von Gütern. Unsere hochwertigen Zurrgurte bieten maximale Festigkeit und Zuverlässigkeit. Die Ratschenfunktion ermöglicht eine präzise Spannungseinstellung und gewährleistet optimalen Halt.

Technische Eigenschaften: Bruchfestigkeit von 2000 kg, witterungsbeständiges Material, ergonomischer Griff für komfortables Arbeiten. Die Zertifizierung nach Europäischen Sicherheitsstandards garantiert höchste Qualität.

Anwendungsbereiche: Transportlogistik, Baugewerbe, Landwirtschaft, Umzugsservice. Geeignet für professionelle und private Verwendung. Entspricht den Anforderungen der Berufsgenossenschaften.`,
};

export const ENGLISH_EXAMPLE: ExampleText = {
  id: 'en-product',
  language: 'en',
  title: 'Product Description (EN)',
  text: `Responsiveness is fundamental to modern web development. Our comprehensive toolkit provides state-of-the-art solutions for building accessible, user-friendly interfaces. The implementation includes sophisticated algorithms for optimal rendering performance.

Key characteristics: Cross-browser compatibility, internationalization support, customizable appearance, and straightforward integration. Professional documentation ensures seamless developer experience throughout the entire lifecycle.

Application domains: Enterprise software, e-commerce platforms, content management systems, progressive web applications. Suitable for organizations of all sizes, from startups to multinational corporations.`,
};

export const GERMAN_HTML_EXAMPLE: ExampleText = {
  id: 'de-html',
  language: 'de',
  title: 'HTML-Beispiel (DE)',
  text: `<h2>Produktinformationen</h2>
<p>Die <strong>Ladungssicherung</strong> ist für den <em>professionellen Transport</em> unerlässlich. Unsere Zurrgurte mit <code>ISO-9001</code> Zertifizierung bieten höchste Qualitätsstandards.</p>
<p>Besuchen Sie unsere Website unter <a href="https://www.example.com">www.example.com</a> für weitere Informationen. Die <a href="/produkte/zurrgurte">Zurrgurte</a> sind in verschiedenen Ausführungen erhältlich.</p>
<p>Kontaktieren Sie uns unter <a href="mailto:info@example.com">info@example.com</a> für individuelle Beratung.</p>`,
};

export const ENGLISH_HTML_EXAMPLE: ExampleText = {
  id: 'en-html',
  language: 'en',
  title: 'HTML Example (EN)',
  text: `<h2>Product Information</h2>
<p>Our <strong>comprehensive solution</strong> provides <em>state-of-the-art functionality</em> for modern applications. Contact us at <a href="mailto:info@example.com">info@example.com</a> for more details.</p>
<p>Version <code>v2.1.3</code> includes significant performance improvements and accessibility enhancements.</p>`,
};

export const ALL_EXAMPLES: ExampleText[] = [
  GERMAN_EXAMPLE,
  ENGLISH_EXAMPLE,
  GERMAN_HTML_EXAMPLE,
  ENGLISH_HTML_EXAMPLE,
];
