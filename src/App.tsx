import { useMemo, useState } from 'react';
import QuizScreen from './components/QuizScreen';
import ResultScreen from './components/ResultScreen';
import StartScreen from './components/StartScreen';
import { getQuestionsForSettings } from './data/questions';
import type { GameScreen, GameSettings, Question, QuizResult } from './types';

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

  const availableQuestionCount = useMemo(
    () =>
      getQuestionsForSettings(
        settings.subject,
        settings.level,
        settings.difficulty,
      ).length,
    [settings],
  );

  const startQuiz = () => {
    // 選択された条件に合う問題から10問を出題します。
    const nextQuestions = shuffleQuestions(
      getQuestionsForSettings(settings.subject, settings.level, settings.difficulty),
    ).slice(0, QUESTION_COUNT);

    setActiveQuestions(nextQuestions);
    setStartedAt(Date.now());
    setResult(null);
    setScreen('quiz');
  };

  const finishQuiz = (correctCount: number, elapsedSeconds: number) => {
    setResult({
      correctCount,
      elapsedSeconds,
      totalQuestions: activeQuestions.length,
    });
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
        difficulty={settings.difficulty}
        onFinish={finishQuiz}
        onRestart={resetToStart}
        questions={activeQuestions}
        startedAt={startedAt}
      />
    );
  }

  if (screen === 'result' && result) {
    return <ResultScreen result={result} onRetry={startQuiz} />;
  }

  return (
    <>
      <StartScreen settings={settings} onSettingsChange={setSettings} onStart={startQuiz} />
      <p className="question-stock" aria-live="polite">
        この設定では {availableQuestionCount} 問から10問を出題します。
      </p>
    </>
  );
}
