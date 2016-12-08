/**
 * Created by kaimingyi on 2016/11/18.
 */
const math = require("gl-matrix");
const gkCore = window.gkCore;


class Component {
    constructor() {
        this._host = null;
    }

    get host()
    {
        return this._host;
    }

    set host( target )
    {
        this._host = target;
        this.onStart();
    }

    onStart() {

    }

    onUpdate() {
        //console.info( this );
    }

    onRender() {

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
        this._dirtyComp = true;
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

    get forward() {
        // TODO
        return math.vec3.transformQuat(math.vec3.create(), math.vec3.fromValues(0,0,1), this.localRotation );
    }

    get position() {

        if()

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

    get localToWorldMatrix() {
        if(this._dirty)
        {
            this._dirty = false;

            let childmatrix = math.mat4.fromRotationTranslationScale(math.mat4.create(), this._rotation, this._position, this._scale );
            if(this._parent !== null)
            {
                this._localToWorldMatrx = math.mat4.mul( this._localToWorldMatrx, this._parent.localToWorldMatrix, childmatrix);
            }
            else
            {
                this._localToWorldMatrx = childmatrix;
            }
        }

        return this._localToWorldMatrx;
    }


    onStart() {
        this.host.transform = this;
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

    _checkMesh() {

    }
}

class Camera extends Component {
    constructor() {
        super();
    }

    onUpdate() {
        super.onUpdate();
    }

    onRender() {
        // prepare render queue
        let queue = gkCore.renderer.getOrCreateRenderQueue(0);

        // send per queue parameter set to queue
        queue.setupCamera( this );

        // push target mr to renderqueue
        let mrs = gkCore.sceneMgr.getMeshRenderers();
        mrs.forEach( mr => {
            // doing culling here
           queue.addRenderer( mr );
        });
    }
}

module.exports = {Component, Transform, MeshFilter, MeshRenderer, Camera};

