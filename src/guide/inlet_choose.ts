var is_inlet = 0;
var inlet_info = [];

function inlet_choose(){
	is_inlet = 1;
	index_port = component_exist_list.indexOf('Port');
	color_points(index_port);
	point_path = [];
	choosepoint("Port");
}

function add_inlet(){
	if (is_inlet == 0) {
		document.getElementById("num"+component_exist_list.length).innerHTML = inlet.length;
		return;
	}
	inlet = point_path;
	console.log(inlet);
	document.getElementById("num"+component_exist_list.length).innerHTML = inlet.length;
	is_inlet = 0;
}