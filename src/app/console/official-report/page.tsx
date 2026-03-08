'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Download, Search, Loader2, Filter, BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSports, type ApiSport } from '@/lib/api';

interface Registration {
    id: string;
    registration_code: string;
    student_name: string;
    college_name: string;
    sports: string;
    status: string;
    total_amount: string;
    created_at: string;
}

export default function OfficialReportPage() {
    const [data, setData] = useState<{ analytics: any; registrations: Registration[] }>({ 
        analytics: {}, 
        registrations: [] 
    });
    const [availableSports, setAvailableSports] = useState<ApiSport[]>([]);
    const [filters, setFilters] = useState({ status: '', sport_id: '', college_id: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [generationTime, setGenerationTime] = useState<string>('');

    useEffect(() => {
        setGenerationTime(new Date().toLocaleString());
        // Fetch available sports for the filter dropdown
        getSports().then(setAvailableSports).catch(() => []);
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const query = new URLSearchParams(filters).toString();
            const res = await fetch(`https://energy-sports-meet-backend.vercel.app/api/v1/register/official-report?${query}`);
            const result = await res.json();
            setData(result);
        } catch (error) {
            console.error("Failed to fetch report:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filters]);

    const filteredRegistrations = useMemo(() => {
        return (data.registrations || []).filter(reg => 
            reg.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reg.registration_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reg.college_name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [data.registrations, searchTerm]);

    // Optimized Statistical Analysis per Sport
    const sportsStatistics = useMemo(() => {
        const stats: Record<string, { total: number; approved: number; pending: number; value: number }> = {};
        
        filteredRegistrations.forEach(reg => {
            const sportItems = reg.sports.split(',').map(s => s.trim());
            sportItems.forEach(sport => {
                if (!stats[sport]) {
                    stats[sport] = { total: 0, approved: 0, pending: 0, value: 0 };
                }
                stats[sport].total += 1;
                if (reg.status === 'approved') {
                    stats[sport].approved += 1;
                    // For statistics, we distribute the total amount across the sports listed
                    // This is an estimation since amount is per-registration
                    stats[sport].value += parseFloat(reg.total_amount) / sportItems.length;
                } else {
                    stats[sport].pending += 1;
                }
            });
        });

        return Object.entries(stats).sort((a, b) => b[1].total - a[1].total);
    }, [filteredRegistrations]);

    const totalRevenue = useMemo(() => {
        return filteredRegistrations
            .filter(r => r.status === 'approved')
            .reduce((sum, r) => sum + parseFloat(r.total_amount), 0);
    }, [filteredRegistrations]);

    const exportToExcel = () => {
        const headers = ["ID", "Name", "College", "Sports", "Amount", "Status", "Date"];
        const rows = filteredRegistrations.map(r => [
            r.registration_code,
            r.student_name,
            r.college_name,
            r.sports,
            r.total_amount,
            r.status,
            new Date(r.created_at).toLocaleDateString()
        ]);

        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");
            
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `energy_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="min-h-screen bg-white font-sans text-black p-4 md:p-8 selection:bg-blue-100">
            {/* Simple Spreadsheet-style Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b-2 border-black pb-4 mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold uppercase tracking-tight">Registration Registry & Sport Analytics</h1>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                        {generationTime ? `Generated on ${generationTime}` : 'Generating registry view...'}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={exportToExcel}
                        className="flex items-center gap-2 bg-gray-100 border border-gray-400 hover:bg-gray-200 px-4 py-1.5 text-xs font-bold transition-colors shadow-sm active:scale-95 uppercase tracking-tighter"
                    >
                        <Download size={14} /> Export CSV
                    </button>
                </div>
            </div>

            {/* Sport Summary Section (Utilitarian Table) */}
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                    <BarChart2 size={16} className="text-gray-400" />
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-600">Sport Wise Metrics Summary</h2>
                </div>
                <div className="overflow-x-auto border border-gray-300">
                    <table className="w-full text-left border-collapse table-auto text-[11px]">
                        <thead>
                            <tr className="bg-gray-100 border-b border-gray-300">
                                <th className="px-4 py-2 border-r border-gray-300 font-black uppercase">Sport Name</th>
                                <th className="px-4 py-2 border-r border-gray-300 font-black uppercase text-center">Total Teams</th>
                                <th className="px-4 py-2 border-r border-gray-300 font-black uppercase text-center">Approved</th>
                                <th className="px-4 py-2 border-r border-gray-300 font-black uppercase text-center">Pending</th>
                                <th className="px-4 py-2 text-right font-black uppercase">Estimated Value (Approved)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sportsStatistics.map(([sport, stats], idx) => (
                                <tr key={sport} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                    <td className="px-4 py-1.5 border-r border-gray-200 font-bold">{sport}</td>
                                    <td className="px-4 py-1.5 border-r border-gray-200 text-center font-mono">{stats.total}</td>
                                    <td className="px-4 py-1.5 border-r border-gray-200 text-center text-green-700 font-bold">{stats.approved}</td>
                                    <td className="px-4 py-1.5 border-r border-gray-200 text-center text-amber-700 font-bold">{stats.pending}</td>
                                    <td className="px-4 py-1.5 text-right font-mono">₹{stats.value.toFixed(2)}</td>
                                </tr>
                            ))}
                            {sportsStatistics.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-gray-400 italic uppercase tracking-widest">No data available for summary</td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot className="bg-gray-100 border-t border-gray-300 font-black">
                            <tr>
                                <td className="px-4 py-2 border-r border-gray-300 uppercase">Total Consolidated</td>
                                <td className="px-4 py-2 border-r border-gray-300 text-center font-mono">{filteredRegistrations.length}</td>
                                <td className="px-4 py-2 border-r border-gray-300" colSpan={2}></td>
                                <td className="px-4 py-2 text-right font-mono">₹{totalRevenue.toLocaleString()}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-4 mb-6 p-3 bg-gray-50 border border-gray-300 text-xs font-bold uppercase">
                <div className="flex items-center gap-2 bg-white border border-gray-300 px-3 py-1.5 w-full md:w-80 shadow-inner">
                    <Search size={14} className="text-gray-400" />
                    <input 
                        type="text"
                        placeholder="Search Name, Code, College..."
                        className="w-full outline-none bg-transparent"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className="flex items-center gap-3">
                    <label className="text-gray-500 tracking-widest flex items-center gap-1"><Filter size={12}/> Status:</label>
                    <select 
                        className="bg-white border border-gray-300 px-3 py-1.5 outline-none font-bold"
                        onChange={(e) => setFilters({...filters, status: e.target.value})}
                        value={filters.status}
                    >
                        <option value="">All Rows</option>
                        <option value="approved">Approved</option>
                        <option value="pending">Pending</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>

                <div className="flex items-center gap-3 border-l pl-4 border-gray-300">
                    <label className="text-gray-500 tracking-widest">Discipline:</label>
                    <select 
                        className="bg-white border border-gray-300 px-3 py-1.5 outline-none font-bold"
                        onChange={(e) => setFilters({...filters, sport_id: e.target.value})}
                        value={filters.sport_id}
                    >
                        <option value="">All Sports</option>
                        {availableSports.map(s => (
                            <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
                        ))}
                    </select>
                </div>

                <div className="ml-auto flex items-center gap-4">
                    <div className="text-[10px] text-gray-400 font-black">
                        Total Records: {filteredRegistrations.length}
                    </div>
                    <div className="text-[10px] text-blue-600 font-black border-l pl-4 border-gray-300">
                        Total Value: ₹{totalRevenue.toLocaleString()}
                    </div>
                </div>
            </div>

            {/* Spreadsheet Grid */}
            <div className="overflow-x-auto border border-gray-300 shadow-sm">
                <table className="w-full text-left border-collapse table-auto min-w-[1000px]">
                    <thead>
                        <tr className="bg-gray-100 text-gray-600 text-[10px] uppercase font-black border-b border-gray-300 tracking-[0.1em]">
                            <th className="px-4 py-3 border-r border-gray-300 w-32">Reg. Code</th>
                            <th className="px-4 py-3 border-r border-gray-300">Student Name</th>
                            <th className="px-4 py-3 border-r border-gray-300">Academic Institution</th>
                            <th className="px-4 py-3 border-r border-gray-300">Registered Sports</th>
                            <th className="px-4 py-3 border-r border-gray-300 w-28 text-center">Status</th>
                            <th className="px-4 py-3 text-right w-32">Fee Value</th>
                        </tr>
                    </thead>
                    <tbody className="text-xs divide-y divide-gray-200">
                        {isLoading ? (
                            <tr>
                                <td colSpan={6} className="text-center py-24 bg-white">
                                    <div className="flex flex-col items-center gap-3">
                                        <Loader2 className="animate-spin text-gray-300 h-8 w-8" />
                                        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Accessing Secure Registry...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredRegistrations.length > 0 ? (
                            filteredRegistrations.map((reg, idx) => (
                                <tr key={reg.id} className={cn("hover:bg-blue-50 transition-colors", idx % 2 === 0 ? "bg-white" : "bg-gray-50")}>
                                    <td className="px-4 py-2.5 border-r border-gray-200 font-mono text-blue-700 font-black tracking-tighter">{reg.registration_code}</td>
                                    <td className="px-4 py-2.5 border-r border-gray-200 font-bold text-gray-800">{reg.student_name}</td>
                                    <td className="px-4 py-2.5 border-r border-gray-200 text-gray-600 font-medium">{reg.college_name}</td>
                                    <td className="px-4 py-2.5 border-r border-gray-200 text-gray-500 font-medium italic whitespace-normal min-w-[250px]">{reg.sports}</td>
                                    <td className="px-4 py-2.5 border-r border-gray-200">
                                        <div className={cn(
                                            "text-[9px] font-black px-2 py-0.5 border text-center rounded-none mx-auto w-fit min-w-[80px]",
                                            reg.status === 'approved' ? "bg-green-50 text-green-700 border-green-200" : 
                                            reg.status === 'pending' ? "bg-amber-50 text-amber-700 border-amber-200" :
                                            "bg-red-50 text-red-700 border-red-200"
                                        )}>
                                            {reg.status.toUpperCase()}
                                        </div>
                                    </td>
                                    <td className="px-4 py-2.5 text-right font-black text-gray-900 tabular-nums">₹{parseFloat(reg.total_amount).toLocaleString()}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="text-center py-24 text-gray-300 font-bold uppercase tracking-[0.2em]">No registry entries match the current criteria.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer / Disclaimer */}
            <div className="mt-12 text-[10px] text-gray-300 text-center uppercase tracking-[0.4em] font-black border-t pt-8">
                Energy 2026 - Official Management Dashboard - Data Subject to Ground Verification
            </div>
        </div>
    );
}
