---
theme: dashboard
title: A350 vs Boeing777
toc: true
---

# A350 vs Boeing777

\*\*

## Delivery Timeline

- Number of aircraft delivered per year (Chart 1)

<!-- ETL -->

```js
const a350 = await FileAttachment('data/airbus_a350.csv').csv();
const b777 = await FileAttachment('data/boeing_777.csv').csv();

// Combine and tag type
const taggedA350 = a350.map((d) => ({ ...d, type: 'A350' }));
const taggedB777 = b777.map((d) => ({ ...d, type: 'B777' }));

const combined = [...taggedA350, ...taggedB777];

// YYYY-MM-DD parser
const parseISO = d3.timeParse('%Y-%m-%d');

// extraction
combined.forEach((d) => {
  const date = d.delivered ? parseISO(d.delivered.trim()) : null;
  d.year = date instanceof Date && !isNaN(date) ? date.getFullYear() : null;
});

// Compile the number of deliveries by year and model
const tempRollups = d3.rollups(
  combined.filter((d) => d.year),
  (v) => v.length,
  (d) => d.year,
  (d) => d.type
);

console.log(JSON.stringify(tempRollups, null, 2));

const deliveryByYear = tempRollups.flatMap(([year, types]) =>
  types.map(([type, count]) => ({
    year,
    type,
    count,
  }))
);

// Check unparsed data in the log
console.log(
  'Unparsed delivered dates:',
  combined.filter((d) => d.year === null && d.delivered).map((d) => d.delivered)
);
```

<!-- function to draw plot -->

```js
console.log('deliveryByYear', deliveryByYear);

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

- Distribution of aircraft by status (Chart 2)

## Aircraft Age and Replacement Trends

- Histogram of years in service (Chart 3)

## Who Operates These Aircraft?

- Top 10 airlines by fleet size (Chart 4)

## Appendix: Regional Adoption Patterns

- Aircraft distribution by region (Chart 5)

Data source: https://www.planespotters.net/aircraft/production/boeing-777, https://www.planespotters.net/aircraft/production/airbus-a350
