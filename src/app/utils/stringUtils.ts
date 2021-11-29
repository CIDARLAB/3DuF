// from http://stackoverflow.com/questions/1026069/capitalize-the-first-letter-of-string-in-javascript
export function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
