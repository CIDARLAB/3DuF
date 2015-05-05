module via(point, start_radius, end_radius, via_height, flip, height_offset){
	translate([point[0], point[1], height_offset])
	{
		if(flip)
		{
			rotate([180,0,0])
			{
                cylinder(via_height, r1 = start_radius, r2 = end_radius);
			}
		}
		else 
		{
			cylinder(via_height, r1 = start_radius, r2 = end_radius);
		}
	}
}

//via([1,2],.5,.4,.5,false,0);