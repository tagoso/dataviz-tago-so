# Weather report

This is a GeoJSON `Feature` object of a `Polygon` geometry representing the grid square. The `properties` object within contains the hourly forecast data. You can display it on a map with <a href="./lib/leaflet">Leaflet</a>, if you like.

<figure class="wide">
  <div id="map" style="height: 400px; margin: 1rem 0; border-radius: 8px;"></div>
  <figcaption>This grid point covers the south end of the Golden Gate Bridge.</figcaption>
</figure>

```js
const forecast = FileAttachment("./data/forecast.json").json();
```

```js
import * as L from "npm:leaflet";

const mapboxPublicKey = "pk.eyJ1IjoidGFnb3NvIiwiYSI6ImNtYzRwMzlmZDA2eW8ybHNjcHJmYnkzZ3MifQ.Pg0d5T29Li7CvoWz3fVkXg";

const map = L.map(document.querySelector("#map"));
const tile = L.tileLayer(
  `https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/256/{z}/{x}/{y}@2x?access_token=${mapboxPublicKey}`,
  {
    attribution:
      '© <a href="https://www.mapbox.com/feedback/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }
).addTo(map);

const geo = L.geoJSON().addData(forecast).addTo(map);
map.fitBounds(geo.getBounds(), { padding: [50, 50] });
invalidation.then(() => map.remove());
```

```js
import { temperaturePlot } from "./components/temperaturePlot.js";
display(temperaturePlot(forecast));
```

```js
display(
  Plot.plot({
    title: "Hourly temperature forecast",
    x: { type: "utc", ticks: "day", label: null },
    y: { grid: true, inset: 10, label: "Degrees (F)" },
    marks: [
      Plot.lineY(forecast.properties.periods, {
        x: "startTime",
        y: "temperature",
        z: null, // varying color, not series
        stroke: "temperature",
        curve: "step-after",
      }),
    ],
  })
);
```
