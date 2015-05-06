#! /usr/bin/env python
# -*- coding: utf-8 -*-
import sys, os, json

from solid import *
from solid.utils import *

SEGMENTS = 10

features_path = "./SCAD/features/"
mold_path = "./SCAD/mold/"
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
    feature_color = target_layer["color"]
    for prop in feature.keys():
        if (prop != "layer" and prop != "ID" and prop != "type"):
            data = feature[prop]
         #  if isinstance(data, str):
          #      data = "\"" + data + "\""
            args[prop] = data

    return color(feature_color)(globals()[feature["type"]](**args))
   # return globals()[feature["type"]](**args)

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

    return layer_features + mold

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
    input_file = sys.argv[1]
    use_all_features()
    use_all_molds()
    json = load_json_data(input_file)
    out_prefix = json["device"]["name"]
    mockup = render_all_features(json)
    mockup_out = out_prefix + "_MOCKUP.scad"
    mockup_stl = out_prefix + "_MOCKUP.stl"
    scad_render_to_file(mockup, mockup_out, file_header='$fn = %s;\n'%SEGMENTS, include_orig_code=False)
    os.system("openscad -o " + mockup_stl + " " + mockup_out)
    for layer in json["layers"].keys():
        layer_out = out_prefix + "_" + layer + ".scad"
        layer_stl = out_prefix + "_" + layer + ".stl"
        scad_render_to_file(render_layer(layer, json), layer_out, file_header='$fn = %s;\n'%SEGMENTS, include_orig_code=False)
        os.system("openscad -o " + layer_stl + " " + layer_out)

    #a = render_layer("f", json)
    
    print("%(__file__)s: SCAD files written to: \n%(out_prefix)s"%vars())
    
