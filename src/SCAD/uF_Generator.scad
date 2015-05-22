$fn = 20;

BORDER_WIDTH = .1;
INTERLOCK_TOLERANCE = .125;
HOLDER_BORDER_WIDTH = .41; //.8
SLIDE_Z_OFFSET = 1.20;
//SLIDE_Z_OFFSET = 0;
BORDER_HEIGHT = 1.20;
HOLDER_SKIRT_WIDTH = .8;
HOLDER_SKIRT_HEIGHT = .2;
LABEL_SCALE_X = 1.2;
LABEL_FONT = "Liberation Sans:style=Bold";
LABEL_SCALE = 3;
FIRST_LAYER_COLOR =  [0,.5,1];
OTHER_LAYER_COLOR = [1,.2,.1];

module channel(start, end, channel_width, channel_height, flip, height_offset){

	col = height_offset == 0 ? FIRST_LAYER_COLOR : OTHER_LAYER_COLOR;
	
	dX = end[0] - start[0];
	dY = end[1] - start[1];
	angle_deg = atan2(dY, dX);
	dXPow = pow(dX,2);
	dYPow = pow(dY,2);
	length = sqrt(dXPow + dYPow);
	translate([start[0]+(channel_width/2)*sin(angle_deg),start[1]-cos(angle_deg)*(channel_width/2), height_offset]){
		if (flip)
		{	
			translate([0,0,-channel_height])
			{
				rotate([0,0,angle_deg])
					{
					color(col) cube([length+channel_width/2,channel_width,channel_height]);
				}
			
			}
		}
		else
		{
			rotate([0,0,angle_deg])
			{
				color(col) cube([length+channel_width/2,channel_width,channel_height]);
			}
		}
	}
}


module port(point, port_radius, port_height, flip, height_offset){
	col = height_offset == 0 ? FIRST_LAYER_COLOR : OTHER_LAYER_COLOR;

	translate([point[0],point[1],height_offset]){
		if (flip)
		{
			rotate([180,0,0])
			{
				color(col) cylinder(port_height, r = port_radius);
			}
		}
		else
		{
			color (col) cylinder(port_height, r = port_radius);
		}
	}
}

module via(point, start_radius, end_radius, via_height, flip, height_offset){
	col = height_offset == 0 ? FIRST_LAYER_COLOR : OTHER_LAYER_COLOR;

	translate([point[0], point[1], height_offset])
	{
		if(flip)
		{
			rotate([180,0,0])
			{
				color(col) cylinder(via_height, r1 = start_radius, r2 = end_radius);
			}
		}
		else 
		{
			color(col) cylinder(via_height, r1 = start_radius, r2 = end_radius);
		}
	}
}

module standoff(point, start_radius, end_radius, standoff_height, flip, height_offset){
	col = height_offset == 0 ? FIRST_LAYER_COLOR : OTHER_LAYER_COLOR;

	translate([point[0], point[1], height_offset])
	{
		if(flip)
		{
			rotate([180,0,0])
			{
				color(col) cylinder(standoff_height, r1 = start_radius, r2 = end_radius);
			}
		}
		else
		{
			color(col) cylinder(standoff_height, r1 = start_radius, r2 = end_radius);
		}
	}
}

module valve(point, start_radius, end_radius, valve_height, flip, height_offset){
	col = height_offset == 0 ? FIRST_LAYER_COLOR : OTHER_LAYER_COLOR;

	translate([point[0], point[1], height_offset])
	{
		if (flip)
		{
			rotate([0, 180, 0]){
				color(col) cylinder(valve_height, r1 = start_radius, r2 = end_radius);
			}
		}
		else
		{
			color(col) cylinder(valve_height, r1 = start_radius, r2 = end_radius);
		}
	}
}


module label(point, label_text, height, flip, height_offset){
	col = height_offset == 0 ? FIRST_LAYER_COLOR : OTHER_LAYER_COLOR;

	translate([point[0], point[1], height_offset])
	{
		if (flip)
		{
			translate([0,0,-height])
			{
				scale([1,1,height]){
					color(col) text(label_text, size=LABEL_SCALE, font=LABEL_FONT);
				}
			}
		}
		else
		{	
			scale([1,1,height])
			{
				color(col) text(label_text, size=LABEL_SCALE, font=LABEL_FONT);
			}
		}	
	}	
}

