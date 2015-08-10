var Feature = require('../feature');

let typeString = "Chamber";
let unique = {
    "start": "Point",
    "end": "Point"
};
let heritable = {
    "borderWidth": "Float",
    "height": "Float"
};
let defaults = {
    "borderWidth": .41 * 1000,
    "height": .1 * 1000
}

Feature.registerFeature(typeString, unique, heritable, defaults);