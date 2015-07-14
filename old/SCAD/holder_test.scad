slide_thickness = 1.2;
slide_width = 75.8; //75.8 for smaller slides
slide_height = 51;
interlock = .1;
layer_offset = 4;
bottom_thickness = 2;
holder_height = 4;
side_height = slide_height ;//8;
holder_thickness = 4;
corner_width = 10;

front = 0;
first_hole_front = front + holder_thickness;
first_hole_back = holder_thickness + interlock *2 + slide_thickness;
second_hole_front = first_hole_back + layer_offset + interlock;
second_hole_back = second_hole_front + slide_thickness + interlock;
back = second_hole_back + holder_thickness;

block_depth = back;
block_width = slide_width + interlock*2 + holder_thickness*2;
block_thickness = holder_height + bottom_thickness + interlock;

skirt_width = 5;

cut_width =  interlock*2;
cut_offset = 10;

module slide(){
    cube([slide_width, slide_thickness, slide_height]);
}

module slideHole(){
    cube([slide_width+interlock*2, slide_thickness + interlock*2, slide_height+interlock*2]);
}

module side(){
    cube([holder_thickness + holder_height, block_depth, side_height + bottom_thickness + interlock]);
}

module skirt() {
    cube([block_width + skirt_width*2, block_depth + skirt_width*2,bottom_thickness]);
}

module bottom(){
    cube([block_width, block_depth, block_thickness]);
    translate([-skirt_width,-skirt_width,0]){
        //skirt();
    }
    
}

module middleOffsetCut(){
    cube([cut_width, layer_offset + slide_thickness *2 + interlock*4, holder_thickness + interlock*2]);
}

module middleUnderCut(){
    cube([cut_offset + cut_width, layer_offset + slide_thickness *2 + interlock*4, cut_width]);
}

module middleBottomCut(){
    cube([cut_width, layer_offset + slide_thickness *2 + interlock*4, bottom_thickness + interlock*3]);
}

module outsideCut(){
    cube([cut_width, holder_thickness + interlock*2, block_thickness + interlock*2]);
}

module holder(){
    difference(){
        block();
        translate([holder_thickness + interlock, first_hole_front, bottom_thickness])
        {
            slideHole();   
        }
        translate([holder_thickness + interlock, second_hole_front, bottom_thickness]){
            slideHole();
        }
    }
}  

module block(){
        bottom();
        side();
        translate([block_width - holder_thickness - holder_height,0,0]){
            side();
        }
}

module cutHolder(){
    difference(){
        holder();
        translate([block_width/2 - cut_width/2,-interlock,-interlock]){
            #outsideCut();
        }
        translate([block_width/2 - cut_width/2,second_hole_back-interlock,-interlock]){
            #outsideCut();
        }
        translate([block_width/2 - cut_width/2, first_hole_front,-interlock]){
            #middleBottomCut();
        }
        translate([block_width/2 - cut_offset - cut_width, first_hole_front, bottom_thickness]){
            #middleUnderCut();
        }
        translate([block_width/2 - cut_offset - cut_width, first_hole_front, bottom_thickness]){
            #middleOffsetCut();
        }
    }
}

module halfHolder(){
    difference(){
        holder();
        translate([block_width/2,-skirt_width -1,0]){
            cube([block_width/2 + skirt_width + 1, block_depth + skirt_width*2 + 1, side_height + holder_height + interlock]);
        }
    }
}

cutHolder();
//halfHolder();