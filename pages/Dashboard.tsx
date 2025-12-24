
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

const CallStatCard: React.FC<{ title: string; value: number; duration: string; icon: React.ElementType; iconColor: string; }> = ({ title, value, duration, icon: Icon, iconColor }) => (
    <Card className="flex items-center justify-between">
        <div>
            <p className="text-slate-500 dark:text-slate-400">{title}</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white my-1">{value}</p>
            <div className="flex items-center space-x-2 text-slate-400 dark:text-slate-500 text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>{duration}</span>
            </div>
        </div>
        <Icon className={`h-12 w-12 ${iconColor}`} />
    </Card>
);

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
        <div style={{...blobStyle, background: color}}></div>
        <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
        <p className="text-slate-500 dark:text-slate-400 mt-1">{title}</p>
    </Card>
)};

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
    const [callsChartData, setCallsChartData] = useState<{name: string; incoming: number; outgoing: number;}[]>([]);
    const [conversationStats, setConversationStats] = useState({
        open: 0, unassigned: 0, close: 0, total: 0,
    });
    const [conversationChartData, setConversationChartData] = useState<{name: string; conversations: number; received: number; sent: number}[]>([]);


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
                
                const incoming = Math.floor(Math.random() * (40 + i * 2) + 10 * (daysToShow/7));
                const outgoing = Math.floor(Math.random() * (30 + i * 1.5) + 5 * (daysToShow/7));
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
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Main content */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Calls Section */}
                    <div className="p-1">
                        <div className="flex justify-between items-center mb-4">
                             <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Calls</h2>
                             <div className="relative" ref={filterRef}>
                                <button
                                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                                    className="flex items-center space-x-2 bg-white dark:bg-dark-card text-slate-800 dark:text-slate-200 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                                >
                                    <FilterIcon className="h-4 w-4 text-slate-500" />
                                    <span>{selectedFilter}</span>
                                </button>
                                {isFilterOpen && (
                                    <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-dark-card border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-10 p-1">
                                        {filterOptions.map((option) => (
                                            <button
                                                key={option}
                                                onClick={() => handleFilterSelect(option)}
                                                className={`w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors duration-150 ${
                                                    selectedFilter === option
                                                        ? 'bg-slate-200 dark:bg-slate-700 font-semibold text-slate-900 dark:text-white'
                                                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'
                                                }`}
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                           <CallStatCard title="Incoming Calls" value={callStats.incoming.value} duration={callStats.incoming.duration} icon={IncomingCallIcon} iconColor="text-green-500" />
                           <CallStatCard title="Outgoing Calls" value={callStats.outgoing.value} duration={callStats.outgoing.duration} icon={OutgoingCallIcon} iconColor="text-green-500" />
                           <CallStatCard title="No Answer" value={callStats.noAnswer.value} duration={callStats.noAnswer.duration} icon={NoAnswerIcon} iconColor="text-accent-orange" />
                           <CallStatCard title="Total Calls" value={callStats.total.value} duration={callStats.total.duration} icon={TotalCallsIcon} iconColor="text-accent-cyan" />
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
                                    <Line type="monotone" dataKey="incoming" stroke="#22c55e" strokeWidth={2} dot={{r: 4, fill: '#22c55e', stroke: chartDotStrokeColor, strokeWidth: 2}} activeDot={{ r: 6, stroke: '#22c55e', fill: chartDotStrokeColor, strokeWidth: 2 }} name="Incoming Calls" />
                                    <Line type="monotone" dataKey="outgoing" stroke="#00B2FF" strokeWidth={2} dot={{r: 4, fill: '#00B2FF', stroke: chartDotStrokeColor, strokeWidth: 2}} activeDot={{ r: 6, stroke: '#00B2FF', fill: chartDotStrokeColor, strokeWidth: 2 }} name="Outgoing Calls" />
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
                                    <Line type="monotone" dataKey="conversations" stroke="#22c55e" strokeWidth={2} dot={{r: 4, fill: '#22c55e', stroke: chartDotStrokeColor, strokeWidth: 2}} activeDot={{ r: 6 }} name="Conversations" />
                                    <Line type="monotone" dataKey="received" stroke="#FBBF24" strokeWidth={2} dot={{r: 4, fill: '#FBBF24', stroke: chartDotStrokeColor, strokeWidth: 2}} activeDot={{ r: 6 }} name="Message Received" />
                                     <Line type="monotone" dataKey="sent" stroke="#00B2FF" strokeWidth={2} dot={{r: 4, fill: '#00B2FF', stroke: chartDotStrokeColor, strokeWidth: 2}} activeDot={{ r: 6 }} name="Message Sent" />
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
