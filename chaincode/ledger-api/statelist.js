'use strict';

const State = require('./state.js');

class StateList {
	
	constructor(ctx, listName) {
		this.ctx = ctx;
		this.name = listName;
		this.supportedClasses = {};
	}
	
	async addState(state) {
		let key = this.ctx.stub.createCompositeKey(this.name, state.getSplitKey());
		let data = State.serialize(state);
		await this.ctx.stub.putState(key, data);
	}
	
	async getState(key) {
		let ledgerKey = this.ctx.stub.createCompositeKey(this.name, State.splitKey(key));
		let data = await this.ctx.stub.getState(ledgerKey);
		return State.deserialize(data, this.supportedClasses);
	}
	
	async updateState(state) {
		let key = this.ctx.stub.createCompositeKey(this.name, state.getSplitKey());
		let data = State.serialize(state);
		await this.ctx.stub.putState(key, data);
	}
	
	use(stateClass) {
		this.supportedClasses[stateClass.getClass()] = stateClass;
	}
	
}

module.exports = StateList;