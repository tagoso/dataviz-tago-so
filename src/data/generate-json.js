// for future
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

const csvFilePath = path.resolve("data", "boeing_777.csv");
const jsonFilePath = path.resolve("output", "boeing_777.json");

// read CSV and convert to JSON
const csvData = fs.readFileSync(csvFilePath);
const records = parse(csvData, {
  columns: true,
  skip_empty_lines: true,
});

// filter or sort as needed
const filtered = records.filter(row => row.Status !== "Stored");

// Save as JSON file
fs.writeFileSync(jsonFilePath, JSON.stringify(filtered, null, 2));

console.log(`✅ JSON saved to ${jsonFilePath}`);