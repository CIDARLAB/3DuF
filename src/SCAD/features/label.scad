include <../libraries/Write.scad>;

LABEL_SCALE_X = 1.2;
LABEL_SCALE_Y = 1.2;
LABEL_BOLD = .3;

module label(point, text, height, flip, height_offset){
	translate([point[0], point[1], height_offset])
	{
		if (flip)
		{
			translate([0,0,-height])
			{
				scale([LABEL_SCALE_X,LABEL_SCALE_Y,height]){
					write(text, bold=LABEL_BOLD);
				}
			}
		}
		else
		{	
			scale([LABEL_SCALE_X,LABEL_SCALE_Y,height])
			{
				write(text, bold=LABEL_BOLD);
			}
		}	
	}	
}

label([0,0],"foasdfo",1,false,1);