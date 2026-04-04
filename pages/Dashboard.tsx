import React, { useState, useRef, useEffect } from 'react';
import Card from '../components/ui/Card';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { IncomingCallIcon, OutgoingCallIcon, NoAnswerIcon, TotalCallsIcon, ContactStatIcon, AccountStatIcon, ActiveUsersStatIcon, WhatsAppBusinessIcon, EmailIcon, LiveChatIcon, VoiceIcon, FilterIcon } from '../components/icons/Icons';
import { useTheme } from '../hooks/useTheme';
import { useData } from '../hooks/useData';
import { Channel } from '../types';

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-xl p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-2xl">
                <p className="label text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mb-2">{`${label}`}</p>
                {payload.map((pld: any) => (
                    <div key={pld.dataKey} style={{ color: pld.color }} className="text-sm font-bold flex items-center gap-2 mb-1.5 last:mb-0">
                        <div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: pld.color }}></div>
                        {`${pld.dataKey.charAt(0).toUpperCase() + pld.dataKey.slice(1)}: `}
                        <span className="text-slate-900 dark:text-white ml-auto pl-6 font-extrabold">{pld.value}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const CallStatCard: React.FC<{
    title: string;
    value: number;
    description: string;
    duration: string;
    icon: React.ElementType;
    colorTheme: 'cyan' | 'green' | 'red' | 'purple';
}> = ({ title, value, description, duration, icon: Icon, colorTheme }) => {
    const themeStyles = {
        cyan: {
            iconWrap: 'bg-[#00BCD4]/10 text-[#00BCD4] shadow-[0_0_20px_rgba(0,188,212,0.15)] ring-1 ring-[#00BCD4]/20',
            value: 'text-slate-900 dark:text-white',
            durationBox: 'bg-[#00BCD4]/[0.05] border-[#00BCD4]/10',
            progressTrack: 'bg-slate-100 dark:bg-slate-800',
            progressBar: 'bg-gradient-to-r from-[#00A0B5] to-[#00BCD4] shadow-[0_0_12px_rgba(0,188,212,0.6)]'
        },
        green: {
            iconWrap: 'bg-[#10B981]/10 text-[#10B981] shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-1 ring-[#10B981]/20',
            value: 'text-slate-900 dark:text-white',
            durationBox: 'bg-[#10B981]/[0.05] border-[#10B981]/10',
            progressTrack: 'bg-slate-100 dark:bg-slate-800',
            progressBar: 'bg-gradient-to-r from-[#059669] to-[#10B981] shadow-[0_0_12px_rgba(16,185,129,0.6)]'
        },
        red: {
            iconWrap: 'bg-[#EF4444]/10 text-[#EF4444] shadow-[0_0_20px_rgba(239,68,68,0.15)] ring-1 ring-[#EF4444]/20',
            value: 'text-slate-900 dark:text-white',
            durationBox: 'bg-[#EF4444]/[0.05] border-[#EF4444]/10',
            progressTrack: 'bg-slate-100 dark:bg-slate-800',
            progressBar: 'bg-gradient-to-r from-[#DC2626] to-[#EF4444] shadow-[0_0_12px_rgba(239,68,68,0.6)]'
        },
        purple: {
            iconWrap: 'bg-[#8B5CF6]/10 text-[#8B5CF6] shadow-[0_0_20px_rgba(139,92,246,0.15)] ring-1 ring-[#8B5CF6]/20',
            value: 'text-slate-900 dark:text-white',
            durationBox: 'bg-[#8B5CF6]/[0.05] border-[#8B5CF6]/10',
            progressTrack: 'bg-slate-100 dark:bg-slate-800',
            progressBar: 'bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] shadow-[0_0_12px_rgba(139,92,246,0.6)]'
        }
    };

    const style = themeStyles[colorTheme];

    return (
        <div className="bg-white/70 dark:bg-[#0B1120]/60 backdrop-blur-2xl rounded-[32px] p-6 shadow-sm border border-slate-200/50 dark:border-slate-700/50 flex flex-col justify-between h-[240px] hover:-translate-y-1.5 hover:shadow-xl dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all duration-300 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 dark:bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            <div>
                {/* Header Context */}
                <div className="flex items-center justify-between mb-4">
                    <div className={`h-[42px] w-[42px] rounded-2xl ${style.iconWrap} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
                        <Icon className="h-5 w-5" />
                    </div>
                </div>

                <div className="flex flex-col gap-1">
                    <h3 className="text-slate-500 dark:text-slate-400 text-[11px] uppercase font-bold tracking-wider">{title}</h3>
                    <p className={`text-5xl font-black tracking-tight ${style.value} leading-none drop-shadow-sm`}>{value}</p>
                    <p className="text-slate-400 dark:text-slate-500 text-[11px] tracking-wide mt-1 line-clamp-1">{description}</p>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="mt-auto pt-4 relative z-10">
                <div className={`h-[6px] w-full ${style.progressTrack} rounded-full overflow-hidden mb-3`}>
                    <div className={`h-full ${style.progressBar} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${value > 0 ? 65 : 15}%` }}></div>
                </div>
                <div className="flex items-center text-xs justify-between mt-1">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Avg Duration</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">{duration}</span>
                </div>
            </div>
        </div>
    );
};

const ConversationStatCard: React.FC<{ title: string; value: number; color: string; }> = ({ title, value, color }) => {
    return (
        <div className="bg-white/70 dark:bg-[#0B1120]/60 backdrop-blur-2xl rounded-[28px] p-6 shadow-sm border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between relative overflow-hidden hover:scale-[1.02] hover:shadow-lg transition-all duration-300 group">
            <div className="flex flex-col z-10">
                <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold mb-1.5">{title}</p>
                <p className="text-3xl font-black text-slate-900 dark:text-white drop-shadow-md">{value}</p>
            </div>
            <div className="h-14 w-14 rounded-2xl flex items-center justify-center z-10 transform group-hover:rotate-12 transition-transform duration-500 shadow-sm" style={{ backgroundColor: `${color}15`, border: `1px solid ${color}30` }}>
                <div className="h-5 w-5 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 15px ${color}` }}></div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full -mr-12 -mt-12 opacity-[0.08] blur-[24px] pointer-events-none group-hover:opacity-20 transition-opacity" style={{ backgroundColor: color }}></div>
            <div className="absolute bottom-0 left-0 w-full h-[3px]" style={{ background: `linear-gradient(90deg, ${color}00 0%, ${color} 40%, ${color} 60%, ${color}00 100%)` }}></div>
        </div>
    )
};

