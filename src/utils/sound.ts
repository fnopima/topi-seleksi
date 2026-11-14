import { SpeedPreset } from '../types/sorting';

let sharedCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!sharedCtx) {
      sharedCtx = new AudioCtx();
    }
    if (sharedCtx.state === 'suspended') {
      sharedCtx.resume().catch(() => {});
    }
    return sharedCtx;
  } catch {
    return null;
  }
}

function playTone(
  freq: number,
  startOffset: number,
  duration: number,
  gainPeak: number,
  type: OscillatorType = 'triangle'
) {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime + startOffset;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(gainPeak, now + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.03);
  } catch {
    // Ignore audio errors silently in restricted environments
  }
}

export function playStepUpSound(enabled: boolean) {
  if (!enabled) return;
  playTone(523.25, 0, 0.14, 0.03, 'sine');
  playTone(659.25, 0.06, 0.16, 0.025, 'sine');
}

export function playHatRevealSound(enabled: boolean, groupNumber: number) {
  if (!enabled) return;
  const baseNotes = [392.0, 440.0, 493.88, 523.25, 587.33, 659.25];
  const root = baseNotes[(groupNumber - 1) % baseNotes.length];
  playTone(root, 0, 0.24, 0.055, 'triangle');
  playTone(root * 1.25, 0.07, 0.28, 0.05, 'triangle');
  playTone(root * 1.5, 0.14, 0.36, 0.045, 'sine');
}

export function playCeremonyCompleteSound(enabled: boolean) {
  if (!enabled) return;
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((freq, idx) => {
    playTone(freq, idx * 0.09, 0.42, 0.05, 'triangle');
  });
}

function formatSpokenName(rawName: string): string {
  return rawName
    .trim()
    .replace(/^mr\.?\s+/i, 'Mister ')
    .replace(/^mrs\.?\s+/i, 'Missus ')
    .replace(/^ms\.?\s+/i, 'Miss ');
}

export function stopSpeaking() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    // Ignore speech synthesis errors
  }
}

export function speakStudentName(enabled: boolean, name: string, speed: SpeedPreset) {
  if (!enabled) return;
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  try {
    const synth = window.speechSynthesis;
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(formatSpokenName(name));
    const voices = synth.getVoices();
    const idVoice =
      voices.find((v) => v.lang.toLowerCase().startsWith('id')) ??
      voices.find((v) => v.lang.toLowerCase().startsWith('en'));

    if (idVoice) {
      utterance.voice = idVoice;
      utterance.lang = idVoice.lang;
    } else {
      utterance.lang = 'id-ID';
    }

    utterance.rate =
      speed === 'kilat'
        ? 1.35
        : speed === 'cepat'
          ? 1.15
          : speed === 'sedang'
            ? 1.05
            : 0.96;
    utterance.pitch = 1.02;
    utterance.volume = 1;

    synth.speak(utterance);
  } catch {
    // Ignore speech synthesis errors in restricted environments
  }
}
