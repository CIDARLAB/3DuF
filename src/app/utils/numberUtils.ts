export function isFloat(n: number): boolean  {
    return n === +n && n !== (n | 0);
}

export function isInteger(n: number): boolean  {
    return n === +n && n === (n | 0);
}

export function isFloatOrInt(n: number): boolean  {
    return isFloat(n) || isInteger(n);
}
