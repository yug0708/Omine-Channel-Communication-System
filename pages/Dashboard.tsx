
import React, { useState, useRef, useEffect } from 'react';
import Card from '../components/ui/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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
            iconBg: 'bg-cyan-50 dark:bg-cyan-500/10',
            iconText: 'text-cyan-500 dark:text-cyan-400',
            coloredValue: 'text-cyan-600 dark:text-cyan-400',
            durationBg: 'bg-cyan-50/50 dark:bg-cyan-500/5',
            bar: 'bg-cyan-500',
            track: 'bg-cyan-500/10 dark:bg-cyan-500/20'
        },
        green: {
            iconBg: 'bg-green-50 dark:bg-green-500/10',
            iconText: 'text-green-500 dark:text-green-400',
            coloredValue: 'text-green-600 dark:text-green-400',
            durationBg: 'bg-green-50/50 dark:bg-green-500/5',
            bar: 'bg-green-500',
            track: 'bg-green-500/10 dark:bg-green-500/20'
        },
        red: {
            iconBg: 'bg-orange-50 dark:bg-orange-500/10',
            iconText: 'text-orange-500 dark:text-orange-400',
            coloredValue: 'text-orange-600 dark:text-orange-400',
            durationBg: 'bg-orange-50/50 dark:bg-orange-500/5',
            bar: 'bg-orange-500',
            track: 'bg-orange-500/10 dark:bg-orange-500/20'
        },
        blue: {
            iconBg: 'bg-blue-50 dark:bg-blue-500/10',
            iconText: 'text-blue-500 dark:text-blue-400',
            coloredValue: 'text-blue-600 dark:text-blue-400',
            durationBg: 'bg-blue-50/50 dark:bg-blue-500/5',
            bar: 'bg-blue-500',
            track: 'bg-blue-500/10 dark:bg-blue-500/20'
        }
    };

    const style = themeStyles[colorTheme];

    return (
        <div className="bg-white dark:bg-[#151B25] rounded-[24px] p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between h-[280px]">
            <div>
                {/* Icon Circle */}
                <div className={`h-12 w-12 rounded-full ${style.iconBg} flex items-center justify-center mb-6`}>
                    <Icon className={`h-6 w-6 ${style.iconText}`} />
                </div>

                {/* Title */}
                <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-2">{title}</h3>

                {/* Value */}
                <p className={`text-[40px] leading-tight font-bold ${style.coloredValue} mb-2`}>{value}</p>

                {/* Description */}
                <p className="text-slate-400 dark:text-slate-500 text-xs mb-6">{description}</p>
            </div>

            <div>
                {/* Duration Box */}
                <div className={`rounded-xl px-4 py-3 flex items-center gap-3 ${style.durationBg} border border-transparent dark:border-slate-800/50 mb-4`}>
                    <div className={`p-1 rounded-full border border-current ${style.iconText} opacity-70`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold mb-0.5">Duration (Second)</p>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{duration}</p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className={`h-1.5 w-full ${style.track} rounded-full overflow-hidden`}>
                    <div
                        className={`h-full ${style.bar} rounded-full transition-all duration-1000 ease-out`}
                        style={{ width: `${value > 0 ? 65 : 15}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
};

const ConversationStatCard: React.FC<{ title: string; value: number; color: string; }> = ({ title, value, color }) => {
    const blobStyle: React.CSSProperties = {
        position: 'absolute',
        right: '-40px',
        top: '-40px',
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        filter: 'blur(30px)',
        opacity: 0.2,
    };

    return (
        <Card className="relative overflow-hidden">
            <div style={{ ...blobStyle, background: color }}></div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
            <p className="text-slate-500 dark:text-slate-400 mt-1">{title}</p>
        </Card>
    )
};

const RightStatCard: React.FC<{ title: string; value: number | string; icon: React.ElementType; color: string; }> = ({ title, value, icon: Icon, color }) => (
    <Card className="relative flex items-center justify-between overflow-hidden">
        <Icon className="absolute right-0 -bottom-4 h-24 w-24 text-slate-900/5 dark:text-white/5" />
        <div>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
            <p className="text-slate-500 dark:text-slate-400">{title}</p>
        </div>
    </Card>
);

const ChannelCard: React.FC<{ title: string; value: number; icon: React.ElementType; }> = ({ title, value, icon: Icon }) => (
    <Card>
        <div className="flex items-center space-x-4">
            <Icon className="h-10 w-10" />
            <div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
                <p className="text-slate-500 dark:text-slate-400">{title}</p>
            </div>
        </div>
    </Card>
);


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
                <div className="bg-[#E0F7FA] rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-[#B2EBF2] shadow-sm animate-slide-in-right">
                    <div className="flex gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                            <div className="h-6 w-6 rounded-full bg-[#00BCD4] flex items-center justify-center shadow-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-[#006064] font-bold text-sm flex items-center gap-2">
                                Welcome to Your Dashboard! <span className="inline-block hover:animate-spin">👋</span>
                            </h3>
                            <p className="text-[#00838F] text-xs mt-1 leading-relaxed">
                                This dashboard gives you a complete overview of your communication performance. Track calls, messages, tickets, and channel performance in one place.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowWelcome(false)}
                        className="flex-shrink-0 bg-[#0056D2] hover:bg-[#00449E] text-white text-xs font-semibold px-5 py-2 rounded-full transition-colors shadow-sm"
                    >
                        Got it
                    </button>
                </div>
            )}

            {/* Quick Tip Ticker */}
            <div className="bg-[#F1F7FF] border border-[#D0E6FF] rounded-lg p-3 mb-6 flex items-center justify-between animate-slide-in-right">
                <div className="flex items-center gap-3 overflow-hidden">
                    <span className="bg-[#0056D2] text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                        Quick Tip
                    </span>
                    <p className="text-[#00449E] text-sm font-medium truncate transition-all duration-500 ease-in-out">
                        {tips[currentTipIndex]}
                    </p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                    {tips.map((_, index) => (
                        <div
                            key={index}
                            className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${index === currentTipIndex ? 'bg-[#0056D2] w-3' : 'bg-[#B0D0FF]'
                                }`}
                        />
                    ))}
                </div>
            </div>
            {/* Header Section */}
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

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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

                    {/* Calls Chart */}
                    <Card>
                        <div className="flex space-x-6 mb-4 text-sm">
                            <div className="flex items-center space-x-2"><div className="h-3 w-3 rounded-full bg-green-500"></div><span className="text-slate-600 dark:text-slate-300">Incoming Calls</span></div>
                            <div className="flex items-center space-x-2"><div className="h-3 w-3 rounded-full bg-accent-blue"></div><span className="text-slate-600 dark:text-slate-300">Outgoing Calls</span></div>
                        </div>
                        <div style={{ width: '100%', height: 250 }}>
                            <ResponsiveContainer>
                                <LineChart data={callsChartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} horizontal={true} vertical={false} />
                                    <XAxis dataKey="name" tick={{ fill: chartTickColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: chartTickColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Line type="monotone" dataKey="incoming" stroke="#22c55e" strokeWidth={2} dot={{ r: 4, fill: '#22c55e', stroke: chartDotStrokeColor, strokeWidth: 2 }} activeDot={{ r: 6, stroke: '#22c55e', fill: chartDotStrokeColor, strokeWidth: 2 }} name="Incoming Calls" />
                                    <Line type="monotone" dataKey="outgoing" stroke="#00B2FF" strokeWidth={2} dot={{ r: 4, fill: '#00B2FF', stroke: chartDotStrokeColor, strokeWidth: 2 }} activeDot={{ r: 6, stroke: '#00B2FF', fill: chartDotStrokeColor, strokeWidth: 2 }} name="Outgoing Calls" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Conversations Section */}
                    <div className="p-1">
                        <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">Conversations</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                            <ConversationStatCard title="Conversation Open" value={conversationStats.open} color="#FBBF24" />
                            <ConversationStatCard title="Conversation Unassigned" value={conversationStats.unassigned} color="#8B5CF6" />
                            <ConversationStatCard title="Conversation Close" value={conversationStats.close} color="#10B981" />
                            <ConversationStatCard title="Conversation Total" value={conversationStats.total} color="#38BDF8" />
                        </div>
                    </div>

                    {/* Conversations Chart */}
                    <Card>
                        <div className="flex space-x-6 mb-4 text-sm">
                            <div className="flex items-center space-x-2"><div className="h-3 w-3 rounded-full bg-green-500"></div><span className="text-slate-600 dark:text-slate-300">Conversations</span></div>
                            <div className="flex items-center space-x-2"><div className="h-3 w-3 rounded-full bg-yellow-400"></div><span className="text-slate-600 dark:text-slate-300">Message Received</span></div>
                            <div className="flex items-center space-x-2"><div className="h-3 w-3 rounded-full bg-accent-blue"></div><span className="text-slate-600 dark:text-slate-300">Message Sent</span></div>
                        </div>
                        <div style={{ width: '100%', height: 250 }}>
                            <ResponsiveContainer>
                                <LineChart data={conversationChartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} horizontal={true} vertical={false} />
                                    <XAxis dataKey="name" tick={{ fill: chartTickColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: chartTickColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Line type="monotone" dataKey="conversations" stroke="#22c55e" strokeWidth={2} dot={{ r: 4, fill: '#22c55e', stroke: chartDotStrokeColor, strokeWidth: 2 }} activeDot={{ r: 6 }} name="Conversations" />
                                    <Line type="monotone" dataKey="received" stroke="#FBBF24" strokeWidth={2} dot={{ r: 4, fill: '#FBBF24', stroke: chartDotStrokeColor, strokeWidth: 2 }} activeDot={{ r: 6 }} name="Message Received" />
                                    <Line type="monotone" dataKey="sent" stroke="#00B2FF" strokeWidth={2} dot={{ r: 4, fill: '#00B2FF', stroke: chartDotStrokeColor, strokeWidth: 2 }} activeDot={{ r: 6 }} name="Message Sent" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>

                {/* Right sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="space-y-6">
                        <RightStatCard title="Contact" value={contacts.length} icon={ContactStatIcon} color="text-green-400" />
                        <RightStatCard title="Account" value={accounts.length} icon={AccountStatIcon} color="text-green-400" />
                        <RightStatCard title="Active Users" value="3" icon={ActiveUsersStatIcon} color="text-green-400" />
                    </div>
                    <div className="p-1">
                        <h2 className="text-2xl font-semibold mb-4 mt-12 text-slate-900 dark:text-white">Channel</h2>
                        <div className="space-y-4">
                            <ChannelCard title="WhatsApp Business" value={channelStats.whatsapp} icon={WhatsAppBusinessIcon} />
                            <ChannelCard title="Email" value={channelStats.email} icon={EmailIcon} />
                            <ChannelCard title="Live Chat" value={channelStats.livechat} icon={LiveChatIcon} />
                            <ChannelCard title="Voice" value={channelStats.voice} icon={VoiceIcon} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
