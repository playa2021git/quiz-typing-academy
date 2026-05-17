import { useEffect, useMemo, useState } from 'react';
import QuizScreen from './components/QuizScreen';
import ResultScreen from './components/ResultScreen';
import StartScreen from './components/StartScreen';
import { getQuestionsForSettings } from './data/questions';
import type { AudioSettings, GameScreen, GameSettings, Question, QuizResult } from './types';
import {
  initializeAudio,
  playResultSound,
  playStartSound,
  startBgm,
  stopBgm,
} from './utils/audio';

const QUESTION_COUNT = 10;

const defaultSettings: GameSettings = {
  subject: 'history',
  difficulty: 'easy',
  level: 'grade1',
};

const shuffleQuestions = (sourceQuestions: Question[]) =>
  [...sourceQuestions].sort(() => Math.random() - 0.5);

export default function App() {
  const [screen, setScreen] = useState<GameScreen>('start');
  const [settings, setSettings] = useState<GameSettings>(defaultSettings);
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [startedAt, setStartedAt] = useState(Date.now());
  const [result, setResult] = useState<QuizResult | null>(null);
  const [audioSettings, setAudioSettings] = useState<AudioSettings>({
    seEnabled: false,
    bgmEnabled: false,
  });
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  const availableQuestionCount = useMemo(
    () =>
      getQuestionsForSettings(
        settings.subject,
        settings.level,
        settings.difficulty,
      ).length,
    [settings],
  );

  useEffect(() => {
    if (!audioUnlocked || !audioSettings.bgmEnabled) {
      stopBgm();
      return;
    }

    startBgm();
    return stopBgm;
  }, [audioSettings.bgmEnabled, audioUnlocked]);

  const updateAudioSettings = async (nextSettings: AudioSettings) => {
    const shouldUnlockAudio =
      screen !== 'start' &&
      !audioUnlocked &&
      (nextSettings.seEnabled || nextSettings.bgmEnabled);

    if (shouldUnlockAudio) {
      await initializeAudio();
      setAudioUnlocked(true);
    }

    setAudioSettings(nextSettings);
  };

  const startQuiz = async () => {
    // 選択された条件に合う問題から10問を出題します。
    const nextQuestions = shuffleQuestions(
      getQuestionsForSettings(settings.subject, settings.level, settings.difficulty),
    ).slice(0, QUESTION_COUNT);

    if (audioSettings.seEnabled || audioSettings.bgmEnabled) {
      await initializeAudio();
      setAudioUnlocked(true);
      if (audioSettings.seEnabled) {
        playStartSound();
      }
    }

    setActiveQuestions(nextQuestions);
    setStartedAt(Date.now());
    setResult(null);
    setScreen('quiz');
  };

  const finishQuiz = (
    correctCount: number,
    totalAttempts: number,
    accuracy: number,
    elapsedSeconds: number,
    score: number,
    maxCombo: number,
  ) => {
    setResult({
      correctCount,
      accuracy,
      elapsedSeconds,
      maxCombo,
      score,
      totalAttempts,
      totalQuestions: activeQuestions.length,
    });
    if (audioSettings.seEnabled) {
      playResultSound();
    }
    setScreen('result');
  };

  const resetToStart = () => {
    setScreen('start');
    setResult(null);
    setActiveQuestions([]);
  };

  if (screen === 'quiz') {
    return (
      <QuizScreen
        audioSettings={audioSettings}
        difficulty={settings.difficulty}
        onFinish={finishQuiz}
        onRestart={resetToStart}
        onToggleAudio={updateAudioSettings}
        questions={activeQuestions}
        startedAt={startedAt}
      />
    );
  }

  if (screen === 'result' && result) {
    return (
      <ResultScreen
        audioSettings={audioSettings}
        onBackToTitle={resetToStart}
        onRetry={startQuiz}
        onToggleAudio={updateAudioSettings}
        result={result}
      />
    );
  }

  return (
    <>
      <StartScreen
        audioSettings={audioSettings}
        settings={settings}
        onSettingsChange={setSettings}
        onStart={startQuiz}
        onToggleAudio={updateAudioSettings}
      />
      <p className="question-stock" aria-live="polite">
        この設定では {availableQuestionCount} 問から10問を出題します。
      </p>
    </>
  );
}
