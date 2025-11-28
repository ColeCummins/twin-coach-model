import { ArrowRight, TrendingUp, TrendingDown, Clock, DollarSign, Percent, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { SellerComparison } from "@shared/schema";
import { formatCurrency, formatPercent } from "@/lib/calcEngine";

interface SellerComparisonProps {
  comparison: SellerComparison;
  numPartners: number;
}

export function SellerComparisonSection({ comparison, numPartners }: SellerComparisonProps) {
  const { conventional, twinCoach, advantageAmount, advantagePercent, breakEvenYear, npvAdvantage } = comparison;
  const isAdvantage = advantageAmount > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Seller Analysis: Conventional vs Twin Coach (Land Donation)</h2>
        <Badge variant={isAdvantage ? "default" : "destructive"} data-testid="seller-advantage-badge">
          {isAdvantage ? (
            <TrendingUp className="h-3 w-3 mr-1" />
          ) : (
            <TrendingDown className="h-3 w-3 mr-1" />
          )}
          {isAdvantage ? "+" : ""}{formatPercent(advantagePercent)} Net Advantage
        </Badge>
      </div>

      <Alert className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertDescription className="text-blue-900 dark:text-blue-200">
          <span className="font-semibold">Land Donation Model:</span> The seller donates the land to the co-op while retaining seller financing on the building. This is simpler than a traditional bargain sale—no need to prove comparable sales or justify the discount. The donation creates an immediate charitable deduction, and the seller receives ongoing income from the interest-bearing note.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-2 border-muted">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-muted">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </div>
              Conventional Sale
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Gross Sale Price</span>
                <span className="font-medium tabular-nums">{formatCurrency(conventional.grossSalePrice)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Less: Commissions (6%)</span>
                <span className="font-medium tabular-nums text-rose-600 dark:text-rose-400">
                  -{formatCurrency(conventional.commissions)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Less: Closing Costs</span>
                <span className="font-medium tabular-nums text-rose-600 dark:text-rose-400">
                  -{formatCurrency(conventional.closingCosts)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-medium border-t pt-2">
                <span>Net Sale Proceeds</span>
                <span className="tabular-nums">{formatCurrency(conventional.netSaleProceeds)}</span>
              </div>
            </div>

            <div className="border-t pt-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tax Implications</p>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Depreciation Recapture ({formatPercent(conventional.recaptureRate * 100, 0)})</span>
                <span className="font-medium tabular-nums text-rose-600 dark:text-rose-400">
                  -{formatCurrency(conventional.recaptureTax)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Capital Gains Tax ({formatPercent(conventional.capitalGainsRate * 100, 0)})</span>
                <span className="font-medium tabular-nums text-rose-600 dark:text-rose-400">
                  -{formatCurrency(conventional.capitalGainsTax)}
                </span>
              </div>
              {conventional.niitTax > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">NIIT (3.8%)</span>
                  <span className="font-medium tabular-nums text-rose-600 dark:text-rose-400">
                    -{formatCurrency(conventional.niitTax)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">State Tax</span>
                <span className="font-medium tabular-nums text-rose-600 dark:text-rose-400">
                  -{formatCurrency(conventional.stateTax)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-medium border-t pt-2">
                <span>Total Taxes</span>
                <span className="tabular-nums text-rose-600 dark:text-rose-400">
                  -{formatCurrency(conventional.totalTaxes)}
                </span>
              </div>
            </div>

            <div className="border-t pt-3">
              <div className="flex justify-between text-base font-semibold">
                <span>Net After-Tax Proceeds</span>
                <span className="tabular-nums">{formatCurrency(conventional.netAfterTaxProceeds)}</span>
              </div>
              {numPartners > 1 && (
                <div className="flex justify-between text-sm text-muted-foreground mt-1">
                  <span>Per Partner ({numPartners})</span>
                  <span className="tabular-nums">{formatCurrency(conventional.perPartnerProceeds)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className={`border-2 ${isAdvantage ? 'border-emerald-500/50' : 'border-rose-500/50'}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <div className={`p-1.5 rounded-md ${isAdvantage ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                <TrendingUp className={`h-4 w-4 ${isAdvantage ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`} />
              </div>
              Twin Coach Model
              <Badge variant="outline" className="text-xs ml-auto bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                Land Donation
              </Badge>
              {isAdvantage && (
                <Badge variant="outline" className="ml-1 text-emerald-600 dark:text-emerald-400 border-emerald-500/50">
                  Recommended
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Day 1 Cash Received</span>
                <span className="font-medium tabular-nums">{formatCurrency(twinCoach.day1CashReceived)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Less: Taxes Due at Sale</span>
                <span className="font-medium tabular-nums text-rose-600 dark:text-rose-400">
                  -{formatCurrency(twinCoach.day1TaxesDue)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Plus: Donation Tax Savings</span>
                <span className="font-medium tabular-nums text-emerald-600 dark:text-emerald-400">
                  +{formatCurrency(twinCoach.donationTaxSavings)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-medium border-t pt-2">
                <span>Day 1 After-Tax Proceeds</span>
                <span className="tabular-nums">{formatCurrency(twinCoach.netDay1Position)}</span>
              </div>
            </div>

            <div className="border-t pt-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Ongoing Income (Years 1-Exit)</p>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Interest Income</span>
                <span className="font-medium tabular-nums">{formatCurrency(twinCoach.totalInterestIncome)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Less: Interest Tax</span>
                <span className="font-medium tabular-nums text-rose-600 dark:text-rose-400">
                  -{formatCurrency(twinCoach.totalInterestTax)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-medium border-t pt-2">
                <span>After-Tax Interest Proceeds</span>
                <span className="tabular-nums">{formatCurrency(twinCoach.netInterestIncome)}</span>
              </div>
            </div>

            <div className="border-t pt-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Exit (Year {/* @todo: dynamic year from params */})</p>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Balloon Amount</span>
                <span className="font-medium tabular-nums">{formatCurrency(twinCoach.balloonPayment)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Less: Tax on Gain</span>
                <span className="font-medium tabular-nums text-rose-600 dark:text-rose-400">
                  -{formatCurrency(twinCoach.balloonTax)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-medium border-t pt-2">
                <span>After-Tax Balloon Proceeds</span>
                <span className="tabular-nums">{formatCurrency(twinCoach.netBalloonProceeds)}</span>
              </div>
            </div>

            <div className="border-t pt-3">
              <div className="flex justify-between text-base font-semibold">
                <span>Net After-Tax Total</span>
                <span className="tabular-nums">{formatCurrency(twinCoach.netAfterTaxTotal)}</span>
              </div>
              {numPartners > 1 && (
                <div className="flex justify-between text-sm text-muted-foreground mt-1">
                  <span>Per Partner ({numPartners})</span>
                  <span className="tabular-nums">{formatCurrency(twinCoach.perPartnerTotal)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Net Advantage</span>
              {isAdvantage ? (
                <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <TrendingDown className="h-4 w-4 text-rose-600 dark:text-rose-400" />
              )}
            </div>
            <p className={`text-2xl font-semibold tabular-nums ${isAdvantage ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`} data-testid="seller-advantage-amount">
              {isAdvantage ? "+" : ""}{formatCurrency(advantageAmount)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              vs conventional sale
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Break-Even Year</span>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-semibold tabular-nums" data-testid="seller-breakeven">
              Year {breakEvenYear || "N/A"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              when cumulative receipts exceed conventional
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">NPV Advantage (5%)</span>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className={`text-2xl font-semibold tabular-nums ${npvAdvantage > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`} data-testid="seller-npv">
              {npvAdvantage > 0 ? "+" : ""}{formatCurrency(npvAdvantage)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              discounted at 5% annual rate
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
