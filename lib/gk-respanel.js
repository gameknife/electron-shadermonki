/**
 * Created by kaimingyi on 2016/11/15.
 */
const resMgr    = require('./gk-resmgr.js');
const fs        = require('fs-extra');
const path      = require('path');
const logger    = require('./gk-logger.js');

var respanel = respanel || {};

module.exports = respanel;


respanel.resFolderStruct = { '_folded' : false, '_name': 'root', '_child' : {} };
respanel.resContainer = null;
respanel.basedir = null;
respanel.curr_selection = null;

respanel.init = function(container, basedir)
{
    respanel.resContainer = container;
    respanel.basedir = basedir;
}

respanel.rescan_resources = function () {

    let filelist = fs.walkSync(respanel.basedir + '/res/');
    filelist.forEach( item => {

        item = path.normalize(item);
        let filename = path.basename( item );
        let dirname = path.dirname(item);
        let relpath = path.relative( respanel.basedir, dirname );
        let token = path.normalize( relpath + path.sep + filename );

        resMgr.gResmgr.add_res(token);
    });

}

respanel.reconstruct_filetree = function () {

    // rebuild filetree with root
    respanel.resFolderStruct = { '_folded' : false, '_name': 'root', '_child' : {} };

    // build the folder struct
    resMgr.gResmgr.resrefs.forEach( item => {

        let folders = item.filetoken.split(path.sep);

        let currFolderLevel = respanel.resFolderStruct;

        // go check the folder links, choose the last
        for( let i=0; i < folders.length; ++i)
        {
            if( i === folders.length - 1)
            {
                // leaf
                currFolderLevel._child[folders[i]] = item;
                break;
            }

            if( folders[i] in currFolderLevel._child )
            {
                currFolderLevel = currFolderLevel._child[folders[i]];
            }
            else
            {
                currFolderLevel._child[folders[i]] = { '_folded' : true, '_child' : {} };
                currFolderLevel._child[folders[i]]._name = folders[i];

                currFolderLevel = currFolderLevel._child[folders[i]];
            }
        }
    });

}

respanel.refresh = function () {
    let timestamp = Date.now();
    respanel.clean_folder(respanel.resContainer);
    respanel.list_folder(respanel.resFolderStruct, 1);
    let timeelapsed = Date.now() - timestamp;

    //logger.info('respanel refresh take ' + timeelapsed + 'ms.');
}

//console.info(resFolderStruct);
// dispatch res to resouce

respanel.create_res_showobj = function(depth, filetoken, type, thumbMode = true) {

    var obj_container = document.createElement('div');
    // indent
    obj_container.style.padding = '0px ' + depth + 'px';

    // create inside button
    var obj_button = document.createElement('button');
    obj_button.className = 'obj-line';
    obj_button.id = 'btn-' + filetoken;

    // create icon
    var log_icon = null;

    switch (type) {
        case resMgr.RESTYPE.MESH:
            log_icon = document.createElement('i');
            log_icon.className = 'btm bt-database';
            break;
        case resMgr.RESTYPE.TEXTURE:

            // load resmgt
            let res = resMgr.gResmgr.get_res(filetoken);
            if(res !== null)
            {
                log_icon = document.createElement('img');
                log_icon.src = res.filetoken;
                if(thumbMode)
                {
                    log_icon.width = '13';
                    log_icon.height = '13';
                }
                else
                {
                    log_icon.width = '48';
                    log_icon.height = '48';
                }

            }
            else
            {
                log_icon = document.createElement('i');
                log_icon.className = 'bts bt-photo';
            }
            break;
    }
    log_icon.style.color = '#8af';

    // create name text
    var log_text = document.createTextNode(' ' + filetoken.split(path.sep).pop());

    // compose
    obj_button.appendChild(log_icon);
    if(thumbMode)
    {
        obj_button.appendChild(log_text);
    }
    obj_container.appendChild(obj_button);

    // return
    return {obj_container: obj_container, obj_button: obj_button, obj_icon: log_icon};
}

respanel.list_folder = function (folderStruct, depth) {

    for (let element in folderStruct._child) {

        let folder = folderStruct._child[element];
        if(folder === undefined)
        {
            break;
        }



        if (folder instanceof resMgr.BaseResObj)
        {
            // create obj button
            let filetoken = folder.filetoken;
            let type = folder.get_type();
            let __ret = respanel.create_res_showobj(depth, filetoken, type);
            let obj_container = __ret.obj_container;
            let obj_button = __ret.obj_button;
            let obj_icon = __ret.obj_icon;

            if(folder.loaded)
            {
                obj_icon.style.color = '#7f7';
            }

            // selection status
            if (respanel.curr_selection === folder) {
                obj_button.className = 'obj-line-checked';
            }

            // click selection change
            obj_button.onclick = function () {
                respanel.curr_selection = folder;
                respanel.refresh();
            }

            // drag status
            obj_button.draggable = true;
            obj_button.ondragstart = function (ev) {
                ev.dataTransfer.setData("restoken", filetoken);
            }

            // db click
            obj_button.ondblclick = function () {
                //window.parent.renderer.updateMesh(folder.filetoken);
            }

            // append
            respanel.resContainer.appendChild(obj_container);
        }
        else
        {
            var obj_container = document.createElement('div');
            obj_container.style.padding = '0px ' + depth + 'px';

            var obj_button = document.createElement('button');
            obj_button.id = 'folder-' + folder._name;
            obj_button.className = 'obj-line';

            obj_button.onclick = function () {
                folder._folded = !folder._folded;
                respanel.refresh();
            }

            var log_icon = document.createElement('i');
            if (folder._folded) {
                log_icon.className = 'bts bt-folder';
            } else {
                log_icon.className = 'btm bt-folder';
            }
            log_icon.style.color = '#8af';
            var log_text = document.createTextNode(' ' + folder._name);

            // compose
            obj_button.appendChild(log_icon);
            obj_button.appendChild(log_text);
            obj_container.appendChild(obj_button);

            respanel.resContainer.appendChild(obj_container);

            if (folder._folded) {

            }
            else
            {
                //console.info(folder);
                respanel.list_folder(folder, depth + 10);
            }
        }


        //var log_icon = document.createElement('i');

    }
    ;
}

respanel.clean_folder = function(resContainer) {
    while (resContainer.firstChild) {
        resContainer.removeChild(resContainer.firstChild);
    }
}





