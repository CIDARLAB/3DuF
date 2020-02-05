import * as HTMLUtils from '../../utils/htmlUtils';
import Feature from '../../core/feature';

const Registry = require("../../core/registry");
import {FloatValue, BooleanValue, StringValue} from '../../core/parameters';
var FeatureSets = require("../../featureSets");

var createSlider = function(min, max, step, start, id) {
    var div = document.createElement("div");
    var p = document.createElement("p");
    p.setAttribute("style", "min-width: 240px");
    var slider = document.createElement("input");
    slider.className = "mdl-slider mdl-js-slider";
    slider.setAttribute("type", "range");
    slider.setAttribute("id", id);
    slider.setAttribute("min", min);
    slider.setAttribute("max", max);
    slider.setAttribute("value", start);
    slider.setAttribute("step", step);
    p.appendChild(slider);
    componentHandler.upgradeElement(slider, "MaterialSlider");
    div.appendChild(p);
    return div;
};

var createButton = function(iconString) {
    var button = document.createElement("button");
    button.className = "mdl-button mdl-js-button mdl-button--icon";
    var icon = document.createElement("i");
    icon.className = "material-icons";
    icon.innerHTML = iconString;
    button.appendChild(icon);
    componentHandler.upgradeElement(button, "MaterialButton");
    return button;
};

var createValueField = function(start, id, unittext="") {
    var div = document.createElement("div");
    var error = document.createElement("span");
    var span = document.createElement("span");
    span.innerHTML = unittext;
    span.style.fontSize = "14px";
    error.className = "mdl-textfield__error";
    error.innerHTML = "Digits only";
    div.className = "mdl-textfield mdl-js-textfield";
    var field = document.createElement("input");
    field.className = "mdl-textfield__input";
    field.setAttribute("type", "text");
    field.setAttribute("id", id);
    field.setAttribute("value", start);
    field.setAttribute("pattern", "[0-9]*");
    field.style.paddingTop = "0px";
    div.appendChild(field);
    div.appendChild(span);
    div.appendChild(error);
    div.setAttribute("style", "margin-left: auto; margin-right: auto; display: block;width:65px;padding-top:0px;padding-bottom:5px;");
    componentHandler.upgradeElement(div, "MaterialTextfield");
    return div;
};

var createTableElement = function(child) {
    var td = document.createElement("td");
    td.appendChild(child);
    return td;
};

var createCheckbox = function(checked, id) {
    var div = document.createElement("div");
    var label = document.createElement("label");
    label.className = "mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect";
    label.setAttribute("for", id);
    var input = document.createElement("input");
    input.setAttribute("type", "checkbox");
    input.setAttribute("id", id);
    if (checked) input.checked = true;
    input.className = "mdl-checkbox__input";
    label.appendChild(input);
    componentHandler.upgradeElement(label, "MaterialCheckbox");
    div.setAttribute("style", "margin-left: auto; margin-right: auto; display: block;width:12px;position:relative;");
    div.appendChild(label);
    return div;
};

var createSpan = function(value, id) {
    var div = document.createElement("div");
    var span = document.createElement("span");
    span.innerHTML = value;
    span.setAttribute("id", id);
    span.setAttribute("style", "font-size: 16px;");
    div.setAttribute("style", "margin-left: none; margin-right: auto; display: block;width:24px;");
    div.appendChild(span);
    return div;
};

var createTableRow = function(one, two, three) {
    var tr = document.createElement("tr");
    one.style.borderBottom = "none";
    tr.appendChild(one);
    tr.appendChild(two);
    tr.appendChild(three);
    return tr;
};

var generateUpdateFunction = function(sourceID, targetID, typeString, setString, paramString) {
    return function() {
        var source = document.getElementById(sourceID);
        var target = document.getElementById(targetID);
        var param;
        if(!source.value || source.value == ""){
            return;
        }
        try {
            param = new FloatValue(parseFloat(source.value));
        } catch (err){
            console.log("Invalid Float value.");
            return;
        }
        target.value = String(param.getValue());
        Registry.viewManager.adjustParams(typeString, setString, paramString, param.getValue());
    }
};
/*
var generateUpdateFunctionString = function(sourceID, targetID, typeString, setString, paramString) {
  return function() {
    var source = document.getElementById(sourceID);
    var target = document.getElementById(targetID);
    var param;
    try {
      param = new StringValue(parseString(source.value));
    } catch (err){
      console.log("Invalid value.");
      return;
    }
    target.value = String(param.getValue());
    Registry.viewManager.adjustParams(typeString, setString, paramString, param.getValue());
  }
}
*/
var generateCheckFunction = function(sourceID, targetID, typeString, setString, paramString) {
    return function() {
        var source = document.getElementById(sourceID);
        var target = document.getElementById(targetID);
        var param;
        var param_to_pass;
        try {
            param = new BooleanValue(source.checked);
        } catch (err){
            console.log("Invalid Boolean value.");
            return;
        }
        if (param.getValue()) {
            target.innerHTML = "V";
            param_to_pass = new StringValue("V");
        }
        else {
            target.innerHTML = "H";
            param_to_pass = new StringValue("H");
        }
        Registry.viewManager.adjustParams(typeString, setString, paramString, param_to_pass.getValue());
    }
};

