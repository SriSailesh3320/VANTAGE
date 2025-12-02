import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Activity, Shield, Cpu } from 'lucide-react';
import DotGridBackground from '../components/DotGridBackground';

const Overview: React.FC = () => {
    return (
        <div className="min-h-[calc(100vh-64px)] bg-black text-white font-sans flex flex-col items-center justify-center p-6 relative overflow-hidden selection:bg-white/30">

            {/* Dot Grid Background */}
            <DotGridBackground />

            {/* Subtle Grid Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none z-0"></div>

            <div className="max-w-6xl w-full z-10 relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

                {/* Left Content: Hero */}
                <div className="lg:col-span-7 space-y-10 text-center lg:text-left">

                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/20 backdrop-blur-sm">
                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                            <span className="text-[10px] tracking-[0.2em] text-gray-400 uppercase">System Operational</span>
                        </div>

                        <h1 className="text-6xl md:text-8xl font-light tracking-tighter text-white leading-[0.9]">
                            VANTAGE
                            <span className="block text-2xl md:text-3xl font-thin text-gray-500 mt-2 tracking-widest uppercase">
                                Intelligence Unit
                            </span>
                        </h1>

                        <p className="text-lg text-gray-400 max-w-xl mx-auto lg:mx-0 font-light leading-relaxed border-l-2 border-white/20 pl-6">
                            Next-generation financial analytics powered by autonomous AI agents.
                            Processing market data with sub-millisecond latency for superior decision making.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                        <Link to="/market-intelligence" className="group relative px-8 py-4 bg-white text-black font-medium tracking-wider text-sm hover:bg-gray-200 transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden rounded-sm">
                            <span className="relative z-10">INITIALIZE SYSTEM</span>
                            <ArrowUpRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link to="/documentation" className="px-8 py-4 border border-white/20 text-gray-400 font-medium tracking-wider text-sm hover:text-white hover:border-white/40 transition-all duration-300 rounded-sm flex items-center justify-center">
                            READ DOCUMENTATION
                        </Link>
                    </div>
                </div>

                {/* Right Content: Bento Grid Features */}
                <div className="lg:col-span-5 grid grid-cols-2 gap-4">

                    {/* Feature 1 */}
                    <div className="col-span-2 p-6 bg-black/40 border border-white/10 backdrop-blur-sm hover:bg-white/5 transition-colors rounded-xl group">
                        <Activity className="w-8 h-8 text-white mb-4 opacity-80 group-hover:opacity-100 transition-opacity" />
                        <h3 className="text-lg font-medium text-white mb-2">Real-Time Analytics</h3>
                        <p className="text-xs text-gray-500 leading-relaxed">Live data processing pipeline delivering actionable insights instantly.</p>
                    </div>

                    {/* Feature 2 */}
                    <div className="p-6 bg-black/40 border border-white/10 backdrop-blur-sm hover:bg-white/5 transition-colors rounded-xl group">
                        <Cpu className="w-6 h-6 text-gray-300 mb-4 opacity-80 group-hover:opacity-100 transition-opacity" />
                        <h3 className="text-sm font-medium text-white mb-2">Neural Core</h3>
                        <p className="text-[10px] text-gray-500 leading-relaxed">Advanced LLM integration.</p>
                    </div>

                    {/* Feature 3 */}
                    <div className="p-6 bg-black/40 border border-white/10 backdrop-blur-sm hover:bg-white/5 transition-colors rounded-xl group">
                        <Shield className="w-6 h-6 text-gray-300 mb-4 opacity-80 group-hover:opacity-100 transition-opacity" />
                        <h3 className="text-sm font-medium text-white mb-2">Secure</h3>
                        <p className="text-[10px] text-gray-500 leading-relaxed">Enterprise-grade encryption.</p>
                    </div>

                    {/* Feature 4 */}
                    <div className="col-span-2 p-6 bg-white/5 border border-white/20 backdrop-blur-sm rounded-xl flex items-center justify-between group cursor-pointer hover:border-white/40 transition-colors">
                        <div>
                            <h3 className="text-sm font-medium text-white mb-1">Market Status</h3>
                            <p className="text-xs text-gray-500">All Systems Nominal</p>
                        </div>
                        <div className="h-2 w-2 bg-white rounded-full animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
                    </div>

                </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-8 left-0 right-0 text-center">
                <div className="inline-block text-[10px] text-gray-600 font-sans tracking-[0.3em] uppercase">
                    <p>PROJECT VANTAGE // DEVELOPED BY [SRI SAILESH]</p>
                </div>
            </div>

        </div>
    );
};

export default Overview;
