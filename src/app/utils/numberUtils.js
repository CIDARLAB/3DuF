export function isFloat(n) {
    return n === +n && n !== (n | 0);
}

export function isInteger(n) {
    return n === +n && n === (n | 0);
}

export function isFloatOrInt(n) {
    return isFloat(n) || isInteger(n);
}
