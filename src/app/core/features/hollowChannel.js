var Feature = require('../feature');

let typeString = "HollowChannel";
let unique = {
    "start": "Point",
    "end": "Point"
};
let heritable = {
    "width": "Float",
    "height": "Float"
};
let defaults = {
    "width": .41 * 1000,
    "height": .1 * 1000
}

Feature.registerFeature(typeString, unique, heritable, defaults);