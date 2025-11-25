
// ============================================================================
// TWIN COACH ENGINE v41 - DYNAMIC TIMELINES & PRECISE MACRS
// ============================================================================

export const BONUS_SCHEDULE = { 2025: 0.40, 2026: 0.20, 2027: 0.00 };

// --- 1. LOAN ENGINE ---
export const LoanEngine = {
    pmt: (rate, nper, pv) => {
        if (rate === 0) return pv / nper;
        return pv * (rate * Math.pow(1 + rate, nper)) / (Math.pow(1 + rate, nper) - 1);
    },

    // Generate schedule for max potential years, slice later
    generateSchedule: (principal, rate, amortizationYears, maxTrackingYears) => {
        let balance = principal;
        const monthlyRate = rate / 12;
        const totalAmortMonths = amortizationYears * 12;
        const monthlyPay = LoanEngine.pmt(monthlyRate, totalAmortMonths, principal);
        const annualPay = monthlyPay * 12;
        const schedule = [];

        for (let i = 1; i <= maxTrackingYears; i++) {
            const interest = balance * rate;
            const principalPay = annualPay - interest;
            balance -= principalPay;
            schedule.push({ year: i, interest, principal: principalPay, balance, totalPay: annualPay });
        }
        return schedule;
    }
};

// --- 2. DEPRECIATION ENGINE ---
export const DeprEngine = {
    calc: (capexMap, bonusRate, structureBasis, yearsToTrack) => {
        const schedule = [];
        const b5 = capexMap.c5 * bonusRate; const r5 = capexMap.c5 - b5;
        const b7 = capexMap.c7 * bonusRate; const r7 = capexMap.c7 - b7;
        const b15 = capexMap.c15 * bonusRate; const r15 = capexMap.c15 - b15;
        const totalStructure = structureBasis + capexMap.c27;

        // IRS Table A-1 (Half-Year Convention)
        const rates5 = [0.20, 0.32, 0.192, 0.1152, 0.1152, 0.0576];
        const rates7 = [0.1429, 0.2449, 0.1749, 0.1249, 0.0893, 0.0892, 0.0893, 0.0446];
        // Extended 15-year table (IRS Table A-1) for long hold periods
        const rates15 = [
            0.05, 0.095, 0.0855, 0.077, 0.0693, 0.0623, 0.059,
            0.059, 0.0591, 0.059, 0.0591, 0.059, 0.0591, 0.059, 0.0591, 0.0295
        ];

        for(let y=1; y<=yearsToTrack; y++) {
            let total = 0;
            total += (y===1 ? b5 : 0) + (r5 * (rates5[y-1] || 0));
            total += (y===1 ? b7 : 0) + (r7 * (rates7[y-1] || 0));
            total += (y===1 ? b15 : 0) + (r15 * (rates15[y-1] || 0));

            // 27.5 Year Residential Rental (Straight Line, Mid-Month Convention, Month 1 Service)
            // Y1: 3.485% (approx for Jan placement), Y2-28: 3.636%
            if (y === 1) total += totalStructure * 0.03485;
            else if (y <= 28) total += totalStructure * 0.03636;

            schedule.push(total);
        }
        return schedule;
    }
};

// --- 3. TAX ENGINE ---
export const TaxEngine = {
    // Calculates Total State Tax Liability (Dollars)
    calcStateTax: (income, params) => {
        if (income <= 0) return 0;

        // 1. User Override Logic
        if (!params.useOhioTax) {
            return income * params.customStateTaxRate;
        }

        // 2. Default Ohio Logic
        let taxable = income;
        if (params.enableOhioBID) {
            // Business Income Deduction: First $250k is 0%, rest is 3% flat
            taxable = Math.max(0, taxable - 250000);
            return taxable * 0.03;
        }

        // Standard Progressive Brackets (if BID disabled or not business income)
        if (taxable <= 26050) return 0;
        if (taxable <= 100000) return (taxable - 26050) * 0.02765 + 360.69;
        return (taxable - 100000) * 0.035 + 2396.14;
    },

    // Returns Marginal State Tax Rate (Decimal) for Benefit Calculation
    getMarginalStateRate: (params) => {
        if (!params.useOhioTax) return params.customStateTaxRate;
        if (params.enableOhioBID) return 0.03; // Flat rate above 250k
        return 0.035; // Approx top marginal
    },

    calcLocalTax: (income, rate, applies) => {
        if (!applies || income <= 0) return 0;
        return income * rate;
    }
};

// --- 4. RENT SOLVER ---
export const solveRent = (mode, params) => {
    const monthlyOpEx = (params.propTax + params.insurance + params.mgmtFee + params.groundLease + params.coopMaint) / 12;
    const noteAmt = params.bargainSalePrice - params.investorDownPayment;
    // Solve uses the Current Amortization Setting
    const monthlyDebt = LoanEngine.pmt(params.sellerLoanRate/12, params.sellerLoanAmortization*12, noteAmt);
    const effectiveUnits = params.numUnits * (1 - params.vacancyRate);
    const trueCost = monthlyOpEx + monthlyDebt;

    if (mode === 'true_cost') {
        const totalReq = trueCost * (1 + params.trueCostReservePct);
        return Math.ceil(totalReq / effectiveUnits);
    }
    return params.monthlyRent;
};

