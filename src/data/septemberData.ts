// Static dataset for SEPTEMBER target and actual from Google Sheets (GID 938106022)
// Sesuai 100% dengan tampilan Sheet "TARGET PROJECT SEPTEMBER" (Kolom Aktual per Divisi, Total Target, Total Actual)

export interface DailyJuliReportRow {
  no: number;
  unitName: string;
  mechanic: string;
  bodyWork: string;
  bodyPaint: string;
  interior: string;
  chrome: string;
  bubut: string;
  qa: string;
  allDivisi: string;
  targetDivisions?: {
    mechanic: string;
    bodyWork: string;
    bodyPaint: string;
    interior: string;
    chrome: string;
    bubut: string;
    qa: string;
    allDivisi: string;
  };
  totalTarget: string;
  totalActual: string;
  highlightType?: 'normal' | 'green' | 'red' | 'yellow';
}

export interface ProductionDailyRealRow {
  tanggal: string;
  jamKerja: string;
  marginJam: string;
  nonMarginJam: string;
}

export interface DailyMarginNonMarginItem {
  tanggal: string;
  marginJam: string;
  nonMarginJam: string;
  totalJam: string;
}

export const UNIT_MARGIN_SEPTEMBER_DATA: DailyJuliReportRow[] = [
  {
    "no": 1,
    "unitName": "MB MPS Mr. DIKO",
    "mechanic": "407:31",
    "bodyWork": "27:54",
    "bodyPaint": "398:42",
    "interior": "130:46",
    "chrome": "17:05",
    "bubut": "0:00",
    "qa": "0:00",
    "allDivisi": "0:00",
    "targetDivisions": {
      "mechanic": "400:00",
      "bodyWork": "300:00",
      "bodyPaint": "250:00",
      "interior": "300:00",
      "chrome": "0:00",
      "bubut": "50:00",
      "qa": "0:00",
      "allDivisi": "0:00"
    },
    "totalTarget": "1300:00",
    "totalActual": "981:58",
    "highlightType": "yellow"
  },
  {
    "no": 2,
    "unitName": "MB R129 Mr. DIKO",
    "mechanic": "223:58",
    "bodyWork": "44:23",
    "bodyPaint": "127:41",
    "interior": "47:01",
    "chrome": "8:00",
    "bubut": "6:30",
    "qa": "0:00",
    "allDivisi": "0:00",
    "targetDivisions": {
      "mechanic": "400:00",
      "bodyWork": "300:00",
      "bodyPaint": "250:00",
      "interior": "300:00",
      "chrome": "0:00",
      "bubut": "50:00",
      "qa": "0:00",
      "allDivisi": "0:00"
    },
    "totalTarget": "1250:00",
    "totalActual": "457:33",
    "highlightType": "yellow"
  },
  {
    "no": 3,
    "unitName": "MB PAGODA Mr. DIDI",
    "mechanic": "191:38",
    "bodyWork": "0:00",
    "bodyPaint": "0:00",
    "interior": "8:00",
    "chrome": "0:00",
    "bubut": "0:00",
    "qa": "0:00",
    "allDivisi": "0:00",
    "targetDivisions": {
      "mechanic": "300:00",
      "bodyWork": "250:00",
      "bodyPaint": "300:00",
      "interior": "300:00",
      "chrome": "100:00",
      "bubut": "50:00",
      "qa": "0:00",
      "allDivisi": "0:00"
    },
    "totalTarget": "1000:00",
    "totalActual": "199:38",
    "highlightType": "yellow"
  },
  {
    "no": 4,
    "unitName": "MB 500 SEC Mr. DIKO",
    "mechanic": "107:21",
    "bodyWork": "2:00",
    "bodyPaint": "158:22",
    "interior": "35:44",
    "chrome": "27:31",
    "bubut": "0:00",
    "qa": "0:00",
    "allDivisi": "0:00",
    "targetDivisions": {
      "mechanic": "300:00",
      "bodyWork": "200:00",
      "bodyPaint": "200:00",
      "interior": "200:00",
      "chrome": "20:00",
      "bubut": "0:00",
      "qa": "0:00",
      "allDivisi": "0:00"
    },
    "totalTarget": "870:00",
    "totalActual": "330:58",
    "highlightType": "yellow"
  },
  {
    "no": 5,
    "unitName": "MB 190 SL Mr. ADRIAN",
    "mechanic": "68:30",
    "bodyWork": "85:45",
    "bodyPaint": "1:11",
    "interior": "148:53",
    "chrome": "5:30",
    "bubut": "5:00",
    "qa": "0:00",
    "allDivisi": "0:00",
    "targetDivisions": {
      "mechanic": "200:00",
      "bodyWork": "150:00",
      "bodyPaint": "100:00",
      "interior": "200:00",
      "chrome": "50:00",
      "bubut": "0:00",
      "qa": "0:00",
      "allDivisi": "0:00"
    },
    "totalTarget": "700:00",
    "totalActual": "314:49",
    "highlightType": "yellow"
  },
  {
    "no": 6,
    "unitName": "MB W 111 KEBO Mr. INDRA",
    "mechanic": "0:00",
    "bodyWork": "0:00",
    "bodyPaint": "0:00",
    "interior": "0:00",
    "chrome": "0:00",
    "bubut": "0:00",
    "qa": "0:00",
    "allDivisi": "0:00",
    "targetDivisions": {
      "mechanic": "100:00",
      "bodyWork": "100:00",
      "bodyPaint": "100:00",
      "interior": "50:00",
      "chrome": "50:00",
      "bubut": "0:00",
      "qa": "0:00",
      "allDivisi": "0:00"
    },
    "totalTarget": "400:00",
    "totalActual": "0:00",
    "highlightType": "red"
  },
  {
    "no": 7,
    "unitName": "MB 300 CE Mr. DIKO",
    "mechanic": "227:54",
    "bodyWork": "26:37",
    "bodyPaint": "187:23",
    "interior": "15:01",
    "chrome": "0:00",
    "bubut": "0:00",
    "qa": "0:00",
    "allDivisi": "0:00",
    "targetDivisions": {
      "mechanic": "150:00",
      "bodyWork": "200:00",
      "bodyPaint": "200:00",
      "interior": "150:00",
      "chrome": "0:00",
      "bubut": "0:00",
      "qa": "0:00",
      "allDivisi": "0:00"
    },
    "totalTarget": "750:00",
    "totalActual": "456:55",
    "highlightType": "normal"
  },
  {
    "no": 8,
    "unitName": "MB PONTON 220 S Mr. SANTOSO",
    "mechanic": "233:52",
    "bodyWork": "323:12",
    "bodyPaint": "27:34",
    "interior": "4:00",
    "chrome": "8:00",
    "bubut": "0:00",
    "qa": "0:00",
    "allDivisi": "0:00",
    "targetDivisions": {
      "mechanic": "100:00",
      "bodyWork": "200:00",
      "bodyPaint": "150:00",
      "interior": "100:00",
      "chrome": "100:00",
      "bubut": "0:00",
      "qa": "0:00",
      "allDivisi": "0:00"
    },
    "totalTarget": "612:00",
    "totalActual": "596:38",
    "highlightType": "normal"
  },
  {
    "no": 9,
    "unitName": "MB BATMAN Mr. ICHSAN",
    "mechanic": "34:41",
    "bodyWork": "45:04",
    "bodyPaint": "0:00",
    "interior": "181:40",
    "chrome": "30:39",
    "bubut": "0:00",
    "qa": "0:00",
    "allDivisi": "0:00",
    "targetDivisions": {
      "mechanic": "100:00",
      "bodyWork": "100:00",
      "bodyPaint": "100:00",
      "interior": "100:00",
      "chrome": "150:00",
      "bubut": "0:00",
      "qa": "0:00",
      "allDivisi": "0:00"
    },
    "totalTarget": "500:00",
    "totalActual": "292:04",
    "highlightType": "normal"
  },
  {
    "no": 10,
    "unitName": "MB MASTERPIECE NEW Mr. DIKO",
    "mechanic": "169:57",
    "bodyWork": "29:30",
    "bodyPaint": "315:30",
    "interior": "134:30",
    "chrome": "0:00",
    "bubut": "0:00",
    "qa": "0:00",
    "allDivisi": "0:00",
    "targetDivisions": {
      "mechanic": "200:00",
      "bodyWork": "100:00",
      "bodyPaint": "200:00",
      "interior": "50:00",
      "chrome": "0:00",
      "bubut": "0:00",
      "qa": "0:00",
      "allDivisi": "0:00"
    },
    "totalTarget": "550:00",
    "totalActual": "649:27",
    "highlightType": "normal"
  },
  {
    "no": 11,
    "unitName": "MB 280 GE Mr. ABONG",
    "mechanic": "129:47",
    "bodyWork": "122:39",
    "bodyPaint": "259:00",
    "interior": "10:15",
    "chrome": "0:00",
    "bubut": "0:00",
    "qa": "0:00",
    "allDivisi": "0:00",
    "targetDivisions": {
      "mechanic": "250:00",
      "bodyWork": "150:00",
      "bodyPaint": "200:00",
      "interior": "50:00",
      "chrome": "0:00",
      "bubut": "0:00",
      "qa": "0:00",
      "allDivisi": "0:00"
    },
    "totalTarget": "600:00",
    "totalActual": "521:41",
    "highlightType": "normal"
  },
  {
    "no": 12,
    "unitName": "JAGUAR XK120 Mr. JAMES",
    "mechanic": "102:05",
    "bodyWork": "91:22",
    "bodyPaint": "21:40",
    "interior": "0:00",
    "chrome": "111:57",
    "bubut": "37:23",
    "qa": "0:00",
    "allDivisi": "0:00",
    "targetDivisions": {
      "mechanic": "200:00",
      "bodyWork": "150:00",
      "bodyPaint": "50:00",
      "interior": "50:00",
      "chrome": "0:00",
      "bubut": "0:00",
      "qa": "0:00",
      "allDivisi": "0:00"
    },
    "totalTarget": "450:00",
    "totalActual": "364:27",
    "highlightType": "normal"
  },
  {
    "no": 13,
    "unitName": "JAGUAR XK120 Mr. JAMES ( JOBDESC KHUSUS )",
    "mechanic": "6:30",
    "bodyWork": "0:00",
    "bodyPaint": "32:40",
    "interior": "0:00",
    "chrome": "0:00",
    "bubut": "0:00",
    "qa": "0:00",
    "allDivisi": "0:00",
    "targetDivisions": {
      "mechanic": "50:00",
      "bodyWork": "0:00",
      "bodyPaint": "50:00",
      "interior": "0:00",
      "chrome": "0:00",
      "bubut": "0:00",
      "qa": "0:00",
      "allDivisi": "0:00"
    },
    "totalTarget": "100:00",
    "totalActual": "39:10",
    "highlightType": "normal"
  },
  {
    "no": 14,
    "unitName": "CHEVROLET Mr. NYOMAN",
    "mechanic": "24:01",
    "bodyWork": "139:33",
    "bodyPaint": "4:00",
    "interior": "0:00",
    "chrome": "10:00",
    "bubut": "0:00",
    "qa": "0:00",
    "allDivisi": "0:00",
    "targetDivisions": {
      "mechanic": "100:00",
      "bodyWork": "100:00",
      "bodyPaint": "50:00",
      "interior": "50:00",
      "chrome": "0:00",
      "bubut": "0:00",
      "qa": "0:00",
      "allDivisi": "0:00"
    },
    "totalTarget": "250:00",
    "totalActual": "177:34",
    "highlightType": "normal"
  },
  {
    "no": 15,
    "unitName": "MB GROSSER Mr. INDRA",
    "mechanic": "0:00",
    "bodyWork": "0:00",
    "bodyPaint": "0:00",
    "interior": "0:00",
    "chrome": "0:00",
    "bubut": "0:00",
    "qa": "0:00",
    "allDivisi": "0:00",
    "targetDivisions": {
      "mechanic": "50:00",
      "bodyWork": "50:00",
      "bodyPaint": "0:00",
      "interior": "0:00",
      "chrome": "0:00",
      "bubut": "0:00",
      "qa": "0:00",
      "allDivisi": "0:00"
    },
    "totalTarget": "100:00",
    "totalActual": "0:00",
    "highlightType": "red"
  },
  {
    "no": 16,
    "unitName": "PORSCHE 911 Mr. HANDY",
    "mechanic": "60:03",
    "bodyWork": "0:00",
    "bodyPaint": "0:00",
    "interior": "0:00",
    "chrome": "0:00",
    "bubut": "0:00",
    "qa": "0:00",
    "allDivisi": "0:00",
    "targetDivisions": {
      "mechanic": "150:00",
      "bodyWork": "100:00",
      "bodyPaint": "50:00",
      "interior": "50:00",
      "chrome": "50:00",
      "bubut": "0:00",
      "qa": "0:00",
      "allDivisi": "0:00"
    },
    "totalTarget": "300:00",
    "totalActual": "60:03",
    "highlightType": "red"
  },
  {
    "no": 17,
    "unitName": "MB280 SLC Mr.MUSA",
    "mechanic": "0:00",
    "bodyWork": "0:00",
    "bodyPaint": "0:00",
    "interior": "0:00",
    "chrome": "0:00",
    "bubut": "0:00",
    "qa": "0:00",
    "allDivisi": "0:00",
    "targetDivisions": {
      "mechanic": "100:00",
      "bodyWork": "100:00",
      "bodyPaint": "100:00",
      "interior": "0:00",
      "chrome": "0:00",
      "bubut": "0:00",
      "qa": "0:00",
      "allDivisi": "0:00"
    },
    "totalTarget": "250:00",
    "totalActual": "0:00",
    "highlightType": "normal"
  },
  {
    "no": 18,
    "unitName": "MB 500 SL Mr. MALIQ",
    "mechanic": "0:00",
    "bodyWork": "0:00",
    "bodyPaint": "0:00",
    "interior": "0:00",
    "chrome": "0:00",
    "bubut": "0:00",
    "qa": "0:00",
    "allDivisi": "0:00",
    "targetDivisions": {
      "mechanic": "100:00",
      "bodyWork": "100:00",
      "bodyPaint": "100:00",
      "interior": "0:00",
      "chrome": "0:00",
      "bubut": "0:00",
      "qa": "0:00",
      "allDivisi": "0:00"
    },
    "totalTarget": "250:00",
    "totalActual": "0:00",
    "highlightType": "normal"
  },
  {
    "no": 19,
    "unitName": "MB 280 TE Mr. JOKO",
    "mechanic": "0:00",
    "bodyWork": "0:00",
    "bodyPaint": "0:00",
    "interior": "0:00",
    "chrome": "0:00",
    "bubut": "0:00",
    "qa": "0:00",
    "allDivisi": "0:00",
    "targetDivisions": {
      "mechanic": "100:00",
      "bodyWork": "100:00",
      "bodyPaint": "100:00",
      "interior": "0:00",
      "chrome": "0:00",
      "bubut": "0:00",
      "qa": "0:00",
      "allDivisi": "0:00"
    },
    "totalTarget": "300:00",
    "totalActual": "0:00",
    "highlightType": "normal"
  },
  {
    "no": 20,
    "unitName": "BMW 640i Mr. DIKO",
    "mechanic": "0:00",
    "bodyWork": "0:00",
    "bodyPaint": "1:00",
    "interior": "0:00",
    "chrome": "0:00",
    "bubut": "0:00",
    "qa": "0:00",
    "allDivisi": "0:00",
    "targetDivisions": {
      "mechanic": "100:00",
      "bodyWork": "100:00",
      "bodyPaint": "100:00",
      "interior": "0:00",
      "chrome": "0:00",
      "bubut": "0:00",
      "qa": "0:00",
      "allDivisi": "0:00"
    },
    "totalTarget": "300:00",
    "totalActual": "1:00",
    "highlightType": "normal"
  },
  {
    "no": 21,
    "unitName": "MB R129 Mr. ANDREW",
    "mechanic": "71:29",
    "bodyWork": "8:01",
    "bodyPaint": "1:00",
    "interior": "18:00",
    "chrome": "0:00",
    "bubut": "0:00",
    "qa": "0:00",
    "allDivisi": "0:00",
    "targetDivisions": {
      "mechanic": "100:00",
      "bodyWork": "100:00",
      "bodyPaint": "50:00",
      "interior": "0:00",
      "chrome": "0:00",
      "bubut": "0:00",
      "qa": "0:00",
      "allDivisi": "0:00"
    },
    "totalTarget": "250:00",
    "totalActual": "98:30",
    "highlightType": "normal"
  },
  {
    "no": 22,
    "unitName": "MB 560 SEC Mrs. NINA",
    "mechanic": "0:00",
    "bodyWork": "0:00",
    "bodyPaint": "0:00",
    "interior": "0:00",
    "chrome": "0:00",
    "bubut": "0:00",
    "qa": "0:00",
    "allDivisi": "0:00",
    "targetDivisions": {
      "mechanic": "0:00",
      "bodyWork": "0:00",
      "bodyPaint": "0:00",
      "interior": "0:00",
      "chrome": "0:00",
      "bubut": "0:00",
      "qa": "0:00",
      "allDivisi": "0:00"
    },
    "totalTarget": "0:00",
    "totalActual": "0:00",
    "highlightType": "red"
  },
  {
    "no": 23,
    "unitName": "MB R107 Mrs. NINA",
    "mechanic": "0:00",
    "bodyWork": "0:00",
    "bodyPaint": "0:00",
    "interior": "0:00",
    "chrome": "0:00",
    "bubut": "0:00",
    "qa": "0:00",
    "allDivisi": "0:00",
    "targetDivisions": {
      "mechanic": "0:00",
      "bodyWork": "0:00",
      "bodyPaint": "0:00",
      "interior": "0:00",
      "chrome": "0:00",
      "bubut": "0:00",
      "qa": "0:00",
      "allDivisi": "0:00"
    },
    "totalTarget": "0:00",
    "totalActual": "0:00",
    "highlightType": "red"
  },
  {
    "no": 24,
    "unitName": "ALL UNIT",
    "mechanic": "407:00",
    "bodyWork": "364:32",
    "bodyPaint": "273:24",
    "interior": "135:42",
    "chrome": "0:00",
    "bubut": "0:00",
    "qa": "0:00",
    "allDivisi": "887:19",
    "targetDivisions": {
      "mechanic": "407:00",
      "bodyWork": "364:32",
      "bodyPaint": "273:24",
      "interior": "135:42",
      "chrome": "0:00",
      "bubut": "0:00",
      "qa": "0:00",
      "allDivisi": "887:19"
    },
    "totalTarget": "2400:00",
    "totalActual": "2067:57",
    "highlightType": "yellow"
  }
];

