module channel(start, end, width, height, flip, z_offset){
	
	dX = end[0] - start[0];
	dY = end[1] - start[1];
	angle_deg = atan2(dY, dX);
	dXPow = pow(dX,2);
	dYPow = pow(dY,2);
	length = sqrt(dXPow + dYPow);
	translate([start[0]+(width/2)*sin(angle_deg),start[1]-cos(angle_deg)*(width/2), z_offset]){
		if (flip)
		{	
			translate([0,0,-height])
			{
				rotate([0,0,angle_deg])
					{
					cube([length+width/2,width,height]);
				}
			
			}
		}
		else
		{
			rotate([0,0,angle_deg])
			{
				cube([length+width/2,width,height]);
			}
		}
	}
}

channel(start=[0,0],end=[0,20],width=2,height=.5,flip= false,z_offset=0);