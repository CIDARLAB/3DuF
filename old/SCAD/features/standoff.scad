module standoff(position, radius1, radius2, height, flip, z_offset){
	translate([position[0], position[1], z_offset])
	{
		if(flip)
		{
			rotate([180,0,0])
			{
				cylinder(height, r1 = radius1, r2 = radius2);
			}
		}
		else
		{
            cylinder(height, r1 = radius1, r2 = radius2);
		}
	}
}

standoff(position = [1,2],radius1 = 1,radius2 = .5,height = .5, flip=false,z_offset=40);