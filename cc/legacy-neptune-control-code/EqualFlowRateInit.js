/**
 * Created by rebeccawolf on 8/30/16. equal Flow rate
 */

/* Create uL_table

 */
var theta_max = 157.0;
var theta_min = -13.6;
var r = 0.75;
var b = 3;
var d = 0.88;
var a = 0.25;
var PWM_min = 180;
var PWM_max = 500;
var X_min = 2.071;
var mL_max = 6.23;
var X_max = 3.645;
var mL_min = 0;

var mL_range = mL_max - mL_min;

function PWM2rad(PWM) {
    var deg = ((PWM - PWM_min) * (theta_max - theta_min)) / (PWM_max - PWM_min) + theta_min;
    return deg * (Math.PI / 180);
}

var create_uL_table = function(uL_precision) {
    var uL_min = mL_min * 1000; // convert incoming variables from mL to uL
    var uL_range = mL_range * 1000; // convert incoming variables from mL to uL

    // Create PWM_table
    var PWM_table = [];
    for (var i = PWM_min; i <= PWM_max; i++) {
        // From PWM_min value to PWM_max value
        PWM_table.push(i); // Add current PWM value to PWM_table
        var mL_temp = mL_max - (r * Math.cos(PWM2rad(i)) + Math.sqrt(Math.pow(b, 2) - Math.pow(r * Math.sin(PWM2rad(i)) + d, 2)) - X_min) / a; // Calculate mL value with formula of motion
        var uL_temp = Math.round(mL_temp * 10000) / 10; // convert to uL and round to first decimal place
        PWM_table.push(uL_temp); // Add uL value to PWM_table
    }

    // create uL_table
    var uL_table = [];
    // create conversion tables
    var conversion_table = {};
    for (var i = uL_min; i < uL_range + uL_min + uL_precision; i = i + uL_precision) {
        // From uL_min (a given) to uL_min+uL_range! uL_precision added on to allow last uL value to be iterated through. Increase by steps of uL_precision
        // rename i (which is current uL value)
        var uL_current = i; // rename i to something more readable
        uL_current = Math.round(uL_current * 100) / 100; // round to 2 decimal places

        uL_table.push(uL_current); // Add the current uL value to uL_table

        // Find PWM values

        // Add First PWM value, matched easily
        if (i == uL_min) {
            // We know the first value, which can't be found with linear interpolation
            uL_table.push(PWM_table[0]);
            conversion_table[uL_min] = PWM_table[0];
            continue;
        }
        // Linear interpolation to find other PWM values
        // Skip to 2nd value as we already logged the first
        for (var j = 3; j <= PWM_table.length; j = j + 2) {
            // Iterate through uL values in PWM_table (start at 2nd uL value, index 3. Go length of PWM table. Increase by 2 to avoid looking at PWM values)
            if (PWM_table[j] >= uL_current && j % 2 > 0) {
                // If uL value in PWM_table is greater than or equal to our current uL value, find PWM inbetween PWMs in PWM_table
                var PWM_between = PWM_table[j - 3] + (uL_current - PWM_table[j - 2]) * ((PWM_table[j - 1] - PWM_table[j - 3]) / (PWM_table[j] - PWM_table[j - 2])); // Find PWM value via linear interpolation
                var PWM_between = Math.round(PWM_between * 100) / 100; // Round calculated PWM value to 2 decimal places
                uL_table.push(PWM_between); // Add calculated PWM value to table
                conversion_table[uL_current] = PWM_between;
                break;
            }
        }
    }
    uL_table.push(PWM_max); // Add last PWM value, not calculated above with linear interpolation

    return {
        PWM_table: PWM_table, // Return PWM_table
        uL_table: uL_table, // Return uL_table
        conversion_table: conversion_table // Return table to convert PWM to uL
    };
};

/*  Calculate even uL steps

 Discription:
 At any arbitrary position, move to any other position in
 equal fluid dispensing steps over a set amount of time

 Inputs:
 Pump number
 uL_table
 PWM_table
 highest uL difference
 Current uL value
 Goal uL value
 Time to get from current to goal uL value
 Outputs:
 Serial command to Arduino 5x per second in format '00010300' with 0001 being the pump number and 0300 being the PWM value to go to
 */

/*PWM_table
 Array of PWM values, uL values = [
 180 PWM, 0 uL,
 181 PWM, 1.14 uL,
 182 PWM, 2.52 uL
 ]

 uL_table (ordered )
 Array of uL values, PWM values = [
 0 uL, 180 PWM,
 0.5 uL, 180.45 PWM,
 1 uL, 181.2 PWM
 ]
 */

/* Example inputs:
 Pump number 								= 1
 uL_table 									= maping_table
 PWM_table									= PWM_table
 highest uL difference 						= 1.5 uL
 Current uL value 							= 12 uL
 Goal uL value 								= 400 uL
 Time to get from current to goal uL values	= 5 seconds
 */

