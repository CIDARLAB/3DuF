var Feature = require('../feature');

let typeString = "CircleValve";
let unique = {
    "position": "Point"
};
let heritable = {
    "radius1": "Float",
    "radius2": "Float",
    "height": "Float"
};
let defaults = {
    "radius1": 1.4 * 1000,
    "radius2": 1.2 * 1000,
    "height": .8 * 1000
}

Feature.registerFeature(typeString, unique, heritable, defaults);