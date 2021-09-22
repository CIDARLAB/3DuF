function openNav() {
	document.getElementById("mySidenav").style.width = "150px";
	document.getElementById("main").style.marginLeft = "150px";
	document.body.style.backgroundColor = "rgba(0,0,0,0.4)";
}

function closeNav() {
	document.getElementById("mySidenav").style.width = "0";
	document.getElementById("main").style.marginLeft= "0";
	document.body.style.backgroundColor = "white";
}
function color(i){
	for (var j=1;j<6;j++){
		var sidebar=document.getElementById("side"+j);
		if (i == j) sidebar.style.color = "#111";
		else sidebar.style.color = "#FFFFFF";
	}
	
}

