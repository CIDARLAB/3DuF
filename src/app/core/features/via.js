var Feature = require('../feature');

let typeString = "Via";
let unique = {
    "position": "Point"
};
let heritable = {
    "radius1": "Float",
    "radius2": "Float",
    "height": "Float"
};
let defaults = {
    "radius1": .8 * 1000,
    "radius2": .7 * 1000,
    "height": 1.1 * 1000
}

Feature.registerFeature(typeString, unique, heritable, defaults);