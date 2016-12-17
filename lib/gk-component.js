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

        // all children mark dirty
        this.children.forEach( child => {
            child._markDirty();
        } );
    }

    get parent()
    {
       return this._parent;
    }

    set parent( target )
    {
        // detach

        if(this._parent !== null) {
            this._parent._removeChild(this);
        }

        this._parent = target;

        if( target instanceof Transform)
        {
            // attach
            this._parent._addChild(this);
        }

        this._markDirty();

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

            let dest = math.mat4.create();

            math.mat4.identity(dest);

            math.mat4.scale(dest, dest, this._scale);

            let quatMat = math.mat4.create();

            math.quat.toMat4 = function( out, q ) {
                let x = q[0], y = q[1], z = q[2], w = q[3],
                    x2 = x + x,
                    y2 = y + y,
                    z2 = z + z,

                    xx = x * x2,
                    xy = x * y2,
                    xz = x * z2,
                    yy = y * y2,
                    yz = y * z2,
                    zz = z * z2,
                    wx = w * x2,
                    wy = w * y2,
                    wz = w * z2;

                out[0] = 1 - (yy + zz);
                out[1] = xy + wz;
                out[2] = xz - wy;
                out[3] = 0.0;

                out[4] = xy - wz;
                out[5] = 1 - (xx + zz);
                out[6] = yz + wx;
                out[7] = 0.0;

                out[8] = xz + wy;
                out[9] = yz - wx;
                out[10] = 1 - (xx + yy);
                out[11] = 0.0;

                out[12] = 0.0;
                out[13] = 0.0;
                out[14] = 0.0;
                out[15] = 1.0;
            };
            math.quat.toMat4(quatMat, this._rotation);
            math.mat4.multiply(dest, dest, quatMat);

            dest[12] = this._position[0];
            dest[13] = this._position[1];
            dest[14] = this._position[2];
            //math.mat4.translate(dest, dest, this._position);

            if(this._parent !== null)
            {
                this._localToWorldMatrx = math.mat4.mul( this._localToWorldMatrx, this._parent.localToWorldMatrix, childmatrix );
            }
            else
            {
                this._localToWorldMatrx = dest;
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

    // other method
    lookAt( target ) {

        // rebuild the quat axes with forward and up
        let forward = math.vec3.sub(math.vec3.create(), target, this.position);
        forward = math.vec3.normalize(forward, forward);

        let up = math.vec3.fromValues(0,1,0);

        let left = math.vec3.cross(math.vec3.create(), up, forward  );
        left = math.vec3.normalize(left,left);

        up = math.vec3.cross(math.vec3.create(), forward, left );
        up = math.vec3.normalize(up, up);

        let matr = math.mat3.create();
        matr[0] = -left[0];
        matr[1] = -left[1];
        matr[2] = -left[2];

        matr[3] = up[0];
        matr[4] = up[1];
        matr[5] = up[2];

        matr[6] = -forward[0];
        matr[7] = -forward[1];
        matr[8] = -forward[2];

        this.rotation = math.quat.fromMat3(math.quat.create(), matr);
    }

    /**
     * Transforms in localspace
     *
     * @param {vec3} vector
     */
    translateLocal( vec ) {
        let trans = math.vec3.transformQuat( math.vec3.create(), vec, this.localRotation );
        this.localPosition = math.vec3.add( this.localPosition, this.localPosition, trans );
    }

    /**
     * Transforms in worldspace
     *
     * @param {vec3} vector
     */
    translateWorld( vec ) {
        let trans = math.vec3.transformQuat( math.vec3.create(), vec, this.rotation );
        this.position = math.vec3.add( math.vec3.create(), this.position, trans );
    }

    getComponent( comp ) {
        let returnArray = [];

        let component = this.host.components.get( comp );
        if(component)
        {
            returnArray.push(component);
        }

        this.children.forEach( child => {
            returnArray = returnArray.concat( child.getComponent( comp ) );
        });

        return returnArray;
    }

    onStart() {
        this.host.transform = this;
    }
}

class MeshFilter extends Component {
    constructor() {
        super();
        this._mesh = null;
    }

    set mesh(value) {
        this._mesh = value;
    }

    get mesh() {
        return this._mesh;
    }
}

class MeshRenderer extends Component {
    constructor() {
        super();
        this.material = null;

        this._lbb = math.vec3.fromValues(99999,99999,99999);
        this._rtf = math.vec3.fromValues(-99999,-99999,-99999);
    }

    get bounds() {

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

class Light extends Component {
    constructor() {
        super();

        this.intensity = 1.0;
    }

    onUpdate() {
        super.onUpdate();
    }

    onRender() {
        // TODO: add to everyqueue
        // prepare render queue
        let queue = gkCore.renderer.getOrCreateRenderQueue(0);

        // send per queue parameter set to queue
        queue.setupLight( this );
    }
}

module.exports = {Component, Transform, MeshFilter, MeshRenderer, Camera, Light};

