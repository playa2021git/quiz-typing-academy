import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import type { Question, TypingDifficulty } from '../types';

type QuizScreenProps = {
  questions: Question[];
  difficulty: TypingDifficulty;
  startedAt: number;
  onFinish: (correctCount: number, elapsedSeconds: number) => void;
  onRestart: () => void;
};

const normalizeAnswer = (value: string, difficulty: TypingDifficulty) => {
  // 難易度ごとに判定の厳しさを変え、英語・日本語の両方を扱えるようにします。
  if (difficulty === 'nightmare') {
    return value;
  }

  const trimmed = value.trim();
  if (difficulty === 'hard') {
    return trimmed;
  }

  const withoutExtraSpaces = trimmed.replace(/\s+/g, ' ');
  if (difficulty === 'normal') {
    return withoutExtraSpaces.toLocaleLowerCase();
  }

  return withoutExtraSpaces.replace(/\s/g, '').toLocaleLowerCase();
};

const isCorrectAnswer = (
  input: string,
  acceptableAnswers: string[],
  difficulty: TypingDifficulty,
) => {
  const normalizedInput = normalizeAnswer(input, difficulty);
  return acceptableAnswers.some(
    (answer) => normalizeAnswer(answer, difficulty) === normalizedInput,
  );
};

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const restSeconds = seconds % 60;
  return `${minutes}:${String(restSeconds).padStart(2, '0')}`;
};

export default function QuizScreen({
  questions,
  difficulty,
  startedAt,
  onFinish,
  onRestart,
}: QuizScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answerInput, setAnswerInput] = useState('');
  const [correctCount, setCorrectCount] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentQuestion = questions[currentIndex];
  const progressLabel = `${currentIndex + 1} / ${questions.length}`;

  const accuracy = useMemo(() => {
    if (currentIndex === 0) {
      return 0;
    }
    return Math.round((correctCount / currentIndex) * 100);
  }, [correctCount, currentIndex]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [currentIndex]);

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000));
    }, 500);

    return () => window.clearInterval(timerId);
  }, [startedAt]);

  const moveToNextQuestion = (nextCorrectCount: number) => {
    const isLastQuestion = currentIndex + 1 >= questions.length;
    if (isLastQuestion) {
      onFinish(nextCorrectCount, Math.max(1, Math.floor((Date.now() - startedAt) / 1000)));
      return;
    }

    setCurrentIndex((index) => index + 1);
    setAnswerInput('');
    setIsAdvancing(false);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isAdvancing) {
      return;
    }

    if (!answerInput) {
      setFeedback('答えを入力してから判定してください。');
      return;
    }

    if (isCorrectAnswer(answerInput, currentQuestion.acceptableAnswers, difficulty)) {
      const nextCorrectCount = correctCount + 1;
      setCorrectCount(nextCorrectCount);
      setFeedback('正解！次の問題へ進みます。');
      setIsAdvancing(true);
      window.setTimeout(() => moveToNextQuestion(nextCorrectCount), 350);
      return;
    }

    setFeedback(`不正解。正解は「${currentQuestion.answer}」です。Enterでもう一度挑戦できます。`);
  };

  if (!currentQuestion) {
    return (
      <main className="screen quiz-screen">
        <section className="quiz-panel">
          <h1>問題が見つかりません</h1>
          <p>この組み合わせの問題データを追加してください。</p>
          <button className="primary-button" onClick={onRestart} type="button">
            Start Screen
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="screen quiz-screen">
      <section className="status-bar" aria-label="プレイ状況">
        <div>
          <span className="status-label">Correct</span>
          <strong>{correctCount}</strong>
        </div>
        <div>
          <span className="status-label">Progress</span>
          <strong>{progressLabel}</strong>
        </div>
        <div>
          <span className="status-label">Time</span>
          <strong>{formatTime(elapsedSeconds)}</strong>
        </div>
        <div>
          <span className="status-label">Accuracy</span>
          <strong>{accuracy}%</strong>
        </div>
      </section>

      <section className="quiz-panel" aria-labelledby="question-title">
        <p className="question-count">Question {currentIndex + 1}</p>
        <h1 id="question-title">{currentQuestion.prompt}</h1>
        {currentQuestion.hint ? <p className="hint">Hint: {currentQuestion.hint}</p> : null}

        <form className="answer-form" onSubmit={handleSubmit}>
          <label htmlFor="answer">Your Answer</label>
          <input
            autoComplete="off"
            id="answer"
            onChange={(event) => setAnswerInput(event.target.value)}
            placeholder="答えをタイピング"
            ref={inputRef}
            type="text"
            value={answerInput}
          />
          <div className="button-row">
            <button className="primary-button" disabled={isAdvancing} type="submit">
              Check
            </button>
            <button className="secondary-button" onClick={onRestart} type="button">
              Quit
            </button>
          </div>
        </form>

        <p className={feedback.startsWith('正解') ? 'feedback correct' : 'feedback'} role="status">
          {feedback || 'Enterキー、またはCheckボタンで判定します。'}
        </p>
      </section>
    </main>
  );
}
