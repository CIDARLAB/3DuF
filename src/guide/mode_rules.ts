var mode_changing = 0;
function description_change(j:number){
	if (mode_changing == 1) return;
	mode_changing = 1;
	var c = document.getElementById("mode-des-"+j).innerHTML;
	console.log(c);
	var obj1 = document.createElement("div");
	obj1.innerHTML = "<textarea id='mode-changing' style = 'font-size:18px; width:100%; height:60px'>" + c +
	"</textarea> <br> <button class='button' onclick='submit_change(" + j + ");'>submit</button> <br>"
	document.getElementById("mode-"+j).appendChild(obj1);	
}

function submit_change(j:number){
	if (mode_changing==0) return;
	mode_changing = 0;
	var c = document.getElementById("mode-changing").value;
	console.log(c);
	mode_description[j] = c;
	document.getElementById("mode-des-"+j).innerHTML = c;
	document.getElementById("mode-"+j).removeChild(document.getElementById("mode-changing").parentNode);
}
// <input type="text" id="mode-des-1">