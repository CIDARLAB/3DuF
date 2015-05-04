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
