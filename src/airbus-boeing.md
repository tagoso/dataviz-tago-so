---
theme: light
title: Airbus350 vs Boeing777
toc: true
style: custom-style.css
---

# 🇪🇺 Airbus350 vs 🇺🇸 Boeing777 ✈️ Widebody Battle

Since the 1990s, the Boeing 777 has been the flagship widebody aircraft for many long-haul carriers - valued for its range, size, and reliability. Airbus challenged this dominance with the introduction of the A350 in the mid-2010s, offering a lighter, more fuel-efficient alternative.

This comparison focuses on how these two aircraft families have evolved in production, operations, and fleet lifecycle \_\_\_\_\_\_..🛫 Let's go!

## Foundations

So far the B777 series is manufactured more than double💫

<div class="grid grid-cols-2">
  <div class="card">
    <h2>🟦 A350 <span class="muted">- ${a350Duration}</span></h2>
    <span class="big">${a350Count.toLocaleString()}</span>
  </div>
  <div class="card">
    <h2>🟨 B777 <span class="muted">- ${b777Duration}</span></h2>
    <span class="big">${b777Count.toLocaleString()}</span><span class="muted"></span>
  </div>
</div>

## Delivery Timeline

Number of aircraft delivered to aviations per year. You remember 9.11 and COVID-19?

<div class="card">
  <h2>Aircraft Deliveries by Year</h2>
  ${resize(width => deliveryChart(deliveryByYear, { width }))}
</div>

Airbus prioritized the A380 (four engines mega-jumbo) in the early 2000s, allowing Boeing's 777 (two engines and yet compact) to dominate the long-haul market. The A350 was launched later to reclaim ground with modern design and efficiency.

## Current Operational Status

Distribution of aircraft by status. Over 410 B777s are "Out of Service" or "Temporarily Out of Service" 🛑

<div class="card">
  <h2>Current Operational Status</h2>
  ${resize(width => statusChartFx(statusData, { width }))}
</div>

## Aircraft Age and Replacement Trends

Histogram of fleet age (aircraft currently in service or temporarily parked/stored). In the coming years, 100 or more B777 aircraft are expected to be retired annually.

<div class="card">
  <h2>Aircraft Age Distribution (In Service and Temporarily Out of Service)</h2>
  ${resize((width) => ageHistogram(activeOrTemporary, { width }))}
</div>

## Who Bought These Aircraft?

Boeing dominates the fleets of most U.S. carriers, while A350 adoption is stronger in Asia and Europe. Emirates stands out with the largest 777 fleet by far.

<div class="grid grid-cols-1">
  <div class="card">
    <h2>Top 10 airlines by fleet size</h2>
    ${resize((width) => stackedBarChart(top10StackedData, { width }))}
  </div>
</div>

## Regional Adoption Patterns

This map shows the number of aircraft adopted by each country, including those on order. The A350 is widely used in North and West Europe and countries like Ethiopia and Vietnam. In contrast, countries like Saudi Arabia and Canada have adopted only the B777. Using a single aircraft type can simplify pilot training and operations.

<div class="card">
  <div id="plot-wrapper" style="overflow-x: auto;">
  <h2>B777 vs A350 Share by Country</h2>
    <div id="plot" style="min-width: 700px;">
      ${resize(width => renderWorldMapRatio({ countries, countrymesh, ratioMap, width }))}
    </div>
  </div>
</div>

