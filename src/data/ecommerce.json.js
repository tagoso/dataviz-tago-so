import { BigQuery } from "@google-cloud/bigquery";
import path from "path";
import { promises as fs } from "fs";

export default async function () {
  const keyPath = path.resolve("src/secrets.json");
  const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);

  const bigquery = new BigQuery({ credentials });

  const query = `
    SELECT
      event_date,
      COUNT(DISTINCT user_pseudo_id) AS total_users
    FROM \`bigquery-public-data.ga4_obfuscated_sample_ecommerce.events_*\`
    WHERE _TABLE_SUFFIX BETWEEN '20201101' AND '20210131'
    GROUP BY event_date
    ORDER BY event_date
  `;

  const [rows] = await bigquery.query({ query });

  return rows;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    try {
      const { default: loader } = await import('./ecommerce.json.js');
      const data = await loader();
      console.log(JSON.stringify(data, null, 2));
    } catch (err) {
      console.error("❌ Error running data loader:", err);
    }
  })();
}
