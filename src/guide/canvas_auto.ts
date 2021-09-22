import { Point } from "@/app/core/init";
import Component from "@/app/core/component";
import { InfoObject } from "./types";

var mode_num = 0;
export var last_outport: Array<number>;
export var last_point: Array<number>;
var path_ctrl_info = [], index_ctrl_port = [];
export var info: InfoObject;
// * here the elements of flow_info should be components as
export var flow_info: Array<Component>;
export var ctrl_info: Array<Component>;

var elements_num = [];
var valve_c=[], valve=[], pump=[], pump_c=[], port=[], port_c=[], via=[], chamber = [];

// path_info works for saving all channels that will be routed using the current mode and inlets/outlets
function searchPath(path_info: Array<Component>, channel_flow: Array<Component>, block_valve: Array<number>, via_valve: Array<number>, mid_valve: Array<number>, chamber_valve: Array<number>, pump_block: Array<number>, num_port: number,level: number,mode_num:number){
    // flag is a remark of finding the path.
    var flag = 0;
    var t = num_port;
    var path_ctrl_info = [];
	var flag_mode5 = 0;

    // find the other paths
    while (t < path_info.length){
        if (flag < t) {
            flag = t;
        }else {
            console.log(t);
            console.log(path_info);
            if (t != 0)
                if (t < path_info.length-1) t += 1;
                else break; // when t = 0 means it is going to draw the first control line beside the valves.
        }
        for(var j=0; j < channel_flow.length; j++) {

            // if channel_flow[j] is empty, that means it is chosen into path_flow
            if (channel_flow[j].length == 0) continue;
            // start is on the head and left of end point
            // last path may be a channel
            else if (path_info[t].mint == "RoundedChannel") {
                // next may be a line
                if (channel_flow[j].mint == "RoundedChannel") {

                    if (channel_flow[j].direct == path_info[t].direct) {
                        // same direction
                        if (path_info[t].direct == 1) {
                            // two lines are both vertical
                            if ((path_info[t].start[1] <= channel_flow[j].start[1] && channel_flow[j].start[1] <= path_info[t].end[1]
                                    && path_info[t].end[1] <= channel_flow[j].end[1] && path_info[t].start[0] == channel_flow[j].start[0] ) ||
                                (channel_flow[j].start[1] <= path_info[t].start[1] && path_info[t].start[1] <= channel_flow[j].end[1]
                                    && channel_flow[j].end[1] <= path_info[t].end[1]) && path_info[t].start[0] == channel_flow[j].start[0]) {

                                //after finding the next line, we need to add that to path_info[] and delete info in channel_flow[] .
                                path_info[path_info.length] = channel_flow[j];
                                channel_flow[j] = [];

                            } else continue;
                        }
                        // two lines are both horizontal
                        else {
                            if ((path_info[t].start[0] <= channel_flow[j].start[0] && channel_flow[j].start[0] <= path_info[t].end[0]
                                    && path_info[t].end[0] <= channel_flow[j].end[0] && path_info[t].start[1] == channel_flow[j].start[1] ) ||
                                (channel_flow[j].start[0] <= path_info[t].start[0] && path_info[t].start[0] <= channel_flow[j].end[0]
                                    && channel_flow[j].end[0] <= path_info[t].end[0] && path_info[t].start[1] == channel_flow[j].start[1])) {
                                path_info[path_info.length] = channel_flow[j];
                                channel_flow[j] = [];

                            } else continue;
                        }
                    }
                    //different direction
                    else {
                        if (path_info[t].direct == 1) {

                            if (channel_flow[j].start[0] <= path_info[t].end[0] && channel_flow[j].end[0] >= path_info[t].end[0] &&
                                channel_flow[j].start[1] <= path_info[t].end[1] && channel_flow[j].start[1] >= path_info[t].start[1]) {
                                path_info[path_info.length] = channel_flow[j];
                                channel_flow[j] = [];

                            }
                        }
                        else {
                            if (channel_flow[j].start[0] >= path_info[t].start[0] && channel_flow[j].start[0] <= path_info[t].end[0] &&
                                channel_flow[j].start[1] <= path_info[t].end[1] && channel_flow[j].end[1] >= path_info[t].end[1]) {
                                path_info[path_info.length] = channel_flow[j];
                                channel_flow[j] = [];

                            }
                        }
                    }
                }
                // if (t == 4 && level == 2) console.log(channel_flow[j],path_info[t]);
                // next may be a valve
                if (channel_flow[j].type == "Valve3D" || channel_flow[j].type == "Valve3D_control" || channel_flow[j].type == "Port" || channel_flow[j].type == "Port_control") {

                    // judge channel_flow[j] is in the block array
                    if (block_valve.indexOf(channel_flow[j].id) != -1 || chamber_valve.indexOf(channel_flow[j].id) != -1 ||
                        via_valve.indexOf(channel_flow[j].id) != -1 || mid_valve.indexOf(channel_flow[j].id) != -1) continue;
                    // vertical line (vs.) valve, we need to change the valve into a vertical line segment.
                    if (path_info[t].direct == 1) {
                        var start = channel_flow[j].position[1] - 1000;
                        var end = channel_flow[j].position[1] + 1000;

                        if ((( path_info[t].start[1] <= start && start <= path_info[t].end[1] && path_info[t].end[1] <= end)||
                            (start <= path_info[t].start[1] && path_info[t].start[1] <= end && end <= path_info[t].end[1])||
                            (start <= path_info[t].start[1] && path_info[t].end[1] <= end) ||
                            (start >= path_info[t].start[1] && path_info[t].end[1] >= end))
                                && path_info[t].start[0] == channel_flow[j].position[0]) {
                            path_ctrl_info[path_ctrl_info.length] = channel_flow[j];
                            path_info[path_info.length] = channel_flow[j];
                            channel_flow[j] = [];
                        }
                    }
                    else {
                        // horizontal line (vs.) valve, we need to change the valve into a horizontal line segment.

                        var start = channel_flow[j].position[0] - 1000;
                        var end = channel_flow[j].position[0] + 1000;

                        if ((( path_info[t].start[0] <= start && start <= path_info[t].end[0] && path_info[t].end[0] <= end)||
                            (start <= path_info[t].start[0] && path_info[t].start[0] <= end && end <= path_info[t].end[0])||
                            (start <= path_info[t].start[0] && path_info[t].end[0] <= end) ||
                            (start >= path_info[t].start[0] && path_info[t].end[0] >= end))
                                && path_info[t].start[1] == channel_flow[j].position[1]) {
                            path_ctrl_info[path_ctrl_info.length] = channel_flow[j];
                            path_info[path_info.length] = channel_flow[j];
                            channel_flow[j] = [];
                        }
                    }
                }

                // next may be a pump
                if (channel_flow[j].type == "Pump3D" || channel_flow[j].type == "Pump3D_control") {
                    // if pump id exist in pump_block, then skip this j
                    if (pump_block.indexOf(channel_flow[j].id) != -1 ){
                        continue;
                    }
					if (level == 1){
						// if a vertical line compare with pump, we need to change the pump into a vertical line segment.
						if (path_info[t].direct == 1 && channel_flow[j].direct == 1) {
						    // +/- 500 here aims to add the radius of the edge valve of the pump
						    var start = channel_flow[j].position[1] - channel_flow[j].len - 500;
						    var end = channel_flow[j].position[1] + channel_flow[j].len + 500;
						
						    if (( path_info[t].start[1] <= start && start <= path_info[t].end[1] && path_info[t].end[1] <= end
						            && path_info[t].start[0] == channel_flow[j].position[0]) ||
						        (start <= path_info[t].start[1] && path_info[t].start[1] <= end && end <= path_info[t].end[1]
						            && path_info[t].start[0] == channel_flow[j].position[0])) {
						        path_ctrl_info[path_ctrl_info.length] = channel_flow[j];
						        path_info[path_info.length] = channel_flow[j];
						        channel_flow[j] = [];
						    }
						}
						else if (path_info[t].direct == 0 && channel_flow[j].direct == 0) {
						    // if a horizontal line compare with pump, we need to change the pump into a horizontal line segment.
						    var start = channel_flow[j].position[0] - channel_flow[j].len - 500;
						    var end = channel_flow[j].position[0] + channel_flow[j].len + 500;
						    if (( path_info[t].start[0] <= start && start <= path_info[t].end[0] && path_info[t].end[0] <= end
						            && path_info[t].start[1] == channel_flow[j].position[1]) ||
						        (start <= path_info[t].start[0] && path_info[t].start[0] <= end && end <= path_info[t].end[0]
						            && path_info[t].start[1] == channel_flow[j].position[1])) {
						        path_ctrl_info[path_ctrl_info.length] = channel_flow[j];
						        path_info[path_info.length] = channel_flow[j];
						        channel_flow[j] = [];
						    }
						}
					}
                    else{
						if (path_info[t].direct == 0 && channel_flow[j].direct == 1) {
						    // +/- 500 here aims to add the radius of the edge valve of the pump
						    var start = channel_flow[j].position[1] - channel_flow[j].len - 500;
						    var end = channel_flow[j].position[1] + channel_flow[j].len + 500;
						
							if ( path_info[t].start[0] <= channel_flow[j].position[0] && channel_flow[j].position[0] <= path_info[t].end[0] 
								&& start<=path_info[t].start[1] && end>=path_info[t].end[1]) {
						        path_ctrl_info[path_ctrl_info.length] = channel_flow[j];
						        path_info[path_info.length] = channel_flow[j];
						        channel_flow[j] = [];
						    }
						}
						else if (path_info[t].direct == 1 && channel_flow[j].direct == 0) {
						    // if a horizontal line compare with pump, we need to change the pump into a horizontal line segment.
						    var start = channel_flow[j].position[0] - channel_flow[j].len - 500;
						    var end = channel_flow[j].position[0] + channel_flow[j].len + 500;
							
							if ( path_info[t].start[1] <= channel_flow[j].position[1] && channel_flow[j].position[1] <= path_info[t].end[1]
								&& start<=path_info[t].start[0] && end>=path_info[t].end[0]) {
							    path_ctrl_info[path_ctrl_info.length] = channel_flow[j];
							    path_info[path_info.length] = channel_flow[j];
							    channel_flow[j] = [];
							}
						}
					}
                }

                // next may be a diamond
                if (channel_flow[j].type == "DiamondReactionChamber" ) {
                    if (path_info[t].direct == 1) {
                        var start = channel_flow[j].position[1] - channel_flow[j].len/2;
                        var end = channel_flow[j].position[1] + channel_flow[j].len/2;

                        if (( path_info[t].start[1] <= start && start <= path_info[t].end[1] && path_info[t].end[1] <= end
                                && path_info[t].start[0] == channel_flow[j].position[0]) ||
                            (start <= path_info[t].start[1] && path_info[t].start[1] <= end && end <= path_info[t].end[1]
                                && path_info[t].start[0] == channel_flow[j].position[0])) {
                            path_info[path_info.length] = channel_flow[j];
                            channel_flow[j] = [];
                        }
                    }else continue;
                }
				
				
            }

            // last path may be a valve
            else if (path_info[t].type == "Valve3D"||path_info[t].type == "Valve3D_control" || path_info[t].type == "Port" || path_info[t].type == "Port_control"){

				// next may be a line
				if (channel_flow[j].type == "RoundedChannel") {
					// vertical line (vs.) valve, we need to change the valve into a vertical line segment.
					if (channel_flow[j].direct == 1) {
						var start = path_info[t].position[1] - 1000;
						var end = path_info[t].position[1] + 1000;

						if ((( channel_flow[j].start[1] <= start && start <= channel_flow[j].end[1] && channel_flow[j].end[1] <= end) ||
							(start <= channel_flow[j].start[1] && channel_flow[j].start[1] <= end && end <= channel_flow[j].end[1]) ||
							(start <= channel_flow[j].start[1] && channel_flow[j].end[1] <= end ) ||
							(start >= channel_flow[j].start[1] && channel_flow[j].end[1] >= end ))
								&& channel_flow[j].start[0] == path_info[t].position[0]){
							path_info[path_info.length] = channel_flow[j];
							channel_flow[j] = [];

						}
					}
					else {
						// horizontal line (vs.) valve, we need to change the valve into a horizontal line segment.
						var start = path_info[t].position[0] - 1000;
						var end = path_info[t].position[0] + 1000;
						if ((( channel_flow[j].start[0] <= start && start <= channel_flow[j].end[0] && channel_flow[j].end[0] <= end) ||
							(start <= channel_flow[j].start[0] && channel_flow[j].start[0] <= end && end <= channel_flow[j].end[0]) ||
							(start <= channel_flow[j].start[0] && channel_flow[j].end[0] <= end ) ||
							(start >= channel_flow[j].start[0] && channel_flow[j].end[0] >= end ))
								&& channel_flow[j].start[1] == path_info[t].position[1]) {
							path_info[path_info.length] = channel_flow[j];
							channel_flow[j] = [];

						}
					}
				}
			}
            // last path may be a pump
            else if (path_info[t].type == "Pump3D" || path_info[t].type == "Pump3D_control" ){
				if ( flag_mode5 == 0 && level == 1 && mode_num == 5){
					path_ctrl_info[path_ctrl_info.length] = path_info[t];
					flag_mode5 = 1;
				}
				if (channel_flow[j].type == "RoundedChannel") {
					if (level == 1){
						// vertical line (vs.) valve, we need to change the valve into a vertical line segment.
						if (channel_flow[j].direct == 1 && path_info[t].direct == 1) {
							var start = path_info[t].position[1] - path_info[t].len - 500;
							var end = path_info[t].position[1] + path_info[t].len + 500;
						
							if (( channel_flow[j].start[1] <= start && start <= channel_flow[j].end[1] && channel_flow[j].end[1] <= end
									&& channel_flow[j].start[0] == path_info[t].position[0]) ||
								(start <= channel_flow[j].start[1] && channel_flow[j].start[1] <= end && end <= channel_flow[j].end[1]
									&& channel_flow[j].start[0] == path_info[t].position[0])) {
								path_info[path_info.length] = channel_flow[j];
								channel_flow[j] = [];
							}
						}
						else if (channel_flow[j].direct == 0 && path_info[t].direct == 0){
							// horizontal line (vs.) valve, we need to change the valve into a horizontal line segment.
							var start = path_info[t].position[0] - path_info[t].len - 500;
							var end = path_info[t].position[0] + path_info[t].len + 500;
						
							if (( channel_flow[j].start[0] <= start && start <= channel_flow[j].end[0] && channel_flow[j].end[0] <= end
									&& channel_flow[j].start[1] == path_info[t].position[1]) ||
								(start <= channel_flow[j].start[0] && channel_flow[j].start[0] <= end && end <= channel_flow[j].end[0]
									&& channel_flow[j].start[1] == path_info[t].position[1])) {
								path_info[path_info.length] = channel_flow[j];
								channel_flow[j] = [];
						
							}
						}
					}
					else{
						if (channel_flow[j].direct == 0 && path_info[t].direct == 1) {
							var start = path_info[t].position[1] - path_info[t].len - 500;
							var end = path_info[t].position[1] + path_info[t].len + 500;
						
							if ( channel_flow[j].start[1] >= start && channel_flow[j].start[1] <= end && channel_flow[j].start[0] <= path_info[t].position[0] &&
							 channel_flow[j].end[0] >= path_info[t].position[0]) {
								path_info[path_info.length] = channel_flow[j];
								channel_flow[j] = [];
							}
						}
						else if (channel_flow[j].direct == 1 && path_info[t].direct == 0){
							// horizontal line (vs.) valve, we need to change the valve into a horizontal line segment.
							var start = path_info[t].position[0] - path_info[t].len - 500;
							var end = path_info[t].position[0] + path_info[t].len + 500;

							if ( channel_flow[j].start[0] >= start && channel_flow[j].start[0] <= end && channel_flow[j].start[1] <= path_info[t].position[1] &&
							 channel_flow[j].end[1] >= path_info[t].position[1]) {
								path_info[path_info.length] = channel_flow[j];
								channel_flow[j] = [];
							}
						}
					}     
				}
			}
            // last path may be a diamond chamber

            else{
                if (channel_flow[j].type == "RoundedChannel") {
                    // vertical line (vs.) valve, we need to change the valve into a vertical line segment.
                    if (channel_flow[j].direct == 1) {
                        var start = path_info[t].position[1] - path_info[t].len/2;
                        var end = path_info[t].position[1] + path_info[t].len/2;
                        if (( channel_flow[j].start[1] <= start && start <= channel_flow[j].end[1] && channel_flow[j].end[1] <= end
                                && channel_flow[j].start[0] == path_info[t].position[0]) ||
                            (start <= channel_flow[j].start[1] && channel_flow[j].start[1] <= end && end <= channel_flow[j].end[1]
                                && channel_flow[j].start[0] == path_info[t].position[0])) {
                            path_info[path_info.length] = channel_flow[j];
                            channel_flow[j] = [];
                        }
                    }
                }
            }
        }
        t++;
    }
    if (level!=2) console.log(path_ctrl_info)
    if (level != 2) return path_ctrl_info;
    else return path_info;
}

