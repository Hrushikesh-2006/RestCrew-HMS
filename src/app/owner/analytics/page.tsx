"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  TrendingUp,
  DollarSign,
  PieChart,
  BarChart3,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Building,
  Sparkles,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { useDataStore } from "@/lib/data-store";
import { analyzeFinancials, AIAnalysis } from "@/lib/gemini";
import { OwnerLayout } from "@/components/owner/owner-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Area,
  AreaChart,
  Pie,
  PieChart as RechartsPie,
  Cell,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useToast } from "@/hooks/use-toast";

const expenseCategories = [
  "Food",
  "Electricity",
  "Water",
  "Staff",
  "Maintenance",
  "Other",
];
const COLORS = [
  "#8B5CF6",
  "#F97316",
  "#06B6D4",
  "#EC4899",
  "#22C55E",
  "#EF4444",
];

export default function OwnerAnalyticsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { owner, isAuthenticated, userType } = useAuthStore();
  const { fees, expenses, investments, addExpense, addInvestment } =
    useDataStore();

  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isInvestmentDialogOpen, setIsInvestmentDialogOpen] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Expense form
  const [expenseCategory, setExpenseCategory] = useState("Food");
  const [expenseDescription, setExpenseDescription] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState(
    new Date().toLocaleDateString("en-CA"),
  );

  // Investment form
  const [investmentDescription, setInvestmentDescription] = useState("");
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [investmentDate, setInvestmentDate] = useState(
    new Date().toLocaleDateString("en-CA"),
  );

  useEffect(() => {
    if (!isAuthenticated || userType !== "owner") {
      router.push("/owner/login");
    }
  }, [isAuthenticated, userType, router]);

  // Calculate totals
  const totalRevenue = fees
    .filter((f) => f.status === "Paid")
    .reduce((acc, f) => acc + f.amount, 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const totalInvestments = investments.reduce((acc, i) => acc + i.amount, 0);
  const netProfit = totalRevenue - totalExpenses;

  // Expense breakdown
  const expenseBreakdown = expenseCategories
    .map((category, index) => ({
      name: category,
      value: expenses
        .filter((e) => e.category === category)
        .reduce((acc, e) => acc + e.amount, 0),
      color: COLORS[index],
    }))
    .filter((item) => item.value > 0);

  // Monthly data
  const monthlyData = [
    { month: "Jan", revenue: 0, expenses: 0, profit: 0 },
    { month: "Feb", revenue: 0, expenses: 0, profit: 0 },
    { month: "Mar", revenue: 0, expenses: 0, profit: 0 },
    { month: "Apr", revenue: 0, expenses: 0, profit: 0 },
    { month: "May", revenue: 0, expenses: 0, profit: 0 },
    { month: "Jun", revenue: 0, expenses: 0, profit: 0 },
  ];

  // Run AI analysis
  const runAIAnalysis = useCallback(async () => {
    setIsAnalyzing(true);
    try {
      const analysis = await analyzeFinancials({
        totalRevenue,
        totalExpenses,
        netProfit,
        expensesByCategory: expenseBreakdown.map(e => ({ category: e.name, amount: e.value })),
        monthlyData,
        studentCount:
          fees.length > 0 ? new Set(fees.map((f) => f.studentId)).size : 0,
        roomCount: 0,
        occupancyRate: 0,
      });
      setAiAnalysis(analysis);
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [
    totalRevenue,
    totalExpenses,
    netProfit,
    expenseBreakdown,
    fees,
    monthlyData,
  ]);

  // Auto-run analysis when data changes
  useEffect(() => {
    if (totalRevenue > 0 || totalExpenses > 0) {
      runAIAnalysis();
    }
  }, [totalRevenue, totalExpenses, runAIAnalysis]);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();

    if (!expenseAmount || parseFloat(expenseAmount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    addExpense({
      id: `expense_${Date.now()}`,
      category: expenseCategory,
      description: expenseDescription,
      amount: parseFloat(expenseAmount),
      date: expenseDate,
      ownerEmail: owner?.email || "",
    });

    toast({
      title: "Expense Added",
      description: `₹${expenseAmount} expense recorded.`,
    });

    setIsExpenseDialogOpen(false);
    setExpenseDescription("");
    setExpenseAmount("");
  };

  const handleAddInvestment = (e: React.FormEvent) => {
    e.preventDefault();

    if (!investmentAmount || parseFloat(investmentAmount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    addInvestment({
      id: `investment_${Date.now()}`,
      description: investmentDescription,
      amount: parseFloat(investmentAmount),
      date: investmentDate,
      ownerEmail: owner?.email || "",
    });

    toast({
      title: "Investment Added",
      description: `₹${investmentAmount} investment recorded.`,
    });

    setIsInvestmentDialogOpen(false);
    setInvestmentDescription("");
    setInvestmentAmount("");
  };

  if (!owner) return null;

  return (
    <OwnerLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4 lg:space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold gradient-text">
              Business Analytics
            </h1>
            <p className="text-muted-foreground mt-1 text-sm lg:text-base">
              AI-powered financial insights for your hostel
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setIsExpenseDialogOpen(true)}
              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              <Plus className="w-4 h-4 mr-2" />
              Expense
            </Button>
            <Button
              onClick={() => setIsInvestmentDialogOpen(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Investment
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {[
            {
              label: "Total Revenue",
              value: `₹${totalRevenue.toLocaleString()}`,
              positive: true,
              icon: TrendingUp,
              gradient: "from-green-500 to-emerald-500",
              bg: "from-green-500/20 to-emerald-500/10",
            },
            {
              label: "Total Expenses",
              value: `₹${totalExpenses.toLocaleString()}`,
              positive: false,
              icon: TrendingUp,
              gradient: "from-red-500 to-rose-500",
              bg: "from-red-500/20 to-rose-500/10",
            },
            {
              label: "Net Profit",
              value: `₹${netProfit.toLocaleString()}`,
              positive: netProfit >= 0,
              icon: DollarSign,
              gradient:
                netProfit >= 0
                  ? "from-purple-500 to-pink-500"
                  : "from-red-500 to-rose-500",
              bg:
                netProfit >= 0
                  ? "from-purple-500/20 to-pink-500/10"
                  : "from-red-500/20 to-rose-500/10",
            },
            {
              label: "Investments",
              value: `₹${totalInvestments.toLocaleString()}`,
              positive: true,
              icon: Building,
              gradient: "from-cyan-500 to-blue-500",
              bg: "from-cyan-500/20 to-blue-500/10",
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={`glass h-full bg-gradient-to-br ${stat.bg} border-0`}
              >
                <CardContent className="p-3 lg:p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div
                      className={`w-9 h-9 lg:w-11 lg:h-11 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}
                    >
                      <stat.icon className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${stat.positive ? "bg-green-500/20" : "bg-red-500/20"}`}
                    >
                      {stat.positive ? (
                        <ArrowUpRight className="w-3 h-3 text-green-400" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3 text-red-400" />
                      )}
                    </div>
                  </div>
                  <p className="text-xs lg:text-sm text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="text-xl lg:text-2xl font-bold mt-1">
                    {stat.value}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* AI Analysis Section */}
        {(totalRevenue > 0 || totalExpenses > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="glass border-purple-500/20 overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between p-4 lg:p-6">
                <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  AI Financial Analysis
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={runAIAnalysis}
                  disabled={isAnalyzing}
                  className="border-purple-500/30 text-purple-400"
                >
                  <RefreshCw
                    className={`w-4 h-4 mr-1 ${isAnalyzing ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>
              </CardHeader>
              <CardContent className="p-4 lg:p-6 pt-0">
                {isAnalyzing ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    <span className="ml-3 text-muted-foreground">
                      Analyzing...
                    </span>
                  </div>
                ) : aiAnalysis ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-slate-800/50">
                      <p className="text-sm lg:text-base">
                        {aiAnalysis.summary}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                        <h4 className="font-medium text-cyan-400 mb-2 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          Insights
                        </h4>
                        <ul className="space-y-2">
                          {aiAnalysis.insights.map((insight, i) => (
                            <li
                              key={i}
                              className="text-sm text-muted-foreground flex items-start gap-2"
                            >
                              <span className="text-cyan-400 mt-1">•</span>
                              {insight}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                        <h4 className="font-medium text-green-400 mb-2 flex items-center gap-2">
                          <ArrowUpRight className="w-4 h-4" />
                          Recommendations
                        </h4>
                        <ul className="space-y-2">
                          {aiAnalysis.recommendations.map((rec, i) => (
                            <li
                              key={i}
                              className="text-sm text-muted-foreground flex items-start gap-2"
                            >
                              <span className="text-green-400 mt-1">•</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {aiAnalysis.warnings.length > 0 && (
                      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                        <h4 className="font-medium text-red-400 mb-2 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          Warnings
                        </h4>
                        <ul className="space-y-2">
                          {aiAnalysis.warnings.map((warning, i) => (
                            <li
                              key={i}
                              className="text-sm text-muted-foreground flex items-start gap-2"
                            >
                              <span className="text-red-400 mt-1">•</span>
                              {warning}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Empty State */}
        {totalRevenue === 0 && totalExpenses === 0 && (
          <Card className="glass border-purple-500/20">
            <CardContent className="p-6 lg:p-12 text-center">
              <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/30">
                <BarChart3 className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
              </div>
              <h2 className="text-xl lg:text-2xl font-bold mb-2">
                No Financial Data Yet
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto text-sm lg:text-base">
                Start tracking your hostel's finances by adding expenses and
                collecting fees from students.
              </p>
              <Button
                onClick={() => setIsExpenseDialogOpen(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Expense
              </Button>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-slate-800/50">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="expenses"
              className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400"
            >
              Expenses
            </TabsTrigger>
            <TabsTrigger
              value="investments"
              className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400"
            >
              Investments
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="overview"
            className="space-y-4 lg:space-y-6 mt-4 lg:mt-6"
          >
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
              {/* Revenue Chart */}
              <Card className="glass">
                <CardHeader className="p-4 lg:p-6">
                  <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 text-white" />
                    </div>
                    Revenue Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 lg:p-6 pt-0">
                  <ChartContainer
                    config={{}}
                    className="h-[200px] lg:h-[250px]"
                  >
                    <AreaChart data={monthlyData}>
                      <defs>
                        <linearGradient
                          id="revenueGrad"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#8B5CF6"
                            stopOpacity={0.4}
                          />
                          <stop
                            offset="95%"
                            stopColor="#8B5CF6"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(148,163,184,0.1)"
                      />
                      <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} />
                      <YAxis stroke="#94A3B8" fontSize={11} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#8B5CF6"
                        fill="url(#revenueGrad)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Expense Breakdown */}
              <Card className="glass">
                <CardHeader className="p-4 lg:p-6">
                  <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                      <PieChart className="w-4 h-4 text-white" />
                    </div>
                    Expense Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 lg:p-6 pt-0">
                  {expenseBreakdown.length > 0 ? (
                    <>
                      <div className="h-[200px] lg:h-[250px] flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPie>
                            <Pie
                              data={expenseBreakdown}
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {expenseBreakdown.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={entry.color}
                                />
                              ))}
                            </Pie>
                            <ChartTooltip content={<ChartTooltipContent />} />
                          </RechartsPie>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex flex-wrap justify-center gap-3 mt-4">
                        {expenseBreakdown.map((item) => (
                          <div
                            key={item.name}
                            className="flex items-center gap-2"
                          >
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-xs text-muted-foreground">
                              {item.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="h-[200px] lg:h-[250px] flex items-center justify-center">
                      <div className="text-center">
                        <PieChart className="w-12 h-12 mx-auto text-muted-foreground/50 mb-2" />
                        <p className="text-sm text-muted-foreground">
                          No expense data
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="expenses" className="mt-4 lg:mt-6">
            <Card className="glass">
              <CardHeader className="p-4 lg:p-6">
                <CardTitle>Expense Records</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {expenses.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[500px]">
                      <thead>
                        <tr className="border-b border-border/30 bg-slate-800/50">
                          <th className="text-left p-3 lg:p-4 text-xs lg:text-sm text-muted-foreground font-medium">
                            Category
                          </th>
                          <th className="text-left p-3 lg:p-4 text-xs lg:text-sm text-muted-foreground font-medium">
                            Description
                          </th>
                          <th className="text-left p-3 lg:p-4 text-xs lg:text-sm text-muted-foreground font-medium">
                            Amount
                          </th>
                          <th className="text-left p-3 lg:p-4 text-xs lg:text-sm text-muted-foreground font-medium">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {expenses.map((expense) => (
                          <tr
                            key={expense.id}
                            className="border-b border-border/20 hover:bg-slate-800/30"
                          >
                            <td className="p-3 lg:p-4">
                              <Badge
                                variant="outline"
                                className="border-red-500/30 text-red-400"
                              >
                                {expense.category}
                              </Badge>
                            </td>
                            <td className="p-3 lg:p-4 text-sm">
                              {expense.description}
                            </td>
                            <td className="p-3 lg:p-4 font-medium text-red-400">
                              -₹{expense.amount.toLocaleString()}
                            </td>
                            <td className="p-3 lg:p-4 text-sm text-muted-foreground">
                              {new Date(expense.date).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <PieChart className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">
                      No expenses recorded
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="investments" className="mt-4 lg:mt-6">
            <Card className="glass">
              <CardHeader className="p-4 lg:p-6">
                <CardTitle>Investment Records</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {investments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[400px]">
                      <thead>
                        <tr className="border-b border-border/30 bg-slate-800/50">
                          <th className="text-left p-3 lg:p-4 text-xs lg:text-sm text-muted-foreground font-medium">
                            Description
                          </th>
                          <th className="text-left p-3 lg:p-4 text-xs lg:text-sm text-muted-foreground font-medium">
                            Amount
                          </th>
                          <th className="text-left p-3 lg:p-4 text-xs lg:text-sm text-muted-foreground font-medium">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {investments.map((investment) => (
                          <tr
                            key={investment.id}
                            className="border-b border-border/20 hover:bg-slate-800/30"
                          >
                            <td className="p-3 lg:p-4 text-sm">
                              {investment.description}
                            </td>
                            <td className="p-3 lg:p-4 font-medium text-cyan-400">
                              ₹{investment.amount.toLocaleString()}
                            </td>
                            <td className="p-3 lg:p-4 text-sm text-muted-foreground">
                              {new Date(investment.date).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Building className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">
                      No investments recorded
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Add Expense Dialog */}
      <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
        <DialogContent className="glass max-w-md w-[calc(100%-2rem)]">
          <DialogHeader>
            <DialogTitle className="gradient-text">Add Expense</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddExpense} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">Category</Label>
              <Select
                value={expenseCategory}
                onValueChange={setExpenseCategory}
              >
                <SelectTrigger className="input-dark">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Description</Label>
              <Input
                value={expenseDescription}
                onChange={(e) => setExpenseDescription(e.target.value)}
                placeholder="Monthly groceries"
                className="input-dark"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Amount (₹)</Label>
                <Input
                  type="number"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  placeholder="5000"
                  className="input-dark"
                  min="1"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Date</Label>
                <Input
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="input-dark"
                  required
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsExpenseDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-red-500 to-rose-500"
              >
                Add Expense
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Investment Dialog */}
      <Dialog
        open={isInvestmentDialogOpen}
        onOpenChange={setIsInvestmentDialogOpen}
      >
        <DialogContent className="glass max-w-md w-[calc(100%-2rem)]">
          <DialogHeader>
            <DialogTitle className="gradient-text">Add Investment</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddInvestment} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">Description</Label>
              <Input
                value={investmentDescription}
                onChange={(e) => setInvestmentDescription(e.target.value)}
                placeholder="New AC units for rooms"
                className="input-dark"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Amount (₹)</Label>
                <Input
                  type="number"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(e.target.value)}
                  placeholder="50000"
                  className="input-dark"
                  min="1"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Date</Label>
                <Input
                  type="date"
                  value={investmentDate}
                  onChange={(e) => setInvestmentDate(e.target.value)}
                  className="input-dark"
                  required
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsInvestmentDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
              >
                Add Investment
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </OwnerLayout>
  );
}
