import { BigQuery } from "@google-cloud/bigquery";
import "dotenv/config";

// ✅ export default: return only the return value for Observable Framework builds
export default async function () {
  const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);

  const bigquery = new BigQuery({ credentials });

  const query = `
    SELECT
      event_date,
      event_name,
      geo.country AS country,
      device.category AS device_category,
      COUNT(DISTINCT user_pseudo_id) AS total_users,
      COUNT(*) AS event_count,
      MAX(IF(ep.key = "value", ep.value.int_value, NULL)) AS purchase_value,
      MAX(IF(ep.key = "currency", ep.value.string_value, NULL)) AS currency
    FROM \`bigquery-public-data.ga4_obfuscated_sample_ecommerce.events_*\`,
    UNNEST(event_params) AS ep
    WHERE _TABLE_SUFFIX BETWEEN '20201101' AND '20210131'
    GROUP BY event_date, event_name, country, device_category
    ORDER BY event_date
  `;

  const [rows] = await bigquery.query({ query });
  return rows;
}

// ✅ Manual execution: confirmation output in node src/data/ecommerce.json.js
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