Data source: [Planespotters B777](https://www.planespotters.net/aircraft/production/boeing-777), [Planespotters A350](https://www.planespotters.net/aircraft/production/airbus-a350)

Data as of June 2025.

```js
// ETL

// Extract
const a350 = await FileAttachment('data/airbus_a350.csv').csv();
const b777 = await FileAttachment('data/boeing_777.csv').csv();

const worldMap = await FileAttachment('data/countries-110m.json').json();
const operatorsIso = await FileAttachment(
  'data/operator_country_mapping_iso_numeric.csv'
).csv();

const countries = topojson.feature(worldMap, worldMap.objects.countries);
const countrymesh = topojson.mesh(
  worldMap,
  worldMap.objects.countries,
  (a, b) => a !== b
);

const operatorToNumeric = new Map(
  operatorsIso.map((d) => [d.operator.trim(), +d.iso_numeric])
);

// Tag "type" to each record
const taggedA350 = a350.map((d) => ({ ...d, type: 'A350' }));
const taggedB777 = b777.map((d) => ({ ...d, type: 'B777' }));

// Combine two tables
const combined = [...taggedA350, ...taggedB777];

// YYYY-MM-DD parser
const parseISO = d3.timeParse('%Y-%m-%d');

// Tag "year" to each record
const combinedWithYear = combined.map((d) => {
  const date = d.delivered ? parseISO(d.delivered.trim()) : null;
  return {
    ...d,
    year: date instanceof Date && !isNaN(date) ? date.getFullYear() : null,
  };
});

// Set today's date and year
const today = new Date();
const currentYear = new Date().getFullYear();

// #0 Convert non-null dates in delivered to Date type.
const a350Dates = a350
  .map((d) => parseISO(d.delivered?.trim()))
  .filter((d) => d instanceof Date && !isNaN(d));

const b777Dates = b777
  .map((d) => parseISO(d.delivered?.trim()))
  .filter((d) => d instanceof Date && !isNaN(d));

// #0 Find the earliest date and use it as the "manufacturing start date."
const a350Start = d3.min(a350Dates);
const b777Start = d3.min(b777Dates);

// #0 Calculate the difference between the number of years and months
function getYearsMonths(start, end = new Date()) {
  const years = end.getFullYear() - start.getFullYear();
  const months = end.getMonth() - start.getMonth();
  const adjustedYears = months < 0 ? years - 1 : years;
  const adjustedMonths = (months + 12) % 12;
  return `${adjustedYears} years ${adjustedMonths} months`;
}

const a350Duration = getYearsMonths(a350Start);
const b777Duration = getYearsMonths(b777Start);

// #0 Counting the number of manufactured units
const a350Count = a350.filter((d) => d.delivered).length;
const b777Count = b777.filter((d) => d.delivered).length;

// #1 Rollup for Delivery Timeline
// Compile the number of deliveries by year and model
const rollupsByYear = d3.rollups(
  combinedWithYear.filter((d) => d.year),
  (v) => v.length,
  (d) => d.year,
  (d) => d.type
);

// #1 Flatten for Delivery Timeline
const deliveryByYear = rollupsByYear.flatMap(([year, types]) =>
  types.map(([type, count]) => ({
    year,
    type,
    count,
  }))
);

// #2 Prepare to tag "status3"
const statusMap = {
  Active: 'In Service',
  'On Order': 'On Order',
  'Not Built': 'On Order',
  Parked: 'Temporarily Out of Service', // 👈 noted
  Stored: 'Temporarily Out of Service', // 👈 noted
  Preserved: 'Out of Service',
  'Partially Preserved': 'Out of Service',
  Scrapped: 'Out of Service',
  'Partially Scrapped': 'Out of Service',
  'Written Off': 'Out of Service',
};

// #2 Tag "status3" to each record
const classified = combinedWithYear.map((d) => ({
  ...d,
  status3: statusMap[d.status] || 'Unknown',
}));

const aircraftWithNumeric = classified.map((d) => ({
  ...d,
  numeric_code: operatorToNumeric.get(d.operator?.trim()) ?? null,
}));

const countryCounts = d3.rollups(
  aircraftWithNumeric.filter((d) => d.numeric_code != null),
  (v) => v.length,
  (d) => d.numeric_code
);

const countryCountMap = new Map(countryCounts);

// #2 Rollup for Current Operational Status
const statusRollups = d3.rollups(
  classified.filter((d) => d.status3 !== 'Unknown'),
  (v) => v.length,
  (d) => d.status3,
  (d) => d.type
);

// #2 Flatten for Current Operational Status
const statusData = statusRollups.flatMap(([status, types]) =>
  types.map(([type, count]) => ({
    status,
    type,
    count,
  }))
);

// #3 Calculate the number of years in service (age) from delivered date

const aircraftWithAge = classified
  .map((d) => {
    const date = d.delivered ? parseISO(d.delivered.trim()) : null;
    const year =
      date instanceof Date && !isNaN(date) ? date.getFullYear() : null;
    const age =
      date instanceof Date && !isNaN(date)
        ? Math.floor((today - date) / (1000 * 60 * 60 * 24 * 365.25))
        : null;
    return {
      ...d,
      deliveredDate: date,
      year,
      age,
    };
  })
  .filter((d) => d.age !== null);

// #3 get retired average of B777
const retiredB777 = aircraftWithAge.filter(
  (d) => d.type === 'B777' && d.status3 === 'Out of Service' && d.age != null
);

const avgRetiredAgeB777 = d3.mean(retiredB777, (d) => d.age) ?? 0; // null fallback as a safety measure

// function to draw plot
function deliveryChart(data, { width } = {}) {
  return Plot.plot({
    width,
    height: 300,
    x: {
      label: '',
      type: 'band',
      tickFormat: d3.format('d'),
      tickRotate: -45,
    },
    y: {
      label: 'Aircraft Delivered',
      grid: true,
    },
    color: {
      type: 'categorical',
      legend: true,
    },
    style: {},
    marks: [
      Plot.barY(data, {
        x: 'year',
        y: 'count',
        fill: 'type',
        tip: true,
      }),
      Plot.ruleY([0]),
    ],
  });
}

// Define domain order
const statusOrder = [
  'In Service',
  'Temporarily Out of Service',
  'Out of Service',
  'On Order',
];

function statusChartFx(data, { width } = {}) {
  return Plot.plot({
    width,
    height: 300,
    marginBottom: 60,
    marginTop: 30,
    fx: {
      label: null,
      tickRotate: -25,
      padding: 0,
      domain: statusOrder,
    },
    x: {
      padding: 0.3,
      axis: null,
    },
    y: {
      label: 'Number of Aircraft',
      grid: true,
    },
    color: {
      legend: true,
    },
    marks: [
      Plot.barY(data, {
        fx: 'status', // 👈 Label (optional)
        x: 'type', // 👈 Arrange A350 / B777 within each facet
        y: 'count',
        dx: -10,
        fill: 'type',
        tip: true,
      }),
      Plot.ruleY([0]),
    ],
  });
}

function ageHistogram(data, { width } = {}) {
  return Plot.plot({
    width,
    height: 300,
    round: true,
    color: { legend: true },
    y: {
      label: 'Number of Aircraft',
    },
    x: {
      label: 'Age',
    },
    marks: [
      // Histogram bars
      Plot.rectY(
        data,
        Plot.binX(
          { y: 'count' },
          {
            x: 'age',
            fill: 'type',
            tip: true,
          }
        )
      ),
      // Vertical dashed line for avg retired age
      Plot.ruleX([avgRetiredAgeB777], {
        stroke: 'black',
        strokeWidth: 2,
        strokeDasharray: '4,2',
      }),
      // Label near the line
      Plot.text(
        [{ age: avgRetiredAgeB777, label: 'Avg. Retirement Age (B777)' }],
        {
          x: 'age',
          y: 100, // Adjust the y-coordinate as appropriate.
          text: 'label',
          fill: 'black',
          fontSize: 12,
          textAnchor: 'start',
          dy: -180,
        }
      ),
      Plot.ruleY([0]),
    ],
  });
}

// For selecting only active or TOO bodies
const activeOrTemporary = aircraftWithAge.filter((d) =>
  ['Active', 'Parked', 'Stored'].includes(d.status)
);

// Grouped by [operator, type] count
const groupedOpeType = d3.rollups(
  combinedWithYear.filter((d) => d.operator && d.type),
  (v) => v.length,
  (d) => d.operator,
  (d) => d.type
);

// Flattening data by formatting it
const flattenedOpeType = groupedOpeType.flatMap(([operator, types]) =>
  types.map(([type, count]) => ({
    operator,
    type,
    count,
  }))
);

// Extract top 10 (sort by total count)
const totalByOperator = d3
  .rollups(
    flattenedOpeType,
    (v) => d3.sum(v, (d) => d.count),
    (d) => d.operator
  )
  .sort((a, b) => d3.descending(a[1], b[1]))
  .slice(0, 10)
  .map((d) => d[0]); // Extract only the operator name

// Filter to top 10 only
const top10StackedData = flattenedOpeType.filter((d) =>
  totalByOperator.includes(d.operator)
);

// Plot
function stackedBarChart(data, { width } = {}) {
  return Plot.plot({
    width,
    height: 400,
    marginLeft: 90,
    x: {
      label: 'Number of Aircraft',
      grid: true,
    },
    y: {
      label: null,
      domain: totalByOperator,
    },
    color: {
      legend: true,
    },
    marks: [
      Plot.barX(data, {
        x: 'count',
        y: 'operator',
        fill: 'type', // Color coding by A350 / B777
        tip: true,
      }),
      Plot.ruleX([0]),
    ],
  });
}
```

```js
const aircraftByCountryAndType = d3.rollups(
  aircraftWithNumeric.filter((d) => d.numeric_code != null),
  (v) => v.length,
  (d) => d.numeric_code,
  (d) => d.type
);

const ratioMap = new Map(
  aircraftByCountryAndType.map(([iso, types]) => {
    const counts = Object.fromEntries(types);
    const a350 = counts['A350'] ?? 0;
    const b777 = counts['B777'] ?? 0;
    const total = a350 + b777;

    if (total === 0) return [iso, null]; // No aircraft → gray

    const ratio = a350 / total; // A350 ratio (0 to 1)
    return [iso, ratio];
  })
);

const interpolateColor = d3.interpolateRgbBasis([
  '#EFB118', // Orange (B777)
  '#3CA951', // Green
  '#4269D0', // Blue (A350)
]);

function getColorFromRatio(ratio) {
  return ratio == null ? '#ccc' : interpolateColor(ratio);
}

const countryFleetMap = new Map();

// counting process
for (const d of aircraftWithNumeric) {
  const code = d.numeric_code;
  if (code == null) continue;

  const entry = countryFleetMap.get(code) || { A350: 0, B777: 0 };
  entry[d.type] = (entry[d.type] || 0) + 1;
  countryFleetMap.set(code, entry);
}

function renderWorldMapRatio({ countries, countrymesh, ratioMap, width }) {
  return Plot.plot({
    projection: 'equal-earth',
    width,
    height: 460,
    color: {
      type: 'linear',
      domain: [0, 1],
      range: ['#EFB118', '#3CA951', '#4269D0'], // Orange → Green → Blue
      label: 'A350 Share',
      tickFormat: d3.format('.0%'),
      marginLeft: 10,
      legend: true,
      unknown: '#ccc',
    },
    marks: [
      Plot.sphere({ fill: 'white', stroke: 'currentColor' }),
      Plot.geo(countries, {
        fill: (d) => ratioMap.get(+d.id),
        title: (d) => {
          const id = +d.id;
          const name = d.properties.name;
          const fleet = countryFleetMap.get(id);
          if (!fleet) return `${name}\nNo data`;
          const a350 = fleet.A350 || 0;
          const b777 = fleet.B777 || 0;
          return `${name}\nA350: ${a350}\nB777: ${b777}`;
        },
        tip: true,
      }),
      Plot.geo(countrymesh, { stroke: 'white' }),
    ],
  });
}
```

```js
// ======================
// 🐛 DEBUG LOGS
// ======================

// console.log('✅ Loaded A350:', a350.length);
// console.log('✅ Loaded B777:', b777.length);

// console.log('🚚 Combined total:', combined.length);
// console.log(
//   '📅 Null delivered dates:',
//   combined.filter((d) => d.delivered && !d.year).length
// );

// console.log(
//   '🗂️ Unique original statuses:',
//   [...new Set(combined.map((d) => d.status))].sort()
// );
// console.log('📦 Status categories (status3):', [
//   ...new Set(classified.map((d) => d.status3)),
// ]);
// console.log('📊 Aggregated status data:', statusData);

// console.log(aircraftWithAge);

// console.log(top10StackedData);

// Unique extraction and sorting of operator list

// Extract top 10 (sort by total count)
/* const uniqueOperators = d3
  .rollups(
    flattenedOpeType,
    (v) => d3.sum(v, (d) => d.count),
    (d) => d.operator
  )
  .sort((a, b) => d3.descending(a[1], b[1]))
  .map((d) => d[0]); // Extract only the operator name */

// Display
// console.log(uniqueOperators);

/* console.log(classifiedWithCountry);

const unknownRecords = classifiedWithCountry.filter(
  (d) => d.country === 'Unknown'
);
console.log([...new Set(unknownRecords.map((d) => d.operator))]);
const nullishOperators = classified.filter(
  (d) => !d.operator || d.operator.trim() === ''
);
console.log('Missing operator values:', nullishOperators.length); */

/* console.log('✅ Map key example:', [...countryCountMap.entries()].slice(0, 5));
// [[36, 42], [124, 18], ...]
console.log(
  '🌍 countries sample ID:',
  countries.features.slice(0, 3).map((d) => d.id)
);
// [36, 124, ...] */

// console.log(typeof countries.features[0].id);
```
