#! /usr/bin/env python
# -*- coding: utf-8 -*-
import sys, os, json

from solid import *
from solid.utils import *


features_path = "./SCAD/features/"
mold_path = "./SCAD/mold/"
JSON_path = "./transposer_large_output/transposer_large.json"
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

def generate_feature(feature_data, layer_data):
    target_layer = layer_data[feature_data["layer"]]
    args = {}
    args["z_offset"] = target_layer["z_offset"]
    args["flip"] = target_layer["flip"]
    for prop in feature_data.keys():
        if (prop != "layer" and prop != "ID" and prop != "type"):
            data = feature_data[prop]
            if isinstance(data, basestring):
                data = "\"" + data + "\""
            args[prop] = data

    return globals()[feature_data["type"]](**args)

def generate_mold(device_data):
    return preset_mold(width = device_data["width"], height = device_data["height"])

def render_all_features(json_data):
    all_features = union()
    layers = json_data["layers"]
    device = json_data["device"]
    features = json_data["features"]

    all_features.add(generate_mold(device))

    for feature_ID in features.keys():
        all_features.add(generate_feature(features[feature_ID], layers))

    return all_features

def test_all_features():
   # va = valve(position = [1,2], radius1 = 1,radius2 = .75, height = .5, flip = True, z_offset = 1)
   # vi = via(position = [1,2],radius1 = .5,radius2 = .4,height=.5,flip=False,z_offset=0);
   # ch = channel(start=[0,0],end=[0,20],width=2,height=.5,flip= False,z_offset=0);
    po = globals()['port']("position=[1,2]","radius=1", "height=.2","flip=False","z_offset=0")
   # st = standoff(position = [1,2],radius1 = 1,radius2 = .5,height = .5, flip=False,z_offset=40)
   # la = label(position=[0,0],label_text="foobarbaz",height=.05,flip=False,z_offset=1);

    #return va + right(10)(vi) + right(20)(ch) + right(30)(po) + right(40)(st) + right(50)(la)
    return po

if __name__ == '__main__':    
    out_dir = sys.argv[1] if len(sys.argv) > 1 else os.curdir
    file_out = os.path.join( out_dir, 'scad_include_example.scad')
    use_all_features()
    use_all_molds()
    json = load_json_data(JSON_path)
    
    a = render_all_features(json)
    
    print("%(__file__)s: SCAD file written to: \n%(file_out)s"%vars())
    
    scad_render_to_file( a, file_out)  