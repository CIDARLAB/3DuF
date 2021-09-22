var mode_switch=[0,0,0,0,0,0,0,0];
// mode_a is a list stored all modes users chosen.
export var mode_a: Array<number>;
var mode_new = [];
var solenoids_each_mode = [];
var ports_select = [];
var mode_description = ["0-Priming MCs, MCMs, MFMs and ALL Channels of the Board using MIX",
	"1-Loading cells in each inlet independently from MUX\n" ,
	"2-Cleaning of all main channels and the reservoir after cell loading\n" ,
	"3-Filling in the reservoirs with no operation to bring anything to any inlets (only reservoirs), followed by cleaning of needed\n" ,
	"4-Cleaning of all main channels after reservoir filling\n" ,
	"5-Both inlets of a MCM receive media from the reservoirs independent and simultaneously with MUX closed\n" ,
	"6-Feeding inlets from reservoirs stopped, then reservoirs receive media from MUX one at the time for re-filing\n" ,
	"7-Final cleaning of all channels after experiments are gone, and MCMs are removed. (Open all of the valves)\n"];

function mode_color(i){

	color_str = ["#FFFFFF","#111111"];
	var modei=document.getElementById("mode"+i);
	var obj = document.getElementById("step4");
	mode_switch[i -	1] = (mode_switch[i - 1]+1) % 2;
	modei.style.color = color_str[mode_switch[i - 1]];
	
	if (mode_new.indexOf(i)!=-1) return;
	
	if (mode_switch[i -	1]==0){
		var index = mode_a.indexOf(i);
		mode_a.splice(index,1);
		index = mode_new.indexOf(i);
		mode_new.splice(index,1);
		remove_description(i);
	} 
	else {
		mode_a[mode_a.length] = i;
		mode_new[mode_new.length] = i;
		add_description(i);
	}
	console.log(ports_select);
	if (mode_a.length>0) mode_num = mode_a[mode_a.length-1];
	else mode_num = 0;
}

function mode_color_3(i){
	mode_num = i;
	for (var j=0;j<8;j++){
		var obj=document.getElementById("mode3_"+j);
		if (i == j) obj.style.color = "#111";
		else obj.style.color = "#FFFFFF";
	}
}

function add_description(i){

	var obj=document.createElement("h5");
	obj.id = "mode_des"+mode_description[i][0];
	obj.innerHTML = mode_description[i];
	document.getElementById("chosen_mode").appendChild(obj);
}

function remove_description(i){
	id = "mode_des"+mode_description[i][0];
	var list = document.getElementById("chosen_mode");
	list.removeChild(document.getElementById(id));
}

function canvas_mode(){
	var i = 0;
	flag_check = 1;
	document.getElementById("tb5").innerHTML="";
	document.getElementById("tb5-2").innerHTML="";
	document.getElementById("tb5-3").innerHTML="";
	solenoids_each_mode = [];
	for (let mode_num of mode_a){
		point_path = ports_select[i].slice(0);
		console.log(point_path.slice(0));
		flag_points_clean=1;
		newCanvas(mode_num);
		console.log(index_ctrl_port);
		solenoids_each_mode[solenoids_each_mode.length] = index_ctrl_port;
		i++;
	}
}
// add new operation into the operation list, an operation consists of inlet/outlet/mode
function addlist(){
	for (var i=mode_a.length - mode_new.length; i<mode_a.length;i++){
		var new_tr = document.createElement("tr");
		new_tr.id = mode_a[i];
		new_tr.innerHTML = "<td> <h5 id='mode-id"+i+"'>"+mode_a[i]+"</h5> </td> <td> <h4 id='port4-"+i+"'> "+point_path+"</h4> </td> <td style='width: 270px;'> <button onclick='check_each_mode(this)' class='button' id='check2-"
		+i+"' style='width:90px;float: left; margin-right: 10px;'> Check !</button> <button class='mode' id='remove" +i+"' onclick='remove_mode_tr(this)'>Del</button> <button class='diy' id='diy" 
		+i+"' onclick='draw_diy(this)'>DIY it!</button> </td>";
		document.getElementById("tb4-2").appendChild(new_tr);
		ports_select[ports_select.length] = point_path.slice(0);
	}
	document.getElementById("chosen_mode").innerHTML = "<p>Mode Description</p>";
	for (var j=0;j<8;j++){
		var obj=document.getElementById("mode"+j);
		obj.style.color = "#FFFFFF";
	}
	mode_switch=[0,0,0,0,0,0,0,0];
	mode_new = [];
}

function remove_mode_tr(obj){
	var index = parseInt(obj.parentNode.parentNode.id);
	var i = mode_a.indexOf(index);
	console.log(i,index, point_path,obj,obj.parentNode.parentNode);
	ports_select.splice(i,1);
	mode_a.splice(i,1);
	obj.parentNode.parentNode.remove();
	console.log(mode_a);
}

// check the operation we click using the input object.
function check_each_mode(obj){
	var index = parseInt(obj.parentNode.parentNode.id);
	var i = mode_a.indexOf(index);
	console.log(i,index, point_path,obj,obj.parentNode.parentNode);
	point_path = ports_select[i].slice(0);
	mode_num = mode_a[i];
	console.log(ports_select);
	newCanvas(mode_num);
	point_path = ports_select[i].slice(0);
}