module allComponents(){

	for(i = channels){
			channel(i[0], i[1], i[2], i[3], i[4], i[5]);
	}

	for(i = ports){
			port(i[0], i[1], i[2], i[3], i[4]);
	}

	for(i = vias){
			via(i[0], i[1], i[2], i[3], i[4], i[5]);
	}

	for(i = valves){
			valve(i[0], i[1], i[2], i[3], i[4], i[5]);
	}

	for(i = standoffs){
			standoff(i[0], i[1], i[2], i[3], i[4], i[5]);
	}
	
	all_labels();

}

module all_labels()
{
	for (i = labels)
	{
		label(i[0], i[1], i[2], i[3], i[4]);
	}
}

module slide_z_offset()
{
	translate([0,0,-SLIDE_Z_OFFSET])
	{
		difference()
		{
			cube([width,height,SLIDE_Z_OFFSET]);
			translate([BORDER_WIDTH, BORDER_WIDTH,-SLIDE_Z_OFFSET])
			{
				cube([width-BORDER_WIDTH*2, height-BORDER_WIDTH*2,SLIDE_Z_OFFSET*3]);
			}
		}
	}
}


module slide_boundary()
{
	difference(){
		cube([width,height,BORDER_HEIGHT]);
		translate([BORDER_WIDTH, BORDER_WIDTH,-BORDER_HEIGHT])
		{
			cube([width-BORDER_WIDTH*2, height-BORDER_WIDTH*2,BORDER_HEIGHT*3]);
		}
	}
}

module slide_holder_skirt()
{
	translate([-HOLDER_BORDER_WIDTH-INTERLOCK_TOLERANCE-HOLDER_SKIRT_WIDTH, -HOLDER_BORDER_WIDTH - INTERLOCK_TOLERANCE - HOLDER_SKIRT_WIDTH, -SLIDE_Z_OFFSET])
	{
		difference()
		{
			cube([width+INTERLOCK_TOLERANCE*2 + HOLDER_BORDER_WIDTH*2 + HOLDER_SKIRT_WIDTH*2, height+INTERLOCK_TOLERANCE*2 + HOLDER_BORDER_WIDTH*2 + HOLDER_SKIRT_WIDTH*2, HOLDER_SKIRT_HEIGHT]);
			translate([HOLDER_BORDER_WIDTH + HOLDER_SKIRT_WIDTH, HOLDER_BORDER_WIDTH + HOLDER_SKIRT_WIDTH, -.5])
			{
				cube([width+INTERLOCK_TOLERANCE*2, height+INTERLOCK_TOLERANCE*2, BORDER_HEIGHT+1]);
			}
		}
	}
}

module single_slide_holder()
{
	translate([-HOLDER_BORDER_WIDTH-INTERLOCK_TOLERANCE,-HOLDER_BORDER_WIDTH -INTERLOCK_TOLERANCE,-SLIDE_Z_OFFSET])
	{
		difference()
		{
			cube([width+INTERLOCK_TOLERANCE*2 + HOLDER_BORDER_WIDTH*2, height+INTERLOCK_TOLERANCE*2 + HOLDER_BORDER_WIDTH*2, BORDER_HEIGHT]);
			translate([HOLDER_BORDER_WIDTH, HOLDER_BORDER_WIDTH, -.5])
			{
				cube([width+INTERLOCK_TOLERANCE*2, height+INTERLOCK_TOLERANCE*2, BORDER_HEIGHT+1]);
			}
		}
	}
}

module PDMS_mockup(){

	
	difference(){
		translate([0,0,.01]){
			cube([width,height,2.48]);
		}
			allComponents();
	}
	
}

module slide_mockup(){
	translate([0,0,-SLIDE_Z_OFFSET]){
		cube([width, height, SLIDE_Z_OFFSET]);
	}
}

translate([100,0,0])
{
	//PDMS_mockup();
}
if (flip)
{
	translate([width,0,layer_offset])
	{
		rotate([0,180,0])
		{
		allComponents();
		}
	}
}
	
else{
	translate([0,0,-layer_offset]){
		allComponents();	
	}
}
	//slide_z_offset();
	single_slide_holder();
	slide_holder_skirt();
	color([1,1,1,.5]) %slide_mockup();

