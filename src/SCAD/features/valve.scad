module valve(point, start_radius, end_radius, valve_height, flip, height_offset){
	translate([point[0], point[1], height_offset])
	{
		if (flip)
		{
			rotate([0, 180, 0]){
				cylinder(valve_height, r1 = start_radius, r2 = end_radius);
			}
		}
		else
		{
			cylinder(valve_height, r1 = start_radius, r2 = end_radius);
		}
	}
}

//valve([1,2],1,.75,.5,true,1);