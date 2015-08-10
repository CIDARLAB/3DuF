var Feature = require('../feature');

let typeString = "Port";
let unique = {
    "position": "Point"
};
let heritable = {
    "radius1": "Float",
    "radius2": "Float",
    "height": "Float"
};
let defaults = {
    "radius1": .7 * 1000,
    "radius2": .7 * 1000,
    "height": .1 * 1000
}

Feature.registerFeature(typeString, unique, heritable, defaults);