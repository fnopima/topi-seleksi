import { Gender, GroupTheme, SortingAssignment, Student } from '../types/sorting';

export const DEFAULT_STUDENTS_TEXT = [
  'Ms. Revina',
  'Ms. Isti',
  'Ms. Arti',
  'Ms. Jessica',
  'Mr. Handi',
  'Ms. Karina',
  'Ms. Nadyah',
  'Mr. Fadli',
  'Ms. Mira',
  'Ms. Astika',
  'Mr. Agung',
  'Ms. Wida',
  'Mr. Fahmi',
].join('\n');

export const DEFAULT_GROUP_COUNT = 3;

const MALE_PREFIX_REGEX = /^(mr\.?|bpk\.?|bapak|pak|mas|bang|akang|kang|tn\.?|tuan|sdr\.?)\s+/i;
const FEMALE_PREFIX_REGEX = /^(ms\.?|mrs\.?|miss|ibu|bu|mbak|teteh|teh|ny\.?|nyonya|sdri\.?)\s+/i;

const MALE_NAME_HINTS = new Set([
  'handi', 'fadli', 'agung', 'fahmi', 'budi', 'andi', 'ahmad', 'rizky', 'rizki',
  'dimas', 'bayu', 'agus', 'wahyu', 'eka', 'adi', 'putra', 'ilham', 'fajar',
  'rendi', 'hendra', 'yusuf', 'arif', 'dani', 'eko', 'hari', 'joko', 'rudi',
  'bagus', 'galih', 'iqbal', 'kevin', 'yoga', 'daffa', 'rafi', 'rehan', 'teguh',
]);

const FEMALE_NAME_HINTS = new Set([
  'revina', 'isti', 'arti', 'jessica', 'karina', 'nadyah', 'nadya', 'mira',
  'astika', 'wida', 'siti', 'dewi', 'putri', 'rina', 'sari', 'ayu', 'rani',
  'dina', 'fitri', 'indah', 'nia', 'ratna', 'tari', 'yuni', 'maya', 'anisa',
  'nisa', 'lia', 'citra', 'tiara', 'intan', 'wulan', 'shinta', 'sinta', 'amel',
]);

export function detectGenderFromName(rawName: string): Gender {
  const trimmed = rawName.trim();

  // Explicit tag support e.g. "Budi (L)" or "Sari (P)"
  if (/\((l|laki-laki|male|m)\)$/i.test(trimmed)) return 'male';
  if (/\((p|perempuan|female|f|w)\)$/i.test(trimmed)) return 'female';

  if (MALE_PREFIX_REGEX.test(trimmed)) return 'male';
  if (FEMALE_PREFIX_REGEX.test(trimmed)) return 'female';

  const tokens = trimmed
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  for (const token of tokens) {
    if (MALE_NAME_HINTS.has(token)) return 'male';
    if (FEMALE_NAME_HINTS.has(token)) return 'female';
  }

  // Soft Indonesian vowel ending heuristic when no prefix/hint matches
  const firstWord = tokens[0] ?? '';
  if (firstWord.endsWith('a') || firstWord.endsWith('i') || firstWord.endsWith('ah')) {
    return 'female';
  }
  return 'male';
}

export function cleanStudentDisplayName(rawName: string): string {
  return rawName
    .trim()
    .replace(/\s*\((l|p|laki-laki|perempuan|male|female|m|f|w)\)$/i, '')
    .trim();
}

export function parseStudents(
  rawText: string,
  genderOverrides: Record<string, Gender>
): Student[] {
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  return lines.map((line, index) => {
    const cleanName = cleanStudentDisplayName(line);
    const overrideKey = `${index}:${cleanName.toLowerCase()}`;
    const detected = detectGenderFromName(line);
    return {
      id: `student-${index}-${cleanName.toLowerCase().replace(/\s+/g, '-')}`,
      name: cleanName,
      gender: genderOverrides[overrideKey] ?? detected,
    };
  });
}

function getCryptoRandomInt(maxExclusive: number): number {
  if (maxExclusive <= 1) return 0;
  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    const array = new Uint32Array(1);
    const limit = Math.floor(0xffffffff / maxExclusive) * maxExclusive;
    let rand = 0;
    do {
      window.crypto.getRandomValues(array);
      rand = array[0];
    } while (rand >= limit);
    return rand % maxExclusive;
  }
  return Math.floor(Math.random() * maxExclusive);
}

