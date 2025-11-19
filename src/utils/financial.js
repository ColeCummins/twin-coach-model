/**
 * @fileoverview A collection of financial calculation helper functions.
 */

/**
 * Calculates the Net Present Value (NPV) for a series of cash flows.
 * @param {number} rate The discount rate per period (as a decimal).
 * @param {number[]} values A series of cash flows.
 * @returns {number} The calculated NPV.
 */
export function npv(rate, values) {
    if (!Array.isArray(values)) return 0;
    return values.reduce((acc, val, i) => acc + val / Math.pow(1 + rate, i + 1), 0);
}

/**
 * Calculates the Internal Rate of Return (IRR) for a series of cash flows using the Newton-Raphson method.
 * @param {number[]} values An array of cash flows (initial investment should be negative).
 * @returns {number} The IRR as a decimal, or NaN if a solution isn't found.
 */
export function irr(values) {
    if (!Array.isArray(values) || values.length === 0) {
        return NaN;
    }

    const tolerance = 1e-7;
    const maxIterations = 100;
    let guess = 0.1;

    for (let i = 0; i < maxIterations; i++) {
        const npvValue = values.reduce((acc, val, j) => acc + val / Math.pow(1 + guess, j), 0);
        const derivative = values.reduce((acc, val, j) => acc - j * val / Math.pow(1 + guess, j + 1), 0);

        if (Math.abs(derivative) < tolerance) {
            break; // Avoid division by zero
        }

        const newGuess = guess - npvValue / derivative;
        if (Math.abs(newGuess - guess) < tolerance) {
            return newGuess;
        }
        guess = newGuess;
    }

    return NaN; // Failed to converge
}

/**
 * Calculates the payment for a loan based on constant payments and a constant interest rate.
 * @param {number} rate Interest rate per period.
 * @param {number} nper Total number of payment periods in an annuity.
 * @param {number} pv The present value, or the total amount that a series of future payments is worth now.
 * @returns {number} The loan payment.
 */
export function pmt(rate, nper, pv) {
    if (rate === 0) {
        return -pv / nper;
    }
    const pvif = Math.pow(1 + rate, nper);
    return (rate / (pvif - 1)) * -(pv * pvif);
}
