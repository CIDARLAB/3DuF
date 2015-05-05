use <C:\Users\Aaron Heuckroth\Documents\GitHub\3DuF\src\SCAD\mold\mold.SCAD>
use <C:\Users\Aaron Heuckroth\Documents\GitHub\3DuF\src\SCAD\features\channel.SCAD>


union() {
	preset_mold(height = 40, width = 50);
	channel(channel_height = 0.5000000000, channel_width = 2, end = [25, 10], flip = false, height_offset = 0, start = [15, 10]);
}
/***********************************************
******      SolidPython code:      *************
************************************************
 
#! /usr/bin/env python
# -*- coding: utf-8 -*-
import sys, os

from solid import *

# Import OpenSCAD code and call it from Python code.
# The path given to use() (or include()) must be absolute or findable in sys.path
def demo_scad_include():
    # scad_to_include.scad includes a module called steps()
    channel_path = "./SCAD/features/channel.SCAD"
    mold_path = "./SCAD/mold/mold.SCAD"
    use(channel_path) #  could also use 'include', but that has side-effects; 
                    # 'use' just imports without executing any of the imported code
    use(mold_path)
    return preset_mold(50,40) + channel([15,10],[25,10], 2,.5,False,0);

if __name__ == '__main__':    
    out_dir = os.curdir
    file_out = os.path.join( out_dir, 'scad_include_example.scad')
    
    a = demo_scad_include()
    
    print("%(__file__)s: SCAD file written to: \n%(file_out)s"%vars())
    
    scad_render_to_file( a, file_out)   
 
***********************************************/
