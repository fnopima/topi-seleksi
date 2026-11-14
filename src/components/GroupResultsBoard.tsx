import { useState } from 'react';
import { motion } from 'motion/react';
import { Check, Copy, Crown, Feather, Flame, Shield, Sparkles, Star } from 'lucide-react';
import { CeremonyStatus, GroupTheme, Student } from '../types/sorting';
import { computeProportionalSizes, getGroupTheme } from '../utils/sorting';

interface GroupResultsBoardProps {
  groupCount: number;
  assignedGroups: Record<number, Student[]>;
  totalStudents: number;
  status: CeremonyStatus;
}

function CrestIcon({ kind, color }: { kind: GroupTheme['crestKind']; color: string }) {
  const props = { className: 'w-4 h-4 shrink-0', style: { color }, 'aria-hidden': true as const };
  switch (kind) {
    case 'flame':
      return <Flame {...props} />;
    case 'serpent':
      return <Sparkles {...props} />;
    case 'feather':
      return <Feather {...props} />;
    case 'shield':
      return <Shield {...props} />;
    case 'star':
      return <Star {...props} />;
    case 'crown':
      return <Crown {...props} />;
  }
}

export function GroupResultsBoard({
  groupCount,
  assignedGroups,
  totalStudents,
  status,
}: GroupResultsBoardProps) {
  const [copied, setCopied] = useState(false);

  const safeGroupCount = Math.max(1, groupCount);
  const groupNumbers = Array.from({ length: safeGroupCount }, (_, i) => i + 1);
  const targetSizes = computeProportionalSizes(totalStudents, safeGroupCount);

  const totalAssigned = groupNumbers.reduce(
    (sum, num) => sum + (assignedGroups[num]?.length ?? 0),
    0
  );

  const handleCopyResults = async () => {
    const lines: string[] = [
      'Pembagian Kelompok Teaching Demo',
      'PKG-MBI SDN Suryakencana CBM',
      '',
    ];
    for (const num of groupNumbers) {
      const members = assignedGroups[num] ?? [];
      lines.push(`Kelompok ${num} (${members.length} murid):`);
      members.forEach((m, idx) => {
        lines.push(`${idx + 1}. ${m.name}`);
      });
      lines.push('');
    }
    try {
      await navigator.clipboard.writeText(lines.join('\n').trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard failures in restricted environments
    }
  };

  const gridColsClass =
    safeGroupCount === 1
      ? 'grid-cols-1 max-w-xl'
      : safeGroupCount === 2
        ? 'grid-cols-1 md:grid-cols-2'
        : safeGroupCount === 4
          ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4'
          : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

  return (
    <section
      aria-label="Hasil Pembagian Kelompok"
      className="mt-8 pt-7 border-t border-[#D4AF37]/20"
    >
      <div className="flex flex-wrap items-end justify-between gap-4 mb-5">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-[#F6E8C3] tracking-wide">
            Daftar Nama Per Kelompok
          </h2>
          <p className="text-xs sm:text-sm text-[#B8C0D0] mt-1">
            <span className="font-mono-num">{totalAssigned}</span> dari{' '}
            <span className="font-mono-num">{totalStudents}</span> murid telah ditempatkan
            <span aria-hidden="true"> · </span>
            <span>Distribusi target: {targetSizes.join(', ')} murid</span>
          </p>
        </div>

        {totalAssigned > 0 && (
          <button
            type="button"
            onClick={handleCopyResults}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#D4AF37]/35 bg-[#141A26] text-xs sm:text-sm font-medium text-[#F3E3B4] hover:bg-[#1D2536] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E5C158]"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-[#6EE7B7]" aria-hidden="true" />
                <span>Tersalin</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" aria-hidden="true" />
                <span>Salin Hasil</span>
              </>
            )}
          </button>
        )}
      </div>

      <div className={`grid gap-4 ${gridColsClass}`}>
        {groupNumbers.map((groupNum) => {
          const theme = getGroupTheme(groupNum);
          const members = assignedGroups[groupNum] ?? [];

          return (
            <div
              key={groupNum}
              className="rounded-xl border bg-[#131824] p-5 flex flex-col justify-between transition-colors duration-200"
              style={{
                borderColor: members.length > 0 ? theme.borderTint : 'rgba(212, 175, 55, 0.16)',
              }}
            >
              <div>
                {/* Group Card Header */}
                <div
                  className="flex items-center justify-between gap-3 pb-3 mb-3 border-b"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: theme.surfaceTint }}
                    >
                      <CrestIcon kind={theme.crestKind} color={theme.badgeText} />
                    </div>
                    <h3
                      className="font-display text-lg font-bold tracking-wide truncate"
                      style={{ color: theme.badgeText }}
                    >
                      {theme.title}
                    </h3>
                  </div>

                  <span className="font-mono-num text-xs font-medium text-[#C7C1B2] whitespace-nowrap shrink-0">
                    {members.length} murid
                  </span>
                </div>

                {/* Group Members List */}
                {members.length === 0 ? (
                  <p className="text-xs sm:text-sm text-[#7D8596] py-4 text-center">
                    {status === 'sorting'
                      ? 'Menunggu panggilan Topi Seleksi...'
                      : 'Belum ada anggota terpilih'}
                  </p>
                ) : (
                  <ol className="space-y-2">
                    {members.map((student, idx) => (
                      <motion.li
                        key={student.id}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                        className="flex items-center justify-between gap-3 py-1.5 px-2.5 rounded-lg bg-[#1A2130]/75 border border-white/[0.04]"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="font-mono-num text-xs text-[#9AA3B5] w-5 shrink-0">
                            {idx + 1}.
                          </span>
                          <span className="text-sm font-medium text-[#F5EFE2] truncate">
                            {student.name}
                          </span>
                        </div>
                        <span className="text-xs text-[#9AA3B5] whitespace-nowrap shrink-0">
                          {student.gender === 'male' ? 'Laki-laki' : 'Perempuan'}
                        </span>
                      </motion.li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
