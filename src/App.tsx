/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { GroupResultsBoard } from './components/GroupResultsBoard';
import { SetupPanel } from './components/SetupPanel';
import { SortingStage } from './components/SortingStage';
import {
  CeremonyStatus,
  Gender,
  SortingAssignment,
  SpeedPreset,
  StepPhase,
  Student,
} from './types/sorting';
import {
  DEFAULT_GROUP_COUNT,
  DEFAULT_STUDENTS_TEXT,
  generateProportionalSorting,
  parseStudents,
} from './utils/sorting';
import {
  playCeremonyCompleteSound,
  playHatRevealSound,
  playStepUpSound,
  speakStudentName,
  stopSpeaking,
} from './utils/sound';

const SPEED_TIMINGS: Record<
  SpeedPreset,
  { enterMs: number; thinkMs: number; revealMs: number }
> = {
  kilat: { enterMs: 140, thinkMs: 240, revealMs: 240 },
  cepat: { enterMs: 260, thinkMs: 460, revealMs: 480 },
  sedang: { enterMs: 420, thinkMs: 750, revealMs: 750 },
  lambat: { enterMs: 700, thinkMs: 1300, revealMs: 1000 },
};

export default function App() {
  const [rawStudentsText, setRawStudentsText] = useState(DEFAULT_STUDENTS_TEXT);
  const [genderOverrides, setGenderOverrides] = useState<Record<string, Gender>>({});
  const [groupCount, setGroupCount] = useState(DEFAULT_GROUP_COUNT);
  const [speed, setSpeed] = useState<SpeedPreset>('lambat');
  const [soundEnabled, setSoundEnabled] = useState(true);

  const [status, setStatus] = useState<CeremonyStatus>('idle');
  const [queue, setQueue] = useState<SortingAssignment[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stepPhase, setStepPhase] = useState<StepPhase>('entering');
  const [assignedGroups, setAssignedGroups] = useState<Record<number, Student[]>>({});
  const lastSignatureRef = useRef<string | null>(null);

  const parsedStudents = useMemo(
    () => parseStudents(rawStudentsText, genderOverrides),
    [rawStudentsText, genderOverrides]
  );

  const effectiveGroupCount = Math.max(
    1,
    Math.min(groupCount, Math.max(1, parsedStudents.length || groupCount))
  );

  const handleToggleGender = useCallback((index: number, student: Student) => {
    const key = `${index}:${student.name.toLowerCase()}`;
    setGenderOverrides((prev) => ({
      ...prev,
      [key]: student.gender === 'male' ? 'female' : 'male',
    }));
  }, []);

  const handleChangeStudentsText = useCallback((value: string) => {
    setRawStudentsText(value);
    setStatus((prev) => {
      if (prev === 'completed') {
        setAssignedGroups({});
        return 'idle';
      }
      return prev;
    });
  }, []);

  const handleChangeGroupCount = useCallback((count: number) => {
    setGroupCount(count);
    setStatus((prev) => {
      if (prev === 'completed') {
        setAssignedGroups({});
        return 'idle';
      }
      return prev;
    });
  }, []);

  const handleStartCeremony = useCallback(() => {
    if (parsedStudents.length < 2) return;

    const targetGroups = Math.max(2, Math.min(groupCount, parsedStudents.length));
    if (targetGroups !== groupCount) {
      setGroupCount(targetGroups);
    }

    const { queue: nextQueue, signature } = generateProportionalSorting(
      parsedStudents,
      targetGroups,
      lastSignatureRef.current
    );
    lastSignatureRef.current = signature;

    setAssignedGroups({});
    setQueue(nextQueue);
    setCurrentIndex(0);
    setStepPhase('entering');
    setStatus('sorting');
  }, [parsedStudents, groupCount]);

  const handleStopCeremony = useCallback(() => {
    stopSpeaking();
    setStatus('idle');
    setQueue([]);
    setCurrentIndex(0);
    setStepPhase('entering');
    setAssignedGroups({});
  }, []);

  const handleSkipToEnd = useCallback(() => {
    if (queue.length === 0) return;
    stopSpeaking();

    const fullGroups: Record<number, Student[]> = {};
    for (const item of queue) {
      if (!fullGroups[item.groupNumber]) {
        fullGroups[item.groupNumber] = [];
      }
      fullGroups[item.groupNumber].push(item.student);
    }

    setAssignedGroups(fullGroups);
    setCurrentIndex(queue.length);
    setStatus('completed');
    playCeremonyCompleteSound(soundEnabled);
  }, [queue, soundEnabled]);

  // Sequential sorting ceremony loop
  useEffect(() => {
    if (status !== 'sorting') return;
    if (currentIndex >= queue.length) {
      setStatus('completed');
      playCeremonyCompleteSound(soundEnabled);
      return;
    }

    const currentItem = queue[currentIndex];
    const timings = SPEED_TIMINGS[speed];
    let timerId: number;

    if (stepPhase === 'entering') {
      playStepUpSound(soundEnabled);
      speakStudentName(soundEnabled, currentItem.student.name, speed);
      timerId = window.setTimeout(() => {
        setStepPhase('thinking');
      }, timings.enterMs);
    } else if (stepPhase === 'thinking') {
      timerId = window.setTimeout(() => {
        setStepPhase('revealed');
        playHatRevealSound(soundEnabled, currentItem.groupNumber);
        setAssignedGroups((prev) => {
          const existing = prev[currentItem.groupNumber] ?? [];
          if (existing.some((s) => s.id === currentItem.student.id)) {
            return prev;
          }
          return {
            ...prev,
            [currentItem.groupNumber]: [...existing, currentItem.student],
          };
        });
      }, timings.thinkMs);
    } else {
      timerId = window.setTimeout(() => {
        if (currentIndex + 1 >= queue.length) {
          setCurrentIndex(queue.length);
          setStatus('completed');
          playCeremonyCompleteSound(soundEnabled);
        } else {
          setCurrentIndex((prev) => prev + 1);
          setStepPhase('entering');
        }
      }, timings.revealMs);
    }

    return () => {
      window.clearTimeout(timerId);
    };
  }, [status, currentIndex, stepPhase, queue, speed, soundEnabled]);

  const currentAssignment =
    status === 'sorting' && currentIndex < queue.length ? queue[currentIndex] : null;

  return (
    <div className="min-h-screen bg-[#0B0F17] text-[#F5EFE2] flex flex-col">
      {/* Subtle Ambient Candlelight Vignette */}
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.09),transparent_58%)]"
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 flex flex-col">
        {/* Main Title & Institution Subtitle */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 mb-6 border-b border-[#D4AF37]/20">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#F6E8C3] tracking-wide text-balance">
              Pembagian Kelompok Teaching Demo
            </h1>
            <p className="mt-1.5 text-sm sm:text-base font-medium text-[#B8C0D0] tracking-wide">
              PKG-MBI SDN Suryakencana CBM
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setSoundEnabled((prev) => {
                const next = !prev;
                if (!next) stopSpeaking();
                return next;
              });
            }}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[#D4AF37]/25 bg-[#131824] text-xs font-medium text-[#D6CEBC] hover:bg-[#1B2233] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E5C158]"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-[#E5C158]" aria-hidden="true" />
                <span>Suara Aktif</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-[#9AA3B5]" aria-hidden="true" />
                <span>Suara Mati</span>
              </>
            )}
          </button>
        </header>

        {/* Two-Column Main Workspace: Setup Controls & Hogwarts Sorting Stage */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-4 flex flex-col">
            <SetupPanel
              rawStudentsText={rawStudentsText}
              onChangeStudentsText={handleChangeStudentsText}
              parsedStudents={parsedStudents}
              groupCount={effectiveGroupCount}
              onChangeGroupCount={handleChangeGroupCount}
              speed={speed}
              onChangeSpeed={setSpeed}
              status={status}
              onStart={handleStartCeremony}
              onStop={handleStopCeremony}
              onToggleGender={handleToggleGender}
            />
          </div>

          <div className="lg:col-span-8 flex flex-col">
            <SortingStage
              status={status}
              currentAssignment={currentAssignment}
              currentIndex={currentIndex}
              totalStudents={parsedStudents.length}
              groupCount={effectiveGroupCount}
              stepPhase={stepPhase}
              onSkipToEnd={handleSkipToEnd}
              onReshuffle={handleStartCeremony}
              onStart={handleStartCeremony}
              canStart={parsedStudents.length >= 2}
            />
          </div>
        </main>

        {/* Bottom Section: Names Assigned to Each Group */}
        <GroupResultsBoard
          groupCount={effectiveGroupCount}
          assignedGroups={assignedGroups}
          totalStudents={parsedStudents.length}
          status={status}
        />
      </div>
    </div>
  );
}
