import * as THREE from "three";
/**
 * Based on https://github.com/mrdoob/three.js/blob/a72347515fa34e892f7a9bfa66a34fdc0df55954/examples/js/exporters/STLExporter.js
 * Tested on r68 and r70
 * @author jcarletto / https://github.com/jcarletto27
 * @author kjlubick / https://github.com/kjlubick
 * @author kovacsv / http://kovacsv.hu/
 * @author mrdoob / http://mrdoob.com/

 */
THREE.STLExporter = function () {};

THREE.STLExporter.prototype = {
    constructor: THREE.STLExporter,

    parse: (function () {
        const vector = new THREE.Vector3();
        const normalMatrixWorld = new THREE.Matrix3();

        return function (scene) {
            let output = "";

            output += "solid exported\n";

            scene.traverse(function (object) {
                if (object instanceof THREE.Mesh) {
                    const geometry = object.geometry;
                    const matrixWorld = object.matrixWorld;
                    const mesh = object;

                    if (geometry instanceof THREE.Geometry) {
                        const vertices = geometry.vertices;
                        const faces = geometry.faces;

                        normalMatrixWorld.getNormalMatrix(matrixWorld);

                        for (let i = 0, l = faces.length; i < l; i++) {
                            const face = faces[i];

                            vector.copy(face.normal).applyMatrix3(normalMatrixWorld).normalize();

                            output += "\tfacet normal " + vector.x + " " + vector.y + " " + vector.z + "\n";
                            output += "\t\touter loop\n";

                            const indices = [face.a, face.b, face.c];

                            for (let j = 0; j < 3; j++) {
                                const vertexIndex = indices[j];
                                if (mesh.geometry.skinIndices.length === 0) {
                                    vector.copy(vertices[vertexIndex]).applyMatrix4(matrixWorld);
                                    output += "\t\t\tvertex " + vector.x + " " + vector.y + " " + vector.z + "\n";
                                } else {
                                    vector.copy(vertices[vertexIndex]); // .applyMatrix4( matrixWorld );

                                    // see https://github.com/mrdoob/three.js/issues/3187
                                    const boneIndices = [];
                                    boneIndices[0] = mesh.geometry.skinIndices[vertexIndex].x;
                                    boneIndices[1] = mesh.geometry.skinIndices[vertexIndex].y;
                                    boneIndices[2] = mesh.geometry.skinIndices[vertexIndex].z;
                                    boneIndices[3] = mesh.geometry.skinIndices[vertexIndex].w;

                                    const weights = [];
                                    weights[0] = mesh.geometry.skinWeights[vertexIndex].x;
                                    weights[1] = mesh.geometry.skinWeights[vertexIndex].y;
                                    weights[2] = mesh.geometry.skinWeights[vertexIndex].z;
                                    weights[3] = mesh.geometry.skinWeights[vertexIndex].w;

                                    const inverses = [];
                                    inverses[0] = mesh.skeleton.boneInverses[boneIndices[0]];
                                    inverses[1] = mesh.skeleton.boneInverses[boneIndices[1]];
                                    inverses[2] = mesh.skeleton.boneInverses[boneIndices[2]];
                                    inverses[3] = mesh.skeleton.boneInverses[boneIndices[3]];

                                    const skinMatrices = [];
                                    skinMatrices[0] = mesh.skeleton.bones[boneIndices[0]].matrixWorld;
                                    skinMatrices[1] = mesh.skeleton.bones[boneIndices[1]].matrixWorld;
                                    skinMatrices[2] = mesh.skeleton.bones[boneIndices[2]].matrixWorld;
                                    skinMatrices[3] = mesh.skeleton.bones[boneIndices[3]].matrixWorld;

                                    // this checks to see if the mesh has any morphTargets - jc
                                    if (mesh.geometry.morphTargets !== "undefined") {
                                        const morphMatricesX = [];
                                        const morphMatricesY = [];
                                        const morphMatricesZ = [];
                                        const morphMatricesInfluence = [];

                                        for (var mt = 0; mt < mesh.geometry.morphTargets.length; mt++) {
                                            // collect the needed vertex info - jc
                                            morphMatricesX[mt] = mesh.geometry.morphTargets[mt].vertices[vertexIndex].x;
                                            morphMatricesY[mt] = mesh.geometry.morphTargets[mt].vertices[vertexIndex].y;
                                            morphMatricesZ[mt] = mesh.geometry.morphTargets[mt].vertices[vertexIndex].z;
                                            morphMatricesInfluence[mt] = mesh.morphTargetInfluences[mt];
                                        }
                                    }
                                    const finalVector = new THREE.Vector4();

                                    if (mesh.geometry.morphTargets !== "undefined") {
                                        var morphVector = new THREE.Vector4(vector.x, vector.y, vector.z);

                                        for (var mt = 0; mt < mesh.geometry.morphTargets.length; mt++) {
                                            // not pretty, but it gets the job done - jc
                                            morphVector.lerp(new THREE.Vector4(morphMatricesX[mt], morphMatricesY[mt], morphMatricesZ[mt], 1), morphMatricesInfluence[mt]);
                                        }
                                    }

                                    for (let k = 0; k < 4; k++) {
                                        if (mesh.geometry.morphTargets !== "undefined") {
                                            var tempVector = new THREE.Vector4(morphVector.x, morphVector.y, morphVector.z);
                                        } else {
                                            var tempVector = new THREE.Vector4(vector.x, vector.y, vector.z);
                                        }
                                        tempVector.multiplyScalar(weights[k]);
                                        // the inverse takes the vector into local bone space
                                        // which is then transformed to the appropriate world space
                                        tempVector.applyMatrix4(inverses[k]).applyMatrix4(skinMatrices[k]);
                                        finalVector.add(tempVector);
                                    }

                                    output += "\t\t\tvertex " + finalVector.x + " " + finalVector.y + " " + finalVector.z + "\n";
                                }
                            }
                            output += "\t\tendloop\n";
                            output += "\tendfacet\n";
                        }
                    }
                }
            });

            output += "endsolid exported\n";

            return output;
        };
    })()
};

export function getSTLString(scene) {
    const exporter = new THREE.STLExporter();
    const stlString = exporter.parse(scene);
    return stlString;
}

export function saveSTL(scene, name) {
    const exporter = new THREE.STLExporter();
    const stlString = exporter.parse(scene);

    const blob = new Blob([stlString], {
        type: "text/plain"
    });

    saveAs(blob, name + ".stl");
}
const exporter = new THREE.STLExporter();
export function exportString(output, filename) {
    const blob = new Blob([output], {
        type: "text/plain"
    });
    const objectURL = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = objectURL;
    link.download = filename || "data.json";
    link.target = "_blank";
    link.click();
}
