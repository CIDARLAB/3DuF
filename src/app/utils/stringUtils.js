//from http://stackoverflow.com/questions/1026069/capitalize-the-first-letter-of-string-in-javascript
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports.capitalizeFirstLetter = capitalizeFirstLetter;