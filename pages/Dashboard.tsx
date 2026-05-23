import React, { useState, useRef, useEffect } from 'react';
<<<<<<< HEAD
import Card from '../components/ui/Card';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { IncomingCallIcon, OutgoingCallIcon, NoAnswerIcon, TotalCallsIcon, ContactStatIcon, AccountStatIcon, ActiveUsersStatIcon, WhatsAppBusinessIcon, EmailIcon, LiveChatIcon, VoiceIcon, FilterIcon } from '../components/icons/Icons';
=======
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { IncomingCallIcon, OutgoingCallIcon, NoAnswerIcon, TotalCallsIcon, ContactStatIcon, AccountStatIcon, WhatsAppBusinessIcon, EmailIcon, LiveChatIcon, VoiceIcon, FilterIcon } from '../components/icons/Icons';
>>>>>>> d25effb6cab6af83effe1b26eefb8f8659faa69a
import { useTheme } from '../hooks/useTheme';
import { useData } from '../hooks/useData';
import { Channel } from '../types';

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
<<<<<<< HEAD
            <div className="bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-xl p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-2xl">
                <p className="label text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mb-2">{`${label}`}</p>
                {payload.map((pld: any) => (
                    <div key={pld.dataKey} style={{ color: pld.color }} className="text-sm font-bold flex items-center gap-2 mb-1.5 last:mb-0">
                        <div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: pld.color }}></div>
=======
            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-4 rounded-2xl border border-slate-200/50 dark:border-white/[0.08] shadow-2xl">
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400 mb-2">{`${label}`}</p>
                {payload.map((pld: any) => (
                    <div key={pld.dataKey} style={{ color: pld.color }} className="text-sm font-bold flex items-center gap-2 mb-1.5 last:mb-0">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: pld.color }} />
>>>>>>> d25effb6cab6af83effe1b26eefb8f8659faa69a
                        {`${pld.dataKey.charAt(0).toUpperCase() + pld.dataKey.slice(1)}: `}
                        <span className="text-slate-900 dark:text-white ml-auto pl-6 font-extrabold">{pld.value}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

<<<<<<< HEAD
=======
/* ─── Stat Card (Calls) ─── */
>>>>>>> d25effb6cab6af83effe1b26eefb8f8659faa69a
const CallStatCard: React.FC<{
    title: string;
    value: number;
    description: string;
    duration: string;
    icon: React.ElementType;
    colorTheme: 'cyan' | 'green' | 'red' | 'purple';
}> = ({ title, value, description, duration, icon: Icon, colorTheme }) => {
    const themeStyles = {
<<<<<<< HEAD
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
        <div className="bg-white/70 dark:bg-[#0B1120]/60 backdrop-blur-2xl rounded-[32px] p-5 sm:p-6 shadow-sm border border-slate-200/50 dark:border-slate-700/50 flex flex-col justify-between h-[240px] hover:-translate-y-1.5 hover:shadow-xl dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all duration-300 group relative overflow-hidden">
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
=======
        cyan:   { accent: '#06B6D4', bar: 'from-cyan-500 to-cyan-400',     glow: 'rgba(6,182,212,0.35)'   },
        green:  { accent: '#10B981', bar: 'from-emerald-500 to-emerald-400', glow: 'rgba(16,185,129,0.35)' },
        red:    { accent: '#EF4444', bar: 'from-red-500 to-red-400',        glow: 'rgba(239,68,68,0.35)'   },
        purple: { accent: '#10B981', bar: 'from-emerald-500 to-teal-400',  glow: 'rgba(16,185,129,0.35)'  },
    };
    const s = themeStyles[colorTheme];

    return (
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/80 p-5 sm:p-6 shadow-sm backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl dark:border-white/[0.08] dark:bg-slate-900/60 dark:hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] flex flex-col justify-between h-[230px] group">
            {/* top shine */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
            {/* glow orb */}
            <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" style={{ backgroundColor: s.accent }} />

            <div>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border transition-transform duration-300 group-hover:scale-110"
                        style={{ backgroundColor: `${s.accent}18`, borderColor: `${s.accent}30`, boxShadow: `0 0 20px ${s.glow}` }}>
                        <Icon className="h-5 w-5" style={{ color: s.accent }} />
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">{title}</p>
                    <p className="text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-none">{value}</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 line-clamp-1">{description}</p>
                </div>
            </div>

            <div className="mt-auto pt-4">
                <div className="h-[5px] w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mb-3">
                    <div className={`h-full rounded-full bg-gradient-to-r ${s.bar} transition-all duration-1000 ease-out`} style={{ width: `${value > 0 ? 65 : 15}%` }} />
                </div>
                <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Avg Duration</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">{duration}</span>
>>>>>>> d25effb6cab6af83effe1b26eefb8f8659faa69a
                </div>
            </div>
        </div>
    );
};

<<<<<<< HEAD
const ConversationStatCard: React.FC<{ title: string; value: number; color: string; icon: React.ElementType }> = ({ title, value, color, icon: Icon }) => {
    return (
        <div className="bg-white/70 dark:bg-[#0B1120]/60 backdrop-blur-2xl rounded-[28px] p-5 sm:p-6 shadow-sm border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between relative overflow-hidden hover:scale-[1.02] hover:shadow-lg transition-all duration-300 group">
            <div className="flex flex-col z-10 w-2/3">
                <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold mb-1.5 truncate">{title}</p>
                <p className="text-3xl font-black text-slate-900 dark:text-white drop-shadow-md">{value}</p>
            </div>
            <div className="h-12 w-12 rounded-full flex items-center justify-center z-10 transform group-hover:scale-110 transition-transform duration-500 shadow-lg text-white" style={{ backgroundColor: color, boxShadow: `0 8px 20px -8px ${color}` }}>
                <Icon className="h-6 w-6" />
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full -mr-12 -mt-12 opacity-[0.08] blur-[24px] pointer-events-none group-hover:opacity-20 transition-opacity" style={{ backgroundColor: color }}></div>
            <div className="absolute bottom-0 left-0 w-full h-[3px]" style={{ background: `linear-gradient(90deg, ${color}00 0%, ${color} 40%, ${color} 60%, ${color}00 100%)` }}></div>
        </div>
    )
};

const RightStatCard: React.FC<{ title: string; value: number | string; icon: React.ElementType }> = ({ title, value, icon: Icon }) => (
    <div className="bg-white/70 dark:bg-[#0B1120]/60 backdrop-blur-2xl rounded-[28px] p-4 sm:p-6 shadow-sm border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-[#131A2A]/80 transition-all duration-300 group cursor-pointer hover:shadow-md hover:-translate-y-1 gap-2">
        <div className="flex flex-col min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold mb-1.5 truncate">{title}</p>
            <p className="text-3xl font-black text-[#8B5CF6] dark:text-[#A78BFA] group-hover:drop-shadow-[0_0_12px_rgba(139,92,246,0.5)] transition-all">{value}</p>
        </div>
        <div className="h-12 w-12 rounded-2xl bg-[#8B5CF6]/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-[#8B5CF6]/20 shadow-[0_0_15px_rgba(139,92,246,0.15)]">
            <Icon className="h-5 w-5 text-[#8B5CF6] dark:text-[#A78BFA]" />
=======
/* ─── Conversation Stat Card ─── */
const ConversationStatCard: React.FC<{ title: string; value: number; color: string; icon: React.ElementType }> = ({ title, value, color, icon: Icon }) => (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/80 p-5 sm:p-6 shadow-sm backdrop-blur-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg dark:border-white/[0.08] dark:bg-slate-900/60 flex items-center justify-between group">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
        <div className="flex flex-col z-10 w-2/3">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold mb-1.5 truncate">{title}</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{value}</p>
        </div>
        <div className="h-12 w-12 rounded-2xl flex items-center justify-center z-10 transform group-hover:scale-110 transition-transform duration-300 text-white shadow-lg flex-shrink-0"
            style={{ backgroundColor: color, boxShadow: `0 8px 24px -8px ${color}` }}>
            <Icon className="h-6 w-6" />
        </div>
        <div className="pointer-events-none absolute bottom-0 left-0 w-full h-[2px]" style={{ background: `linear-gradient(90deg, ${color}00 0%, ${color} 50%, ${color}00 100%)` }} />
    </div>
);

/* ─── Right Stat Card ─── */
const RightStatCard: React.FC<{ title: string; value: number | string; icon: React.ElementType; onClick?: () => void }> = ({ title, value, icon: Icon, onClick }) => (
    <div
        onClick={onClick}
        className={`relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/80 p-4 sm:p-5 shadow-sm backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-white/[0.08] dark:bg-slate-900/60 flex items-center justify-between group ${onClick ? 'cursor-pointer' : ''}`}
    >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
        {/* Animated bottom line on hover */}
        <div className="pointer-events-none absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="flex flex-col min-w-0">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold mb-1.5 truncate">{title}</p>
            <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 group-hover:drop-shadow-[0_0_12px_rgba(16,185,129,0.5)] transition-all">{value}</p>
            {onClick && (
                <span className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-emerald-400 dark:text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    View all
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                </span>
            )}
        </div>
        <div className="h-11 w-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all duration-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <Icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
>>>>>>> d25effb6cab6af83effe1b26eefb8f8659faa69a
        </div>
    </div>
);

<<<<<<< HEAD
const ChannelCard: React.FC<{ title: string; value: number; icon: React.ElementType; color: string }> = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white/70 dark:bg-[#0B1120]/60 backdrop-blur-2xl rounded-[28px] p-4 sm:p-6 shadow-sm border border-slate-200/50 dark:border-slate-700/50 flex flex-col justify-between relative overflow-hidden h-[140px] hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 group">
        <div className="flex justify-between items-start z-10">
            <p className="text-[32px] sm:text-[40px] font-black text-slate-900 dark:text-white leading-none tracking-tight">{value}</p>
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl flex items-center justify-center transform group-hover:rotate-[15deg] transition-transform duration-300 flex-shrink-0" style={{ backgroundColor: `${color}15`, border: `1px solid ${color}30` }}>
                <Icon className="h-[24px] w-[24px] sm:h-[28px] sm:w-[28px] drop-shadow-sm" style={{ color }} />
            </div>
        </div>
        <p className="text-[11px] sm:text-[13px] text-slate-500 dark:text-slate-400 z-10 font-bold tracking-wide mt-auto truncate pr-2">{title}</p>
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
=======
/* ─── Channel Card ─── */
const ChannelCard: React.FC<{ title: string; value: number; icon: React.ElementType; color: string }> = ({ title, value, icon: Icon, color }) => (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/80 p-4 sm:p-5 shadow-sm backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl dark:border-white/[0.08] dark:bg-slate-900/60 flex flex-col justify-between h-[130px] group">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
        <div className="flex justify-between items-start z-10">
            <p className="text-[32px] sm:text-[38px] font-black text-slate-900 dark:text-white leading-none tracking-tight">{value}</p>
            <div className="h-10 w-10 rounded-2xl flex items-center justify-center transform group-hover:rotate-[12deg] transition-transform duration-300 flex-shrink-0"
                style={{ backgroundColor: `${color}18`, border: `1px solid ${color}35` }}>
                <Icon className="h-6 w-6 drop-shadow-sm" style={{ color }} />
            </div>
        </div>
        <p className="text-[11px] sm:text-[12px] text-slate-500 dark:text-slate-400 z-10 font-bold tracking-wide truncate pr-2">{title}</p>
        <div className="pointer-events-none absolute -bottom-10 -right-10 w-28 h-28 rounded-full opacity-[0.08] blur-3xl group-hover:opacity-20 transition-opacity" style={{ backgroundColor: color }} />
    </div>
);

/* ─── Ticket Donut ─── */
const TicketDistributionChart = () => {
    const data = [
        { name: 'Completed', value: 0, color: '#10B981', gradientId: 'tg-green' },
        { name: 'On Hold',   value: 0, color: '#06B6D4', gradientId: 'tg-cyan'  },
        { name: 'Progress',  value: 1, color: '#F59E0B', gradientId: 'tg-amber' },
        { name: 'Open',      value: 2, color: '#14B8A6', gradientId: 'tg-teal'  },
    ];
    const ordered = [...data].reverse();
    const total = data.reduce((s, d) => s + d.value, 0);
    const size = 190; const center = size / 2; const sw = 9; const gap = 5;
>>>>>>> d25effb6cab6af83effe1b26eefb8f8659faa69a

    return (
        <div className="flex flex-col items-center justify-between h-full pt-2">
            <div className="relative flex items-center justify-center">
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
                    <defs>
<<<<<<< HEAD
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
=======
                        {data.map(d => (
                            <linearGradient key={d.gradientId} id={d.gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor={d.color} stopOpacity="0.7" />
                                <stop offset="100%" stopColor={d.color} stopOpacity="1" />
                            </linearGradient>
                        ))}
                    </defs>
                    {ordered.map((item, i) => {
                        const r = (size / 2) - sw / 2 - i * (sw + gap);
                        const circ = 2 * Math.PI * r;
                        const pct = total === 0 ? 0 : item.value / total;
                        return (
                            <g key={item.name}>
                                <circle cx={center} cy={center} r={r} fill="none" stroke={item.color} strokeOpacity={0.12} strokeWidth={sw} strokeLinecap="round" />
                                {item.value > 0 && (
                                    <circle cx={center} cy={center} r={r} fill="none"
                                        stroke={`url(#${item.gradientId})`} strokeWidth={sw}
                                        strokeDasharray={`${circ * pct} ${circ}`} strokeLinecap="round"
                                        className="transition-all duration-1000 ease-out" />
>>>>>>> d25effb6cab6af83effe1b26eefb8f8659faa69a
                                )}
                            </g>
                        );
                    })}
                </svg>
<<<<<<< HEAD
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
=======
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400 mb-1">Total</span>
                    <span className="text-5xl font-black text-slate-900 dark:text-white">{total}</span>
                </div>
            </div>
            <div className="flex items-center justify-center gap-x-4 gap-y-2 flex-wrap pt-6 pb-1">
                {ordered.map(item => (
                    <div key={item.name} className="flex items-center gap-1.5 cursor-pointer group">
                        <div className="w-2.5 h-2.5 rounded-full group-hover:scale-125 transition-transform" style={{ backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}90` }} />
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{item.name}</span>
>>>>>>> d25effb6cab6af83effe1b26eefb8f8659faa69a
                    </div>
                ))}
            </div>
        </div>
    );
};

<<<<<<< HEAD
const Dashboard: React.FC = () => {
    const { theme } = useTheme();
    const { contacts, accounts } = useData();
=======
/* ─── Section Header ─── */
const SectionHeader: React.FC<{ icon: React.ReactNode; title: string; subtitle: string; badge?: React.ReactNode }> = ({ icon, title, subtitle, badge }) => (
    <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            {icon}
        </div>
        <div>
            <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{title}</h2>
                {badge}
            </div>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5">{subtitle}</p>
        </div>
    </div>
);

/* ─── Glassmorphism Chart Card ─── */
const ChartCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/80 shadow-sm backdrop-blur-2xl transition-shadow duration-500 hover:shadow-lg dark:border-white/[0.08] dark:bg-slate-900/60 p-5 sm:p-8 flex flex-col ${className}`}>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />
        {children}
    </div>
);

/* ════════════════════════════════════════ MAIN ════════════════════════════════════════ */
const Dashboard: React.FC = () => {
    const { theme } = useTheme();
    const { contacts, accounts } = useData();
    const navigate = useNavigate();
>>>>>>> d25effb6cab6af83effe1b26eefb8f8659faa69a
    const isDark = theme === 'dark';
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('Last 7 Days');
    const filterRef = useRef<HTMLDivElement>(null);

<<<<<<< HEAD
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
=======
    const [callStats, setCallStats] = useState({ incoming: { value: 0, duration: '0s' }, outgoing: { value: 0, duration: '0s' }, noAnswer: { value: 0, duration: '0s' }, total: { value: 0, duration: '0s' } });
    const [callsChartData, setCallsChartData] = useState<{ name: string; incoming: number; outgoing: number }[]>([]);
    const [conversationStats, setConversationStats] = useState({ open: 0, unassigned: 0, close: 0, total: 0 });
>>>>>>> d25effb6cab6af83effe1b26eefb8f8659faa69a
    const [conversationChartData, setConversationChartData] = useState<{ name: string; conversations: number; received: number; sent: number }[]>([]);
    const [showWelcome, setShowWelcome] = useState(true);
    const [currentTipIndex, setCurrentTipIndex] = useState(0);

    const tips = [
<<<<<<< HEAD
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
=======
        'Connect your WhatsApp Business account to start receiving messages in the dashboard.',
        "Use the 'Filter' button to view call statistics for specific time ranges.",
        "Check the 'Conversations' section to see open and unassigned chats needing attention.",
        'Invite team members to collaborate on customer support tickets.',
    ];
    const filterOptions = ['Today', 'Yesterday', 'Last 2 Days', 'Last 7 Days', 'Last 30 days'];

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => { if (filterRef.current && !filterRef.current.contains(e.target as Node)) setIsFilterOpen(false); };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
>>>>>>> d25effb6cab6af83effe1b26eefb8f8659faa69a
    }, []);

    useEffect(() => {
        const generateData = () => {
<<<<<<< HEAD
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
=======
            let days = 7; let end = new Date();
            switch (selectedFilter) {
                case 'Today':       days = 1; break;
                case 'Yesterday':   days = 1; end.setDate(end.getDate() - 1); break;
                case 'Last 2 Days': days = 2; end.setDate(end.getDate() - 1); break;
                case 'Last 7 Days': days = 7; end.setDate(end.getDate() - 1); break;
                case 'Last 30 days':days = 30; end.setDate(end.getDate() - 1); break;
            }
            const callData: { name: string; incoming: number; outgoing: number }[] = [];
            const convoData: { name: string; conversations: number; received: number; sent: number }[] = [];
            for (let i = 0; i < days; i++) {
                const d = new Date(end); d.setDate(d.getDate() - (days - 1 - i));
                const dayName = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }).toLowerCase();
                const incoming = Math.floor(Math.random() * (40 + i * 2) + 10 * (days / 7));
                const outgoing = Math.floor(Math.random() * (30 + i * 1.5) + 5 * (days / 7));
                callData.push({ name: dayName, incoming, outgoing });
                convoData.push({ name: dayName, conversations: Math.floor(Math.random() * 20 + 5), received: Math.floor(Math.random() * 80 + 20), sent: Math.floor(Math.random() * 70 + 15) });
            }
            setCallsChartData(callData); setConversationChartData(convoData);
            const ti = callData.reduce((s, d) => s + d.incoming, 0);
            const to = callData.reduce((s, d) => s + d.outgoing, 0);
            const na = Math.floor((ti + to) * (Math.random() * 0.1 + 0.05));
            const fmt = (n: number) => { if (!n) return '0s'; const m = n * (Math.random() * 2 + 1.5); if (m < 60) return `${Math.round(m)}m`; return `${Math.floor(m / 60)}h ${Math.round(m % 60)}m`; };
            setCallStats({ incoming: { value: ti, duration: fmt(ti) }, outgoing: { value: to, duration: fmt(to) }, noAnswer: { value: na, duration: '0s' }, total: { value: ti + to, duration: fmt(ti + to) } });
            const open = convoData.reduce((s, d) => s + d.conversations, 0);
            const unassigned = Math.floor(open * (Math.random() * 0.2 + 0.1));
            const close = Math.floor(convoData.reduce((s, d) => s + d.received + d.sent, 0) * 0.8);
            setConversationStats({ open, unassigned, close, total: open + unassigned + close });
>>>>>>> d25effb6cab6af83effe1b26eefb8f8659faa69a
        };
        generateData();
    }, [selectedFilter]);

    useEffect(() => {
<<<<<<< HEAD
        const interval = setInterval(() => {
            setCurrentTipIndex((prevIndex) => (prevIndex + 1) % tips.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleFilterSelect = (option: string) => {
        setSelectedFilter(option);
        setIsFilterOpen(false);
    };

=======
        const iv = setInterval(() => setCurrentTipIndex(p => (p + 1) % tips.length), 5000);
        return () => clearInterval(iv);
    }, []);

>>>>>>> d25effb6cab6af83effe1b26eefb8f8659faa69a
    const chartGridColor = isDark ? '#1E293B' : '#F1F5F9';
    const chartTickColor = isDark ? '#64748B' : '#94A3B8';

    const channelStats = {
        whatsapp: contacts.filter((c: any) => c.channel === Channel.WhatsApp).length,
        email: contacts.filter((c: any) => c.channel === Channel.Google).length,
        livechat: contacts.filter((c: any) => c.channel === Channel.LiveChat).length,
        voice: 0,
    };

    return (
<<<<<<< HEAD
        <div className="relative min-h-screen">
            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#8B5CF6] opacity-[0.05] dark:opacity-[0.03] blur-[120px] pointer-events-none"></div>
            <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#10B981] opacity-[0.05] dark:opacity-[0.03] blur-[120px] pointer-events-none"></div>

            {showWelcome && (
                <div className="bg-[#2E1065] rounded-xl p-5 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-sm border border-[#3B0764] dark:border-[#4C1D95]/30">
                    <div className="flex gap-4 items-center relative z-10">
                        <div className="flex-shrink-0 mt-1">
                            <div className="h-10 w-10 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center shadow-lg">
                                <span className="font-bold text-lg font-serif italic text-white drop-shadow-sm">i</span>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-white font-extrabold text-lg flex items-center gap-2 drop-shadow-sm">
                                Welcome to Your Dashboard! <span className="inline-block animate-bounce origin-bottom">👋</span>
                            </h3>
                            <p className="text-[#E9D5FF] text-[13px] font-medium mt-0.5 leading-relaxed">
                                This dashboard gives you a complete, real-time overview of your communication performance. Track calls, messages, tickets, and channel health with stunning clarity.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowWelcome(false)}
                        className="flex-shrink-0 relative z-10 bg-[#A855F7] hover:bg-[#9333EA] text-white text-xs font-black tracking-wide px-6 py-2.5 rounded-full shadow-[0_4px_14px_0_rgba(168,85,247,0.39)] transition-all duration-200"
                    >
                        Got it
                    </button>
                </div>
            )}

            <div className="bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-3 mb-8 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4 overflow-hidden">
                    <span className="bg-[#8B5CF6] text-white text-[10px] uppercase font-bold px-3 py-1 rounded-full flex-shrink-0 tracking-wider">
                        Quick Tip
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 text-xs font-semibold truncate transition-all duration-500 ease-in-out">
                        {tips[currentTipIndex]}
                    </p>
                </div>
                <div className="flex gap-1.5 flex-shrink-0 mr-2 ml-4">
                    {tips.map((_, index) => (
                        <div
                            key={index}
                            className={`h-1.5 rounded-full transition-all duration-300 ${index === currentTipIndex ? 'bg-[#8B5CF6] w-4 shadow-[0_0_8px_rgba(139,92,246,0.6)]' : 'bg-slate-300 dark:bg-slate-700 w-1.5'
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
                        <div className="bg-white/70 dark:bg-[#0B1120]/60 backdrop-blur-2xl border border-slate-200/50 dark:border-slate-700/50 rounded-[32px] p-5 sm:p-8 shadow-sm flex-1 flex flex-col hover:shadow-lg transition-shadow duration-500">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
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
                        <div className="bg-white/70 dark:bg-[#0B1120]/60 backdrop-blur-2xl border border-slate-200/50 dark:border-slate-700/50 rounded-[32px] p-5 sm:p-8 shadow-sm flex-1 flex flex-col hover:shadow-lg transition-shadow duration-500">
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
                        <div className="bg-white/70 dark:bg-[#0B1120]/60 backdrop-blur-2xl border border-slate-200/50 dark:border-slate-700/50 rounded-[32px] p-5 sm:p-8 shadow-sm flex-1 flex flex-col hover:shadow-lg transition-shadow duration-500">
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
                                <div className="flex flex-wrap gap-y-3 gap-x-2 sm:gap-x-6 text-[10px] sm:text-[11px] font-black tracking-wider uppercase bg-slate-50 dark:bg-slate-800/50 p-2 sm:p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                    <div className="flex flex-col gap-1 px-1.5 sm:px-2 border-r border-slate-200 dark:border-slate-700">
                                        <div className="flex items-center space-x-1.5 opacity-80">
                                            <div className="h-2 w-2 rounded-full bg-[#0351AB] shadow-[0_0_6px_rgba(3,81,171,0.6)]"></div>
                                            <span className="text-slate-600 dark:text-slate-300">Total</span>
                                        </div>
                                        <span className="text-lg font-black text-slate-900 dark:text-white pl-3.5">2</span>
                                    </div>
                                    <div className="flex flex-col gap-1 px-2 border-r border-slate-200 dark:border-slate-700">
                                        <div className="flex items-center space-x-1.5 opacity-80">
                                            <div className="h-2 w-2 rounded-full bg-[#FFAB00] shadow-[0_0_6px_rgba(255,171,0,0.6)]"></div>
                                            <span className="text-slate-600 dark:text-slate-300">Received</span>
                                        </div>
                                        <span className="text-lg font-black text-slate-900 dark:text-white pl-3.5">38</span>
                                    </div>
                                    <div className="flex flex-col gap-1 px-2">
                                        <div className="flex items-center space-x-1.5 opacity-80">
                                            <div className="h-2 w-2 rounded-full bg-[#00B8D9] shadow-[0_0_6px_rgba(0,184,217,0.6)]"></div>
                                            <span className="text-slate-600 dark:text-slate-300">Sent</span>
                                        </div>
                                        <span className="text-lg font-black text-slate-900 dark:text-white pl-3.5">0</span>
                                    </div>
=======
        /* ── Page wrapper with same background as Login ── */
        <div className="relative min-h-screen">
            {/* Background orbs — identical approach to Login — kept at z-0 so sidebar/header stay on top */}
            <div className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-br from-slate-100 via-emerald-50/30 to-teal-100/20 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950" aria-hidden />
            <div className="pointer-events-none fixed inset-0 z-0 dashboard-mesh dashboard-grid-bg opacity-60 dark:opacity-70" aria-hidden />
            <div className="pointer-events-none fixed left-1/3 top-[-5%] z-0 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-emerald-500/15 blur-3xl dark:bg-emerald-500/12" aria-hidden />
            <div className="pointer-events-none fixed bottom-0 left-[5%] z-0 h-72 w-72 rounded-full bg-teal-500/12 blur-3xl" aria-hidden />
            <div className="pointer-events-none fixed bottom-1/4 right-[5%] z-0 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" aria-hidden />

            <div className="relative z-10">

                {/* ── Welcome Banner ── */}
                {showWelcome && (
                    <div className="relative mb-6 overflow-hidden rounded-3xl border border-emerald-400/30 bg-gradient-to-br from-emerald-400/90 to-teal-500/90 p-5 shadow-lg shadow-emerald-400/20 backdrop-blur-xl dark:border-emerald-400/20">
                        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-950/10 ring-1 ring-teal-950/20 shadow-lg">
                                    <span className="text-xl">👋</span>
                                </div>
                                <div>
                                    <h3 className="text-teal-950 font-extrabold text-lg leading-tight">Welcome to Your Dashboard!</h3>
                                    <p className="text-teal-900/80 text-sm mt-0.5 leading-relaxed">Real-time overview of your communication performance — calls, messages, tickets & more.</p>
                                </div>
                            </div>
                            <button onClick={() => setShowWelcome(false)}
                                className="flex-shrink-0 rounded-2xl border border-teal-950/25 bg-teal-950/10 px-5 py-2 text-xs font-bold text-teal-950 backdrop-blur-sm transition-all hover:bg-teal-950/25 hover:shadow-lg">
                                Got it
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Quick Tip Bar ── */}
                <div className="mb-8 flex items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 shadow-sm backdrop-blur-xl dark:border-white/[0.08] dark:bg-slate-900/50">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <span className="shrink-0 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-sm shadow-emerald-500/30">
                            Quick Tip
                        </span>
                        <p className="truncate text-xs font-semibold text-slate-600 dark:text-slate-300 transition-all duration-500">{tips[currentTipIndex]}</p>
                    </div>
                    <div className="flex shrink-0 gap-1.5 ml-4">
                        {tips.map((_, i) => (
                            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === currentTipIndex ? 'w-4 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'w-1.5 bg-slate-300 dark:bg-slate-700'}`} />
                        ))}
                    </div>
                </div>

                {/* ── Page Title + Filter ── */}
                <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1">Analytics</p>
                        <h1 className="text-[32px] font-black tracking-tight text-slate-900 dark:text-white leading-tight">Overview</h1>
                        <p className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                            Tracking performance metrics
                            <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                            <span className="font-bold text-slate-700 dark:text-slate-300">{selectedFilter}</span>
                        </p>
                    </div>
                    <div className="relative" ref={filterRef}>
                        <button onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className="flex items-center gap-2 rounded-2xl border border-slate-200/90 bg-white/90 px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:shadow-md dark:border-white/[0.1] dark:bg-slate-900/80 dark:text-white dark:hover:bg-slate-800">
                            <FilterIcon className="h-4 w-4 text-emerald-500" />
                            <span>{selectedFilter}</span>
                            <svg className={`h-4 w-4 transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {isFilterOpen && (
                            <div className="absolute top-[calc(100%+8px)] right-0 z-20 w-52 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-white/[0.08] dark:bg-slate-900/95">
                                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
                                <div className="py-2">
                                    {filterOptions.map(opt => (
                                        <button key={opt} onClick={() => { setSelectedFilter(opt); setIsFilterOpen(false); }}
                                            className={`flex w-full items-center justify-between px-5 py-2.5 text-sm transition-colors ${selectedFilter === opt ? 'bg-emerald-50 font-bold text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400' : 'font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/50'}`}>
                                            {opt}
                                            {selectedFilter === opt && <div className="h-2 w-2 rounded-full bg-emerald-500" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Call Stats Grid ── */}
                <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                    <CallStatCard title="Incoming Calls" value={callStats.incoming.value} description="Calls received from customers" duration={callStats.incoming.duration} icon={IncomingCallIcon} colorTheme="purple" />
                    <CallStatCard title="Outgoing Calls" value={callStats.outgoing.value} description="Calls made to customers" duration={callStats.outgoing.duration} icon={OutgoingCallIcon} colorTheme="green" />
                    <CallStatCard title="No Answer" value={callStats.noAnswer.value} description="Calls that were not answered" duration={callStats.noAnswer.duration} icon={NoAnswerIcon} colorTheme="red" />
                    <CallStatCard title="Total Calls" value={callStats.total.value} description="Sum of all call activities" duration={callStats.total.duration} icon={TotalCallsIcon} colorTheme="cyan" />
                </div>

                {/* ── Call Traffic + Ticket Donut ── */}
                <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
                    <div className="lg:col-span-8">
                        <ChartCard className="h-full">
                            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between mb-8">
                                <SectionHeader
                                    icon={<svg className="w-5 h-5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="M7 14l4-4 4 4 6-6" /></svg>}
                                    title="Call Traffic Analytics"
                                    subtitle="Performance over time"
                                />
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-1.5 dark:bg-slate-800/50">
                                        <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Incoming</span>
                                    </div>
                                    <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-1.5 dark:bg-slate-800/50">
                                        <div className="h-2 w-2 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.8)]" />
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Outgoing</span>
                                    </div>
                                </div>
                            </div>
                            <div style={{ width: '100%', minHeight: 300, flex: 1 }}>
                                <ResponsiveContainer>
                                    <AreaChart data={callsChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%"  stopColor="#10B981" stopOpacity={0.35} />
                                                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%"  stopColor="#14B8A6" stopOpacity={0.35} />
                                                <stop offset="95%" stopColor="#14B8A6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="4 4" stroke={chartGridColor} horizontal vertical={false} />
                                        <XAxis dataKey="name" tick={{ fill: chartTickColor, fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} tickMargin={12} />
                                        <YAxis tick={{ fill: chartTickColor, fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} tickMargin={12} />
                                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: isDark ? '#334155' : '#CBD5E1', strokeWidth: 1, strokeDasharray: '4 4' }} />
                                        <Area type="monotone" dataKey="incoming" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorIn)" activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2, fill: '#10B981' }} />
                                        <Area type="monotone" dataKey="outgoing" stroke="#14B8A6" strokeWidth={3} fillOpacity={1} fill="url(#colorOut)" activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2, fill: '#14B8A6' }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </ChartCard>
                    </div>
                    <div className="lg:col-span-4">
                        <ChartCard className="h-full">
                            <SectionHeader
                                icon={<svg className="w-5 h-5 text-emerald-500" viewBox="0 0 24 24" fill="currentColor"><path d="M4 6c0-1.1.9-2 2-2h12a2 2 0 012 2v3.5a1.5 1.5 0 000 3v3.5a2 2 0 01-2 2H6a2 2 0 01-2-2v-3.5a1.5 1.5 0 000-3V6z" fillOpacity="0.9" /></svg>}
                                title="Tickets"
                                subtitle="Distribution Status"
                            />
                            <div className="flex-1 flex items-center justify-center mt-4">
                                <TicketDistributionChart />
                            </div>
                        </ChartCard>
                    </div>
                </div>

                {/* ── Conversations Chart + Stat Cards ── */}
                <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
                    <div className="lg:col-span-8">
                        <ChartCard className="h-full">
                            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between mb-8">
                                <SectionHeader
                                    icon={<svg className="w-5 h-5 text-amber-500" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" /></svg>}
                                    title="Conversations"
                                    subtitle="Message Engagement"
                                    badge={<span className="rounded bg-gradient-to-r from-emerald-500 to-emerald-400 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-white shadow-sm shadow-emerald-500/30">Live</span>}
                                />
                                <div className="flex gap-2 flex-wrap text-[10px] font-black tracking-wider uppercase rounded-xl border border-slate-100 bg-slate-50 p-2.5 dark:border-slate-700/50 dark:bg-slate-800/50">
                                    {[
                                        { label: 'Total',    color: '#0351AB', value: '2'  },
                                        { label: 'Received', color: '#F59E0B', value: '38' },
                                        { label: 'Sent',     color: '#06B6D4', value: '0'  },
                                    ].map((item, i, arr) => (
                                        <div key={item.label} className={`flex flex-col gap-1 px-2 ${i < arr.length - 1 ? 'border-r border-slate-200 dark:border-slate-700' : ''}`}>
                                            <div className="flex items-center gap-1.5 opacity-80">
                                                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color, boxShadow: `0 0 6px ${item.color}99` }} />
                                                <span className="text-slate-600 dark:text-slate-300">{item.label}</span>
                                            </div>
                                            <span className="text-lg font-black text-slate-900 dark:text-white pl-3.5">{item.value}</span>
                                        </div>
                                    ))}
>>>>>>> d25effb6cab6af83effe1b26eefb8f8659faa69a
                                </div>
                            </div>
                            <div style={{ width: '100%', height: 260 }}>
                                <ResponsiveContainer>
<<<<<<< HEAD
                                    <BarChart data={conversationChartData} margin={{ top: 20, right: 10, left: -25, bottom: 5 }} barSize={16}>
                                        <CartesianGrid strokeDasharray="4 4" stroke={chartGridColor} horizontal={true} vertical={false} />
                                        <XAxis dataKey="name" tick={{ fill: chartTickColor, fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} tickMargin={12} />
                                        <YAxis tick={{ fill: chartTickColor, fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} tickMargin={12} />
                                        <Tooltip cursor={{ fill: isDark ? '#1E293B' : '#F8FAFC', opacity: 0.5 }} content={<CustomTooltip />} />
                                        <Bar dataKey="conversations" stackId="a" fill="#0351AB" radius={[0, 0, 4, 4]} name="Conversations" />
                                        <Bar dataKey="received" stackId="a" fill="#FFAB00" radius={[0, 0, 0, 0]} name="Message Received" />
                                        <Bar dataKey="sent" stackId="a" fill="#00B8D9" radius={[4, 4, 0, 0]} name="Message Sent" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-4 flex flex-col space-y-6">
                        <ConversationStatCard title="Open" value={conversationStats.open} color="#8B5CF6" icon={(props) => (
                            <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
                                <path d="M17 10.5V6c0-1.65-1.35-3-3-3H4C2.35 3 1 4.35 1 6v5.5c0 1.65 1.35 3 3 3h1.5v3.5L9.5 14.5h4.5c1.65 0 3-1.35 3-3z" opacity="0.6" />
                                <path d="M23 9.5v5.5c0 1.65-1.35 3-3 3h-1.5v3.5l-4-3.5h-4.5c-1.65 0-3-1.35-3-3V11c0-1.65 1.35-3 3-3h10c1.65 0 3 1.35 3 3z" />
                            </svg>
                        )} />
                        <ConversationStatCard title="Unassigned" value={conversationStats.unassigned} color="#EC4899" icon={(props) => (
                            <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
                                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 14h-4.5c-.28 1.14-1.29 2-2.5 2s-2.22-.86-2.5-2H5V5h14v12z" />
                            </svg>
                        )} />
                        <ConversationStatCard title="Closed" value={conversationStats.close} color="#10B981" icon={(props) => (
                            <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
                                <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-9.5 9.5-2.5-2.5 1.41-1.41 1.09 1.09 3.09-3.09 1.41 1.41-4.5 4.5z" />
                            </svg>
                        )} />
                        <div className="flex-1 grid grid-cols-2 gap-4 items-end mt-4">
                            <RightStatCard title="Total Contacts" value={contacts.length} icon={ContactStatIcon} />
                            <RightStatCard title="Total Accounts" value={accounts.length} icon={AccountStatIcon} />
=======
                                    <BarChart data={conversationChartData} margin={{ top: 20, right: 10, left: -25, bottom: 5 }} barSize={14}>
                                        <CartesianGrid strokeDasharray="4 4" stroke={chartGridColor} horizontal vertical={false} />
                                        <XAxis dataKey="name" tick={{ fill: chartTickColor, fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} tickMargin={12} />
                                        <YAxis tick={{ fill: chartTickColor, fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} tickMargin={12} />
                                        <Tooltip cursor={{ fill: isDark ? '#1E293B' : '#F8FAFC', opacity: 0.5 }} content={<CustomTooltip />} />
                                        <Bar dataKey="conversations" stackId="a" fill="#0351AB" radius={[0, 0, 4, 4]} />
                                        <Bar dataKey="received"      stackId="a" fill="#F59E0B" radius={[0, 0, 0, 0]} />
                                        <Bar dataKey="sent"          stackId="a" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </ChartCard>
                    </div>

                    <div className="lg:col-span-4 flex flex-col gap-5">
                        <ConversationStatCard title="Open" value={conversationStats.open} color="#14B8A6" icon={(p: any) => (
                            <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M17 10.5V6c0-1.65-1.35-3-3-3H4C2.35 3 1 4.35 1 6v5.5c0 1.65 1.35 3 3 3h1.5v3.5L9.5 14.5h4.5c1.65 0 3-1.35 3-3z" opacity="0.6" /><path d="M23 9.5v5.5c0 1.65-1.35 3-3 3h-1.5v3.5l-4-3.5h-4.5c-1.65 0-3-1.35-3-3V11c0-1.65 1.35-3 3-3h10c1.65 0 3 1.35 3 3z" /></svg>
                        )} />
                        <ConversationStatCard title="Unassigned" value={conversationStats.unassigned} color="#EC4899" icon={(p: any) => (
                            <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 14h-4.5c-.28 1.14-1.29 2-2.5 2s-2.22-.86-2.5-2H5V5h14v12z" /></svg>
                        )} />
                        <ConversationStatCard title="Closed" value={conversationStats.close} color="#10B981" icon={(p: any) => (
                            <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-9.5 9.5-2.5-2.5 1.41-1.41 1.09 1.09 3.09-3.09 1.41 1.41-4.5 4.5z" /></svg>
                        )} />
                        <div className="grid grid-cols-2 gap-4 flex-1">
                            <RightStatCard title="Total Contacts" value={contacts.length} icon={ContactStatIcon} onClick={() => navigate('/contacts')} />
                            <RightStatCard title="Total Accounts" value={accounts.length} icon={AccountStatIcon} onClick={() => navigate('/accounts')} />
>>>>>>> d25effb6cab6af83effe1b26eefb8f8659faa69a
                        </div>
                    </div>
                </div>

<<<<<<< HEAD
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
=======
                {/* ── Channel Performance ── */}
                <div className="mb-4">
                    <div className="flex items-center gap-3 mb-6 ml-1">
                        <SectionHeader
                            icon={<svg className="w-5 h-5 text-pink-500" viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h16v12H4z" opacity=".15" /><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12zM6 10h12v2H6zm0 4h8v2H6z" /></svg>}
                            title="Channel Performance"
                            subtitle="Integrations Health"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-6">
>>>>>>> d25effb6cab6af83effe1b26eefb8f8659faa69a
                        <ChannelCard title="WhatsApp Business" value={channelStats.whatsapp || 1} icon={WhatsAppBusinessIcon} color="#25D366" />
                        <ChannelCard title="Email" value={channelStats.email || 2} icon={EmailIcon} color="#3B82F6" />
                        <ChannelCard title="Live Chat" value={channelStats.livechat || 0} icon={LiveChatIcon} color="#0EA5E9" />
                        <ChannelCard title="Voice" value={channelStats.voice || 0} icon={VoiceIcon} color="#EF4444" />
<<<<<<< HEAD
                        <ChannelCard title="Messenger" value={1} icon={(props) => (
                            <svg {...props} viewBox="0 0 24 24" fill="url(#ms-grad)">
                                <defs>
                                    <linearGradient id="ms-grad" x1="0%" y1="100%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#00B2FF"/>
                                        <stop offset="100%" stopColor="#006AFF"/>
                                    </linearGradient>
                                </defs>
                                <path d="M12 2C6.477 2 2 6.14 2 11.246c0 2.898 1.496 5.487 3.824 7.156v3.295l3.486-1.928c.866.242 1.77.37 2.69.37 5.523 0 10-4.14 10-9.246S17.523 2 12 2zm1.096 12.388-2.822-3.007-5.503 3.007 6.04-6.423 2.868 3.008 5.457-3.008-6.04 6.423z" />
                            </svg>
                        )} color="#006AFF" />
                        <ChannelCard title="Instagram" value={2} icon={(props) => (
                            <svg {...props} viewBox="0 0 24 24" fill="url(#ig-grad)">
                                <defs>
                                    <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#f09433"/>
                                        <stop offset="25%" stopColor="#e6683c"/>
                                        <stop offset="50%" stopColor="#dc2743"/>
                                        <stop offset="75%" stopColor="#cc2366"/>
                                        <stop offset="100%" stopColor="#bc1888"/>
                                    </linearGradient>
                                </defs>
=======
                        <ChannelCard title="Messenger" value={1} icon={(p: any) => (
                            <svg {...p} viewBox="0 0 24 24" fill="url(#ms-g)">
                                <defs><linearGradient id="ms-g" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#00B2FF" /><stop offset="100%" stopColor="#006AFF" /></linearGradient></defs>
                                <path d="M12 2C6.477 2 2 6.14 2 11.246c0 2.898 1.496 5.487 3.824 7.156v3.295l3.486-1.928c.866.242 1.77.37 2.69.37 5.523 0 10-4.14 10-9.246S17.523 2 12 2zm1.096 12.388-2.822-3.007-5.503 3.007 6.04-6.423 2.868 3.008 5.457-3.008-6.04 6.423z" />
                            </svg>
                        )} color="#006AFF" />
                        <ChannelCard title="Instagram" value={2} icon={(p: any) => (
                            <svg {...p} viewBox="0 0 24 24" fill="url(#ig-g)">
                                <defs><linearGradient id="ig-g" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#f09433" /><stop offset="25%" stopColor="#e6683c" /><stop offset="50%" stopColor="#dc2743" /><stop offset="75%" stopColor="#cc2366" /><stop offset="100%" stopColor="#bc1888" /></linearGradient></defs>
>>>>>>> d25effb6cab6af83effe1b26eefb8f8659faa69a
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                            </svg>
                        )} color="#E1306C" />
                    </div>
                </div>
<<<<<<< HEAD
=======

>>>>>>> d25effb6cab6af83effe1b26eefb8f8659faa69a
            </div>
        </div>
    );
};

export default Dashboard;