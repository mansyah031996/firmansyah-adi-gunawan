export type MarginType = 'UNIT MARGIN' | 'UNIT NON MARGIN';

export type ProjectManager = 'IQBAL N' | 'FIKI';

export type TeamLead = 'PRATAMA' | 'ARIES' | 'YUDHA' | 'TAUFIK';

export type ProgressCategory = 'FULL RESTORE' | 'PARSIAL';

export type ProjectStatus =
  | 'DONE & DELIVERED'
  | 'URGENT DELIVERY'
  | 'OP MEDIUM PROGRES'
  | 'REGULAR PROGRES'
  | 'SLOW PROGRESS'
  | 'PROGRESS HOLD'
  | 'WAITING LIST';

export interface DivisionHours {
  mechanic: string;   // e.g. "8257:40"
  bodyWork: string;   // e.g. "5924:24"
  bodyPaint: string;  // e.g. "3855:35"
  interior: string;   // e.g. "2744:19"
  chrome: string;     // e.g. "2187:34"
  bubut: string;      // e.g. "244:41"
  total: string;      // e.g. "23214:13"
}

export interface ProjectUnit {
  id: string;
  projectManager: ProjectManager;
  marginType: MarginType;
  unitName: string;
  unitInDate: string; // e.g. "5 Des 2025"
  progressCategory: ProgressCategory;
  teamLead: TeamLead;
  divisionHours: DivisionHours;
  priorityOrder: string; // e.g. "PRIORITAS 1", "WAITING LIST", "-"
  status: ProjectStatus;
  progressPercent?: string; // e.g. "100%", "75%"
  targetDeliveryDate?: string; // e.g. "Jumat, 31 Juli 2026"
  notes?: string;
  sheetNo?: number;
  juliTargetHours?: string; // e.g. "524:00"
  juliActualHours?: string; // e.g. "353:19"
  juliDivisions?: {
    mechanic?: string;
    bodyWork?: string;
    bodyPaint?: string;
    interior?: string;
    chrome?: string;
    bubut?: string;
    qa?: string;
    allDivisi?: string;
  };
  agustusTargetHours?: string; // e.g. "524:00"
  agustusActualHours?: string; // e.g. "353:19"
  agustusDivisions?: {
    mechanic?: string;
    bodyWork?: string;
    bodyPaint?: string;
    interior?: string;
    chrome?: string;
    bubut?: string;
    qa?: string;
    allDivisi?: string;
  };
  septemberTargetHours?: string; // e.g. "1300:00"
  septemberActualHours?: string; // e.g. "215:31"
  septemberDivisions?: {
    mechanic?: string;
    bodyWork?: string;
    bodyPaint?: string;
    interior?: string;
    chrome?: string;
    bubut?: string;
    qa?: string;
    allDivisi?: string;
  };
  septemberTargetDivisions?: {
    mechanic?: string;
    bodyWork?: string;
    bodyPaint?: string;
    interior?: string;
    chrome?: string;
    bubut?: string;
    qa?: string;
    allDivisi?: string;
  };
  highlightType?: 'green' | 'red' | 'yellow' | 'normal';
  activeMonth?: string; // e.g. "SEPTEMBER", "OKTOBER", etc.
  currentTargetHours?: string;
  currentActualHours?: string;
  currentDivisions?: {
    mechanic?: string;
    bodyWork?: string;
    bodyPaint?: string;
    interior?: string;
    chrome?: string;
    bubut?: string;
    qa?: string;
    allDivisi?: string;
  };
  monthlyTargetHours?: Record<string, string>;
  monthlyActualHours?: Record<string, string>;
  monthlyDivisions?: Record<
    string,
    {
      mechanic?: string;
      bodyWork?: string;
      bodyPaint?: string;
      interior?: string;
      chrome?: string;
      bubut?: string;
      qa?: string;
      allDivisi?: string;
    }
  >;
}

export interface FilterState {
  searchQuery: string;
  projectManager: string; // 'ALL' or ProjectManager
  marginType: string;     // 'ALL' or MarginType
  status: string;         // 'ALL' or ProjectStatus
  category: string;       // 'ALL' or ProgressCategory
  teamLead: string;       // 'ALL' or TeamLead
  sortBy: 'priority' | 'hours' | 'unitIn' | 'name';
  sortOrder: 'asc' | 'desc';
}

export type DashboardTab =
  | 'timeline'
  | 'overview'
  | 'target_september'
  | 'actual_september'
  | 'hasil_kerja_september'
  | 'daftar_unit'
  | 'target_agustus'
  | 'actual_agustus'
  | 'divisions'
  | 'table'
  | 'spk'
  | 'spl'
  | 'presentation'
  | (string & {});

export interface SPKRecord {
  id: string;
  spkNumber?: string; // e.g. "SPK/2026/07/001"
  no?: string;
  unitName: string;
  projectManager?: ProjectManager;
  teamLead?: TeamLead;
  division?: string; // e.g. "Mechanic", "Body Work"
  jobdesc?: string;
  issueDate?: string;
  targetDate?: string;
  status?: 'DRAFT' | 'PROSES' | 'DONE' | 'APPROVED';
  yudha?: boolean;
  aries?: boolean;
  opik?: boolean;
  pratama?: boolean;
  taufik?: boolean;
  bodyWork?: boolean;
  bodyPaint?: boolean;
  interior?: boolean;
  chrome?: boolean;
  bubut?: boolean;
  total?: number;
  keterangan?: string;
}

export interface SPLRecord {
  id: string;
  splNumber: string; // e.g. "SPL/2026/08/012"
  no?: string;
  tanggal?: string;
  technicianName: string;
  unitName: string;
  teamLead?: TeamLead | string;
  panelPart?: string;
  date: string;
  startTime: string;
  endTime: string;
  overtimeHours: number;
  targetHours?: string;
  actualHours?: string;
  targetAwal?: string;
  sisaTarget?: string;
  keterangan?: string;
  jobdesc: string;
  status: 'PENDING' | 'DISETUJUI' | 'SELESAI' | string;
}

export interface ActualJobdescRecord {
  id: string;
  date: string;
  team: string;
  personil: string;
  unitName: string;
  panelPart: string;
  jobdesc: string;
  proses: string;
  keterangan?: string;
  targetHours: string;
  sisaTargetHours?: string;
  actualHours?: string;
  startTime: string;
  endTime: string;
  statusEmoji: string;
  statusText?: string;
}

export interface HasilKerjaAgustusRecord {
  id: string;
  tanggal: string;
  divisi: string;
  unit: string;
  nama: string;
  panelPart: string;
  jobdesc: string;
  keterangan: string;
  start: string;
  estimasi: string;
  breakTime?: string;
  finish: string;
  status: string;
  totalJamKerja: string;
  jamKerja?: string;
  kategori?: string;
  [key: string]: any;
}

export interface PerhitunganJamKerjaRealRow {
  tanggal: string;
  jamKerja: string;
}

export interface TargetSeptemberSummary {
  targetMargin?: string;
  targetNonMargin?: string;
  totalTarget?: string;
  actualMargin?: string;
  actualNonMargin?: string;
  totalActual?: string;
  persentaseMargin?: string;
  persentaseNonMargin?: string;
}

export interface TargetProjectDailyTables {
  pjkRows: PerhitunganJamKerjaRealRow[];
  hkRows: {
    tanggal: string;
    marginJam: string;
    nonMarginJam: string;
    totalJam: string;
  }[];
  targetSummary?: TargetSeptemberSummary;
}

