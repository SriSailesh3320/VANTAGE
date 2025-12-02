import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import DotGridBackground from '../components/DotGridBackground';

const Documentation: React.FC = () => {
    return (
        <div className="min-h-screen bg-black text-gray-300 font-sans relative overflow-hidden selection:bg-white/30">

            {/* Background */}
            <div className="fixed inset-0 z-0">
                <DotGridBackground />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black pointer-events-none"></div>
            </div>

            {/* Content Container - Flexxi Style (Centered, Narrow) */}
            <div className="relative z-10 max-w-3xl mx-auto px-6 py-24 md:py-32">

                {/* Navigation */}
                <Link to="/" className="inline-flex items-center gap-2 text-xs font-medium tracking-widest text-gray-500 hover:text-white uppercase mb-16 transition-colors group">
                    <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                    Return to Terminal
                </Link>

                {/* Header */}
                <header className="mb-24 space-y-6">
                    <div className="inline-block px-3 py-1 border border-white/20 rounded-full">
                        <span className="text-[10px] font-medium tracking-[0.2em] text-white uppercase">Technical Whitepaper v2.0</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-light text-white tracking-tighter leading-[0.9]">
                        System Architecture & <br />
                        <span className="text-gray-500">Operational Logic</span>
                    </h1>
                    <p className="text-xl text-gray-400 font-light leading-relaxed max-w-2xl mt-8">
                        VANTAGE represents a paradigm shift in financial intelligence—moving from passive data analysis to autonomous, agentic decision making.
                    </p>
                </header>

                {/* Main Content */}
                <div className="space-y-32">

                    {/* Section 1: The Philosophy */}
                    <section className="space-y-8">
                        <h2 className="text-3xl font-light text-white tracking-tight">01. The Agency Paradigm</h2>
                        <div className="space-y-6 text-lg font-light leading-relaxed text-gray-400">
                            <p>
                                Traditional algorithmic trading relies on rigid, pre-defined rules. While fast, these systems lack the adaptability to navigate the nuance of modern market sentiment. Large Language Models (LLMs) introduced reasoning, but often exist in a vacuum, disconnected from real-time execution.
                            </p>
                            <p>
                                <strong className="text-white font-medium">Agentic AI</strong> bridges this gap.
                            </p>
                            <p>
                                VANTAGE is not a chatbot. It is a system of autonomous agents capable of perception, reasoning, and action. It doesn't just "read" the market; it interprets intent, formulates strategies, and executes them with sub-millisecond precision, all while continuously learning from the outcomes.
                            </p>
                        </div>
                    </section>

                    {/* Section 2: Architecture */}
                    <section className="space-y-12">
                        <h2 className="text-3xl font-light text-white tracking-tight">02. System Architecture</h2>

                        {/* Subsection: The Core */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-medium text-white">The Neural Core</h3>
                            <p className="text-lg font-light leading-relaxed text-gray-400">
                                At the heart of VANTAGE lies a high-dimensional vector space. Market data—price action, news articles, earnings calls, and social sentiment—is ingested in real-time, normalized, and embedded into this shared latent space. This allows the system to draw semantic connections between seemingly unrelated events (e.g., a supply chain disruption in Taiwan and a tech stock dip in NASDAQ).
                            </p>
                        </div>

                        {/* Subsection: The Swarm */}
                        <div className="space-y-8">
                            <h3 className="text-xl font-medium text-white">The Agent Swarm</h3>
                            <div className="grid grid-cols-1 gap-8">
                                <div className="border-l border-white/20 pl-6 space-y-2">
                                    <h4 className="text-white font-medium tracking-wide uppercase text-sm">Analyst Agent</h4>
                                    <p className="text-gray-500 font-light">
                                        Continuously scans the vector database for anomalies. It synthesizes technical indicators (RSI, MACD) with fundamental data to generate probabilistic market scenarios.
                                    </p>
                                </div>
                                <div className="border-l border-white/20 pl-6 space-y-2">
                                    <h4 className="text-white font-medium tracking-wide uppercase text-sm">Execution Agent</h4>
                                    <p className="text-gray-500 font-light">
                                        Responsible for the "last mile" of the trade. It optimizes for slippage and liquidity, determining the optimal routing for order entry.
                                    </p>
                                </div>
                                <div className="border-l border-white/20 pl-6 space-y-2">
                                    <h4 className="text-white font-medium tracking-wide uppercase text-sm">Risk Agent</h4>
                                    <p className="text-gray-500 font-light">
                                        The "brake" of the system. It monitors portfolio exposure and volatility in real-time, holding veto power over any trade that violates risk parameters.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section 3: Technical Stack */}
                    <section className="space-y-8">
                        <h2 className="text-3xl font-light text-white tracking-tight">03. Technical Specifications</h2>
                        <div className="space-y-6 text-lg font-light leading-relaxed text-gray-400">
                            <p>
                                VANTAGE is built for speed and resilience. The frontend is a highly optimized React application using hardware-accelerated canvas rendering for visualization. The backend is a Python-based asynchronous microservices architecture.
                            </p>
                            <ul className="space-y-4 mt-8 border-t border-white/10 pt-8">
                                <li className="flex justify-between items-center">
                                    <span className="text-gray-500">Frontend Framework</span>
                                    <span className="text-white font-mono text-sm">React / Vite / TypeScript</span>
                                </li>
                                <li className="flex justify-between items-center">
                                    <span className="text-gray-500">API Layer</span>
                                    <span className="text-white font-mono text-sm">FastAPI / WebSockets</span>
                                </li>
                                <li className="flex justify-between items-center">
                                    <span className="text-gray-500">Inference Engine</span>
                                    <span className="text-white font-mono text-sm">PyTorch / Transformers</span>
                                </li>
                                <li className="flex justify-between items-center">
                                    <span className="text-gray-500">Vector Store</span>
                                    <span className="text-white font-mono text-sm">Pinecone / Milvus</span>
                                </li>
                            </ul>
                        </div>
                    </section>

                    {/* Footer Quote */}
                    <section className="pt-24 border-t border-white/10 text-center">
                        <p className="text-2xl font-light italic text-white mb-6">
                            "The goal is not to predict the future, but to build a system that can adapt to it faster than anyone else."
                        </p>
                        <p className="text-xs font-medium tracking-[0.2em] text-gray-600 uppercase">
                            Project VANTAGE // 2025
                        </p>
                    </section>

                </div>
            </div>
        </div>
    );
};

export default Documentation;
