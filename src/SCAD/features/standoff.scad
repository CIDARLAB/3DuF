module standoff(point, start_radius, end_radius, standoff_height, flip, height_offset){
	translate([point[0], point[1], height_offset])
	{
		if(flip)
		{
			rotate([180,0,0])
			{
				cylinder(standoff_height, r1 = start_radius, r2 = end_radius);
			}
		}
		else
		{
            cylinder(standoff_height, r1 = start_radius, r2 = end_radius);
		}
	}
}

//standoff([1,2],1,.5,.5,false,0);