const RightStatCard: React.FC<{ title: string; value: number | string; icon: React.ElementType }> = ({ title, value, icon: Icon }) => (
    <div className="bg-white/70 dark:bg-[#0B1120]/60 backdrop-blur-2xl rounded-[28px] p-6 shadow-sm border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-[#131A2A]/80 transition-all duration-300 group cursor-pointer hover:shadow-md hover:-translate-y-1">
        <div className="flex flex-col">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold mb-1.5">{title}</p>
            <p className="text-3xl font-black text-[#8B5CF6] dark:text-[#A78BFA] group-hover:drop-shadow-[0_0_12px_rgba(139,92,246,0.5)] transition-all">{value}</p>
        </div>
        <div className="h-12 w-12 rounded-2xl bg-[#8B5CF6]/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-[#8B5CF6]/20 shadow-[0_0_15px_rgba(139,92,246,0.15)]">
            <Icon className="h-5 w-5 text-[#8B5CF6] dark:text-[#A78BFA]" />
        </div>
    </div>
);

const ChannelCard: React.FC<{ title: string; value: number; icon: React.ElementType; color: string }> = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white/70 dark:bg-[#0B1120]/60 backdrop-blur-2xl rounded-[28px] p-6 shadow-sm border border-slate-200/50 dark:border-slate-700/50 flex flex-col justify-between relative overflow-hidden h-[140px] hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 group">
        <div className="flex justify-between items-start z-10">
            <p className="text-[40px] font-black text-slate-900 dark:text-white leading-none tracking-tight">{value}</p>
            <div className="h-11 w-11 rounded-2xl flex items-center justify-center transform group-hover:rotate-[15deg] transition-transform duration-300" style={{ backgroundColor: `${color}15`, border: `1px solid ${color}30` }}>
                <Icon className="h-[22px] w-[22px]" style={{ color }} />
            </div>
        </div>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 z-10 font-bold tracking-wide mt-auto">{title}</p>
        <div className="absolute -bottom-8 -right-8 w-28 h-28 rounded-full opacity-10 blur-[30px] group-hover:opacity-25 transition-opacity" style={{ backgroundColor: color }}></div>
    </div>
);