export const UNIT_NON_MARGIN_SEPTEMBER_DATA: DailyJuliReportRow[] = [
  {
    "no": 26,
    "unitName": "MB W124 E320 SPORTLINE Mr. MARTHIN",
    "mechanic": "238:00",
    "bodyWork": "85:36",
    "bodyPaint": "25:00",
    "interior": "6:00",
    "chrome": "25:30",
    "bubut": "16:30",
    "qa": "0:00",
    "allDivisi": "0:00",
    "targetDivisions": {
      "mechanic": "300:00",
      "bodyWork": "100:00",
      "bodyPaint": "100:00",
      "interior": "0:00",
      "chrome": "0:00",
      "bubut": "0:00",
      "qa": "0:00",
      "allDivisi": "0:00"
    },
    "totalTarget": "500:00",
    "totalActual": "396:36",
    "highlightType": "normal"
  },
  {
    "no": 27,
    "unitName": "VW BEETLE Mr. RICHARD",
    "mechanic": "68:00",
    "bodyWork": "22:30",
    "bodyPaint": "23:30",
    "interior": "50:30",
    "chrome": "10:30",
    "bubut": "0:00",
    "qa": "0:00",
    "allDivisi": "0:00",
    "targetDivisions": {
      "mechanic": "150:00",
      "bodyWork": "150:00",
      "bodyPaint": "100:00",
      "interior": "100:00",
      "chrome": "50:00",
      "bubut": "0:00",
      "qa": "0:00",
      "allDivisi": "0:00"
    },
    "totalTarget": "550:00",
    "totalActual": "175:00",
    "highlightType": "normal"
  },
  {
    "no": 28,
    "unitName": "MB W111 KEBO Mr. PRAM",
    "mechanic": "137:00",
    "bodyWork": "66:00",
    "bodyPaint": "31:30",
    "interior": "0:00",
    "chrome": "0:00",
    "bubut": "17:22",
    "qa": "0:00",
    "allDivisi": "0:00",
    "targetDivisions": {
      "mechanic": "100:00",
      "bodyWork": "50:00",
      "bodyPaint": "50:00",
      "interior": "0:00",
      "chrome": "0:00",
      "bubut": "0:00",
      "qa": "0:00",
      "allDivisi": "0:00"
    },
    "totalTarget": "200:00",
    "totalActual": "251:52",
    "highlightType": "normal"
  },
  {
    "no": 29,
    "unitName": "MB W 111 KEBO SM",
    "mechanic": "0:00",
    "bodyWork": "0:00",
    "bodyPaint": "0:00",
    "interior": "0:00",
    "chrome": "0:00",
    "bubut": "0:00",
    "qa": "0:00",
    "allDivisi": "0:00",
    "targetDivisions": {
      "mechanic": "0:00",
      "bodyWork": "0:00",
      "bodyPaint": "0:00",
      "interior": "0:00",
      "chrome": "0:00",
      "bubut": "0:00",
      "qa": "0:00",
      "allDivisi": "0:00"
    },
    "totalTarget": "0:00",
    "totalActual": "0:00",
    "highlightType": "normal"
  },
  {
    "no": 30,
    "unitName": "BMW 750 IL BARU Mr. STANLEY",
    "mechanic": "46:30",
    "bodyWork": "0:00",
    "bodyPaint": "0:00",
    "interior": "18:30",
    "chrome": "0:00",
    "bubut": "0:00",
    "qa": "0:00",
    "allDivisi": "0:00",
    "targetDivisions": {
      "mechanic": "100:00",
      "bodyWork": "20:00",
      "bodyPaint": "20:00",
      "interior": "50:00",
      "chrome": "0:00",
      "bubut": "0:00",
      "qa": "0:00",
      "allDivisi": "0:00"
    },
    "totalTarget": "190:00",
    "totalActual": "65:00",
    "highlightType": "normal"
  },
  {
    "no": 31,
    "unitName": "HONDA N360 Mr. ERIC",
    "mechanic": "0:00",
    "bodyWork": "0:00",
    "bodyPaint": "0:00",
    "interior": "0:00",
    "chrome": "0:00",
    "bubut": "0:00",
    "qa": "0:00",
    "allDivisi": "0:00",
    "targetDivisions": {
      "mechanic": "0:00",
      "bodyWork": "0:00",
      "bodyPaint": "0:00",
      "interior": "0:00",
      "chrome": "0:00",
      "bubut": "0:00",
      "qa": "0:00",
      "allDivisi": "0:00"
    },
    "totalTarget": "0:00",
    "totalActual": "0:00",
    "highlightType": "normal"
  },
  {
    "no": 32,
    "unitName": "HARLEY Mr. STANLEY",
    "mechanic": "0:00",
    "bodyWork": "2:00",
    "bodyPaint": "0:00",
    "interior": "0:00",
    "chrome": "21:00",
    "bubut": "0:00",
    "qa": "0:00",
    "allDivisi": "0:00",
    "targetDivisions": {
      "mechanic": "0:00",
      "bodyWork": "0:00",
      "bodyPaint": "0:00",
      "interior": "0:00",
      "chrome": "0:00",
      "bubut": "0:00",
      "qa": "0:00",
      "allDivisi": "0:00"
    },
    "totalTarget": "0:00",
    "totalActual": "23:00",
    "highlightType": "normal"
  },
  {
    "no": 33,
    "unitName": "LAND ROVER DISCOVERY Mr. STANLEY",
    "mechanic": "2:00",
    "bodyWork": "0:00",
    "bodyPaint": "0:00",
    "interior": "0:00",
    "chrome": "0:00",
    "bubut": "0:00",
    "qa": "0:00",
    "allDivisi": "0:00",
    "targetDivisions": {
      "mechanic": "0:00",
      "bodyWork": "0:00",
      "bodyPaint": "0:00",
      "interior": "0:00",
      "chrome": "0:00",
      "bubut": "0:00",
      "qa": "0:00",
      "allDivisi": "0:00"
    },
    "totalTarget": "0:00",
    "totalActual": "2:00",
    "highlightType": "normal"
  },
  {
    "no": 34,
    "unitName": "HONDA CR-V Mr. MARTHIN",
    "mechanic": "0:00",
    "bodyWork": "0:00",
    "bodyPaint": "1:00",
    "interior": "0:00",
    "chrome": "0:00",
    "bubut": "0:00",
    "qa": "0:00",
    "allDivisi": "0:00",
    "targetDivisions": {
      "mechanic": "25:00",
      "bodyWork": "0:00",
      "bodyPaint": "0:00",
      "interior": "0:00",
      "chrome": "0:00",
      "bubut": "0:00",
      "qa": "0:00",
      "allDivisi": "0:00"
    },
    "totalTarget": "25:00",
    "totalActual": "1:00",
    "highlightType": "normal"
  },
  {
    "no": 35,
    "unitName": "KIJANG INNOVA Mr. STANLEY",
    "mechanic": "25:30",
    "bodyWork": "0:00",
    "bodyPaint": "0:00",
    "interior": "0:00",
    "chrome": "0:00",
    "bubut": "0:00",
    "qa": "0:00",
    "allDivisi": "0:00",
    "targetDivisions": {
      "mechanic": "0:00",
      "bodyWork": "0:00",
      "bodyPaint": "0:00",
      "interior": "0:00",
      "chrome": "0:00",
      "bubut": "0:00",
      "qa": "0:00",
      "allDivisi": "0:00"
    },
    "totalTarget": "0:00",
    "totalActual": "25:30",
    "highlightType": "normal"
  },
  {
    "no": 36,
    "unitName": "BMW 750 IL LAMA Mr. STANLEY",
    "mechanic": "1:30",
    "bodyWork": "0:00",
    "bodyPaint": "0:00",
    "interior": "0:00",
    "chrome": "0:00",
    "bubut": "0:00",
    "qa": "0:00",
    "allDivisi": "0:00",
    "targetDivisions": {
      "mechanic": "0:00",
      "bodyWork": "0:00",
      "bodyPaint": "0:00",
      "interior": "0:00",
      "chrome": "0:00",
      "bubut": "0:00",
      "qa": "0:00",
      "allDivisi": "0:00"
    },
    "totalTarget": "0:00",
    "totalActual": "1:30",
    "highlightType": "normal"
  },
  {
    "no": 37,
    "unitName": "KIJANG SM",
    "mechanic": "8:30",
    "bodyWork": "0:00",
    "bodyPaint": "1:00",
    "interior": "0:00",
    "chrome": "0:00",
    "bubut": "0:00",
    "qa": "0:00",
    "allDivisi": "0:00",
    "targetDivisions": {
      "mechanic": "0:00",
      "bodyWork": "0:00",
      "bodyPaint": "0:00",
      "interior": "0:00",
      "chrome": "0:00",
      "bubut": "0:00",
      "qa": "0:00",
      "allDivisi": "0:00"
    },
    "totalTarget": "0:00",
    "totalActual": "9:30",
    "highlightType": "normal"
  },
  {
    "no": 38,
    "unitName": "SUZUKI NEX Mr. MARTHIN",
    "mechanic": "0:00",
    "bodyWork": "0:00",
    "bodyPaint": "0:00",
    "interior": "0:00",
    "chrome": "5:00",
    "bubut": "0:00",
    "qa": "0:00",
    "allDivisi": "0:00",
    "targetDivisions": {
      "mechanic": "0:00",
      "bodyWork": "0:00",
      "bodyPaint": "0:00",
      "interior": "0:00",
      "chrome": "0:00",
      "bubut": "0:00",
      "qa": "0:00",
      "allDivisi": "0:00"
    },
    "totalTarget": "0:00",
    "totalActual": "5:00",
    "highlightType": "normal"
  },
  {
    "no": 39,
    "unitName": "YAMAHA N MAX Mr. MARTHIN",
    "mechanic": "0:00",
    "bodyWork": "0:00",
    "bodyPaint": "0:00",
    "interior": "0:00",
    "chrome": "1:00",
    "bubut": "0:00",
    "qa": "0:00",
    "allDivisi": "0:00",
    "targetDivisions": {
      "mechanic": "0:00",
      "bodyWork": "0:00",
      "bodyPaint": "0:00",
      "interior": "0:00",
      "chrome": "0:00",
      "bubut": "0:00",
      "qa": "0:00",
      "allDivisi": "0:00"
    },
    "totalTarget": "0:00",
    "totalActual": "1:00",
    "highlightType": "normal"
  },
  {
    "no": 40,
    "unitName": "TOYOTA MARK X Mr. MARTHIN",
    "mechanic": "6:00",
    "bodyWork": "1:00",
    "bodyPaint": "0:30",
    "interior": "0:00",
    "chrome": "0:00",
    "bubut": "0:00",
    "qa": "0:00",
    "allDivisi": "0:00",
    "targetDivisions": {
      "mechanic": "50:00",
      "bodyWork": "0:00",
      "bodyPaint": "0:00",
      "interior": "0:00",
      "chrome": "0:00",
      "bubut": "0:00",
      "qa": "0:00",
      "allDivisi": "0:00"
    },
    "totalTarget": "50:00",
    "totalActual": "7:30",
    "highlightType": "normal"
  },
  {
    "no": 41,
    "unitName": "MB R 230 Mr. STANLEY",
    "mechanic": "14:00",
    "bodyWork": "0:00",
    "bodyPaint": "1:00",
    "interior": "0:00",
    "chrome": "0:00",
    "bubut": "0:00",
    "qa": "0:00",
    "allDivisi": "0:00",
    "targetDivisions": {
      "mechanic": "0:00",
      "bodyWork": "0:00",
      "bodyPaint": "0:00",
      "interior": "0:00",
      "chrome": "0:00",
      "bubut": "0:00",
      "qa": "0:00",
      "allDivisi": "0:00"
    },
    "totalTarget": "0:00",
    "totalActual": "15:00",
    "highlightType": "normal"
  }
];

