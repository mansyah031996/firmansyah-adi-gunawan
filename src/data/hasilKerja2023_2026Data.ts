import { HasilKerjaAgustusRecord } from '../types';
import rawRecords from './hasilKerja2023_2026Records.json';

export interface HasilKerjaMultiYearRecord extends Omit<HasilKerjaAgustusRecord, 'start' | 'estimasi' | 'finish' | 'breakTime'> {
  start?: string;
  estimasi?: string;
  breakTime?: string;
  finish?: string;
  tahun?: string;
}

export const INITIAL_HASIL_KERJA_2023_2026: HasilKerjaMultiYearRecord[] = rawRecords as HasilKerjaMultiYearRecord[];
