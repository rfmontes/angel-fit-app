import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, LogOut, Menu, Sun, Moon } from 'lucide-react';
import { useStore } from '../lib/store';

export default function Layout() {
    const location = useLocation();
    const { fetchData } = useStore();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Dark Mode State
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('theme') === 'dark' ||
            (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    });

    useEffect(() => {
        fetchData();
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);

    const navItems = [
        { path: '/', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/inventory', label: 'Estoque', icon: Package },
        { path: '/sales', label: 'Vendas', icon: ShoppingCart },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col md:flex-row transition-colors duration-300">
            {/* Mobile Header (Fixed) */}
            <div className="md:hidden fixed top-0 w-full z-20 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center transition-colors duration-300">
                <div className="flex items-center justify-center w-full relative">
                    <h1 className="text-4xl font-normal text-pink-600 dark:text-pink-400 font-['Great_Vibes'] tracking-wider drop-shadow-sm">Angel Fit</h1>
                    <div className="absolute right-0 flex items-center gap-4">
                        <button onClick={() => setDarkMode(!darkMode)} className="text-gray-500 dark:text-gray-400">
                            {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Sidebar (Desktop) */}
            <nav className="hidden md:flex bg-white dark:bg-gray-800 shadow-md z-10 w-64 h-screen flex-col border-r border-gray-100 dark:border-gray-700 transition-colors duration-300">
                <div className="p-6 flex items-center justify-center border-b border-gray-100 dark:border-gray-700">
                    <h1 className="text-4xl font-normal text-pink-600 dark:text-pink-400 font-['Great_Vibes'] tracking-widest drop-shadow-md whitespace-nowrap">Angel Fit</h1>
                </div>

                <div className="flex-1 overflow-y-auto py-4">
                    <ul className="space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <li key={item.path}>
                                    <Link
                                        to={item.path}
                                        className={`flex items-center px-6 py-3 transition-colors ${isActive
                                            ? 'text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/20 border-r-4 border-pink-600 dark:border-pink-400'
                                            : 'text-gray-500 dark:text-gray-400 hover:text-pink-500 dark:hover:text-pink-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                            }`}
                                    >
                                        <Icon className="w-5 h-5 mr-3" />
                                        <span className="text-sm font-medium">{item.label}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <button onClick={() => setDarkMode(!darkMode)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition">
                        {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                    <button className="flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                        <LogOut className="w-5 h-5 mr-2" />
                        <span className="text-sm font-medium">Sair</span>
                    </button>
                </div>
            </nav>

            {/* Mobile Navigation (Bottom Fixed or just rely on fixed top? Let's use a Sticky Sub-header for tabs in Sales... 
               Actually for general nav on mobile, a bottom bar or just the top links is common. 
               Let's stick to the previous 'flex-col' structure but adapted.
               The previous code had navItems in a horizontal scroll/flex list. Let's make that a fixed bottom bar for mobile to ensure easy access.
            */}
            <div className="md:hidden fixed bottom-0 w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-20 flex justify-around p-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex flex-col items-center p-2 rounded-lg ${isActive ? 'text-pink-600 dark:text-pink-400' : 'text-gray-500 dark:text-gray-400'}`}
                        >
                            <Icon className="w-6 h-6" />
                            <span className="text-[10px] mt-1">{item.label}</span>
                        </Link>
                    );
                })}
            </div>

            {/* Main Content */}
            {/* Added top padding for mobile header and bottom padding for mobile nav */}
            <main className="flex-1 overflow-auto p-4 md:p-8 pt-20 pb-24 md:pt-8 md:pb-8 transition-colors duration-300">
                <Outlet />
            </main>
        </div>
    );
}
