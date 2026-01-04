import { useEffect, useState } from "react";
import api from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowDownIcon, ArrowUpIcon, Wallet, TrendingDown, TrendingUp, PlusCircle } from "lucide-react";
import { format, subMonths, parseISO, isSameMonth } from "date-fns";

export default function Dashboard() {
    const [transactions, setTransactions] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(new Date());

    const [incomeAmount, setIncomeAmount] = useState("");
    const [incomeOpen, setIncomeOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = () => {
        api.get("/expenses")
            .then((res) => setTransactions(res.data))
            .catch((err) => console.error(err));
    };

    // --- Logic ---
    const totalIncome = transactions
        .filter(t => t.type === "INCOME")
        .reduce((acc, curr) => acc + curr.amount, 0);

    const totalAllExpenses = transactions
        .filter(t => t.type === "EXPENSE")
        .reduce((acc, curr) => acc + curr.amount, 0);

    const walletBalance = totalIncome - totalAllExpenses;

    const currentMonthExpenses = transactions
        .filter(t => t.type === "EXPENSE" && isSameMonth(parseISO(t.date), selectedMonth))
        .reduce((acc, curr) => acc + curr.amount, 0);

    const lastMonthDate = subMonths(selectedMonth, 1);
    const lastMonthExpenses = transactions
        .filter(t => t.type === "EXPENSE" && isSameMonth(parseISO(t.date), lastMonthDate))
        .reduce((acc, curr) => acc + curr.amount, 0);

    let percentageChange = 0;
    if (lastMonthExpenses > 0) {
        percentageChange = ((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100;
    } else if (currentMonthExpenses > 0) {
        percentageChange = 100;
    }

    // Wallet History (Income only) - අලුත්ම 5
    const recentIncomes = transactions
        .filter(t => t.type === "INCOME")
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    const handleAddIncome = () => {
        if (!incomeAmount) return;

        const newIncome = {
            title: "Wallet Deposit",
            amount: parseFloat(incomeAmount),
            category: "Income",
            date: format(new Date(), "yyyy-MM-dd"),
            description: "Added to wallet",
            type: "INCOME"
        };

        api.post("/expenses", newIncome)
            .then(() => {
                fetchData();
                setIncomeOpen(false);
                setIncomeAmount("");
            })
            .catch((err) => console.error(err));
    };

    return (
        <div className="p-6 space-y-6">

            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
                <Select
                    onValueChange={(val) => setSelectedMonth(new Date(val))}
                    defaultValue={format(new Date(), "yyyy-MM")}
                >
                    <SelectTrigger className="w-[180px] bg-zinc-900 border-zinc-800 text-white">
                        <SelectValue placeholder="Select Month" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                        {[0, 1, 2, 3, 4, 5].map((i) => {
                            const date = subMonths(new Date(), i);
                            const value = format(date, "yyyy-MM");
                            const label = format(date, "MMMM yyyy");
                            return <SelectItem key={value} value={value}>{label}</SelectItem>;
                        })}
                    </SelectContent>
                </Select>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-zinc-900 border-zinc-800 text-white relative overflow-hidden">
                    <div className="absolute right-0 top-0 h-full w-2 bg-gradient-to-b from-emerald-500 to-green-600"></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Wallet Balance</CardTitle>
                        <Wallet className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white mb-2">LKR {walletBalance.toFixed(2)}</div>
                        <Dialog open={incomeOpen} onOpenChange={setIncomeOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="bg-emerald-950/30 text-emerald-500 border-emerald-900 hover:bg-emerald-900 hover:text-emerald-400 w-full mt-2">
                                    <PlusCircle className="mr-2 h-4 w-4" /> Add Money
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-zinc-950 border-zinc-800 text-white">
                                <DialogHeader>
                                    <DialogTitle>Add Money to Wallet</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label>Amount (LKR)</Label>
                                        <Input
                                            type="number"
                                            value={incomeAmount}
                                            onChange={(e) => setIncomeAmount(e.target.value)}
                                            className="bg-zinc-900 border-zinc-700 text-white"
                                            placeholder="50000.00"
                                        />
                                    </div>
                                    <Button onClick={handleAddIncome} className="w-full bg-emerald-600 hover:bg-emerald-700">Confirm Deposit</Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-900 border-zinc-800 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Expenses ({format(selectedMonth, "MMM")})</CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">LKR {currentMonthExpenses.toFixed(2)}</div>
                        <p className="text-xs text-zinc-500 mt-2 flex items-center">
                            {percentageChange > 0 ? (
                                <>
                                    <ArrowUpIcon className="h-4 w-4 text-red-500 mr-1" />
                                    <span className="text-red-500">{percentageChange.toFixed(1)}%</span>
                                    <span className="ml-1">Higher than last month</span>
                                </>
                            ) : percentageChange < 0 ? (
                                <>
                                    <ArrowDownIcon className="h-4 w-4 text-emerald-500 mr-1" />
                                    <span className="text-emerald-500">{Math.abs(percentageChange).toFixed(1)}%</span>
                                    <span className="ml-1">Lower than last month</span>
                                </>
                            ) : "No change"}
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-900 border-zinc-800 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Last Month ({format(lastMonthDate, "MMM")})</CardTitle>
                        <TrendingUp className="h-4 w-4 text-zinc-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-zinc-400">LKR {lastMonthExpenses.toFixed(2)}</div>
                        <p className="text-xs text-zinc-500 mt-2">Comparison base</p>
                    </CardContent>
                </Card>
            </div>

            {/* --- New Section: Recent Wallet History --- */}
            <Card className="bg-zinc-900 border-zinc-800 text-white">
                <CardHeader>
                    <CardTitle>Recent Wallet Deposits</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-zinc-700 hover:bg-zinc-900">
                                <TableHead className="text-zinc-400">Date</TableHead>
                                <TableHead className="text-zinc-400">Description</TableHead>
                                <TableHead className="text-right text-zinc-400">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentIncomes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center text-zinc-500">No deposits found.</TableCell>
                                </TableRow>
                            ) : (
                                recentIncomes.map((inc) => (
                                    <TableRow key={inc.id} className="border-zinc-800 hover:bg-zinc-800">
                                        <TableCell>{inc.date}</TableCell>
                                        <TableCell className="font-medium">{inc.title}</TableCell>
                                        <TableCell className="text-right text-emerald-500 font-bold">
                                            + LKR {inc.amount.toFixed(2)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

        </div>
    );
}