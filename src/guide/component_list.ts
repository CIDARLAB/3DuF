import Component from "@/app/core/component";
import { Point } from "@/app/core/init";

export var component_exist_list: Array<string>;

// * component_each_info consists of a list of many small lists of components, a is ctrl_info/ flow_info, so values inside a is component info
// * component_exist_list is used to store exists types of components inside the device.
export var component_each_info: Array<Array<Component>>;
var component_exist_num = [], inlet = [];

// a is array<array<points>>
function component_exist(a){
	for (let values of a){
		console.log(values.type);
		var index = component_exist_list.indexOf(values.type);
		if (index < 0) {
			
			component_exist_list[component_exist_list.length] = values.type;
			component_exist_num[component_exist_num.length] = 1;
			component_each_info[component_each_info.length] = [values];
		}
		else {
			component_exist_num[index] += 1;
			console.log(index);
			component_each_info[index][component_each_info[index].length] = values;
		}
	}
	console.log(component_exist_list);
	console.log(component_exist_num);
	console.log(component_each_info);
}

function creat_component_list(){
	var i = 0;
	for (let value of component_exist_list){
		var new_tr = document.createElement("tr");
		new_tr.innerHTML = "<tr> <td> <h4>" + value + "</h4> </td> <td> <h4 id='size'" + i + ">" + component_exist_num[i] + "</h4> </td> </tr>";
		document.getElementById("tb1").appendChild(new_tr);
		
		new_tr = document.createElement("tr");
		new_tr.innerHTML = "<tr> <td> <button class='button' id='port2' onclick='color_points(" + i + ")'>"+ component_exist_list[i] 
		+"</button> </td> <td> <h4 id='num"+i+"'>" + component_exist_num[i] + "</h4> </td> </tr>"
		document.getElementById("tb2").appendChild(new_tr);
		i+=1;
	}
	new_tr = document.createElement("tr");
	new_tr.innerHTML = "<tr> <td> <button class='button' id='port2' onclick='color_points("+i+")'>Inlet</button> </td> <td> <h4 id='num"+i+"'>" + inlet.length + "</h4> </td> </tr>"
	document.getElementById("tb2").appendChild(new_tr);
}