var HTMLUtils = require("../../utils/htmlUtils");
var Feature = require("../../core/feature");
var Registry = require("../../core/registry");
var Parameters = require("../../core/parameters");
var FeatureSets = require("../../featureSets");

var FloatValue = Parameters.FloatValue;
var BooleanValue = Parameters.BooleanValue;

var createSlider = function(min, max, step, start, id) {
  var div = document.createElement("div");
  var p = document.createElement("p");
  p.setAttribute("style", "width: 240px");
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
}

var createButton = function(iconString) {
  var button = document.createElement("button");
  button.className = "mdl-button mdl-js-button mdl-button--icon";
  var icon = document.createElement("i");
  icon.className = "material-icons";
  icon.innerHTML = iconString;
  button.appendChild(icon);
  componentHandler.upgradeElement(button, "MaterialButton");
  return button;
}

var createValueField = function(start, id) {
  var div = document.createElement("div");
  var error = document.createElement("span");
  var span = document.createElement("span");
  span.innerHTML = "μm";
  span.style.fontSize = "14px";
  error.className = "mdl-textfield__error";
  error.innerHTML = "Digits only";
  div.className = "mdl-textfield mdl-js-textfield";
  var field = document.createElement("input");
  field.className = "mdl-textfield__input";
  field.setAttribute("type", "text");
  field.setAttribute("id", id);
  field.setAttribute("value", start);
  field.setAttribute("pattern", "[0-9]*")
  field.style.paddingTop = "0px"
  div.appendChild(field);
  div.appendChild(span);
  div.appendChild(error);
  div.setAttribute("style", "margin-left: auto; margin-right: auto; display: block;width:65px;padding-top:0px;padding-bottom:5px;");
  componentHandler.upgradeElement(div, "MaterialTextfield");
  return div;
}

var createTableElement = function(child) {
  var td = document.createElement("td");
  td.appendChild(child);
  return td;
}

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
}

var createSpan = function(value, id) {
  var div = document.createElement("div");
  var span = document.createElement("span");
  span.innerHTML = value;
  span.setAttribute("id", id);
  span.setAttribute("style", "font-size: 16px;");
  div.setAttribute("style", "margin-left: none; margin-right: auto; display: block;width:24px;");
  div.appendChild(span);
  return div;
}

var createTableRow = function(title, slider, field) {
  var tr = document.createElement("tr");
  tr.appendChild(title);
  tr.appendChild(slider);
  tr.appendChild(field);
  return tr;
}

var generateUpdateFunction = function(sourceID, targetID, typeString, setString, paramString) {
  return function() {
    var source = document.getElementById(sourceID);
    var target = document.getElementById(targetID);
    var param;
    try {
      param = new FloatValue(parseFloat(source.value));
    } catch (err){
        console.log("Invalid Float value.");
        return;
    }
    target.value = String(param.getValue());
    Registry.viewManager.adjustParams(typeString, setString, paramString, param.getValue());
  }
}

var generateCheckFunction = function(sourceID, targetID, typeString, setString, paramString) {
  return function() {
    var source = document.getElementById(sourceID);
    var target = document.getElementById(targetID);
    var param;
    try {
      param = new BooleanValue(source.checked);
    } catch (err){
        console.log("Invalid Boolean value.");
        return;
    }
    if (param.getValue()) target.innerHTML = "true";
    else target.innerHTML = "false";
    Registry.viewManager.adjustParams(typeString, setString, paramString, param.getValue());
  }
}

var createSliderRow = function(featureID, typeString, setString, key) {
  var definition = FeatureSets.getDefinition(typeString, setString);
  var min = definition.minimum[key];
  var max = definition.maximum[key];
  var value = Feature.getDefaultsForType(typeString, setString)[key];
  var step = 10;
  var titleID = (featureID + "_" + key + "_title");
  var sliderID = (featureID + "_" + key + "_slider");
  var fieldID = (featureID + "_" + key + "_value");
  var title = createSpan(key, titleID);
  var titleContainer = createTableElement(title);
  titleContainer.style.borderBottom = "none";
  var slider = createSlider(min, max, step, value, sliderID);
  var sliderContainer = createTableElement(slider);
  sliderContainer.setAttribute("style", "padding-left: 0px; padding-right: 0px")
  var field = createValueField(value, fieldID);
  var fieldContainer = createTableElement(field);
  var row = createTableRow(titleContainer, fieldContainer, sliderContainer);
  field.oninput = generateUpdateFunction(fieldID, sliderID, typeString, setString, key);
  slider.oninput = generateUpdateFunction(sliderID, fieldID, typeString, setString, key);
  return row;
}

