module port(point, port_radius, port_height, flip, height_offset){
	translate([point[0],point[1],height_offset]){
		if (flip)
		{
			rotate([180,0,0])
			{
				cylinder(port_height, r = port_radius);
			}
		}
		else
		{
			cylinder(port_height, r = port_radius);
		}
	}
}

//port([1,2],1.2,false,0);