import {config} from "../config.js";

export class PitchDisplay {
	constructor(trackList, canvas) {
		this.trackList = trackList;

		this.canvas = canvas;
		this.canvas.width = this.canvas.clientWidth;
		this.canvas.height = this.canvas.clientHeight;
		window.addEventListener('resize', () => {
			this.canvas.width = this.canvas.clientWidth;
			this.canvas.height = this.canvas.clientHeight;
		});

		this.context = this.canvas.getContext('2d');

		this.followFrequency = config.followFrequency;
		this.a1Frequency = config.a1Frequency;
		this.lowestFrequencyInDisplay = config.lowestFrequencyInDisplay;
		this.semitoneSize = this.canvas.clientHeight / 12 / config.octavesInDisplay;
		this.sampleWidth = config.sampleWidth;
	}

	noteToPitch(note) {
		return this.a1Frequency * (2 ** (1/12)) ** note;
	}
	
	pitchToNote(pitch) {
		return 12 * Math.log(pitch / this.a1Frequency) / Math.log(2);
	}

	noteToPosition(note) {
		const lowestNote = this.pitchToNote(this.lowestFrequencyInDisplay);
		return this.canvas.height - (note - lowestNote) * this.semitoneSize;
	}

	pitchToPosition(pitch) {
		return this.noteToPosition(this.pitchToNote(pitch));
	}


	draw() {
		if (this.followFrequency && this.trackList[0].data.length > 0) {
			const centerFrequency = this.trackList[0].data[this.trackList[0].data.length - 1];
			if (centerFrequency !== 0) {
				const centerNote = Math.round(this.pitchToNote(centerFrequency));
				const displaySize = this.canvas.height / this.semitoneSize;
				const lowestNote = centerNote - (displaySize / 2);
				const lowestFrequency = this.noteToPitch(lowestNote);
				this.lowestFrequencyInDisplay = lowestFrequency;
			}
		}

		this.context.fillStyle = "white";
		this.context.lineWidth = 1;
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

		this.drawSemitoneLines();

		const width = this.canvas.width / this.sampleWidth;

		let minX, maxX;

		if (this.trackList[0].data.length > width / 2) {
			maxX = Math.round(this.trackList[0].data.length + width / 2);
		} else {
			maxX = width;
		}

		minX = maxX - width;

		for (let track of this.trackList) {
			this.context.strokeStyle = track.color;

			const notes = track.data;
			this.context.beginPath();
			this.context.moveTo(0,0);
			for (let i = minX; i < maxX; ++i) {
				if (notes[i] !== 0 && notes[i-1] !== 0) {
					this.context.lineTo((i - minX) * this.sampleWidth, this.pitchToPosition(notes[i]));
				} else {
					this.context.moveTo((i - minX) * this.sampleWidth, this.pitchToPosition(notes[i]));
				}
			}
			this.context.stroke();
		}
	}

	drawSemitoneLines() {
		const lowestNote = Math.ceil(this.pitchToNote(this.lowestFrequencyInDisplay));
		const highestNote = lowestNote + Math.floor(this.canvas.height / this.semitoneSize);

		for (let i = lowestNote; i <= highestNote; ++i) {
			// 0, 12, 24, -12, -24 etc. are A's
			// We want to highlight C's:
			// 3, 15, 27 etc. are C's above a1
			// -9, -21, -33 etc. are C's below a1
			if (i % 12 == 3 || -i % 12 == 9) {
				this.context.strokeStyle = "black";
			} else {
				this.context.strokeStyle = "lightgrey";
			}

			this.context.beginPath();

			const y = this.noteToPosition(i);
			this.context.moveTo(0, y);
			this.context.lineTo(this.canvas.width, y);
			this.context.stroke();
		}
	}

	pan (stepSize) {
		const currentNote = this.pitchToNote(this.lowestFrequencyInDisplay);
		const newPitch = this.noteToPitch(currentNote + stepSize);
		this.lowestFrequencyInDisplay = newPitch;
	}
}
