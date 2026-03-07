
import React, { useState, useRef, useEffect } from 'react';
import Card from '../components/ui/Card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { IncomingCallIcon, OutgoingCallIcon, NoAnswerIcon, TotalCallsIcon, ContactStatIcon, AccountStatIcon, ActiveUsersStatIcon, WhatsAppBusinessIcon, EmailIcon, LiveChatIcon, VoiceIcon, FilterIcon } from '../components/icons/Icons';
import { useTheme } from '../hooks/useTheme';
import { useData } from '../hooks/useData';
import { Channel } from '../types';

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                <p className="label text-sm text-slate-500 dark:text-slate-400">{`${label}`}</p>
                {payload.map((pld: any) => (
                    <div key={pld.dataKey} style={{ color: pld.color }} className="text-sm font-semibold">
                        {`${pld.dataKey.charAt(0).toUpperCase() + pld.dataKey.slice(1)}: ${pld.value}`}
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
    colorTheme: 'cyan' | 'green' | 'red' | 'blue';
}> = ({ title, value, description, duration, icon: Icon, colorTheme }) => {
    const themeStyles = {
        cyan: {
            iconWrap: 'bg-[#00BCD4]/10 text-[#00BCD4]',
            value: 'text-[#00BCD4]',
            durationBox: 'bg-[#00BCD4]/[0.05] border-[#00BCD4]/20',
            durationValue: 'text-[#00BCD4]',
            progressTrack: 'bg-slate-700/40',
            progressBar: 'bg-[#00BCD4]'
        },
        green: {
            iconWrap: 'bg-[#22C55E]/10 text-[#22C55E]',
            value: 'text-[#22C55E]',
            durationBox: 'bg-[#22C55E]/[0.05] border-[#22C55E]/20',
            progressTrack: 'bg-slate-700/40',
            progressBar: 'bg-[#22C55E]'
        },
        red: {
            iconWrap: 'bg-[#EF4444]/10 text-[#EF4444]',
            value: 'text-[#EF4444]',
            durationBox: 'bg-[#EF4444]/[0.05] border-[#EF4444]/20',
            progressTrack: 'bg-slate-700/40',
            progressBar: 'bg-[#EF4444]'
        },
        blue: {
            iconWrap: 'bg-[#0056D2]/10 text-[#0056D2]',
            value: 'text-[#0056D2]',
            durationBox: 'bg-[#0056D2]/[0.05] border-[#0056D2]/20',
            progressTrack: 'bg-slate-700/40',
            progressBar: 'bg-[#00BCD4]'
        }
    };

    const style = themeStyles[colorTheme];

    return (
        <div className="bg-white dark:bg-[#1A222C] rounded-[24px] p-5 shadow-sm border border-slate-100 dark:border-slate-700/30 flex flex-col justify-between h-[230px]">
            <div>
                {/* Icon Circle */}
                <div className={`h-[34px] w-[34px] rounded-full ${style.iconWrap} flex items-center justify-center mb-3.5`}>
                    <Icon className="h-4 w-4" />
                </div>

                {/* Title */}
                <h3 className="text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1 tracking-wide">{title}</h3>

                {/* Value */}
                <p className={`text-[32px] font-bold ${style.value} leading-none mb-1.5`}>{value}</p>

                {/* Description */}
                <p className="text-slate-400 dark:text-slate-500 text-[10px] tracking-wide mb-3 line-clamp-1">{description}</p>

                {/* Duration Box */}
                <div className={`rounded-xl px-3 py-1.5 flex flex-col justify-center ${style.durationBox} border dark:border-slate-700/50 mt-1.5`}>
                    <div className="flex items-center gap-2">
                        <div className={`h-4 w-4 rounded-full border border-current ${style.iconWrap.split(' ')[1]} flex items-center justify-center opacity-80`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-[9px] w-[9px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold leading-none mb-0.5">Duration (Second)</span>
                            <span className="text-xs font-bold text-slate-700 dark:text-white leading-none">{duration}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress line at bottom */}
            <div className={`h-1 w-full ${style.progressTrack} rounded-full overflow-hidden mt-3`}>
                <div className={`h-full ${style.progressBar} rounded-full`} style={{ width: `${value > 0 ? 65 : 15}%` }}></div>
            </div>
        </div>
    );
};

const ConversationStatCard: React.FC<{ title: string; value: number; color: string; }> = ({ title, value, color }) => {
    return (
        <div className="bg-white dark:bg-[#1A222C] rounded-[24px] p-6 shadow-sm border border-slate-100 dark:border-transparent flex items-center justify-between relative overflow-hidden group">
            <div className="flex flex-col z-10">
                <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold mb-2">{title}</p>
                <p className={`text-2xl font-bold`} style={{ color }}>{value}</p>
            </div>
            <div className="h-12 w-12 rounded-full flex items-center justify-center z-10" style={{ backgroundColor: `${color}15` }}>
                <div className="h-6 w-6 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 15px ${color}80` }}></div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 opacity-10 blur-2xl" style={{ backgroundColor: color }}></div>
            <div className="absolute bottom-0 left-0 w-1/2 h-0.5" style={{ background: `linear-gradient(90deg, ${color}00 0%, ${color} 100%)` }}></div>
        </div>
    )
};

const RightStatCard: React.FC<{ title: string; value: number | string; icon: React.ElementType }> = ({ title, value, icon: Icon }) => (
    <div className="bg-white dark:bg-[#1A222C] rounded-[24px] p-6 shadow-sm border border-slate-100 dark:border-transparent flex items-center justify-between">
        <div className="flex flex-col">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold mb-2">{title}</p>
            <p className="text-2xl font-bold text-[#0056D2]">{value}</p>
        </div>
        <div className="h-[42px] w-[42px] rounded-full bg-[#0056D2]/10 flex items-center justify-center">
            <Icon className="h-[18px] w-[18px] text-[#0056D2]" />
        </div>
    </div>
);

const ChannelCard: React.FC<{ title: string; value: number; icon: React.ElementType; color: string }> = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white dark:bg-[#1A222C] rounded-[24px] p-6 shadow-sm border border-slate-100 dark:border-transparent flex flex-col justify-between relative overflow-hidden h-[120px]">
        <div className="flex justify-between items-start z-10">
            <p className="text-3xl font-bold text-slate-900 dark:text-[#00B2FF]">{value}</p>
            <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
                <Icon className="h-4 w-4" style={{ color }} />
            </div>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 z-10 tracking-wide">{title}</p>
        <div className="absolute bottom-0 left-0 w-full h-[3px]" style={{ background: `linear-gradient(90deg, transparent 0%, ${color} 50%, transparent 100%)` }}></div>
    </div>
);

const TicketDistributionChart = () => {
    const data = [
        { name: 'Completed', value: 0, color: '#22C55E' },
        { name: 'On Hold', value: 0, color: '#06B6D4' },
        { name: 'In Progress', value: 1, color: '#F59E0B' },
        { name: 'Open', value: 2, color: '#EF4444' }
    ];
    const orderedData = [...data].reverse();
    const total = data.reduce((sum, item) => sum + item.value, 0);

    const size = 180;
    const center = size / 2;
    const strokeWidth = 8;
    const gap = 4;

    return (
        <div className="flex flex-col items-center justify-between h-full pt-4">
            <div className="relative flex items-center justify-center">
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
                    {orderedData.map((item, index) => {
                        const radius = (size / 2) - strokeWidth / 2 - (index * (strokeWidth + gap));
                        const circumference = 2 * Math.PI * radius;
                        const percentage = total === 0 ? 0 : (item.value / total);
                        const strokeDasharray = `${circumference * percentage} ${circumference}`;

                        return (
                            <g key={item.name}>
                                {/* Track background */}
                                <circle cx={center} cy={center} r={radius} fill="none" stroke={item.color} strokeOpacity={0.15} strokeWidth={strokeWidth} strokeLinecap="round" />
                                {/* Progress foreground */}
                                {item.value > 0 && (
                                    <circle cx={center} cy={center} r={radius} fill="none" stroke={item.color} strokeWidth={strokeWidth} strokeDasharray={strokeDasharray} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                                )}
                            </g>
                        );
                    })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center mt-2">
                    <span className="text-slate-500 dark:text-slate-400 text-[10px] font-bold tracking-wider mb-1">Total</span>
                    <span className="text-slate-900 dark:text-white text-3xl font-bold">{total}</span>
                </div>
            </div>
            {/* Legend */}
            <div className="flex items-center justify-center gap-x-4 gap-y-2 mt-auto w-full flex-wrap pt-6">
                {orderedData.map((item) => (
                    <div key={item.name} className="flex items-center gap-1.5 font-semibold">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-xs text-slate-700 dark:text-slate-200 whitespace-nowrap">{item.name}</span>
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
                if (calls === 0) return "0 seconds";
                const totalMinutes = calls * (Math.random() * 2 + 1.5);
                if (totalMinutes < 60) return `${Math.round(totalMinutes)} minutes`;
                const hours = Math.floor(totalMinutes / 60);
                const minutes = Math.round(totalMinutes % 60);
                return `${hours}h ${minutes}m`;
            };

            setCallStats({
                incoming: { value: totalIncoming, duration: formatDuration(totalIncoming) },
                outgoing: { value: totalOutgoing, duration: formatDuration(totalOutgoing) },
                noAnswer: { value: noAnswer, duration: '0 seconds' },
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

    const chartGridColor = isDark ? '#374151' : '#e5e7eb';
    const chartTickColor = isDark ? '#6b7280' : '#4b5563';
    const chartDotStrokeColor = isDark ? '#161B22' : '#ffffff';

    const channelStats = {
        whatsapp: contacts.filter(c => c.channel === Channel.WhatsApp).length,
        email: contacts.filter(c => c.channel === Channel.Google).length,
        livechat: contacts.filter(c => c.channel === Channel.LiveChat).length,
        voice: 0,
    };

    return (
        <div>
            {showWelcome && (
                <div className="bg-[#E0F7FA] dark:bg-[#033A6B] rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-[#B2EBF2] dark:border-[#044D8C] shadow-sm animate-slide-in-right">
                    <div className="flex gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                            <div className="h-6 w-6 rounded-full bg-[#00BCD4] dark:bg-[#00D4FF] flex items-center justify-center shadow-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white dark:text-slate-900" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-[#006064] dark:text-white font-bold text-sm flex items-center gap-2">
                                Welcome to Your Dashboard! <span className="inline-block hover:animate-spin">👋</span>
                            </h3>
                            <p className="text-[#00838F] dark:text-slate-200 text-xs mt-1 leading-relaxed">
                                This dashboard gives you a complete overview of your communication performance. Track calls, messages, tickets, and channel performance in one place.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowWelcome(false)}
                        className="flex-shrink-0 bg-[#0056D2] hover:bg-[#00449E] dark:bg-[#2563EB] dark:hover:bg-[#1D4ED8] text-white text-xs font-semibold px-5 py-2 rounded-full transition-colors shadow-sm"
                    >
                        Got it
                    </button>
                </div>
            )}

            {/* Quick Tip Ticker */}
            <div className="bg-[#F1F7FF] dark:bg-[#151B25] border border-[#D0E6FF] dark:border-slate-800 rounded-[24px] p-3 mb-6 flex items-center justify-between animate-slide-in-right">
                <div className="flex items-center gap-3 overflow-hidden ml-1">
                    <span className="bg-[#0056D2] dark:bg-transparent dark:border dark:border-blue-500 text-white dark:text-blue-500 text-[10px] uppercase font-bold px-3 py-1 rounded-full flex-shrink-0">
                        Quick Tip
                    </span>
                    <p className="text-[#00449E] dark:text-slate-200 text-sm font-medium truncate transition-all duration-500 ease-in-out">
                        {tips[currentTipIndex]}
                    </p>
                </div>
                <div className="flex gap-1.5 flex-shrink-0 mr-2">
                    {tips.map((_, index) => (
                        <div
                            key={index}
                            className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${index === currentTipIndex ? 'bg-[#0056D2] dark:bg-blue-500 w-3' : 'bg-[#B0D0FF] dark:bg-slate-600'
                                }`}
                        />
                    ))}
                </div>
            </div>
            {/* Header Section and Main Layout Wrapper */}
            <div className="bg-transparent dark:bg-[#151B25] rounded-[32px] dark:border dark:border-slate-800/60 p-0 dark:p-6 lg:dark:p-8 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Overview of your performance and metrics • Last {selectedFilter}
                        </p>
                    </div>
                    <div className="relative" ref={filterRef}>
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className="flex items-center space-x-2 bg-[#0056D2] hover:bg-[#00449E] text-white px-4 py-2 rounded-full text-sm font-medium shadow-sm transition-colors"
                        >
                            <FilterIcon className="h-4 w-4 text-white" />
                            <span>{selectedFilter}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {isFilterOpen && (
                            <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-dark-card border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-20 overflow-hidden">
                                {filterOptions.map((option) => (
                                    <button
                                        key={option}
                                        onClick={() => handleFilterSelect(option)}
                                        className={`w-full text-left px-4 py-2 text-sm transition-colors duration-150 ${selectedFilter === option
                                            ? 'bg-slate-50 dark:bg-slate-700 font-semibold text-[#0056D2] dark:text-blue-400'
                                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'
                                            }`}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-6">
                    {/* Main content */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Calls Section */}
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <TotalCallsIcon className="h-6 w-6 text-slate-800 dark:text-white" />
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Call Metrics</h2>
                                <span className="bg-[#10B981] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                    Real-time
                                </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                                <CallStatCard
                                    title="Incoming Calls"
                                    value={callStats.incoming.value}
                                    description="Calls received from customers"
                                    duration={callStats.incoming.duration}
                                    icon={IncomingCallIcon}
                                    colorTheme="cyan"
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
                                    colorTheme="blue"
                                />
                            </div>
                        </div>

                        {/* Analytics & Tickets Layout below Call Metrics */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Tickets Section */}
                            <div className="lg:col-span-1 flex flex-col">
                                <div className="flex items-center gap-2.5 mb-4 px-1">
                                    <svg className="w-5 h-5 text-slate-800 dark:text-white" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M4 6c0-1.1.9-2 2-2h12a2 2 0 012 2v3.5a1.5 1.5 0 000 3v3.5a2 2 0 01-2 2H6a2 2 0 01-2-2v-3.5a1.5 1.5 0 000-3V6z" fillOpacity="0.9" />
                                    </svg>
                                    <h2 className="text-[17px] font-bold text-slate-900 dark:text-white tracking-wide">Tickets</h2>
                                </div>
                                <div className="bg-white dark:bg-[#1A222C] border border-slate-100 dark:border-transparent rounded-[20px] p-6 shadow-sm flex-1 flex flex-col">
                                    <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-2 tracking-wide">Ticket Distribution</h3>
                                    <div className="flex-1 min-h-[240px]">
                                        <TicketDistributionChart />
                                    </div>
                                </div>
                            </div>

                            {/* Call Traffic Analytics Section */}
                            <div className="lg:col-span-2 flex flex-col">
                                <div className="flex items-center gap-2.5 mb-4 px-1">
                                    <svg className="w-5 h-5 text-slate-800 dark:text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M3 3v18h18" />
                                        <path d="M7 14l4-4 4 4 6-6" />
                                    </svg>
                                    <h2 className="text-[17px] font-bold text-slate-900 dark:text-white tracking-wide">Call Traffic Analytics</h2>
                                </div>
                                <div className="bg-white dark:bg-[#1A222C] border border-slate-100 dark:border-transparent rounded-[20px] p-6 shadow-sm flex-1 flex flex-col">
                                    <div className="flex space-x-6 mb-8 mt-2 text-xs font-bold tracking-wide">
                                        <div className="flex items-center space-x-2">
                                            <div className="h-2 w-2 rounded-full bg-[#0056D2]"></div>
                                            <span className="text-slate-600 dark:text-slate-200">Incoming Calls</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="h-2 w-2 rounded-full bg-[#00BCD4]"></div>
                                            <span className="text-slate-600 dark:text-slate-200">Outgoing Calls</span>
                                        </div>
                                    </div>
                                    <div style={{ width: '100%', minHeight: 250, flex: 1 }}>
                                        <ResponsiveContainer>
                                            <LineChart data={callsChartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} horizontal={true} vertical={false} />
                                                <XAxis dataKey="name" tick={{ fill: chartTickColor, fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} />
                                                <YAxis tick={{ fill: chartTickColor, fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Line type="monotone" dataKey="incoming" stroke="#0056D2" strokeWidth={2.5} dot={{ r: 4, fill: '#0056D2', stroke: chartDotStrokeColor, strokeWidth: 2 }} activeDot={{ r: 6, stroke: '#0056D2', fill: chartDotStrokeColor, strokeWidth: 2 }} name="Incoming Calls" />
                                                <Line type="monotone" dataKey="outgoing" stroke="#00BCD4" strokeWidth={2.5} dot={{ r: 4, fill: '#00BCD4', stroke: chartDotStrokeColor, strokeWidth: 2 }} activeDot={{ r: 6, stroke: '#00BCD4', fill: chartDotStrokeColor, strokeWidth: 2 }} name="Outgoing Calls" />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Row 3: Conversations & Key Metrics */}
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
                            {/* Conversations Chart */}
                            <div className="lg:col-span-3 flex flex-col">
                                <div className="flex items-center gap-2.5 mb-4 px-1">
                                    <svg className="w-[18px] h-[18px] text-slate-800 dark:text-white" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                                    </svg>
                                    <h2 className="text-[17px] font-bold text-slate-900 dark:text-white tracking-wide">Conversations</h2>
                                    <span className="bg-[#10B981] text-white text-[10px] font-bold px-2 py-[1px] rounded flex items-center shadow-sm ml-1 uppercase tracking-wider">
                                        Live
                                    </span>
                                </div>
                                <div className="bg-white dark:bg-[#1A222C] border border-slate-100 dark:border-transparent rounded-[20px] p-6 shadow-sm flex-1 flex flex-col">
                                    <div className="flex space-x-8 mb-6 mt-1 text-[11px] font-bold tracking-wide">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center space-x-1.5">
                                                <div className="h-2 w-2 rounded-full bg-[#0056D2]"></div>
                                                <span className="text-slate-600 dark:text-white">Conversations</span>
                                            </div>
                                            <span className="text-lg font-bold text-slate-900 dark:text-white">2</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center space-x-1.5">
                                                <div className="h-2 w-2 rounded-full bg-white border border-slate-300 dark:border-transparent"></div>
                                                <span className="text-slate-600 dark:text-white">Message Received</span>
                                            </div>
                                            <span className="text-lg font-bold text-slate-900 dark:text-white">38</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center space-x-1.5">
                                                <div className="h-2 w-2 rounded-full bg-[#F59E0B]"></div>
                                                <span className="text-slate-600 dark:text-white">Message Sent</span>
                                            </div>
                                            <span className="text-lg font-bold text-slate-900 dark:text-white">0</span>
                                        </div>
                                    </div>
                                    <div style={{ width: '100%', height: 260 }}>
                                        <ResponsiveContainer>
                                            <BarChart data={conversationChartData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }} barSize={12}>
                                                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} horizontal={true} vertical={false} />
                                                <XAxis dataKey="name" tick={{ fill: chartTickColor, fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />
                                                <YAxis tick={{ fill: chartTickColor, fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />
                                                <Tooltip cursor={{ fill: isDark ? '#2D3748' : '#F3F4F6' }} content={<CustomTooltip />} />
                                                <Bar dataKey="conversations" stackId="a" fill="#0056D2" radius={[0, 0, 0, 0]} name="Conversations" />
                                                <Bar dataKey="received" stackId="a" fill={isDark ? '#FFFFFF' : '#E5E7EB'} radius={[0, 0, 0, 0]} name="Message Received" />
                                                <Bar dataKey="sent" stackId="a" fill="#F59E0B" radius={[4, 4, 0, 0]} name="Message Sent" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>

                            {/* Key Metrics Sidebar */}
                            <div className="lg:col-span-1 flex flex-col">
                                <div className="flex items-center gap-2.5 mb-4 px-1">
                                    <h2 className="text-[17px] font-bold text-slate-900 dark:text-white tracking-wide">Key Metrics</h2>
                                </div>
                                <div className="space-y-4 flex-1">
                                    <RightStatCard title="Contacts" value={contacts.length} icon={ContactStatIcon} />
                                    <RightStatCard title="Accounts" value={accounts.length} icon={AccountStatIcon} />
                                    <RightStatCard title="Active Users" value="1" icon={ActiveUsersStatIcon} />
                                </div>
                            </div>
                        </div>
                        {/* Row 4: Conversation Status */}
                        <div className="mt-8 flex flex-col">
                            <div className="flex items-center gap-2.5 mb-4 px-1">
                                <h2 className="text-[17px] font-bold text-slate-900 dark:text-white tracking-wide">Conversation Status</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                                <ConversationStatCard title="Conversation Open" value={conversationStats.open} color="#0056D2" />
                                <ConversationStatCard title="Conversation Unassigned" value={conversationStats.unassigned} color="#A855F7" />
                                <ConversationStatCard title="Conversation Close" value={conversationStats.close} color="#22C55E" />
                                <ConversationStatCard title="Conversation Total" value={conversationStats.total} color="#06B6D4" />
                            </div>
                        </div>

                        {/* Row 5: Channel Performance */}
                        <div className="mt-8 flex flex-col">
                            <div className="flex items-center gap-2.5 mb-4 px-1">
                                <svg className="w-[18px] h-[18px] text-slate-800 dark:text-white" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M4 6h16v12H4z" opacity=".3" /><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12zM6 10h12v2H6zm0 4h8v2H6z" />
                                </svg>
                                <h2 className="text-[17px] font-bold text-slate-900 dark:text-white tracking-wide">Channel Performance</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                                <ChannelCard title="WhatsApp Business" value={channelStats.whatsapp || 1} icon={WhatsAppBusinessIcon} color="#25D366" />
                                <ChannelCard title="Email" value={channelStats.email || 2} icon={EmailIcon} color="#3B82F6" />
                                <ChannelCard title="Live Chat" value={channelStats.livechat || 0} icon={LiveChatIcon} color="#0ea5e9" />
                                <ChannelCard title="Voice" value={channelStats.voice || 0} icon={VoiceIcon} color="#EF4444" />
                                <ChannelCard title="Messenger" value={1} icon={() => <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M12 2C6.477 2 2 6.14 2 11.246c0 2.898 1.496 5.487 3.824 7.156v3.295l3.486-1.928c.866.242 1.77.37 2.69.37 5.523 0 10-4.14 10-9.246S17.523 2 12 2zm1.096 12.388-2.822-3.007-5.503 3.007 6.04-6.423 2.868 3.008 5.457-3.008-6.04 6.423z" /></svg>} color="#006AFF" />
                                <ChannelCard title="Instagram" value={2} icon={() => <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>} color="#E1306C" />
                                <ChannelCard title="SMS" value={2} icon={() => <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 11H7V9h2v2zm4 0h-2V9h2v2zm4 0h-2V9h2v2z" /></svg>} color="#3B82F6" />
                                <ChannelCard title="Line" value={0} icon={() => <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M24 10.3c0-4.4-4.2-8.1-9.5-8.1-5.2 0-9.5 3.7-9.5 8.1 0 4 .32 7.5 7.4 8.1l-1.3 3.1s-.1.4.3.6c.4.2.8.1.8.1l4-2.7c3.9-2.3 7.8-5 7.8-9.2zm-12.7 1.3H9.4V8.5h1.9v3.1zm2.3 0h-1.6V8.5h1.6v3.1zm3.8 0h-1.2l-1.5-2.2v2.2h-1.6V8.5h1.6l1.4 2.1V8.5h1.3v3.1z" /></svg>} color="#00C300" />
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        </div >
    );
};

export default Dashboard;
