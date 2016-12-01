/**
 * Created by kaimingyi on 2016/11/18.
 */
const math = require("gl-matrix");

class Component {
    constructor() {

    }

    onStart() {

    }

    onUpdate() {

    }
}

class Transform extends Component {
    constructor() {
        super();

        this._position = math.vec3.fromValues(0,0,0);
        this._rotation = math.quat.identity(math.quat.create());
        this._scale = math.vec3.fromValues(1,1,1);

        this._dirty = true;

        this._localToWorldMatrx = math.mat4.identity(math.mat4.create());

        this._parent = null;
        this.children = null;
    }

    _markDirty()
    {
        this._dirty = true;
    }

    get parent()
    {
       return this._parent;
    }

    set parent( target )
    {
        this._markDirty();
        if( target instanceof Transform)
        {
            // detach

            this._parent = target;

            // attach
        }

    }

    _addChild( target )
    {

    }

    _removeChild( target )
    {

    }



    get localPosition() {
        return this._position;
    }
    set localPosition(value) {
        this._markDirty();
        this._position = value;
    }

    get localRotation() {
        return this._rotation;
    }
    set localRotation(value) {
        this._markDirty();
        this._rotation = value;
    }

    get localScale() {
        return this._scale;
    }
    set localScale(value) {
        this._markDirty();
        this._scale = value;
    }



}

class MeshFilter extends Component {
    constructor() {
        super();
        this.mesh = null;
    }
}

class MeshRenderer extends Component {
    constructor() {
        super();
        this.material = null;
    }

    onPreRender() {

    }

    onRender() {

    }

    _checkMesh() {

    }
}

module.exports = {Component, Transform, MeshFilter, MeshRenderer};

