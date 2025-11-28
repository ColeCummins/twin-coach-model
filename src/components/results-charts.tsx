import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ComposedChart,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { YearResult, TenantYearResult } from "@shared/schema";
import { formatCurrency } from "@/lib/calcEngine";

interface ResultsChartsProps {
  annualResults: YearResult[];
  tenantSchedule: TenantYearResult[];
  investorExitYear: number;
}

const chartColors = {
  primary: "hsl(217 91% 50%)",
  secondary: "hsl(142 71% 45%)",
  tertiary: "hsl(262 83% 58%)",
  quaternary: "hsl(43 96% 56%)",
  muted: "hsl(220 9% 46%)",
  grid: "hsl(220 13% 91%)",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-popover border border-popover-border rounded-lg shadow-lg p-3 text-sm">
      <p className="font-medium mb-2">{label}</p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2 py-0.5">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-medium tabular-nums">
            {typeof entry.value === 'number'
              ? entry.value >= 1000 || entry.value <= -1000
                ? formatCurrency(entry.value)
                : `$${entry.value.toFixed(0)}`
              : entry.value
            }
          </span>
        </div>
      ))}
    </div>
  );
};

export function ResultsCharts({
  annualResults,
  tenantSchedule,
  investorExitYear
}: ResultsChartsProps) {
  const investorYears = annualResults.slice(0, investorExitYear);

  const cashFlowData = investorYears.map((yr) => ({
    name: `Y${yr.year}`,
    "Cash Flow": Math.round(yr.cashFlowBeforeTax),
    "Tax Benefit": Math.round(yr.taxSavings),
    "After-Tax": Math.round(yr.cashFlowAfterTax),
  }));

  const depreciationData = investorYears.map((yr) => ({
    name: `Y${yr.year}`,
    "Depreciation": Math.round(yr.depreciation),
    "Interest": Math.round(yr.debtService > 0 ? yr.paperLoss - yr.depreciation : 0),
    "Paper Loss": Math.round(yr.paperLoss),
  }));

  const returnData = investorYears.map((yr) => ({
    name: `Y${yr.year}`,
    "Cash Flow": Math.round(yr.cashFlowAfterTax),
    "Principal": Math.round(yr.principalPaydown),
    "Total Return": Math.round(yr.totalReturn),
  }));

  const equityData = tenantSchedule.map((yr) => ({
    name: `Y${yr.year}`,
    "Shadow Equity": yr.cumulativePrincipalReduction,
    "Monthly Rent": yr.monthlyRent,
    phase: yr.phase,
  }));

  return (
    <Tabs defaultValue="cashflow" className="w-full">
      <TabsList className="grid w-full grid-cols-4 mb-4">
        <TabsTrigger value="cashflow" data-testid="tab-cashflow">Cash Flow</TabsTrigger>
        <TabsTrigger value="depreciation" data-testid="tab-depreciation">Depreciation</TabsTrigger>
        <TabsTrigger value="returns" data-testid="tab-returns">Total Returns</TabsTrigger>
        <TabsTrigger value="equity" data-testid="tab-equity">Tenant Equity</TabsTrigger>
      </TabsList>

      <TabsContent value="cashflow">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Annual Cash Flow Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={cashFlowData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} opacity={0.5} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={{ stroke: chartColors.grid }}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                    tickLine={false}
                    axisLine={false}
                    width={60}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: 12, paddingTop: 16 }}
                    iconType="circle"
                    iconSize={8}
                  />
                  <ReferenceLine y={0} stroke={chartColors.muted} strokeDasharray="3 3" />
                  <Bar
                    dataKey="Cash Flow"
                    fill={chartColors.primary}
                    radius={[4, 4, 0, 0]}
                    opacity={0.8}
                  />
                  <Bar
                    dataKey="Tax Benefit"
                    fill={chartColors.secondary}
                    radius={[4, 4, 0, 0]}
                    opacity={0.8}
                  />
                  <Line
                    type="monotone"
                    dataKey="After-Tax"
                    stroke={chartColors.tertiary}
                    strokeWidth={2}
                    dot={{ fill: chartColors.tertiary, strokeWidth: 0, r: 4 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="depreciation">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Depreciation & Paper Loss Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={depreciationData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorDepr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorInt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColors.secondary} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={chartColors.secondary} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} opacity={0.5} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={{ stroke: chartColors.grid }}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                    tickLine={false}
                    axisLine={false}
                    width={60}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: 12, paddingTop: 16 }}
                    iconType="circle"
                    iconSize={8}
                  />
                  <Area
                    type="monotone"
                    dataKey="Depreciation"
                    stackId="1"
                    stroke={chartColors.primary}
                    fill="url(#colorDepr)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="Interest"
                    stackId="1"
                    stroke={chartColors.secondary}
                    fill="url(#colorInt)"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="Paper Loss"
                    stroke={chartColors.tertiary}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="returns">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Investor Total Returns by Year</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={returnData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} opacity={0.5} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={{ stroke: chartColors.grid }}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                    tickLine={false}
                    axisLine={false}
                    width={60}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: 12, paddingTop: 16 }}
                    iconType="circle"
                    iconSize={8}
                  />
                  <ReferenceLine y={0} stroke={chartColors.muted} strokeDasharray="3 3" />
                  <Bar
                    dataKey="Cash Flow"
                    stackId="a"
                    fill={chartColors.primary}
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="Principal"
                    stackId="a"
                    fill={chartColors.secondary}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="equity">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Resident Shadow Equity (Per Unit)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={equityData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColors.secondary} stopOpacity={0.4}/>
                      <stop offset="95%" stopColor={chartColors.secondary} stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} opacity={0.5} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={{ stroke: chartColors.grid }}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                    tickLine={false}
                    axisLine={false}
                    width={60}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(v) => `$${v}`}
                    tickLine={false}
                    axisLine={false}
                    width={50}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: 12, paddingTop: 16 }}
                    iconType="circle"
                    iconSize={8}
                  />
                  <ReferenceLine
                    x={`Y${investorExitYear}`}
                    stroke={chartColors.tertiary}
                    strokeDasharray="5 5"
                    label={{
                      value: 'Co-op Transition',
                      position: 'top',
                      fontSize: 10,
                      fill: chartColors.tertiary
                    }}
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="Shadow Equity"
                    stroke={chartColors.secondary}
                    fill="url(#colorEquity)"
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="right"
                    type="stepAfter"
                    dataKey="Monthly Rent"
                    stroke={chartColors.primary}
                    strokeWidth={2}
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
