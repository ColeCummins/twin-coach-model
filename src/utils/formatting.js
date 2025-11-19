
// A dictionary to define formatting rules for specific keys
const FORMATTING_RULES = {
  // Percentages
  advantagePct: { type: 'percent', digits: 1 },
  rentDecreasePct: { type: 'percent', digits: 1 },
  investorDownPaymentPct: { type: 'percent', digits: 0, scale: 100 },
  landValuePct: { type: 'percent', digits: 0, scale: 100 },
  buildingValuePct: { type: 'percent', digits: 0, scale: 100 },
  sellerLoanRate: { type: 'percent', digits: 1, scale: 100 },
  coopBuyoutRate: { type: 'percent', digits: 1, scale: 100 },
  opExVacancy: { type: 'percent', digits: 0, scale: 100 },
  bonusDepreciationRate: { type: 'percent', digits: 0, scale: 100 },
  depreciableAssetPct: { type: 'percent', digits: 0, scale: 100 },
  sellerFederalTaxBracket: { type: 'percent', digits: 0, scale: 100 },
  investorFederalTaxBracket: { type: 'percent', digits: 0, scale: 100 },
  stateIncomeTaxRate: { type: 'percent', digits: 2, scale: 100 },
  federalCapGainsRate: { type: 'percent', digits: 0, scale: 100 },
  charitableDeductionPct: { type: 'percent', digits: 0, scale: 100 },
  coopManagementFeePct: { type: 'percent', digits: 0, scale: 100 },
  cltManagementFeePct: { type: 'percent', digits: 0, scale: 100 },

  // Years
  sellerLoanAmortization: { type: 'number', suffix: ' yrs' },
  coopBuyoutYear: { type: 'number', suffix: ' yrs' },
  coopLoanAmortization: { type: 'number', suffix: ' yrs' },
  sellerHoldingPeriod: { type: 'number', suffix: ' yrs' },
  holdPeriod: { type: 'number', suffix: ' yrs' },

  // Numbers
  numUnits: { type: 'number' },
  sellerPartners: { type: 'number' },
};

export function formatData(key, value) {
  if (value === null || value === undefined) {
    return 'N/A';
  }

  if (typeof value === 'object' && !Array.isArray(value)) {
    if (Object.keys(value).length === 0) {
      return 'N/A';
    }
    // This will format objects like { amount: 100, year: 5 } into "Amount: $100, Year: 5 yrs"
    return Object.entries(value)
      .map(([k, v]) => `${getLabel(k)}: ${formatData(k, v)}`)
      .join(', ');
  }

  if (typeof value !== 'number') {
    if (Array.isArray(value)) return 'See Details';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return value ? value.toString() : 'N/A';
  }

  const rule = FORMATTING_RULES[key];
  if (rule) {
    switch (rule.type) {
      case 'percent':
        const displayValue = rule.scale ? value * rule.scale : value;
        return `${displayValue.toFixed(rule.digits || 0)}%`;
      case 'number':
        return `${value.toFixed(0)}${rule.suffix || ''}`;
    }
  }

  // Default to currency for any other number
  return '$' + value.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export const getLabel = (key) => {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
}
