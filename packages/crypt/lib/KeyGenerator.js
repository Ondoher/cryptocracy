import { keys } from "./Keys.js";
import { timeDilation } from "./TimeDilation.js"

const KEYGEN_TIMER = 200;
const KEYPAIR_TIMER = 2000;

/**
 * Use this class to generate symmetric and asymmetric keys in the background.
 */
export class KeyGenerator  {
	constructor (keepKeys, keepPairs) {
		this.keepKeys = keepKeys;
		this.keepPairs = keepPairs;
		this.waitingKeys= [];
		this.waitingPairs = [];

		this.symmetricHdl = setInterval(this.symmetricTick.bind(this), KEYGEN_TIMER);
		this.asymmetricHdl = setInterval(this.asymmetricTick.bind(this), KEYPAIR_TIMER);
	}

	setKeep(keepKeys, keepPairs) {
		this.keepKeys = keepKeys;
		this.keepPairs = keepPairs;
	}

	setTimers(keyTimer, pairTimer) {
		clearInterval(this.symmetricHdl);
		clearInterval(this.asymmetricHdl);
		this.symmetricHdl = setInterval(this.symmetricTick.bind(this), keyTimer);
		this.asymmetricHdl = setInterval(this.asymmetricTick.bind(this), pairTimer);
	}

	async generateSymmetricKey() {
		return await keys.createKey();
	}

	async generateAsymmetricKey() {
		return await keys.createKeyPair();
	}

	async symmetricTick() {
		if (timeDilation.dilation > 4) return;
		if (this.waitingKeys.length > this.keepKeys) return;

		this.waitingKeys.push(await this.generateSymmetricKey())
	}

	async asymmetricTick() {
		if (timeDilation.dilation > 2) return;
		if (this.waitingPairs.length > this.keepPairs) return;

		this.waitingPairs.push(await this.generateAsymmetricKey())
	}

	async newKey() {
		if (this.waitingKeys.length > 0) return this.waitingKeys.pop();
		return await this.generateSymmetricKey();
	}

	async newPair() {
		if (this.waitingPairs.length > 0) return this.waitingPairs.pop();
		return await this.generateAsymmetricKey();
	}
}

export const keyGenerator = new KeyGenerator(4, 4);
