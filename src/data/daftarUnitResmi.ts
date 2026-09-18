/**
 * DAFTAR UNIT RESMI RESTORASI SM (2023 - 2026)
 * Daftar standar 51 unit restorasi untuk dropdown pemilihan unit agar terhindar dari
 * kesalahan pengetikan nama dan menjamin penarikan data dari 4 Google Spreadsheet 100% akurat.
 */

export const DAFTAR_UNIT_RESMI: string[] = [
  "CHEVROLET Mr. NYOMAN",
  "JAGUAR XK120 Mr. JAMES",
  "JAGUAR XK120 Mr. JAMES ( JOBDESC KHUSUS )",
  "MB 190 SL Mr. ADRIAN",
  "MB 300 CE Mr. DIKO",
  "MB 500 SEC Mr. DIKO",
  "MB BATMAN Mr. ICHSAN",
  "MB E320 SPORTLINE SILVER Mr. DIKO",
  "MB GROSSER Mr. INDRA",
  "MB MPS Mr. DIKO",
  "MB PAGODA Mr. DIDI",
  "MB PONTON 220 S Mr. SANTOSO",
  "MB R129 Mr. DIKO",
  "MB W 111 KEBO Mr. INDRA",
  "MB 280 GE Mr. ABONG",
  "PORSCHE 911 Mr. HANDY",
  "PORSCHE 930 Mr. ADRIAN",
  "PORSCHE 993 Mr. ADRIAN",
  "MB MASTERPIECE NEW Mr. DIKO",
  "FERRARI F355 Mrs. NINA",
  "MB 500 SEL Mrs. NINA",
  "MB 280 SLC Mr. MUSA",
  "MB 500 SL Mr. MALIQ",
  "MB 280 TE Mr. JOKO",
  "MB 560 SEC Mrs. NINA",
  "MB R129 Mr. ANDREW",
  "MB R107 Mrs. NINA",
  "ALL UNIT",
  "BMW 530 I Mr. MARTHIN",
  "KIJANG INNOVA Mr. STANLEY",
  "BMW 750 IL BARU Mr. STANLEY",
  "BMW 750 IL LAMA Mr. STANLEY",
  "HARLEY Mr. STANLEY",
  "HONDA CR-V Mr. MARTHIN",
  "HONDA N360 Mr. ERIC",
  "KIJANG SM",
  "MB E320 NEW EYES Mr. MARTHIN",
  "MB R 230 Mr. STANLEY",
  "JUPITER Mr. MARTHIN",
  "MB W 111 KEBO SM",
  "MB W111 KEBO Mr. PRAM",
  "MB W124 E320 SPORTLINE Mr. MARTHIN",
  "VW BEETLE Mr. RICHARD",
  "PORSCHE 944 Mr. PRAM",
  "TOYOTA MARK X Mr. MARTHIN",
  "PEUGEOT 504 BIRU Mr. MARTHIN",
  "RR Mr. STANLEY",
  "SUZUKI NEX Mr. MARTHIN",
  "MB PULLMAN Mr. ILHAM",
  "YAMAHA N MAX Mr. MARTHIN",
  "MB 280 GE Mr. ANDERSON",
];

export interface UnitCategoryGroup {
  category: string;
  units: string[];
}

/**
 * Pengelompokan unit berdasarkan Merk / Kategori untuk optgroup dropdown
 */
export const DAFTAR_UNIT_TERKELOMPOK: UnitCategoryGroup[] = [
  {
    category: "MERCEDES-BENZ (MB)",
    units: [
      "MB 190 SL Mr. ADRIAN",
      "MB 280 GE Mr. ABONG",
      "MB 280 GE Mr. ANDERSON",
      "MB 280 SLC Mr. MUSA",
      "MB 280 TE Mr. JOKO",
      "MB 300 CE Mr. DIKO",
      "MB 500 SEC Mr. DIKO",
      "MB 500 SEL Mrs. NINA",
      "MB 500 SL Mr. MALIQ",
      "MB 560 SEC Mrs. NINA",
      "MB BATMAN Mr. ICHSAN",
      "MB E320 NEW EYES Mr. MARTHIN",
      "MB E320 SPORTLINE SILVER Mr. DIKO",
      "MB GROSSER Mr. INDRA",
      "MB MASTERPIECE NEW Mr. DIKO",
      "MB MPS Mr. DIKO",
      "MB PAGODA Mr. DIDI",
      "MB PONTON 220 S Mr. SANTOSO",
      "MB PULLMAN Mr. ILHAM",
      "MB R 230 Mr. STANLEY",
      "MB R107 Mrs. NINA",
      "MB R129 Mr. ANDREW",
      "MB R129 Mr. DIKO",
      "MB W 111 KEBO Mr. INDRA",
      "MB W 111 KEBO SM",
      "MB W111 KEBO Mr. PRAM",
      "MB W124 E320 SPORTLINE Mr. MARTHIN",
    ],
  },
  {
    category: "JAGUAR",
    units: [
      "JAGUAR XK120 Mr. JAMES",
      "JAGUAR XK120 Mr. JAMES ( JOBDESC KHUSUS )",
    ],
  },
  {
    category: "PORSCHE",
    units: [
      "PORSCHE 911 Mr. HANDY",
      "PORSCHE 930 Mr. ADRIAN",
      "PORSCHE 944 Mr. PRAM",
      "PORSCHE 993 Mr. ADRIAN",
    ],
  },
  {
    category: "BMW & ROLLS-ROYCE",
    units: [
      "BMW 530 I Mr. MARTHIN",
      "BMW 750 IL BARU Mr. STANLEY",
      "BMW 750 IL LAMA Mr. STANLEY",
      "RR Mr. STANLEY",
    ],
  },
  {
    category: "FERRARI & PEUGEOT",
    units: [
      "FERRARI F355 Mrs. NINA",
      "PEUGEOT 504 BIRU Mr. MARTHIN",
    ],
  },
  {
    category: "CHEVROLET & VW",
    units: [
      "CHEVROLET Mr. NYOMAN",
      "VW BEETLE Mr. RICHARD",
    ],
  },
  {
    category: "TOYOTA & HONDA",
    units: [
      "HONDA CR-V Mr. MARTHIN",
      "HONDA N360 Mr. ERIC",
      "KIJANG INNOVA Mr. STANLEY",
      "KIJANG SM",
      "TOYOTA MARK X Mr. MARTHIN",
    ],
  },
  {
    category: "RODA DUA / MOTORCYCLES",
    units: [
      "HARLEY Mr. STANLEY",
      "JUPITER Mr. MARTHIN",
      "SUZUKI NEX Mr. MARTHIN",
      "YAMAHA N MAX Mr. MARTHIN",
    ],
  },
  {
    category: "UMUM & KONTRAK",
    units: [
      "ALL UNIT",
    ],
  },
];
