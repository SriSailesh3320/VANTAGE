import React, { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Send, Bot, Activity, List, Layers } from 'lucide-react';
import { clsx } from 'clsx';

const Dashboard: React.FC = () => {
    // State
    const [chartData, setChartData] = useState<any[]>([]);
    const [symbol, setSymbol] = useState('NIFTY 50');
    const [price, setPrice] = useState(24300.50);
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
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

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

            // Parse JSON
            let jsonString = null;
            let displayMessage = agentResponse;

            const codeBlockMatch = agentResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
            if (codeBlockMatch) jsonString = codeBlockMatch[1];

            if (!jsonString) {
                const actionIndex = agentResponse.indexOf('"action": "update_chart"');
                if (actionIndex !== -1) {
                    const startBrace = agentResponse.lastIndexOf('{', actionIndex);
                    if (startBrace !== -1) {
                        let braceCount = 0;
                        let endBrace = -1;
                        for (let i = startBrace; i < agentResponse.length; i++) {
                            if (agentResponse[i] === '{') braceCount++;
                            else if (agentResponse[i] === '}') braceCount--;
                            if (braceCount === 0) { endBrace = i; break; }
                        }
                        if (endBrace !== -1) jsonString = agentResponse.substring(startBrace, endBrace + 1);
                    }
                }
            }

            if (jsonString) {
                try {
                    const jsonContent = JSON.parse(jsonString);
                    if (jsonContent.action === 'update_chart' && jsonContent.data) {
                        setChartData(jsonContent.data);
                        setSymbol(jsonContent.symbol || symbol);
                        if (jsonContent.data.length > 0) {
                            setPrice(jsonContent.data[jsonContent.data.length - 1].value);
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
        <div className="flex h-[calc(100vh-64px)] bg-background text-text overflow-hidden">

            {/* Left Sidebar - Watchlist */}
            <div className="w-64 border-r border-border bg-surface hidden md:flex flex-col">
                <div className="p-4 border-b border-border">
                    <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                        <List className="w-3 h-3" /> Watchlist
                    </h3>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {['NIFTY 50', 'SENSEX', 'RELIANCE', 'TCS', 'INFY', 'HDFCBANK'].map((item, i) => (
                        <div key={i} className="p-4 border-b border-border/50 hover:bg-white/5 cursor-pointer transition-colors group">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-bold text-white group-hover:text-white transition-colors">{item}</span>
                                <span className={clsx("text-xs font-sans", i % 2 === 0 ? "text-white" : "text-gray-500")}>
                                    {i % 2 === 0 ? "+0.45%" : "-0.12%"}
                                </span>
                            </div>
                            <div className="text-xs text-gray-500 font-sans">
                                {(2400 + i * 100).toFixed(2)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* Top Bar */}
                <div className="h-12 border-b border-border flex items-center px-6 justify-between bg-surface/50">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="text-xs font-sans text-white uppercase tracking-wider">Live Feed</span>
                        </div>
                        <div className="h-4 w-px bg-border"></div>
                        <div className="text-xs font-sans text-gray-500">
                            {currentTime.toLocaleTimeString()}
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-xs font-sans text-white">{symbol}: <span className="text-white">{price.toFixed(2)}</span></div>
                    </div>
                </div>

                {/* Dashboard Grid */}
                <div className="flex-1 p-4 grid grid-cols-12 grid-rows-6 gap-4 overflow-y-auto">

                    {/* Main Chart */}
                    <div className="col-span-12 md:col-span-9 row-span-4 bg-surface border border-border p-4 relative group flex flex-col">
                        {chartData.length > 0 && (
                            <div className="absolute top-4 left-4 z-10 flex flex-col">
                                <span className="text-lg font-medium text-white">{symbol}</span>
                                <span className="text-xs text-gray-500 font-sans">NSE // 1 MO INTERVAL</span>
                            </div>
                        )}

                        <div className="flex-1 min-h-0">
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#FFFFFF" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" vertical={false} />
                                        <XAxis dataKey="time" hide />
                                        <YAxis domain={['auto', 'auto']} orientation="right" tick={{ fontSize: 10, fill: '#666' }} axisLine={false} tickLine={false} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#000', borderColor: '#333', color: '#FFF' }}
                                            itemStyle={{ color: '#FFF' }}
                                            cursor={{ stroke: '#333', strokeWidth: 1 }}
                                        />
                                        <Area type="monotone" dataKey="value" stroke="#FFFFFF" strokeWidth={1.5} fillOpacity={1} fill="url(#colorValue)" />
                                    </AreaChart>
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
                    <div className="col-span-12 md:col-span-3 row-span-4 bg-surface border border-border flex flex-col">
                        <div className="p-3 border-b border-border">
                            <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                                <Layers className="w-3 h-3" /> Market Depth
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
                    <div className="col-span-12 md:col-span-8 row-span-2 bg-surface border border-border p-4">
                        <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Activity className="w-3 h-3" /> Active Positions
                        </h3>
                        <div className="grid grid-cols-3 gap-4">
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
