import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { FastForward, RotateCcw, Sparkles, User, Users } from 'lucide-react';
import stageBackdropImg from '../assets/images/hogwarts_great_hall_stage_1794636160191.jpg';
import sortingHatCrestImg from '../assets/images/sorting_hat_crest_1794636161504.jpg';
import wizardBoyImg from '../assets/images/wizard_boy_student_1794636160702.jpg';
import wizardGirlImg from '../assets/images/wizard_girl_student_1794636161833.jpg';
import { CeremonyStatus, SortingAssignment, StepPhase } from '../types/sorting';
import { getGroupTheme } from '../utils/sorting';
import { SortingHatSvg } from './SortingHatSvg';

interface SortingStageProps {
  status: CeremonyStatus;
  currentAssignment: SortingAssignment | null;
  currentIndex: number;
  totalStudents: number;
  groupCount: number;
  stepPhase: StepPhase;
  onSkipToEnd: () => void;
  onReshuffle: () => void;
  onStart: () => void;
  canStart: boolean;
}

export function SortingStage({
  status,
  currentAssignment,
  currentIndex,
  totalStudents,
  groupCount,
  stepPhase,
  onSkipToEnd,
  onReshuffle,
  onStart,
  canStart,
}: SortingStageProps) {
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const markImgError = (key: string) => {
    setImgErrors((prev) => ({ ...prev, [key]: true }));
  };

  const progressPercent =
    totalStudents > 0
      ? Math.min(100, Math.round(((currentIndex + (stepPhase === 'revealed' ? 1 : 0.4)) / totalStudents) * 100))
      : 0;

  const activeTheme = currentAssignment
    ? getGroupTheme(currentAssignment.groupNumber)
    : null;

  return (
    <div className="relative overflow-hidden rounded-xl border border-[#D4AF37]/25 bg-[#121722] min-h-[460px] sm:min-h-[510px] flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.45)]">
      {/* Hogwarts Great Hall Atmospheric Backdrop */}
      {!imgErrors.backdrop && (
        <img
          src={stageBackdropImg}
          alt="Panggung Aula Besar Hogwarts"
          referrerPolicy="no-referrer"
          onError={() => markImgError('backdrop')}
          className="absolute inset-0 h-full w-full object-cover object-center opacity-45"
        />
      )}
      <div
        className="absolute inset-0 bg-gradient-to-t from-[#0B0F17] via-[#0B0F17]/65 to-[#0B0F17]/80"
        aria-hidden="true"
      />

      {/* Top Stage Header Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-[#D4AF37]/15 bg-[#0B0F17]/55 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-[#D6CEBC]">
          <span className="font-display text-[#E5C158] tracking-wide">Aula Seleksi</span>
          <span aria-hidden="true" className="text-[#D4AF37]/50">·</span>
          {status === 'idle' && (
            <span className="font-mono-num">{totalStudents} murid · {groupCount} kelompok</span>
          )}
          {status === 'sorting' && (
            <span className="font-mono-num">
              Giliran {Math.min(currentIndex + 1, totalStudents)} dari {totalStudents}
            </span>
          )}
          {status === 'completed' && (
            <span className="font-mono-num text-[#6EE7B7]">
              Selesai · {totalStudents} murid terbagi ke {groupCount} kelompok
            </span>
          )}
        </div>

        {status === 'sorting' && (
          <button
            type="button"
            onClick={onSkipToEnd}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D4AF37]/35 bg-[#1A2130]/90 text-xs font-medium text-[#F3E3B4] hover:bg-[#242D40] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E5C158]"
          >
            <FastForward className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Lewati Animasi</span>
          </button>
        )}
      </div>

      {/* Progress Bar (Active Sorting Only) */}
      {status === 'sorting' && (
        <div className="relative z-10 w-full h-1 bg-[#1A2130]" aria-hidden="true">
          <div
            className="h-full bg-gradient-to-r from-[#B8860B] via-[#E5C158] to-[#F7DF9C] transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* Main Ceremonial Center Stage */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 py-6 text-center">
        {status === 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col items-center max-w-md mx-auto"
          >
            <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full overflow-hidden border-2 border-[#D4AF37]/45 shadow-[0_0_40px_rgba(212,175,55,0.18)] mb-5 bg-[#141A26]">
              {!imgErrors.hatCrest ? (
                <img
                  src={sortingHatCrestImg}
                  alt="Ilustrasi Topi Seleksi Hogwarts"
                  referrerPolicy="no-referrer"
                  onError={() => markImgError('hatCrest')}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#182030] text-[#E5C158]">
                  <Sparkles className="w-12 h-12" aria-hidden="true" />
                </div>
              )}
            </div>

            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#F6E8C3] tracking-wide mb-2 text-balance">
              Upacara Topi Seleksi Siap Dimulai
            </h2>
            <p className="text-sm text-[#C7C1B2] leading-relaxed mb-5">
              Periksa daftar nama murid dan jumlah kelompok di panel kiri, lalu tekan tombol{' '}
              <strong className="text-[#E5C158] font-semibold">Mulai Seleksi</strong> untuk
              memanggil setiap murid ke depan secara acak dan proporsional.
            </p>

            <button
              type="button"
              onClick={onStart}
              disabled={!canStart}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-[#D4AF37] text-[#141008] font-semibold text-sm hover:bg-[#E5C158] disabled:opacity-45 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-[0_4px_20px_rgba(212,175,55,0.3)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F6E8C3]"
            >
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              <span>Mulai Seleksi</span>
            </button>
          </motion.div>
        )}

        {status === 'sorting' && currentAssignment && (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentAssignment.student.id + '-' + currentIndex}
              initial={{ opacity: 0, y: 14, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.96 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center w-full max-w-md mx-auto"
            >
              {/* Arched Gothic Portrait + Animated Sorting Hat Overlay */}
              <div className="relative pt-12 pb-2 flex flex-col items-center">
                {/* Animated Sorting Hat perched right onto student's head */}
                <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2 z-20">
                  <SortingHatSvg
                    phase={stepPhase}
                    accentColor={activeTheme?.accentHex ?? '#D4AF37'}
                  />
                </div>

                {/* Arched Character Portrait Frame */}
                <div
                  className="relative w-44 h-56 sm:w-52 sm:h-64 rounded-t-full rounded-b-xl overflow-hidden border-2 bg-[#141A26] transition-colors duration-200"
                  style={{
                    borderColor:
                      stepPhase === 'revealed' && activeTheme
                        ? activeTheme.accentHex
                        : 'rgba(212, 175, 55, 0.5)',
                    boxShadow:
                      stepPhase === 'revealed' && activeTheme
                        ? `0 0 36px ${activeTheme.accentHex}40`
                        : '0 12px 32px rgba(0, 0, 0, 0.65)',
                  }}
                >
                  {currentAssignment.student.gender === 'male' ? (
                    !imgErrors.boy ? (
                      <img
                        src={wizardBoyImg}
                        alt={`Animasi murid laki-laki untuk ${currentAssignment.student.name}`}
                        referrerPolicy="no-referrer"
                        onError={() => markImgError('boy')}
                        className="w-full h-full object-cover object-top scale-[1.03]"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-[#182132] text-[#E5C158] gap-2">
                        <User className="w-12 h-12" aria-hidden="true" />
                        <span className="text-xs">Murid Laki-laki</span>
                      </div>
                    )
                  ) : !imgErrors.girl ? (
                    <img
                      src={wizardGirlImg}
                      alt={`Animasi murid perempuan untuk ${currentAssignment.student.name}`}
                      referrerPolicy="no-referrer"
                      onError={() => markImgError('girl')}
                      className="w-full h-full object-cover object-top scale-[1.09]"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-[#182132] text-[#E5C158] gap-2">
                      <User className="w-12 h-12" aria-hidden="true" />
                      <span className="text-xs">Murid Perempuan</span>
                    </div>
                  )}

                  {/* Subtle bottom gradient inside portrait for polish */}
                  <div
                    className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#0B0F17]/80 to-transparent"
                    aria-hidden="true"
                  />
                </div>
              </div>

              {/* Student Nameplate & Gender Descriptor */}
              <div className="mt-2">
                <p className="text-xs font-medium tracking-wide text-[#C7C1B2]">
                  Dipanggil ke Depan ·{' '}
                  {currentAssignment.student.gender === 'male'
                    ? 'Murid Laki-laki'
                    : 'Murid Perempuan'}
                </p>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#FAF2DF] mt-1 tracking-wide">
                  {currentAssignment.student.name}
                </h3>
              </div>

              {/* Sorting Hat Decision Announcement Box */}
              <div className="mt-4 min-h-[60px] flex items-center justify-center w-full">
                {stepPhase === 'entering' && (
                  <p className="text-sm text-[#D6CEBC]">
                    Melangkah maju menuju kursi seleksi...
                  </p>
                )}
                {stepPhase === 'thinking' && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm sm:text-base font-medium text-[#E5C158]"
                  >
                    Topi Seleksi sedang membaca bakat &amp; menentukan kelompok...
                  </motion.p>
                )}
                {stepPhase === 'revealed' && activeTheme && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="inline-flex items-center gap-3 px-5 py-2.5 rounded-lg border shadow-lg"
                    style={{
                      backgroundColor: activeTheme.surfaceTint,
                      borderColor: activeTheme.borderTint,
                    }}
                  >
                    <span className="text-sm text-[#EAE2D0]">Masuk ke</span>
                    <span
                      className="font-display text-xl sm:text-2xl font-bold tracking-wide"
                      style={{ color: activeTheme.badgeText }}
                    >
                      {activeTheme.title}!
                    </span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {status === 'completed' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col items-center max-w-md mx-auto"
          >
            <div className="relative w-36 h-36 sm:w-40 sm:h-40 rounded-full overflow-hidden border-2 border-[#D4AF37]/60 shadow-[0_0_36px_rgba(212,175,55,0.22)] mb-4 bg-[#141A26]">
              {!imgErrors.hatCrest ? (
                <img
                  src={sortingHatCrestImg}
                  alt="Topi Seleksi Hogwarts"
                  referrerPolicy="no-referrer"
                  onError={() => markImgError('hatCrest')}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#E5C158]">
                  <Users className="w-10 h-10" aria-hidden="true" />
                </div>
              )}
            </div>

            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#F6E8C3] tracking-wide mb-2 text-balance">
              Seleksi Kelompok Selesai
            </h2>
            <p className="text-sm text-[#D1CBB9] leading-relaxed mb-5">
              Seluruh <span className="font-mono-num font-semibold text-[#F6E8C3]">{totalStudents}</span>{' '}
              murid telah ditempatkan secara proporsional ke dalam{' '}
              <span className="font-mono-num font-semibold text-[#F6E8C3]">{groupCount}</span>{' '}
              kelompok. Daftar lengkap tersedia di bagian bawah.
            </p>

            <button
              type="button"
              onClick={onReshuffle}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-[#D4AF37] text-[#141008] font-semibold text-sm hover:bg-[#E5C158] transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-[0_4px_20px_rgba(212,175,55,0.28)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F6E8C3]"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              <span>Acak Ulang Seleksi</span>
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
