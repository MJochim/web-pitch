import {config} from "../config.js";
import {trackList} from "./track-list.variable.js";

import {Track} from "./track.class.js";
import {PitchDisplay} from "./pitch-display.class.js";
const Pitchfinder = require("pitchfinder");

let audioContext;
let detectPitch;
let pitchDisplay;
let pitchPeriod;
let pitchSampleRate;

async function startMicrophone() {
	const mediaStream = await navigator.mediaDevices.getUserMedia({
		"audio": {
			"mandatory": {
				"googEchoCancellation": "false",
					"googAutoGainControl": "false",
					"googNoiseSuppression": "false",
					"googHighpassFilter": "false"
				},
				"optional": []
			},
	});

	// Connect the microphone stream to a script processor node
	const mediaStreamSource = audioContext.createMediaStreamSource(mediaStream);
	const scriptProcessor = audioContext.createScriptProcessor(config.pitchAnalysisBufferSize);
	mediaStreamSource.connect(scriptProcessor);
	scriptProcessor.connect(audioContext.destination);

	scriptProcessor.addEventListener('audioprocess', (audioProcessingEvent) => {
		let inputData = audioProcessingEvent.inputBuffer.getChannelData(0);

		const pitch = detectPitch(inputData);

		if (pitch === null || pitch > 10000) {
			trackList[0].data.push(0);
		} else {
			trackList[0].data.push(pitch);
		}
	});
}

async function startMidi() {
	const access = await navigator.requestMIDIAccess();

	for (let input of access.inputs.values()) {
		console.log(input);

		let currentNoteNumber;
		const track = new Track();
		track.color = "rgba(0, 255, 0, 0.5)";
		trackList.push(track);

		setInterval(() => {
			if (currentNoteNumber !== null) {
				const frequency = 440 * (2**(1/12)) ** (currentNoteNumber - 69);
				track.data.push(frequency);
			} else {
				track.data.push(0);
			}
		}, pitchPeriod);

		input.addEventListener('midimessage', (event) => {
			const command = event.data[0] >> 4;
			const channel = event.data[0] & 0xF;
			const noteNumber = event.data[1];
			let velocity = 0;
			if (event.data.length > 2) {
				velocity = event.data[2];
			}

			if ( command==8 || ((command==9)&&(velocity==0)) ) { // note off
				if (currentNoteNumber == noteNumber) {
					currentNoteNumber = null;
				}
			} else if (command == 9) { // note on
				currentNoteNumber = noteNumber;
			}	
		});
	}
}

function draw(time) {
	pitchDisplay.draw();
	window.requestAnimationFrame(draw);
}

window.addEventListener('load', async () => {
	audioContext = new AudioContext();
	detectPitch = Pitchfinder.YIN({sampleRate: audioContext.sampleRate});

	pitchSampleRate = audioContext.sampleRate / config.pitchAnalysisBufferSize;
	pitchPeriod = 1 / pitchSampleRate * 1000; // Factor 1000 to convert seconds to milliseconds

	const canvas = document.querySelector('#pitch_canvas');
	pitchDisplay = new PitchDisplay(trackList, canvas);

	document.querySelector('#btn_zoom_in_y') .addEventListener("click", () => {pitchDisplay.semitoneSize *= 1.1;});
	document.querySelector('#btn_zoom_out_y').addEventListener("click", () => {pitchDisplay.semitoneSize /= 1.1;});
	document.querySelector('#btn_move_up')   .addEventListener("click", () => {pitchDisplay.pan(+1);});
	document.querySelector('#btn_move_down') .addEventListener("click", () => {pitchDisplay.pan(-1);});

	startMicrophone();
	startMidi();
	draw();
});
