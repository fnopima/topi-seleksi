import { useState } from 'react';
import { ChevronDown, ChevronUp, Minus, Plus, RotateCcw, Sparkles, Square } from 'lucide-react';
import { CeremonyStatus, Gender, SpeedPreset, Student } from '../types/sorting';
import { computeProportionalSizes, DEFAULT_STUDENTS_TEXT } from '../utils/sorting';

interface SetupPanelProps {
  rawStudentsText: string;
  onChangeStudentsText: (value: string) => void;
  parsedStudents: Student[];
  groupCount: number;
  onChangeGroupCount: (count: number) => void;
  speed: SpeedPreset;
  onChangeSpeed: (speed: SpeedPreset) => void;
  status: CeremonyStatus;
  onStart: () => void;
  onStop: () => void;
  onToggleGender: (index: number, student: Student) => void;
}

export function SetupPanel({
  rawStudentsText,
  onChangeStudentsText,
  parsedStudents,
  groupCount,
  onChangeGroupCount,
  speed,
  onChangeSpeed,
  status,
  onStart,
  onStop,
  onToggleGender,
}: SetupPanelProps) {
  const [showGenderEditor, setShowGenderEditor] = useState(false);

  const isSorting = status === 'sorting';
  const maleCount = parsedStudents.filter((s) => s.gender === 'male').length;
  const femaleCount = parsedStudents.filter((s) => s.gender === 'female').length;
  const maxGroups = Math.max(2, Math.min(12, parsedStudents.length || 12));
  const proportionalSizes = computeProportionalSizes(
    parsedStudents.length,
    Math.min(groupCount, Math.max(1, parsedStudents.length))
  );

  const isDefaultText = rawStudentsText.trim() === DEFAULT_STUDENTS_TEXT.trim();

  return (
    <aside className="rounded-xl border border-[#D4AF37]/25 bg-[#131824] p-5 sm:p-6 flex flex-col justify-between gap-5 shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
      <div className="space-y-5">
        {/* Student List Input */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <label
              htmlFor="daftar-murid"
              className="text-sm font-semibold text-[#F6E8C3]"
            >
              Daftar Nama Murid
            </label>
            {!isDefaultText && !isSorting && (
              <button
                type="button"
                onClick={() => onChangeStudentsText(DEFAULT_STUDENTS_TEXT)}
                className="text-xs text-[#D4AF37] hover:text-[#F3E3B4] underline underline-offset-4 cursor-pointer whitespace-nowrap shrink-0"
              >
                Kembalikan Default
              </button>
            )}
          </div>

          <textarea
            id="daftar-murid"
            value={rawStudentsText}
            onChange={(e) => onChangeStudentsText(e.target.value)}
            disabled={isSorting}
            rows={9}
            placeholder="Masukkan satu nama murid per baris..."
            className="w-full rounded-lg border border-[#D4AF37]/25 bg-[#0B0F17] px-3.5 py-3 text-sm text-[#F5EFE2] placeholder-[#6B7280] leading-relaxed focus:border-[#D4AF37] focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed hogwarts-scroll resize-y"
          />

          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-[#B8C0D0]">
            <span className="font-mono-num">
              {parsedStudents.length} murid · {maleCount} Laki-laki · {femaleCount} Perempuan
            </span>
            {parsedStudents.length > 0 && (
              <button
                type="button"
                onClick={() => setShowGenderEditor((prev) => !prev)}
                disabled={isSorting}
                className="inline-flex items-center gap-1 text-[#E5C158] hover:text-[#F6E8C3] disabled:opacity-50 cursor-pointer whitespace-nowrap shrink-0"
              >
                <span>Atur Gender</span>
                {showGenderEditor ? (
                  <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
                )}
              </button>
            )}
          </div>

          {showGenderEditor && parsedStudents.length > 0 && (
            <div className="mt-3 rounded-lg border border-[#D4AF37]/20 bg-[#0B0F17] p-3 max-h-44 overflow-y-auto hogwarts-scroll space-y-1.5">
              <p className="text-xs text-[#9AA3B5] mb-2">
                Klik tombol L / P untuk menyesuaikan animasi murid bila nama tanpa awalan Mr./Ms.
              </p>
              {parsedStudents.map((student, idx) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between gap-2 text-xs py-1 px-2 rounded bg-[#141A26]"
                >
                  <span className="text-[#F5EFE2] truncate">{student.name}</span>
                  <button
                    type="button"
                    disabled={isSorting}
                    onClick={() => onToggleGender(idx, student)}
                    className="px-2.5 py-1 rounded border border-[#D4AF37]/30 bg-[#1B2333] text-[#E5C158] hover:bg-[#253045] font-medium whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    {student.gender === 'male' ? 'L · Laki-laki' : 'P · Perempuan'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Group Count Input */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <label
              htmlFor="jumlah-kelompok"
              className="text-sm font-semibold text-[#F6E8C3]"
            >
              Jumlah Kelompok
            </label>
            {parsedStudents.length > 0 && (
              <span className="font-mono-num text-xs text-[#B8C0D0]">
                {proportionalSizes.join(' · ')} murid
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onChangeGroupCount(Math.max(2, groupCount - 1))}
              disabled={isSorting || groupCount <= 2}
              aria-label="Kurangi jumlah kelompok"
              className="h-10 w-10 rounded-lg border border-[#D4AF37]/25 bg-[#0B0F17] flex items-center justify-center text-[#F5EFE2] hover:bg-[#1A2130] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0 cursor-pointer"
            >
              <Minus className="w-4 h-4" aria-hidden="true" />
            </button>

            <input
              id="jumlah-kelompok"
              type="number"
              min={2}
              max={maxGroups}
              value={groupCount}
              disabled={isSorting}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!Number.isNaN(val)) {
                  onChangeGroupCount(Math.max(2, Math.min(maxGroups, val)));
                }
              }}
              className="h-10 flex-1 rounded-lg border border-[#D4AF37]/25 bg-[#0B0F17] px-3 text-center font-mono-num text-base font-semibold text-[#F5EFE2] focus:border-[#D4AF37] focus:outline-none disabled:opacity-60"
            />

            <button
              type="button"
              onClick={() => onChangeGroupCount(Math.min(maxGroups, groupCount + 1))}
              disabled={isSorting || groupCount >= maxGroups}
              aria-label="Tambah jumlah kelompok"
              className="h-10 w-10 rounded-lg border border-[#D4AF37]/25 bg-[#0B0F17] flex items-center justify-center text-[#F5EFE2] hover:bg-[#1A2130] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Animation Speed Control */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-sm font-semibold text-[#F6E8C3]">
              Kecepatan Seleksi
            </span>
            <span className="font-mono-num text-xs text-[#B8C0D0]">
              {speed === 'lambat'
                ? '3 detik / nama'
                : speed === 'sedang'
                  ? '1,9 detik / nama'
                  : speed === 'cepat'
                    ? '1,2 detik / nama'
                    : '0,6 detik / nama'}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1 p-1 rounded-lg bg-[#0B0F17] border border-[#D4AF37]/20">
            {(
              [
                { id: 'kilat', label: 'Kilat' },
                { id: 'cepat', label: 'Cepat' },
                { id: 'sedang', label: 'Sedang' },
                { id: 'lambat', label: 'Lambat' },
              ] as const
            ).map((option) => (
              <button
                key={option.id}
                type="button"
                disabled={isSorting}
                onClick={() => onChangeSpeed(option.id)}
                className={`py-2 px-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:cursor-not-allowed ${
                  speed === option.id
                    ? 'bg-[#D4AF37] text-[#141008] font-semibold'
                    : 'text-[#C7C1B2] hover:text-[#F5EFE2]'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Primary Action Controls */}
      <div className="pt-2 space-y-2">
        {parsedStudents.length < 2 && (
          <p className="text-xs text-[#FCA5A5]">
            Masukkan minimal 2 nama murid untuk memulai pembagian kelompok.
          </p>
        )}

        {!isSorting ? (
          <button
            type="button"
            onClick={onStart}
            disabled={parsedStudents.length < 2}
            className="w-full h-11 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#D4AF37] text-[#141008] font-semibold text-sm hover:bg-[#E5C158] disabled:opacity-45 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-[0_4px_18px_rgba(212,175,55,0.28)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F6E8C3]"
          >
            {status === 'completed' ? (
              <>
                <RotateCcw className="w-4 h-4" aria-hidden="true" />
                <span>Mulai Seleksi Lagi</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" aria-hidden="true" />
                <span>Mulai Seleksi</span>
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={onStop}
            className="w-full h-11 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-[#DC4A3D]/50 bg-[#9E2A2B]/25 text-[#FCA5A5] font-semibold text-sm hover:bg-[#9E2A2B]/40 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Square className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
            <span>Hentikan Seleksi</span>
          </button>
        )}
      </div>
    </aside>
  );
}
