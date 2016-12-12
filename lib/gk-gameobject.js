/**
 * Created by kaimingyi on 2016/11/18.
 */
const Component = require('./gk-component.js');

const Base = {
    name: "GameObject",
    transform: null,
    components: [Component.Transform]
}

const Camera = {
    name: "Camera",
    transform: null,
    components: [Component.Transform, Component.Camera]
}

const StaticMesh = {
    name: "StaticMesh",
    transform: null,
    components: [Component.Transform, Component.MeshFilter, Component.MeshRenderer]
}

const Light = {
    name: "Light",
    transform: null,
    components: [Component.Transform, Component.Light]
}

module.exports = {Base, Camera, StaticMesh, Light};