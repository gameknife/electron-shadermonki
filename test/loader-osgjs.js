/**
 * Created by kaimingyi on 2016/11/20.
 */
var test = require('tape');
var loader_osgjs = require('../lib/loader/loader-osgjs.js');

test('loader-osgjs', function (t) {
    t.plan(1);

    loader_osgjs.load( "./res/package/blacksmith/model.osgjs", "./res/package/blacksmith/model.osgjs.bin", function(res) {
        //t.message( res );
    } );

    t.equal(1, 1);
});