
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Download, Search, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    const [filters, setFilters] = useState({ status: '', sport_id: '', college_id: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [generationTime, setGenerationTime] = useState<string>('');

    useEffect(() => {
        setGenerationTime(new Date().toLocaleString());
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
        link.setAttribute("download", `energy_registrations_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="min-h-screen bg-white font-sans text-black p-4 md:p-8">
            {/* Simple Spreadsheet-style Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b-2 border-black pb-4 mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold uppercase tracking-tight">Registration Registry - Official Use</h1>
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

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-4 mb-6 p-3 bg-gray-50 border border-gray-300 text-xs font-bold uppercase">
                <div className="flex items-center gap-2 bg-white border border-gray-300 px-3 py-1.5 w-full md:w-96 shadow-inner">
                    <Search size={14} className="text-gray-400" />
                    <input 
                        type="text"
                        placeholder="Quick filter (Name, Code, College)..."
                        className="w-full outline-none bg-transparent"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className="flex items-center gap-3">
                    <label className="text-gray-500 tracking-widest">Filter by status:</label>
                    <select 
                        className="bg-white border border-gray-300 px-3 py-1.5 outline-none font-bold"
                        onChange={(e) => setFilters({...filters, status: e.target.value})}
                        value={filters.status}
                    >
                        <option value="">Show All Rows</option>
                        <option value="approved">Approved</option>
                        <option value="pending">Pending</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>

                <div className="ml-auto text-[10px] text-gray-400 font-black">
                    Live Record Count: {filteredRegistrations.length}
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
                            <th className="px-4 py-3 border-r border-gray-300 w-28">Status</th>
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
                                            "text-[9px] font-black px-2 py-0.5 border text-center",
                                            reg.status === 'approved' ? "bg-green-50 text-green-700 border-green-200" : 
                                            reg.status === 'pending' ? "bg-amber-50 text-amber-700 border-amber-200" :
                                            "bg-red-50 text-red-700 border-red-200"
                                        )}>
                                            {reg.status.toUpperCase()}
                                        </div>
                                    </td>
                                    <td className="px-4 py-2.5 text-right font-black text-gray-900 tabular-nums">₹{reg.total_amount}</td>
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
