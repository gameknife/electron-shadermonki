/**
 * Created by kaimingyi on 2016/11/18.
 */
const Component = require('./gk-component.js');

const Base = {
    name: "GameObject",
    components: [Component.Transform]
}

const Camera = {
    name: "Camera",
    components: [Component.Transform, Component.Camera]
}

const StaticMesh = {
    name: "StaticMesh",
    components: [Component.Transform, Component.MeshFilter, Component.MeshRenderer]
}

module.exports = {Base, Camera, StaticMesh};