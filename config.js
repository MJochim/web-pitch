export const config = {
	// bufferSize 2048 has a period of ~46 ms at an audio sample rate of 44100 Hz
	// Must be a power of two.
	pitchAnalysisBufferSize: 2048,

	followFrequency: false,
	lowestFrequencyInDisplay: 110,
	a1Frequency: 440,
	octavesInDisplay: 3,
	sampleWidth: 10,
	tonicNote: 0 // must be within [0,11] (the numbers represent the tones C, C#, ..., B)
};
