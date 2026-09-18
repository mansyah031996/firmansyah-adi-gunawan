import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Car,
  ChevronDown,
  Search,
  X,
  Check,
  Sparkles,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import { DAFTAR_UNIT_RESMI, DAFTAR_UNIT_TERKELOMPOK } from '../data/daftarUnitResmi';

interface UnitDropdownSelectorProps {
  selectedUnit: string;
  onSelectUnit: (unit: string) => void;
  label?: string;
  placeholder?: string;
  allowClear?: boolean;
  className?: string;
}

export const UnitDropdownSelector: React.FC<UnitDropdownSelectorProps> = ({
  selectedUnit,
  onSelectUnit,
  label = 'NAMA UNIT KENDARAAN (DAFTAR RESMI 2023-2026):',
  placeholder = 'Pilih Unit Kendaraan (51 Unit Terdaftar)...',
  allowClear = true,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeBrandFilter, setActiveBrandFilter] = useState<string>('ALL');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Focus search input on open
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Filtered unit list based on search and brand filter
  const filteredUnits = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    return DAFTAR_UNIT_RESMI.filter((unit) => {
      // 1. Brand category filter
      if (activeBrandFilter !== 'ALL') {
        if (activeBrandFilter === 'MB' && !unit.startsWith('MB ')) return false;
        if (activeBrandFilter === 'JAGUAR' && !unit.includes('JAGUAR')) return false;
        if (activeBrandFilter === 'PORSCHE' && !unit.includes('PORSCHE')) return false;
        if (activeBrandFilter === 'BMW' && !unit.includes('BMW')) return false;
        if (activeBrandFilter === 'MOTO' && !['HARLEY', 'JUPITER', 'SUZUKI NEX', 'YAMAHA N MAX'].some((m) => unit.includes(m))) return false;
      }

      // 2. Search query filter
      if (!term) return true;
      return unit.toLowerCase().includes(term);
    });
  }, [searchTerm, activeBrandFilter]);

  const handleSelect = (unit: string) => {
    onSelectUnit(unit);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectUnit('');
    setSearchTerm('');
  };

  // Helper to extract client name from unit string (e.g. "MB 280 GE Mr. ANDERSON" -> "Mr. ANDERSON")
  const getClientTag = (unitStr: string) => {
    const match = unitStr.match(/(Mr\.|Mrs\.|SM)\s+([A-Za-z0-9]+)/i);
    if (match) return match[0];
    if (unitStr === 'ALL UNIT') return 'UMUM';
    return '';
  };

  return (
    <div className={`space-y-1.5 relative z-50 ${className}`} ref={containerRef}>
      {/* Label with verification badge */}
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
            <Car className="w-4 h-4 text-[#c5a059]" />
            <span>{label}</span>
          </label>
          <span className="text-[10px] text-[#c5a059] font-mono flex items-center gap-1 bg-[#c5a059]/10 px-2 py-0.5 rounded border border-[#c5a059]/20">
            <ShieldCheck className="w-3 h-3 text-[#c5a059]" />
            <span>51 Unit Standar</span>
          </span>
        </div>
      )}

      {/* Main Dropdown Button / Selector Bar */}
      <div className="relative z-50">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full bg-[#0a0a0a] border rounded-xl px-3.5 py-2.5 text-xs flex items-center justify-between cursor-pointer transition-all shadow-md select-none ${
            isOpen
              ? 'border-[#c5a059] ring-2 ring-[#c5a059]/30'
              : selectedUnit
              ? 'border-[#c5a059]/60 hover:border-[#c5a059]'
              : 'border-white/15 hover:border-white/30'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <span
              className={`p-1.5 rounded-lg shrink-0 ${
                selectedUnit
                  ? 'bg-[#c5a059]/20 text-[#c5a059] border border-[#c5a059]/30'
                  : 'bg-white/5 text-gray-500'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
            </span>

            {selectedUnit ? (
              <div className="truncate flex items-center gap-2 flex-1">
                <span className="font-bold text-white tracking-wide truncate">
                  {selectedUnit}
                </span>
                {getClientTag(selectedUnit) && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#c5a059]/15 text-[#c5a059] border border-[#c5a059]/30 shrink-0">
                    {getClientTag(selectedUnit)}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-gray-400 font-medium truncate">
                {placeholder}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            {allowClear && selectedUnit && (
              <button
                type="button"
                onClick={handleClear}
                title="Hapus pilihan unit (Kosongkan data)"
                className="p-1 rounded-md text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                isOpen ? 'rotate-180 text-[#c5a059]' : ''
              }`}
            />
          </div>
        </div>

        {/* Custom Rich Searchable Dropdown Menu */}
        {isOpen && (
          <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-[#121212] border border-[#c5a059]/50 rounded-2xl shadow-2xl shadow-black/95 overflow-hidden animate-fadeIn backdrop-blur-2xl">
            {/* Search Input Box */}
            <div className="p-3 bg-[#0a0a0a] border-b border-white/10 space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Ketik nama unit atau pemilik (contoh: ANDERSON, 280, DIKO, JAGUAR)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#171717] border border-white/10 focus:border-[#c5a059] rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#c5a059] transition-all"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Quick Brand Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[10px]">
                <span className="text-gray-500 font-bold uppercase shrink-0">Kategori:</span>
                {[
                  { id: 'ALL', label: 'Semua (51)' },
                  { id: 'MB', label: 'Mercedes-Benz (27)' },
                  { id: 'JAGUAR', label: 'Jaguar (2)' },
                  { id: 'PORSCHE', label: 'Porsche (4)' },
                  { id: 'BMW', label: 'BMW & RR (4)' },
                  { id: 'MOTO', label: 'Roda Dua (4)' },
                ].map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setActiveBrandFilter(b.id)}
                    className={`px-2 py-0.5 rounded-lg border font-mono shrink-0 transition-all cursor-pointer ${
                      activeBrandFilter === b.id
                        ? 'bg-[#c5a059] text-black border-[#c5a059] font-bold'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Special Options Bar: "Semua Unit" & "ALL UNIT" */}
            <div className="p-2 border-b border-white/5 bg-black/40 flex items-center justify-between gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleSelect('')}
                className={`flex-1 px-2.5 py-1.5 rounded-lg text-left text-xs font-semibold flex items-center justify-between transition-all cursor-pointer border ${
                  selectedUnit === ''
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                }`}
              >
                <span>🌐 Semua Unit (Tampilkan Semua Data)</span>
                {selectedUnit === '' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
              </button>

              <button
                type="button"
                onClick={() => handleSelect('ALL UNIT')}
                className={`px-3 py-1.5 rounded-lg text-left text-xs font-bold font-mono flex items-center gap-1.5 transition-all cursor-pointer border ${
                  selectedUnit === 'ALL UNIT'
                    ? 'bg-[#c5a059] text-black border-[#c5a059]'
                    : 'bg-[#c5a059]/10 text-[#c5a059] border-[#c5a059]/30 hover:bg-[#c5a059]/20'
                }`}
              >
                <span>ALL UNIT</span>
                {selectedUnit === 'ALL UNIT' && <Check className="w-3.5 h-3.5 text-black" />}
              </button>
            </div>

            {/* Dropdown Options List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-white/5 scrollbar-thin scrollbar-thumb-[#c5a059]/40 scrollbar-track-black">
              {filteredUnits.length === 0 ? (
                <div className="p-6 text-center text-xs text-gray-500 space-y-1">
                  <p>Tidak ada unit dengan kata kunci "{searchTerm}"</p>
                  <p className="text-[11px] text-gray-600">
                    Pastikan unit terdapat dalam daftar 51 unit resmi SM
                  </p>
                </div>
              ) : (
                filteredUnits.map((unit, index) => {
                  const isSelected = selectedUnit === unit;
                  const client = getClientTag(unit);

                  return (
                    <div
                      key={unit}
                      onClick={() => handleSelect(unit)}
                      className={`px-3.5 py-2.5 flex items-center justify-between cursor-pointer transition-colors group ${
                        isSelected
                          ? 'bg-[#c5a059]/20 text-[#c5a059] font-bold'
                          : 'hover:bg-white/5 text-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-[10px] font-mono text-gray-500 w-5 text-right shrink-0">
                          {index + 1}.
                        </span>
                        <div className="truncate">
                          <p
                            className={`text-xs truncate ${
                              isSelected
                                ? 'text-[#c5a059] font-bold'
                                : 'text-gray-200 group-hover:text-white'
                            }`}
                          >
                            {unit}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        {client && (
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                              isSelected
                                ? 'bg-[#c5a059]/30 text-[#c5a059] border-[#c5a059]/40'
                                : 'bg-white/5 text-gray-400 border-white/10 group-hover:border-white/20'
                            }`}
                          >
                            {client}
                          </span>
                        )}
                        {isSelected && (
                          <Check className="w-4 h-4 text-[#c5a059] stroke-[2.5]" />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Dropdown Footer Status */}
            <div className="p-2.5 bg-[#0a0a0a] border-t border-white/10 flex items-center justify-between text-[11px] text-gray-500">
              <span>Menampilkan {filteredUnits.length} dari 51 unit resmi</span>
              <span className="text-[#c5a059] font-medium">Bebas typo penarikan data</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
