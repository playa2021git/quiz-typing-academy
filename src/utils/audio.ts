type OscillatorKind = OscillatorType;

let audioContext: AudioContext | null = null;
let masterGain: GainNode | null = null;
let bgmGain: GainNode | null = null;
let bgmTimerId: number | null = null;
let bgmStep = 0;

const getAudioContext = () => {
  const AudioContextConstructor = window.AudioContext ?? window.webkitAudioContext;
  if (!AudioContextConstructor) {
    return null;
  }

  if (!audioContext) {
    audioContext = new AudioContextConstructor();
    masterGain = audioContext.createGain();
    masterGain.gain.value = 0.36;
    masterGain.connect(audioContext.destination);

    bgmGain = audioContext.createGain();
    bgmGain.gain.value = 0.14;
    bgmGain.connect(masterGain);
  }

  return audioContext;
};

const playTone = (
  frequency: number,
  duration: number,
  type: OscillatorKind = 'sine',
  volume = 0.22,
  delay = 0,
) => {
  const context = getAudioContext();
  if (!context || !masterGain) {
    return;
  }

  if (context.state === 'suspended') {
    void context.resume();
  }

  const startTime = context.currentTime + delay;
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startTime);
  gain.gain.setValueAtTime(0.001, startTime);
  gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  oscillator.connect(gain);
  gain.connect(masterGain);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.02);
};

export const initializeAudio = async () => {
  const context = getAudioContext();
  if (!context) {
    return false;
  }

  if (context.state === 'suspended') {
    await context.resume();
  }

  return context.state === 'running';
};

export const playKeySound = () => {
  playTone(680 + Math.random() * 110, 0.045, 'square', 0.16);
};

export const playStartSound = () => {
  [220, 330, 494].forEach((frequency, index) => {
    playTone(frequency, 0.09, 'sawtooth', 0.2, index * 0.08);
  });
};

export const playToggleSound = () => {
  [660, 880].forEach((frequency, index) => {
    playTone(frequency, 0.07, 'triangle', 0.18, index * 0.055);
  });
};

export const playCorrectSound = () => {
  [523, 659, 784, 1046].forEach((frequency, index) => {
    playTone(frequency, 0.1, 'triangle', 0.24, index * 0.055);
  });
};

export const playMissSound = () => {
  playTone(150, 0.12, 'sawtooth', 0.28);
  playTone(92, 0.16, 'square', 0.22, 0.08);
};

export const playResultSound = () => {
  [392, 523, 659, 784, 988].forEach((frequency, index) => {
    playTone(frequency, 0.12, 'triangle', 0.22, index * 0.09);
  });
};

const playBgmTone = (
  context: AudioContext,
  frequency: number,
  duration: number,
  type: OscillatorKind,
  volume: number,
  delay = 0,
) => {
  if (!bgmGain) {
    return;
  }

  const startTime = context.currentTime + delay;
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startTime);
  gain.gain.setValueAtTime(0.001, startTime);
  gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  oscillator.connect(gain);
  gain.connect(bgmGain);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.025);
};

const playBgmStep = () => {
  const context = getAudioContext();
  if (!context || !bgmGain) {
    return;
  }

  // 短い低音パルスと高音リードを重ね、軽いレースゲーム風の疾走感を出します。
  const leadNotes = [392, 494, 587, 659, 784, 659, 587, 494, 440, 554, 659, 740, 880, 740, 659, 554];
  const bassNotes = [98, 98, 123, 123, 147, 147, 123, 123];
  const leadFrequency = leadNotes[bgmStep % leadNotes.length];
  const bassFrequency = bassNotes[bgmStep % bassNotes.length];

  playBgmTone(context, bassFrequency, 0.14, 'square', 0.055);
  playBgmTone(context, leadFrequency, 0.11, bgmStep % 4 === 0 ? 'sawtooth' : 'triangle', 0.075, 0.015);

  if (bgmStep % 8 === 6) {
    playBgmTone(context, leadFrequency * 1.5, 0.07, 'triangle', 0.045, 0.075);
  }

  bgmStep += 1;
};

export const startBgm = async () => {
  const isReady = await initializeAudio();
  if (!isReady) {
    return;
  }

  stopBgm();
  bgmStep = 0;
  playBgmStep();
  bgmTimerId = window.setInterval(playBgmStep, 150);
};

export const stopBgm = () => {
  if (bgmTimerId !== null) {
    window.clearInterval(bgmTimerId);
    bgmTimerId = null;
  }
};

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}
