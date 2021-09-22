var point_new = 0;
var valve_new = 0;
// record points we chose
export class UserPaths{
	static point_path: number[];
	static last_outport: number[];
	static last_point: number[];
}

function choosepoint(s = "Port"){
    var objTop = getOffsetTop(document.getElementById("myCanvas"));
    var objLeft = getOffsetLeft(document.getElementById("myCanvas"));

    var mouseX = event.clientX+document.documentElement.scrollLeft;
    var mouseY = event.clientY+document.documentElement.scrollTop;

    var objX = mouseX-objLeft;
    var objY = mouseY-objTop;

    clickObjPosition = objX + "," + objY;
    // alert_word = "Position: " + clickObjPosition;
    // alert(alert_word);
	
	var min = 100000000;
	var min_id = 0;
	var min_position;
	var distance = 0;
	var min_type;
	if (is_customize == 0) {
		for(var i=0; i<flow_info.length; i++){
		    if (flow_info[i].type ==s) {
				console.log(s, flow_info[i]);
				if (objX < 0 || objY < 0 || objX > 1280 || objY > 850) continue;
		        distance = Math.abs(objX - flow_info[i].position[0]/100) + Math.abs(objY - flow_info[i].position[1]/100);
		        if (distance < min){
		            min = distance;
		            min_id = flow_info[i].id;
		            min_position = flow_info[i].position;
		            min_type = flow_info[i].type;
		        }
		    }
		}
	}
	else{
		s = "Port_control";
		var cport = [];
		for(var i=0; i<ctrl_info.length; i++){
		    if (ctrl_info[i].type ==s) {
				if (objX < 0 || objY < 0 || objX > 1280 || objY > 850) continue;
		        distance = Math.abs(objX - ctrl_info[i].position[0]/100) + Math.abs(objY - ctrl_info[i].position[1]/100);
		        if (distance < min){
		            min = distance;
		            min_id = ctrl_info[i].id;
		            min_position = ctrl_info[i].position;
		            min_type = ctrl_info[i].type;
					cport = ctrl_info[i];
		        }
		    }
		}
		var c=document.getElementById("myCanvas");
		var ctx=c.getContext("2d");
		console.log(cport);
		draw_bk(ctx, cport,2,"white","white", 1);
	}

	
    
	console.log(min_id);
    if (min_id!=0 && point_path.indexOf(min_id) <0){
		point_path[point_path.length] = min_id ;
		point_new = 1;
	} 
	else if (point_path.indexOf(min_id)>=0){
		point_new = 0;
		return;
	} 
    // document.getElementById("positionShow").innerHTML = "Position you chose: " + clickObjPosition + ";  Port Index: " +
    //     min_type + "_" + min_id + ";  Port Position: " + min_position[0]/100 + "," + min_position[1]/100 + ". <br><br>"+
    //     "Point indexes: " + point_path;
}

function getOffsetTop(obj){
    var tmp = obj.offsetTop;
    var val = obj.offsetParent;
    while(val != null){
        tmp += val.offsetTop;
        val = val.offsetParent;
    }
    return tmp;
}
function getOffsetLeft(obj){
    var tmp = obj.offsetLeft;
    var val = obj.offsetParent;
    while(val != null){
        tmp += val.offsetLeft;
        val = val.offsetParent;
    }
    return tmp;
}

function remove_point_tr(obj){
	var index = parseInt(obj.parentNode.parentNode.id);
	var i = point_path.indexOf(index);
	console.log(i,index, point_path,obj,obj.parentNode.parentNode);
	point_path.splice(i,1);
	obj.parentNode.parentNode.remove();
}