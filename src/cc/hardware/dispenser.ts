import { deg2rad, PWM2rad, displacement, PWM_MIN, PWM_MAX } from "./utils";

export function initializeSetup(r: number, b: number, d: number, a: number) {
    let thetaXArray = []; // create array of angles to be populated in for loop
    let displacementArray = []; // create array of displacement values
    let increment = 1000; // Set resolution of system; from -90 to 270 degrees, 1000 total intervals is sufficient
    let stepSize = 360 / increment; // Set step size for thetas to start at -90 and end at 270, a total of 360s
    for (let i = 0; i <= increment; i++) {
        // Iterate from 0 to 1000 by one
        let thetaX_i = -90 + stepSize * i; // Calculate theta value from i
        thetaXArray.push(thetaX_i); // Add current theta value to theta array
        displacementArray.push(displacement(thetaX_i, r, b, d, a)); // Add current displacement value to array
    }

    let displacement_min = Math.min.apply(null, displacementArray); // Calculate value by finding minimum of displacement array
    let displacement_max = Math.max.apply(null, displacementArray); // Calculate value by finding maximum of displacement array

    let theta_min = thetaXArray[displacementArray.indexOf(displacement_max)]; // Calculate theta_min by pulling theta value from theta array at the index where the displacement max was found
    let theta_max = thetaXArray[displacementArray.indexOf(displacement_min)]; // Calculate theta_max by pulling theta value from theta array at the index where the displacement min was found
    let X_max = displacement(theta_min, r, b, d, a); // Calculate Xmax by plugging in theta_min to displacement function
    let X_min = displacement(theta_max, r, b, d, a); // Calculate Xmin by plugging in theta_max to displacement function
    let mL_min = 0; // Default value for mLmax, initalized by user in Assembly step. MUST be true
    let mL_max = mL_min + (X_max - X_min) / a; // Calculate mLmax by S
    let uL_min = mL_min * 1000; // convert incoming letiables from mL to uL
    let uL_max = mL_max * 1000;
    let mL_range = mL_max - mL_min;
    let uL_range = mL_range * 1000; // convert incoming letiables from mL to uL

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Create PWM_table and find uL_precision
    let PWM_table = []; // used in this inner function
    let PWM_dic = {}; // passed as output to easily hash
    let uL_precision = 0;

    let not_found = true;
    for (let i = PWM_MIN; i <= PWM_MAX; i++) {
        // From PWM_min value to PWM_max value
        PWM_table.push(i); // Add current PWM value to PWM_table
        let mL_temp = mL_max - (r * Math.cos(PWM2rad(i)) + Math.sqrt(Math.pow(b, 2) - Math.pow(r * Math.sin(PWM2rad(i)) + d, 2)) - X_min) / a; // Calculate mL value with formula of motion
        let uL_temp = Math.round(mL_temp * 100000) / 100; // convert to uL and round to first decimal place
        PWM_table.push(uL_temp); // Add uL value to PWM_table

        PWM_dic[i] = uL_temp;

        // Find uL_precision by finding the max uL difference between PWM values.
        let uL_diff = PWM_table[PWM_table.length - 1] - PWM_table[PWM_table.length - 3];
        let uL_diff_prev = PWM_table[PWM_table.length - 3] - PWM_table[PWM_table.length - 5];
        if (uL_diff < uL_diff_prev && not_found) {
            uL_precision = Math.round(uL_diff_prev * 100) / 100;
            not_found = false;
        }
    }

    // create uL_table
    let uL_table = [];
    let uL_dic = {};
    for (let uLValue = uL_min; uLValue < uL_range + uL_min + uL_precision; uLValue = uLValue + uL_precision) {
        // From uL_min (a given) to uL_min+uL_range! uL_precision added on to allow last uL value to be iterated through. Increase by steps of uL_precision
        // rename i (which is current uL value)
        let uL_current = uLValue; // rename i to something more readable
        uL_current = Math.round(uL_current * 100) / 100; // round to 2 decimal places

        // Add uL to table
        uL_table.push(uL_current); // Add the current uL value to uL_table

        // Find PWM values
        // Add First PWM value, matched easily
        if (uLValue == uL_min) {
            // We know the first value, which can't be found with linear interpolation
            uL_table.push(PWM_table[0]);
            uL_dic[uL_current] = PWM_table[0];
            continue;
        }
        // Linear interpolation to find other PWM values
        // Skip to 2nd value as we already logged the first
        for (let j = 3; j <= PWM_table.length; j = j + 2) {
            // Iterate through uL values in PWM_table (start at 2nd uL value, index 3. Go length of PWM table. Increase by 2 to avoid looking at PWM values)
            if (PWM_table[j] >= uL_current && j % 2 > 0) {
                // If uL value in PWM_table is greater than or equal to our current uL value, find PWM inbetween PWMs in PWM_table
                let PWM_between = PWM_table[j - 3] + (uL_current - PWM_table[j - 2]) * ((PWM_table[j - 1] - PWM_table[j - 3]) / (PWM_table[j] - PWM_table[j - 2])); // Find PWM value via linear interpolation
                let PWM_between = Math.round(PWM_between * 100) / 100; // Round calculated PWM value to 2 decimal places
                uL_table.push(PWM_between); // Add calculated PWM value to table

                uL_dic[uL_current] = PWM_between;
                break;
            }
        }

        if (uLValue >= uL_range + uL_min) {
            uL_table.push(PWM_MAX); // Add last PWM value, not calculated above with linear interpolation
            uL_dic[uL_current] = PWM_MAX;
        }
    }

    return {
        theta_min: theta_min,
        theta_max: theta_max,
        X_min: X_min,
        X_max: X_max,
        uL_min: uL_min,
        uL_max: uL_max,
        PWM_table: PWM_table,
        PWM_dic: PWM_dic,
        uL_table: uL_table,
        uL_dic: uL_dic,
        uL_precision: uL_precision,
        r: r,
        b: b,
        d: d,
        a: a
    };
}

