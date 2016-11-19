/**
 * Created by kaimingyi on 2016/11/18.
 */
const Component = require('gk-component.js');

class GameObject {
    constructor(name) {
        this.name = name;
        this.components = {};
    }

    add_component(component) {
        if(component instanceof Component.Base)
        {
            this.components.push(component);
        }

    }

    get_component(type) {

        this.components.forEach( com => {
            if( com instanceof type)
            {
                return com;
            }
        });

        return null;

    }
}
