/**
 * Populate custom_hyphenation_rules table with existing product names
 * Run this once on the server after deploying
 */

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PRODUCT_RULES = [
  { word: 'logicline', hyphenated: 'Logic\u00ADLine' },
  { word: 'frontrack', hyphenated: 'Front\u00ADRack' },
  { word: 'combirack', hyphenated: 'Combi\u00ADRack' },
  { word: 'powerrack', hyphenated: 'Power\u00ADRack' },
  { word: 'heckrack', hyphenated: 'Heck\u00ADRack' },
  { word: 'ecocover', hyphenated: 'Eco\u00ADCover' },
  { word: 'basiccover', hyphenated: 'Basic\u00ADCover' },
  { word: 'combicover', hyphenated: 'Combi\u00ADCover' },
  { word: 'basicbox', hyphenated: 'Basic\u00ADBox' },
  { word: 'combibox', hyphenated: 'Combi\u00ADBox' },
  { word: 'toolbox', hyphenated: 'Tool\u00ADBox' },
  { word: 'roadbox', hyphenated: 'Road\u00ADBox' },
  { word: 'longbox', hyphenated: 'Long\u00ADBox' },
];

async function populateRules() {
  console.log('Opening database...');
  const db = await open({
    filename: path.join(__dirname, '../analytics.db'),
    driver: sqlite3.Database,
  });

  console.log('Adding custom hyphenation rules...');

  for (const rule of PRODUCT_RULES) {
    try {
      await db.run(
        'INSERT OR IGNORE INTO custom_hyphenation_rules (word, hyphenated) VALUES (?, ?)',
        [rule.word, rule.hyphenated]
      );
      console.log(`✓ Added: ${rule.word} → ${rule.hyphenated.replace(/\u00AD/g, '­')}`);
    } catch (error) {
      console.error(`✗ Failed to add ${rule.word}:`, error);
    }
  }

  console.log('\n✓ Done! All rules populated.');
  await db.close();
}

populateRules().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
