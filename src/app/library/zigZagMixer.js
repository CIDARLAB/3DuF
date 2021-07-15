import Template from "./template";
import paper from "paper";


export default class ZigZagMixer extends Template
{
    constructor() 
    {
        super();
    }

    __setupDefinitions() 
    {
        this.__unique = {
            position: "Point"
        };

        // Modeled after Curved Mixer
        this.__heritable = {
            componentSpacing : "Float",
            rotation : "Float",
            bendSpacing : "Float",
            numberOfBends : "Float",
            numberOfZigZags : "Float",
            channelWidth : "Float",
            bendLength : "Float",
            height : "Float"
        };

        // Default values from Curved Mixer
        this.__defaults = {
            componentSpacing : 1000,
            rotation : 0,
            bendSpacing : 1.23 * 1000,
            numberOfBends : 1,
            numberOfZigZags : 1,
            channelWidth : 0.8 * 1000,
            bendLength : 2.46 * 1000,
            height : 250
        };

        // Units derived from Curved Mixer units
        this.__units = {
            componentSpacing : "&mu;m",
            rotation : "&deg;",
            bendSpacing : "&mu;m",
            numberOfBends : "",
            numberOfZigZags : "",
            channelWidth : "&mu;m",
            bendLength : "&mu;m",
            height : "&mu;m"
        };

        // Minimum derived from Curved Mixer minima
        this.__minimum = {
            componentSpacing : 0,
            rotation : 0,
            bendSpacing : 10,
            numberOfBends : 1,
            numberOfZigZags : 1,
            channelWidth : 10,
            bendLength : 10,
            height : 10
        };

        // Maximum derived from Curved Mixer maxima
        this.__maximum = {
            componentSpacing : 10000,
            rotation : 360,
            bendSpacing : 6000,
            numberOfBends : 20,
            numberOfZigZags : 20,
            channelWidth : 2000,
            bendLength : 12000,
            height : 1200
        };

        this.__placementTool = "componentPositionTool";

        this.__toolParams = {
            position : "position"
        };

        // Feature params derived from Curved Mixer component
        this.__featureParams = {
            componentSpacing : "componentSpacing",
            rotation : "rotation",
            bendSpacing : "bendSpacing",
            numberOfBends : "numberOfBends",
            numberOfZigZags : "numberOfZigZags",
            channelWidth : "channelWidth",
            bendLength : "bendLength",
            position : "position"    
        };

        // Target params derived from Curved Mixer component
        this.__targetParams = {
            componentSpacing : "componentSpacing",
            rotation : "rotation",
            bendSpacing : "bendSpacing",
            numberOfBends : "numberOfBends",
            numberOfZigZags : "numberOfZigZags",
            channelWidth : "channelWidth",
            bendLength : "bendLength"  
        };

        this.__renderKeys = ["FLOW"];
        
        this.__mint = "ZIGZAG MIXER";
        
    }

