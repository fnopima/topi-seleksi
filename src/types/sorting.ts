export type Gender = 'male' | 'female';

export interface Student {
  id: string;
  name: string;
  gender: Gender;
}

export interface SortingAssignment {
  student: Student;
  groupNumber: number; // 1-indexed (Kelompok 1, Kelompok 2, ...)
}

export type CeremonyStatus = 'idle' | 'sorting' | 'completed';

export type StepPhase = 'entering' | 'thinking' | 'revealed';

export type SpeedPreset = 'kilat' | 'cepat' | 'sedang' | 'lambat';

export interface GroupTheme {
  groupNumber: number;
  title: string;
  accentHex: string;
  surfaceTint: string;
  borderTint: string;
  badgeText: string;
  crestKind: 'flame' | 'serpent' | 'feather' | 'shield' | 'star' | 'crown';
}
