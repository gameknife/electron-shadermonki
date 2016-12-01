/**
 * Created by kaimingyi on 2016/11/18.
 */
const math = require("gl-matrix");

class Component {
    constructor() {
        this.host = null;
    }

    onStart() {

    }

    onUpdate() {
        //console.info( this );
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
        this.children = new Set();
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
            if(this._parent !== null) {
                this._parent._removeChild(this);
            }

            this._parent = target;

            // attach
            this._parent._addChild(this);
        }

    }

    _addChild( target )
    {
        this.children.add( target );
    }

    _removeChild( target )
    {
        if(this.children.has( target )) {
            this.children.delete(target);
        }
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

class Camera extends Component {
    constructor() {
        super();
    }

    onUpdate() {
        super.onUpdate();
        // set parameter to renderer
        //console.info( this );


    }
}

module.exports = {Component, Transform, MeshFilter, MeshRenderer, Camera};

