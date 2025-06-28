---
theme: dashboard
title: A350 vs Boeing777
toc: true
---

<!-- ETL -->

```js
// Extract
const a350 = await FileAttachment('data/airbus_a350.csv').csv();
const b777 = await FileAttachment('data/boeing_777.csv').csv();

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

// Prepare to tag "status3"
const statusMap = {
  Active: 'In Service',
  'On Order': 'On Order',
  'Not Built': 'On Order',
  Parked: 'Out of Service',
  Stored: 'Out of Service',
  Preserved: 'Out of Service',
  'Partially Preserved': 'Out of Service',
  Scrapped: 'Out of Service',
  'Partially Scrapped': 'Out of Service',
  'Written Off': 'Out of Service',
};

// Tag "status3" to each record
const classified = combinedWithYear.map((d) => ({
  ...d,
  status3: statusMap[d.status] || 'Unknown',
}));

// Rollup for Current Operational Status
const statusRollups = d3.rollups(
  classified.filter((d) => d.status3 !== 'Unknown'),
  (v) => v.length,
  (d) => d.status3,
  (d) => d.type
);

// Flatten for Current Operational Status
const statusData = statusRollups.flatMap(([status, types]) =>
  types.map(([type, count]) => ({
    status,
    type,
    count,
  }))
);
```

# A350 vs Boeing777

Data as of June 2025 \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_🛫

## Delivery Timeline

Number of aircraft delivered per year

```js
// Compile the number of deliveries by year and model
const tempRollups = d3.rollups(
  combinedWithYear.filter((d) => d.year),
  (v) => v.length,
  (d) => d.year,
  (d) => d.type
);

const deliveryByYear = tempRollups.flatMap(([year, types]) =>
  types.map(([type, count]) => ({
    year,
    type,
    count,
  }))
);

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
```

<div class="grid grid-cols-1">
  <div class="card">
    <h2>Aircraft Deliveries by Year</h2>
    ${resize(width => deliveryChart(deliveryByYear, { width }))}
  </div>
</div>

## Current Operational Status

Distribution of aircraft by status

```js
// Define domain order
const statusOrder = ['In Service', 'On Order', 'Out of Service'];

function statusChartFx(data, { width } = {}) {
  return Plot.plot({
    width,
    height: 300,
    marginBottom: 60,
    marginTop: 30,
    fx: {
      label: null,
      tickRotate: -45,
      padding: 0,
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
        fill: 'type',
        tip: true,
      }),
      Plot.ruleY([0]),
    ],
  });
}
```

<div class="grid grid-cols-1">
  <div class="card">
    <h2>Current Operational Status</h2>
    ${resize(width => statusChartFx(statusData, { width }))}
  </div>
</div>

## Aircraft Age and Replacement Trends

- Histogram of years in service

```js

```

## Who Operates These Aircraft?

- Top 10 airlines by fleet size (Chart 4)

## Appendix: Regional Adoption Patterns

- Aircraft distribution by region (Chart 5)

Data source: [Planespotters B777](https://www.planespotters.net/aircraft/production/boeing-777), [Planespotters A350](https://www.planespotters.net/aircraft/production/airbus-a350)

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

console.log([...new Set(statusData.map((d) => d.status))]);
```
