/**
 * Created by kaimingyi on 2016/11/18.
 */
const glw = require('./gk-glwrap.js');

class Base {
    constructor( parent ) {

    }

    onUpdate() {

    }
}

class Transform extends Base {
    constructor( parent ) {
        super(parent);

        this.position = [0,0,0];
        this.rotation = [0,0,0,1];
        this.scale = [1,1,1];
    }
}

class MeshFilter extends Base {
    constructor( parent ) {
        super(parent);

        this.mesh = null;
    }
}

class MeshRenderer extends Base {
    constructor( parent ) {
        super(parent);
        this.material = null;
    }

    onPreRender() {

    }

    onRender() {

    }

    _checkMesh() {

    }
}

module.exports = {Base, Transform, MeshFilter, MeshRenderer};

