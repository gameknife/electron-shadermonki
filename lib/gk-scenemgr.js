/**
 * Created by kaimingyi on 2016/12/1.
 */
const Fabricate = require("./fabricate.js");
const GameObject = require("./gk-gameobject.js");
const Component = require("./gk-component.js");

class SceneMgr {
    constructor() {
        this.root = null;
    }

    init() {
        this.root = Fabricate(GameObject.Base);
    }

    update() {
        this.updateNode( this.root );
    }

    getSceneRoot() {
        return this.root;
    }

    updateNode( node ) {

        this.updateComonents( node );

        let transform = node.components.get(Component.Transform);
        if( transform )
        {
            let refthis = this;
            transform.children.forEach( child => {
                refthis.updateComonents( child.host );
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


}

module.exports = SceneMgr;