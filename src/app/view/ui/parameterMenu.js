import * as HTMLUtils from "../../utils/htmlUtils";
import Feature from "../../core/feature";

import Registry from "../../core/registry";
import { FloatValue, BooleanValue, StringValue } from "../../core/parameters";
import * as FeatureSets from "../../featureSets";

const createSlider = function (min, max, step, start, id) {
    const div = document.createElement("div");
    const p = document.createElement("p");
    p.setAttribute("style", "min-width: 240px");
    const slider = document.createElement("input");
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

const createButton = function (iconString) {
    const button = document.createElement("button");
    button.className = "mdl-button mdl-js-button mdl-button--icon";
    const icon = document.createElement("i");
    icon.className = "material-icons";
    icon.innerHTML = iconString;
    button.appendChild(icon);
    componentHandler.upgradeElement(button, "MaterialButton");
    return button;
};

const createValueField = function (start, id, unittext = "") {
    const div = document.createElement("div");
    const error = document.createElement("span");
    const span = document.createElement("span");
    span.innerHTML = unittext;
    span.style.fontSize = "14px";
    error.className = "mdl-textfield__error";
    error.innerHTML = "Digits only";
    div.className = "mdl-textfield mdl-js-textfield";
    const field = document.createElement("input");
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

const createTableElement = function (child) {
    const td = document.createElement("td");
    td.appendChild(child);
    return td;
};

const createCheckbox = function (checked, id) {
    const div = document.createElement("div");
    const label = document.createElement("label");
    label.className = "mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect";
    label.setAttribute("for", id);
    const input = document.createElement("input");
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

const createSpan = function (value, id) {
    const div = document.createElement("div");
    const span = document.createElement("span");
    span.innerHTML = value;
    span.setAttribute("id", id);
    span.setAttribute("style", "font-size: 16px;");
    div.setAttribute("style", "margin-left: none; margin-right: auto; display: block;width:24px;");
    div.appendChild(span);
    return div;
};

const createTableRow = function (one, two, three) {
    const tr = document.createElement("tr");
    one.style.borderBottom = "none";
    tr.appendChild(one);
    tr.appendChild(two);
    tr.appendChild(three);
    return tr;
};

const generateUpdateFunction = function (sourceID, targetID, typeString, setString, paramString) {
    return function () {
        const source = document.getElementById(sourceID);
        const target = document.getElementById(targetID);
        let param;
        if (!source.value || source.value == "") {
            return;
        }
        try {
            param = new FloatValue(parseFloat(source.value));
        } catch (err) {
            console.log("Invalid Float value.");
            return;
        }
        target.value = String(param.getValue());
        Registry.viewManager.adjustParams(typeString, setString, paramString, param.getValue());
    };
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
const generateCheckFunction = function (sourceID, targetID, typeString, setString, paramString) {
    return function () {
        const source = document.getElementById(sourceID);
        const target = document.getElementById(targetID);
        let param;
        let param_to_pass;
        try {
            param = new BooleanValue(source.checked);
        } catch (err) {
            console.log("Invalid Boolean value.");
            return;
        }
        if (param.getValue()) {
            target.innerHTML = "V";
            param_to_pass = new StringValue("V");
        } else {
            target.innerHTML = "H";
            param_to_pass = new StringValue("H");
        }
        Registry.viewManager.adjustParams(typeString, setString, paramString, param_to_pass.getValue());
    };
};

const generateCheckFunctionDir = function (sourceID, targetID, typeString, setString, paramString) {
    return function () {
        const source = document.getElementById(sourceID);
        const target = document.getElementById(targetID);
        let param;
        let param_to_pass;
        try {
            param = new BooleanValue(source.checked);
        } catch (err) {
            console.log("Invalid Boolean value.");
            return;
        }
        if (param.getValue()) {
            target.innerHTML = "IN";
            param_to_pass = new StringValue("IN");
        } else {
            target.innerHTML = "OUT";
            param_to_pass = new StringValue("OUT");
        }
        Registry.viewManager.adjustParams(typeString, setString, paramString, param_to_pass.getValue());
    };
};

const createSliderRow = function (featureID, typeString, setString, key) {
    const definition = FeatureSets.getDefinition(typeString, setString);
    const min = definition.minimum[key];
    const max = definition.maximum[key];
    const value = Feature.getDefaultsForType(typeString, setString)[key];
    const step = 10;
    const titleID = featureID + "_" + key + "_title";
    const sliderID = featureID + "_" + key + "_slider";
    const fieldID = featureID + "_" + key + "_value";
    const title = createSpan(key, titleID);
    const titleContainer = createTableElement(title);
    titleContainer.style.borderBottom = "none";
    const slider = createSlider(min, max, step, value, sliderID);
    const sliderContainer = createTableElement(slider);
    sliderContainer.setAttribute("style", "padding-left: 0px; padding-right: 0px");
    const unittext = definition.units[key];
    const field = createValueField(value, fieldID, unittext);
    const fieldContainer = createTableElement(field);
    const row = createTableRow(sliderContainer, titleContainer, fieldContainer);
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

const createDefaultsRow = function (featureID, typeString, setString, key) {
    const title = createSpan(key);
    const buttonID = "defaults_button";
    const spanID = "defaults_span";
    const value = Feature.getDefaultsForType(typeString, setString)[key];
};

const createCheckboxRow = function (featureID, typeString, setString, key) {
    const title = createSpan(key);
    const checkID = featureID + "_" + key + "_checkbox";
    const spanID = featureID + "_" + key + "_span";
    const value = Feature.getDefaultsForType(typeString, setString)[key];
    const checkBox = createCheckbox(value, checkID);
    let spanValue;
    if (value == "V") spanValue = "V";
    else spanValue = "H";
    const span = createSpan(spanValue, spanID);
    const titleContainer = createTableElement(title);
    const checkContainer = createTableElement(checkBox);
    const spanContainer = createTableElement(span);
    const row = createTableRow(checkContainer, titleContainer, spanContainer);
    checkBox.onchange = generateCheckFunction(checkID, spanID, typeString, setString, key);
    return row;
};

const createInOutRow = function (featureID, typeString, setString, key) {
    const title = createSpan(key);
    const checkID = featureID + "_" + key + "_checkbox";
    const spanID = featureID + "_" + key + "_span";
    const value = Feature.getDefaultsForType(typeString, setString)[key];
    const checkBox = createCheckbox(value, checkID);
    const spanValue = value;
    // if (value == "IN") spanValue = "IN";
    // else spanValue = "OUT";
    const span = createSpan(spanValue, spanID);
    const titleContainer = createTableElement(title);
    const checkContainer = createTableElement(checkBox);
    const spanContainer = createTableElement(span);
    const row = createTableRow(checkContainer, titleContainer, spanContainer);
    checkBox.onchange = generateCheckFunctionDir(checkID, spanID, typeString, setString, key);
    return row;
};

const createFeatureTableRows = function (typeString, setString) {
    const def = FeatureSets.getDefinition(typeString, setString);
    const heritable = def.heritable;
    const id = "fake_ID";
    const rows = [];
    for (const key in heritable) {
        let row;
        const type = heritable[key];
        if (type == "Float" || type == "Integer") {
            row = createSliderRow(id, typeString, setString, key);
        } else if (key == "orientation") {
            row = createCheckboxRow(id, typeString, setString, key);
        } else if (key == "direction") {
            row = createInOutRow(id, typeString, setString, key);
        }
        rows.push(row);
    }
    return rows;
};

const createFeatureTableHeaders = function (typeString) {
    const thead = document.createElement("thead");
    const tr = document.createElement("tr");
    thead.appendChild(tr);
    const param = document.createElement("th");
    param.className = "mdl-data-table__cell--non-numeric";
    param.innerHTML = "Parameter &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;";
    const value = document.createElement("th");
    value.className = "mdl-data-table__cell--non-numeric";
    value.innerHTML = "Value";
    const type = document.createElement("th");
    type.className = "mdl-data-table__cell--non-numeric";
    type.innerHTML = "Parameters";
    type.style.fontSize = "18px";
    type.style.color = "#000000";
    // type.style.right = "35px";
    tr.appendChild(type);
    tr.appendChild(param);
    tr.appendChild(value);
    return thead;
};

const createFeatureTableBody = function (typeString, setString) {
    const body = document.createElement("tbody");
    body.setAttribute("id", "featureTable");
    const rows = createFeatureTableRows(typeString, setString);
    for (let i = 0; i < rows.length; i++) {
        body.appendChild(rows[i]);
    }
    return body;
};

export function createFeatureTable(typeString, setString, position) {
    const table = document.createElement("table");
    table.className = "mdl-data-table mdl-js-data-table mdl-shadow--2dp feature-table fade-transition";
    const head = createFeatureTableHeaders(typeString);
    table.appendChild(head);
    const body = createFeatureTableBody(typeString, setString);
    table.appendChild(body);
    const closeButton = createCloseButton();
    closeButton.style.position = "absolute";
    closeButton.style.right = "0px";
    closeButton.style.top = "0px";
    // table.appendChild(closeButton);
    closeButton.onclick = function () {
        table.parentElement.removeChild(table);
    };
    HTMLUtils.addClass(table, "hidden-block");
    table.style.zIndex = 999999;
    return table;
}

var createCloseButton = function () {
    const button = createButton("close");
    button.style.color = "#313131";
    return button;
};

export function generateTableFunction(tableID, typeString, setString, isTranslucent) {
    return function (event) {
        let table = document.getElementById(tableID);
        if (table) {
            table.parentElement.removeChild(table);
        } else {
            table = createFeatureTable(typeString, setString);
            table.id = tableID;
            if (isTranslucent) {
                table.style.opacity = 0.7;
            }
            table.style.position = "absolute";
            table.style.left = String(event.clientX + 30) + "px";
            table.style.top = String(event.clientY - 20) + "px";
            HTMLUtils.removeClass(table, "hidden-block");
            HTMLUtils.addClass(table, "shown-block");
            document.body.appendChild(table);
        }
    };
}

export function revertToDefaultParams(table, typeString, setString) {
    const def = FeatureSets.getDefinition(typeString, setString);
    const heritable = def.heritable;
    const defaults = def.defaults;

    for (const key in heritable) {
        const type = heritable[key];

        if (type == "Float" || type == "Integer") {
            const inputID = "fake_ID_" + key + "_slider";
            // Modify the text in the input element
            const element = document.querySelector("#" + inputID);
            element.MaterialSlider.change(defaults[key]);
            Registry.viewManager.adjustParams(typeString, setString, key, defaults[key]);
        } else if (key == "orientation") {
            // TODO - Change the checkbox
            const inputID = "fake_ID_" + key + "_checkbox";
            const element = document.querySelector("#" + inputID);
            const materialelement = table.querySelector(".mdl-js-checkbox");
            const spanelement = table.querySelector("#fake_ID_" + key + "_span");
            if (defaults[key] == "V") {
                element.checked = true;
                materialelement.MaterialCheckbox.check();
                spanelement.textContent = defaults[key];
            } else {
                element.checked = false;
                materialelement.MaterialCheckbox.uncheck();
                spanelement.textContent = defaults[key];
            }
            Registry.viewManager.adjustParams(typeString, setString, key, defaults[key]);
        } else if (key == "direction") {
            // TODO Change the Checkbox
            const inputID = "fake_ID_" + key + "_checkbox";
            const materialelement = table.querySelector(".mdl-js-checkbox");
            const element = document.querySelector("#" + inputID);
            const spanelement = table.querySelector("#fake_ID_" + key + "_span");
            if (defaults[key] == "IN") {
                element.checked = true;
                materialelement.MaterialCheckbox.check();
                spanelement.textContent = defaults[key];
            } else {
                element.checked = false;
                materialelement.MaterialCheckbox.uncheck();
                spanelement.textContent = defaults[key];
            }
            Registry.viewManager.adjustParams(typeString, setString, key, defaults[key]);
        }
    }
}
