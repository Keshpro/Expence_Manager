import { Link, Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Layout() {
    const location = useLocation();
    const menuItems = [
        { name: "Dashboard", path: "/" },
        { name: "Expenses", path: "/expenses" },
        { name: "Reports", path: "/reports" },
    ];

    return (
        <div className="flex min-h-screen bg-zinc-950 text-white font-sans">
            <aside className="w-64 border-r border-zinc-800 p-6 flex flex-col">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                        ExpensePro
                    </h1>
                </div>
                <nav className="flex flex-col gap-2">
                    {menuItems.map((item) => (
                        <Link key={item.path} to={item.path}>
                            <Button
                                variant="ghost"
                                className={`w-full justify-start text-lg ${
                                    location.pathname === item.path
                                        ? "bg-zinc-800 text-white"
                                        : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                                }`}
                            >
                                {item.name}
                            </Button>
                        </Link>
                    ))}
                </nav>
            </aside>
            <main className="flex-1">
                <header className="border-b border-zinc-800 p-6 flex justify-between items-center bg-zinc-950/50 backdrop-blur">
                    <h2 className="text-xl font-semibold text-zinc-200">Welcome Back 👋</h2>
                    <div className="h-10 w-10 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-500 font-bold">K</div>
                </header>
                <div className="bg-zinc-950 min-h-[calc(100vh-80px)]">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}