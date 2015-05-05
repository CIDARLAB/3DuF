module channel(start, end, channel_width, channel_height, flip, height_offset){
	
	dX = end[0] - start[0];
	dY = end[1] - start[1];
	angle_deg = atan2(dY, dX);
	dXPow = pow(dX,2);
	dYPow = pow(dY,2);
	length = sqrt(dXPow + dYPow);
	translate([start[0]+(channel_width/2)*sin(angle_deg),start[1]-cos(angle_deg)*(channel_width/2), height_offset]){
		if (flip)
		{	
			translate([0,0,-channel_height])
			{
				rotate([0,0,angle_deg])
					{
					cube([length+channel_width/2,channel_width,channel_height]);
				}
			
			}
		}
		else
		{
			rotate([0,0,angle_deg])
			{
				cube([length+channel_width/2,channel_width,channel_height]);
			}
		}
	}
}

channel([0,0],[0,20],2,.5, false,0);