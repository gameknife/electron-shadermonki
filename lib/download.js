// ==UserScript==
// @name           Sketchfab Console
// @description    lets you download Sketchfab models
// @author         gameKnife
//
//Version Number
// @version        1.0
//
// Urls process this user script on
// @include        /^https?://(www\.)?sketchfab\.com/models/.*$/
// ==/UserScript==

function getElementByXpath(path) {
    return document.evaluate(path, document, null, XPathResult.ANY_TYPE, null).singleNodeValue;
};

function InfoForGeometry(geom) {
    try {
        info = {
            'name' : geom._name,
            'vertices' : geom.attributes.Vertex._elements,
            'primitives' : []
        };
        for (i = 0; i < geom.primitives.length; ++i) {
            var primitive = geom.primitives[i];
            if (primitive.mode == 1)
                return null;
            info.primitives.push({
                'mode' : primitive.mode,
                'indices' : primitive.indices._elements
            });
        }
        return info;
    }
    catch (err) {
        console.log(err.message);
        console.log(geom);
    }
};

function OBJforGeometry(geom) {
    return OBJforGeometryInfo(InfoForGeometry(geom));
};

var vertexOffset = 0;
var numUndefinedObjNames = 0;
function OBJforGeometryInfo(info) {
    if (!info)
        return;
    var obj = 'o ' + (info.name ? info.name : ++numUndefinedObjNames) + '\n';
    for (var i = 0; i < info.vertices.length; i += 3) {
        obj += 'v ';
        for (j = 0; j < 3; ++j) {
            obj += info.vertices[i + j] + ' ';
        }
        obj += '\n';
    }
    for (var i = 0; i < info.primitives.length; ++i) {
        var primitive = info.primitives[i];
        if (primitive.mode == gl.TRIANGLES || primitive.mode == gl.TRIANGLE_STRIP) {
            for (j = 0; j + 2 < primitive.indices.length; primitive.mode == gl.TRIANGLES ? j += 3 : ++j) {
                obj += 'f ';
                for (k = 0; k < 3; ++k) {
                    obj += (primitive.indices[j + k] + vertexOffset + 1) + ' ';
                }
                obj += '\n';
            }
        }
        else {
            console.log('Primitive mode not implemented');
        }
    }
    vertexOffset += info.vertices.length / 3;
    return obj;
};

var computedIDs = new Array();
var combinedOBJ = '';
function recurse(node) {
    if (node.className() == 'Geometry') {
        var computeOBJ = true;
        var useID = '_uniqueID' in node;
        for (var i = 0; i < computedIDs.length; ++i) {
            if (computedIDs[i] == (useID ? node._uniqueID : node._name)) {
                computeOBJ = false; 
                break;
            }
        }
        if (computeOBJ) {
            computedIDs.push(useID ? node._uniqueID : node._name);
            combinedOBJ += OBJforGeometry(node);
        }
    }
    if (node.children.length) {
        for (var i = 0; i < node.children.length; ++i) {
            recurse(node.children[i]);
        }
    }
};

