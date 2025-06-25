---
theme: dashboard
title: GA4 Sample Dashboard
toc: false
---

# GA4 User Overview 📊

<!-- Load and prepare GA4 data -->

```js
const data = await import("./data/ecommerce.js").then((m) => m.default());
```

<!-- A time-based color scale (optional) -->

```js
const color = Plot.scale({
  color: {
    type: "categorical",
    unknown: "var(--theme-foreground-muted)",
  },
});
```

<!-- Cards with summary metrics -->
<div class="grid grid-cols-3">
  <div class="card">
    <h2>Total Days</h2>
    <span class="big">${data.length.toLocaleString("en-US")}</span>
  </div>
  <div class="card">
    <h2>Max Daily Users</h2>
    <span class="big">${d3.max(data, d => d.total_users).toLocaleString("en-US")}</span>
  </div>
  <div class="card">
    <h2>Average Daily Users</h2>
    <span class="big">${Math.round(d3.mean(data, d => d.total_users)).toLocaleString("en-US")}</span>
  </div>
</div>

<!-- Define chart function -->

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
    marks: [Plot.line(data, { x: "event_date", y: "total_users", stroke: "steelblue", tip: true }), Plot.ruleY([0])],
  });
}
```

<!-- Chart rendering -->
<div class="grid grid-cols-1">
  <div class="card">
    ${resize((width) => userTrendChart(data, { width }))}
  </div>
</div>

Data source: Google Analytics 4 Public Sample  
Dataset: `bigquery-public-data.ga4_obfuscated_sample_ecommerce`
