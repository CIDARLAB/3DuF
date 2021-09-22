function draw_pump(ctx, info, i, color)
{
    ctx.beginPath();
    ctx.strokeStyle=color;
	if (info[i].direct==0) {
		ctx.arc(info[i].position[0]/100-info[i].len/100, info[i].position[1]/100, 10, 0, 2*Math.PI);
		ctx.stroke();
		ctx.beginPath();
		ctx.strokeStyle=color;
		ctx.arc(info[i].position[0]/100, info[i].position[1]/100, 10, 0, 2*Math.PI);
		ctx.stroke();
		ctx.beginPath();
		ctx.strokeStyle=color;
		ctx.arc(info[i].position[0]/100+info[i].len/100, info[i].position[1]/100, 10, 0, 2*Math.PI);
		ctx.stroke();
	}
    else {
		ctx.arc(info[i].position[0]/100, info[i].position[1]/100-info[i].len/100, 10, 0, 2*Math.PI);
		ctx.stroke();
		ctx.beginPath();
		ctx.strokeStyle=color;
		ctx.arc(info[i].position[0]/100, info[i].position[1]/100, 10, 0, 2*Math.PI);
		ctx.stroke();
		ctx.beginPath();
		ctx.strokeStyle=color;
		ctx.arc(info[i].position[0]/100, info[i].position[1]/100+info[i].len/100, 10, 0, 2*Math.PI);
		ctx.stroke();
	}
}
// if flag == 1, means we want to add its name into it.
function text_fill(ctx, info, i, color, flag = 0, text='')
{
    ctx.strokeStyle=color;
    ctx.font="bold 14px Arial";
    ctx.textAlign="center";
    ctx.textBaseline="middle";
    ctx.fillStyle="black";
    if (flag == 0) ctx.fillText( info[i].id,info[i].position[0]/100, info[i].position[1]/100);
	else if (flag == 1) ctx.fillText( text, info[i].position[0]/100, info[i].position[1]/100);
	else ctx.fillText( info.id, info.position[0]/100, info.position[1]/100);
}
// flag=1, flow layer, flag =2, control layer, num=1 means the info only have one element
function draw_bk(ctx, info, flag, color1, color2,num=0)
{
	console.log("in draw bk",info,flag,color2);
    if (flag ==1)
    {
		var l = num;
		if (num == 0) l = info.length;
        for(var i=0;i<info.length;i++){
            ctx.lineWidth=3;
			
            if (info[i].type == "RoundedChannel" || info[i].type == "Connection") {
                ctx.beginPath();
                ctx.strokeStyle=color1;
                ctx.moveTo(info[i].start[0]/100, info[i].start[1]/100);
                ctx.lineTo(info[i].end[0]/100, info[i].end[1]/100);
                ctx.stroke();
            } else if (info[i].type == "DiamondReactionChamber"){
                ctx.beginPath();
                ctx.fillStyle=color1;
                ctx.fillRect(info[i].position[0]/100-info[i].width/200, info[i].position[1]/100-info[i].len/200, info[i].width/100,info[i].len/100);
                ctx.stroke();
            } else if (info[i].type == "Valve3D"){
                ctx.beginPath();
                ctx.strokeStyle=color1;
                ctx.arc(info[i].position[0]/100, info[i].position[1]/100, 10, 0, 2*Math.PI);
                text_fill(ctx, info, i, color1);
                ctx.stroke();
            }else if (info[i].type == "Pump3D"){
                draw_pump(ctx, info, i, color1);
                text_fill(ctx, info, i, color1);
            }else if (info[i].type == "Mixer"){
				ctx.beginPath();
				ctx.fillStyle=color1;
				ctx.fillRect(info[i].position[0]/100-info[i].width/200, info[i].position[1]/100-info[i].len/200, info[i].width/100,info[i].len/100);
				text_fill(ctx, info, i, color1, 1, "Mixer");
				ctx.stroke();
			}
            else{
                ctx.beginPath();
                text_fill(ctx, info, i, color1);
                ctx.arc(info[i].position[0]/100, info[i].position[1]/100, 10, 0, 2*Math.PI);
                ctx.stroke();
            }
        }
    }else{
		var l = num;
		if (num == 0) {
			l = info.length;
			for(var i=0;i<l;i++){
			    ctx.lineWidth=3;
			    if (info[i].type == "RoundedChannel" || info[i].type == "Connection") {
			        ctx.beginPath();
			        ctx.strokeStyle=color2;
			        ctx.moveTo(info[i].start[0]/100, info[i].start[1]/100);
			        ctx.lineTo(info[i].end[0]/100, info[i].end[1]/100);
			        ctx.stroke();
			    } else if (info[i].type == "Pump3D_control"){
			        draw_pump(ctx, info, i, color2)
			    } else {
			        ctx.beginPath();
			        ctx.strokeStyle=color2;
			        ctx.arc(info[i].position[0]/100, info[i].position[1]/100, 10, 0, 2*Math.PI);
			        text_fill(ctx, info, i, color2);
			        ctx.stroke();
			    }
			}
		}
		else{
			ctx.lineWidth=3;
			if (info.type == "RoundedChannel" || info.type == "Connection") {
			    ctx.beginPath();
			    ctx.strokeStyle=color2;
			    ctx.moveTo(info.start[0]/100, info.start[1]/100);
			    ctx.lineTo(info.end[0]/100, info.end[1]/100);
			    ctx.stroke();
			} else if (info.type == "Pump3D_control"){
			    draw_pump(ctx, info, i, color2)
			} else {
				console.log(color2);
			    ctx.beginPath();
			    ctx.strokeStyle=color2;
			    ctx.arc(info.position[0]/100, info.position[1]/100, 10, 0, 2*Math.PI);
			    text_fill(ctx, info, i, color2, 2);
			    ctx.stroke();
			}
		}
    }
}

function new_grapgh()
{
    var c=document.getElementById("myCanvas");
    var ctx=c.getContext("2d");
	// refresh canvas
	c.height=c.height;
	// using the analysed arrays to draw graph
	if (ctrl_info.length == 0 && flow_info.length == 0)	splite_json();
	draw_bk(ctx,flow_info,1,"blue","red");
	draw_bk(ctx, ctrl_info,2,"blue","red");
  //   $.getJSON("data/My-Device-V0-flow.json", function (data) {
  //       flow_info=data;
		// console.log(flow_info);
  //       draw_bk(ctx,flow_info,1,"blue","red");
  //   });
// 
//     $.getJSON("data/My-Device-V0-control.json", function (data) {
//         ctrl_info=data;
//         draw_bk(ctx, ctrl_info,2,"blue","red");
//     });
}

function newCanvas(mode_num=0,level=3){
	var c=document.getElementById("myCanvas");
	var ctx=c.getContext("2d");
	canvas_prepare(mode_num);
    // search flow path
    path_ctrl_info = searchPath(path_info,channel_flow,block_valve,via_valve,mid_valve,chamber_valve,pump_block,num_port, 1,mode_num);
    if (level == 1 || level ==3) {
        // find first paths
        draw_bk(ctx, path_info, 1, "blue", "red");
    }

    // search control path
    if (level == 2 || level ==3){

        path_ctrl_info = searchPath(path_ctrl_info,ctrl_channel,[],[],[],[],[],0,2,mode_num);
        draw_bk(ctx, path_ctrl_info, 2, "blue", "red");
        index_ctrl_port = [] // used to save index of control ports
        for (var i=0; i<path_ctrl_info.length;i++){
            if (path_ctrl_info[i].type == "Port_control") index_ctrl_port[index_ctrl_port.length] = path_ctrl_info[i].id;
        }
    }
	
}
