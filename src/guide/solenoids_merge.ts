import {mode_a} from "@/guide/mode_op"
import {component_exist_list} from "@/guide/component_list"
import {component_each_info} from "@/guide/component_list"
// dynamicly analyse what is newly removed or added from/to open sets
function port_merge_split(a:Array<number>, b:Array<number>){
	var d=[];
	var b_left = [], a_left=[],keep_open=[],keep_close=[];

	for (let element of a){
		if (b.indexOf(element)<0) a_left[a_left.length] = element;
		else keep_open[keep_open.length] = element;
	}
	for (let element of b){
		if (keep_open.indexOf(element)<0) b_left[b_left.length] = element;
	}
	d[d.length] = keep_open;
	d[d.length] = b_left;
	d[d.length] = a_left;
	
	return d;
}
function union_merge(a:Array<Array<number>>){
	var c=[];
	var k =0;
	var la = a.length;
	while(k<la){
		if (k==0) {
			d = port_merge_split(a[0],a[1]);
			console.log(d.slice(0));
			var i =0;
			while (i < d.length){
				if ( d[i].length>0 && c.indexOf(d[i]) < 0) c.push(d[i])
				i++;
			}
			k++;
		}
		else{
			
			var lc =c.length;
			var a_left = a[k];
			console.log(c.slice(0));
			// split a[k] using current c
			for (var j=0;j< lc;j++){
				if (a_left.length<=0) break;
				var d = [];
				if (c[j].length>0){
					d = port_merge_split(a_left,c[j])
					a_left = d[d.length-1];
					c.splice(j,1);
					j--;
					lc--;
					var i = 0;
					// don't scan the a_left in d.
					while (i < d.length-1){
						if ( d[i].length>0 && c.indexOf(d[i]) < 0) c.push(d[i]);
						i++;
					}
				}
			}
			if (a_left.length>0) c.push(a_left);
		}
		
		k++;
	}
	
	// special to mode 5 of layout v1_i7
	if (mode_a.indexOf(5)>=0) {
		var lc = c.length;
		for (var i =0; i<lc; i++){
			console.log(c[i]);
			if (c[i].indexOf(10)>=0){
				console.log(i,c[i]);
				var index = c[i].indexOf(10);
				c[i].splice(index,1);
				index = c[i].indexOf(11);
				c[i].splice(index,1);
				index = c[i].indexOf(12);
				c[i].splice(index,1);
				if (c[i].length == 0) c.splice(i,1);
				c.push([10],[11],[12]);
				break;
			}
		}
	}
	var i = 1;
	close_ports = [];
	var index = component_exist_list.indexOf("Port_control");
	// component_each_info consists of 
	while (i<=component_each_info[index].length) {
		var j = 0;
		var flag = 0;
		for (let ci of c){
			if (ci.indexOf(i)>=0){
				flag = 1;
				break;
			}
		}
		if (flag == 0) close_ports[close_ports.length] = i;
		i++;
	}
	c.push(close_ports);
	console.log(c);
	return c;
}
// port_choose means which solenoids should be used in current mode.
// c consists of many solenoids backets, in each backet we have several ports connect to it together.
function on_off(c: Array<Array<number>>, port_choose: Array<number>){
	var switch_s = []
	for (var i=0; i<c.length; i++){
		if ( port_choose.indexOf(c[i][0]) >=0 ) switch_s[switch_s.length] = "on";
		else switch_s[switch_s.length] = "off";
	}
	console.log(switch_s);
	return switch_s;
}