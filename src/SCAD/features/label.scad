include <../libraries/Write.scad>;

LABEL_SCALE = 3;
LABEL_FONT = "Liberation Sans:style=Bold";



module label(point, label_text, height, flip, height_offset){
	translate([point[0], point[1], height_offset])
	{
		if (flip)
		{
			translate([0,0,-height])
			{
				scale([1,1,height]){
					text(label_text, size=LABEL_SCALE, font=LABEL_FONT);
				}
			}
		}
		else
		{	
			scale([1,1,height])
			{
				text(label_text, size=LABEL_SCALE, font=LABEL_FONT);
			}
		}	
	}	
}

//label([0,0],"foobarbaz",.05,false,1);