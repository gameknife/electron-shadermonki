/**
 * Created by kaimingyi on 2016/11/20.
 */
var test = require('tape');
var loader_osgjs = require('../lib/loader/loader-osgjs.js');

test('loader-osgjs', function (t) {
    t.plan(1);

    loader_osgjs.load( "./res/mesh/box100.osgjs", "./res/mesh/box100.osgjs.bin", function(res) {
        //t.message( res );
    } );

    t.equal(1, 1);
});