include <../libraries/Write.scad>;

LABEL_SCALE = 3;
LABEL_FONT = "Liberation Sans:style=Bold";

module label(position, label_text, height, flip, z_offset){
	translate([position[0], position[1], z_offset])
	{
		if (flip)
		{
			translate([0,0,-height])
			{
				scale([1,1,height]){
					%text(label_text, size=LABEL_SCALE, font=LABEL_FONT);
				}
			}
		}
		else
		{	
			scale([1,1,height])
			{
				%text(label_text, size=LABEL_SCALE, font=LABEL_FONT);
			}
		}	
	}	
}

label(position=[0,0],label_text="foobarbaz",height=.05,flip=false,z_offset=1);