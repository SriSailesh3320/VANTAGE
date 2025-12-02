import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';

interface LayoutProps {
    children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const location = useLocation();

    return (
        <div className="min-h-screen bg-background text-text font-sans selection:bg-white selection:text-black flex flex-col relative">

            {/* Navbar - VANTAGE Style */}
            <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md flex items-center px-8 sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <div className="w-5 h-5 bg-white flex items-center justify-center">
                        {/* Simple geometric logo */}
                        <div className="w-2 h-2 bg-black"></div>
                    </div>
                    <span className="font-sans font-medium tracking-[0.2em] text-xs text-white uppercase">
                        VANTAGE <span className="text-text-muted">//</span> SYSTEM
                    </span>
                </div>

                <nav className="ml-auto flex items-center gap-8">
                    {[
                        { path: '/', label: 'Overview' },
                        { path: '/market-intelligence', label: 'Market Intelligence' },
                    ].map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={clsx(
                                "text-[11px] font-medium uppercase tracking-[0.15em] transition-all duration-300",
                                location.pathname === item.path
                                    ? "text-white border-b border-white pb-1"
                                    : "text-text-muted hover:text-white"
                            )}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </header>

            {/* Main Content */}
            <main className="flex-1 relative z-10">
                {/* Subtle Background Texture */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.02]"
                    style={{
                        backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)',
                        backgroundSize: '60px 60px'
                    }}>
                </div>
                <div className="relative z-10 h-full">
                    {children}
                </div>
            </main>

            {/* Footer - Minimal */}
            <footer className="h-10 border-t border-border bg-background flex items-center px-8 justify-between text-[10px] font-sans text-text-muted uppercase tracking-wider relative z-10">
                <div>System Status: <span className="text-white">Active</span></div>
                <div>v2.0.0 // Monochrome</div>
            </footer>
        </div>
    );
};

export default Layout;
