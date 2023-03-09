/**
 * This file would contain the ko viewmodels that bind the entire control modal to the actual data in the bg
 *
 * Ideally some of these methods would be disposed off
 */
// Sets up settings Modal
// Settings table save functionality

function drawValveTable(data) {
    $("#ValveTable")
        .find("tr:gt(0)")
        .remove();
    for (var i = 0; i < data.length; i++) {
        drawValveRow(data[i]);
    }
}

function drawValveRow(rowData) {
    var row = $("<tr class='tempData' />");
    $("#ValveTable").append(row);
    row.append($("<td>" + rowData.id + "</td>"));
    row.append($("<td>" + rowData.HW_shield + "</td>"));
    row.append($("<td>" + rowData.HW_pin + "</td>"));
    //row.append($("<td contenteditable='true'>" + rowData.Open_State + "</td>"));
    //row.append($("<td contenteditable='true'>" + rowData.Closed_State + "</td>"));
    row.append($("<td>" + rowData.Open_State + "</td>"));
    row.append($("<td>" + rowData.Closed_State + "</td>"));
    row.append($("<td>" + rowData.Current_State + "</td>"));
}

// A few jQuery helpers for exporting only
jQuery.fn.pop = [].pop;
jQuery.fn.shift = [].shift;

function exporting() {
    var $rows = $("#ValveTable").find("tr:not(:hidden):not(:empty)");
    var keys = ["id", "HW_shield", "HW_pin", "Open_State", "Closed_State", "Current_State"];
    var x = 0; // making sure we are not counting the headers row here
    var valveData = JSON.parse(localStorage.pumpData);
    // Turn all existing rows into a loopable array
    $rows.each(function() {
        if (x > 0) {
            var $td = $(this).find("td");
            // Use pre-defined Hash keys
            keys.forEach(function(header, i) {
                if (header === "Current_State") {
                    valveData[x - 1][header] = $td.eq(i).text();
                } else {
                    valveData[x - 1][header] = parseInt($td.eq(i).text());
                }
            });
        }
        x = x + 1;
    });
    // Output the result
    localStorage.pumpData = JSON.stringify(valveData);
}

function drawDispenserTable(data) {
    $("#DispenserTable")
        .find("tr:gt(0)")
        .remove();
    for (var i = 0; i < data.length; i++) {
        drawDispRow(data[i]);
    }
}

function drawDispRow(rowData) {
    var row = $("<tr class='tempData' />");
    $("#DispenserTable").append(row);
    row.append($("<td>" + rowData.id + "</td>"));
    row.append($("<td>" + rowData.HW_shield + "</td>"));
    row.append($("<td>" + rowData.HW_pin + "</td>"));
    row.append($("<td contenteditable='true'>" + rowData.Precision + "</td>"));
    row.append($("<td contenteditable='true'>" + rowData.Min + "</td>"));
    row.append($("<td contenteditable='true'>" + rowData.Max + "</td>"));
    row.append($("<td contenteditable='true'>" + rowData.Current_State + "</td>"));
    row.append($("<td>" + rowData.orientation + "</td>"));
}

function exportingDispenser() {
    var $rows = $("#DispenserTable").find("tr:not(:hidden):not(:empty)");
    var keys = ["id", "HW_shield", "HW_pin", "Precision", "Min", "Max", "Current_State", "orientation"];
    var x = 0; // making sure we are not counting the headers row here
    var dispenserData = JSON.parse(localStorage.dispenserData);
    // Turn all existing rows into a loopable array
    $rows.each(function() {
        if (x > 0) {
            var $td = $(this).find("td");
            // Use pre-defined Hash keys
            keys.forEach(function(header, i) {
                if (header === "Current_State") {
                    dispenserData[x - 1][header] = parseFloat($td.eq(i).text()).toFixed(1);
                } else if (header === "Precision") {
                    dispenserData[x - 1][header] = $td.eq(i).text();
                } else if (header === "Min") {
                    dispenserData[x - 1][header] = parseFloat($td.eq(i).text()).toFixed(1);
                } else if (header === "Max") {
                    dispenserData[x - 1][header] = parseFloat($td.eq(i).text()).toFixed(1);
                } else {
                    dispenserData[x - 1][header] = parseInt($td.eq(i).text());
                }
            });
        }
        x = x + 1;
    });
    // Output the result
    localStorage.dispenserData = JSON.stringify(dispenserData);
}

function totalExport() {
    deviceCount = 0;
    exporting();
    exportingDispenser();
}
