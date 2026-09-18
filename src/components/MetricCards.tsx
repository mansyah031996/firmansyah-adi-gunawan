import React from 'react';
import {
  Car,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Award
} from 'lucide-react';
import { ProjectUnit } from '../types';
import { calculateTotalDivisionHours, formatDecimalHours, timeToDecimalHours } from '../utils/timeUtils';

interface MetricCardsProps {
  units: ProjectUnit[];
}

export const MetricCards: React.FC<MetricCardsProps> = ({ units }) => {
  const totals = calculateTotalDivisionHours(units);
  
  const marginUnitsCount = units.filter(u => u.marginType === 'UNIT MARGIN').length;
  const nonMarginUnitsCount = units.filter(u => u.marginType === 'UNIT NON MARGIN').length;

  const deliveredCount = units.filter(u => u.status === 'DONE & DELIVERED').length;
  const urgentCount = units.filter(u => u.status === 'URGENT DELIVERY').length;
  const opMediumCount = units.filter(u => u.status === 'OP MEDIUM PROGRES').length;

  // Find division with highest hours
  const divDecimals = totals.decimalTotals;
  const divisions = [
    { name: 'Mechanic', hours: divDecimals.mechanic },
    { name: 'Body Work', hours: divDecimals.bodyWork },
    { name: 'Body Paint', hours: divDecimals.bodyPaint },
    { name: 'Interior', hours: divDecimals.interior },
    { name: 'Chrome', hours: divDecimals.chrome },
    { name: 'Bubut', hours: divDecimals.bubut },
  ];
  divisions.sort((a, b) => b.hours - a.hours);
  const topDivision = divisions[0];

  // Top single unit by hours
  const sortedUnits = [...units].sort((a, b) => 
    timeToDecimalHours(b.divisionHours.total) - timeToDecimalHours(a.divisionHours.total)
  );
  const topUnit = sortedUnits[0];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Units Card */}
      <div className="bg-[#141414] border border-white/5 rounded-2xl p-5 shadow-xl hover:border-white/20 transition-all flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Total Unit Proyek</p>
            <h3 className="text-3xl font-light text-white mt-1">
              {units.length}{' '}
              <span className="text-xs font-normal text-gray-500">Unit</span>
            </h3>
          </div>
          <div className="p-2.5 bg-[#c5a059]/10 text-[#c5a059] border border-[#c5a059]/20 rounded-xl">
            <Car className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
          <span className="text-[#c5a059] font-medium">{marginUnitsCount} Unit Margin</span>
          <span className="text-gray-600">|</span>
          <span className="text-gray-400">{nonMarginUnitsCount} Non-Margin</span>
        </div>
      </div>

      {/* Total Hours Card */}
      <div className="bg-[#141414] border border-white/5 rounded-2xl p-5 shadow-xl hover:border-white/20 transition-all flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Total Jam Kerja Terakumulasi</p>
            <h3 className="text-3xl font-light text-[#c5a059] mt-1">
              {formatDecimalHours(totals.decimalTotals.total)}
            </h3>
          </div>
          <div className="p-2.5 bg-[#c5a059]/10 text-[#c5a059] border border-[#c5a059]/20 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-white/5 text-xs text-gray-400 truncate">
          <span>Terbesar: <strong className="text-gray-200">{topUnit?.unitName || '-'}</strong> ({formatDecimalHours(timeToDecimalHours(topUnit?.divisionHours.total || '0:00'))})</span>
        </div>
      </div>

      {/* Delivered & Status Card */}
      <div className="bg-[#141414] border border-white/5 rounded-2xl p-5 shadow-xl hover:border-white/20 transition-all flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Status Delivery</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-3xl font-light text-emerald-400">
                {deliveredCount}
              </h3>
              <span className="text-xs text-emerald-400/90 font-medium">Done & Delivered</span>
            </div>
          </div>
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
          <span className="text-[#c5a059] font-semibold flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> {urgentCount} Urgent
          </span>
          <span className="text-sky-400">{opMediumCount} Medium Progres</span>
        </div>
      </div>

      {/* Highest Work Division Card */}
      <div className="bg-[#141414] border border-white/5 rounded-2xl p-5 shadow-xl hover:border-white/20 transition-all flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Divisi Jam Tertinggi</p>
            <h3 className="text-2xl font-light text-white mt-1">
              {topDivision?.name || 'Body Work'}
            </h3>
          </div>
          <div className="p-2.5 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-xl">
            <Layers className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-white/5 text-xs text-gray-400 flex items-center justify-between">
          <span>Total: <strong className="text-gray-200">{formatDecimalHours(topDivision?.hours || 0)}</strong></span>
          <span className="text-[#c5a059] font-medium">
            {totals.decimalTotals.total > 0
              ? `${Math.round(((topDivision?.hours || 0) / totals.decimalTotals.total) * 100)}% Alokasi`
              : '0%'}
          </span>
        </div>
      </div>
    </div>
  );
};
