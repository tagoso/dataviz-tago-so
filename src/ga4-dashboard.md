---
theme: dashboard
title: GA4 Sample Dashboard
toc: false
---

# GA4 User Overview 📊

```js
// Execute the data loader
const ecommerceData = FileAttachment("data/ecommerce.json").json({ typed: true });
```

```js
const color = Plot.scale({
  color: {
    type: "categorical",
    unknown: "var(--theme-foreground-muted)",
  },
});
```

<div class="grid grid-cols-3">
  <div class="card">
    <h2>Total Days</h2>
    <span class="big">${ecommerceData.length.toLocaleString("en-US")}</span>
  </div>
  <div class="card">
    <h2>Max Daily Users</h2>
    <span class="big">${d3.max(ecommerceData, d => d.total_users).toLocaleString("en-US")}</span>
  </div>
  <div class="card">
    <h2>Average Daily Users</h2>
    <span class="big">${Math.round(d3.mean(ecommerceData, d => d.total_users)).toLocaleString("en-US")}</span>
  </div>
</div>

```js
function userTrendChart(data, { width } = {}) {
  return Plot.plot({
    title: "Daily Unique Users",
    width,
    height: 300,
    x: {
      label: "Date",
      type: "band",
      tickRotate: -45,
    },
    y: {
      grid: true,
      label: "Users",
    },
    marks: [
      Plot.line(data, {
        x: "event_date",
        y: "total_users",
        stroke: "steelblue",
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

Data source: Google Analytics 4 Public Sample  
Dataset: `bigquery-public-data.ga4_obfuscated_sample_ecommerce`
