const RESOLUTION = 500;

/**
 * Use this class to keep track of time dilation. Time dilation is a ratio
 * between how much time has passed and the expected time to have passed. For
 * example, if 100 ms were expected to have passed, but 800 has actually passed,
 * then the dilation would be 8.0
 *
 * The resolution determines how often dilation is checked. The longer the
 * resolution the more resilient the calculation is to small effects, but the
 * slower it  will adapt to changes. Resolution defaults to 500ms
 */
export class TimeDilation {
	constructor() {
		this._resolution = RESOLUTION;
		this._last = Date.now();
		this._dilation = 0;
		this._handle = setInterval(this.computeTimeDilation.bind(this), RESOLUTION)
	}

	computeTimeDilation() {
		let now = Date.now();
		let delta = now - this._last;
		this._dilation = delta / this._resolution;
	}

	get resolution() {
		return this._resolution;
	}

	set resolution(value) {
		this._resolution = value;
		clearInterval(this._handle);
		this._handle = setInterval(this.computeTimeDilation.bind(this), RESOLUTION)
	}

	get dilation() {
		return this._dilation;
	}
}

export let timeDilation = new TimeDilation();
