function isFloat(n) {
    return n === +n && n !== (n|0);
}

function isInteger(n) {
    return n === +n && n === (n|0);
}

function isFloatOrInt(n){
	return (isFloat(n) || isInteger(n));
}

module.exports.isFloat = isFloat;
module.exports.isInteger = isInteger;
module.exports.isFloatOrInt = isFloatOrInt;