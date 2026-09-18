import React from 'react';
import {
  Wrench,
  Hammer,
  Paintbrush,
  Armchair,
  Sparkles,
  Cog,
  UserCheck,
  BarChart3
} from 'lucide-react';
import { ProjectUnit, TeamLead } from '../types';
import { calculateTotalDivisionHours, formatDecimalHours, formatTimeString, timeToDecimalHours } from '../utils/timeUtils';

interface DivisionAnalyticsProps {
  units: ProjectUnit[];
  onSelectUnit: (unit: ProjectUnit) => void;
}

export const DivisionAnalytics: React.FC<DivisionAnalyticsProps> = ({ units, onSelectUnit }) => {
  const totals = calculateTotalDivisionHours(units);
  const grandTotalDec = totals.decimalTotals.total || 1;

  const divisionCards = [
    {
      key: 'mechanic',
      label: 'Mekanik / Engine',
      desc: 'Pengerjaan mesin, transmisi, kaki-kaki, & elektrikal',
      hoursStr: totals.mechanic,
      decimal: totals.decimalTotals.mechanic,
      icon: <Wrench className="w-5 h-5 text-blue-400" />,
      badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      color: '#3b82f6',
    },
    {
      key: 'bodyWork',
      label: 'Body Work',
      desc: 'Ketok, perbaikan plat sasis, karat & fabrikasi bodi',
      hoursStr: totals.bodyWork,
      decimal: totals.decimalTotals.bodyWork,
      icon: <Hammer className="w-5 h-5 text-amber-400" />,
      badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      color: '#f59e0b',
    },
    {
      key: 'bodyPaint',
      label: 'Body Paint',
      desc: 'Epoksi, dempul, pengecatan oven, & polishing',
      hoursStr: totals.bodyPaint,
      decimal: totals.decimalTotals.bodyPaint,
      icon: <Paintbrush className="w-5 h-5 text-purple-400" />,
      badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      color: '#8b5cf6',
    },
    {
      key: 'interior',
      label: 'Interior',
      desc: 'Restorasi jok kulit, dashboard, plafon, & karpet',
      hoursStr: totals.interior,
      decimal: totals.decimalTotals.interior,
      icon: <Armchair className="w-5 h-5 text-emerald-400" />,
      badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      color: '#10b981',
    },
    {
      key: 'chrome',
      label: 'Chrome',
      desc: 'Plating krom, polishing lis, bumper & aksesoris',
      hoursStr: totals.chrome,
      decimal: totals.decimalTotals.chrome,
      icon: <Sparkles className="w-5 h-5 text-pink-400" />,
      badgeBg: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
      color: '#ec4899',
    },
    {
      key: 'bubut',
      label: 'Bubut / Machining',
      desc: 'Pembuatan sparepart khusus & presisi logam',
      hoursStr: totals.bubut,
      decimal: totals.decimalTotals.bubut,
      icon: <Cog className="w-5 h-5 text-cyan-400" />,
      badgeBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      color: '#06b6d4',
    },
  ];

  // Team Leads Workload
  const teamLeads: TeamLead[] = ['PRATAMA', 'ARIES', 'YUDHA', 'TAUFIK'];
  const teamLeadStats = teamLeads.map((tl) => {
    const tlUnits = units.filter((u) => u.teamLead === tl);
    const tlTotals = calculateTotalDivisionHours(tlUnits);
    return {
      name: tl,
      unitsCount: tlUnits.length,
      hoursStr: tlTotals.total,
      decimal: tlTotals.decimalTotals.total,
      units: tlUnits,
    };
  });

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-modern font-black text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#c5a059]" />
          Analisis Beban Kerja Divisi & Tim Teknisi
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Rincian kontribusi jam kerja per divisi dan distribusi beban kerja pada masing-masing Kode Unit (Team Lead).
        </p>
      </div>

      {/* Grid of Division Workload Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {divisionCards.map((div) => {
          const pct = Math.round((div.decimal / grandTotalDec) * 100);

          return (
            <div
              key={div.key}
              className="bg-[#141414] border border-white/5 rounded-2xl p-5 shadow-2xl hover:border-white/20 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2.5 rounded-xl border ${div.badgeBg}`}>{div.icon}</div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{div.label}</h3>
                      <p className="text-[11px] text-gray-400 leading-tight mt-0.5">{div.desc}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-light text-white">{formatTimeString(div.hoursStr)}</span>
                    <span className="text-xs font-bold text-[#c5a059]">{pct}% dari Total</span>
                  </div>

                  <div className="w-full bg-[#0a0a0a] h-2 rounded-full overflow-hidden mt-2">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: div.color }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-gray-400 flex justify-between items-center">
                <span>Rata-rata per unit:</span>
                <strong className="text-gray-200">
                  {units.length > 0 ? Math.round(div.decimal / units.length).toLocaleString('id-ID') : 0} jam
                </strong>
              </div>
            </div>
          );
        })}
      </div>

      {/* Team Lead Breakdown Section */}
      <div className="bg-[#141414] border border-white/5 rounded-2xl p-6 shadow-2xl">
        <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1">
          <UserCheck className="w-4 h-4 text-[#c5a059]" />
          Distribusi Jam Kerja Menurut Kode Unit (Team Lead)
        </h3>
        <p className="text-xs text-gray-400 mb-4">
          Beban penanganan proyek restorasi oleh PRATAMA, ARIES, YUDHA, dan TAUFIK.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {teamLeadStats.map((tl) => (
            <div key={tl.name} className="bg-[#0a0a0a] p-4 rounded-xl border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-white">{tl.name}</span>
                <span className="px-2.5 py-0.5 bg-[#c5a059]/10 text-[#c5a059] text-xs font-bold rounded-full border border-[#c5a059]/20">
                  {tl.unitsCount} Unit
                </span>
              </div>

              <div className="text-xl font-light text-[#c5a059] mb-2">
                {formatDecimalHours(tl.decimal)}
              </div>

              <div className="text-[11px] text-gray-400 space-y-1.5 pt-2 border-t border-white/5">
                <div className="font-medium text-gray-300">Unit Utama Ditangani:</div>
                <ul className="space-y-1 max-h-36 overflow-y-auto no-scrollbar">
                  {tl.units.map((u) => (
                    <li
                      key={u.id}
                      onClick={() => onSelectUnit(u)}
                      className="text-gray-400 hover:text-[#c5a059] cursor-pointer truncate flex items-center justify-between gap-1 text-[10px]"
                    >
                      <span className="truncate">· {u.unitName}</span>
                      <span className="font-mono text-gray-500 shrink-0">{formatTimeString(u.divisionHours.total)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
