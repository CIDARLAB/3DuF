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