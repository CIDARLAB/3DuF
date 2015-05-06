module valve(position, radius1, radius2, height, flip, z_offset){
	translate([position[0], position[1], z_offset])
	{
		if (flip)
		{
			rotate([0, 180, 0]){
				cylinder(height, r1 = radius1, r2 = radius2);
			}
		}
		else
		{
			cylinder(height, r1 = radius1, r2 = radius2);
		}
	}
}

valve(position = [1,2], radius1 = 1,radius2 = .75, height = .5, flip = true, z_offset = 1);