import React, { useState, useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { ProjectUnit } from '../types';
import { timeToDecimalHours, formatTimeString } from '../utils/timeUtils';
import { ChevronDown, PieChart as ChartIcon, Wrench } from 'lucide-react';
import { SMLogo } from './SMLogo';

interface UnitLookupChartProps {
  units: ProjectUnit[];
  onSelectUnit?: (unit: ProjectUnit) => void;
}

const DIVISION_COLORS = {
  mechanic: '#ef4444', // Red
  bodyWork: '#eab308', // Yellow
  bodyPaint: '#22c55e', // Green
  interior: '#f97316', // Orange
  chrome: '#84cc16',   // Light Green
  bubut: '#06b6d4',    // Teal/Cyan
};

export const UnitLookupChart: React.FC<UnitLookupChartProps> = ({ units, onSelectUnit }) => {
  // Default selected unit: "MB 280 GE Mr. ABONG" or first unit in spreadsheet
  const [selectedUnitId, setSelectedUnitId] = useState<string>(() => {
    const defaultUnit = units.find(
      (u) => u.unitName.toLowerCase().includes('abong') || u.unitName.toLowerCase().includes('280 ge')
    );
    return defaultUnit ? defaultUnit.id : units[0]?.id || '';
  });

  // Sync selectedUnitId if current selection is invalid
  const selectedUnit = useMemo(() => {
    if (!units || units.length === 0) return null;
    const found = units.find((u) => u.id === selectedUnitId);
    return found || units[0];
  }, [units, selectedUnitId]);

  // Chart data calculation
  const chartData = useMemo(() => {
    if (!selectedUnit) return [];
    const h = selectedUnit.divisionHours;

    const items = [
      { name: 'MECHANIC', rawTime: h.mechanic, value: timeToDecimalHours(h.mechanic), color: DIVISION_COLORS.mechanic },
      { name: 'BODY WORK', rawTime: h.bodyWork, value: timeToDecimalHours(h.bodyWork), color: DIVISION_COLORS.bodyWork },
      { name: 'BODY PAINT', rawTime: h.bodyPaint, value: timeToDecimalHours(h.bodyPaint), color: DIVISION_COLORS.bodyPaint },
      { name: 'INTERIOR', rawTime: h.interior, value: timeToDecimalHours(h.interior), color: DIVISION_COLORS.interior },
      { name: 'CHROME', rawTime: h.chrome, value: timeToDecimalHours(h.chrome), color: DIVISION_COLORS.chrome },
      { name: 'BUBUT', rawTime: h.bubut, value: timeToDecimalHours(h.bubut), color: DIVISION_COLORS.bubut },
    ];

    const totalVal = items.reduce((acc, curr) => acc + curr.value, 0);

    return items
      .filter((item) => item.value > 0)
      .map((item) => ({
        ...item,
        percentage: totalVal > 0 ? ((item.value / totalVal) * 100).toFixed(1) : '0',
      }));
  }, [selectedUnit]);

  if (!selectedUnit) return null;

  const displayUnitName = (name: string) => name.replace(/^COUNTDOWN\s*:\s*/i, '').trim();

  return (
    <div className="bg-[#111111] border border-[#c5a059]/40 rounded-xl p-3 sm:p-4 shadow-xl space-y-3.5">
      {/* Gold Banner Header - Compact */}
      <div className="bg-gradient-to-r from-[#002855] via-[#003b7a] to-[#002855] text-[#ffcc00] py-1.5 px-3 rounded-lg text-center border border-[#ffcc00]/30 shadow flex items-center justify-center gap-2.5">
        <SMLogo size="sm" showText={false} />
        <h2 className="text-xs sm:text-sm font-modern font-black tracking-wider uppercase text-[#ffcc00]">
          DATA REKAP JAM KERJA UNIT SM 2023-2026
        </h2>
      </div>

      {/* Main Grid: Left Table Header + Right Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left 7 Columns: Spreadsheet Header Table */}
        <div className="lg:col-span-7 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-gray-400">
            <span className="flex items-center gap-1 font-bold text-[#c5a059]">
              <Wrench className="w-3.5 h-3.5" /> PILIH UNIT KENDARAAN:
            </span>
            <span className="text-[10px] text-gray-400 font-mono">
              KP: <strong className="text-white">{selectedUnit.projectManager}</strong>
            </span>
          </div>

          {/* Spreadsheet Header Display Box - Compact Responsive Table */}
          <div className="overflow-x-auto rounded-lg border border-white/10 shadow bg-[#0a0a0a]">
            <table className="w-full text-[11px] text-center border-collapse">
              <thead>
                <tr className="bg-[#002b66] text-white font-bold divide-x divide-white/10 border-b border-white/20 text-[10px]">
                  <th className="p-1.5 text-left min-w-[140px]">UNIT ({units.length} Unit)</th>
                  <th className="p-1.5 min-w-[60px]">KD UNIT</th>
                  <th className="p-1.5 min-w-[65px]">MECHANIC</th>
                  <th className="p-1.5 min-w-[65px]">BODY WORK</th>
                  <th className="p-1.5 min-w-[65px]">BODY PAINT</th>
                  <th className="p-1.5 min-w-[60px]">INTERIOR</th>
                  <th className="p-1.5 min-w-[55px]">CHROME</th>
                  <th className="p-1.5 min-w-[55px]">BUBUT</th>
                  <th className="p-1.5 bg-emerald-600 text-white font-extrabold min-w-[65px]">TOTAL</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-[#181818] divide-x divide-white/10 font-mono text-[11px]">
                  {/* Dropdown Select Cell */}
                  <td className="p-1 text-left bg-[#0f172a] border-r border-white/10 min-w-[140px]">
                    <div className="relative">
                      <select
                        value={selectedUnit.id}
                        onChange={(e) => setSelectedUnitId(e.target.value)}
                        className="w-full bg-[#030712] border border-[#c5a059]/50 text-white font-bold text-[11px] py-1 pl-1.5 pr-5 rounded appearance-none focus:outline-none focus:ring-1 focus:ring-[#c5a059] cursor-pointer truncate"
                      >
                        {units.map((u) => (
                          <option key={u.id} value={u.id} className="bg-[#0f172a] text-white">
                            {displayUnitName(u.unitName)}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-[#c5a059] absolute right-1.5 top-1.5 pointer-events-none" />
                    </div>
                  </td>

                  <td className="p-1.5 font-bold text-gray-200">{selectedUnit.teamLead || '-'}</td>
                  <td className="p-1.5 text-red-400 font-semibold">{selectedUnit.divisionHours.mechanic}</td>
                  <td className="p-1.5 text-yellow-400 font-semibold">{selectedUnit.divisionHours.bodyWork}</td>
                  <td className="p-1.5 text-emerald-400 font-semibold">{selectedUnit.divisionHours.bodyPaint}</td>
                  <td className="p-1.5 text-orange-400 font-semibold">{selectedUnit.divisionHours.interior}</td>
                  <td className="p-1.5 text-lime-400 font-semibold">{selectedUnit.divisionHours.chrome}</td>
                  <td className="p-1.5 text-cyan-400 font-semibold">{selectedUnit.divisionHours.bubut}</td>
                  
                  {/* Total Cell in Bright Neon Green */}
                  <td className="p-1.5 bg-[#00e600] text-black font-extrabold text-[12px] shadow-inner">
                    {selectedUnit.divisionHours.total}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Unit Status Badges Below Table */}
          <div className="flex flex-wrap items-center justify-between gap-1.5 text-[11px]">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-gray-400">Kepala Proyek:</span>
              <span className="font-bold text-white bg-white/5 px-1.5 py-0.5 rounded border border-white/10 text-[10px]">
                {selectedUnit.projectManager}
              </span>
              <span className="text-gray-400 ml-1">Status:</span>
              <span className="font-bold text-[#c5a059] bg-[#c5a059]/10 px-1.5 py-0.5 rounded border border-[#c5a059]/20 text-[10px]">
                {selectedUnit.status}
              </span>
              {onSelectUnit && (
                <button
                  onClick={() => onSelectUnit(selectedUnit)}
                  className="ml-1 px-2 py-0.5 bg-[#c5a059]/20 hover:bg-[#c5a059]/30 text-[#c5a059] border border-[#c5a059]/40 rounded text-[10px] font-bold transition-colors cursor-pointer"
                >
                  Rincian Unit ➔
                </button>
              )}
            </div>

            <div className="text-gray-400 text-[10px]">
              Total Jam Decimal: <strong className="text-emerald-400 font-mono">{formatTimeString(selectedUnit.divisionHours.total)}</strong>
            </div>
          </div>
        </div>

        {/* Right 5 Columns: Pie Chart Diagram */}
        <div className="lg:col-span-5 bg-[#0a0a0a] border border-white/10 p-3 rounded-lg flex flex-col items-center justify-between relative min-h-[220px]">
          <div className="w-full flex items-center justify-between text-[11px] font-bold text-[#c5a059] border-b border-white/5 pb-1 mb-1">
            <span className="flex items-center gap-1">
              <ChartIcon className="w-3.5 h-3.5" />
              <span>DIAGRAM JAM KERJA DIVISI</span>
            </span>
            <span className="text-[10px] text-gray-400 font-mono">{selectedUnit.divisionHours.total} JAM</span>
          </div>

          {chartData.length > 0 ? (
            <div className="w-full flex flex-col items-center">
              <div className="w-full h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={52}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="#0a0a0a" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-[#181818] border border-white/20 p-2 rounded text-[11px] shadow-xl space-y-0.5">
                              <p className="font-bold" style={{ color: data.color }}>
                                {data.name}
                              </p>
                              <p className="text-white font-mono">Jam Kerja: {data.rawTime}</p>
                              <p className="text-gray-400 text-[10px]">Persentase: {data.percentage}%</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Custom Compact Badge Legend Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 w-full pt-1.5 border-t border-white/5">
                {chartData.map((d) => (
                  <div key={d.name} className="flex items-center justify-between bg-white/5 px-1.5 py-0.5 rounded text-[9px]">
                    <span className="flex items-center gap-1 text-gray-300 font-medium truncate">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                      <span className="truncate">{d.name}</span>
                    </span>
                    <span className="text-white font-bold font-mono ml-1 shrink-0">{d.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 text-xs">
              Belum ada jam kerja tercatat untuk unit ini.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
