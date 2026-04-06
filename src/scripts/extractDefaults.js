/**
 * Extracts __defaults from every component in src/app/library/ and writes
 * them to component_defaults.json in this same directory.
 *
 * Run from the project root:
 *   node src/scripts/extractDefaults.js
 */

const fs = require("fs");
const path = require("path");

const libraryDir = path.resolve(__dirname, "../app/library");
const outputFile = path.resolve(__dirname, "component_defaults.json");

/**
 * Extracts the body of `this.__<fieldName> = { ... }` from source text.
 */
function extractBlock(source, fieldName) {
    const marker = `this.${fieldName}`;
    const start = source.indexOf(marker);
    if (start === -1) return null;

    const braceStart = source.indexOf("{", start);
    if (braceStart === -1) return null;

    let depth = 0;
    let i = braceStart;
    while (i < source.length) {
        if (source[i] === "{") depth++;
        else if (source[i] === "}") {
            depth--;
            if (depth === 0) return source.slice(braceStart + 1, i);
        }
        i++;
    }
    return null;
}

/**
 * Parses `key: <numeric expression>` pairs from a block string.
 */
function parseNumericPairs(block) {
    if (!block) return null;
    const result = {};
    // Match lines like:  someKey: 0.7 * 1000,
    const lineRe = /^\s*(\w+)\s*:\s*(.+?),?\s*$/gm;
    let m;
    while ((m = lineRe.exec(block)) !== null) {
        const key = m[1];
        const rawVal = m[2].trim();
        try {
            // Only allow numeric literals, whitespace, and arithmetic operators
            if (/^[\d\s+\-*/.()]+$/.test(rawVal)) {
                const val = Function('"use strict"; return (' + rawVal + ")")();
                if (typeof val === "number" && isFinite(val)) {
                    result[key] = val;
                }
            }
        } catch (_) {}
    }
    return Object.keys(result).length > 0 ? result : null;
}

/**
 * Extracts the MINT type string from source text.
 */
function extractMint(source) {
    const m = source.match(/this\.__mint\s*=\s*["']([^"']+)["']/);
    return m ? m[1] : null;
}

// --- Main ---

const files = fs
    .readdirSync(libraryDir)
    .filter((f) => f.endsWith(".ts"))
    .sort();

const output = {};
const skipped = [];

for (const file of files) {
    const source = fs.readFileSync(path.join(libraryDir, file), "utf8");
    const mint = extractMint(source);
    const defaults = parseNumericPairs(extractBlock(source, "__defaults"));

    if (mint && defaults) {
        output[mint] = defaults;
    } else {
        skipped.push(file);
    }
}

fs.writeFileSync(outputFile, JSON.stringify(output, null, 2), "utf8");

console.log(`Wrote ${Object.keys(output).length} components to:\n  ${outputFile}`);
if (skipped.length) {
    console.log(`Skipped (no mint or no defaults): ${skipped.join(", ")}`);
}
