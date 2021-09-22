// hide and display when we want them to do that
var flag_after_clean=0;
var isHide = [false,false, true, true, true, true];
var s = "step";
var step = 1;
var mode_num = 0, flag_points_clean = 1;
var flag_inlet = 0, flag_outlet = 0;
var close_ports=[];
var flag_check = 0;
var solenoid_set = [];
var index_port, index_port_c;


function hide(){
	var content=document.getElementById(s+step);
	console.log(s+step);
	if (isHide[step]) {
		content.style.display='';
	}else{
		content.style.display='none';
	}
	isHide[step]=!isHide[step];
}

function show_prepare(step){
	var content=document.getElementById("next");
	
	if (step>=5 && flag_check==1){
		content.style.display='none';
		for (var j=0;j<solenoids_each_mode.length;j++){
			var a = [];
			var i = 1;
			index = component_exist_list.indexOf("Port_control");
			while (i<=component_exist_num[index]){
				if (solenoids_each_mode[j].indexOf(i)<0) a[a.length] = i;
				i++;
			}
			console.log(a);
			var new_tr = document.createElement("tr");
			new_tr.innerHTML = "<td> <h5 id='situation-"+j+"'>"+mode_a[j]+"</h5> </td>  <td> <h5 id='open-"+j+"'> "+solenoids_each_mode[j]+
			"</h5> </td> <td> <h5 id='close-"+j+"'> "+a+"</h5> </td>"
			document.getElementById("tb5").appendChild(new_tr);
		}
		// c is the sets of solenoids sets
		console.log(solenoids_each_mode);
		var c = union_merge(solenoids_each_mode.slice(0));
		solenoid_set = c.slice(0);
		var switch_s = on_off(c,solenoids_each_mode[solenoids_each_mode.length-1]);
		for (var i=1; i<=c.length; i++){
			var new_tr = document.createElement("tr");
			new_tr.innerHTML = "<td> <h5 id='solenoid-id-"+i+"'>"+"solenoid"+i+"</h5> </td> <td> <h4 id='port5-2-"+i+"'> "+c[i-1]+ "</h4> </td>"
			document.getElementById("tb5-2").appendChild(new_tr);
		}
		for (var i=1; i<=c.length; i++){
			var new_tr = document.createElement("tr");
			new_tr.innerHTML = "<td> <h5 id='solenoid-sample-"+i+"'>"+"solenoid"+i+"</h5> </td> <td> <h4 id='port5-3-"+i+"'> "+switch_s[i-1]+ "</h4> </td>"
			document.getElementById("tb5-3").appendChild(new_tr);
		}
		flag_check=0;
	}else{
		content.style.display='';
	}
	if (step==2){
		for (var i=0; i<component_exist_num.length;i++){
			document.getElementById("num"+i).innerHTML = component_exist_num[i];
		}
	}
	if (step ==3){
		refresh();
	}
}

function next_show(){
	step++;
	show_prepare(step);
	if (step ==4){
		refresh();
		index_port = component_exist_list.indexOf('Port');
		color_points(index_port);
	}
	
	hide();
}
function show(i){
	step = i;
	show_prepare(step);
	if (step==4){
		if (flag_inlet==0 || flag_outlet==0){
			refresh();
			index_port = component_exist_list.indexOf('Port');
			color_points(index_port);
		}
	}
	if (step ==1){
		var c=document.getElementById("myCanvas");
		var ctx=c.getContext("2d");
		draw_bk(ctx,flow_info,1,"blue","red");
		draw_bk(ctx, ctrl_info,2,"blue","red");
	}
	hide();
}

function color_points(s){
	var c=document.getElementById("myCanvas");
	var ctx=c.getContext("2d");
	draw_bk(ctx, flow_info,1,"white","white");
	draw_bk(ctx, ctrl_info,2,"white","white");
	var index = parseInt(s);
	console.log(index);
	if (index >= 0) {
		if (index == component_exist_list.length && inlet.length > 0) {
			index_port = component_exist_list.indexOf('Port');
			var obj = component_each_info[index_port];
			for (let ele of obj){
				if (inlet.indexOf(ele.id) >= 0) inlet_info[inlet_info.length] = ele;
			}
			draw_bk(ctx,inlet_info,1,"blue","red");
		}
		else if (index == component_exist_list.length && inlet.length == 0) inlet_choose();
		else if (component_exist_list[index].indexOf("control") < 0) draw_bk(ctx,component_each_info[index],1,"blue","red");
		else draw_bk(ctx,component_each_info[index],2,"blue","red");
	}
}
function refresh(f=1){
	var c=document.getElementById("myCanvas");
	var ctx=c.getContext("2d");
	draw_bk(ctx, flow_info,1,"white","white");
	draw_bk(ctx, ctrl_info,2,"white","white");
	flag_points_clean = 1;
	if (f==1) {
		point_path = [];
		var obj = document.getElementById("tb4-1");
		obj.innerHTML = "";
	}
	mode_color_3(8);
	if (step==4) 
		{
			color_points(index_port);
			index_port = component_exist_list.indexOf('Port');
		}
}

function add_row(){
	console.log(point_new);
	if (point_new == 0) return;
	var l =point_path.length;
	var obj = document.createElement("tr");
	obj.id = point_path[l-1];
	obj.innerHTML = "<td> <h4 id='num_id'"+l+">"+point_path[l-1]+"</h4> </td> <td> <input type='text' class='input' id='media'"+l+"> </td> <td> <button class='mode' id='remove4-"+l+
	"' onclick='remove_point_tr(this)'>Del</button> </td>";
	document.getElementById("tb4-1").appendChild(obj);
}

// when f=1, check it and show it on canvas. if f=2, add all input into list.
function check_lets(f =0){
	
	flag_check = 1;
	is_customize = 0;
	if (f==1){
		var i = 0;
		while (i<mode_new.length){
			mode_num = mode_new[i];
			var k = check_let(mode_num);
			if (k==1) {
				mode_new = [];
				mode_a = [];
				break;
			}
			i++;
		}
		flag_inlet = 0;
		flag_outlet = 0;
	}else check_let(mode_num);
	if (f==2 && flag_inlet==1 && flag_outlet==1 ) newCanvas(mode_num);
}

// check outlet and inlet with their mode number
function check_let(mode_num){
	if (mode_num==5 || mode_num==4 || mode_num==2 || mode_num==7) {
		flag_inlet = 1;
		flag_outlet = 1;
		return;
	}
	if (point_path.length!=0){
		for (let i of point_path){
			if (inlet.indexOf(i)>=0) flag_inlet = 1;
			else flag_outlet =1;
		}
		if (flag_inlet == 0) {
			alert("no inlet");
			refresh(0);
			return 1;
		}
		else if (flag_outlet == 0){
			alert("no outlet");
			refresh(0);
			return 1;
		}
	}
	else {
		alert("no point chosen");
		refresh(0);
		return 1;
	}
	return 0;
}