const TicketDistributionChart = () => {
    const data = [
        { name: 'Completed', value: 0, color: '#10B981', gradientId: 'grad-green' },
        { name: 'On Hold', value: 0, color: '#06B6D4', gradientId: 'grad-cyan' },
        { name: 'In Progress', value: 1, color: '#F59E0B', gradientId: 'grad-yellow' },
        { name: 'Open', value: 2, color: '#EF4444', gradientId: 'grad-red' }
    ];
    const orderedData = [...data].reverse();
    const total = data.reduce((sum, item) => sum + item.value, 0);

    const size = 200;
    const center = size / 2;
    const strokeWidth = 10;
    const gap = 5;

    return (
        <div className="flex flex-col items-center justify-between h-full pt-2">
            <div className="relative flex items-center justify-center">
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
                    <defs>
                        {data.map(item => (
                            <linearGradient key={item.gradientId} id={item.gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor={item.color} stopOpacity="0.8" />
                                <stop offset="100%" stopColor={item.color} stopOpacity="1" />
                            </linearGradient>
                        ))}
                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>
                    {orderedData.map((item, index) => {
                        const radius = (size / 2) - strokeWidth / 2 - (index * (strokeWidth + gap));
                        const circumference = 2 * Math.PI * radius;
                        const percentage = total === 0 ? 0 : (item.value / total);
                        const strokeDasharray = `${circumference * percentage} ${circumference}`;

                        return (
                            <g key={item.name}>
                                <circle cx={center} cy={center} r={radius} fill="none" stroke={item.color} strokeOpacity={0.1} strokeWidth={strokeWidth} strokeLinecap="round" />
                                {item.value > 0 && (
                                    <circle
                                        cx={center}
                                        cy={center}
                                        r={radius}
                                        fill="none"
                                        stroke={`url(#${item.gradientId})`}
                                        strokeWidth={strokeWidth}
                                        strokeDasharray={strokeDasharray}
                                        strokeLinecap="round"
                                        className="transition-all duration-1000 ease-out"
                                        style={{ WebkitFilter: 'drop-shadow(0 0 4px rgba(0,0,0,0.2))' }}
                                    />
                                )}
                            </g>
                        );
                    })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center mt-2 group">
                    <span className="text-slate-500 dark:text-slate-400 text-[10px] font-bold tracking-widest uppercase mb-1 drop-shadow-sm">Total</span>
                    <span className="text-slate-900 dark:text-white text-5xl font-black drop-shadow-lg transition-transform hover:scale-110 cursor-default">{total}</span>
                </div>
            </div>
            <div className="flex items-center justify-center gap-x-5 gap-y-3 mt-auto w-full flex-wrap pt-8 pb-2">
                {orderedData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2 cursor-pointer group">
                        <div className="w-3 h-3 rounded-full shadow-sm group-hover:scale-125 transition-transform" style={{ backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}80` }} />
                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{item.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const Dashboard: React.FC = () => {
    const { theme } = useTheme();
    const { contacts, accounts } = useData();
    const isDark = theme === 'dark';
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('Last 7 Days');
    const filterRef = useRef<HTMLDivElement>(null);

    const [callStats, setCallStats] = useState({
        incoming: { value: 0, duration: "0s" },
        outgoing: { value: 0, duration: "0s" },
        noAnswer: { value: 0, duration: "0s" },
        total: { value: 0, duration: "0s" },
    });
    const [callsChartData, setCallsChartData] = useState<{ name: string; incoming: number; outgoing: number; }[]>([]);
    const [conversationStats, setConversationStats] = useState({
        open: 0, unassigned: 0, close: 0, total: 0,
    });
    const [conversationChartData, setConversationChartData] = useState<{ name: string; conversations: number; received: number; sent: number }[]>([]);
    const [showWelcome, setShowWelcome] = useState(true);
    const [currentTipIndex, setCurrentTipIndex] = useState(0);

    const tips = [
        "Connect your WhatsApp Business account to start receiving messages directly in the dashboard.",
        "Use the 'Filter' button to view call statistics for specific time ranges.",
        "Check the 'Conversations' section to see open and unassigned chats needing attention.",
        "Invite team members to collaborate on customer support tickets."
    ];


    const filterOptions = ['Today', 'Yesterday', 'Last 2 Days', 'Last 7 Days', 'Last 30 days'];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setIsFilterOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const generateData = () => {
            let daysToShow = 7;
            let endDate = new Date();

            switch (selectedFilter) {
                case 'Today':
                    daysToShow = 1;
                    endDate = new Date();
                    break;
                case 'Yesterday':
                    daysToShow = 1;
                    endDate = new Date();
                    endDate.setDate(endDate.getDate() - 1);
                    break;
                case 'Last 2 Days':
                    daysToShow = 2;
                    endDate = new Date();
                    endDate.setDate(endDate.getDate() - 1); // End date is yesterday
                    break;
                case 'Last 7 Days':
                    daysToShow = 7;
                    endDate = new Date();
                    endDate.setDate(endDate.getDate() - 1); // End date is yesterday
                    break;
                case 'Last 30 days':
                    daysToShow = 30;
                    endDate = new Date();
                    endDate.setDate(endDate.getDate() - 1); // End date is yesterday
                    break;
            }

            const newCallsData = [];
            const newConvoData = [];

            for (let i = 0; i < daysToShow; i++) {
                const date = new Date(endDate);
                date.setDate(date.getDate() - (daysToShow - 1 - i));

                const dayName = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }).toLowerCase();

                const incoming = Math.floor(Math.random() * (40 + i * 2) + 10 * (daysToShow / 7));
                const outgoing = Math.floor(Math.random() * (30 + i * 1.5) + 5 * (daysToShow / 7));
                newCallsData.push({ name: dayName, incoming, outgoing });

                const conversations = Math.floor(Math.random() * 20 + 5);
                const received = Math.floor(Math.random() * 80 + 20);
                const sent = Math.floor(Math.random() * 70 + 15);
                newConvoData.push({ name: dayName, conversations, received, sent });
            }

            setCallsChartData(newCallsData);
            setConversationChartData(newConvoData);

            const totalIncoming = newCallsData.reduce((s, d) => s + d.incoming, 0);
            const totalOutgoing = newCallsData.reduce((s, d) => s + d.outgoing, 0);
            const noAnswer = Math.floor((totalIncoming + totalOutgoing) * (Math.random() * 0.1 + 0.05));
            const totalCalls = totalIncoming + totalOutgoing;

            const formatDuration = (calls: number) => {
                if (calls === 0) return "0s";
                const totalMinutes = calls * (Math.random() * 2 + 1.5);
                if (totalMinutes < 60) return `${Math.round(totalMinutes)}m`;
                const hours = Math.floor(totalMinutes / 60);
                const minutes = Math.round(totalMinutes % 60);
                return `${hours}h ${minutes}m`;
            };

            setCallStats({
                incoming: { value: totalIncoming, duration: formatDuration(totalIncoming) },
                outgoing: { value: totalOutgoing, duration: formatDuration(totalOutgoing) },
                noAnswer: { value: noAnswer, duration: '0s' },
                total: { value: totalCalls, duration: formatDuration(totalCalls) },
            });

            const open = newConvoData.reduce((s, d) => s + d.conversations, 0);
            const unassigned = Math.floor(open * (Math.random() * 0.2 + 0.1));
            const close = Math.floor(newConvoData.reduce((s, d) => s + d.received + d.sent, 0) * 0.8);
            const total = open + unassigned + close;

            setConversationStats({ open, unassigned, close, total });
        };
        generateData();
    }, [selectedFilter]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTipIndex((prevIndex) => (prevIndex + 1) % tips.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleFilterSelect = (option: string) => {
        setSelectedFilter(option);
        setIsFilterOpen(false);
    };

    const chartGridColor = isDark ? '#1E293B' : '#F1F5F9';
    const chartTickColor = isDark ? '#64748B' : '#94A3B8';

    const channelStats = {
        whatsapp: contacts.filter((c: any) => c.channel === Channel.WhatsApp).length,
        email: contacts.filter((c: any) => c.channel === Channel.Google).length,
        livechat: contacts.filter((c: any) => c.channel === Channel.LiveChat).length,
        voice: 0,
    };

    return (
        <div className="relative min-h-screen">
            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#8B5CF6] opacity-[0.05] dark:opacity-[0.03] blur-[120px] pointer-events-none"></div>
            <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#10B981] opacity-[0.05] dark:opacity-[0.03] blur-[120px] pointer-events-none"></div>

            {showWelcome && (
                <div className="bg-gradient-to-r from-[#F3E8FF] to-[#E0E7FF] dark:from-[#2E1065] dark:to-[#1E1B4B] rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 border border-purple-200 dark:border-purple-900/50 shadow-lg relative overflow-hidden animate-slide-in-right">
                    <div className="absolute inset-0 translate-x-[-100%] animate-[shimmer_3s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

                    <div className="flex gap-4 relative z-10">
                        <div className="flex-shrink-0 mt-1">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] flex items-center justify-center shadow-md">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-[#4C1D95] dark:text-white font-black text-lg flex items-center gap-2 drop-shadow-sm">
                                Welcome to Your Dashboard! <span className="inline-block animate-bounce origin-bottom">👋</span>
                            </h3>
                            <p className="text-[#5B21B6] dark:text-purple-200 text-[13px] mt-1 leading-relaxed font-medium">
                                This dashboard gives you a complete, real-time overview of your communication performance. Track calls, messages, tickets, and channel health with stunning clarity.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowWelcome(false)}
                        className="flex-shrink-0 relative z-10 bg-[#7E22CE] hover:bg-[#6B21A8] dark:bg-[#8B5CF6] dark:hover:bg-[#7C3AED] text-white text-xs font-bold px-6 py-2.5 rounded-full shadow-[0_4px_14px_0_rgba(139,92,246,0.5)] hover:shadow-[0_6px_20px_rgba(139,92,246,0.4)] hover:-translate-y-0.5 transition-all duration-200"
                    >
                        Explore Now
                    </button>
                </div>
            )}

            <div className="bg-white/50 dark:bg-[#0F172A]/50 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-3.5 mb-8 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3 overflow-hidden ml-1">
                    <span className="bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] text-white text-[10px] uppercase font-black px-3 py-1 rounded-full flex-shrink-0 shadow-sm tracking-wider">
                        Quick Tip
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 text-[13px] font-semibold truncate transition-all duration-500 ease-in-out">
                        {tips[currentTipIndex]}
                    </p>
                </div>
                <div className="flex gap-2 flex-shrink-0 mr-2">
                    {tips.map((_, index) => (
                        <div
                            key={index}
                            className={`h-1.5 rounded-full transition-all duration-300 ${index === currentTipIndex ? 'bg-[#8B5CF6] w-4 shadow-[0_0_8px_rgba(139,92,246,0.8)]' : 'bg-slate-300 dark:bg-slate-700 w-1.5'
                                }`}
                        />
                    ))}
                </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-[32px] font-black tracking-tight text-slate-900 dark:text-white drop-shadow-sm">Overview</h1>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                        Tracking performance metrics
                        <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                        <span className="text-slate-700 dark:text-slate-300 font-bold">{selectedFilter}</span>
                    </p>
                </div>
                <div className="relative" ref={filterRef}>
                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className="flex items-center space-x-2 bg-white dark:bg-[#1E293B] hover:bg-slate-50 dark:hover:bg-[#273549] text-slate-700 dark:text-white border border-slate-200 dark:border-slate-700 px-5 py-2.5 rounded-full text-sm font-bold shadow-sm transition-all duration-200 hover:shadow-md"
                    >
                        <FilterIcon className="h-4 w-4" />
                        <span>{selectedFilter}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ml-1 transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    {isFilterOpen && (
                        <div className="absolute top-[calc(100%+8px)] right-0 w-56 bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-700/80 rounded-2xl shadow-2xl z-20 overflow-hidden transform origin-top-right transition-all">
                            <div className="py-2">
                                {filterOptions.map((option) => (
                                    <button
                                        key={option}
                                        onClick={() => handleFilterSelect(option)}
                                        className={`w-full text-left px-5 py-2.5 text-[13px] transition-colors duration-150 flex items-center justify-between ${selectedFilter === option
                                            ? 'bg-purple-50/50 dark:bg-purple-900/20 font-bold text-[#8B5CF6]'
                                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 font-medium'
                                            }`}
                                    >
                                        {option}
                                        {selectedFilter === option && <div className="h-1.5 w-1.5 rounded-full bg-[#8B5CF6]"></div>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-8">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    <CallStatCard
                        title="Incoming Calls"
                        value={callStats.incoming.value}
                        description="Calls received from customers"
                        duration={callStats.incoming.duration}
                        icon={IncomingCallIcon}
                        colorTheme="purple"
                    />
                    <CallStatCard
                        title="Outgoing Calls"
                        value={callStats.outgoing.value}
                        description="Calls made to customers"
                        duration={callStats.outgoing.duration}
                        icon={OutgoingCallIcon}
                        colorTheme="green"
                    />
                    <CallStatCard
                        title="No Answer"
                        value={callStats.noAnswer.value}
                        description="Calls that were not answered"
                        duration={callStats.noAnswer.duration}
                        icon={NoAnswerIcon}
                        colorTheme="red"
                    />
                    <CallStatCard
                        title="Total Calls"
                        value={callStats.total.value}
                        description="Sum of all call activities"
                        duration={callStats.total.duration}
                        icon={TotalCallsIcon}
                        colorTheme="cyan"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-8 flex flex-col">
                        <div className="bg-white/70 dark:bg-[#0B1120]/60 backdrop-blur-2xl border border-slate-200/50 dark:border-slate-700/50 rounded-[32px] p-8 shadow-sm flex-1 flex flex-col hover:shadow-lg transition-shadow duration-500">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                                        <svg className="w-5 h-5 text-[#8B5CF6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M3 3v18h18" />
                                            <path d="M7 14l4-4 4 4 6-6" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Call Traffic Analytics</h2>
                                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Performance over time</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-6 text-[11px] font-black tracking-wider uppercase">
                                    <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg">
                                        <div className="h-2 w-2 rounded-full bg-[#8B5CF6] shadow-[0_0_8px_rgba(139,92,246,0.8)]"></div>
                                        <span className="text-slate-600 dark:text-slate-300">Incoming</span>
                                    </div>
                                    <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg">
                                        <div className="h-2 w-2 rounded-full bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                                        <span className="text-slate-600 dark:text-slate-300">Outgoing</span>
                                    </div>
                                </div>
                            </div>
                            <div style={{ width: '100%', minHeight: 320, flex: 1 }}>
                                <ResponsiveContainer>
                                    <AreaChart data={callsChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorIncoming" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorOutgoing" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="4 4" stroke={chartGridColor} horizontal={true} vertical={false} />
                                        <XAxis dataKey="name" tick={{ fill: chartTickColor, fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} tickMargin={12} />
                                        <YAxis tick={{ fill: chartTickColor, fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} tickMargin={12} />
                                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: isDark ? '#334155' : '#CBD5E1', strokeWidth: 1, strokeDasharray: '4 4' }} />
                                        <Area type="monotone" dataKey="incoming" stroke="#8B5CF6" strokeWidth={3} fillOpacity={1} fill="url(#colorIncoming)" activeDot={{ r: 6, stroke: '#FFFFFF', strokeWidth: 2, fill: '#8B5CF6' }} name="Incoming Calls" />
                                        <Area type="monotone" dataKey="outgoing" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorOutgoing)" activeDot={{ r: 6, stroke: '#FFFFFF', strokeWidth: 2, fill: '#10B981' }} name="Outgoing Calls" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-4 flex flex-col">
                        <div className="bg-white/70 dark:bg-[#0B1120]/60 backdrop-blur-2xl border border-slate-200/50 dark:border-slate-700/50 rounded-[32px] p-8 shadow-sm flex-1 flex flex-col hover:shadow-lg transition-shadow duration-500">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                                    <svg className="w-5 h-5 text-[#A855F7]" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M4 6c0-1.1.9-2 2-2h12a2 2 0 012 2v3.5a1.5 1.5 0 000 3v3.5a2 2 0 01-2 2H6a2 2 0 01-2-2v-3.5a1.5 1.5 0 000-3V6z" fillOpacity="0.9" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Tickets</h2>
                                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Distribution Status</p>
                                </div>
                            </div>
                            <div className="flex-1 flex items-center justify-center">
                                <TicketDistributionChart />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-8 flex flex-col">
                        <div className="bg-white/70 dark:bg-[#0B1120]/60 backdrop-blur-2xl border border-slate-200/50 dark:border-slate-700/50 rounded-[32px] p-8 shadow-sm flex-1 flex flex-col hover:shadow-lg transition-shadow duration-500">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                                        <svg className="w-[18px] h-[18px] text-[#F59E0B]" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Conversations</h2>
                                            <span className="bg-gradient-to-r from-[#10B981] to-[#34D399] shadow-[0_0_10px_rgba(16,185,129,0.3)] text-white text-[9px] font-black px-2 py-0.5 rounded flex items-center uppercase tracking-widest">
                                                Live
                                            </span>
                                        </div>
                                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Message Engagement</p>
                                    </div>
                                </div>
                                <div className="flex space-x-6 text-[10px] font-black tracking-wider uppercase bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                    <div className="flex flex-col gap-1 px-2 border-r border-slate-200 dark:border-slate-700">
                                        <div className="flex items-center space-x-1.5 opacity-80">
                                            <div className="h-2 w-2 rounded-full bg-[#8B5CF6] shadow-[0_0_6px_rgba(139,92,246,0.6)]"></div>
                                            <span className="text-slate-600 dark:text-slate-300">Total</span>
                                        </div>
                                        <span className="text-lg font-black text-slate-900 dark:text-white pl-3.5">2</span>
                                    </div>
                                    <div className="flex flex-col gap-1 px-2 border-r border-slate-200 dark:border-slate-700">
                                        <div className="flex items-center space-x-1.5 opacity-80">
                                            <div className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-500 shadow-[0_0_6px_rgba(255,255,255,0.2)]"></div>
                                            <span className="text-slate-600 dark:text-slate-300">Received</span>
                                        </div>
                                        <span className="text-lg font-black text-slate-900 dark:text-white pl-3.5">38</span>
                                    </div>
                                    <div className="flex flex-col gap-1 px-2">
                                        <div className="flex items-center space-x-1.5 opacity-80">
                                            <div className="h-2 w-2 rounded-full bg-[#F59E0B] shadow-[0_0_6px_rgba(245,158,11,0.6)]"></div>
                                            <span className="text-slate-600 dark:text-slate-300">Sent</span>
                                        </div>
                                        <span className="text-lg font-black text-slate-900 dark:text-white pl-3.5">0</span>
                                    </div>
                                </div>
                            </div>
                            <div style={{ width: '100%', height: 260 }}>
                                <ResponsiveContainer>
                                    <BarChart data={conversationChartData} margin={{ top: 20, right: 10, left: -25, bottom: 5 }} barSize={16}>
                                        <CartesianGrid strokeDasharray="4 4" stroke={chartGridColor} horizontal={true} vertical={false} />
                                        <XAxis dataKey="name" tick={{ fill: chartTickColor, fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} tickMargin={12} />
                                        <YAxis tick={{ fill: chartTickColor, fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} tickMargin={12} />
                                        <Tooltip cursor={{ fill: isDark ? '#1E293B' : '#F8FAFC', opacity: 0.5 }} content={<CustomTooltip />} />
                                        <Bar dataKey="conversations" stackId="a" fill="#8B5CF6" radius={[0, 0, 4, 4]} name="Conversations" />
                                        <Bar dataKey="received" stackId="a" fill={isDark ? '#475569' : '#CBD5E1'} radius={[0, 0, 0, 0]} name="Message Received" />
                                        <Bar dataKey="sent" stackId="a" fill="#F59E0B" radius={[4, 4, 0, 0]} name="Message Sent" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-4 flex flex-col space-y-6">
                        <ConversationStatCard title="Open" value={conversationStats.open} color="#8B5CF6" />
                        <ConversationStatCard title="Unassigned" value={conversationStats.unassigned} color="#EC4899" />
                        <ConversationStatCard title="Closed" value={conversationStats.close} color="#10B981" />
                        <div className="flex-1 grid grid-cols-2 gap-4 items-end mt-4">
                            <RightStatCard title="Total Contacts" value={contacts.length} icon={ContactStatIcon} />
                            <RightStatCard title="Total Accounts" value={accounts.length} icon={AccountStatIcon} />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col mt-4">
                    <div className="flex items-center gap-3 mb-6 ml-2">
                        <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                            <svg className="w-[18px] h-[18px] text-[#EC4899]" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M4 6h16v12H4z" opacity=".15" /><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12zM6 10h12v2H6zm0 4h8v2H6z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Channel Performance</h2>
                            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Integrations Health</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6">
                        <ChannelCard title="WhatsApp" value={channelStats.whatsapp || 1} icon={WhatsAppBusinessIcon} color="#25D366" />
                        <ChannelCard title="Email" value={channelStats.email || 2} icon={EmailIcon} color="#3B82F6" />
                        <ChannelCard title="Live Chat" value={channelStats.livechat || 0} icon={LiveChatIcon} color="#0EA5E9" />
                        <ChannelCard title="Voice" value={channelStats.voice || 0} icon={VoiceIcon} color="#EF4444" />
                        <ChannelCard title="Messenger" value={1} icon={() => <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M12 2C6.477 2 2 6.14 2 11.246c0 2.898 1.496 5.487 3.824 7.156v3.295l3.486-1.928c.866.242 1.77.37 2.69.37 5.523 0 10-4.14 10-9.246S17.523 2 12 2zm1.096 12.388-2.822-3.007-5.503 3.007 6.04-6.423 2.868 3.008 5.457-3.008-6.04 6.423z" /></svg>} color="#006AFF" />
                        <ChannelCard title="Instagram" value={2} icon={() => <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>} color="#E1306C" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;