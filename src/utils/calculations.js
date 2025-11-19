/**
 * @fileoverview A new, dedicated calculation engine for comparing the Proposed Model vs. Conventional Sale.
 */

import { pmt } from './financial';

// Use the previously determined optimal parameters for the Proposed Model.
const OPTIMAL_PARAMS = {
    buildingSalePrice: 1550000, 
    investorDownPayment: 350000,
    sellerLoanTermYrs: 20,
    sellerLoanRate: 0.075, 
    // Static assumptions
    sellerOriginalPurchasePrice: 600000, sellerOriginalLandValue: 200000, sellerPartners: 2,
};

// Tax rate for seller on ordinary income (e.g., savings account interest, loan interest received)
const SELLER_ORDINARY_INCOME_TAX_RATE = 0.28;

function calculateLowIncomeCapitalGainsTax(gain) {
    if (gain <= 0) return 0;
    return gain * 0.15; // Simplified for this model
}

/**
 * The new, definitive comparison engine.
 */
export function calculateComparisonModel({ annualWithdrawal, savingsRate }) {
    const conventional = [];
    const proposed = [];

    // --- Scenario 1: Conventional Sale ---
    const CONVENTIONAL_NET_PROCEEDS = 1711216; // From peer-review-package.md
    let currentBalance = CONVENTIONAL_NET_PROCEEDS;
    
    conventional.push({ 
        year: 0, 
        cumulativeValue: currentBalance, 
        details: `Initial Net Proceeds: ${currentBalance.toLocaleString()}` 
    });

    for (let year = 1; year <= 7; year++) {
        const interestEarned = currentBalance * savingsRate;
        const taxOnInterest = interestEarned * SELLER_ORDINARY_INCOME_TAX_RATE;
        currentBalance += interestEarned - taxOnInterest - annualWithdrawal;
        conventional.push({ 
            year, 
            cumulativeValue: currentBalance, 
            details: `+${interestEarned.toLocaleString()} Interest, -${taxOnInterest.toLocaleString()} Tax, -${annualWithdrawal.toLocaleString()} Withdraw`
        });
    }

    // --- Scenario 2: Proposed Model (using our optimal parameters) ---
    const sellerGainOnBuilding = OPTIMAL_PARAMS.buildingSalePrice - (OPTIMAL_PARAMS.sellerOriginalPurchasePrice - OPTIMAL_PARAMS.sellerOriginalLandValue);
    const taxOnSale = calculateLowIncomeCapitalGainsTax(sellerGainOnBuilding / OPTIMAL_PARAMS.sellerPartners) * OPTIMAL_PARAMS.sellerPartners;
    const day1Net = OPTIMAL_PARAMS.investorDownPayment - taxOnSale;
    
    let cumulativeProposedValue = day1Net;
    proposed.push({ 
        year: 0, 
        cumulativeValue: cumulativeProposedValue, 
        details: `Down Payment: ${OPTIMAL_PARAMS.investorDownPayment.toLocaleString()}, -${taxOnSale.toLocaleString()} Tax`
    });

    const sellerLoanPrincipal = OPTIMAL_PARAMS.buildingSalePrice - OPTIMAL_PARAMS.investorDownPayment;
    const monthlyPayment = pmt(OPTIMAL_PARAMS.sellerLoanRate / 12, OPTIMAL_PARAMS.sellerLoanTermYrs * 12, -sellerLoanPrincipal);
    let loanBalance = sellerLoanPrincipal;

    for (let year = 1; year <= 7; year++) {
        let annualInterestReceived = 0;
        let annualPrincipalReceived = 0;
        for (let month = 0; month < 12; month++) {
            const interestPortion = loanBalance * (OPTIMAL_PARAMS.sellerLoanRate / 12);
            const principalPortion = monthlyPayment - interestPortion;
            annualInterestReceived += interestPortion;
            annualPrincipalReceived += principalPortion;
            loanBalance -= principalPortion;
        }
        
        const taxOnInterestReceived = annualInterestReceived * SELLER_ORDINARY_INCOME_TAX_RATE;
        const netCashFromLoan = (annualInterestReceived + annualPrincipalReceived) - taxOnInterestReceived;
        
        if (year === 7) {
            const buyoutPrincipal = loanBalance;
            cumulativeProposedValue += netCashFromLoan + buyoutPrincipal;

            proposed.push({
                year,
                cumulativeValue: cumulativeProposedValue,
                details: `+${(annualInterestReceived + annualPrincipalReceived).toLocaleString()} P&I, -${taxOnInterestReceived.toLocaleString()} Tax, +${buyoutPrincipal.toLocaleString()} Buyout`
            });
        } else {
            cumulativeProposedValue += netCashFromLoan;
            proposed.push({ 
                year, 
                cumulativeValue: cumulativeProposedValue,
                details: `+${(annualInterestReceived + annualPrincipalReceived).toLocaleString()} P&I, -${taxOnInterestReceived.toLocaleString()} Tax`
            });
        }
    }

    return { conventional, proposed };
}