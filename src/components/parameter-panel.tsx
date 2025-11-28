import { useState, useEffect, useCallback } from "react";
import {
  Building2,
  DollarSign,
  Wallet,
  Calculator,
  TrendingUp,
  Home,
  Users,
  ChevronDown,
  Info,
  Briefcase
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { SimulationParams } from "@shared/schema";

interface ParameterPanelProps {
  params: SimulationParams;
  onChange: (key: keyof SimulationParams, value: number | boolean) => void;
}

function useDebouncedValue<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

function ParameterInput({
  label,
  value,
  onChange,
  type = "currency",
  min,
  max,
  step = 1,
  tooltip,
  testId,
  debounce = false,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  type?: "currency" | "percent" | "number" | "year";
  min?: number;
  max?: number;
  step?: number;
  tooltip?: string;
  testId: string;
  debounce?: boolean;
}) {
  const [localValue, setLocalValue] = useState<string>("");
  const [isFocused, setIsFocused] = useState(false);

  const formatDisplayValue = useCallback((v: number) => {
    if (type === "currency") return v.toLocaleString();
    if (type === "percent") return (v * 100).toFixed(1);
    return v.toString();
  }, [type]);

  const parseInputValue = useCallback((v: string): number => {
    const cleaned = v.replace(/[^0-9.-]/g, "");
    const parsed = parseFloat(cleaned) || 0;
    if (type === "percent") return parsed / 100;
    return parsed;
  }, [type]);

  useEffect(() => {
    if (!isFocused) {
      setLocalValue(formatDisplayValue(value));
    }
  }, [value, isFocused, formatDisplayValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    if (!debounce) {
      onChange(parseInputValue(newValue));
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    const parsed = parseInputValue(localValue);
    onChange(parsed);
    setLocalValue(formatDisplayValue(parsed));
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <Label className="text-xs font-medium text-muted-foreground">
          {label}
        </Label>
        {tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-3 w-3 text-muted-foreground/50 cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-[200px] text-xs">
              {tooltip}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      <div className="relative">
        {type === "currency" && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            $
          </span>
        )}
        <Input
          type="text"
          value={localValue}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          className={`h-9 text-sm tabular-nums ${type === "currency" ? "pl-6" : ""} ${type === "percent" ? "pr-6" : ""}`}
          data-testid={testId}
        />
        {type === "percent" && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            %
          </span>
        )}
      </div>
    </div>
  );
}

function ParameterSlider({
  label,
  value,
  onChange,
  min,
  max,
  step = 0.01,
  format = "percent",
  tooltip,
  testId,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  format?: "percent" | "number";
  tooltip?: string;
  testId: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Label className="text-xs font-medium text-muted-foreground">
            {label}
          </Label>
          {tooltip && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3 w-3 text-muted-foreground/50 cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-[200px] text-xs">
                {tooltip}
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        <span className="text-sm font-medium tabular-nums">
          {format === "percent" ? `${(value * 100).toFixed(1)}%` : value}
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
        className="cursor-pointer"
        data-testid={testId}
      />
    </div>
  );
}

function ParameterSwitch({
  label,
  checked,
  onChange,
  tooltip,
  testId,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  tooltip?: string;
  testId: string;
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center gap-1.5">
        <Label className="text-xs font-medium text-muted-foreground">
          {label}
        </Label>
        {tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-3 w-3 text-muted-foreground/50 cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-[200px] text-xs">
              {tooltip}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        data-testid={testId}
      />
    </div>
  );
}

export function ParameterPanel({ params, onChange }: ParameterPanelProps) {
  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-2">
        <Accordion
          type="multiple"
          defaultValue={["asset", "financing", "operations", "taxation", "exit", "seller"]}
          className="space-y-2"
        >
          <AccordionItem value="asset" className="border rounded-lg px-4 bg-card">
            <AccordionTrigger className="hover:no-underline py-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <Building2 className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-semibold">Asset Valuation</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <ParameterInput
                  label="Fair Market Value"
                  value={params.fairMarketValue}
                  onChange={(v) => onChange("fairMarketValue", v)}
                  type="currency"
                  tooltip="Appraised market value of the property"
                  testId="input-fmv"
                  debounce
                />
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium flex items-center gap-1.5">
                    Bargain Sale Price
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <p className="text-xs">Calculated: FMV - (FMV × Land Donation %)</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <div className="h-9 px-3 rounded-md bg-muted/50 border flex items-center font-mono text-sm tabular-nums" data-testid="display-bargain-sale-price">
                    ${(params.fairMarketValue - (params.fairMarketValue * params.landRatio)).toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <ParameterInput
                  label="Number of Units"
                  value={params.numUnits}
                  onChange={(v) => onChange("numUnits", v)}
                  type="number"
                  testId="input-units"
                />
                <ParameterSlider
                  label="Land Ratio / Donation %"
                  value={params.landRatio}
                  onChange={(v) => onChange("landRatio", v)}
                  min={0.05}
                  max={0.50}
                  step={0.01}
                  tooltip="Land as % of FMV (non-depreciable); also the donation percentage"
                  testId="slider-land-ratio"
                />
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs font-medium text-muted-foreground mb-3">Capital Expenditures</p>
                <div className="grid grid-cols-2 gap-3">
                  <ParameterInput
                    label="5-Year Property"
                    value={params.capex_5yr}
                    onChange={(v) => onChange("capex_5yr", v)}
                    type="currency"
                    tooltip="Appliances, carpets, etc."
                    testId="input-capex-5"
                    debounce
                  />
                  <ParameterInput
                    label="7-Year Property"
                    value={params.capex_7yr}
                    onChange={(v) => onChange("capex_7yr", v)}
                    type="currency"
                    tooltip="Furniture, fixtures"
                    testId="input-capex-7"
                    debounce
                  />
                  <ParameterInput
                    label="15-Year Property"
                    value={params.capex_15yr}
                    onChange={(v) => onChange("capex_15yr", v)}
                    type="currency"
                    tooltip="Land improvements, paving"
                    testId="input-capex-15"
                    debounce
                  />
                  <ParameterInput
                    label="27.5-Year Property"
                    value={params.capex_27yr}
                    onChange={(v) => onChange("capex_27yr", v)}
                    type="currency"
                    tooltip="Roof, HVAC, structural"
                    testId="input-capex-27"
                    debounce
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="financing" className="border rounded-lg px-4 bg-card">
            <AccordionTrigger className="hover:no-underline py-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-emerald-500/10">
                  <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="text-sm font-semibold">Financing Structure</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-4 space-y-4">
              <ParameterInput
                label="Investor Down Payment"
                value={params.investorDownPayment}
                onChange={(v) => onChange("investorDownPayment", v)}
                type="currency"
                testId="input-down-payment"
                debounce
              />
              <div className="grid grid-cols-2 gap-3">
                <ParameterSlider
                  label="Seller Loan Rate"
                  value={params.sellerLoanRate}
                  onChange={(v) => onChange("sellerLoanRate", v)}
                  min={0.03}
                  max={0.12}
                  step={0.0025}
                  tooltip="Annual interest rate on seller carry financing"
                  testId="slider-loan-rate"
                />
                <ParameterInput
                  label="Amortization (Years)"
                  value={params.sellerLoanAmortization}
                  onChange={(v) => onChange("sellerLoanAmortization", v)}
                  type="number"
                  testId="input-amortization"
                />
              </div>
              <ParameterInput
                label="Interest-Only Period (Years)"
                value={params.interestOnlyPeriod}
                onChange={(v) => onChange("interestOnlyPeriod", v)}
                type="number"
                tooltip="Optional period with interest-only payments"
                testId="input-io-period"
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="operations" className="border rounded-lg px-4 bg-card">
            <AccordionTrigger className="hover:no-underline py-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-amber-500/10">
                  <Home className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <span className="text-sm font-semibold">Operations</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-4 space-y-4">
              <ParameterSwitch
                label="Calculate Rent from Costs"
                checked={params.calculateRentFromCosts}
                onChange={(v) => onChange("calculateRentFromCosts", v)}
                tooltip="Rent = Debt Service + Expenses + Reserves (income-neutral for investor)"
                testId="switch-rent-from-costs"
              />
              {!params.calculateRentFromCosts && (
                <div className="grid grid-cols-2 gap-3">
                  <ParameterInput
                    label="Monthly Rent / Unit"
                    value={params.monthlyRent}
                    onChange={(v) => onChange("monthlyRent", v)}
                    type="currency"
                    testId="input-rent"
                    debounce
                  />
                  <ParameterSlider
                    label="Vacancy Rate"
                    value={params.vacancyRate}
                    onChange={(v) => onChange("vacancyRate", v)}
                    min={0}
                    max={0.15}
                    step={0.01}
                    testId="slider-vacancy"
                  />
                </div>
              )}
              {params.calculateRentFromCosts && (
                <ParameterSlider
                  label="True Cost Reserve"
                  value={params.trueCostReservePct}
                  onChange={(v) => onChange("trueCostReservePct", v)}
                  min={0.05}
                  max={0.25}
                  step={0.01}
                  tooltip="Additional reserve buffer on carrying costs"
                  testId="slider-reserve-pct"
                />
              )}
              <ParameterSwitch
                label="Enable Rent Inflation"
                checked={params.rentInflationEnabled}
                onChange={(v) => onChange("rentInflationEnabled", v)}
                testId="switch-rent-inflation"
              />
              {params.rentInflationEnabled && (
                <ParameterSlider
                  label="Rent Inflation Rate"
                  value={params.rentInflationRate}
                  onChange={(v) => onChange("rentInflationRate", v)}
                  min={0}
                  max={0.06}
                  step={0.001}
                  tooltip="Annual rent increase (more granular for precise modeling)"
                  testId="slider-rent-inflation-rate"
                />
              )}
              <div className="pt-2 border-t">
                <p className="text-xs font-medium text-muted-foreground mb-3">Annual Expenses (Year 1)</p>
                <div className="grid grid-cols-2 gap-3">
                  <ParameterInput
                    label="Property Tax"
                    value={params.propTax}
                    onChange={(v) => onChange("propTax", v)}
                    type="currency"
                    testId="input-prop-tax"
                    debounce
                  />
                  <ParameterInput
                    label="Insurance"
                    value={params.insurance}
                    onChange={(v) => onChange("insurance", v)}
                    type="currency"
                    tooltip="Master policy; consider distributed individual policies"
                    testId="input-insurance"
                    debounce
                  />
                  <ParameterInput
                    label="CLT Ground Lease Fee"
                    value={params.cltGroundLeaseFee}
                    onChange={(v) => onChange("cltGroundLeaseFee", v)}
                    type="currency"
                    tooltip="Revenue for CLT"
                    testId="input-clt-fee"
                    debounce
                  />
                  <ParameterInput
                    label="Prof. Management Fee"
                    value={params.professionalManagementFee}
                    onChange={(v) => onChange("professionalManagementFee", v)}
                    type="currency"
                    tooltip="Revenue for Co-op/CLT partnership"
                    testId="input-mgmt-fee"
                    debounce
                  />
                  <ParameterInput
                    label="Year 1 Repairs"
                    value={params.year1Repairs}
                    onChange={(v) => onChange("year1Repairs", v)}
                    type="currency"
                    tooltip="Standalone first-year repairs (no inflation)"
                    testId="input-repairs"
                    debounce
                  />
                </div>
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs font-medium text-muted-foreground mb-2">Annual Expense Increases</p>
                <p className="text-xs text-muted-foreground/80 mb-3">Set to 0% to model frozen rates (CLT agreements, tax abatements)</p>
                <div className="grid grid-cols-2 gap-3">
                  <ParameterSlider
                    label="Property Tax Increase"
                    value={params.propTaxInflation}
                    onChange={(v) => onChange("propTaxInflation", v)}
                    min={0}
                    max={0.06}
                    step={0.005}
                    tooltip="Annual increase; 0% for frozen/abated property tax"
                    testId="slider-prop-tax-inflation"
                  />
                  <ParameterSlider
                    label="Insurance Increase"
                    value={params.insuranceInflation}
                    onChange={(v) => onChange("insuranceInflation", v)}
                    min={0}
                    max={0.08}
                    step={0.005}
                    tooltip="Annual increase; consider if distributed to individuals"
                    testId="slider-insurance-inflation"
                  />
                  <ParameterSlider
                    label="Land Lease Increase"
                    value={params.landLeaseInflation}
                    onChange={(v) => onChange("landLeaseInflation", v)}
                    min={0}
                    max={0.05}
                    step={0.005}
                    tooltip="Annual increase; 0% if frozen via CLT agreement"
                    testId="slider-land-lease-inflation"
                  />
                </div>
              </div>
              <ParameterSlider
                label="Co-op Split of Land Lease"
                value={params.landLeaseCoopSplitPct}
                onChange={(v) => onChange("landLeaseCoopSplitPct", v)}
                min={0.30}
                max={0.80}
                step={0.05}
                tooltip="Portion of land lease returned to resident co-op"
                testId="slider-coop-split"
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="taxation" className="border rounded-lg px-4 bg-card">
            <AccordionTrigger className="hover:no-underline py-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-violet-500/10">
                  <Calculator className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                </div>
                <span className="text-sm font-semibold">Investor Taxation</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <ParameterInput
                  label="Placed in Service Year"
                  value={params.placedInServiceYear}
                  onChange={(v) => onChange("placedInServiceYear", v)}
                  type="number"
                  testId="input-service-year"
                />
                <ParameterSlider
                  label="Federal Tax Bracket"
                  value={params.investorTaxBracket}
                  onChange={(v) => onChange("investorTaxBracket", v)}
                  min={0.22}
                  max={0.50}
                  step={0.01}
                  tooltip="Investor's marginal federal income tax rate"
                  testId="slider-tax-bracket"
                />
              </div>
              <div className="space-y-2">
                <ParameterSwitch
                  label="Real Estate Professional"
                  checked={params.isRealEstateProfessional}
                  onChange={(v) => onChange("isRealEstateProfessional", v)}
                  tooltip="REP status allows deducting losses against ordinary income"
                  testId="switch-rep"
                />
                <ParameterSwitch
                  label="Use Ohio Tax Rules"
                  checked={params.useOhioTax}
                  onChange={(v) => onChange("useOhioTax", v)}
                  testId="switch-ohio-tax"
                />
                {params.useOhioTax && (
                  <ParameterSwitch
                    label="Enable Ohio BID Deduction"
                    checked={params.enableOhioBID}
                    onChange={(v) => onChange("enableOhioBID", v)}
                    tooltip="Business Income Deduction - exempts first $250k from state tax"
                    testId="switch-ohio-bid"
                  />
                )}
                {!params.useOhioTax && (
                  <ParameterSlider
                    label="Custom State Tax Rate"
                    value={params.customStateTaxRate}
                    onChange={(v) => onChange("customStateTaxRate", v)}
                    min={0}
                    max={0.13}
                    step={0.005}
                    testId="slider-state-tax"
                  />
                )}
              </div>
              <div className="pt-2 border-t space-y-2">
                <p className="text-xs font-medium text-muted-foreground mb-2">Depreciation Strategy</p>
                <ParameterSwitch
                  label="OBBBA (100% Bonus Restored)"
                  checked={params.useOBBBA}
                  onChange={(v) => onChange("useOBBBA", v)}
                  tooltip="One Big Beautiful Bill Act - reinstates 100% bonus depreciation"
                  testId="switch-obbba"
                />
                <ParameterSwitch
                  label="Conservative Bonus (Phase-out)"
                  checked={params.useConservativeBonus}
                  onChange={(v) => onChange("useConservativeBonus", v)}
                  tooltip="Follow TCJA phase-out schedule if OBBBA not passed"
                  testId="switch-conservative-bonus"
                />
              </div>
              {!params.isRealEstateProfessional && (
                <div className="pt-2 border-t space-y-2">
                  <ParameterSwitch
                    label="Passive Investor Limits"
                    checked={params.forcePassiveInvestor}
                    onChange={(v) => onChange("forcePassiveInvestor", v)}
                    tooltip="Limit losses to passive income offset only"
                    testId="switch-passive"
                  />
                  {params.forcePassiveInvestor && (
                    <ParameterInput
                      label="Passive Income to Offset"
                      value={params.passiveIncomeToOffset}
                      onChange={(v) => onChange("passiveIncomeToOffset", v)}
                      type="currency"
                      testId="input-passive-income"
                      debounce
                    />
                  )}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="seller" className="border rounded-lg px-4 bg-card">
            <AccordionTrigger className="hover:no-underline py-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-blue-500/10">
                  <Briefcase className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-sm font-semibold">Seller Analysis</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <ParameterInput
                  label="Original Purchase Price"
                  value={params.sellerOriginalPurchasePrice}
                  onChange={(v) => onChange("sellerOriginalPurchasePrice", v)}
                  type="currency"
                  tooltip="Seller's original cost basis"
                  testId="input-seller-basis"
                  debounce
                />
                <ParameterInput
                  label="Original Land Value"
                  value={params.sellerOriginalLandValue}
                  onChange={(v) => onChange("sellerOriginalLandValue", v)}
                  type="currency"
                  tooltip="Land portion of original purchase"
                  testId="input-seller-land"
                  debounce
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <ParameterInput
                  label="Holding Period (Years)"
                  value={params.sellerHoldingPeriod}
                  onChange={(v) => onChange("sellerHoldingPeriod", v)}
                  type="number"
                  tooltip="Years seller has owned property"
                  testId="input-holding-period"
                />
                <ParameterInput
                  label="Number of Partners"
                  value={params.sellerNumPartners}
                  onChange={(v) => onChange("sellerNumPartners", v)}
                  type="number"
                  tooltip="Ownership partners splitting proceeds"
                  testId="input-num-partners"
                />
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs font-medium text-muted-foreground mb-3">Seller Tax Rates</p>
                <div className="grid grid-cols-2 gap-3">
                  <ParameterSlider
                    label="Federal Tax Bracket"
                    value={params.sellerTaxBracket}
                    onChange={(v) => onChange("sellerTaxBracket", v)}
                    min={0.22}
                    max={0.50}
                    step={0.01}
                    tooltip="Seller's marginal federal income tax rate"
                    testId="slider-seller-bracket"
                  />
                  <ParameterSlider
                    label="State Tax Rate"
                    value={params.sellerStateTaxRate}
                    onChange={(v) => onChange("sellerStateTaxRate", v)}
                    min={0}
                    max={0.13}
                    step={0.005}
                    testId="slider-seller-state"
                  />
                  <ParameterSlider
                    label="Capital Gains Rate"
                    value={params.sellerCapitalGainsRate}
                    onChange={(v) => onChange("sellerCapitalGainsRate", v)}
                    min={0}
                    max={0.25}
                    step={0.01}
                    tooltip="Long-term capital gains rate (0%, 15%, 20%)"
                    testId="slider-seller-capgains"
                  />
                  <ParameterSlider
                    label="Depreciation Recapture"
                    value={params.sellerRecaptureRate}
                    onChange={(v) => onChange("sellerRecaptureRate", v)}
                    min={0.15}
                    max={0.28}
                    step={0.01}
                    tooltip="Rate for depreciation recapture (typically 25%)"
                    testId="slider-recapture"
                  />
                </div>
                <div className="mt-3">
                  <ParameterSwitch
                    label="NIIT Applies (3.8%)"
                    checked={params.sellerNIITApplies}
                    onChange={(v) => onChange("sellerNIITApplies", v)}
                    tooltip="Net Investment Income Tax for high earners"
                    testId="switch-niit"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="exit" className="border rounded-lg px-4 bg-card">
            <AccordionTrigger className="hover:no-underline py-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-rose-500/10">
                  <TrendingUp className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                </div>
                <span className="text-sm font-semibold">Exit Strategy</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-4 space-y-4">
              <ParameterInput
                label="Investor Exit Year"
                value={params.investorExitYear}
                onChange={(v) => onChange("investorExitYear", v)}
                type="number"
                tooltip="Year when investor sells to co-op"
                testId="input-exit-year"
              />
              <div className="grid grid-cols-2 gap-3">
                <ParameterSlider
                  label="Shared Appreciation Note"
                  value={params.equityKickerPct}
                  onChange={(v) => onChange("equityKickerPct", v)}
                  min={0}
                  max={0.30}
                  step={0.01}
                  tooltip="% of capex investors retain at exit (Vendor Take-Back Discount)"
                  testId="slider-equity-kicker"
                />
                <ParameterSlider
                  label="Refinance Costs %"
                  value={params.refinanceCostsPct}
                  onChange={(v) => onChange("refinanceCostsPct", v)}
                  min={0}
                  max={0.05}
                  step={0.005}
                  tooltip="Closing costs for Co-op takeout loan"
                  testId="slider-refi-costs"
                />
                <ParameterSlider
                  label="CapEx Buyout Split"
                  value={params.capexBuyoutSplitPct}
                  onChange={(v) => onChange("capexBuyoutSplitPct", v)}
                  min={0}
                  max={1.0}
                  step={0.05}
                  tooltip="% of capex deducted from co-op buyout price"
                  testId="slider-capex-split"
                />
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs font-medium text-muted-foreground mb-3">Co-op Refinancing (Phase 2)</p>
                <div className="grid grid-cols-2 gap-3">
                  <ParameterSlider
                    label="Co-op Refi Rate"
                    value={params.coopRefiRate}
                    onChange={(v) => onChange("coopRefiRate", v)}
                    min={0.04}
                    max={0.12}
                    step={0.0025}
                    testId="slider-coop-rate"
                  />
                  <ParameterInput
                    label="Refi Term (Years)"
                    value={params.coopRefiTerm}
                    onChange={(v) => onChange("coopRefiTerm", v)}
                    type="number"
                    testId="input-coop-term"
                  />
                </div>
                <div className="mt-3">
                  <ParameterInput
                    label="Refi Amortization (Years)"
                    value={params.coopRefiAmortization}
                    onChange={(v) => onChange("coopRefiAmortization", v)}
                    type="number"
                    testId="input-coop-amort"
                  />
                </div>
              </div>
              <ParameterSwitch
                label="Homestead Exemption (Phase 2)"
                checked={params.enableHomesteadExemption}
                onChange={(v) => onChange("enableHomesteadExemption", v)}
                tooltip="Reduces property tax by 25% after co-op conversion"
                testId="switch-homestead"
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </ScrollArea>
  );
}
