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


        this._worldposition = math.vec3.create();
        this._worldrotation = math.quat.create();
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

    CheckCompDirty() {
        if (this._dirtyComp === true) {
            if(this._parent !== null)
            {
                this._worldposition = math.vec3.add(math.vec3.create(), this._parent.position, math.vec3.transformQuat(
                    math.vec3.create(), this.localPosition, this._parent.rotation));

                this._worldrotation = math.quat.mul(math.quat.create(), this._parent.rotation, this.localRotation);
            }
            else
            {
                this._worldposition = this.localPosition;
                this._worldrotation = this.localRotation;
            }
            this._dirtyComp = false;
        }
    }

    get position() {
        if( this._parent === null )
        {
            return this._position;
        }
        this.CheckCompDirty();
        return this._worldposition;
    }

    get rotation() {
        if( this._parent === null )
        {
            return this._rotation;
        }
        this.CheckCompDirty();
        return this._worldrotation;
    }

    set position(value) {
        this._worldposition = value;
        if( this._parent !== null)
        {
            let distance = math.vec3.sub(math.vec3.create(), this._worldposition, this._parent.position);
            let invRotParent = math.quat.invert( math.quat.create(), this._parent.rotation );
            this.localPosition = math.vec3.transformQuat( math.vec3.create(), distance, invRotParent );
        }
        else
        {
            this.localPosition = this._worldposition;
        }
    }

    set rotation(value) {
        this._worldrotation = value;
        if( this._parent !== null) {
            let invRotParent = math.quat.invert(math.quat.create(), this._parent.rotation);
            this.localRotation = math.quat.mul(math.quat.create(), invRotParent, this._worldrotation);
        }
        else
        {
            this.localRotation = this._worldrotation;
        }
    }

    // native propery setter/getter
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

    // matrix access
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

    get forward() {
        // TODO
        return math.vec3.transformQuat(math.vec3.create(), math.vec3.fromValues(0,0,1), this.rotation );
    }

    get up() {
        // TODO
        return math.vec3.transformQuat(math.vec3.create(), math.vec3.fromValues(0,1,0), this.rotation );
    }

    get left() {
        // TODO
        return math.vec3.transformQuat(math.vec3.create(), math.vec3.fromValues(1,0,0), this.rotation );
    }

    lookAt( target ) {

        let forward = math.vec3.sub(math.vec3.create(), target, this.position);
        forward = math.vec3.normalize(forward, forward);
        let up = math.vec3.fromValues(0,1,0);
        let left = math.vec3.cross(math.vec3.create(), forward, up );
        left = math.vec3.normalize(left,left);
        up = math.vec3.cross(math.vec3.create(), forward, left);
        up = math.vec3.normalize(up, up);

        //forward = math.vec3.negate(forward,forward);
        //left = math.vec3.negate(left, left);
        //up = math.vec3.negate(up, up);

        this.rotation = math.quat.setAxes( math.quat.create(), forward, left, up);
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

