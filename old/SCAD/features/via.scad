module via(position, radius1, radius2, height, flip, z_offset){
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

via(position = [1,2],radius1 = .5,radius2 = .4,height=.5,flip=false,z_offset=0);