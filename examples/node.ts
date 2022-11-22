import * as L from 'leaflet';
import Simulator from 'leaflet-shadow-simulator';

/* Leaflet setup */
var map = L.map("mapid").setView([47.69682, -121.92078], 9);
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18,
}).addTo(map);
/* End Leaflet setup */


/* ShadeMap setup */
const loaderEl = document.getElementById('loader') as HTMLElement;
let now = new Date(1633358583454);
const shadeMap = new Simulator({
    apiKey: "eyJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6InRwcGlvdHJvd3NraUBzaGFkZW1hcC5hcHAiLCJjcmVhdGVkIjoxNjYyNDkzMDY2Nzk0LCJpYXQiOjE2NjI0OTMwNjZ9.ovCrLTYsdKFTF6TW3DuODxCaAtGQ3qhcmqj3DWcol5g",
    date: now,
    color: '#01112f',
    opacity: 0.7,
    terrainSource: {
        maxZoom: 15,
        tileSize: 256,
        getSourceUrl: ({ x, y, z }) => `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${z}/${x}/${y}.png`,
        getElevation: ({ r, g, b, a }) => (r * 256 + g + b / 256) - 32768,
    },
}).addTo(map);

shadeMap.on('tileloaded', (loadedTiles, totalTiles) => {
    loaderEl.innerText = `Loading: ${(loadedTiles / totalTiles * 100).toFixed(0)}%`;
});
/* End ShadeMap setup */

/* Controls setup */
let intervalTimer;
const increment = document.getElementById('increment') as HTMLElement;
const decrement = document.getElementById('decrement') as HTMLElement;
const play = document.getElementById('play') as HTMLElement;
const stop = document.getElementById('stop') as HTMLElement;

increment.addEventListener('click', () => {
    now = new Date(now.getTime() + 3600000);
    shadeMap.setDate(now);
}, false);

decrement.addEventListener('click', () => {
    now = new Date(now.getTime() - 3600000);
    shadeMap.setDate(now);
}, false);

play.addEventListener('click', () => {
    intervalTimer = setInterval(() => {
        now = new Date(now.getTime() + 60000);
        shadeMap.setDate(now);
    }, 100);
});

stop.addEventListener('click', () => {
    clearInterval(intervalTimer);
})
/* End controls setup */
