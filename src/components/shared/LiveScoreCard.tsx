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
  <div className="flex items-center gap-1.5 bg-red-50 dark:bg-red-950/30 px-2.5 py-1 rounded-full border border-red-100 dark:border-red-900/50">
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
    </span>
    <span className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest">LIVE</span>
  </div>
);

/**
 * LiveScoreCard component for displaying sports scores in a professional broadcast style.
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
      whileHover={{ y: -4 }}
      className={cn(
        "group cursor-pointer bg-white dark:bg-slate-900 rounded-[16px] border border-slate-200 dark:border-slate-800 shadow-md transition-all duration-300 overflow-hidden",
        className
      )}
    >
      {/* Top Header */}
      <div className="px-5 py-3 border-b border-slate-50 dark:border-slate-800/50 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.15em]">{sportType}</span>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">{date}</span>
          {isLive && <LiveBadge />}
        </div>
      </div>

      {/* Main Scoring Section */}
      <div className="p-6 sm:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr,auto,1fr] items-center gap-6 sm:gap-8">
          
          {/* Team A */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-1">
            <h3 className="font-bold text-lg sm:text-xl text-slate-900 dark:text-slate-100 leading-tight">
              {teamA.name}
            </h3>
            {teamA.subtitle && (
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                {teamA.subtitle}
              </p>
            )}
          </div>

          {/* Scores & VS */}
          <div className="flex items-center justify-center gap-4 sm:gap-10 shrink-0">
            <div className="flex items-center justify-center min-w-[60px]">
              <AnimatePresence mode="wait">
                <motion.span
                  key={`${teamA.score}`}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-5xl sm:text-6xl font-black tabular-nums text-slate-950 dark:text-white tracking-tighter"
                >
                  {teamA.score}
                </motion.span>
              </AnimatePresence>
            </div>

            <div className="flex flex-col items-center justify-center">
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block mb-1" />
              <span className="text-[9px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.3em] bg-slate-50 dark:bg-slate-800/50 px-2 py-0.5 rounded italic">VS</span>
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block mt-1" />
            </div>

            <div className="flex items-center justify-center min-w-[60px]">
              <AnimatePresence mode="wait">
                <motion.span
                  key={`${teamB.score}`}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-5xl sm:text-6xl font-black tabular-nums text-slate-950 dark:text-white tracking-tighter"
                >
                  {teamB.score}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          {/* Team B */}
          <div className="flex flex-col items-center sm:items-end text-center sm:text-right space-y-1">
            <h3 className="font-bold text-lg sm:text-xl text-slate-900 dark:text-slate-100 leading-tight">
              {teamB.name}
            </h3>
            {teamB.subtitle && (
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                {teamB.subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Bottom Info Row */}
        {metaInfo && (
          <div className="mt-8 pt-5 border-t border-slate-50 dark:border-slate-800/50 flex justify-center">
            <p className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.25em] bg-slate-50 dark:bg-slate-800/50 px-5 py-1.5 rounded-full border border-slate-100 dark:border-slate-700/50 shadow-inner">
              {metaInfo}
            </p>
          </div>
        )}
      </div>

      {/* Progress / Accent Bar */}
      <div className={cn(
        "h-1.5 w-full transition-colors duration-500",
        isLive ? "bg-red-500" : "bg-slate-100 dark:bg-slate-800"
      )} />
    </motion.div>
  );
}

/**
 * Skeleton loader for LiveScoreCard.
 */
export function LiveScoreCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-[16px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-pulse">
      <div className="px-5 py-3 border-b border-slate-50 dark:border-slate-800/50 flex justify-between">
        <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
      </div>
      <div className="p-8 flex flex-col sm:flex-row items-center justify-between gap-8">
        <div className="flex-1 w-full space-y-2">
          <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800 rounded mx-auto sm:mx-0" />
          <div className="h-3 w-1/2 bg-slate-100 dark:bg-slate-800/50 rounded mx-auto sm:mx-0" />
        </div>
        <div className="h-16 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="flex-1 w-full space-y-2">
          <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800 rounded mx-auto sm:ml-auto" />
          <div className="h-3 w-1/2 bg-slate-100 dark:bg-slate-800/50 rounded mx-auto sm:ml-auto" />
        </div>
      </div>
    </div>
  );
}
