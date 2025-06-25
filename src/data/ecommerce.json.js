import { BigQuery } from "@google-cloud/bigquery";
import "dotenv/config";

// ✅ For Observable Framework: exports async data loader
export default async function () {
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

// ✅ Optional CLI execution: generates JSON output manually
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    try {
      const loader = (await import('./ecommerce.json.js')).default;
      const data = await loader();
      console.log(JSON.stringify(data, null, 2));
    } catch (err) {
      console.error("❌ Error running data loader:", err);
    }
  })();
}
