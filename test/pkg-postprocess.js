/**
 * Created by kaimingyi on 2016/11/20.
 */
var test = require('tape');
var fs = require('fs');
var path = require('path');

test('loader-osgjs', function (t) {
    t.plan(1);

    let basepath = 'res/package/game/';

    fs.readFile(basepath + 'list.txt', 'utf-8', function(err, data) {
        if(err)
        {

        }
        else
        {
            let text = data.toString();

            let imgs = text.split('\r\n');
            imgs.forEach(img => {

                let side = img.split('#');
                let orgfile = path.basename(side[0]);
                let newfile = side[1];
                console.info(basepath + orgfile + ' : ' + basepath + newfile);
                if(orgfile && newfile)
                {
                    //console.info(basepath + orgfile + ' : ' + basepath + newfile);
                    //if(fs.existsSync(basepath + orgfile) )
                    {
                        fs.rename( basepath + orgfile, basepath + newfile );
                    }
                }
            });

            //if(fs.existsSync(basepath + 'file.osgjs.gz') )
            {
                fs.rename( basepath + 'file.osgjs.gz', basepath + 'model.osgjs' );
                fs.rename( basepath + 'model_file.bin.gz', basepath + 'model.osgjs.bin' );
            }

        }
    });


    t.equal(1, 1);
});