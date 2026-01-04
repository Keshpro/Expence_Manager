import { useEffect, useState } from "react";
import api from "@/services/api";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Trash2, Calendar as CalendarIcon, ArrowUpCircle, ArrowDownCircle } from "lucide-react";

export default function Expenses() {
    const [expenses, setExpenses] = useState([]);
    const [date, setDate] = useState();

    const [formData, setFormData] = useState({
        title: "",
        amount: "",
        category: "",
        date: "",
        description: "",
    });

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = () => {
        api.get("/expenses")
            .then((res) => setExpenses(res.data))
            .catch((err) => console.error(err));
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCategoryChange = (value) => {
        setFormData({ ...formData, category: value });
    };

    const handleDateSelect = (selectedDate) => {
        setDate(selectedDate);
        if (selectedDate) {
            setFormData({ ...formData, date: format(selectedDate, "yyyy-MM-dd") });
        } else {
            setFormData({ ...formData, date: "" });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.category) return alert("Please select a category!");
        if (!formData.date) return alert("Please select a date!");

        const newExpense = {
            ...formData,
            amount: parseFloat(formData.amount),
            type: "EXPENSE" // මෙතනින් දාන හැම එකම වියදමක් විදිහට සලකනවා
        };

        api.post("/expenses", newExpense)
            .then(() => {
                fetchExpenses();
                setFormData({ title: "", amount: "", category: "", date: "", description: "" });
                setDate(undefined);
            })
            .catch((err) => console.error(err));
    };

    const handleDelete = (id) => {
        if(window.confirm("Are you sure?")) {
            api.delete(`/expenses/${id}`).then(() => fetchExpenses());
        }
    };

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold text-white">Manage Expenses</h1>

            {/* Add Expense Form */}
            <Card className="bg-zinc-900 border-zinc-800 text-white">
                <CardHeader><CardTitle>Add New Expense</CardTitle></CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2"><Label>Title</Label><Input name="title" placeholder="e.g. Lunch" value={formData.title} onChange={handleChange} className="bg-zinc-950 border-zinc-700 text-white" required /></div>
                        <div className="space-y-2"><Label>Amount (LKR)</Label><Input name="amount" type="number" placeholder="0.00" value={formData.amount} onChange={handleChange} className="bg-zinc-950 border-zinc-700 text-white" required /></div>
                        <div className="space-y-2"><Label>Category</Label>
                            <Select onValueChange={handleCategoryChange} value={formData.category}>
                                <SelectTrigger className="bg-zinc-950 border-zinc-700 text-white"><SelectValue placeholder="Select Category" /></SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                    <SelectItem value="Food">Food</SelectItem>
                                    <SelectItem value="Transport">Transport</SelectItem>
                                    <SelectItem value="Housing">Housing</SelectItem>
                                    <SelectItem value="Utilities">Utilities</SelectItem>
                                    <SelectItem value="Entertainment">Entertainment</SelectItem>
                                    <SelectItem value="Health">Health</SelectItem>
                                    <SelectItem value="Shopping">Shopping</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2 flex flex-col"><Label className="mb-1">Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal bg-zinc-950 border-zinc-700 text-white hover:bg-zinc-900 hover:text-white", !date && "text-zinc-500")}>
                                        <CalendarIcon className="mr-2 h-4 w-4" />{date ? format(date, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 bg-zinc-900 border-zinc-800 text-white" align="start">
                                    <Calendar mode="single" selected={date} onSelect={handleDateSelect} initialFocus className="p-3 bg-zinc-900 text-white" />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="md:col-span-2"><Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold text-white">Add Expense</Button></div>
                    </form>
                </CardContent>
            </Card>

            {/* Transaction List */}
            <Card className="bg-zinc-900 border-zinc-800 text-white">
                <CardHeader><CardTitle>All Transactions</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-zinc-700 hover:bg-zinc-900">
                                <TableHead className="text-zinc-400">Date</TableHead>
                                <TableHead className="text-zinc-400">Title</TableHead>
                                <TableHead className="text-zinc-400">Category</TableHead>
                                <TableHead className="text-right text-zinc-400">Amount</TableHead>
                                <TableHead className="text-right text-zinc-400">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {expenses.length === 0 ? (
                                <TableRow><TableCell colSpan={5} className="text-center text-zinc-500 py-6">No transactions found.</TableCell></TableRow>
                            ) : (
                                expenses.map((expense) => {
                                    const isIncome = expense.type === "INCOME"; // Income ද කියලා බලනවා
                                    return (
                                        <TableRow key={expense.id} className="border-zinc-800 hover:bg-zinc-800 transition-colors">
                                            <TableCell>{expense.date}</TableCell>
                                            <TableCell className="font-medium flex items-center gap-2">
                                                {isIncome ? <ArrowDownCircle className="h-4 w-4 text-emerald-500"/> : <ArrowUpCircle className="h-4 w-4 text-red-500"/>}
                                                {expense.title}
                                            </TableCell>
                                            <TableCell><span className="px-2 py-1 rounded-full bg-zinc-800 text-xs text-zinc-300 border border-zinc-700">{expense.category}</span></TableCell>
                                            <TableCell className={`text-right font-bold ${isIncome ? "text-emerald-500" : "text-red-500"}`}>
                                                {isIncome ? "+" : "-"} LKR {expense.amount.toFixed(2)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-red-500 hover:bg-red-950/20" onClick={() => handleDelete(expense.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}