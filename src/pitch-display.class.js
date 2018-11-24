import {config} from "../config.js";
import {FontScaleService} from "./font-scale.service";

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
                this.tonicNote = config.tonicNote;
	}

	noteToPitch(note) {
		return this.a1Frequency * (2 ** (1/12)) ** (note - 69);
	}
	
	pitchToNote(pitch) {
		return 12 * Math.log(pitch / this.a1Frequency) / Math.log(2) + 69;
	}

	noteToPosition(note) {
		const lowestNote = this.pitchToNote(this.lowestFrequencyInDisplay);
		return this.canvas.height - (note - lowestNote) * this.semitoneSize;
	}

	pitchToPosition(pitch) {
		return this.noteToPosition(this.pitchToNote(pitch));
	}

              
        noteNumberToSolmisationSyllable (note) {
            const semitonesAwayFromC = note % 12;
            const semitonesAwayFromTonic = semitonesAwayFromC - this.tonicNote;

            switch (semitonesAwayFromTonic) {
                case 0: return "Do";
                case 2: case -10: return "Re";
                case 4: case -8: return "Mi";
                case 5: case -7: return "Fa";
                case 7: case -5: return "So";
                case 9: case -3: return "La";
                case 11: case -1: return "Ti";
                default: return "";
            }
        }

        noteNumberToNoteName(note) {
            switch (note % 12) {
                case 0: return "C";
                case 1: return "C#/D♭";
                case 2: return "D";
                case 3: return "D#/E♭";
                case 4: return "E";
                case 5: return "F";
                case 6: return "F#/G♭";
                case 7: return "G";
                case 8: return "G#/A♭";
                case 9: return "A";
                case 10: return "A#/B♭";
                case 11: return "B";
                default: return "";
            }
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

		const width = Math.round(this.canvas.width / this.sampleWidth);

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
                this.context.save();

		const lowestNote = Math.ceil(this.pitchToNote(this.lowestFrequencyInDisplay));
		const highestNote = lowestNote + Math.floor(this.canvas.height / this.semitoneSize);

		for (let i = lowestNote; i <= highestNote; ++i) {
                        const semitonesAwayFromC = i % 12;
                        const semitonesAwayFromTonic = semitonesAwayFromC - this.tonicNote;

                        switch (semitonesAwayFromTonic) {
                            case 0:
                                this.context.setLineDash([]);
                                this.context.strokeStyle = "black";
                                break;
                            case 2: case -10:
                            case 4: case -8:
                            case 5: case -7:
                            case 7: case -5:
                            case 9: case -3:
                            case 11: case -1:
                                this.context.setLineDash([]);
                                this.context.strokeStyle = "darkgrey";
                                break;
                            default:
                                this.context.setLineDash([5, 15]);
				this.context.strokeStyle = "lightgrey";
			}


			this.context.beginPath();

			const y = this.noteToPosition(i);
			this.context.moveTo(0, y);
			this.context.lineTo(this.canvas.width, y);
			this.context.stroke();

                        FontScaleService.drawUndistortedText(
                                this.context,
                                i.toString() + " " + Math.round(this.noteToPitch(i)) + "Hz " + this.noteNumberToNoteName(i),
                                12,
                                "Liberation Sans",
                                0,
                                y,
                                "black",
                                "left",
                                "top"
                        );

                        FontScaleService.drawUndistortedText(
                                this.context,
                                this.noteNumberToSolmisationSyllable(i),
                                12,
                                "Liberation Sans",
                                this.canvas.width,
                                y,
                                "black",
                                "right",
                                "top"
                        );
		}

                this.context.restore();
	}

	pan (stepSize) {
		const currentNote = this.pitchToNote(this.lowestFrequencyInDisplay);
		const newPitch = this.noteToPitch(currentNote + stepSize);
		this.lowestFrequencyInDisplay = newPitch;
	}

        moveTonic (stepSize) {
            this.tonicNote += stepSize;

            // Tonic must remain within [0;11]
            if (this.tonicNote >= 12) {
                this.tonicNote = this.tonicNote % 12;
            }
            if (this.tonicNote < 0) {
                this.tonicNote = 12 - (-this.tonicNote % 12);
            }
        }
}
