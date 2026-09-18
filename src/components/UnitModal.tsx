import React, { useState, useEffect } from 'react';
import { X, Save, Clock, Trash2, Edit3, Car } from 'lucide-react';
import { ProjectUnit, ProjectManager, MarginType, TeamLead, ProgressCategory, ProjectStatus } from '../types';
import { formatTimeString, timeToDecimalHours } from '../utils/timeUtils';

interface UnitModalProps {
  unit: Partial<ProjectUnit> | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (unitData: ProjectUnit) => void;
}

export const UnitModal: React.FC<UnitModalProps> = ({
  unit,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Partial<ProjectUnit>>({
    projectManager: 'IQBAL N',
    marginType: 'UNIT MARGIN',
    unitName: '',
    unitInDate: '',
    progressCategory: 'FULL RESTORE',
    teamLead: 'PRATAMA',
    divisionHours: {
      mechanic: '0:00',
      bodyWork: '0:00',
      bodyPaint: '0:00',
      interior: '0:00',
      chrome: '0:00',
      bubut: '0:00',
      total: '0:00',
    },
    priorityOrder: 'PRIORITAS 1',
    status: 'OP MEDIUM PROGRES',
    targetDeliveryDate: '',
    notes: '',
  });

  useEffect(() => {
    if (unit) {
      setFormData({
        ...unit,
        divisionHours: unit.divisionHours || {
          mechanic: '0:00',
          bodyWork: '0:00',
          bodyPaint: '0:00',
          interior: '0:00',
          chrome: '0:00',
          bubut: '0:00',
          total: '0:00',
        },
      });
    }
  }, [unit]);

  if (!isOpen) return null;

  // Auto calculate total hours whenever division hours change
  const handleDivisionHourChange = (field: keyof ProjectUnit['divisionHours'], value: string) => {
    setFormData((prev) => {
      const updatedDiv = {
        ...(prev.divisionHours || {
          mechanic: '0:00',
          bodyWork: '0:00',
          bodyPaint: '0:00',
          interior: '0:00',
          chrome: '0:00',
          bubut: '0:00',
          total: '0:00',
        }),
        [field]: value,
      };

      // Recalculate total decimal
      const m = timeToDecimalHours(updatedDiv.mechanic);
      const bw = timeToDecimalHours(updatedDiv.bodyWork);
      const bp = timeToDecimalHours(updatedDiv.bodyPaint);
      const int = timeToDecimalHours(updatedDiv.interior);
      const chr = timeToDecimalHours(updatedDiv.chrome);
      const bbt = timeToDecimalHours(updatedDiv.bubut);

      const totalMins = Math.round((m + bw + bp + int + chr + bbt) * 60);
      const h = Math.floor(totalMins / 60);
      const mins = totalMins % 60;
      const mPad = mins < 10 ? `0${mins}` : `${mins}`;
      updatedDiv.total = `${h}:${mPad}`;

      return { ...prev, divisionHours: updatedDiv };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.unitName) {
      alert('Mohon isi Nama Unit / Pemilik!');
      return;
    }

    const currentDiv = formData.divisionHours || {
      mechanic: '0:00',
      bodyWork: '0:00',
      bodyPaint: '0:00',
      interior: '0:00',
      chrome: '0:00',
      bubut: '0:00',
      total: '0:00',
    };

    const finalUnit: ProjectUnit = {
      id: formData.id || `sm-${Date.now().toString().slice(-4)}`,
      sheetNo: formData.sheetNo,
      projectManager: (formData.projectManager as ProjectManager) || 'IQBAL N',
      marginType: (formData.marginType as MarginType) || 'UNIT MARGIN',
      unitName: formData.unitName || '',
      unitInDate: formData.unitInDate || '-',
      progressCategory: (formData.progressCategory as ProgressCategory) || 'FULL RESTORE',
      teamLead: (formData.teamLead as TeamLead) || 'PRATAMA',
      divisionHours: currentDiv,
      agustusTargetHours: formData.agustusTargetHours || currentDiv.total,
      juliTargetHours: formData.juliTargetHours || currentDiv.total,
      agustusDivisions: { ...currentDiv },
      juliDivisions: { ...currentDiv },
      agustusActualHours: formData.agustusActualHours || currentDiv.total,
      juliActualHours: formData.juliActualHours || currentDiv.total,
      priorityOrder: formData.priorityOrder || '-',
      status: (formData.status as ProjectStatus) || 'OP MEDIUM PROGRES',
      targetDeliveryDate: formData.targetDeliveryDate || '',
      notes: formData.notes || '',
    };

    onSave(finalUnit);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#141414] border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-[#0a0a0a] border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#c5a059]/10 text-[#c5a059] border border-[#c5a059]/20 rounded-xl">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {formData.id ? 'Edit Data Unit Proyek' : 'Tambah Unit Proyek Restorasi Baru'}
              </h3>
              <p className="text-xs text-gray-400">
                Formulir rekapitulasi data pengerjaan jam kerja divisi kendaraan.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs">
          {/* Row 1: Unit Name & PM */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Nama Unit & Pemilik *</label>
              <input
                type="text"
                required
                placeholder="misal: JAGUAR E TYPE Mr. MICHAEL"
                value={formData.unitName || ''}
                onChange={(e) => setFormData({ ...formData, unitName: e.target.value })}
                className="w-full px-3 py-2 bg-[#0a0a0a] border border-white/10 text-white rounded-xl focus:outline-none focus:border-[#c5a059] placeholder-gray-600"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-semibold mb-1">Kepala Proyek</label>
              <select
                value={formData.projectManager || 'IQBAL N'}
                onChange={(e) => setFormData({ ...formData, projectManager: e.target.value as ProjectManager })}
                className="w-full px-3 py-2 bg-[#0a0a0a] border border-white/10 text-white rounded-xl focus:outline-none focus:border-[#c5a059] cursor-pointer"
              >
                <option value="IQBAL N">IQBAL N</option>
                <option value="FIKI">FIKI</option>
              </select>
            </div>
          </div>

          {/* Row 2: Margin & Code Lead */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Margin Unit</label>
              <select
                value={formData.marginType || 'UNIT MARGIN'}
                onChange={(e) => setFormData({ ...formData, marginType: e.target.value as MarginType })}
                className="w-full px-3 py-2 bg-[#0a0a0a] border border-white/10 text-white rounded-xl focus:outline-none focus:border-[#c5a059] cursor-pointer"
              >
                <option value="UNIT MARGIN">UNIT MARGIN</option>
                <option value="UNIT NON MARGIN">UNIT NON MARGIN</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-300 font-semibold mb-1">KD Unit (Team Lead)</label>
              <select
                value={formData.teamLead || 'PRATAMA'}
                onChange={(e) => setFormData({ ...formData, teamLead: e.target.value as TeamLead })}
                className="w-full px-3 py-2 bg-[#0a0a0a] border border-white/10 text-white rounded-xl focus:outline-none focus:border-[#c5a059] cursor-pointer"
              >
                <option value="PRATAMA">PRATAMA</option>
                <option value="ARIES">ARIES</option>
                <option value="YUDHA">YUDHA</option>
                <option value="TAUFIK">TAUFIK</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-300 font-semibold mb-1">Kategori Progress</label>
              <select
                value={formData.progressCategory || 'FULL RESTORE'}
                onChange={(e) => setFormData({ ...formData, progressCategory: e.target.value as ProgressCategory })}
                className="w-full px-3 py-2 bg-[#0a0a0a] border border-white/10 text-white rounded-xl focus:outline-none focus:border-[#c5a059] cursor-pointer"
              >
                <option value="FULL RESTORE">FULL RESTORE</option>
                <option value="PARSIAL">PARSIAL</option>
              </select>
            </div>
          </div>

          {/* Row 3: Dates & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Tanggal Check-In (Unit In)</label>
              <input
                type="text"
                placeholder="misal: 5 Des 2025"
                value={formData.unitInDate || ''}
                onChange={(e) => setFormData({ ...formData, unitInDate: e.target.value })}
                className="w-full px-3 py-2 bg-[#0a0a0a] border border-white/10 text-white rounded-xl focus:outline-none focus:border-[#c5a059] placeholder-gray-600"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-semibold mb-1">Prioritas Target Delivery</label>
              <input
                type="text"
                placeholder="misal: PRIORITAS 1"
                value={formData.priorityOrder || ''}
                onChange={(e) => setFormData({ ...formData, priorityOrder: e.target.value })}
                className="w-full px-3 py-2 bg-[#0a0a0a] border border-white/10 text-white rounded-xl focus:outline-none focus:border-[#c5a059] placeholder-gray-600"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-semibold mb-1">Status Pengerjaan</label>
              <select
                value={formData.status || 'OP MEDIUM PROGRES'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                className="w-full px-3 py-2 bg-[#0a0a0a] border border-white/10 text-white rounded-xl focus:outline-none focus:border-[#c5a059] cursor-pointer"
              >
                <option value="DONE & DELIVERED">DONE & DELIVERED</option>
                <option value="URGENT DELIVERY">URGENT DELIVERY</option>
                <option value="OP MEDIUM PROGRES">OP MEDIUM PROGRES</option>
                <option value="REGULAR PROGRES">REGULAR PROGRES</option>
                <option value="SLOW PROGRESS">SLOW PROGRESS</option>
                <option value="PROGRESS HOLD">PROGRESS HOLD</option>
                <option value="WAITING LIST">WAITING LIST</option>
              </select>
            </div>
          </div>

          {/* Target Delivery Date */}
          <div>
            <label className="block text-gray-300 font-semibold mb-1">Tanggal Target Unit Delivery (Opsional)</label>
            <input
              type="text"
              placeholder="misal: Jumat, 31 Juli 2026"
              value={formData.targetDeliveryDate || ''}
              onChange={(e) => setFormData({ ...formData, targetDeliveryDate: e.target.value })}
              className="w-full px-3 py-2 bg-[#0a0a0a] border border-white/10 text-white rounded-xl focus:outline-none focus:border-[#c5a059] placeholder-gray-600"
            />
          </div>

          {/* Division Hours Section */}
          <div className="pt-3 border-t border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-[#c5a059] flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> Rincian Jam Kerja Divisi (Format Jam:Menit e.g. 8257:40)
              </h4>
              <span className="text-xs text-white font-mono bg-[#0a0a0a] px-2.5 py-1 rounded-lg border border-white/10">
                Total: <strong className="text-[#c5a059]">{formData.divisionHours?.total || '0:00'}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div>
                <label className="block text-gray-400 text-[11px] mb-0.5">MECHANIC</label>
                <input
                  type="text"
                  value={formData.divisionHours?.mechanic || '0:00'}
                  onChange={(e) => handleDivisionHourChange('mechanic', e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#0a0a0a] border border-white/10 text-white font-mono rounded-lg focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-[11px] mb-0.5">BODY WORK</label>
                <input
                  type="text"
                  value={formData.divisionHours?.bodyWork || '0:00'}
                  onChange={(e) => handleDivisionHourChange('bodyWork', e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#0a0a0a] border border-white/10 text-white font-mono rounded-lg focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-[11px] mb-0.5">BODY PAINT</label>
                <input
                  type="text"
                  value={formData.divisionHours?.bodyPaint || '0:00'}
                  onChange={(e) => handleDivisionHourChange('bodyPaint', e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#0a0a0a] border border-white/10 text-white font-mono rounded-lg focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-[11px] mb-0.5">INTERIOR</label>
                <input
                  type="text"
                  value={formData.divisionHours?.interior || '0:00'}
                  onChange={(e) => handleDivisionHourChange('interior', e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#0a0a0a] border border-white/10 text-white font-mono rounded-lg focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-[11px] mb-0.5">CHROME</label>
                <input
                  type="text"
                  value={formData.divisionHours?.chrome || '0:00'}
                  onChange={(e) => handleDivisionHourChange('chrome', e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#0a0a0a] border border-white/10 text-white font-mono rounded-lg focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-[11px] mb-0.5">BUBUT</label>
                <input
                  type="text"
                  value={formData.divisionHours?.bubut || '0:00'}
                  onChange={(e) => handleDivisionHourChange('bubut', e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#0a0a0a] border border-white/10 text-white font-mono rounded-lg focus:outline-none focus:border-[#c5a059]"
                />
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-white/5 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 font-medium rounded-xl transition-colors cursor-pointer border border-white/10"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#c5a059] hover:bg-[#d4af66] text-[#0a0a0a] font-bold rounded-xl shadow-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Data Unit</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
