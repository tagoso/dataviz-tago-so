---
theme: dashboard
title: GA4 Sample Dashboard
toc: false
---

# GA4 User Overview Sample 📊

Obtained data from [Google Analytics 4 Public Sample](https://developers.google.com/analytics/bigquery/web-ecommerce-demo-dataset) via BigQuery.

```js
// Execute the data loader
const ecommerceData = FileAttachment('data/ecommerce.json').json({
  typed: true,
});
```

```js
// Compute daily totals and average daily users
const dailyTotals = d3.rollups(
  ecommerceData,
  (v) => d3.sum(v, (d) => d.total_users),
  (d) => d.event_date
);
const avgUsers = Math.round(d3.mean(dailyTotals, ([, total]) => total));

ecommerceData.forEach((d) => {
  d.date = new Date(
    +d.event_date.slice(0, 4),
    +d.event_date.slice(4, 6) - 1,
    +d.event_date.slice(6, 8)
  );
});
```

```js
const color = Plot.scale({
  color: {
    type: 'categorical',
    unknown: 'var(--theme-foreground-muted)',
  },
});
```

<div class="grid grid-cols-3">
  <div class="card">
    <h2>Total Days</h2>
    <span class="big">${new Set(ecommerceData.map(d => d.event_date)).size.toLocaleString("en-US")}</span>
  </div>
  <div class="card">
    <h2>Max Daily Users</h2>
    <span class="big">${d3.max(ecommerceData, d => d.total_users).toLocaleString("en-US")}</span>
  </div>
  <div class="card">
    <h2>Average Daily Users</h2>
    <span class="big">${avgUsers.toLocaleString("en-US")}</span>
  </div>
</div>

```js
function userTrendChart(data, { width } = {}) {
  return Plot.plot({
    title: 'Daily Unique Users',
    width,
    height: 300,
    x: {
      label: 'Date',
      type: 'time',
      tickFormat: d3.timeFormat('%b %d'),
      tickRotate: -45,
    },
    y: {
      grid: true,
      label: 'Users',
    },
    marks: [
      Plot.line(data, {
        x: 'date',
        y: 'total_users',
        stroke: 'steelblue',
        tip: true,
      }),
      Plot.ruleY([0]),
    ],
  });
}
```

<div class="grid grid-cols-1">
  <div class="card">
    ${resize((width) => userTrendChart(ecommerceData, { width }))}
  </div>
</div>