var createCheckboxRow = function(featureID, typeString, setString, key) {
  var title = createSpan(key);
  var checkID = (featureID + "_" + key + "_checkbox");
  var spanID = (featureID + "_" + key + "_span");
  var value = Feature.getDefaultsForType(typeString, setString)[key];
  var checkBox = createCheckbox(value, checkID);
  var spanValue;
  if (value) spanValue = "true";
  else spanValue = "false";
  var span = createSpan(spanValue, spanID);
  var titleContainer = createTableElement(title);
  titleContainer.style.borderBottom = "none";
  var checkContainer = createTableElement(checkBox);
  var spanContainer = createTableElement(span);
  var row = createTableRow(titleContainer, spanContainer, checkContainer);
  checkBox.onchange = generateCheckFunction(checkID, spanID, typeString, setString, key);
  return row;
}

var createFeatureTableRows = function(typeString, setString) {
  var def = FeatureSets.getDefinition(typeString, setString);
  var heritable = def.heritable;
  var id = "fake_ID";
  var rows = [];
  for (var key in heritable) {
    var row;
    var type = heritable[key];
    if (type == "Float" || type == "Integer") row = createSliderRow(id, typeString, setString, key);
    else if (type == "Boolean") row = createCheckboxRow(id, typeString, setString, key);
    rows.push(row);
  }
  return rows;
}

var createFeatureTableHeaders = function(typeString) {
  var thead = document.createElement("thead");
  var tr = document.createElement("tr");
  thead.appendChild(tr);
  var param = document.createElement("th");
  param.className = "mdl-data-table__cell--non-numeric";
  param.innerHTML = "Parameter";
  var value = document.createElement("th");
  value.className = "mdl-data-table__cell--non-numeric";
  value.innerHTML = "Value";
  var type = document.createElement("th");
  type.className = "mdl-data-table__cell--non-numeric";
  type.innerHTML = typeString + " Parameters";
  type.style.fontSize = "20px";
  type.style.color = "#000000";
  type.style.right = "35px";
  tr.appendChild(param);
  tr.appendChild(value);
  tr.appendChild(type);
  return thead;
}

var createFeatureTableBody = function(typeString, setString) {
  var body = document.createElement("tbody");
  body.setAttribute("id", "featureTable");
  var rows = createFeatureTableRows(typeString, setString);
  for (var i = 0; i < rows.length; i++) {
    body.appendChild(rows[i]);
  }
  return body;
}

var createFeatureTable = function(typeString, setString, position) {
  var table = document.createElement("table");
  table.className = "mdl-data-table mdl-js-data-table mdl-shadow--2dp feature-table fade-transition"
  var head = createFeatureTableHeaders(typeString);
  table.appendChild(head);
  var body = createFeatureTableBody(typeString, setString);
  table.appendChild(body);
  var closeButton = createCloseButton();
  closeButton.style.position = "absolute";
  closeButton.style.right = "10px";
  closeButton.style.top = "10px";
  table.appendChild(closeButton);
  closeButton.onclick = function() {
    table.parentElement.removeChild(table);
  }
  HTMLUtils.addClass(table, "hidden-block");
  table.style.zIndex = 999999;
  return table;
}


var createCloseButton = function() {
  var button = createButton("close");
  button.style.color = "#F44336";
  return button;
}

var generateTableFunction = function(tableID, typeString, setString) {
  return function(event) {
    var table = document.getElementById(tableID);
    if (table) {
      table.parentElement.removeChild(table);
    } else {
      table = createFeatureTable(typeString, setString);
      table.id = tableID;
      table.style.position = "absolute";
      table.style.left = "" + (event.clientX + 30)+ "px";
      table.style.top = "" + (event.clientY - 18) +   "px";
      HTMLUtils.removeClass(table, "hidden-block");
      HTMLUtils.addClass(table, "shown-block");
      document.body.appendChild(table);
    }
  }
}

module.exports.generateTableFunction = generateTableFunction;