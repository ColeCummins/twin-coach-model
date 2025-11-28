import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { YearResult, TenantYearResult, SellerYearResult } from "@shared/schema";
import { formatCurrency } from "@/lib/calcEngine";
import { cn } from "@/lib/utils";

interface DataTableProps {
  annualResults: YearResult[];
  tenantSchedule: TenantYearResult[];
  sellerSchedule?: SellerYearResult[];
  investorExitYear: number;
}

function formatCompact(value: number): string {
  if (Math.abs(value) >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  if (Math.abs(value) >= 1000) {
    return `$${(value / 1000).toFixed(1)}k`;
  }
  return formatCurrency(value);
}

export function DataTable({
  annualResults,
  tenantSchedule,
  sellerSchedule,
  investorExitYear
}: DataTableProps) {
  const investorYears = annualResults.slice(0, investorExitYear);

  return (
    <Tabs defaultValue="investor" className="w-full">
      <TabsList className={`grid w-full mb-4 ${sellerSchedule ? 'grid-cols-3' : 'grid-cols-2'}`}>
        <TabsTrigger value="investor" data-testid="tab-investor-table">Investor Schedule</TabsTrigger>
        <TabsTrigger value="tenant" data-testid="tab-tenant-table">Tenant Schedule</TabsTrigger>
        {sellerSchedule && (
          <TabsTrigger value="seller" data-testid="tab-seller-table">Seller Schedule</TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="investor">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Annual Investor Returns</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <ScrollArea className="w-full">
              <div className="min-w-[1000px]">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-16 text-xs font-semibold">Year</TableHead>
                      <TableHead className="text-xs font-semibold text-right">NOI</TableHead>
                      <TableHead className="text-xs font-semibold text-right">Debt Service</TableHead>
                      <TableHead className="text-xs font-semibold text-right">Pre-Tax CF</TableHead>
                      <TableHead className="text-xs font-semibold text-right">Interest</TableHead>
                      <TableHead className="text-xs font-semibold text-right">Depreciation</TableHead>
                      <TableHead className="text-xs font-semibold text-right">Paper Loss</TableHead>
                      <TableHead className="text-xs font-semibold text-right">Tax Impact</TableHead>
                      <TableHead className="text-xs font-semibold text-right">After-Tax CF</TableHead>
                      <TableHead className="text-xs font-semibold text-right">Principal</TableHead>
                      <TableHead className="text-xs font-semibold text-right">Loan Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {investorYears.map((yr, idx) => (
                      <TableRow
                        key={yr.year}
                        className={cn(
                          idx % 2 === 0 ? "bg-muted/30" : "",
                          yr.year === investorExitYear && "bg-primary/5 border-primary/20"
                        )}
                      >
                        <TableCell className="font-medium text-sm">
                          <div className="flex items-center gap-2">
                            {yr.year}
                            {yr.year === investorExitYear && (
                              <Badge variant="secondary" className="text-xs px-1.5 py-0">Exit</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-sm tabular-nums">
                          {formatCompact(yr.noi)}
                        </TableCell>
                        <TableCell className="text-right text-sm tabular-nums text-muted-foreground">
                          ({formatCompact(yr.debtService)})
                        </TableCell>
                        <TableCell className={cn(
                          "text-right text-sm tabular-nums font-medium",
                          yr.cashFlowBeforeTax >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                        )}>
                          {formatCompact(yr.cashFlowBeforeTax)}
                        </TableCell>
                        <TableCell className="text-right text-sm tabular-nums text-muted-foreground">
                          {formatCompact(yr.interestPayment)}
                        </TableCell>
                        <TableCell className="text-right text-sm tabular-nums text-violet-600 dark:text-violet-400">
                          {formatCompact(yr.depreciation)}
                        </TableCell>
                        <TableCell className="text-right text-sm tabular-nums text-emerald-600 dark:text-emerald-400">
                          {formatCompact(yr.paperLoss)}
                        </TableCell>
                        <TableCell className={cn(
                          "text-right text-sm tabular-nums font-medium",
                          yr.taxSavings >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                        )}>
                          {yr.taxSavings >= 0 ? "+" : ""}{formatCompact(yr.taxSavings)}
                        </TableCell>
                        <TableCell className={cn(
                          "text-right text-sm tabular-nums font-semibold",
                          yr.cashFlowAfterTax >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                        )}>
                          {formatCompact(yr.cashFlowAfterTax)}
                        </TableCell>
                        <TableCell className="text-right text-sm tabular-nums text-primary">
                          +{formatCompact(yr.principalPaydown)}
                        </TableCell>
                        <TableCell className="text-right text-sm tabular-nums text-muted-foreground">
                          {formatCompact(yr.loanBalance)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="tenant">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Per-Unit Tenant Benefits</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <ScrollArea className="w-full">
              <div className="min-w-[700px]">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-16 text-xs font-semibold">Year</TableHead>
                      <TableHead className="w-20 text-xs font-semibold">Phase</TableHead>
                      <TableHead className="text-xs font-semibold text-right">Monthly Rent</TableHead>
                      <TableHead className="text-xs font-semibold text-right">Resident Dist.</TableHead>
                      <TableHead className="text-xs font-semibold text-right">Reserves</TableHead>
                      <TableHead className="text-xs font-semibold text-right">Carry Cost</TableHead>
                      <TableHead className="text-xs font-semibold text-right">Shadow Equity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tenantSchedule.map((yr, idx) => (
                      <TableRow
                        key={yr.year}
                        className={cn(
                          idx % 2 === 0 ? "bg-muted/30" : "",
                          yr.year === investorExitYear + 1 && "bg-primary/5 border-t-2 border-primary/30"
                        )}
                      >
                        <TableCell className="font-medium text-sm">{yr.year}</TableCell>
                        <TableCell>
                          <Badge
                            variant={yr.phase === "Investor" ? "secondary" : "default"}
                            className="text-xs"
                          >
                            {yr.phase}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-sm tabular-nums">
                          ${yr.monthlyRent}
                        </TableCell>
                        <TableCell className="text-right text-sm tabular-nums text-emerald-600 dark:text-emerald-400">
                          +${yr.monthlyResidentDist}
                        </TableCell>
                        <TableCell className="text-right text-sm tabular-nums text-muted-foreground">
                          ${yr.monthlyReserves}
                        </TableCell>
                        <TableCell className="text-right text-sm tabular-nums">
                          {yr.phase === "Co-op" ? `$${yr.carryCost}` : "—"}
                        </TableCell>
                        <TableCell className="text-right text-sm tabular-nums font-semibold text-primary">
                          ${yr.cumulativePrincipalReduction.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </CardContent>
        </Card>
      </TabsContent>

      {sellerSchedule && (
        <TabsContent value="seller">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Seller Annual Cash Flow</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <ScrollArea className="w-full">
                <div className="min-w-[700px]">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="w-16 text-xs font-semibold">Year</TableHead>
                        <TableHead className="text-xs font-semibold text-right">Interest Income</TableHead>
                        <TableHead className="text-xs font-semibold text-right">Principal</TableHead>
                        <TableHead className="text-xs font-semibold text-right">Total Payment</TableHead>
                        <TableHead className="text-xs font-semibold text-right">Tax on Interest</TableHead>
                        <TableHead className="text-xs font-semibold text-right">After-Tax Income</TableHead>
                        <TableHead className="text-xs font-semibold text-right">Cumulative</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sellerSchedule.map((yr, idx) => (
                        <TableRow
                          key={yr.year}
                          className={cn(
                            idx % 2 === 0 ? "bg-muted/30" : "",
                            yr.year === investorExitYear && "bg-primary/5 border-primary/20"
                          )}
                        >
                          <TableCell className="font-medium text-sm">
                            <div className="flex items-center gap-2">
                              {yr.year}
                              {yr.year === investorExitYear && (
                                <Badge variant="secondary" className="text-xs px-1.5 py-0">Exit</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-sm tabular-nums">
                            {formatCompact(yr.interestIncome)}
                          </TableCell>
                          <TableCell className="text-right text-sm tabular-nums text-primary">
                            {formatCompact(yr.principalPayment)}
                          </TableCell>
                          <TableCell className="text-right text-sm tabular-nums font-medium">
                            {formatCompact(yr.totalPayment)}
                          </TableCell>
                          <TableCell className="text-right text-sm tabular-nums text-rose-600 dark:text-rose-400">
                            ({formatCompact(yr.taxOnInterest)})
                          </TableCell>
                          <TableCell className="text-right text-sm tabular-nums font-semibold text-emerald-600 dark:text-emerald-400">
                            {formatCompact(yr.afterTaxIncome)}
                          </TableCell>
                          <TableCell className="text-right text-sm tabular-nums font-medium">
                            {formatCompact(yr.cumulativeReceived)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      )}
    </Tabs>
  );
}
