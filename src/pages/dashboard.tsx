import { useState, useMemo, useCallback } from "react";
import {
  Building2,
  Users,
  TrendingUp,
  Download,
  RotateCcw,
  Sparkles,
  PanelLeftClose,
  PanelLeft,
  FileText,
  FileSpreadsheet,
  ChevronDown,
  Printer,
  SlidersHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { ParameterPanel } from "@/components/parameter-panel";
import { StakeholderCard } from "@/components/metric-card";
import { ResultsCharts } from "@/components/results-charts";
import { DataTable } from "@/components/data-table";
import { WarningsPanel } from "@/components/warnings-panel";
import { SellerComparisonSection } from "@/components/seller-comparison";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  runSimulation,
  formatCurrency,
  formatPercent,
  generateCSVData,
  generateSellerCSV,
  generatePDFReport
} from "@/lib/calcEngine";
import type { SimulationParams } from "@shared/schema";
import { DEFAULT_PARAMS } from "@shared/schema";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Dashboard() {
  const [params, setParams] = useState<SimulationParams>({ ...DEFAULT_PARAMS });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  const handleParamChange = useCallback((key: keyof SimulationParams, value: number | boolean) => {
    setParams(prev => {
      const updated = { ...prev, [key]: value };
      // If landRatio changes, update bargainSalePrice accordingly
      if (key === 'landRatio' && typeof value === 'number') {
        updated.bargainSalePrice = updated.fairMarketValue - (updated.fairMarketValue * value);
      }
      return updated;
    });
  }, []);

  const handleReset = useCallback(() => {
    setParams({ ...DEFAULT_PARAMS });
  }, []);

  const result = useMemo(() => runSimulation(params), [params]);

  const exportJSON = useCallback(() => {
    const data = {
      parameters: params,
      results: result,
      generatedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `twin-coach-analysis-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [params, result]);

  const exportCSV = useCallback(() => {
    const csvData = generateCSVData(result);
    const blob = new Blob([csvData], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `twin-coach-investor-schedule-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [result]);

  const exportSellerCSV = useCallback(() => {
    const csvData = generateSellerCSV(result.sellerComparison);
    const blob = new Blob([csvData], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `twin-coach-seller-analysis-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [result]);

  const exportPDF = useCallback(async () => {
    await generatePDFReport(params, result);
  }, [params, result]);

  const DesktopSidebar = () => (
    <aside
      className={cn(
        "flex-shrink-0 border-r bg-muted/30 transition-all duration-300 ease-in-out hidden md:block",
        sidebarCollapsed ? "w-0 overflow-hidden" : "w-[380px]"
      )}
    >
      <div className="h-14 flex items-center justify-between px-4 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <span className="font-semibold text-sm">Parameters</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleReset}
          data-testid="button-reset"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
      <div className="h-[calc(100vh-3.5rem)]">
        <ParameterPanel params={params} onChange={handleParamChange} />
      </div>
    </aside>
  );

  const MobileParameterSheet = () => (
    <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="md:hidden"
          data-testid="button-mobile-params"
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Parameters
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[340px] sm:w-[380px] p-0">
        <SheetHeader className="h-14 flex flex-row items-center justify-between px-4 border-b bg-background/80 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <SheetTitle className="font-semibold text-sm">Parameters</SheetTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleReset}
            data-testid="button-reset-mobile"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </SheetHeader>
        <div className="h-[calc(100vh-3.5rem)]">
          <ParameterPanel params={params} onChange={handleParamChange} />
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <div className="flex h-screen bg-background">
      <DesktopSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 flex items-center justify-between px-4 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10 gap-2">
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              data-testid="button-toggle-sidebar"
              className="hidden md:flex"
            >
              {sidebarCollapsed ? (
                <PanelLeft className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </Button>
            <MobileParameterSheet />
            <Separator orientation="vertical" className="h-6 hidden md:block" />
            <div className="min-w-0">
              <h1 className="text-base md:text-lg font-semibold tracking-tight truncate">
                Twin Coach Deal Configurator
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Affordable Housing Co-op Conversion Analysis
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  data-testid="button-export"
                >
                  <Download className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Export</span>
                  <ChevronDown className="h-3 w-3 ml-1 hidden md:inline" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={exportPDF} data-testid="export-pdf">
                  <Printer className="h-4 w-4 mr-2" />
                  PDF Report
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportJSON} data-testid="export-json">
                  <FileText className="h-4 w-4 mr-2" />
                  Full Report (JSON)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportCSV} data-testid="export-csv">
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Investor Schedule (CSV)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportSellerCSV} data-testid="export-seller-csv">
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Seller Analysis (CSV)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <ThemeToggle />
          </div>
        </header>

        <ScrollArea className="flex-1">
          <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-7xl mx-auto">
            <WarningsPanel warnings={result.metrics.warnings} />

            {/* Solvency Traffic Light (UI Req #4) */}
            <div className={cn(
              "p-4 md:p-6 rounded-xl border-2 transition-colors duration-300",
              result.sellerComparison.twinCoach.netDay1Position < 0
                ? "border-rose-500/30 bg-rose-500/5"
                : "border-emerald-500/30 bg-emerald-500/5"
            )}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                      Day 1 Seller Solvency
                    </p>
                    <div className={cn(
                      "h-3 w-3 rounded-full",
                      result.sellerComparison.twinCoach.netDay1Position < 0 ? "bg-rose-500 animate-pulse" : "bg-emerald-500"
                    )} />
                  </div>
                  <p className={cn(
                    "text-3xl md:text-4xl font-bold tabular-nums",
                    result.sellerComparison.twinCoach.netDay1Position < 0 ? "text-rose-600" : "text-emerald-600 dark:text-emerald-400"
                  )} data-testid="primary-kpi">
                    {formatCurrency(result.sellerComparison.twinCoach.netDay1Position)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Cash received minus taxes due immediately
                  </p>
                </div>
                <div className="flex gap-4 md:gap-6">
                  <div className="text-center">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Cash Received</p>
                    <p className="text-lg font-semibold tabular-nums">{formatCurrency(result.sellerComparison.twinCoach.day1CashReceived)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Donation Benefit</p>
                    <p className="text-lg font-semibold tabular-nums text-blue-600 dark:text-blue-400" title="Realized over time against interest">
                      {formatCurrency(result.sellerComparison.twinCoach.donationTaxSavings)}*
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Tabs defaultValue="seller" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="seller">The Seller Pitch</TabsTrigger>
                <TabsTrigger value="investor">The Investor Pitch</TabsTrigger>
                <TabsTrigger value="resident">The Resident Promise</TabsTrigger>
              </TabsList>

              <TabsContent value="seller" className="space-y-4 animate-in fade-in-50">
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      Seller Proceeds & Legacy
                    </h2>
                  </div>

                  <StakeholderCard
                    title="Seller Outcome"
                    subtitle="Land donation with seller financing"
                    icon={<Building2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
                    iconBg="bg-emerald-500/10"
                    metrics={[
                      {
                        label: "Day 1 Net Cash",
                        value: formatCurrency(result.sellerComparison.twinCoach.netDay1Position),
                        highlight: true
                      },
                      {
                        label: "Donation Amount",
                        value: formatCurrency(result.metrics.seller.donationAmount)
                      },
                      {
                        label: "Total Cash (Term)",
                        value: formatCurrency(result.metrics.seller.totalCashReceived)
                      },
                      {
                        label: "Monthly Note Income",
                        value: formatCurrency(result.metrics.seller.monthlyIncome)
                      },
                    ]}
                    status={{
                      label: `+${result.metrics.seller.advantageOverConventional.toFixed(1)}% vs Market Sale`,
                      type: result.metrics.seller.advantageOverConventional > 0 ? "success" : "warning"
                    }}
                    testId="card-seller"
                  />

                  <SellerComparisonSection
                    comparison={result.sellerComparison}
                    numPartners={params.sellerNumPartners}
                  />
                </section>
              </TabsContent>

              <TabsContent value="investor" className="space-y-4 animate-in fade-in-50">
                <section className="space-y-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Investor Yield & Risk
                  </h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <StakeholderCard
                      title="Investment Returns"
                      subtitle="Tax-advantaged real estate investment"
                      icon={<TrendingUp className="h-5 w-5 text-primary" />}
                      iconBg="bg-primary/10"
                      metrics={[
                        {
                          label: "Total Investment",
                          value: formatCurrency(result.metrics.investor.totalInvested)
                        },
                        {
                          label: "Net Profit",
                          value: formatCurrency(result.metrics.investor.totalNetProfit)
                        },
                        {
                          label: "Year 1 ROI (Tax-Adj)",
                          value: formatPercent(result.metrics.investor.roiFirstYearTaxAdjusted)
                        },
                        {
                          label: "IRR",
                          value: formatPercent(result.metrics.investor.irr) + (result.metrics.investor.irrFallback ? "*" : "")
                        },
                      ]}
                      status={{
                        label: result.metrics.investor.irr > 15 ? "Strong Returns" : "Moderate Returns",
                        type: result.metrics.investor.irr > 15 ? "success" : "neutral"
                      }}
                      testId="card-investor"
                    />

                    <div className="p-4 rounded-lg border bg-card space-y-3">
                      <h3 className="text-sm font-semibold">Tax Benefits (Paper Losses)</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Total Depreciation</p>
                          <p className="text-lg font-semibold tabular-nums" data-testid="metric-depreciation">
                            {formatCurrency(result.metrics.investor.totalDepreciation)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Interest Deductions</p>
                          <p className="text-lg font-semibold tabular-nums" data-testid="metric-interest">
                            {formatCurrency(result.metrics.investor.totalInterestDeductions)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Total Paper Losses</p>
                          <p className="text-lg font-semibold tabular-nums" data-testid="metric-paper-loss">
                            {formatCurrency(result.metrics.investor.totalPaperLosses)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Tax Savings (Positive)</p>
                          <p className="text-lg font-semibold tabular-nums text-emerald-600 dark:text-emerald-400" data-testid="metric-tax-savings">
                            +{formatCurrency(result.metrics.investor.totalTaxSavings)}
                          </p>
                        </div>
                      </div>
                      <Separator />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Year 1 Cash-on-Cash</p>
                        <p className="text-lg font-semibold tabular-nums" data-testid="metric-coc">
                          {formatPercent(result.metrics.investor.cashOnCashYear1)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Investor Exit Analysis */}
                  <div className="p-4 rounded-lg border bg-card">
                    <h3 className="text-sm font-semibold mb-3">Exit Analysis (Year {params.investorExitYear})</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Sale Proceeds</p>
                        <p className="text-base font-semibold tabular-nums">
                          {formatCurrency(result.metrics.investor.exitAnalysis.saleProceeds)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Depreciation Recapture</p>
                        <p className="text-base font-semibold tabular-nums">
                          {formatCurrency(result.metrics.investor.exitAnalysis.depreciationRecapture)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Recapture Tax (25%)</p>
                        <p className="text-base font-semibold tabular-nums text-rose-600 dark:text-rose-400">
                          -{formatCurrency(result.metrics.investor.exitAnalysis.recaptureTax)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Net Tax Liability</p>
                        <p className="text-base font-semibold tabular-nums text-rose-600 dark:text-rose-400">
                          -{formatCurrency(result.metrics.investor.exitAnalysis.totalTaxLiability)}
                        </p>
                      </div>
                    </div>
                    <Separator className="my-3" />
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Net After-Tax Exit Proceeds</p>
                        <p className="text-xl font-bold tabular-nums" data-testid="metric-exit-proceeds">
                          {formatCurrency(result.metrics.investor.exitAnalysis.netAfterTaxProceeds)}
                        </p>
                      </div>
                      {result.metrics.investor.exitAnalysis.suspendedLossOffset > 0 && (
                        <div className="text-right">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Suspended Loss Offset</p>
                          <p className="text-base font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                            +{formatCurrency(result.metrics.investor.exitAnalysis.suspendedLossOffset)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              </TabsContent>

              <TabsContent value="resident" className="space-y-4 animate-in fade-in-50">
                <section className="space-y-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Users className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                    Resident Stability & Ownership
                  </h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <StakeholderCard
                      title="Co-op / Residents"
                      subtitle="Building community equity"
                      icon={<Users className="h-5 w-5 text-violet-600 dark:text-violet-400" />}
                      iconBg="bg-violet-500/10"
                      metrics={[
                        {
                          label: "Buyout Price",
                          value: formatCurrency(result.metrics.coop.buyoutPrice)
                        },
                        {
                          label: "Monthly Mortgage",
                          value: formatCurrency(result.metrics.coop.monthlyMortgageAtExit)
                        },
                        {
                          label: "DSCR at Exit",
                          value: result.metrics.coop.dscrAtExit.toFixed(2) + "x"
                        },
                        {
                          label: "Calculated Rent / Unit",
                          value: formatCurrency(result.metrics.coop.calculatedMonthlyRent) + "/mo"
                        },
                      ]}
                      status={{
                        label: result.metrics.coop.isViable ? "Viable" : "Needs Review",
                        type: result.metrics.coop.isViable ? "success" : "warning"
                      }}
                      testId="card-coop"
                    />
                    <div className="p-4 rounded-lg border bg-card space-y-3">
                      <h3 className="text-sm font-semibold">Land Lease & Equity</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">CLT Portion (Annual)</p>
                          <p className="text-lg font-semibold tabular-nums">
                            {formatCurrency(result.metrics.coop.cltPortionAnnual)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Resident Distributions</p>
                          <p className="text-lg font-semibold tabular-nums">
                            {formatCurrency(result.metrics.coop.residentDistAnnual)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Turnover Reserves</p>
                          <p className="text-lg font-semibold tabular-nums">
                            {formatCurrency(result.metrics.coop.turnoverReserveAnnual)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Shadow Equity / Unit</p>
                          <p className="text-lg font-semibold tabular-nums" data-testid="metric-shadow-equity">
                            {formatCurrency(result.metrics.coop.shadowEquityPerUnit)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </TabsContent>
            </Tabs>

            <ResultsCharts
              annualResults={result.annualResults}
              tenantSchedule={result.tenantSchedule}
              investorExitYear={params.investorExitYear}
            />

            <DataTable
              annualResults={result.annualResults}
              tenantSchedule={result.tenantSchedule}
              sellerSchedule={result.sellerComparison.twinCoach.annualSchedule}
              investorExitYear={params.investorExitYear}
            />
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