var generateCheckFunctionDir = function(sourceID, targetID, typeString, setString, paramString) {
    return function() {
        var source = document.getElementById(sourceID);
        var target = document.getElementById(targetID);
        var param;
        var param_to_pass;
        try {
            param = new BooleanValue(source.checked);
        } catch (err){
            console.log("Invalid Boolean value.");
            return;
        }
        if (param.getValue()) {
            target.innerHTML = "IN";
            param_to_pass = new StringValue("IN");
        }
        else {
            target.innerHTML = "OUT";
            param_to_pass = new StringValue("OUT");
        }
        Registry.viewManager.adjustParams(typeString, setString, paramString, param_to_pass.getValue());
    }
};

var createSliderRow = function(featureID, typeString, setString, key) {
    let definition = FeatureSets.getDefinition(typeString, setString);
    let min = definition.minimum[key];
    let max = definition.maximum[key];
    let value = Feature.getDefaultsForType(typeString, setString)[key];
    let step = 10;
    let titleID = (featureID + "_" + key + "_title");
    let sliderID = (featureID + "_" + key + "_slider");
    let fieldID = (featureID + "_" + key + "_value");
    let title = createSpan(key, titleID);
    let titleContainer = createTableElement(title);
    titleContainer.style.borderBottom = "none";
    let slider = createSlider(min, max, step, value, sliderID);
    let sliderContainer = createTableElement(slider);
    sliderContainer.setAttribute("style", "padding-left: 0px; padding-right: 0px");
    let unittext = definition.units[key];
    let field = createValueField(value, fieldID, unittext);
    let fieldContainer = createTableElement(field);
    let row = createTableRow(sliderContainer, titleContainer, fieldContainer);
    field.oninput = generateUpdateFunction(fieldID, sliderID, typeString, setString, key);
    slider.oninput = generateUpdateFunction(sliderID, fieldID, typeString, setString, key);
    return row;
};
/*
var createStringRow = function(featureID, typeString, setString, key) {
  var definition = FeatureSets.getDefinition(typeString, setString);
  var value = Feature.getDefaultsForType(typeString, setString)[key];
  var titleID = (featureID + "_" + key + "_title");
  var fieldID = (featureID + "_" + key + "_value");
  var title = createSpan(key, titleID);
  var titleContainer = createTableElement(title);
  titleContainer.style.borderBottom = "none";
  var field = createValueField(value, fieldID);
  var fieldContainer = createTableElement(field);
  var row = createTableRow2(titleContainer, fieldContainer);
  field.oninput = generateUpdateFunctionString(fieldID, typeString, setString, key);
  return row;
}
*/

var createDefaultsRow = function(featureID, typeString, setString, key) {
    var title = createSpan(key);
    var buttonID = ("defaults_button");
    var spanID = ("defaults_span");
    var value = Feature.getDefaultsForType(typeString, setString)[key]

};

var createCheckboxRow = function(featureID, typeString, setString, key) {
    var title = createSpan(key);
    var checkID = (featureID + "_" + key + "_checkbox");
    var spanID = (featureID + "_" + key + "_span");
    var value = Feature.getDefaultsForType(typeString, setString)[key];
    var checkBox = createCheckbox(value, checkID);
    var spanValue;
    if (value == "V") spanValue = "V";
    else spanValue = "H";
    var span = createSpan(spanValue, spanID);
    var titleContainer = createTableElement(title);
    var checkContainer = createTableElement(checkBox);
    var spanContainer = createTableElement(span);
    var row = createTableRow(checkContainer, titleContainer, spanContainer);
    checkBox.onchange = generateCheckFunction(checkID, spanID, typeString, setString, key);
    return row;
};

var createInOutRow = function(featureID, typeString, setString, key) {
    var title = createSpan(key);
    var checkID = (featureID + "_" + key + "_checkbox");
    var spanID = (featureID + "_" + key + "_span");
    var value = Feature.getDefaultsForType(typeString, setString)[key];
    var checkBox = createCheckbox(value, checkID);
    var spanValue = value;
    //if (value == "IN") spanValue = "IN";
    //else spanValue = "OUT";
    var span = createSpan(spanValue, spanID);
    var titleContainer = createTableElement(title);
    var checkContainer = createTableElement(checkBox);
    var spanContainer = createTableElement(span);
    var row = createTableRow(checkContainer, titleContainer, spanContainer);
    checkBox.onchange = generateCheckFunctionDir(checkID, spanID, typeString, setString, key);
    return row;
};

var createFeatureTableRows = function(typeString, setString) {
    let def = FeatureSets.getDefinition(typeString, setString);
    let heritable = def.heritable;
    let id = "fake_ID";
    let rows = [];
    for (let key in heritable) {
        let row;
        let type = heritable[key];
        if (type == "Float" || type == "Integer") {
            row = createSliderRow(id, typeString, setString, key);
        }
        else if (key == "orientation") {
            row = createCheckboxRow(id, typeString, setString, key);
        }
        else if (key == "direction") {
            row = createInOutRow(id, typeString, setString, key);
        }
        rows.push(row);

    }
    return rows;
};

