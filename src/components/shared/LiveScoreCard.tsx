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
 * A reusable Live Badge with a pulsing animation.
 */
const LiveBadge = () => (
  <div className="flex items-center gap-1.5 bg-red-50 dark:bg-red-950/30 px-2.5 py-1 rounded-full border border-red-100 dark:border-red-900/50 shadow-sm">
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
    </span>
    <span className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest">LIVE</span>
  </div>
);

/**
 * LiveScoreCard component - Mobile First Design
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
      whileHover={{ y: -4, shadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
      className={cn(
        "group cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md transition-all duration-300 overflow-hidden rounded-none",
        className
      )}
    >
      {/* Top Header */}
      <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800/50 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
        <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">{sportType}</span>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{date}</span>
          {isLive && <LiveBadge />}
        </div>
      </div>

      {/* Main Scoring Section */}
      <div className="p-5 sm:p-8">
        {/* Mobile Layout (Stacked) */}
        <div className="flex flex-col gap-4 sm:hidden">
          <div className="flex items-center justify-between gap-4">
            <h3 className="font-black text-lg text-slate-900 dark:text-slate-100 uppercase tracking-tight leading-tight flex-1">
              {teamA.name}
            </h3>
            <span className="text-4xl font-black tabular-nums text-slate-950 dark:text-white tracking-tighter">
              {teamA.score}
            </span>
          </div>
          
          <div className="flex items-center gap-4 opacity-20">
            <div className="h-px flex-1 bg-slate-900 dark:bg-white" />
            <span className="text-[9px] font-black tracking-[0.3em] italic">VS</span>
            <div className="h-px flex-1 bg-slate-900 dark:bg-white" />
          </div>

          <div className="flex items-center justify-between gap-4">
            <h3 className="font-black text-lg text-slate-900 dark:text-slate-100 uppercase tracking-tight leading-tight flex-1">
              {teamB.name}
            </h3>
            <span className="text-4xl font-black tabular-nums text-slate-950 dark:text-white tracking-tighter">
              {teamB.score}
            </span>
          </div>
        </div>

        {/* Desktop Layout (Horizontal) */}
        <div className="hidden sm:grid sm:grid-cols-[1fr,auto,1fr] items-center gap-10">
          <div className="text-left">
            <h3 className="font-black text-xl text-slate-900 dark:text-slate-100 uppercase tracking-tight leading-tight line-clamp-3">
              {teamA.name}
            </h3>
          </div>

          <div className="flex items-center justify-center gap-8 px-4">
            <div className="flex items-center justify-center min-w-[80px]">
              <AnimatePresence mode="wait">
                <motion.span
                  key={`${teamA.score}`}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  className="text-6xl font-black tabular-nums text-slate-950 dark:text-white tracking-tighter"
                >
                  {teamA.score}
                </motion.span>
              </AnimatePresence>
            </div>

            <div className="flex flex-col items-center justify-center">
              <div className="h-10 w-px bg-slate-200 dark:bg-slate-800 mb-1" />
              <span className="text-[9px] font-black text-primary uppercase tracking-[0.3em] bg-primary/5 px-2 py-0.5 rounded italic">VS</span>
              <div className="h-10 w-px bg-slate-200 dark:bg-slate-800 mt-1" />
            </div>

            <div className="flex items-center justify-center min-w-[80px]">
              <AnimatePresence mode="wait">
                <motion.span
                  key={`${teamB.score}`}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  className="text-6xl font-black tabular-nums text-slate-950 dark:text-white tracking-tighter"
                >
                  {teamB.score}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          <div className="text-right">
            <h3 className="font-black text-xl text-slate-900 dark:text-slate-100 uppercase tracking-tight leading-tight line-clamp-3">
              {teamB.name}
            </h3>
          </div>
        </div>

        {/* Bottom Info Row */}
        {metaInfo && (
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/50 flex justify-center">
            <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] bg-slate-50 dark:bg-slate-800/50 px-4 py-1.5 rounded-full border border-slate-100 dark:border-slate-700/50 shadow-inner">
              {metaInfo}
            </p>
          </div>
        )}
      </div>

      {/* Progress / Accent Bar */}
      <div className={cn(
        "h-1 w-full transition-colors duration-500",
        isLive ? "bg-red-600 shadow-[0_-4px_10px_rgba(220,38,38,0.2)]" : "bg-slate-100 dark:bg-slate-800"
      )} />
    </motion.div>
  );
}

export function LiveScoreCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-pulse rounded-none">
      <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800/50 flex justify-between">
        <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
      </div>
      <div className="p-8 flex flex-col gap-6">
        <div className="h-12 w-full bg-slate-100 dark:bg-slate-800 rounded" />
        <div className="h-12 w-full bg-slate-100 dark:bg-slate-800 rounded" />
      </div>
    </div>
  );
}