window.dlOSG = function() {

    var textToWrite = '';
    
    for( var data in prefetchedData )
    {
        
        var datas = prefetchedData[data];
        if( 'files' in datas)
        {
            
            
            
            var file = datas['files'];
            if(file !== null)
            {
                //console.info(file);
                var url = file[0]['osgjsUrl'];
                console.info(url);
                
                var downloadLink = document.createElement("a");
                downloadLink.download = 'file.osgjs';
                downloadLink.innerHTML = "Download File";
                downloadLink.href = url;
                downloadLink.click();
                
                
                url = url.replace('file.osgjs.gz','model_file.bin.gz');
                console.info(url);
                var downloadLinkBIN = document.createElement("a");
                downloadLinkBIN.download = 'model_file.bin.gz';
                downloadLinkBIN.innerHTML = "Download File";
                downloadLinkBIN.href = url;
                downloadLinkBIN.click();
            }
            
            var materials = datas['options']['materials'];
            
            for( var matname in materials )
            {
                var mat = materials[matname];
                var matname = mat['name'];
                var colorChannel = mat['channels']['DiffuseColor'];
                if( 'texture' in colorChannel)
                {
                    var texname = colorChannel['texture']['image']['attributes']['name'];
                    //textToWrite += matname + '$' + texname + '\r\n';
                    
                    //write mat file
                    var textFileAsBlob = new Blob([texname], {type:'text/plain'});
                    var downloadLinkLIST = document.createElement("a");
                    downloadLinkLIST.download = matname + '.mat';
                    downloadLinkLIST.innerHTML = "Download File";
                    if (window.webkitURL != null)
                    {
                        // Chrome allows the link to be clicked
                        // without actually adding it to the DOM.
                        downloadLinkLIST.href = window.webkitURL.createObjectURL(textFileAsBlob);
                    }
                    else
                    {
                        // Firefox requires the link to be added to the DOM
                        // before it can be clicked.
                        downloadLinkLIST.href = window.URL.createObjectURL(textFileAsBlob);
                    }
                    downloadLinkLIST.click();
                    
                }
            }
            
            }
        
        
        if( data.indexOf('textures') !== -1 )
        {
            var images = datas['results'];
            images.forEach( img => {
                
                var lods = img['images'];
                var selectedImg = 0;
                var maxWidth = 0;
                for(var i=0; i < lods.length; ++i)
                {
                    if( lods[i]['width'] > maxWidth )
                    {
                        maxWidth = lods[i]['width'];
                        selectedImg = i;
                    }
                }
                
                var imagefile = lods[selectedImg]['url'];
                console.info(imagefile);
                
                textToWrite += lods[selectedImg]['url'] + '#' + img['name'] + '\r\n';
                
                var downloadLinkBIN = document.createElement("a");
                downloadLinkBIN.download = '@' + img['name'];
                downloadLinkBIN.innerHTML = "Download File";
                downloadLinkBIN.href = imagefile;
                downloadLinkBIN.click();
            } );
        }
        
        
    }
    
    var textFileAsBlob = new Blob([textToWrite], {type:'text/plain'});
        var downloadLinkLIST = document.createElement("a");
        downloadLinkLIST.download = 'list';
        downloadLinkLIST.innerHTML = "Download File";
        if (window.webkitURL != null)
    {
        // Chrome allows the link to be clicked
        // without actually adding it to the DOM.
        downloadLinkLIST.href = window.webkitURL.createObjectURL(textFileAsBlob);
    }
    else
    {
        // Firefox requires the link to be added to the DOM
        // before it can be clicked.
        downloadLinkLIST.href = window.URL.createObjectURL(textFileAsBlob);
    }
        downloadLinkLIST.click();
    
};

window.parseInfo = function() {
       for( var data in prefetchedData )
    {
        
        var datas = prefetchedData[data];
        if( 'files' in datas)
        {
            var textToWrite = JSON.stringify(datas);
            console.info();
            var textFileAsBlob = new Blob([textToWrite], {type:'text/plain'});
            var downloadLinkLIST = document.createElement("a");
            downloadLinkLIST.download = datas['name'] + '.spkg';
            downloadLinkLIST.innerHTML = "Download File";
            if (window.webkitURL != null)
            {
                // Chrome allows the link to be clicked
                // without actually adding it to the DOM.
                downloadLinkLIST.href = window.webkitURL.createObjectURL(textFileAsBlob);
            }
            else
            {
                // Firefox requires the link to be added to the DOM
                // before it can be clicked.
                downloadLinkLIST.href = window.URL.createObjectURL(textFileAsBlob);
            }
            downloadLinkLIST.click();
        }
    }
    
};





//var ul = getElementByXpath('//*[@class="actions"]/ul');
var uls = document.getElementsByClassName("actions");
var ul = uls[2];
var li=document.createElement("div");
li.innerHTML='<a class="button btn-medium btn-primary download" id="downloadOBJ"><span class="button-label">Get it!</span></a>';
li.addEventListener ("click", dlOSG , false);
ul.appendChild(li);

var li1=document.createElement("div");
li1.innerHTML='<a class="button btn-medium btn-primary download" id="downloadOBJ"><span class="button-label">Info!</span></a>';
li1.addEventListener ("click", parseInfo , false);
ul.appendChild(li1);