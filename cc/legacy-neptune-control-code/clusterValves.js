/**
 * Created by rebeccawolf on 12/14/16.
 */

function drawClusterTable(data) {
    $("#makeValveCluster")
        .find("tr:gt(0)")
        .remove();
    for (var i = 0; i < data.length; i++) {
        drawClusterRow(data[i]);
    }
}

function drawClusterRow(rowData) {
    var row = $("<tr class='tempData' />");
    $("#makeValveCluster").append(row);
    row.append($("<td>" + rowData.id + "</td>"));
    var id = rowData.id.toString();
    row.append($("<td>" + "<input type=\"checkbox\" name=\"member\" value=" + id + " onchange=\"updateClusterList()\"> " + "</td>"));
}

function updateClusterList() {
    var clusterMembers = $("input[name=member]:checked")
        .map(function() {
            return this.value;
        })
        .get();
    clusterMembers = clusterMembers.toString();
    $("#newClusterList").text("Cluster Members: " + clusterMembers);
}

function saveCluster() {
    var clusterMembers = $("input[name=member]:checked")
        .map(function() {
            return this.value;
        })
        .get();

    if (clusterMembers.length <= 1) {
        alert("Only 1 valve selected.");
        return;
    }
    var valves = JSON.parse(localStorage.pumpData);

    // cluster members should be numbered the same as they are in JSON format (-1)
    for (var i = 0; i < clusterMembers.length; i++) {
        clusterMembers[i] = clusterMembers[i] - 1;
    }

    console.log(clusterMembers);
    // update pumpData JSON
    for (var i = 0; i < clusterMembers.length; i++) {
        valves[clusterMembers[i]]["Cluster"] = clusterMembers;
        console.log(valves[clusterMembers[i]]["Cluster"]);
    }

    // store cluster in global cluster variable
    /*
    var clusterJSON = JSON.parse(localStorage.valveClusters);
    clusterJSON.push({members: clusterMembers});
    */

    localStorage.pumpData = JSON.stringify(valves);
    console.log(JSON.parse(localStorage.pumpData));
}