var createFeatureTableHeaders = function(typeString) {
    var thead = document.createElement("thead");
    var tr = document.createElement("tr");
    thead.appendChild(tr);
    var param = document.createElement("th");
    param.className = "mdl-data-table__cell--non-numeric";
    param.innerHTML = "Parameter &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;";
    var value = document.createElement("th");
    value.className = "mdl-data-table__cell--non-numeric";
    value.innerHTML = "Value";
    var type = document.createElement("th");
    type.className = "mdl-data-table__cell--non-numeric";
    type.innerHTML = "Parameters";
    type.style.fontSize = "18px";
    type.style.color = "#000000";
    //type.style.right = "35px";
    tr.appendChild(type);
    tr.appendChild(param);
    tr.appendChild(value);
    return thead;
};

var createFeatureTableBody = function(typeString, setString) {
    var body = document.createElement("tbody");
    body.setAttribute("id", "featureTable");
    var rows = createFeatureTableRows(typeString, setString);
    for (var i = 0; i < rows.length; i++) {
        body.appendChild(rows[i]);
    }
    return body;
};

var createFeatureTable = function(typeString, setString, position) {
    var table = document.createElement("table");
    table.className = "mdl-data-table mdl-js-data-table mdl-shadow--2dp feature-table fade-transition";
    var head = createFeatureTableHeaders(typeString);
    table.appendChild(head);
    var body = createFeatureTableBody(typeString, setString);
    table.appendChild(body);
    var closeButton = createCloseButton();
    closeButton.style.position = "absolute";
    closeButton.style.right = "0px";
    closeButton.style.top = "0px";
    //table.appendChild(closeButton);
    closeButton.onclick = function() {
        table.parentElement.removeChild(table);
    };
    HTMLUtils.addClass(table, "hidden-block");
    table.style.zIndex = 999999;
    return table;
};


var createCloseButton = function() {
    var button = createButton("close");
    button.style.color = "#313131";
    return button;
};

var generateTableFunction = function(tableID, typeString, setString , isTranslucent) {
    return function(event) {
        var table = document.getElementById(tableID);
        if (table) {
            table.parentElement.removeChild(table);
        } else {
            table = createFeatureTable(typeString, setString);
            table.id = tableID;
            if(isTranslucent){
                table.style.opacity = 0.7;
            }
            table.style.position = "absolute";
            table.style.left = "" + (event.clientX + 30)+ "px";
            table.style.top = "" + (event.clientY - 20) +   "px";
            HTMLUtils.removeClass(table, "hidden-block");
            HTMLUtils.addClass(table, "shown-block");
            document.body.appendChild(table);
        }
    }
};

var revertToDefaultParams = function(table, typeString, setString){
    let def = FeatureSets.getDefinition(typeString, setString);
    let heritable = def.heritable;
    let defaults = def.defaults;

    for (let key in heritable) {
        let type = heritable[key];

        if (type == "Float" || type == "Integer") {
            let inputID = ("fake_ID_" + key + "_slider");
            //Modify the text in the input element
            let element = document.querySelector("#"+inputID);
            element.MaterialSlider.change(defaults[key]);
            Registry.viewManager.adjustParams(typeString, setString, key, defaults[key]);
        }
        else if (key == "orientation") {
            //TODO - Change the checkbox
            let inputID = ("fake_ID_" + key + "_checkbox");
            let element = document.querySelector("#"+inputID);
            let materialelement = table.querySelector('.mdl-js-checkbox');
            let spanelement = table.querySelector("#fake_ID_" + key + "_span");
            if(defaults[key] == 'V'){
                element.checked = true;
                materialelement.MaterialCheckbox.check();
                spanelement.textContent= defaults[key];
            }else{
                element.checked = false;
                materialelement.MaterialCheckbox.uncheck();
                spanelement.textContent= defaults[key];
            }
            Registry.viewManager.adjustParams(typeString, setString, key, defaults[key]);
        }
        else if (key == "direction") {
            //TODO Change the Checkbox
            let inputID = ("fake_ID_" + key + "_checkbox");
            let materialelement = table.querySelector('.mdl-js-checkbox');
            let element = document.querySelector("#"+inputID);
            let spanelement = table.querySelector("#fake_ID_" + key + "_span");
            if(defaults[key] == 'IN'){
                element.checked = true;
                materialelement.MaterialCheckbox.check();
                spanelement.textContent= defaults[key];
            }else{
                element.checked = false;
                materialelement.MaterialCheckbox.uncheck();
                spanelement.textContent= defaults[key];
            }
            Registry.viewManager.adjustParams(typeString, setString, key, defaults[key]);
        }

    }
};

module.exports.revertToDefaultParams = revertToDefaultParams;
module.exports.createFeatureTable = createFeatureTable;
module.exports.generateTableFunction = generateTableFunction;