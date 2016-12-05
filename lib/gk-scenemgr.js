/**
 * Created by kaimingyi on 2016/12/1.
 */
const Fabricate = require("./fabricate.js");
const GameObject = require("./gk-gameobject.js");
const Component = require("./gk-component.js");

class SceneMgr {
    constructor() {
        this.root = null;
        this.meshRenderers = [];
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


    }

    getSceneRoot() {
        return this.root;
    }

    traverseNode(node, nodeProcess ) {

        nodeProcess( node );

        let transform = node.components.get(Component.Transform);
        if( transform )
        {
            transform.children.forEach( child => {
                nodeProcess( child.host );
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

    collectRenderer( node ) {
        if( node.components )
        {
            let mr = node.components.get(Component.MeshRenderer);
            if( mr !== undefined )
            {
                this.meshRenderers.push(mr);
            }
        }
    }


}

module.exports = SceneMgr;