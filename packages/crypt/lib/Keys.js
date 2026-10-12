const api = window.crypto.subtle;

class Keys {
	ab2str(buf) {
		return String.fromCharCode.apply(null, new Uint8Array(buf));
	}

	async privateKeyToText(key) {
		let exported = await api.exportKey("pkcs8", key);
		let exportedAsString = ab2str(exported);
		return window.btoa(exportedAsString);
	}

	async textToPrivateKey(key) {
		const binaryDerString = window.atob(key);
		const binaryDer = str2ab(binaryDerString);

		return api.importKey(
			"pkcs8",
			binaryDer, {
				name: "RSA-PSS",
				hash: "SHA-256",
			},
			true,
			["sign", "verify", "encrypt", "decrypt"],
		);
	}


	async publicKeyToText(key) {
		let exported = await api.exportKey("pkcs8", key);
		let exportedAsString = ab2str(exported);
		return window.btoa(exportedAsString);
	}

	async textToPublicKey(key) {
		const binaryDerString = window.atob(key);
		const binaryDer = str2ab(binaryDerString);

		return window.crypto.subtle.importKey(
			"spki",
			binaryDer,
			{
			  name: "RSA-PSS",
			  hash: "SHA-256",
			},
			true,
			["encrypt", "decrypt", "sign", "verify"],
		);
	}


	async createKeyPair() {
		return await api.generateKey(
		  {
			name: "RSA-PSS",
			modulusLength: 4096,
			publicExponent: new Uint8Array([1, 0, 1]),
			hash: "SHA-256",
		  },
		  true,
		  ["sign", "verify", "encrypt", "decrypt"],
		);
	}


	async keyPairToText(keys) {
		return {
			private: await this.privateKeyToText(keys.privateKey),
			public: await this.publicKeyToText(keys.publicKey)
		}
	}

	async textToKeyPair(keys) {
		return {
			privateKey: await this.textToPrivateKey(keys.private),
			publicKey: await this.textToPublicKey(keys.public)
		}
	}

	async keyToText(key) {
		let exported = await api.exportKey("raw", key);
		let exportedAsString = ab2str(exported);
		return window.btoa(exportedAsString);
	}

	async textToKey(key) {
		const binaryDerString = window.atob(key);
		const binaryDer = str2ab(binaryDerString);
		return api.importKey("raw", binaryDer, "AES-GCM", true, [
			"encrypt",
			"decrypt",
		  ]);
	}

	async createKey() {
		return await api.generateKey(
			{
			  name: "AES-GCM",
			  length: 256,
			},
			true,
			["encrypt", "decrypt"],
		  );
	}

	async stringify(key) {
		if (key.privateKey) return await this.keyPairToText(key);

		return await this.keyToText(key);
	}

	async parse(key) {
		if (key.private) return await this.textToKeyPair(key);

		return await this.textToKey(key);
	}
}

export const keys = new Keys()