function even_uL_steps(uL_table, PWM_table, uL_precision, current_uL, goal_uL, time_sec) {
    // Get uL_to_dispense
    var uL_to_dispense = Math.abs(goal_uL - current_uL);

    // Get Total number of steps
    var num_steps = uL_to_dispense / uL_precision;

    // Get number of steps per second and number of seconds per step
    var steps_per_second = num_steps / time_sec; // send to user, not used in program
    var seconds_per_step = time_sec / num_steps; // needed for delay between step

    // Find current place and goal place in uL_table
    var f_found = false; // set to true when the first_uL_index is found to avoid this if statment through rest of loop
    var going_up_uL = goal_uL - current_uL > 0;

    var conversion_table = {};

    if (going_up_uL) {
        // if increasing in uL from current_uL to goal_uL
        for (var i = 0; i < uL_table.length; i = i + 2) {
            // From 0 through length of uL_table in steps of 2, hitting just uL values
            if (uL_table[i] >= current_uL && f_found == false) {
                // If uL value in uL_table is greater than or equal to our current_uL (and the first_uL_index has not been found yet)
                var first_uL_index = i; // log index of where the uL_currently is in uL_table (logs the uL value directly above or equal to it)
                f_found = true; // indicate we found the first uL_index
            }
            if (uL_table[i] >= goal_uL) {
                // If uL value in uL_table is greater than or equal to our goal_uL
                var goal_uL_index = i; // log index of where the uL_goal is in the uL_table (logs the uL value directly above or equal to it)
                break; // Stop for loop, we have the info we need
            }
        }
    } else {
        // if decreasing in uL from current_uL to goal_uL
        for (var i = uL_table.length - 2; i >= 0; i = i - 2) {
            // From length of uL_table through 0 in steps of 2, hitting just uL values
            if (uL_table[i] <= current_uL && f_found == false) {
                // If uL value in uL_table is less than or equal to our current_uL (and the first_uL_index has not been found yet)
                var first_uL_index = i; // log index of where the uL_currently is in uL_table (logs the uL value directly above or equal to it)
                f_found = true; // indicate we found the first uL_index
            }
            if (uL_table[i] <= goal_uL) {
                // If uL value in uL_table is greater than or equal to our goal_uL
                var goal_uL_index = i; // log index of where the uL_goal is in the uL_table (logs the uL value directly above or equal to it)
                break; // Stop for loop, we have the info we need
            }
        }
    }

    ////////////////////////////////////////////////////////////

    // Iterate through uL_table from next uL_index and go specified number of steps
    // MUST DELAY each console.log by the variable 'seconds_per_step'
    var PWM_values = []; // Used to keep track of PWM steps to move, for record keeping and debugging
    if (going_up_uL) {
        // if increasing in uL from current_uL to goal_uL
        for (var i = first_uL_index; i <= goal_uL_index; i = i + 2) {
            // From our current uL index in uL_table to goal index in uL_table
            // if last step
            if (i == goal_uL_index) {
                // If last step
                if (Math.abs(uL_table[i] - goal_uL) < Math.abs(uL_table[i - 2] - goal_uL)) {
                    // if this uL value from uL_table is closer to goal_uL than the previous one
                    var end_PWM = Math.round(uL_table[i + 1]); // used for PWM tracking
                    PWM_values.push(Math.round(uL_table[i + 1])); // Add rounded PWM value to PWM_values list for record keeping and debugging
                    conversion_table[Math.round(uL_table[i + 1])] = uL_table[i];
                    //console.log(end_PWM);                                   //////////// Send pump number and rounded PWM value to arduino
                } else {
                    var end_PWM = Math.round(uL_table[i - 1]); // used for PWM tracking
                }
            }
            // If normal step
            else {
                // Normal indexes
                //console.log(Math.round(uL_table[i+1]));		                /////////// Send pump number and rounded PWM value to arduino
                PWM_values.push(Math.round(uL_table[i + 1])); // Add rounded PWM value to PWM_values list for record keeping and debugging
                conversion_table[Math.round(uL_table[i + 1])] = uL_table[i];
            }
        }
    } else {
        // if decreasing in uL from current_uL to goal_uL
        for (var i = first_uL_index; i >= goal_uL_index; i = i - 2) {
            // From our current uL index in uL_table to goal index in uL_table
            // if last step
            if (i == goal_uL_index) {
                // If last step
                if (Math.abs(uL_table[i] - goal_uL) < Math.abs(uL_table[i + 2] - goal_uL)) {
                    // if this uL value from uL_table is closer to goal_uL than the previous one
                    var end_PWM = Math.round(uL_table[i + 1]); // used for PWM tracking
                    PWM_values.push(Math.round(uL_table[i + 1])); // Add rounded PWM value to PWM_values list for record keeping and debugging
                    conversion_table[Math.round(uL_table[i + 1])] = uL_table[i];
                    //console.log(end_PWM);                                   //////////// Send pump number and rounded PWM value to arduino
                } else {
                    var end_PWM = Math.round(uL_table[i + 3]); // used for PWM tracking
                }
            }
            // If normal step
            else {
                // Normal indexes
                //console.log(Math.round(uL_table[i+1]));                     /////////// Send pump number and rounded PWM value to arduino
                PWM_values.push(Math.round(uL_table[i + 1])); // Add rounded PWM value to PWM_values list for record keeping and debugging
                conversion_table[Math.round(uL_table[i + 1])] = uL_table[i];
            }
        }
    }

    console.log("command conversion table: ");
    console.log(conversion_table);

    return {
        PWM_values: PWM_values, // Return PWM_table
        seconds_per_step: seconds_per_step, // Return uL_table
        conversion_table: conversion_table // Return table to convert PWM to uL
    };
}
