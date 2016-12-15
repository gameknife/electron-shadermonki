/**
 * Created by kaimingyi on 2016/12/15.
 */

var fs = require('fs-extra');
var path = require('path');
var http = require('http');
var https = require('https');
var zlib = require('zlib');

var packageBuilder = packageBuilder || {};
module.exports = packageBuilder;

packageBuilder.build = function() {

    console.info('shader monki package builder v0.1');

    let packageWaitForBuild = [];

    let filelist = fs.walkSync('res/package/');
    filelist.forEach( item => {

        item = path.normalize(item);
        let filename = path.basename( item );
        let dirname = path.dirname(item);
        let relpath = path.relative( 'res/package/', dirname );
        let extname = path.extname(item);
        let purefilename = path.basename( item, extname );
        if(extname == '.spkg')
        {
            let pkgDir = path.join( dirname , purefilename);

            try {
                console.info('spkg found: ' + pkgDir);
                fs.accessSync(pkgDir, fs.F_OK);

                // TODO to remove
                packageWaitForBuild.push(item);
            } catch (e) {
                // It isn't accessible

                // push it & mkdir
                try {
                    fs.mkdirSync(pkgDir);
                    packageWaitForBuild.push(item);
                }
                catch (e){
                    console.error('spkg dir create failed!!!');
                }
            }
        }
    });

    //console.info(packageWaitForBuild);

    packageWaitForBuild.forEach( spkgpath => {
        try {

            let buffer = fs.readFileSync(spkgpath);
            let text = buffer.toString();
            let pkgJSON = JSON.parse(text);
            //console.info(pkgJSON);

            let extname = path.extname(spkgpath);
            let purefilename = path.basename( spkgpath, extname );
            let dirname = path.dirname(spkgpath);
            let pkgDir = path.join( dirname , purefilename);
            packageBuilder.ParsePkg(pkgJSON, pkgDir);

        } catch (e) {

        }

    } );

}


packageBuilder.DownloadFile = function(dir, osgfile, downloadfile) {

    //return;

    let absDir = path.join(dir, downloadfile);
    try {
        fs.accessSync(absDir, fs.F_OK);

    } catch (e) {
        var file = fs.createWriteStream(absDir);
        var request = https.get(osgfile, function (response) {

            switch (response.headers['content-encoding']) {
                // or, just use zlib.createUnzip() to handle both cases
                case 'gzip':
                    response.pipe(zlib.createGunzip()).pipe(file);
                    break;
                case 'deflate':
                    response.pipe(zlib.createInflate()).pipe(file);
                    break;
                default:
                    response.pipe(file);
                    break;
            }

            var len = parseInt(response.headers['content-length'], 10);
            var body = "";
            var cur = 0;
            var total = len / 1048576; //1048576 - bytes in  1Megabyte

            response.on("data", function(chunk) {
                body += chunk;
                cur += chunk.length;

                let outData = "Downloading " + downloadfile + ' - ' +  (100.0 * cur / len).toFixed(2) + "% ";
                console.log(outData);
            });

            response.on("end", function() {

            });
        });
    }
}

packageBuilder.ParsePkg = function( pkgObject, dir ){
    //console.info(pkgObject);
    console.info('pkg building...\nwork dir: ' + dir);

    // mesh files
    let osgfile = pkgObject.files[0].osgjsUrl;
    let osgModelfile = osgfile.replace('file.osgjs.gz', 'model_file.bin.gz');

    packageBuilder.DownloadFile(dir, osgfile, 'model.osgjs');
    packageBuilder.DownloadFile(dir, osgModelfile, 'model.osgjs.bin');

    // material files
    let options = pkgObject.options;
    let materials = options.materials;

    for( let mat in materials )
    {
        let matnode = materials[mat];

        let mattext = JSON.stringify(matnode);

        fs.writeFile(path.join(dir, matnode.name + '.mat'), mattext, function(err){
            if(!err) {
                //console.log(matnode.name + " writed");
            }
        });

        // download all textures
        for( let channel in matnode.channels)
        {
            //console.info(matnode);
            let channelnode = matnode.channels[channel];
            if( channelnode.texture )
            {
                let image = channelnode.texture.image;
                let name = image.name;
                let images = image.images;

                let toplodurl = '';
                let maxWidth = 0;
                for( let i=0; i < images.length; ++i)
                {
                    let currImage = images[i];
                    if( currImage.width > maxWidth )
                    {
                        maxWidth = currImage.width;
                        toplodurl = currImage.url;
                    }
                }
                let ext = path.extname(toplodurl);
                packageBuilder.DownloadFile( dir, toplodurl, name + ext );

            }
        }
    }

}