export const DAILY_REAL_PRODUCTION_SEPTEMBER: ProductionDailyRealRow[] = [
  {
    "tanggal": "1-Sep-2026",
    "jamKerja": "565:26",
    "marginJam": "536:26",
    "nonMarginJam": "29:00"
  },
  {
    "tanggal": "2-Sep-2026",
    "jamKerja": "572:53",
    "marginJam": "511:23",
    "nonMarginJam": "61:30"
  },
  {
    "tanggal": "3-Sep-2026",
    "jamKerja": "580:55",
    "marginJam": "496:55",
    "nonMarginJam": "84:00"
  },
  {
    "tanggal": "4-Sep-2026",
    "jamKerja": "576:07",
    "marginJam": "525:37",
    "nonMarginJam": "50:30"
  },
  {
    "tanggal": "5-Sep-2026",
    "jamKerja": "323:01",
    "marginJam": "284:01",
    "nonMarginJam": "39:00"
  },
  {
    "tanggal": "6-Sep-2026",
    "jamKerja": "0:00",
    "marginJam": "0:00",
    "nonMarginJam": "0:00"
  },
  {
    "tanggal": "7-Sep-2026",
    "jamKerja": "620:09",
    "marginJam": "557:09",
    "nonMarginJam": "63:00"
  },
  {
    "tanggal": "8-Sep-2026",
    "jamKerja": "608:51",
    "marginJam": "516:21",
    "nonMarginJam": "92:30"
  },
  {
    "tanggal": "9-Sep-2026",
    "jamKerja": "597:08",
    "marginJam": "538:38",
    "nonMarginJam": "58:30"
  },
  {
    "tanggal": "10-Sep-2026",
    "jamKerja": "8:00",
    "marginJam": "8:00",
    "nonMarginJam": "0:00"
  },
  {
    "tanggal": "11-Sep-2026",
    "jamKerja": "0:00",
    "marginJam": "0:00",
    "nonMarginJam": "0:00"
  },
  {
    "tanggal": "12-Sep-2026",
    "jamKerja": "0:00",
    "marginJam": "0:00",
    "nonMarginJam": "0:00"
  },
  {
    "tanggal": "13-Sep-2026",
    "jamKerja": "0:00",
    "marginJam": "0:00",
    "nonMarginJam": "0:00"
  },
  {
    "tanggal": "14-Sep-2026",
    "jamKerja": "0:00",
    "marginJam": "0:00",
    "nonMarginJam": "0:00"
  },
  {
    "tanggal": "15-Sep-2026",
    "jamKerja": "0:00",
    "marginJam": "0:00",
    "nonMarginJam": "0:00"
  },
  {
    "tanggal": "16-Sep-2026",
    "jamKerja": "0:00",
    "marginJam": "0:00",
    "nonMarginJam": "0:00"
  },
  {
    "tanggal": "17-Sep-2026",
    "jamKerja": "0:00",
    "marginJam": "0:00",
    "nonMarginJam": "0:00"
  },
  {
    "tanggal": "18-Sep-2026",
    "jamKerja": "0:00",
    "marginJam": "0:00",
    "nonMarginJam": "0:00"
  },
  {
    "tanggal": "19-Sep-2026",
    "jamKerja": "0:00",
    "marginJam": "0:00",
    "nonMarginJam": "0:00"
  },
  {
    "tanggal": "20-Sep-2026",
    "jamKerja": "0:00",
    "marginJam": "0:00",
    "nonMarginJam": "0:00"
  },
  {
    "tanggal": "21-Sep-2026",
    "jamKerja": "0:00",
    "marginJam": "0:00",
    "nonMarginJam": "0:00"
  },
  {
    "tanggal": "22-Sep-2026",
    "jamKerja": "0:00",
    "marginJam": "0:00",
    "nonMarginJam": "0:00"
  },
  {
    "tanggal": "23-Sep-2026",
    "jamKerja": "0:00",
    "marginJam": "0:00",
    "nonMarginJam": "0:00"
  },
  {
    "tanggal": "24-Sep-2026",
    "jamKerja": "0:00",
    "marginJam": "0:00",
    "nonMarginJam": "0:00"
  },
  {
    "tanggal": "25-Sep-2026",
    "jamKerja": "0:00",
    "marginJam": "0:00",
    "nonMarginJam": "0:00"
  },
  {
    "tanggal": "26-Sep-2026",
    "jamKerja": "0:00",
    "marginJam": "0:00",
    "nonMarginJam": "0:00"
  },
  {
    "tanggal": "27-Sep-2026",
    "jamKerja": "0:00",
    "marginJam": "0:00",
    "nonMarginJam": "0:00"
  },
  {
    "tanggal": "28-Sep-2026",
    "jamKerja": "0:00",
    "marginJam": "0:00",
    "nonMarginJam": "0:00"
  },
  {
    "tanggal": "29-Sep-2026",
    "jamKerja": "0:00",
    "marginJam": "0:00",
    "nonMarginJam": "0:00"
  },
  {
    "tanggal": "30-Sep-2026",
    "jamKerja": "0:00",
    "marginJam": "0:00",
    "nonMarginJam": "0:00"
  }
];

