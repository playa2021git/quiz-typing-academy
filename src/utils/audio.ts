type OscillatorKind = OscillatorType;

let audioContext: AudioContext | null = null;
let masterGain: GainNode | null = null;
let bgmGain: GainNode | null = null;
let bgmTimerId: number | null = null;
let bgmStep = 0;

const getAudioContext = () => {
  const AudioContextConstructor = window.AudioContext ?? window.webkitAudioContext;
  if (!audioContext) {
    audioContext = new AudioContextConstructor();
    masterGain = audioContext.createGain();
    masterGain.gain.value = 0.18;
    masterGain.connect(audioContext.destination);

    bgmGain = audioContext.createGain();
    bgmGain.gain.value = 0.08;
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
  if (!masterGain) {
    return;
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
  if (context.state === 'suspended') {
    await context.resume();
  }
};

export const playKeySound = () => {
  playTone(620 + Math.random() * 90, 0.035, 'square', 0.09);
};

export const playStartSound = () => {
  [220, 330, 494].forEach((frequency, index) => {
    playTone(frequency, 0.08, 'sawtooth', 0.14, index * 0.08);
  });
};

export const playCorrectSound = () => {
  [523, 659, 784, 1046].forEach((frequency, index) => {
    playTone(frequency, 0.09, 'triangle', 0.18, index * 0.055);
  });
};

export const playMissSound = () => {
  playTone(150, 0.12, 'sawtooth', 0.22);
  playTone(92, 0.16, 'square', 0.16, 0.08);
};

export const playResultSound = () => {
  [392, 523, 659, 784, 988].forEach((frequency, index) => {
    playTone(frequency, 0.12, 'triangle', 0.16, index * 0.09);
  });
};

const playBgmStep = () => {
  const context = getAudioContext();
  if (!bgmGain) {
    return;
  }

  const notes = [196, 247, 294, 370, 330, 294, 247, 220];
  const frequency = notes[bgmStep % notes.length];
  const startTime = context.currentTime;
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = bgmStep % 2 === 0 ? 'triangle' : 'sine';
  oscillator.frequency.setValueAtTime(frequency, startTime);
  gain.gain.setValueAtTime(0.001, startTime);
  gain.gain.exponentialRampToValueAtTime(0.09, startTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.28);

  oscillator.connect(gain);
  gain.connect(bgmGain);
  oscillator.start(startTime);
  oscillator.stop(startTime + 0.32);
  bgmStep += 1;
};

export const startBgm = () => {
  stopBgm();
  playBgmStep();
  bgmTimerId = window.setInterval(playBgmStep, 360);
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
