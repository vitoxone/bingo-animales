/**
 * Sonidos sintetizados con la Web Audio API — sin archivos externos.
 *
 * Todo pasa por una cadena maestra (compresor + reverb corta) para que los
 * sonidos tengan cuerpo y nunca saturen, incluso si se disparan encimados.
 * Cualquier fallo se ignora en silencio: varios navegadores de Smart TV no
 * exponen AudioContext.
 */

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let reverbSend: GainNode | null = null;

type Ctx = { ctx: AudioContext; out: GainNode; verb: GainNode };

/** Impulso sintético: ruido con caída exponencial. Suficiente para una sala pequeña. */
function buildImpulse(ctx: AudioContext, seconds = 1.1, decay = 3.2): AudioBuffer {
  const length = Math.floor(ctx.sampleRate * seconds);
  const impulse = ctx.createBuffer(2, length, ctx.sampleRate);

  for (let channel = 0; channel < 2; channel++) {
    const data = impulse.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
  }
  return impulse;
}

function getAudio(): Ctx | null {
  try {
    if (!audioCtx) {
      const AC = window.AudioContext || (window as never as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      audioCtx = new AC();

      // master: gain → compresor → salida
      masterGain = audioCtx.createGain();
      masterGain.gain.value = 0.9;

      const comp = audioCtx.createDynamicsCompressor();
      comp.threshold.value = -14;
      comp.knee.value = 24;
      comp.ratio.value = 8;
      comp.attack.value = 0.004;
      comp.release.value = 0.18;

      masterGain.connect(comp);
      comp.connect(audioCtx.destination);

      // bus de reverb en paralelo
      const convolver = audioCtx.createConvolver();
      convolver.buffer = buildImpulse(audioCtx);
      reverbSend = audioCtx.createGain();
      reverbSend.gain.value = 0.5;
      reverbSend.connect(convolver);
      convolver.connect(comp);
    }

    if (!masterGain || !reverbSend) return null;
    return { ctx: audioCtx, out: masterGain, verb: reverbSend };
  } catch {
    return null;
  }
}

// ── Ladrillos de síntesis ─────────────────────────────────────────────────────

interface ToneOptions {
  freq: number;
  start: number;
  duration: number;
  type?: OscillatorType;
  gain?: number;
  attack?: number;
  /** Frecuencia final para un barrido de tono */
  sweepTo?: number;
  /** Cuánta señal se manda a la reverb (0–1) */
  send?: number;
}

function tone(a: Ctx, o: ToneOptions): void {
  const { ctx, out, verb } = a;
  const {
    freq,
    start,
    duration,
    type = 'sine',
    gain = 0.3,
    attack = 0.006,
    sweepTo,
    send = 0.25,
  } = o;

  const osc = ctx.createOscillator();
  const env = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (sweepTo) osc.frequency.exponentialRampToValueAtTime(sweepTo, start + duration);

  // Ataque corto y caída exponencial: percusivo, sin el "click" del corte seco
  env.gain.setValueAtTime(0.0001, start);
  env.gain.exponentialRampToValueAtTime(gain, start + attack);
  env.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  osc.connect(env);
  env.connect(out);

  if (send > 0) {
    const sendGain = ctx.createGain();
    sendGain.gain.value = send;
    env.connect(sendGain);
    sendGain.connect(verb);
  }

  osc.start(start);
  osc.stop(start + duration + 0.02);
}

interface NoiseOptions {
  start: number;
  duration: number;
  gain?: number;
  frequency?: number;
  Q?: number;
  filter?: BiquadFilterType;
  send?: number;
}

function noise(a: Ctx, o: NoiseOptions): void {
  const { ctx, out, verb } = a;
  const { start, duration, gain = 0.2, frequency = 2200, Q = 1, filter = 'bandpass', send = 0.2 } = o;

  const length = Math.max(1, Math.floor(ctx.sampleRate * duration));
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;

  const src = ctx.createBufferSource();
  src.buffer = buffer;

  const bq = ctx.createBiquadFilter();
  bq.type = filter;
  bq.frequency.value = frequency;
  bq.Q.value = Q;

  const env = ctx.createGain();
  env.gain.setValueAtTime(0.0001, start);
  env.gain.exponentialRampToValueAtTime(gain, start + 0.008);
  env.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  src.connect(bq);
  bq.connect(env);
  env.connect(out);

  if (send > 0) {
    const sendGain = ctx.createGain();
    sendGain.gain.value = send;
    env.connect(sendGain);
    sendGain.connect(verb);
  }

  src.start(start);
  src.stop(start + duration + 0.02);
}

/** Nota de marimba: fundamental + armónico a la octava, con golpe de madera. */
function mallet(a: Ctx, freq: number, start: number, gain = 0.34, duration = 0.5): void {
  tone(a, { freq, start, duration, type: 'sine', gain, attack: 0.004, send: 0.3 });
  tone(a, {
    freq: freq * 2,
    start,
    duration: duration * 0.55,
    type: 'sine',
    gain: gain * 0.35,
    send: 0.2,
  });
  tone(a, {
    freq: freq * 3.01,
    start,
    duration: duration * 0.2,
    type: 'triangle',
    gain: gain * 0.12,
    send: 0.1,
  });
  noise(a, { start, duration: 0.035, gain: gain * 0.3, frequency: freq * 4, Q: 0.8, send: 0.1 });
}

// ── Sonidos del juego ─────────────────────────────────────────────────────────

/** Notas de la cuenta regresiva: cuanto menos falta, más agudo (más tensión). */
const TICK_NOTES: Record<number, number> = {
  5: 349.23, // F4
  4: 392.0, // G4
  3: 440.0, // A4
  2: 523.25, // C5
  1: 659.25, // E5
};

/**
 * Un tic por número de la cuenta regresiva.
 * `step` es el número que se muestra (3, 2, 1…).
 */
export function playCountdownTick(step: number, enabled: boolean): void {
  if (!enabled) return;
  const a = getAudio();
  if (!a) return;

  try {
    const now = a.ctx.currentTime;
    const freq = TICK_NOTES[step] ?? 440;

    mallet(a, freq, now, 0.3, 0.42);
    // Pulso grave que marca el tiempo, como un tambor lejano
    tone(a, {
      freq: 110,
      start: now,
      duration: 0.22,
      type: 'sine',
      gain: 0.22,
      sweepTo: 55,
      send: 0.1,
    });
  } catch {
    // Audio no disponible
  }
}

/**
 * Aparición del animal: arpegio ascendente corto y brillante.
 * Suena 30 veces por partida, así que es breve y sin cola molesta.
 */
export function playReveal(enabled: boolean): void {
  if (!enabled) return;
  const a = getAudio();
  if (!a) return;

  try {
    const now = a.ctx.currentTime;

    // Golpe suave de llegada
    tone(a, {
      freq: 180,
      start: now,
      duration: 0.28,
      type: 'sine',
      gain: 0.26,
      sweepTo: 90,
      send: 0.15,
    });
    noise(a, { start: now, duration: 0.14, gain: 0.1, frequency: 900, Q: 0.7, send: 0.3 });

    // Arpegio mayor: C5 · E5 · G5 · C6
    const arpeggio = [523.25, 659.25, 783.99, 1046.5];
    arpeggio.forEach((freq, i) => {
      mallet(a, freq, now + 0.055 * i, 0.26 - i * 0.02, 0.55 + i * 0.1);
    });

    // Brillo final
    tone(a, {
      freq: 1568,
      start: now + 0.24,
      duration: 0.5,
      type: 'triangle',
      gain: 0.07,
      send: 0.5,
    });
  } catch {
    // Audio no disponible
  }
}

/** Palmas sintetizadas: ráfagas cortas e irregulares, no un "shhh" plano. */
export function playApplause(enabled: boolean): void {
  if (!enabled) return;
  const a = getAudio();
  if (!a) return;

  try {
    const now = a.ctx.currentTime;
    const CLAPS = 46;

    for (let i = 0; i < CLAPS; i++) {
      // Se agolpan al principio y se dispersan al final
      const progress = i / CLAPS;
      const at = now + Math.pow(progress, 0.75) * 1.8 + Math.random() * 0.05;
      const level = (0.1 + Math.random() * 0.09) * (1 - progress * 0.6);

      noise(a, {
        start: at,
        duration: 0.05 + Math.random() * 0.05,
        gain: level,
        frequency: 1400 + Math.random() * 2200,
        Q: 0.6,
        send: 0.35,
      });
    }

    // Colchón de fondo: la multitud
    noise(a, { start: now, duration: 2, gain: 0.05, frequency: 2400, Q: 0.4, send: 0.5 });
  } catch {
    // Audio no disponible
  }
}

/** Fanfarria de cierre: acorde ascendente + acorde final sostenido. */
export function playFanfare(enabled: boolean): void {
  if (!enabled) return;
  const a = getAudio();
  if (!a) return;

  try {
    const now = a.ctx.currentTime;
    // C5 · E5 · G5 · C6 y remate en G5/C6
    const melody: [number, number][] = [
      [523.25, 0],
      [659.25, 0.13],
      [783.99, 0.26],
      [1046.5, 0.39],
    ];

    melody.forEach(([freq, offset]) => {
      const start = now + offset;
      tone(a, { freq, start, duration: 0.42, type: 'triangle', gain: 0.28, send: 0.35 });
      tone(a, { freq: freq * 2, start, duration: 0.3, type: 'sine', gain: 0.1, send: 0.25 });
    });

    // Acorde final, más largo
    const chord = [523.25, 659.25, 783.99, 1046.5];
    chord.forEach((freq) => {
      tone(a, {
        freq,
        start: now + 0.56,
        duration: 1.5,
        type: 'triangle',
        gain: 0.16,
        attack: 0.02,
        send: 0.55,
      });
    });

    playApplause(enabled);
  } catch {
    // Audio no disponible
  }
}

/**
 * Reanuda el AudioContext. Los navegadores lo dejan suspendido hasta que hay
 * un gesto del usuario, así que conviene llamarlo desde el primer clic.
 */
export async function resumeAudio(): Promise<void> {
  try {
    const a = getAudio();
    if (a && a.ctx.state === 'suspended') await a.ctx.resume();
  } catch {
    // Ignorar
  }
}