// --- MAIN ORCHESTRATOR ---
export const calculateModel = (params) => {
    const results = { seller: {}, investor: {}, coop: {}, warnings: [] };
    const exitYear = params.investorExitYear;

    let bonusRate = params.useConservativeBonus ? (BONUS_SCHEDULE[params.placedInServiceYear] || 0) : 1.0;
    const landValue = params.fairMarketValue * params.landRatio;
    const structureBasis = params.bargainSalePrice - landValue;

    const capexMap = { c5: params.capex_5yr, c7: params.capex_7yr, c15: params.capex_15yr, c27: params.capex_27yr };
    const totalCapex = Object.values(capexMap).reduce((a,b)=>a+b,0);

    // 1. Depreciation & Loan Schedules (Run deep enough to cover exit)
    const depSchedule = DeprEngine.calc(capexMap, bonusRate, structureBasis, exitYear);
    const noteAmount = params.bargainSalePrice - params.investorDownPayment;
    const sellerSchedule = LoanEngine.generateSchedule(noteAmount, params.sellerLoanRate, params.sellerLoanAmortization, exitYear);

    // 2. Investor Loop
    const invCashFlows = [];
    invCashFlows.push(-(params.investorDownPayment + totalCapex + 20000)); // Year 0

    let totalTaxSavings = 0;
    let cumNetProfit = 0;
    let annualRent = params.monthlyRent * params.numUnits * 12 * (1 - params.vacancyRate);
    let expenses = params.propTax + params.insurance + params.mgmtFee + params.groundLease + params.coopMaint;

    // Dynamic Loop based on Exit Year
    for(let i=0; i<exitYear; i++) {
        const year = i + 1;
        if (year > 1) {
            expenses = expenses * (1 + params.opexInflationRate);
            if (params.rentInflationEnabled) annualRent = annualRent * (1 + params.opexInflationRate);
        }

        const repairs = (year === 1) ? params.year1Repairs : 0;
        const noi = annualRent - expenses - repairs;
        const debt = sellerSchedule[i];
        const dep = depSchedule[i];
        const taxableIncome = noi - debt.interest - dep;
        const localBizTax = TaxEngine.calcLocalTax(Math.max(0, noi - debt.interest), params.localTaxRate, true);

        let taxSave = 0;
        if (taxableIncome < 0) {
            const isRePro = !params.forcePassiveInvestor;
            const usableLoss = isRePro ? taxableIncome : Math.max(taxableIncome, -params.passiveIncomeToOffset);
            const fedRate = params.investorTaxBracket;

            // Use Unified State Rate Logic
            const stateRate = TaxEngine.getMarginalStateRate(params);
            taxSave = Math.abs(usableLoss) * (fedRate + stateRate);
        }

        totalTaxSavings += taxSave;
        const cf = (noi - debt.totalPay - localBizTax) + taxSave;
        invCashFlows.push(cf);
        cumNetProfit += cf;
    }

    // 3. Exit Event
    const finalNoteBal = sellerSchedule[exitYear-1].balance;
    const kicker = totalCapex * params.equityKickerPct;
    const exitPrice = params.bargainSalePrice;
    const exitProceeds = exitPrice - finalNoteBal - kicker;

    // Add proceeds to the final year cashflow
    invCashFlows[exitYear] += exitProceeds;
    cumNetProfit += exitProceeds;

    results.investor = {
        cashFlows: invCashFlows,
        totalTaxSavings,
        netProfit: cumNetProfit, // Note: This is simple Sum of Flows, not NPV
        roiYear1: Math.round((invCashFlows[1] / -(invCashFlows[0])) * 100) // Rough ROI metric
    };

    // 4. Seller Solvency
    const sellerDepTaken = ((params.sellerOriginalPurchasePrice - params.sellerOriginalLandValue)/27.5) * params.sellerHoldingPeriod;
    const sellerRecapture = sellerDepTaken * params.sellerRecaptureRate;
    const day1Net = params.investorDownPayment - 20000 - sellerRecapture;
    if (day1Net < 25000) results.warnings.push({ type: 'critical', msg: `Seller Day 1 Cash ($${Math.round(day1Net).toLocaleString()}) is low.` });

    let sellerTotal = day1Net;
    sellerSchedule.forEach(y => {
        const fed = y.interest * 0.24;

        // Use Unified State Tax Logic (Dollars)
        const stateTaxTotal = TaxEngine.calcStateTax(y.interest + params.sellerOtherIncome, params);
        const stateTaxBase = TaxEngine.calcStateTax(params.sellerOtherIncome, params);
        const state = stateTaxTotal - stateTaxBase;

        const local = TaxEngine.calcLocalTax(y.interest, params.localTaxRate, params.localTaxAppliesToInterest);
        sellerTotal += (y.totalPay - (fed+state+local));
    });
    sellerTotal += finalNoteBal; // Balloon happens at end of loop

    results.seller = { day1Net, totalCash: sellerTotal, finalBalance: finalNoteBal };

    // 5. Co-op / CLT Exit
    const buyoutPrice = finalNoteBal - kicker;
    const refiRate = params.coopRefiRate;
    const refiPmt = LoanEngine.pmt(refiRate/12, 25*12, buyoutPrice);

    results.coop = {
        buyoutPrice,
        refiMonthly: refiPmt,
        isRefiViable: refiPmt < (annualRent / 12) // Compare against final year rent
    };

    return results;
};
