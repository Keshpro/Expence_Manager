import { useEffect, useState } from "react";
import api from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

export default function Reports() {
    const [chartData, setChartData] = useState([]);
    const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF"];

    useEffect(() => {
        api.get("/expenses").then((res) => processDataForCharts(res.data));
    }, []);

    const processDataForCharts = (data) => {
        const categoryTotals = {};
        data.forEach((item) => {
            categoryTotals[item.category] = (categoryTotals[item.category] || 0) + item.amount;
        });
        const formattedData = Object.keys(categoryTotals).map((key, index) => ({
            name: key, value: categoryTotals[key], fill: COLORS[index % COLORS.length]
        }));
        setChartData(formattedData);
    };

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold text-white">Financial Analysis</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-zinc-900 border-zinc-800 text-white">
                    <CardHeader><CardTitle>Spending Distribution</CardTitle></CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                        {chartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.fill} />))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", color: "#fff" }} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-900 border-zinc-800 text-white">
                    <CardHeader><CardTitle>Expenses by Category</CardTitle></CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                                    <XAxis dataKey="name" stroke="#a1a1aa" />
                                    <YAxis stroke="#a1a1aa" />
                                    <Tooltip contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", color: "#fff" }} cursor={{fill: '#27272a'}} />
                                    <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}