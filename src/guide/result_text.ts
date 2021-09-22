function downloadTxt(fileName) {
    var a = document.createElement('a');
	var message = "";
	for (var j = 0; j <solenoid_set.length; j++){
		message += "Solenoid " + j +": "+ solenoid_set[j]+"\n";
	}
    for (var i =0; i<mode_a.length; i++){
		message += "\n" +"Mode: " + mode_a[i] + ", Chosen Ports: " + ports_select[i] + "\n";
		message += mode_description[mode_a[i]];
		if (mode_description[mode_a[i]].indexOf("\n")<0) message += "\n";
		message += "Valve on: " + solenoids_each_mode[i] + "\n";
		var switch_s = on_off(solenoid_set,solenoids_each_mode[i]);
		for (var j = 0; j <solenoid_set.length; j++){
			message += "Solenoid " + j + ": " + switch_s[j] + " \n";
		}
        
    }
    a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(message);
    a.download = fileName
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

