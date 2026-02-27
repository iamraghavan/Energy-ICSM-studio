'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TeamData {
  name: string;
  score: number | string;
  subtitle?: string;
}

export interface LiveScoreCardProps {
  sportType: string;
  date: string;
  isLive: boolean;
  teamA: TeamData;
  teamB: TeamData;
  metaInfo?: string;
  onClick?: () => void;
  className?: string;
}

/**
 * High-intensity Live Badge with broadcast-style ping.
 */
const LiveBadge = () => (
  <div className="flex items-center gap-1.5 bg-red-600 px-2.5 py-0.5 shadow-[0_0_15px_rgba(220,38,38,0.4)] border border-red-500">
    <span className="relative flex h-1.5 w-1.5">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
    </span>
    <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">LIVE</span>
  </div>
);

/**
 * Production-Grade Live Sports Card
 * Mobile First architecture with zero-radius industrial design.
 */
export function LiveScoreCard({
  sportType,
  date,
  isLive,
  teamA,
  teamB,
  metaInfo,
  onClick,
  className,
}: LiveScoreCardProps) {
  return (
    <motion.div
      layout
      onClick={onClick}
      whileHover={{ y: -2 }}
      className={cn(
        "group cursor-pointer bg-white border-2 border-slate-200 transition-all duration-300 rounded-none overflow-hidden",
        isLive ? "border-red-600/20" : "hover:border-slate-300",
        className
      )}
    >
      {/* Top Meta Bar */}
      <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{sportType}</span>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{date}</span>
          {isLive && <LiveBadge />}
        </div>
      </div>

      {/* Scoring Core */}
      <div className="p-5 sm:p-10">
        {/* Mobile View: Row-based stacking to prevent overflow */}
        <div className="flex flex-col gap-5 sm:hidden">
          <div className="flex items-center justify-between gap-4">
            <h3 className="font-black text-base text-slate-900 uppercase tracking-tight leading-tight flex-1 break-words">
              {teamA.name}
            </h3>
            <span className="text-4xl font-black tabular-nums text-slate-950 tracking-tighter shrink-0">
              {teamA.score}
            </span>
          </div>
          
          <div className="flex items-center gap-4 opacity-10">
            <div className="h-[2px] flex-1 bg-slate-900" />
            <span className="text-[9px] font-black tracking-[0.3em] italic text-slate-900">VS</span>
            <div className="h-[2px] flex-1 bg-slate-900" />
          </div>

          <div className="flex items-center justify-between gap-4">
            <h3 className="font-black text-base text-slate-900 uppercase tracking-tight leading-tight flex-1 break-words">
              {teamB.name}
            </h3>
            <span className="text-4xl font-black tabular-nums text-slate-950 tracking-tighter shrink-0">
              {teamB.score}
            </span>
          </div>
        </div>

        {/* Desktop View: Traditional Scoreboard Layout */}
        <div className="hidden sm:grid sm:grid-cols-[1fr,auto,1fr] items-center gap-10">
          <div className="text-left">
            <h3 className="font-black text-xl lg:text-2xl text-slate-900 uppercase tracking-tight leading-tight break-words">
              {teamA.name}
            </h3>
          </div>

          <div className="flex items-center justify-center gap-8 px-8 py-4 bg-slate-50 border border-slate-100 min-w-[240px]">
            <div className="flex flex-col items-center">
              <AnimatePresence mode="wait">
                <motion.span
                  key={`${teamA.score}`}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-6xl font-black tabular-nums text-slate-950 tracking-tighter"
                >
                  {teamA.score}
                </motion.span>
              </AnimatePresence>
            </div>

            <div className="flex flex-col items-center gap-1.5 opacity-20">
              <div className="h-8 w-[2px] bg-slate-900" />
              <span className="text-[9px] font-black text-slate-900 uppercase tracking-[0.3em] italic">VS</span>
              <div className="h-8 w-[2px] bg-slate-900" />
            </div>

            <div className="flex flex-col items-center">
              <AnimatePresence mode="wait">
                <motion.span
                  key={`${teamB.score}`}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-6xl font-black tabular-nums text-slate-950 tracking-tighter"
                >
                  {teamB.score}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          <div className="text-right">
            <h3 className="font-black text-xl lg:text-2xl text-slate-900 uppercase tracking-tight leading-tight break-words">
              {teamB.name}
            </h3>
          </div>
        </div>

        {/* Secondary Info Bar */}
        {metaInfo && (
          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-center">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] bg-slate-50 px-5 py-2 border border-slate-100 italic shadow-inner">
              {metaInfo}
            </p>
          </div>
        )}
      </div>

      {/* Live State Indicator */}
      <div className={cn(
        "h-1.5 w-full transition-all duration-500",
        isLive ? "bg-red-600 animate-pulse shadow-[0_-4px_10px_rgba(220,38,38,0.2)]" : "bg-slate-100"
      )} />
    </motion.div>
  );
}

export function LiveScoreCardSkeleton() {
  return (
    <div className="bg-white border-2 border-slate-100 animate-pulse rounded-none">
      <div className="px-4 py-2 border-b border-slate-50 h-8" />
      <div className="p-10 space-y-6">
        <div className="h-12 w-full bg-slate-50" />
        <div className="h-12 w-full bg-slate-50" />
      </div>
    </div>
  );
}
