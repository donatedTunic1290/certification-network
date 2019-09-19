'use strict';

class State {
	
	constructor(stateClass, keyParts) {
		this.class = stateClass;
		this.currentState = null;
		this.key = State.makeKey(keyParts);
	}
	
	getClass() {
		return this.class;
	}
	
	getKey() {
		return this.key;
	}
	
	getSplitKey() {
		return State.splitKey(this.key);
	}
	
	getCurrentState() {
		return this.currentState;
	}
	
	serialize() {
		return State.serialize(this);
	}
	
	static serialize(object) {
		return Buffer.from(JSON.stringify(object));
	}
	
	static deserialize(data, supportedClasses) {
		let json = JSON.parse(data.toString());
		let objClass = supportedClasses[json.class];
		if (!objClass) {
			throw new Error(`Unknown class of ${json.class}`);
		}
		return new (objClass)(json);
	}
	
	static deserializeClass(data, objClass) {
		let json = JSON.parse(data.toString());
		return new (objClass)(json);
	}
	
	static makeKey(keyParts) {
		return keyParts.map(part => JSON.stringify(part)).join(":");
	}
	
	static splitKey(key) {
		return key.split(":");
	}
}

module.exports = State;