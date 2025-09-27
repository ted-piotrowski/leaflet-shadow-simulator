# leaflet-shadow-simulator

**Using Mapbox GL JS/Maplibre GL JS?** Try [mapbox-gl-shadow-simulator](https://www.npmjs.com/package/mapbox-gl-shadow-simulator)

Shadow simulator for Leaflet. Visualize sunlight and shadow on a map for any date and time of year.

[Example](https://ted-piotrowski.github.io/leaflet-shadow-simulator/examples/map.html)

[![Leaflet Shadow Simulator demo](/demo.jpg)](https://ted-piotrowski.github.io/leaflet-shadow-simulator/examples/map.html)

## Download

[unpkg CDN](https://unpkg.com/leaflet-shadow-simulator/dist/leaflet-shadow-simulator.umd.min.js)

## Installation

In a browser:

`<script src="https://unpkg.com/leaflet-shadow-simulator/dist/leaflet-shadow-simulator.umd.min.js"></script>`

Using npm:

`npm i leaflet-shadow-simulator --save`

## Usage

In a browser:

```html
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.3/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.3/dist/leaflet.js"></script>
<script src="https://unpkg.com/leaflet-shadow-simulator/dist/leaflet-shadow-simulator.umd.min.js"></script>
<script>
  var map = L.map("mapid"); 

  const shadeMap = L.shadeMap({
    date: new Date(),    // display shadows for current date
    color: '#01112f',    // shade color
    opacity: 0.7,        // opacity of shade color
    apiKey: "XXXXXX",    // obtain from https://shademap.app/about/
    terrainSource: {
      tileSize: 256,       // DEM tile size
      maxZoom: 15,         // Maximum zoom of DEM tile set
      getSourceUrl: ({ x, y, z }) => {
        // return DEM tile url for given x,y,z coordinates
        return `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${z}/${x}/${y}.png`
      },
      getElevation: ({ r, g, b, a }) => {
        // return elevation in meters for a given DEM tile pixel
        return (r * 256 + g + b / 256) - 32768
      }
    },
  }).addTo(map);

  // advance shade by 1 hour
  shadeMap.setDate(new Date(Date.now() + 1000 * 60 * 60)); 

  // sometime later...
  // ...remove layer
  shadeMap.remove();
</script>
```

Using Node.js:

```javascript
import * as L from 'leaflet'
import ShadeMap from 'leaflet-shadow-simulator';

const map = L.map("mapid"); 

const shadeMap = new ShadeMap({
  date: new Date(),    // display shadows for current date
  color: '#01112f',    // shade color
  opacity: 0.7,        // opacity of shade color
  apiKey: "XXXXXX",    // obtain from https://shademap.app/about/
  terrainSource: {
    tileSize: 256,       // DEM tile size
    maxZoom: 15,         // Maximum zoom of DEM tile set
    getSourceUrl: ({ x, y, z }) => {
      // return DEM tile url for given x,y,z coordinates
      return `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${z}/${x}/${y}.png`
    },
    getElevation: ({ r, g, b, a }) => {
      // return elevation in meters for a given DEM tile pixel
      return (r * 256 + g + b / 256) - 32768
    }
  },
}).addTo(map);

// advance shade by 1 hour
shadeMap.setDate(new Date(Date.now() + 1000 * 60 * 60)); 

// sometime later
// ...remove layer
shadeMap.remove();
```

### Constructor options

Property name | Type | Default value | Comment
:--- | :--- | :--- | :---
`apiKey` | `String` | `''` | See [https://shademap.app/about/](https://shademap.app/about/)
`date` | `Date` | `new Date()` | Sun's position in the sky is based on this date
`color` | `String` | `#000` | 3 or 6 digit hexadecimal number
`opacity` | `Number` | `0.3`
`sunExposure` | `Object` | See [sunExposure](#sunExposure) | Display sun exposure for provided date range 
`terrainSource` | `Object` | See [terrainSource](#terrainsource) | Specify DEM or DSM tiles containing terrain elevation data
`getFeatures` | `Function` | See [getFeatures](#getfeatures) | Returns GeoJSON of objects, such as buildings, to display on the map

#### terrainSource

An object describing a DEM tile set to use for terrain shadows

Property name | Type | Default value | Comment
:--- | :--- | :--- | :---
`maxZoom` | `Number` | `15` | Max zoom for custom DEM tile source
`tileSize` | `Number` | `256` | Tile size for custom DEM tile source
`sourceUrl` | `Function` | `Returns tile encoding 0m elevation for all locations` | Returns url of DEM tile for given `(x, y, z)` coordinate
`getElevation` | `Function` | `return (r * 256 + g + b / 256) - 32768` | Returns elevation in meters for each (r,g,b,a) pixel of DEM tile

#### sunExposure

An object describing sun exposure settings
Property name | Type | Default value | Comment
:--- | :--- | :--- | :---
`enabled` | `Boolean` | `false` | Should sun exposure be displayed
`startDate` | `Date` | `new Date()` | Start date of sun exposure time interval
`endDate` | `Date` | `new Date()` | End date of sun exposure time interval
`iterations` | `number` | `32` | Number of discrete chunks to calculate shadows for between startDate and endDate. A larger number will provide more detail but take longer to compute.


##### Open Data on AWS for terrainSource

A global dataset providing bare-earth terrain heights, tiled for easy usage and provided on S3 - [More info](https://registry.opendata.aws/terrain-tiles/)

```javascript
{
  tileSize: 256,
  maxZoom: 15,
  getSourceUrl: ({x, y, z}) => {
    return `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${z}/${x}/${y}.png`;
  },
  getElevation: ({r, g, b, a}) => {
    return (r * 256 + g + b / 256) - 32768;
  }
}
```

##### Mapbox Terrain DEM V1 for terrainSource

Mapbox Terrain-DEM v1 is a Mapbox-provided raster tileset is a global elevation layer. This tileset contains raw height values in meters in the Red, Green, and Blue channels of PNG tiles that can be decoded to raw heights in meters - [More info](https://docs.mapbox.com/data/tilesets/reference/mapbox-terrain-dem-v1/) 

```javascript
{
  tileSize: 514,
  maxZoom: 14,
  getSourceUrl: ({x, y, z}) => {
    const subdomain = ['a', 'b', 'c', 'd'][(x + y) % 4];
    return `https://${subdomain}.tiles.mapbox.com/raster/v1/mapbox.mapbox-terrain-dem-v1/${z}/${x}/${y}.webp?sku=101wuwGrczDtH&access_token=${MAPBOX_API_KEY}`;
  },
  getElevation: ({r, g, b, a}) => {
    return -10000 + ((r * 256 * 256 + g * 256 + b) * .1);
  }
}
```

##### Maptiler Terrain RGB v2

[More info](https://cloud.maptiler.com/tiles/terrain-rgb-v2/)

```javascript
{
  tileSize: 514,
  maxZoom: 12,
  getSourceUrl: ({x, y, z}) => {
    return `https://api.maptiler.com/tiles/terrain-rgb-v2/${z}/${x}/${y}.webp?key=${MAPTILER_KEY}`;
  },
  getElevation: ({r, g, b, a}) => {
    return -10000 + ((r * 256 * 256 + g * 256 + b) * .1);
  }
}
```

#### getFeatures

Returns a GeoJSON collection of features whose shadows will be displayed on the map. Currently only supports `Polygon` and `MultiPolygon`.

##### Adds a 1000 meter tall structure near Alexandria, Egypt

```javascript
getFeatures: () => {
  return [{
    "type": "Feature",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [29.8148007, 31.2240349],
        [29.8248007, 31.2240349],
        [29.8248007, 31.2140349],
        [29.8148007, 31.2140349],
      ]
    },
    "properties": {
      "height": 1000,
      "render_height": 1000,
      "name": "Alexandria column"
    }
  },
},
```

##### Using overpass turbo to load buildings

```javascript
getFeatures: async () => {
  if (map.getZoom() > 15) {
    const bounds = map.getBounds();
    const north = bounds.getNorth();
    const south = bounds.getSouth();
    const east = bounds.getEast();
    const west = bounds.getWest();
    const query = `https://overpass-api.de/api/interpreter?data=%2F*%0AThis%20has%20been%20generated%20by%20the%20overpass-turbo%20wizard.%0AThe%20original%20search%20was%3A%0A%E2%80%9Cbuilding%E2%80%9D%0A*%2F%0A%5Bout%3Ajson%5D%5Btimeout%3A25%5D%3B%0A%2F%2F%20gather%20results%0A%28%0A%20%20%2F%2F%20query%20part%20for%3A%20%E2%80%9Cbuilding%E2%80%9D%0A%20%20way%5B%22building%22%5D%28${south}%2C${west}%2C${north}%2C${east}%29%3B%0A%29%3B%0A%2F%2F%20print%20results%0Aout%20body%3B%0A%3E%3B%0Aout%20skel%20qt%3B`;
    const response = await fetch(query)
    const json = await response.json();
    const geojson = osmtogeojson(json);
    // If no building height, default to one storey of 3 meters
    geojson.features.forEach(feature => {
      if (!feature.properties) {
        feature.properties = {};
      }
      if (!feature.properties.height) {
        feature.properties.height = 3;
      }
    });
    return geojson.features;
  }
  return [];
},
```

### Check if location is in the sun or shade

The shadow layer must render before you can check if a location is in the sun. You can make sure the shadow layer is rendered by listening for the `idle` event.

```javascript
shadeMap.on('idle', async () => {
  const latlng =  [42.12, -121.74];
  const { x, y } = map.latLngToContainerPoint(latlng);
  const inTheSun = await shadeMap.isPositionInSun(x, y);
  console.log(`Position ${lat},${lng} is in ${inTheSun ? 'sun' : 'shade'}`);
})
```

[See example](https://ted-piotrowski.github.io/leaflet-shadow-simulator/examples/markers.html)

### Available functions

`setDate(date: Date)` - update shade layer to reflect new `date`

`setColor(color: String)` - change shade color

`setOpacity(opacity: Number)` - change shade opacity

`setSunExposure(enabled: Boolean, options: SunExposureOptions)` - toggle between shadows and sun exposure mode

`getHoursOfSun(x: Number, y: Number)` - if sun exposure mode enabled, returns the hours of sunlight for a given pixel on the map

`remove()` - remove the layer from the map

`isPositionInSun(x: Number, y: Number)` - check if a position is in the sun

`isPositionInShade(x: Number, y: Number)` - check if a position is in the shade