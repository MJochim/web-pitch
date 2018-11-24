import {Track} from "./track.class.js";

const recording = new Track();
recording.name = "Recording";
recording.color = "red";

const betweenTheLights = new Track();
betweenTheLights.name = "Between the Lights";
betweenTheLights.color = "blue";

for (let rep=0; rep <= 100; ++rep) {
for (let i=0; i<42; ++i) { betweenTheLights.data.push(131); }
for (let i=0; i<42; ++i) { betweenTheLights.data.push(147); }
for (let i=0; i<42; ++i) { betweenTheLights.data.push(165); }
for (let i=0; i<42; ++i) { betweenTheLights.data.push(131); }
for (let i=0; i<42; ++i) { betweenTheLights.data.push(175); }
}

export const trackList = [recording, betweenTheLights];
