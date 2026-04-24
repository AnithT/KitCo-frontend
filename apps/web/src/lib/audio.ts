let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (ctx) return ctx;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  ctx = new Ctor();
  return ctx;
}

export function playDing(): void {
  const audio = getCtx();
  if (!audio) return;
  if (audio.state === 'suspended') {
    void audio.resume();
  }

  const now = audio.currentTime;
  const tones = [880, 1320];

  tones.forEach((freq, i) => {
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + i * 0.12);
    gain.gain.setValueAtTime(0, now + i * 0.12);
    gain.gain.linearRampToValueAtTime(0.18, now + i * 0.12 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.12 + 0.32);
    osc.connect(gain).connect(audio.destination);
    osc.start(now + i * 0.12);
    osc.stop(now + i * 0.12 + 0.34);
  });
}
