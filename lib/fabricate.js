function Fabricate(prefab) {
	if(!prefab) {
		throw new Error("No prefab passed to Fabricate.");
	}
	const host = Object.create(prefab);
	host.components = new Map();
	if(prefab.components) {
		prefab.components.forEach(component => {
			let componentInst;
			if(component.prototype && component.prototype.constructor) {
				componentInst = new component();
			} else {
				componentInst = Object.create(component);
			}
			componentInst.host = host;
			host.components.set(component, componentInst);
		});
	}
	return host;
}

//export default Fabricate;
module.exports = Fabricate;