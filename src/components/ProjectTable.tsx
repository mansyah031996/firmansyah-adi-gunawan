import React, { useState } from 'react';
import {
  ArrowUpDown,
  ExternalLink,
  Edit2,
  Trash2,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from 'lucide-react';
import { ProjectUnit, FilterState } from '../types';
import { formatTimeString, parsePriorityRank, timeToDecimalHours, calculateTotalDivisionHours } from '../utils/timeUtils';

interface ProjectTableProps {
  units: ProjectUnit[];
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onSelectUnit: (unit: ProjectUnit) => void;
  onEditUnit: (unit: ProjectUnit) => void;
  onDeleteUnit: (id: string) => void;
}

export const ProjectTable: React.FC<ProjectTableProps> = ({
  units,
  filters,
  setFilters,
  onSelectUnit,
  onEditUnit,
  onDeleteUnit,
}) => {
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  // Sorting Handler
  const handleSort = (field: FilterState['sortBy']) => {
    if (filters.sortBy === field) {
      setFilters((prev) => ({
        ...prev,
        sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc',
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        sortBy: field,
        sortOrder: 'asc',
      }));
    }
  };

  // Helper for Status Badge Styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DONE & DELIVERED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'URGENT DELIVERY':
        return 'bg-[#c5a059]/10 text-[#c5a059] border-[#c5a059]/30 animate-pulse';
      case 'OP MEDIUM PROGRES':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'REGULAR PROGRES':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'SLOW PROGRESS':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'PROGRESS HOLD':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'WAITING LIST':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      default:
        return 'bg-white/5 text-gray-400 border-white/10';
    }
  };

  const toggleExpandRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedRowId(expandedRowId === id ? null : id);
  };

  return (
    <div className="bg-black/30 backdrop-blur-sm border border-white/15 rounded-2xl shadow-2xl overflow-hidden">
      {/* Table Top Header Info */}
      <div className="p-4 bg-black/40 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            Tabel Rekapitulasi Jam Kerja Proyek Unit SM
          </h3>
          <p className="text-xs text-gray-300">
            Detail rincian jam kerja per divisi (Mechanic, Body Work, Body Paint, Interior, Chrome, Bubut).
          </p>
        </div>
        <div className="text-xs text-gray-300 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10 self-start sm:self-auto">
          Total Tampil: <strong className="text-[#c5a059]">{units.length}</strong> Unit
        </div>
      </div>

      {/* Table Responsive Wrapper */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-black/60 backdrop-blur-sm text-gray-300 uppercase tracking-wider font-semibold border-b border-white/10">
            <tr>
              <th className="py-3 px-3 min-w-[200px]">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-1 hover:text-white cursor-pointer"
                >
                  Unit & Pemilik <ArrowUpDown className="w-3 h-3 text-gray-400" />
                </button>
              </th>
              <th className="py-3 px-2 min-w-[100px]">PM / Lead</th>
              <th className="py-3 px-2 min-w-[100px]">Margin</th>
              <th className="py-3 px-2 min-w-[90px]">Check-In</th>
              <th className="py-3 px-2 min-w-[100px]">Kategori</th>
              <th className="py-3 px-2 text-right">Mechanic</th>
              <th className="py-3 px-2 text-right">Body Work</th>
              <th className="py-3 px-2 text-right">Body Paint</th>
              <th className="py-3 px-2 text-right">Interior</th>
              <th className="py-3 px-2 text-right">Chrome</th>
              <th className="py-3 px-2 text-right">Bubut</th>
              <th className="py-3 px-3 text-right bg-black/40 font-bold min-w-[110px]">
                <button
                  onClick={() => handleSort('hours')}
                  className="flex items-center justify-end gap-1 w-full text-[#c5a059] hover:text-[#d4af66] cursor-pointer"
                >
                  Total Jam <ArrowUpDown className="w-3 h-3 text-[#c5a059]" />
                </button>
              </th>
              <th className="py-3 px-2 min-w-[110px]">
                <button
                  onClick={() => handleSort('priority')}
                  className="flex items-center gap-1 hover:text-white cursor-pointer"
                >
                  Prioritas <ArrowUpDown className="w-3 h-3 text-gray-400" />
                </button>
              </th>
              <th className="py-3 px-3 min-w-[140px]">Status</th>
              <th className="py-3 px-2 text-center min-w-[80px]">Aksi</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/5 text-gray-200 bg-transparent">
            {units.length === 0 ? (
              <tr>
                <td colSpan={15} className="py-12 text-center text-gray-400">
                  <AlertCircle className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                  Tidak ada data unit yang sesuai dengan filter.
                </td>
              </tr>
            ) : (
              units.map((unit) => {
                const isExpanded = expandedRowId === unit.id;
                const totalDec = timeToDecimalHours(unit.divisionHours.total);

                return (
                  <React.Fragment key={unit.id}>
                    <tr
                      onClick={() => onSelectUnit(unit)}
                      className="hover:bg-white/10 bg-black/15 transition-colors cursor-pointer group"
                    >
                      {/* Unit & Owner Name */}
                      <td className="py-3 px-3 font-medium text-white">
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-bold group-hover:text-[#c5a059] transition-colors">
                            {unit.unitName}
                          </div>
                          <button
                            onClick={(e) => toggleExpandRow(unit.id, e)}
                            className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white shrink-0"
                            title="Lihat Prosentase Divisi"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* PM / Lead */}
                      <td className="py-3 px-2 whitespace-nowrap">
                        <div className="font-semibold text-gray-200">{unit.projectManager}</div>
                        <div className="text-[10px] text-[#c5a059] font-mono">{unit.teamLead}</div>
                      </td>

                      {/* Margin Type */}
                      <td className="py-3 px-2 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            unit.marginType === 'UNIT MARGIN'
                              ? 'bg-[#c5a059]/10 text-[#c5a059] border-[#c5a059]/20'
                              : 'bg-white/5 text-gray-300 border-white/10'
                          }`}
                        >
                          {unit.marginType === 'UNIT MARGIN' ? 'MARGIN' : 'NON MARGIN'}
                        </span>
                      </td>

                      {/* Check-In Date */}
                      <td className="py-3 px-2 whitespace-nowrap text-gray-300 text-[11px]">
                        {unit.unitInDate || '-'}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-2 whitespace-nowrap text-[11px] text-gray-300">
                        {unit.progressCategory}
                      </td>

                      {/* Division Hours */}
                      <td className="py-3 px-2 text-right font-mono text-gray-300">
                        {formatTimeString(unit.divisionHours.mechanic)}
                      </td>
                      <td className="py-3 px-2 text-right font-mono text-gray-300">
                        {formatTimeString(unit.divisionHours.bodyWork)}
                      </td>
                      <td className="py-3 px-2 text-right font-mono text-gray-300">
                        {formatTimeString(unit.divisionHours.bodyPaint)}
                      </td>
                      <td className="py-3 px-2 text-right font-mono text-gray-300">
                        {formatTimeString(unit.divisionHours.interior)}
                      </td>
                      <td className="py-3 px-2 text-right font-mono text-gray-300">
                        {formatTimeString(unit.divisionHours.chrome)}
                      </td>
                      <td className="py-3 px-2 text-right font-mono text-gray-300">
                        {formatTimeString(unit.divisionHours.bubut)}
                      </td>

                      {/* Total Hours */}
                      <td className="py-3 px-3 text-right font-mono font-extrabold text-[#c5a059] bg-[#c5a059]/10">
                        {formatTimeString(unit.divisionHours.total)}
                      </td>

                      {/* Priority */}
                      <td className="py-3 px-2 whitespace-nowrap font-medium text-gray-300 text-[11px]">
                        {unit.priorityOrder}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold border ${getStatusBadge(
                            unit.status
                          )}`}
                        >
                          {unit.status}
                        </span>
                        {unit.targetDeliveryDate && (
                          <div className="text-[10px] text-gray-400 mt-0.5">
                            Target: {unit.targetDeliveryDate}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-2 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => onEditUnit(unit)}
                            className="p-1.5 hover:bg-white/10 text-gray-400 hover:text-[#c5a059] rounded transition-colors"
                            title="Edit Unit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteUnit(unit.id)}
                            className="p-1.5 hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 rounded transition-colors"
                            title="Hapus Unit"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Row Division Visual Bar */}
                    {isExpanded && (
                      <tr className="bg-black/30 border-b border-white/5">
                        <td colSpan={15} className="p-4">
                          <div className="bg-black/40 backdrop-blur-sm p-3.5 rounded-xl border border-white/10 space-y-2">
                            <div className="flex items-center justify-between text-xs font-semibold text-gray-200">
                              <span>Komposisi Jam Kerja Per Divisi — {unit.unitName}</span>
                              <span className="text-[#c5a059]">Total: {formatTimeString(unit.divisionHours.total)}</span>
                            </div>

                            {/* Stacked Percentage Bar */}
                            <div className="w-full h-3 bg-black/60 rounded-full overflow-hidden flex">
                              {totalDec > 0 ? (
                                <>
                                  <div
                                    style={{
                                      width: `${(timeToDecimalHours(unit.divisionHours.mechanic) / totalDec) * 100}%`,
                                    }}
                                    className="bg-blue-500 h-full"
                                    title={`Mechanic: ${formatTimeString(unit.divisionHours.mechanic)}`}
                                  />
                                  <div
                                    style={{
                                      width: `${(timeToDecimalHours(unit.divisionHours.bodyWork) / totalDec) * 100}%`,
                                    }}
                                    className="bg-[#c5a059] h-full"
                                    title={`Body Work: ${formatTimeString(unit.divisionHours.bodyWork)}`}
                                  />
                                  <div
                                    style={{
                                      width: `${(timeToDecimalHours(unit.divisionHours.bodyPaint) / totalDec) * 100}%`,
                                    }}
                                    className="bg-purple-500 h-full"
                                    title={`Body Paint: ${formatTimeString(unit.divisionHours.bodyPaint)}`}
                                  />
                                  <div
                                    style={{
                                      width: `${(timeToDecimalHours(unit.divisionHours.interior) / totalDec) * 100}%`,
                                    }}
                                    className="bg-emerald-500 h-full"
                                    title={`Interior: ${formatTimeString(unit.divisionHours.interior)}`}
                                  />
                                  <div
                                    style={{
                                      width: `${(timeToDecimalHours(unit.divisionHours.chrome) / totalDec) * 100}%`,
                                    }}
                                    className="bg-pink-500 h-full"
                                    title={`Chrome: ${formatTimeString(unit.divisionHours.chrome)}`}
                                  />
                                  <div
                                    style={{
                                      width: `${(timeToDecimalHours(unit.divisionHours.bubut) / totalDec) * 100}%`,
                                    }}
                                    className="bg-cyan-500 h-full"
                                    title={`Bubut: ${formatTimeString(unit.divisionHours.bubut)}`}
                                  />
                                </>
                              ) : (
                                <div className="w-full h-full bg-white/5" />
                              )}
                            </div>

                            {/* Legend Tags */}
                            <div className="flex items-center gap-3 text-[11px] text-gray-300 flex-wrap pt-1">
                              <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-blue-500" /> Mech:{' '}
                                {formatTimeString(unit.divisionHours.mechanic)}
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-[#c5a059]" /> Body:{' '}
                                {formatTimeString(unit.divisionHours.bodyWork)}
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-purple-500" /> Paint:{' '}
                                {formatTimeString(unit.divisionHours.bodyPaint)}
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Interior:{' '}
                                {formatTimeString(unit.divisionHours.interior)}
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-pink-500" /> Chrome:{' '}
                                {formatTimeString(unit.divisionHours.chrome)}
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-cyan-500" /> Bubut:{' '}
                                {formatTimeString(unit.divisionHours.bubut)}
                              </span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>

          {units.length > 0 && (() => {
            const tableTotals = calculateTotalDivisionHours(units);
            return (
              <tfoot className="bg-black/70 backdrop-blur-sm text-white font-mono text-xs border-t-2 border-[#c5a059] font-bold">
                <tr>
                  <td colSpan={5} className="py-3 px-3 uppercase tracking-wider font-sans text-[#c5a059] text-right">
                    TOTAL KESELURUHAN ({units.length} UNIT):
                  </td>
                  <td className="py-3 px-2 text-right text-blue-400">{formatTimeString(tableTotals.mechanic)}</td>
                  <td className="py-3 px-2 text-right text-amber-400">{formatTimeString(tableTotals.bodyWork)}</td>
                  <td className="py-3 px-2 text-right text-purple-400">{formatTimeString(tableTotals.bodyPaint)}</td>
                  <td className="py-3 px-2 text-right text-emerald-400">{formatTimeString(tableTotals.interior)}</td>
                  <td className="py-3 px-2 text-right text-pink-400">{formatTimeString(tableTotals.chrome)}</td>
                  <td className="py-3 px-2 text-right text-cyan-400">{formatTimeString(tableTotals.bubut)}</td>
                  <td className="py-3 px-3 text-right text-[#c5a059] font-black bg-[#c5a059]/15 text-sm">
                    {formatTimeString(tableTotals.total)}
                  </td>
                  <td colSpan={3} className="py-3 px-2"></td>
                </tr>
              </tfoot>
            );
          })()}
        </table>
      </div>
    </div>
  );
};