    render2D(params, key)
    {
        // Compound path - seems to be the convention in the 3DUF library, so 
        // just stick with this format for building compound objects.
        let serp = new paper.CompoundPath();

        // Component parameters
        let channelWidth = params["channelWidth"];
        let bendLength = params["bendLength"];
        let bendSpacing = params["bendSpacing"];
        let numZigZags = params["numberOfZigZags"];
        let numBends = params["numberOfBends"];
        let rotation = params["rotation"];
    
        // Starting position of component
        let x = params["position"][0];
        let y = params["position"][1];
    
        let color = params["color"];
    
        // Angle between zig-zag - for now just set to 30 degrees, looks reasonable
        let theta = 30;
    
        // Intermediate calculation of triangle formed from zig zag
        let delta_x = bendLength * Math.sin(0.5 * theta);
        let delta_y = bendLength * Math.cos(0.5 * theta);
    
        // Intermediate variable determining side where half-circle segment should be rendered
        let circle_side = 1;

        // For each bend
        for (let j = 0; j < numBends; j++) 
        {
            // Helper variable determining whether to draw line up or down
            let negative_dir = -1;

            // New local path - this is one zig zag segment
            let current_segment = new Path();
            current_segment.strokeColor = color;
            // Not sure how to convert the channel width to path width, but dividing by 10 seems to work from testing
            current_segment.strokeWidth = channelWidth / 10;
            
            // Start each segment at the same x coordinate but displace y coordinate
            let start_x = x;
            let start_y = y + (bendSpacing * j);
    
            // Add the starting point to the current segment
            current_segment.add(new Point(start_x, start_y))

            // curr_x and curr_y represent points added in the segment - begin
            // adding using the first linear connector port
            let curr_x = start_x + 25;
            let curr_y = start_y + 0;
            current_segment.add(curr_x, curr_y)
    
            // First half-offset
            curr_x += 0.5 * bendLength * Math.sin(0.5 * theta);
            curr_y += 0.5 * bendLength * Math.cos(0.5 * theta);
    
            // Build the zig-zag segment
            for (let i = 0; i < numZigZags * 2; i++) 
            {
                // Add the current point to the path
                current_segment.add(new Point(curr_x, curr_y));
    
                // And if not on the last point, increment the position for the
                // next point, taking care to switch the direction of the deltay
                // to account for the switching direction of the zig zag segment
                if (i != (numZigZags * 2 - 1)) 
                {
                    curr_x += delta_x;
                    curr_y += (delta_y * negative_dir);
                    negative_dir *= -1;
                }
                
            }
    
            // Second half-offset
            curr_x += 0.5 * bendLength * Math.sin(0.5 * theta);
            curr_y += 0.5 * bendLength * Math.cos(0.5 * theta);
            current_segment.add(curr_x, curr_y)
    
            // Second linear connector port
            curr_x += 25;
            curr_y += 0;
            current_segment.add(curr_x, curr_y);
    
            // Add completed segment to overall compound object
            serp.addChild(current_segment);

            // Draw the curved segment if applicable, i.e. not last segment

            // If on the right side of the component, base the circle on the
            // last points in the segment (i.e. last values in curr_x, curr_y)
            // Radius of circle is bendSpacing / 2 so spacing between bends is bendSpacing
            if (circle_side == 1 && j != numBends - 1)
            {
                let connecting_circle = new Path.Circle(new Point(curr_x, curr_y + bendSpacing / 2), bendSpacing / 2);
                connecting_circle.strokeColor = color;
                connecting_circle.strokeWidth = channelWidth / 10;

                // Remove the first segment to make it half circle and keep path open
                connecting_circle.removeSegment(0);
                connecting_circle.closed = false;

                // Flip the circle side flag
                circle_side *= -1;

                // Add completed segment to overall compound object
                serp.addChild(connecting_circle);
            }
            // Else if on the left side of the componet, base the circle on the
            // first points in the segment (i.e. start_x, start_y) where the
            // Radius of circle is still bendSpacing / 2 so spacing between bends is bendSpacing
            else if (circle_side == -1 && j != numBends - 1)
            {
                let connecting_circle = new Path.Circle(new Point(start_x, start_y + bendSpacing / 2), bendSpacing / 2);
                connecting_circle.strokeColor = color;
                connecting_circle.strokeWidth = channelWidth / 10;

                // Remove the first segment to make it half circle and keep path open
                // Make sure to rotate it 180 degrees so it is oriented properly
                connecting_circle.removeSegment(0);
                connecting_circle.rotate(180);
                connecting_circle.closed = false;

                // Flip the circle side flag
                circle_side *= -1;

                // Add completed segment to overall compound object
                serp.addChild(connecting_circle);
            } 
        }

        // When object is complete, return the compound path
        serp.fillColor = color;
        return serp.rotate(rotation, x, y);
    }

    render2DTarget(key, params)
    {
        let render = this.render2D(params, key);
        render.fillColor.alpha = 0.5;
        return render;
    }
}