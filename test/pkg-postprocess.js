/**
 * Created by kaimingyi on 2016/11/20.
 */
var test = require('tape');
var fs = require('fs');
var path = require('path');

test('loader-osgjs', function (t) {
    t.plan(1);

    fs.readFile('res/package/list.txt', 'utf-8', function(err, data) {
        if(err)
        {

        }
        else
        {
            let text = data.toString();

            let imgs = text.split('\r\n');
            imgs.forEach(img => {

                let side = img.split('-');
                let orgfile = path.basename(side[0]);
                let newfile = side[1];

                if(orgfile && newfile)
                {
                    fs.rename( 'res/package/' + orgfile, 'res/package/' + newfile );
                }
            });

        }
    });


    t.equal(1, 1);
});