export function even_uL_steps(uL_table, PWM_table, uL_precision, current_uL, goal_uL, time_sec) {
    // Get uL_to_dispense
    let uL_to_dispense = Math.abs(goal_uL - current_uL);

    // Get Total number of steps
    let num_steps = uL_to_dispense / uL_precision;

    // Get number of steps per second and number of seconds per step
    let steps_per_second = num_steps / time_sec; // send to user, not used in program
    let seconds_per_step = time_sec / num_steps; // needed for delay between step

    // Find current place and goal place in uL_table
    let f_found = false; // set to true when the first_uL_index is found to avoid this if statment through rest of loop
    let going_up_uL = goal_uL - current_uL > 0;
    let first_uL_index = 0;
    let goal_uL_index = 0;

    if (going_up_uL) {
        // if increasing in uL from current_uL to goal_uL
        for (let i = 0; i < uL_table.length; i = i + 2) {
            // From 0 through length of uL_table in steps of 2, hitting just uL values
            if (uL_table[i] >= current_uL && f_found == false) {
                // If uL value in uL_table is greater than or equal to our current_uL (and the first_uL_index has not been found yet)
                first_uL_index = i; // log index of where the uL_currently is in uL_table (logs the uL value directly above or equal to it)
                f_found = true; // indicate we found the first uL_index
            }
            if (uL_table[i] >= goal_uL) {
                // If uL value in uL_table is greater than or equal to our goal_uL
                goal_uL_index = i; // log index of where the uL_goal is in the uL_table (logs the uL value directly above or equal to it)
                break; // Stop for loop, we have the info we need
            }
        }
    } else {
        // if decreasing in uL from current_uL to goal_uL
        for (let i = uL_table.length - 2; i >= 0; i = i - 2) {
            // From length of uL_table through 0 in steps of 2, hitting just uL values
            if (uL_table[i] <= current_uL && f_found == false) {
                // If uL value in uL_table is less than or equal to our current_uL (and the first_uL_index has not been found yet)
                first_uL_index = i; // log index of where the uL_currently is in uL_table (logs the uL value directly above or equal to it)
                f_found = true; // indicate we found the first uL_index
            }
            if (uL_table[i] <= goal_uL) {
                // If uL value in uL_table is greater than or equal to our goal_uL
                goal_uL_index = i; // log index of where the uL_goal is in the uL_table (logs the uL value directly above or equal to it)
                break; // Stop for loop, we have the info we need
            }
        }
    }

    ////////////////////////////////////////////////////////////

    // Iterate through uL_table from next uL_index and go specified number of steps
    // MUST DELAY each console.log by the letiable 'seconds_per_step'
    let PWM_values = []; // Used to keep track of PWM steps to move, for record keeping and debugging
    if (going_up_uL) {
        // if increasing in uL from current_uL to goal_uL
        for (let i = first_uL_index; i <= goal_uL_index; i = i + 2) {
            // From our current uL index in uL_table to goal index in uL_table
            // if last step
            if (i == goal_uL_index) {
                // If last step
                if (Math.abs(uL_table[i] - goal_uL) < Math.abs(uL_table[i - 2] - goal_uL)) {
                    // if this uL value from uL_table is closer to goal_uL than the previous one
                    let end_PWM = Math.round(uL_table[i + 1]); // used for PWM tracking
                    PWM_values.push(Math.round(uL_table[i + 1])); // Add rounded PWM value to PWM_values list for record keeping and debugging
                    //console.log(end_PWM);                                   //////////// Send pump number and rounded PWM value to arduino
                } else {
                    let end_PWM = Math.round(uL_table[i - 1]); // used for PWM tracking
                }
            }
            // If normal step
            else {
                // Normal indexes
                //console.log(Math.round(uL_table[i+1]));                       /////////// Send pump number and rounded PWM value to arduino
                PWM_values.push(Math.round(uL_table[i + 1])); // Add rounded PWM value to PWM_values list for record keeping and debugging
            }
        }
    } else {
        // if decreasing in uL from current_uL to goal_uL
        for (let i = first_uL_index; i >= goal_uL_index; i = i - 2) {
            // From our current uL index in uL_table to goal index in uL_table
            // if last step
            if (i == goal_uL_index) {
                // If last step
                if (Math.abs(uL_table[i] - goal_uL) < Math.abs(uL_table[i + 2] - goal_uL)) {
                    // if this uL value from uL_table is closer to goal_uL than the previous one
                    let end_PWM = Math.round(uL_table[i + 1]); // used for PWM tracking
                    PWM_values.push(Math.round(uL_table[i + 1])); // Add rounded PWM value to PWM_values list for record keeping and debugging
                    console.log(end_PWM); //////////// Send pump number and rounded PWM value to arduino
                } else {
                    let end_PWM = Math.round(uL_table[i + 3]); // used for PWM tracking
                }
            }
            // If normal step
            else {
                // Normal indexes
                console.log(Math.round(uL_table[i + 1])); /////////// Send pump number and rounded PWM value to arduino
                PWM_values.push(Math.round(uL_table[i + 1])); // Add rounded PWM value to PWM_values list for record keeping and debugging
            }
        }
    }

    return {
        PWM_values: PWM_values,
        seconds_per_step: seconds_per_step,
        steps_per_second: steps_per_second
    };
}
