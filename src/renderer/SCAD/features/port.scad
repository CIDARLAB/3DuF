module port(position, radius, height, flip, z_offset){
	translate([position[0],position[1],z_offset]){
		if (flip)
		{
			rotate([180,0,0])
			{
				cylinder(height, r = radius);
			}
		}
		else
		{
			cylinder(height, r = radius);
		}
	}
}

port(position=[1,2],radius=1, height=.2,flip=false,z_offset=0);