export const DAILY_MARGIN_NON_MARGIN_SEPTEMBER: DailyMarginNonMarginItem[] = [
  {
    "tanggal": "1-Sep-2026",
    "marginJam": "536:26",
    "nonMarginJam": "29:00",
    "totalJam": "565:26"
  },
  {
    "tanggal": "2-Sep-2026",
    "marginJam": "511:23",
    "nonMarginJam": "61:30",
    "totalJam": "572:53"
  },
  {
    "tanggal": "3-Sep-2026",
    "marginJam": "496:55",
    "nonMarginJam": "84:00",
    "totalJam": "580:55"
  },
  {
    "tanggal": "4-Sep-2026",
    "marginJam": "525:37",
    "nonMarginJam": "50:30",
    "totalJam": "576:07"
  },
  {
    "tanggal": "5-Sep-2026",
    "marginJam": "284:01",
    "nonMarginJam": "39:00",
    "totalJam": "323:01"
  },
  {
    "tanggal": "6-Sep-2026",
    "marginJam": "0:00",
    "nonMarginJam": "0:00",
    "totalJam": "0:00"
  },
  {
    "tanggal": "7-Sep-2026",
    "marginJam": "557:09",
    "nonMarginJam": "63:00",
    "totalJam": "620:09"
  },
  {
    "tanggal": "8-Sep-2026",
    "marginJam": "516:21",
    "nonMarginJam": "92:30",
    "totalJam": "608:51"
  },
  {
    "tanggal": "9-Sep-2026",
    "marginJam": "538:38",
    "nonMarginJam": "58:30",
    "totalJam": "597:08"
  },
  {
    "tanggal": "10-Sep-2026",
    "marginJam": "8:00",
    "nonMarginJam": "0:00",
    "totalJam": "8:00"
  },
  {
    "tanggal": "11-Sep-2026",
    "marginJam": "0:00",
    "nonMarginJam": "0:00",
    "totalJam": "0:00"
  },
  {
    "tanggal": "12-Sep-2026",
    "marginJam": "0:00",
    "nonMarginJam": "0:00",
    "totalJam": "0:00"
  },
  {
    "tanggal": "13-Sep-2026",
    "marginJam": "0:00",
    "nonMarginJam": "0:00",
    "totalJam": "0:00"
  },
  {
    "tanggal": "14-Sep-2026",
    "marginJam": "0:00",
    "nonMarginJam": "0:00",
    "totalJam": "0:00"
  },
  {
    "tanggal": "15-Sep-2026",
    "marginJam": "0:00",
    "nonMarginJam": "0:00",
    "totalJam": "0:00"
  },
  {
    "tanggal": "16-Sep-2026",
    "marginJam": "0:00",
    "nonMarginJam": "0:00",
    "totalJam": "0:00"
  },
  {
    "tanggal": "17-Sep-2026",
    "marginJam": "0:00",
    "nonMarginJam": "0:00",
    "totalJam": "0:00"
  },
  {
    "tanggal": "18-Sep-2026",
    "marginJam": "0:00",
    "nonMarginJam": "0:00",
    "totalJam": "0:00"
  },
  {
    "tanggal": "19-Sep-2026",
    "marginJam": "0:00",
    "nonMarginJam": "0:00",
    "totalJam": "0:00"
  },
  {
    "tanggal": "20-Sep-2026",
    "marginJam": "0:00",
    "nonMarginJam": "0:00",
    "totalJam": "0:00"
  },
  {
    "tanggal": "21-Sep-2026",
    "marginJam": "0:00",
    "nonMarginJam": "0:00",
    "totalJam": "0:00"
  },
  {
    "tanggal": "22-Sep-2026",
    "marginJam": "0:00",
    "nonMarginJam": "0:00",
    "totalJam": "0:00"
  },
  {
    "tanggal": "23-Sep-2026",
    "marginJam": "0:00",
    "nonMarginJam": "0:00",
    "totalJam": "0:00"
  },
  {
    "tanggal": "24-Sep-2026",
    "marginJam": "0:00",
    "nonMarginJam": "0:00",
    "totalJam": "0:00"
  },
  {
    "tanggal": "25-Sep-2026",
    "marginJam": "0:00",
    "nonMarginJam": "0:00",
    "totalJam": "0:00"
  },
  {
    "tanggal": "26-Sep-2026",
    "marginJam": "0:00",
    "nonMarginJam": "0:00",
    "totalJam": "0:00"
  },
  {
    "tanggal": "27-Sep-2026",
    "marginJam": "0:00",
    "nonMarginJam": "0:00",
    "totalJam": "0:00"
  },
  {
    "tanggal": "28-Sep-2026",
    "marginJam": "0:00",
    "nonMarginJam": "0:00",
    "totalJam": "0:00"
  },
  {
    "tanggal": "29-Sep-2026",
    "marginJam": "0:00",
    "nonMarginJam": "0:00",
    "totalJam": "0:00"
  },
  {
    "tanggal": "30-Sep-2026",
    "marginJam": "0:00",
    "nonMarginJam": "0:00",
    "totalJam": "0:00"
  }
];
