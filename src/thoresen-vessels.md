---
theme: dashboard
title: '🚢 Thoresen Vessels World Map'
toc: false
---

```js
const response = await fetch(
  `https://raw.githubusercontent.com/tagoso/docker-ais/main/data/ais_latest.json?nocache=${Date.now()}`
);

const data = await response.json();
console.log(data);

const shipName = 'THOR ACHIEVER';
const ship = data.find((d) => d.name === shipName);

let timestamp = ship?.timestamp;
let sog = ship?.sog;
let cog = ship?.cog;

const land50m = await FileAttachment('data/land-50m.json').json();
const landSeeThrough = await FileAttachment('data/countries-110m.json').json();
const land = topojson.feature(land50m, land50m.objects.land);
const landFeatures = topojson.feature(
  landSeeThrough,
  landSeeThrough.objects.countries
).features;

const scale = Math.max(140, Math.min(600, Math.floor(window.innerWidth * 0.3)));

const formattedTime = new Date(timestamp).toLocaleString();

const latest = new Date(
  Math.max(...data.map((d) => new Date(d.timestamp)))
).toLocaleString();
```

# 🚢 Thoresen Vessels World Map

📅 Last update: **${latest}**

${shipName}

🕒 Last seen: ${formattedTime}<br>
🚢 Speed: ${sog ?? "?"} knots<br>
🧭 Direction: ${cog ?? "?"}°

```js
function vesselMapPlot(data, ship, land, { width = 900 } = {}) {
  const scale = Math.max(140, Math.min(600, Math.floor(width * 0.3)));

  return Plot.plot({
    projection: 'equal-earth',
    width,
    height: scale * 1.5,
    marks: [
      Plot.geo(land, { fill: '#eee' }),
      Plot.graticule(),
      Plot.sphere(),
      Plot.dot(data, {
        x: (d) => d.lon,
        y: (d) => d.lat,
        r: (d) => (d.name === ship ? 4 : 1),
        fill: (d) => {
          const diff = Date.now() - new Date(d.timestamp);
          if (diff < 86400000) return 'green'; // < 1 day
          if (diff < 1209600000) return 'orange'; // < 14 days
          return 'transparent'; // old
        },
        stroke: (d) =>
          d.name === ship
            ? 'black'
            : Date.now() - new Date(d.timestamp) >= 1209600000
            ? 'gray'
            : 'none',
        strokeWidth: (d) =>
          d.name === ship
            ? 2
            : Date.now() - new Date(d.timestamp) >= 1209600000
            ? 1
            : 0,
        tip: true,
        title: (d) => `${d.name} (${d.mmsi})\n${d.timestamp}`,
      }),
    ],
  });
}
```

```js
function autoSpinGlobe(data, landFeatures, { width = 600 } = {}) {
  const scale = Math.max(140, Math.min(600, Math.floor(width * 0.3)));

  const svg = d3
    .create('svg')
    .attr('width', scale * 2.5)
    .attr('height', scale * 2);

  const projection = d3
    .geoOrthographic()
    .scale(scale)
    .translate([scale, scale]);
  const projectionBack = d3
    .geoOrthographic()
    .scale(scale)
    .translate([scale, scale]);

  const path = d3.geoPath(projection);
  const pathBack = d3.geoPath(projectionBack);

  let angle = 0;
  const centerLat = 25;

  const render = () => {
    projection.rotate([-angle, -centerLat, 0]);
    projectionBack.rotate([180 - angle, centerLat, 0]);
    svg.selectAll('*').remove();

    const backGroup = svg
      .append('g')
      .attr('transform', `scale(-1,1) translate(${-2 * scale},0)`);

    backGroup
      .append('path')
      .datum({ type: 'Sphere' })
      .attr('fill', 'rgba(200,200,255,0.01)')
      .attr('stroke', 'none')
      .attr('d', pathBack);

    backGroup
      .selectAll('path.land')
      .data(landFeatures)
      .join('path')
      .attr('class', 'land')
      .attr('fill', '#f0f0f0')
      .attr('stroke', 'black')
      .attr('stroke-opacity', 0.1)
      .attr('stroke-width', 0.3)
      .attr('d', pathBack);

    backGroup
      .append('path')
      .datum(d3.geoGraticule10())
      .attr('fill', 'none')
      .attr('stroke', 'gray')
      .attr('stroke-opacity', 0.1)
      .attr('stroke-width', 0.4)
      .attr('d', pathBack);

    svg
      .append('path')
      .datum({ type: 'Sphere' })
      .attr('fill', 'rgba(200,200,255,0.2)')
      .attr('stroke', 'none')
      .attr('d', path);

    svg
      .append('g')
      .selectAll('path')
      .data(landFeatures)
      .join('path')
      .attr('fill', '#f0f0f0')
      .attr('stroke', 'black')
      .attr('stroke-opacity', 0.2)
      .attr('stroke-width', 0.3)
      .attr('d', path);

    svg
      .append('path')
      .datum(d3.geoGraticule10())
      .attr('fill', 'none')
      .attr('stroke', 'gray')
      .attr('stroke-opacity', 0.3)
      .attr('stroke-width', 0.3)
      .attr('d', path);

    const ships = svg
      .append('g')
      .attr('class', 'ships')
      .selectAll('g.ship')
      .data(data)
      .join('g')
      .attr('class', 'ship')
      .attr('transform', (d) => {
        const [x, y] = projection([d.lon, d.lat]);
        return `translate(${x}, ${y})`;
      });

    ships
      .append('circle')
      .attr('r', 3)
      .attr('fill', (d) => {
        const diff = Date.now() - new Date(d.timestamp);
        if (diff < 86400000) return 'green';
        if (diff < 1209600000) return 'orange';
        return 'none';
      })
      .attr('stroke', (d) =>
        Date.now() - new Date(d.timestamp) >= 1209600000 ? 'gray' : 'none'
      )
      .attr('stroke-width', (d) =>
        Date.now() - new Date(d.timestamp) >= 1209600000 ? 0.8 : 0
      );

    ships
      .append('text')
      .text((d) => d.name)
      .attr('x', -10)
      .attr('y', 15)
      .attr('font-size', 8)
      .attr('fill', 'black');

    angle = (angle - 0.15) % 360;
    requestAnimationFrame(render);
  };

  render();
  return svg.node();
}
```

<div class="card">
  <h2>🗺 Vessel Positions</h2>
  ${resize(width => vesselMapPlot(data, 'THOR ACHIEVER', land, { width }))}
</div>

<div class="card">
  <h2>🌍 Globe View</h2>
  ${autoSpinGlobe(data, landFeatures, { width: 800 })}
</div>

## Notes

This project is for the Thoresen sailers and their family 🏠👥🚢. This covers only the AIS Stream by volunteers. Updated every 30 mins to 1 hour.

🟢 = Located in last 24 hours  
🟠 = Located in last 14 days  
⚪️ = Located more than 14 days ago
