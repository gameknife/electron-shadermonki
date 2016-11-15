/**
 * Created by kaimingyi on 2016/11/15.
 */
const resMgr    = require('./gk-resmgr.js');
const fs        = require('fs-extra');
const path      = require('path');

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
        item = path.relative( respanel.basedir, item );
        resMgr.gResmgr.add_res(item);
    });

}

respanel.reconstruct_filetree = function () {

    // rebuild filetree with root
    respanel.resFolderStruct = { '_folded' : false, '_name': 'root', '_child' : {} };

    // build the folder struct
    resMgr.gResmgr.resrefs.forEach( item => {

        let folders = item.filetoken.split('/');

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
    respanel.clean_folder(respanel.resContainer);
    respanel.list_folder(respanel.resFolderStruct, 1);
}

//console.info(resFolderStruct);
// dispatch res to resouce

respanel.list_folder = function (folderStruct, depth) {

    for (let element in folderStruct._child) {

        let folder = folderStruct._child[element];
        if(folder === undefined)
        {
            break;
        }
        var obj_container = document.createElement('div');
        obj_container.style.padding = '2px ' + depth + 'px';
        var log_line = document.createElement('button');
        obj_container.appendChild(log_line);


        log_line.className = 'obj-line';
        if( respanel.curr_selection === folder )
        {
            log_line.className = 'obj-line-checked';
        }

        if (folder instanceof resMgr.BaseResObj)
        {
            log_line.ondblclick = function () {

                // load mesh fast. tmp method
                window.parent.renderer.updateMesh( folder.filetoken );

                // click callback

            }

            log_line.onclick = function () {
                // mark as selected
                respanel.curr_selection = folder;
                respanel.refresh();
            }

            log_line.id = 'btn-' + folder.filetoken;


            var log_icon = document.createElement('i');

            switch (folder.get_type()) {
                case resMgr.RESTYPE.MESH:
                    log_icon.className = 'btm bt-database';
                    break;
                case resMgr.RESTYPE.TEXTURE:
                    log_icon.className = 'bts bt-photo';
                    break;
            }

            log_icon.style.color = '#8af';
            log_line.appendChild(log_icon);

            var log_text = document.createTextNode(' ' + folder.filetoken.split('/').pop());
            log_line.appendChild(log_text);
            respanel.resContainer.appendChild(obj_container);
        }
        else
        {
            log_line.onclick = function () {
                folder._folded = !folder._folded;
                respanel.refresh();
            }


            log_line.id = 'folder-' + folder._name;

            var log_icon = document.createElement('i');
            if (folder._folded) {
                log_icon.className = 'bts bt-folder';
            }
            else
            {
                log_icon.className = 'btm bt-folder';
            }

            log_icon.style.color = '#8af';
            log_line.appendChild(log_icon);

            var log_text = document.createTextNode(' ' + folder._name);
            log_line.appendChild(log_text);
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





