import React, { useState, useEffect, useRef } from 'react';
import { ComposedChart, Bar, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Send, Bot, Activity, List, Layers, BarChart2, TrendingUp, Menu, X } from 'lucide-react';
import { clsx } from 'clsx';

const Dashboard: React.FC = () => {
    // State
    const [chartData, setChartData] = useState<any[]>([]);
    const [symbol, setSymbol] = useState('NIFTY 50');
    const [price, setPrice] = useState(24300.50);
    const [timeRange, setTimeRange] = useState('1mo');
    const [chartType, setChartType] = useState<'area' | 'candle'>('area'); // Toggle State
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'agent', content: 'VANTAGE System Online. Awaiting target asset.' }
    ]);
    const [input, setInput] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isProcessing, setIsProcessing] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const QUOTES = [
        { text: "The stock market is designed to transfer money from the Active to the Patient.", author: "Warren Buffett" },
        { text: "In the short run, the market is a voting machine but in the long run, it is a weighing machine.", author: "Benjamin Graham" },
        { text: "Know what you own, and know why you own it.", author: "Peter Lynch" },
        { text: "Time is your friend; impulse is your enemy.", author: "John C. Bogle" },
        { text: "It's not whether you're right or wrong that's important, but how much money you make when you're right.", author: "George Soros" },
        { text: "The big money is not in the buying and selling, but in the waiting.", author: "Charlie Munger" },
        { text: "The stock market is never obvious. It is designed to fool most of the people, most of the time.", author: "Jesse Livermore" },
        { text: "Don't focus on making money, focus on protecting what you have.", author: "Paul Tudor Jones" },
        { text: "He who lives by the crystal ball will eat shattered glass.", author: "Ray Dalio" },
        { text: "Bottoms in the investment world don't end with four-year lows; they end with 10- or 15-year lows.", author: "Jim Rogers" },
        { text: "The four most dangerous words in investing are: 'this time it's different'.", author: "Sir John Templeton" },
        { text: "The stock market is filled with individuals who know the price of everything, but the value of nothing.", author: "Philip Fisher" },
        { text: "Value investing is at its core the marriage of a contrarian streak and a calculator.", author: "Seth Klarman" },
        { text: "You can't predict. You can prepare.", author: "Howard Marks" },
        { text: "Don't look for the needle in the haystack. Just buy the haystack!", author: "Jack Bogle" },
        { text: "Go for a business that any idiot can run - because sooner or later, any idiot probably will.", author: "Peter Lynch" },
        { text: "Be fearful when others are greedy and greedy when others are fearful.", author: "Warren Buffett" },
        { text: "It’s not how much money you make, but how much money you keep.", author: "Robert Kiyosaki" },
        { text: "Earn with your mind, not your time.", author: "Naval Ravikant" },
        { text: "Invest in preparedness, not in prediction.", author: "Nassim Taleb" }
    ];

    const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentQuoteIndex((prev) => (prev + 1) % QUOTES.length);
        }, 10000); // Rotate every 10 seconds
        return () => clearInterval(interval);
    }, []);


    const [depthData, setDepthData] = useState<any[]>([]);
    useEffect(() => {
        const generateDepth = () => {
            const newData = [...Array(15)].map((_, i) => ({
                bidVol: Math.floor(Math.random() * 100),
                askVol: Math.floor(Math.random() * 100),
                index: i,
            }));
            setDepthData(newData);
        };

        generateDepth();                     // initial load
        const interval = setInterval(generateDepth, 5000); // refresh every 5s
        return () => clearInterval(interval);
    }, []);

    // Time Update Effect
    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    // Scroll to bottom of chat
    useEffect(() => {
        if (messagesEndRef.current) {
            const container = messagesEndRef.current.parentElement;
            if (container) {
                container.scrollTop = container.scrollHeight;
            }
        }
    }, [messages]);

    // Helper to format date based on range
    const formatDate = (isoString: string, range: string) => {
        try {
            const date = new Date(isoString);
            if (isNaN(date.getTime())) return isoString; // Fallback if invalid

            const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
            const dateStr = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).toUpperCase(); // 20 NOV 25

            if (range === '1D') return timeStr; // 10:20 AM
            if (range === '1W') return `${timeStr} ${dateStr}`; // 10:20 AM 20 NOV 25
            if (['1M', '3M', '6M', '1Y'].includes(range)) return dateStr; // Date only for longer periods (daily data)
            return dateStr;
        } catch (e) {
            return isoString;
        }
    };

    // Helper for stable mock data
    const getStockData = (sym: string) => {
        let hash = 0;
        for (let i = 0; i < sym.length; i++) hash = sym.charCodeAt(i) + ((hash << 5) - hash);
        const absHash = Math.abs(hash);

        const price = (absHash % 4000) + 100;
        const isPos = absHash % 2 === 0;
        const change = ((absHash % 100) / 10).toFixed(2);
        const changePct = ((absHash % 50) / 10).toFixed(2);

        return { price: price.toFixed(2), change, changePct, isPos };
    };

    // Fetch History Logic
    const fetchHistory = async (newRange: string, targetSymbol?: string) => {
        setTimeRange(newRange);
        const sym = targetSymbol || symbol;

        // Map UI labels to API periods
        const periodMap: Record<string, string> = {
            '1D': '1d', '1W': '5d', '1M': '1mo', '3M': '3mo',
            '6M': '6mo', '1Y': '1y'
        };

        const apiPeriod = periodMap[newRange] || '1mo';

        // If symbol is an index (NIFTY 50), we might not have history via yfinance easily without correct ticker
        // But for stocks like TCS.NS it works.
        if (sym.includes(' ')) return; // Skip for indices if they don't have proper tickers

        // Append .NS for Indian stocks if missing
        const querySym = sym.endsWith('.NS') ? sym : `${sym}.NS`;

        try {
            const response = await fetch(`http://127.0.0.1:8000/history?symbol=${querySym}&period=${apiPeriod}`);
            if (response.ok) {
                const data = await response.json();
                if (data.data && data.data.length > 0) {
                    // Pre-process data for Candlestick
                    const processedData = data.data.map((item: any) => ({
                        ...item,
                        body: [Math.min(item.open, item.close), Math.max(item.open, item.close)]
                    }));
                    setChartData(processedData);
                    // Update current price to the latest close
                    setPrice(data.data[data.data.length - 1].close);
                }
            }
        } catch (e) {
            console.error("Failed to fetch history", e);
        }
    };

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMessage = input;
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setInput('');
        setIsProcessing(true);

        try {
            const response = await fetch('http://127.0.0.1:8000/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage })
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const data = await response.json();
            const agentResponse = data.response;

            // Robust JSON Parsing
            let jsonString = null;
            let displayMessage = agentResponse;

            console.log("Raw Agent Response:", agentResponse); // Debug Log

            // 1. Try to find a markdown code block first
            const codeBlockMatch = agentResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
            if (codeBlockMatch) {
                jsonString = codeBlockMatch[1];
                displayMessage = agentResponse.replace(codeBlockMatch[0], '').trim();
            }
            // 2. If no code block, try to find the largest outer JSON object
            else {
                const firstBrace = agentResponse.indexOf('{');
                const lastBrace = agentResponse.lastIndexOf('}');

                if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                    jsonString = agentResponse.substring(firstBrace, lastBrace + 1);
                    displayMessage = agentResponse.replace(jsonString, '').trim();
                }
            }

            if (jsonString) {
                console.log("Extracted JSON String:", jsonString); // Debug Log
            } else {
                console.warn("No JSON found in response.");
            }

            if (jsonString) {
                try {
                    const jsonContent = JSON.parse(jsonString);
                    if (jsonContent.action === 'update_chart') {
                        const sym = jsonContent.symbol || symbol;
                        setSymbol(sym);

                        // If agent provided data, use it
                        if (jsonContent.data && jsonContent.data.length > 0) {
                            // Pre-process data for Candlestick if it comes from Agent too
                            const processedData = jsonContent.data.map((item: any) => ({
                                ...item,
                                body: [Math.min(item.open || item.value, item.close || item.value), Math.max(item.open || item.value, item.close || item.value)]
                            }));
                            setChartData(processedData);
                            if (jsonContent.data.length > 0) {
                                setPrice(jsonContent.data[jsonContent.data.length - 1].value);
                            }
                        } else {
                            // If no data provided (optimization), fetch it ourselves
                            console.log("Agent triggered chart update without data. Fetching manually for:", sym);
                            fetchHistory(timeRange, sym);
                        }

                        if (codeBlockMatch) {
                            displayMessage = agentResponse.replace(codeBlockMatch[0], '').trim();
                        } else displayMessage = agentResponse.replace(jsonString, '').trim();

                        if (!displayMessage) displayMessage = "Chart updated.";
                    }
                } catch (e) { console.error("Failed to parse agent JSON", e); }
            }

            setMessages(prev => [...prev, { role: 'agent', content: displayMessage }]);
        } catch (error) {
            console.error('Error:', error);
            setMessages(prev => [...prev, { role: 'agent', content: "Uplink failed. Retrying connection..." }]);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="flex flex-col md:flex-row h-auto md:h-[calc(100vh-64px)] bg-background text-text overflow-x-hidden md:overflow-hidden">

            {/* Mobile Watchlist Drawer */}
            <div className={clsx(
                "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm transition-opacity md:hidden",
                isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            )} onClick={() => setIsMobileMenuOpen(false)} />

            <div className={clsx(
                "fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-border transform transition-transform duration-300 md:hidden",
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="p-4 border-b border-border flex justify-between items-center">
                    <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                        <List className="w-3 h-3" /> Watchlist
                    </h3>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400 hover:text-white">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {[
                        'NIFTY 50', 'SENSEX', 'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 'HINDUNILVR', 'ITC', 'SBIN',
                        'BHARTIARTL', 'L&T', 'KOTAKBANK', 'AXISBANK', 'ASIANPAINT', 'HCLTECH', 'MARUTI', 'TITAN', 'BAJFINANCE', 'SUNPHARMA',
                        'NESTLEIND', 'ULTRACEMCO', 'M&M', 'WIPRO', 'POWERGRID', 'ONGC', 'NTPC', 'TATASTEEL', 'JSWSTEEL', 'ADANIENT',
                        'ADANIPORTS', 'COALINDIA', 'GRASIM', 'HDFCLIFE', 'DRREDDY', 'CIPLA', 'SBILIFE', 'BAJAJFINSV', 'TECHM', 'HINDALCO',
                        'BPCL', 'BRITANNIA', 'EICHERMOT', 'INDUSINDBANK', 'DIVISLAB', 'TATAMOTORS', 'APOLLOHOSP', 'HEROMOTOCO', 'UPL', 'TATACONSUM',
                        'ADANIGREEN', 'ADANIPOWER', 'AMBUJACEM', 'DMART', 'PIDILITIND', 'SIEMENS', 'BEL', 'IOC', 'VEDL', 'HAL',
                        'DLF', 'TRENT', 'ZOMATO', 'VBL', 'CHOLAFIN', 'BANKBARODA', 'GAIL', 'GODREJCP', 'SHREECEM', 'HAVELLS',
                        'TVSMOTOR', 'ABB', 'DABUR', 'SRF', 'CANBK', 'JIOFIN', 'LICI', 'PNB', 'RECLTD', 'TORNTPHARM',
                        'NAUKRI', 'ICICIPRULI', 'MOTHERSON', 'MARICO', 'UNITDSPR', 'POLYCAB', 'SBICARD', 'MUTHOOTFIN', 'PIIND', 'COLPAL',
                        'ICICIGI', 'BAJAJ-AUTO', 'BOSCHLTD', 'CUMMINSIND', 'M&MFIN', 'OFSS', 'PERSISTENT', 'ASTRAL', 'ASHOKLEY', 'BALKRISIND'
                    ].map((item, i) => {
                        const { price, change, changePct, isPos } = getStockData(item);

                        return (
                            <div key={i} onClick={() => { setSymbol(item); fetchHistory(timeRange, item); setIsMobileMenuOpen(false); }} className="p-3 border-b border-border/50 hover:bg-white/5 cursor-pointer transition-colors group">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs font-bold text-white group-hover:text-white transition-colors">{item}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-400 font-sans">{price}</span>
                                    <span className={clsx("text-[10px] font-sans", isPos ? "text-green-500" : "text-red-500")}>
                                        {isPos ? "+" : "-"}{change} ({changePct}%)
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Desktop Sidebar - Watchlist (Hidden on Mobile) */}
            <div className="w-64 border-r border-border bg-surface hidden md:flex flex-col">
                <div className="p-4 border-b border-border">
                    <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                        <List className="w-3 h-3" /> Watchlist
                    </h3>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {[
                        'NIFTY 50', 'SENSEX', 'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 'HINDUNILVR', 'ITC', 'SBIN',
                        'BHARTIARTL', 'L&T', 'KOTAKBANK', 'AXISBANK', 'ASIANPAINT', 'HCLTECH', 'MARUTI', 'TITAN', 'BAJFINANCE', 'SUNPHARMA',
                        'NESTLEIND', 'ULTRACEMCO', 'M&M', 'WIPRO', 'POWERGRID', 'ONGC', 'NTPC', 'TATASTEEL', 'JSWSTEEL', 'ADANIENT',
                        'ADANIPORTS', 'COALINDIA', 'GRASIM', 'HDFCLIFE', 'DRREDDY', 'CIPLA', 'SBILIFE', 'BAJAJFINSV', 'TECHM', 'HINDALCO',
                        'BPCL', 'BRITANNIA', 'EICHERMOT', 'INDUSINDBANK', 'DIVISLAB', 'TATAMOTORS', 'APOLLOHOSP', 'HEROMOTOCO', 'UPL', 'TATACONSUM',
                        'ADANIGREEN', 'ADANIPOWER', 'AMBUJACEM', 'DMART', 'PIDILITIND', 'SIEMENS', 'BEL', 'IOC', 'VEDL', 'HAL',
                        'DLF', 'TRENT', 'ZOMATO', 'VBL', 'CHOLAFIN', 'BANKBARODA', 'GAIL', 'GODREJCP', 'SHREECEM', 'HAVELLS',
                        'TVSMOTOR', 'ABB', 'DABUR', 'SRF', 'CANBK', 'JIOFIN', 'LICI', 'PNB', 'RECLTD', 'TORNTPHARM',
                        'NAUKRI', 'ICICIPRULI', 'MOTHERSON', 'MARICO', 'UNITDSPR', 'POLYCAB', 'SBICARD', 'MUTHOOTFIN', 'PIIND', 'COLPAL',
                        'ICICIGI', 'BAJAJ-AUTO', 'BOSCHLTD', 'CUMMINSIND', 'M&MFIN', 'OFSS', 'PERSISTENT', 'ASTRAL', 'ASHOKLEY', 'BALKRISIND'
                    ].map((item, i) => {
                        const { price, change, changePct, isPos } = getStockData(item);

                        return (
                            <div key={i} onClick={() => { setSymbol(item); fetchHistory(timeRange, item); }} className="p-3 border-b border-border/50 hover:bg-white/5 cursor-pointer transition-colors group">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs font-bold text-white group-hover:text-white transition-colors">{item}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-400 font-sans">{price}</span>
                                    <span className={clsx("text-[10px] font-sans", isPos ? "text-green-500" : "text-red-500")}>
                                        {isPos ? "+" : "-"}{change} ({changePct}%)
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* Top Bar */}
                <div className="h-12 border-b border-border flex items-center px-4 md:px-6 justify-between bg-surface/50">
                    <div className="flex items-center gap-4 md:gap-6">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="md:hidden p-2 -ml-2 mt-1 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        <div className="hidden md:flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="text-xs font-sans text-white uppercase tracking-wider">Live Feed</span>
                        </div>
                        <div className="h-4 w-px bg-border hidden md:block"></div>
                        <div className="text-xs font-sans text-gray-500 hidden md:block">
                            {currentTime.toLocaleTimeString()}
                        </div>
                    </div>
                    <div className="flex items-center gap-4 md:gap-6">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-sans text-gray-400">NIFTY</span>
                            <span className="text-xs font-sans text-green-500">24,300</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-sans text-gray-400">SENSEX</span>
                            <span className="text-xs font-sans text-green-500">80,100</span>
                        </div>
                        <div className="h-4 w-px bg-border hidden md:block"></div>
                        <div className="text-xs font-sans text-white hidden md:block">{symbol}: <span className="text-white">{price.toFixed(2)}</span></div>
                    </div>
                </div>

                {/* Dashboard Grid */}
                <div className="flex-1 p-4 grid grid-cols-12 md:grid-rows-6 gap-4 overflow-y-auto md:overflow-y-auto h-full">

                    {/* Main Chart */}
                    <div className="col-span-12 md:col-span-9 h-[400px] md:h-auto md:row-span-4 bg-surface border border-border p-4 relative group flex flex-col">
                        {chartData.length > 0 && (
                            <div className="absolute top-4 left-4 z-10 flex flex-col">
                                <span className="text-lg font-medium text-white">{symbol}</span>
                                <span className="text-xs text-gray-500 font-sans">NSE // {timeRange} INTERVAL</span>
                            </div>
                        )}

                        {/* Chart Controls (Time Range + Toggle) */}
                        {chartData.length > 0 && (
                            <div className="absolute top-4 right-4 z-10 flex items-center gap-3">
                                {/* Toggle */}
                                <div className="flex bg-black/40 backdrop-blur-sm p-0.5 rounded border border-white/10">
                                    <button
                                        onClick={() => setChartType('area')}
                                        className={clsx(
                                            "p-1 rounded-sm transition-colors",
                                            chartType === 'area' ? "bg-white text-black" : "text-gray-400 hover:text-white"
                                        )}
                                        title="Area Chart"
                                    >
                                        <TrendingUp className="w-3 h-3" />
                                    </button>
                                    <button
                                        onClick={() => setChartType('candle')}
                                        className={clsx(
                                            "p-1 rounded-sm transition-colors",
                                            chartType === 'candle' ? "bg-white text-black" : "text-gray-400 hover:text-white"
                                        )}
                                        title="Candlestick Chart"
                                    >
                                        <BarChart2 className="w-3 h-3" />
                                    </button>
                                </div>

                                {/* Time Range */}
                                <div className="flex gap-1 bg-black/40 backdrop-blur-sm p-1 rounded border border-white/10">
                                    {['1D', '1W', '1M', '3M', '6M', '1Y'].map((range) => (
                                        <button
                                            key={range}
                                            onClick={() => fetchHistory(range)}
                                            className={clsx(
                                                "px-2 py-1 text-[10px] font-sans transition-colors rounded-sm",
                                                timeRange === range
                                                    ? "bg-white text-black font-bold"
                                                    : "text-gray-400 hover:text-white hover:bg-white/10"
                                            )}
                                        >
                                            {range}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex-1 min-h-0">
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorValueGreen" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorValueRed" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" vertical={false} />
                                        <XAxis
                                            dataKey="time"
                                            hide
                                            type="category" // Ensures no gaps for missing dates
                                        />
                                        <YAxis domain={['auto', 'auto']} orientation="right" tick={{ fontSize: 10, fill: '#666' }} axisLine={false} tickLine={false} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#000', borderColor: '#333', color: '#FFF' }}
                                            itemStyle={{ color: '#FFF' }}
                                            cursor={{ stroke: '#333', strokeWidth: 1 }}
                                            labelFormatter={(label) => formatDate(label, timeRange)}
                                            formatter={(value: any, name: any, props: any) => {
                                                if (chartType === 'candle') {
                                                    if (name === 'body') return [props.payload.close, 'Close'];
                                                    return [value, name];
                                                }
                                                return [`₹${value}`, 'Price'];
                                            }}
                                        />

                                        {chartType === 'area' && (() => {
                                            const firstOpen = chartData.length > 0 ? chartData[0].open : 0;
                                            const lastClose = chartData.length > 0 ? chartData[chartData.length - 1].close : 0;
                                            const isTrendPositive = lastClose >= firstOpen;
                                            const color = isTrendPositive ? "#22c55e" : "#ef4444";
                                            const gradientId = isTrendPositive ? "url(#colorValueGreen)" : "url(#colorValueRed)";

                                            return (
                                                <Area
                                                    type="monotone"
                                                    dataKey="close"
                                                    stroke={color}
                                                    fillOpacity={1}
                                                    fill={gradientId}
                                                    strokeWidth={2}
                                                />
                                            );
                                        })()}

                                        {chartType === 'candle' && (
                                            <Bar dataKey="body" shape={(props: any) => {
                                                const { x, y, width, height, payload } = props;
                                                const { open, close, high, low } = payload;

                                                const isGreen = close >= open;
                                                const color = isGreen ? "#22c55e" : "#ef4444";

                                                // Calculate pixel ratio
                                                const bodyRange = Math.abs(open - close);
                                                const pixelPerUnit = bodyRange === 0 ? 0 : height / bodyRange;

                                                const maxBody = Math.max(open, close);
                                                const minBody = Math.min(open, close);

                                                let wickTopY = y;
                                                let wickBottomY = y + height;

                                                if (pixelPerUnit > 0) {
                                                    wickTopY = y - (high - maxBody) * pixelPerUnit;
                                                    wickBottomY = y + height + (minBody - low) * pixelPerUnit;
                                                }

                                                return (
                                                    <g>
                                                        {/* Wick */}
                                                        <line x1={x + width / 2} y1={wickTopY} x2={x + width / 2} y2={wickBottomY} stroke={color} strokeWidth={1} />
                                                        {/* Body */}
                                                        <rect x={x} y={y} width={width} height={Math.max(height, 1)} fill={color} />
                                                    </g>
                                                );
                                            }}>
                                            </Bar>
                                        )}
                                    </ComposedChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                                    <div key={currentQuoteIndex} className="animate-fade-in flex flex-col items-center">
                                        <blockquote className="text-xl font-light text-white italic mb-4 max-w-2xl">
                                            "{QUOTES[currentQuoteIndex].text}"
                                        </blockquote>
                                        <cite className="text-xs font-sans text-gray-500 uppercase tracking-widest">
                                            — {QUOTES[currentQuoteIndex].author}
                                        </cite>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 🔥 Market Depth — Auto Refresh */}
                    <div className="col-span-12 md:col-span-3 h-[300px] md:h-auto md:row-span-4 bg-surface border border-border flex flex-col">
                        <div className="p-3 border-b border-border">
                            <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                                <Layers className="w-3 h-3" /> Market Depth // {symbol}
                            </h3>
                        </div>
                        <div className="flex-1 p-2 font-sans text-[10px] overflow-hidden flex flex-col">
                            <div className="grid grid-cols-3 text-gray-500 mb-2 px-2 text-center border-b border-border/30 pb-1">
                                <span>VOL</span>
                                <span>BID</span>
                                <span>ASK</span>
                            </div>
                            <div className="space-y-0.5 overflow-y-auto">
                                {depthData.map(({ bidVol, askVol, index }) => (
                                    <div key={index} className="grid grid-cols-3 gap-1 relative group hover:bg-white/5">
                                        <div className="absolute right-1/2 top-0 bottom-0 bg-green-500/10" style={{ width: `${(bidVol / 100) * 40}%` }} />
                                        <div className="absolute left-1/2 top-0 bottom-0 bg-red-500/10" style={{ width: `${(askVol / 100) * 40}%` }} />
                                        <span className="text-gray-600 text-right pr-2">{bidVol + askVol}</span>
                                        <span className="text-green-400 text-right pr-2">{(price - (index + 1) * 0.5).toFixed(2)}</span>
                                        <span className="text-red-400 text-left pl-2">{(price + (index + 1) * 0.5).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Positions */}
                    <div className="col-span-12 md:col-span-8 md:row-span-2 bg-surface border border-border p-4">
                        <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Activity className="w-3 h-3" /> Active Positions
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { sym: 'RELIANCE', qty: 50, pnl: '+1,240.00' },
                                { sym: 'TCS', qty: 25, pnl: '-450.50' },
                                { sym: 'HDFCBANK', qty: 100, pnl: '+3,100.00' }
                            ].map((pos, i) => (
                                <div key={i} className="bg-background border border-border p-3 flex justify-between items-center">
                                    <div>
                                        <div className="text-xs font-bold text-white">{pos.sym}</div>
                                        <div className="text-[10px] text-gray-500">QTY: {pos.qty}</div>
                                    </div>
                                    <div className={clsx("text-xs font-sans", pos.pnl.startsWith('+') ? "text-white" : "text-gray-500")}>
                                        {pos.pnl}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Agent Chat */}
                    <div className="col-span-12 md:col-span-4 row-span-2 bg-surface border border-border flex flex-col">
                        <div className="p-2 border-b border-border bg-surface-light flex justify-between items-center">
                            <h3 className="text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-2">
                                <Bot className="w-3 h-3" /> VANTAGE Agent
                            </h3>
                            <div className={clsx("w-1.5 h-1.5 rounded-full", isProcessing ? "bg-yellow-500 animate-ping" : "bg-white animate-pulse")}></div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-2 space-y-2">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={clsx("flex flex-col gap-0.5", msg.role === 'user' ? "items-end" : "items-start")}>
                                    <div className={clsx(
                                        "max-w-[90%] p-2 text-[11px] font-sans border",
                                        msg.role === 'agent'
                                            ? "bg-background border-border text-gray-300"
                                            : "bg-white text-black border-white"
                                    )}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-2 border-t border-border">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Execute command..."
                                    disabled={isProcessing}
                                    className="w-full bg-background border border-border pl-3 pr-8 py-1.5 text-xs text-white focus:outline-none focus:border-white font-sans placeholder:text-gray-700 disabled:opacity-50"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={isProcessing}
                                    className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-white transition-colors disabled:opacity-50"
                                >
                                    <Send className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

        </div>
    );
};

export default Dashboard;
