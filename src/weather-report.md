# Weather report

<figure class="wide">
  <div id="map" style="height: 400px; margin: 1rem 0; border-radius: 8px;"></div>
  <figcaption>This grid point covers the south end of the Golden Gate Bridge.</figcaption>
</figure>

```js
const forecast = FileAttachment("./data/forecast.json").json();
```

```js
import * as L from "npm:leaflet";

const mapboxPublicKey = process.env.MAPBOX_PUBLIC_KEY;

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

<div class="grid grid-cols-1">
  <div class="card">${resize((width) => temperaturePlot(forecast, {width}))}</div>
</div>

<div class="grid grid-cols-2">
  <div class="card grid-colspan-2">one–two</div>
  <div class="card">three</div>
  <div class="card">four</div>
</div>
