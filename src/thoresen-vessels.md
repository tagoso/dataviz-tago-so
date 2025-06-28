---
theme: light
title: '🚢 Thoresen Vessels World Map'
toc: false
---

# Thoresen Vessels Locator 📍

Last updated: **${latest}**

<label for="selectedShip">Select a ship:</label>
<select name="selectedShip" id="selectedShip"></select>

<strong><span id="info-ship">---</span></strong><br>
🕒 Last seen: <span id="info-time">---</span><br>
🧭 Direction: <span id="info-direction">?</span>° <span id="direction-arrow" style="display: inline-block; transform: rotate(0deg);">⬆︎</span><br>
🚤 Speed: <span id="info-speed">?</span> knots

<figure class="wide">
  <div id="map" style="height: 400px; margin: 1rem 0; border-radius: 8px;"></div>
</figure>

```js
// 🚢 Data acquisition and preprocessing for maps
const response = await fetch(
  `https://raw.githubusercontent.com/tagoso/docker-ais/main/data/ais_latest.json?nocache=${Date.now()}`
);
const data = await response.json();

const land50m = await FileAttachment('data/land-50m.json').json();
const landSeeThrough = await FileAttachment('data/countries-110m.json').json();
const land = topojson.feature(land50m, land50m.objects.land);
const landFeatures = topojson.feature(
  landSeeThrough,
  landSeeThrough.objects.countries
).features;

const latest = new Date(
  Math.max(...data.map((d) => new Date(d.timestamp)))
).toLocaleString();

// 🚢 default settings and localStorage
const STORAGE_KEY = 'selectedShip';
const defaultShip = 'THOR ACHIEVER';
const savedShip = localStorage.getItem(STORAGE_KEY);

let shipName = savedShip || defaultShip;
const shipNames = data.map((d) => d.name).sort();
const selectElement = document.getElementById('selectedShip');

// Select box construction
shipNames.forEach((name) => {
  const option = document.createElement('option');
  option.value = name;
  option.textContent = name;
  if (name === shipName) option.selected = true;
  selectElement.appendChild(option);
});

// 🗺 redraw function
let map; // Controlling map with global references

function renderShip(shipName) {
  const ship = data.find((d) => d.name === shipName);
  if (!ship) return;

  // information update
  const infoShip = document.querySelector('#info-ship');

  const timestamp = new Date(ship.timestamp);
  const diffHours = (Date.now() - timestamp.getTime()) / (1000 * 60 * 60);

  if (diffHours <= 4) {
    infoShip.textContent = 'Position OK ⚓️';
    infoShip.style.color = 'green';
  } else {
    infoShip.textContent = '⚠ Missing! 🌊🚢';
    infoShip.style.color = 'red'; // warning in red
  }

  // Compas
  const infoDirection = document.querySelector('#info-direction');
  const directionArrow = document.querySelector('#direction-arrow');

  if (ship.cog != null) {
    infoDirection.textContent = Math.round(ship.cog);

    // Rotation (CSS is clockwise, so reverse it)
    directionArrow.style.transform = `rotate(${ship.cog}deg)`;
    directionArrow.style.color = 'grey';
  } else {
    infoDirection.textContent = '?';
    directionArrow.style.transform = 'rotate(0deg)';
    directionArrow.style.color = 'gray';
  }

  document.querySelector('#info-time').textContent = new Date(
    ship.timestamp
  ).toLocaleString();
  document.querySelector('#info-direction').textContent = ship.cog ?? '?';
  document.querySelector('#info-speed').textContent = ship.sog ?? '?';

  // Map initialization or reset
  if (map) {
    map.remove(); // erase old maps
  }

  map = L.map(document.querySelector('#map')).setView([ship.lat, ship.lon], 9);

  L.tileLayer(
    `https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoidGFnb3NvIiwiYSI6ImNtYzRwMzlmZDA2eW8ybHNjcHJmYnkzZ3MifQ.Pg0d5T29Li7CvoWz3fVkXg`,
    {
      attribution:
        '© <a href="https://www.mapbox.com/feedback/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }
  ).addTo(map);

  const geojson = {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [ship.lon, ship.lat],
    },
    properties: {
      name: ship.name,
      timestamp: ship.timestamp,
    },
  };

  L.geoJSON().addData(geojson).addTo(map);

  // Discard Leaflet map when discarding cells
  invalidation.then(() => map.remove());

  renderVesselPlot(data, shipName, land);
}

// 🚢 Register event listener & save selected ship to localStorage
selectElement.addEventListener('change', (e) => {
  const selected = e.target.value;

  // save
  localStorage.setItem('selectedShip', selected);

  // Update display
  renderShip(selected);
});

// Event listener registration
renderShip(shipName);
```

```js
// 📊 Vessel Plot Drawing Function
function renderVesselPlot(data, shipName, land, width = 900) {
  const plotContainer = document.querySelector('#plot');
  plotContainer.innerHTML = ''; // Clear previous drawing

  const scale = Math.max(140, Math.min(600, Math.floor(width * 0.3)));

  const plot = Plot.plot({
    projection: 'equal-earth',
    width,
    height: scale * 1.5,
    marks: [
      Plot.geo(land, { fill: '#cfcfcf' }),
      Plot.graticule(),
      Plot.sphere(),
      Plot.dot(data, {
        x: (d) => d.lon,
        y: (d) => d.lat,
        r: (d) => (d.name === shipName ? 4 : 1),
        fill: (d) => {
          const diff = Date.now() - new Date(d.timestamp);
          if (diff < 14400000) return 'green'; // < 4h
          if (diff < 604800000) return 'orange'; // < 7d
          return 'transparent'; // old
        },
        stroke: (d) =>
          d.name === shipName
            ? 'black'
            : Date.now() - new Date(d.timestamp) >= 604800000
            ? 'gray'
            : 'none',
        strokeWidth: (d) =>
          d.name === shipName
            ? 2
            : Date.now() - new Date(d.timestamp) >= 604800000
            ? 1
            : 0,
        tip: true,
        title: (d) => `${d.name} (${d.mmsi})\n${d.timestamp}`,
      }),
    ],
  });

  plotContainer.appendChild(plot);
}
```

```js
// Function for 🌍 Globe View
function autoSpinGlobe(data, landFeatures, { width = 600 } = {}) {
  const scale = Math.max(140, Math.min(600, Math.floor(width * 0.4)));

  const svg = d3
    .create('svg')
    .attr('width', width)
    .attr('height', width * 0.9);

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
        if (diff < 14400000) return 'green';
        if (diff < 604800000) return 'orange';
        return 'none';
      })
      .attr('stroke', (d) =>
        Date.now() - new Date(d.timestamp) >= 604800000 ? 'gray' : 'none'
      )
      .attr('stroke-width', (d) =>
        Date.now() - new Date(d.timestamp) >= 604800000 ? 0.8 : 0
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
  <div id="plot-wrapper" style="overflow-x: auto;">
    <div id="plot" style="min-width: 900px;"></div>
  </div>
</div>

<div class="card">
  <h2>🌍 Globe View</h2>
    ${autoSpinGlobe(data, landFeatures, { width: Math.min(window.innerWidth * 0.85, 1000) })}
</div>

## Notes

This project is for the [Thoresen](https://www.thoresen.com/) sailors and their family 🏠👥🩷🚢

This covers only the [AIS Stream](https://aisstream.io/) by volunteers. Gets updated every 15-30 mins.

🟢 = Located in the last 4 hours  
🟠 = Located in the last 7 days  
⚪️ = Located more than 7 days ago
