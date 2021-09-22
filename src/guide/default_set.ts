import {flow_info} from "@/guide/canvas_auto";
import {ctrl_info} from "@/guide/canvas_auto";
import { UserPaths } from "@/guide/pointchoose";
import { last_outport } from "@/guide/canvas_auto";
import { last_point } from "@/guide/canvas_auto";
import Component from "@/app/core/component";

// path_info works for saving all channels that will be routed using the current mode and inlets/outlets
export var path_info: Array<Array<Component>>
var channel_flow: Array<Component>;
var port_flow = [], ctrl_channel = [];
var num_port=0; 
var block_valve = [], outlet_port = [], via_valve = [], chamber_valve = [], mid_valve = [], pump_block = [];
function canvas_prepare(mode_num=0){
	var c=document.getElementById("myCanvas");
	var ctx=c.getContext("2d");
	if (mode_num==0) {
		draw_bk(ctx,flow_info,1,"blue","red");
		draw_bk(ctx, ctrl_info,2,"blue","red");
		return;
	}
	console.log(mode_num);
	port_flow = [];
	channel_flow = [];
	ctrl_channel = [];
	let component: Component;
	// pretreatment
	for(var j=0; j < flow_info.length; j++){
		// Check if type of component is port
		// if (component.mint === "PORT" )
	    if (flow_info[j].mint == "Port") port_flow[port_flow.length] = flow_info[j];
	    else {
			channel_flow[channel_flow.length] = flow_info[j];
		}
	}
	
	for(var j=0; j < ctrl_info.length; j++){
	    ctrl_channel[ctrl_channel.length] = ctrl_info[j];
	}
	
	draw_bk(ctx, flow_info,1,"white","white");
	draw_bk(ctx, ctrl_info,2,"white","white");
	path_info = [];
	num_port = 0;
	// this array is used to block the valves we don't want it open, or the opposite
	block_valve = [59,22,27,26,28,40,41,42,43,19,60,61,62,63,64,65,66];
	outlet_port = [20,18,24,23,25,19,22,21];
	via_valve = [2,7,6,8,1,4,3,5];
	chamber_valve = [17,11,9,10];
	mid_valve = [0,0,0,0,0];
	pump_block = [1,2,4,3]; // if 0, means that pump should be open
	
	// fpc=0 means there is a exist path not for clean
	console.log(flag_points_clean,flag_after_clean);

	let point_path = UserPaths.point_path;
	let last_outport = UserPaths.last_outport;
	let last_point = UserPaths.last_point;
	if (flag_points_clean == 0){
		// fac=0 means the last path is not for clean
		if (point_path.length==0 || (point_path.length==2 && point_path.indexOf(2)>=0 && point_path.indexOf(10)>=0) ) point_path = last_point.slice(0);
		if (mode_num == 5) {
		    point_path = last_outport.slice(0);
		}
	} else if (mode_num==5){
		var p =[];
		console.log(point_path.slice(0));
		for (let point of point_path){
			if (point>17) p[p.length] = point;
		}
		point_path = p.slice(0);
	}
	console.log(point_path.slice(0));
	if (mode_num == 2 || mode_num == 4 || mode_num == 7) {
		flag_after_clean = 1;
		point_path = [2, 10];
	}
	
	// pre-action
	
	if (flag_after_clean==0) last_point = point_path.slice(0);
	for (var i = 0; i < point_path.length; i++) {
	
	    // p is the index of chosen point in outlet_port
	    let p = outlet_port.indexOf(point_path[i]);
	    if (p != -1) {
	        via_valve[p] = 0;
	        // p/2 is the index of MCM it will get into.
	        if (mode_num != 5) chamber_valve[Math.floor(p / 2)] = 0;
	    }
	    else block_valve[point_path[i] - 1] = 0;
	}
	if (mode_num != 4 && mode_num != 2 && mode_num != 7){
		flag_after_clean = 0;
		flag_points_clean = 0;
	}
	// save the current outport, prepare for the cleaning process when the current operation is not cleaning
	
	if (mode_num != 4 && mode_num != 2 && mode_num != 7 && mode_num != 5){
	    
		last_outport = [];
	    for (var i = 0; i < point_path.length; i++) {
	        if (outlet_port.indexOf(point_path[i]) != -1) {
	            last_outport[last_outport.length] = point_path[i];
	        }
	    }
	}else if (mode_num == 5){
		last_outport = point_path.slice(0);
	}
	
	// find input and output and delete output port when mode_num is 3
	for (var j = 0; j < port_flow.length; j++) {
	    for (var i = 0; i < point_path.length; i++) {
	        if (mode_num == 3 || mode_num == 6) {
				let p = outlet_port.indexOf(point_path[i]);
	            if (p != -1) {
	                point_path.splice(i, 1);
	                continue;
	            }
	        }
			// id here means number but not the string given by Component.id
	        if (port_flow[j].id == point_path[i]) {
	            path_info[path_info.length] = port_flow[j];
	            num_port++;
	        }
	    }
	    if (num_port == point_path.length) break;
	}
	
	// do as different mode
	if (mode_num == 1) {
	    mid_valve = [12, 13, 14, 15, 16];
	    for (var i = 0; i < point_path.length; i++) {
	        let p = outlet_port.indexOf(point_path[i]);
	        if (p != -1) pump_block[Math.floor(p / 2)] = 0;
	    }
	} else if (mode_num == 2) {
	    for (var i = 0; i < last_outport.length; i++) {
	        var index = outlet_port.indexOf(last_outport[i]);
	        if (index != -1) {
	            pump_block[Math.floor(index / 2)] = 0;
	            chamber_valve[Math.floor(index / 2)] = 0;
	        }
	    }
	} else if (mode_num == 3) {
	    mid_valve = [12, 13, 14, 15, 16];
	} else if (mode_num == 4) {
	    mid_valve = [0, 0, 0, 0, 0]
	} else if (mode_num == 5) {
	    mid_valve = [12, 13, 14, 15, 16];
	} else if (mode_num == 6) {
	    mid_valve = [12, 13, 14, 15, 16];
	} else if (mode_num == 7) {
	    block_valve = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	    chamber_valve = [0, 0, 0, 0];
	    pump_block = [0, 0, 0, 0];
	}
	
	num_port = 0;
	for (var j = 0; j < channel_flow.length; j++) {
		// find why here change type after mode 2
	    if (mode_num == 5 && (channel_flow[j].mint == "Pump3D" || channel_flow[j].mint == "Pump3D_control")) {
	
	        for (var i = 0; i < point_path.length; i++) {
	            var index = outlet_port.indexOf(point_path[i]);
	            console.log(index, pump_block[Math.floor(index / 2)], channel_flow[j].id);
				// find the relative pump
	            if (index != -1 && pump_block[Math.floor(index / 2)] == channel_flow[j].id) {
	                pump_block[Math.floor(index / 2)] = 0;
	                path_info[path_info.length] = channel_flow[j];
	                channel_flow[j] = null;
	            }
	        }
	    }
	    if (channel_flow[j].mint == "RoundedChannel") {
	        for (var i = 0; i < point_path.length; i++) {
	            {
	                if (channel_flow[j].length == 0) continue;
	                if ((channel_flow[j].start[0] == path_info[i].position[0] && channel_flow[j].start[1] == path_info[i].position[1])
	                    || (channel_flow[j].end[0] == path_info[i].getPosition()[0] && channel_flow[j].end[1] == path_info[i].position[1])) {
	                    path_info[path_info.length] = channel_flow[j];
	                    channel_flow[j] = [];
	                    num_port++;
	                }
	            }
	        }
	    }
	    if (num_port == point_path.length) break;
	}
}

function mode_sample(i:number){
	let point_path = UserPaths.point_path;
	switch(i){
		case 1: point_path=[17,14,23]; break;
		case 2: point_path=[2,10]; break;
		case 3: point_path=[12,14,23]; break;
		case 4: point_path=[2,10]; break;
		case 6: point_path=[15,13,23]; break;
		case 7: point_path=[]; break;
		case 0: point_path=[] ; break;
	}
	newCanvas(i);
}