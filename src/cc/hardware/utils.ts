const THETA_MAX = Math.PI / 2;
const THETA_MIN = -THETA_MAX;
export const PWM_MAX = 255;
export const PWM_MIN = 0;

export function deg2rad(degrees: number): number {
    var pi = Math.PI;
    return degrees * (pi / 180);
}

export function PWM2rad(pwm: number): number {
    var deg = ((pwm - PWM_MIN) * (THETA_MAX - THETA_MIN)) / (PWM_MAX - PWM_MIN) + THETA_MIN;
    return deg * (Math.PI / 180);
}

export function displacement(thetaX: number, r: number, b: number, d: number, a: number) {
    return r * Math.cos(deg2rad(thetaX)) + Math.sqrt(Math.pow(b, 2) - Math.pow(r * Math.sin(deg2rad(thetaX)) + d, 2));
}