export function shuffleArray<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = getCryptoRandomInt(i + 1);
    const temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }
  return copy;
}

export function computeProportionalSizes(totalStudents: number, groupCount: number): number[] {
  if (groupCount <= 0) return [];
  const base = Math.floor(totalStudents / groupCount);
  const remainder = totalStudents % groupCount;
  return Array.from({ length: groupCount }, (_, i) => (i < remainder ? base + 1 : base));
}

function buildSignature(assignments: SortingAssignment[], groupCount: number): string {
  const buckets: string[][] = Array.from({ length: groupCount }, () => []);
  for (const item of assignments) {
    buckets[item.groupNumber - 1].push(item.student.name);
  }
  return buckets.map((bucket) => [...bucket].sort().join(',')).join('|');
}

export function generateProportionalSorting(
  students: Student[],
  groupCount: number,
  previousSignature?: string | null
): { queue: SortingAssignment[]; signature: string } {
  const safeGroupCount = Math.max(1, Math.min(groupCount, Math.max(1, students.length)));
  const base = Math.floor(students.length / safeGroupCount);
  const remainder = students.length % safeGroupCount;

  const attemptSort = (): { queue: SortingAssignment[]; signature: string } => {
    const shuffledStudents = shuffleArray(students);
    // Shuffle which groups receive the +1 remainder member so it varies every game
    const groupNumbers = shuffleArray(
      Array.from({ length: safeGroupCount }, (_, idx) => idx + 1)
    );

    const groupSlotPool: number[] = [];
    groupNumbers.forEach((groupNumber, idx) => {
      const targetSize = idx < remainder ? base + 1 : base;
      for (let s = 0; s < targetSize; s++) {
        groupSlotPool.push(groupNumber);
      }
    });

    // Shuffle the calling-slot mapping so students are announced in random order
    // AND their assigned group numbers appear unpredictably while keeping exact proportional totals!
    const shuffledSlots = shuffleArray(groupSlotPool);

    const queue: SortingAssignment[] = shuffledStudents.map((student, index) => ({
      student,
      groupNumber: shuffledSlots[index],
    }));

    return {
      queue,
      signature: buildSignature(queue, safeGroupCount),
    };
  };

  let result = attemptSort();
  if (previousSignature && students.length >= 2 && safeGroupCount >= 2) {
    let attempts = 0;
    while (result.signature === previousSignature && attempts < 12) {
      result = attemptSort();
      attempts++;
    }
  }

  return result;
}

const HOUSE_PALETTE: Omit<GroupTheme, 'groupNumber' | 'title'>[] = [
  {
    accentHex: '#DC4A3D',
    surfaceTint: 'rgba(158, 42, 43, 0.16)',
    borderTint: 'rgba(220, 74, 61, 0.36)',
    badgeText: '#FCA5A5',
    crestKind: 'flame',
  },
  {
    accentHex: '#2EAD76',
    surfaceTint: 'rgba(27, 107, 74, 0.17)',
    borderTint: 'rgba(46, 173, 118, 0.36)',
    badgeText: '#6EE7B7',
    crestKind: 'serpent',
  },
  {
    accentHex: '#4B8CE8',
    surfaceTint: 'rgba(29, 78, 137, 0.18)',
    borderTint: 'rgba(75, 140, 232, 0.36)',
    badgeText: '#93C5FD',
    crestKind: 'feather',
  },
  {
    accentHex: '#E0A12E',
    surfaceTint: 'rgba(180, 123, 21, 0.17)',
    borderTint: 'rgba(224, 161, 46, 0.36)',
    badgeText: '#FCD34D',
    crestKind: 'shield',
  },
  {
    accentHex: '#B678E3',
    surfaceTint: 'rgba(109, 59, 142, 0.18)',
    borderTint: 'rgba(182, 120, 227, 0.36)',
    badgeText: '#D8B4FE',
    crestKind: 'star',
  },
  {
    accentHex: '#DE854E',
    surfaceTint: 'rgba(156, 82, 33, 0.17)',
    borderTint: 'rgba(222, 133, 78, 0.36)',
    badgeText: '#FDBA74',
    crestKind: 'crown',
  },
];

export function getGroupTheme(groupNumber: number): GroupTheme {
  const palette = HOUSE_PALETTE[(groupNumber - 1) % HOUSE_PALETTE.length];
  return {
    groupNumber,
    title: `Kelompok ${groupNumber}`,
    ...palette,
  };
}
