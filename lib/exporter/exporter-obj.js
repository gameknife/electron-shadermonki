/**
 * Created by kaimingyi on 2016/12/15.
 */
const Component = require('../gk-component.js');
const math = require('gl-matrix');
const fs = require('fs');
const path = require('path');

var exporter_obj = exporter_obj || {};
module.exports = exporter_obj;

exporter_obj.exportNode = function( rootGameObject )
{
    // make root transform to root
    if( !(rootGameObject instanceof Component.Transform ) )
    {
        console.info('export error, root node must be Component.Transform');
        return;
    }

    let orgParent = rootGameObject.parent;
    rootGameObject.parent = null;

    // goThrough each MeshFilter, export into obj
    let mfs = rootGameObject.getComponent( Component.MeshFilter );

    let headerPart = 'mtllib ./test.mtl\r';

    let vertexPart = '';
    let normalPart = '';
    let texcoordPart = '';

    let mtlFileContent = '';

    let facePart = '';
    let totalVertexPassed = 1;
    let totalObjectPassed = 0;

    mfs.forEach( meshFilter => {
        if( meshFilter.mesh )
        {
            facePart += 'o Geometry' + totalObjectPassed + '\r';
            let mr = meshFilter.host.components.get(Component.MeshRenderer);
            if( mr )
            {
                facePart += 'usemtl ' + mr.material.name + '\r';

                // write mat file here

                mtlFileContent += '\r';
                mtlFileContent += 'newmtl ' + mr.material.name + '\r';
                mtlFileContent += 'Kd 1.00000000000000 1.00000000000000 1.00000000000000\r';
                mtlFileContent += 'map_Kd ' + path.basename( mr.material.mainTex.filetoken )+ '\r';
                mtlFileContent += 'Ks 1.00000000000000 1.00000000000000 1.00000000000000\r';
                mtlFileContent += 'Ns 100\rillum 7\r';
            }

            let vbo = meshFilter.mesh.vboForReadback;
            let size = meshFilter.mesh.vertexSize / 4;

            let vertCount = vbo.length / size ;
            //console.log(vbo.length  + ' / ' +  size);

            for( let i=0; i < vertCount; ++i) {

                let position = math.vec3.fromValues(meshFilter.mesh.vboForReadback[i * size + 0], meshFilter.mesh.vboForReadback[i * size + 1],meshFilter.mesh.vboForReadback[i * size + 2]);
                let normal = math.vec3.fromValues(meshFilter.mesh.vboForReadback[i * size + 3], meshFilter.mesh.vboForReadback[i * size + 4],meshFilter.mesh.vboForReadback[i * size + 5]);
                let texcoord = math.vec2.fromValues(meshFilter.mesh.vboForReadback[i * size + 6], meshFilter.mesh.vboForReadback[i * size + 7]);

                let mtx = meshFilter.host.transform.localToWorldMatrix;

                math.vec3.transformMat4( position, position, mtx);
                math.vec3.normalize(normal,normal);
                let alignNormal = math.vec4.fromValues( normal[0], normal[1], normal[2], 0 );
                math.vec4.transformMat4( alignNormal, alignNormal, mtx);
                normal = math.vec3.clone( alignNormal );
                math.vec3.normalize(normal,normal);

                let vertexstring = 'v ' + position[0]
                    + ' ' + position[1]
                    + ' ' + position[2]
                    + '\r';
                let normalstring = 'vn ' + normal[0]
                    + ' ' + normal[1]
                    + ' ' + normal[2]
                    + '\r';
                let texcoordstring = 'vt ' + texcoord[0]
                    + ' ' + (1.0 - texcoord[1])
                    + '\r';

                vertexPart += vertexstring;
                normalPart += normalstring;
                texcoordPart += texcoordstring;

                //console.info( vertexstring + normalstring + texcoordstring );
            }


            // idx process
            let tristrip = meshFilter.mesh.tristripForReadback;
            let trilist = meshFilter.mesh.trilistForReadback;

            if(tristrip)
            {
                for( let i=0, len = tristrip.length - 2; i < len; ++i)
                {
                    let v0 = tristrip[i] + totalVertexPassed;
                    let v1 = tristrip[i+1] + totalVertexPassed;
                    let v2 = tristrip[i+2] + totalVertexPassed;

                    if(v0 != v1 && v0 != v2 && v1 != v2)
                    {
                        let faceString = 'f ';
                        if( i % 2 === 0 ) {
                            faceString = 'f ' + v0 + '/' + v0 + '/' + v0 + ' '
                                + v1 + '/' + v1 + '/' + v1 + ' '
                                + v2 + '/' + v2 + '/' + v2 + '\r';
                        }
                        else {
                            faceString = 'f ' + v0 + '/' + v0 + '/' + v0 + ' '
                                + v2 + '/' + v2 + '/' + v2 + ' '
                                + v1 + '/' + v1 + '/' + v1 + '\r';
                        }

                        facePart += faceString;
                    }
                }
            }

            if(trilist)
            {
                for( let i=0, len = trilist.length / 3; i < len; ++i)
                {
                    let v0 = trilist[i * 3] + totalVertexPassed;
                    let v1 = trilist[i * 3 + 1] + totalVertexPassed;
                    let v2 = trilist[i * 3 + 2] + totalVertexPassed;

                    if(v0 != v1 && v0 != v2 && v1 != v2)
                    {
                        let faceString = 'f ' + v0 + '/' + v0 + '/' + v0 + ' '
                            + v1 + '/' + v1 + '/' + v1 + ' '
                            + v2 + '/' + v2 + '/' + v2 + '\r';

                        facePart += faceString;
                    }
                }
            }

            totalVertexPassed += vertCount;
            totalObjectPassed++;

        }
    })

    fs.writeFile("test.obj", headerPart + vertexPart + normalPart + texcoordPart + facePart ,function(err){
        if(!err)
            console.log("obj writed！");
    });

    fs.writeFile('test.mtl', mtlFileContent ,function(err){
        if(!err)
            console.log("obj writed！");
    });

    rootGameObject.parent = orgParent;
}