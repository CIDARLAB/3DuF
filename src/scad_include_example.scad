use <C:\Users\Aaron Heuckroth\Documents\GitHub\3DuF\src\SCAD\features\port.scad>
use <C:\Users\Aaron Heuckroth\Documents\GitHub\3DuF\src\SCAD\features\standoff.scad>
use <C:\Users\Aaron Heuckroth\Documents\GitHub\3DuF\src\SCAD\features\via.scad>
use <C:\Users\Aaron Heuckroth\Documents\GitHub\3DuF\src\SCAD\mold\mold.scad>
use <C:\Users\Aaron Heuckroth\Documents\GitHub\3DuF\src\SCAD\features\channel.scad>


union() {
	channel(end = [48.0000000000, 20], flip = false, height = 0.1000000000, start = [30, 20], width = 0.2000000000, z_offset = 0);
	channel(end = [48.0000000000, 20], flip = false, height = 0.1000000000, start = [30, 20], width = 0.2000000000, z_offset = 0);
	channel(end = [48.0000000000, 29.4000000000], flip = false, height = 0.1000000000, start = [30, 29.4000000000], width = 0.2000000000, z_offset = 0);
	channel(end = [48.0000000000, 29.4000000000], flip = false, height = 0.1000000000, start = [30, 29.4000000000], width = 0.2000000000, z_offset = 0);
	channel(end = [39.0000000000, 29.4000000000], flip = false, height = 0.1000000000, start = [39.0000000000, 20], width = 0.2000000000, z_offset = 0);
	channel(end = [39.0000000000, 29.4000000000], flip = false, height = 0.1000000000, start = [39.0000000000, 20], width = 0.2000000000, z_offset = 0);
	channel(end = [33.4000000000, 24.7000000000], flip = false, height = 0.1000000000, start = [33.4000000000, 20], width = 0.2000000000, z_offset = 0);
	channel(end = [33.4000000000, 24.7000000000], flip = false, height = 0.1000000000, start = [33.4000000000, 20], width = 0.2000000000, z_offset = 0);
	channel(end = [44.6000000000, 24.7000000000], flip = false, height = 0.1000000000, start = [44.6000000000, 29.4000000000], width = 0.2000000000, z_offset = 0);
	channel(end = [44.6000000000, 24.7000000000], flip = false, height = 0.1000000000, start = [44.6000000000, 29.4000000000], width = 0.2000000000, z_offset = 0);
	port(flip = false, height = 0.1000000000, position = [30, 20], radius = 0.5000000000, z_offset = 0);
	port(flip = false, height = 0.1000000000, position = [30, 29.4000000000], radius = 0.5000000000, z_offset = 0);
	port(flip = false, height = 0.1000000000, position = [48.0000000000, 20], radius = 0.5000000000, z_offset = 0);
	port(flip = false, height = 0.1000000000, position = [48.0000000000, 29.4000000000], radius = 0.5000000000, z_offset = 0);
	via(flip = false, height = 1.1000000000, position = [33.4000000000, 24.7000000000], radius1 = 0.6000000000, radius2 = 0.5000000000, z_offset = 0);
	via(flip = false, height = 1.1000000000, position = [44.6000000000, 24.7000000000], radius1 = 0.6000000000, radius2 = 0.5000000000, z_offset = 0);
	via(flip = false, height = 1.1000000000, position = [30, 20], radius1 = 0.6000000000, radius2 = 0.5000000000, z_offset = 0);
	via(flip = false, height = 1.1000000000, position = [30, 29.4000000000], radius1 = 0.6000000000, radius2 = 0.5000000000, z_offset = 0);
	via(flip = false, height = 1.1000000000, position = [48.0000000000, 20], radius1 = 0.6000000000, radius2 = 0.5000000000, z_offset = 0);
	via(flip = false, height = 1.1000000000, position = [48.0000000000, 29.4000000000], radius1 = 0.6000000000, radius2 = 0.5000000000, z_offset = 0);
	standoff(flip = false, height = 1.2000000000, position = [3, 3], radius1 = 1.2000000000, radius2 = 1, z_offset = 0);
	standoff(flip = false, height = 1.2000000000, position = [72.8000000000, 3], radius1 = 1.2000000000, radius2 = 1, z_offset = 0);
	standoff(flip = false, height = 1.2000000000, position = [72.8000000000, 48], radius1 = 1.2000000000, radius2 = 1, z_offset = 0);
	standoff(flip = false, height = 1.2000000000, position = [3, 48], radius1 = 1.2000000000, radius2 = 1, z_offset = 0);
	preset_mold(height = 51, width = 75.8000000000);
}
/***********************************************
******      SolidPython code:      *************
************************************************
 
#! /usr/bin/env python
# -*- coding: utf-8 -*-
import sys, os, json

from solid import *
from solid.utils import *


features_path = "./SCAD/features/"
mold_path = "./SCAD/mold/"
JSON_path = "./VT_SMALL_output/VT_SMALL.json"
#JSON_path = "./transposer_large_output/transposer_large.json"
#JSON_path = "./transposer_large_output/transposer_large.json"



# Import OpenSCAD code and call it from Python code.
# The path given to use() (or include()) must be absolute or findable in sys.path
def use_all_features():
    files = [os.path.join(features_path,f) for f in os.listdir(features_path) if os.path.isfile(os.path.join(features_path, f))]
    for f in files: 
        use(f)

def use_all_molds():
    files = [os.path.join(mold_path,f) for f in os.listdir(mold_path) if os.path.isfile(os.path.join(mold_path, f))]
    for f in files: 
        use(f)

def load_json_data(filename):
    json_file = open(filename)
    json_data = json.loads(json_file.read())
    json_file.close()

    return json_data

def generate_feature(feature, layers):
    target_layer = layers[feature["layer"]]
    args = {}
    args["z_offset"] = target_layer["z_offset"]
    args["flip"] = target_layer["flip"]
    for prop in feature.keys():
        if (prop != "layer" and prop != "ID" and prop != "type"):
            data = feature[prop]
            if isinstance(data, basestring):
                data = "\"" + data + "\""
            args[prop] = data

    return globals()[feature["type"]](**args)

def generate_mold(device_data):
    return preset_mold(width = device_data["width"], height = device_data["height"])

def render_layer(layer_ID, json_data):
    layers = json_data["layers"]
    device = json_data["device"]
    features = json_data["features"]

    target_layer = layers[layer_ID]

    mold = generate_mold(device)

    layer_features = union()

    for feature_ID in target_layer["features"]:
        layer_features.add(generate_feature(features[feature_ID], layers))

    if (target_layer["flip"]):
        layer_features = translate([device["width"],0,target_layer["z_offset"]])(
            rotate([0,180,0])
            (
                layer_features)
            )

    layer_features.add(mold)

    return layer_features

def render_all_features(json_data):
    all_features = union()
    layers = json_data["layers"]
    device = json_data["device"]
    features = json_data["features"]

    all_features.add(generate_mold(device))


    for feature_ID in features.keys():
        all_features.add(generate_feature(features[feature_ID], layers))

    return all_features

if __name__ == '__main__':    
    out_dir = sys.argv[1] if len(sys.argv) > 1 else os.curdir
    file_out = os.path.join( out_dir, 'scad_include_example.scad')
    use_all_features()
    use_all_molds()
    json = load_json_data(JSON_path)
    
   # a = render_all_features(json)
    a = render_layer("f", json)
    
    print("%(__file__)s: SCAD file written to: \n%(file_out)s"%vars())
    
    scad_render_to_file( a, file_out)   
 
***********************************************/
