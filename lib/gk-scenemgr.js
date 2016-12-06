/**
 * Created by kaimingyi on 2016/12/1.
 */
const Fabricate = require("./fabricate.js");
const GameObject = require("./gk-gameobject.js");
const Component = require("./gk-component.js");

let instance = null;

class SceneMgr {
    constructor() {
        if(!instance) {
            instance = this;

            this.root = null;
            this.meshRenderers = [];
        }

        return instance;
    }

    init() {
        this.root = Fabricate(GameObject.Base);
    }

    update() {

        // update
        this.traverseNode( this.root, this.updateComonents );

        // collect mr
        this.meshRenderers = [];
        this.traverseNode( this.root, this.collectRenderer );

        // onRender -> Camera Component
        this.traverseNode( this.root, this.renderComonents );
    }

    getSceneRoot() {
        return this.root;
    }

    getMeshRenderers() {
        return this.meshRenderers;
    }

    traverseNode(node, nodeProcess ) {

        nodeProcess( node );

        let transform = node.components.get(Component.Transform);
        if( transform )
        {
            let refthis = this;
            transform.children.forEach( child => {
                refthis.traverseNode( child.host, nodeProcess );
            });
        }
    }

    updateComonents( node ) {
        if( node.components )
        {
            for (let comp of node.components.values()) {
                if( comp instanceof Component.Component )
                {
                    comp.onUpdate();
                }
            }
        }
    }

    renderComonents( node ) {
        if( node.components )
        {
            for (let comp of node.components.values()) {
                if( comp instanceof Component.Component )
                {
                    comp.onRender();
                }
            }
        }
    }

    collectRenderer( node ) {
        if( node.components )
        {
            let mr = node.components.get(Component.MeshRenderer);

            if( mr !== undefined )
            {
                instance.meshRenderers.push(mr);
            }
        }
    }


}

module.exports = SceneMgr;