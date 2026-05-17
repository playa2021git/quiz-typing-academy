import {
  ClipboardEvent,
  CompositionEvent,
  FormEvent,
  KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { AudioSettings, Question, TypingDifficulty } from '../types';
import { playCorrectSound, playKeySound, playMissSound } from '../utils/audio';

type QuizScreenProps = {
  audioSettings: AudioSettings;
  questions: Question[];
  difficulty: TypingDifficulty;
  startedAt: number;
  onFinish: (
    correctCount: number,
    totalAttempts: number,
    accuracy: number,
    elapsedSeconds: number,
    score: number,
    maxCombo: number,
  ) => void;
  onRestart: () => void;
  onToggleAudio: (settings: AudioSettings) => void;
};

type BattleEffect = 'idle' | 'clear' | 'miss';

const normalizeAnswer = (value: string, difficulty: TypingDifficulty) => {
  // 英単語は大文字小文字を吸収し、前後の空白は判定から外します。
  if (difficulty === 'nightmare') {
    return value.trim();
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

const toTypingValue = (value: string, difficulty: TypingDifficulty) => {
  const normalized = normalizeAnswer(value, difficulty);
  return difficulty === 'nightmare' ? normalized : normalized.toLocaleLowerCase();
};

const getTypingAnswers = (question: Question, difficulty: TypingDifficulty) => {
  return Array.from(
    new Set(
      question.acceptableAnswers
        .map((answer) => toTypingValue(answer, difficulty))
        .filter(Boolean),
    ),
  );
};

const isCorrectAnswer = (input: string, typingAnswers: string[], difficulty: TypingDifficulty) => {
  const normalizedInput = toTypingValue(input, difficulty);
  return typingAnswers.some((answer) => answer === normalizedInput);
};

const hasMatchingPrefix = (input: string, typingAnswers: string[], difficulty: TypingDifficulty) => {
  if (!input) {
    return true;
  }

  const normalizedInput = toTypingValue(input, difficulty);
  return typingAnswers.some((answer) => answer.startsWith(normalizedInput));
};

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const restSeconds = seconds % 60;
  return `${minutes}:${String(restSeconds).padStart(2, '0')}`;
};

const getClearLabel = (combo: number) => {
  if (combo >= 7) {
    return 'PERFECT';
  }
  if (combo >= 3) {
    return 'GREAT';
  }
  return 'CLEAR';
};

const isPrintableKey = (key: string) => key.length === 1;

export default function QuizScreen({
  audioSettings,
  questions,
  difficulty,
  startedAt,
  onFinish,
  onRestart,
  onToggleAudio,
}: QuizScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answerInput, setAnswerInput] = useState('');
  const [correctCount, setCorrectCount] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [acceptedKeyCount, setAcceptedKeyCount] = useState(0);
  const [missKeyCount, setMissKeyCount] = useState(0);
  const [feedback, setFeedback] = useState('TYPE THE ANSWER');
  const [effect, setEffect] = useState<BattleEffect>('idle');
  const [isComposing, setIsComposing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const compositionBaseRef = useRef('');

  const currentQuestion = questions[currentIndex];
  const typingAnswers = useMemo(
    () => (currentQuestion ? getTypingAnswers(currentQuestion, difficulty) : []),
    [currentQuestion, difficulty],
  );
  const stageLabel = `${currentIndex + 1}/${questions.length}`;
  const displayLengthClass =
    answerInput.length > 18 ? ' compact' : answerInput.length > 10 ? ' mid' : '';

  const accuracy = useMemo(() => {
    const totalKeyCount = acceptedKeyCount + missKeyCount;
    if (totalKeyCount === 0) {
      return 100;
    }
    return Math.round((acceptedKeyCount / totalKeyCount) * 100);
  }, [acceptedKeyCount, missKeyCount]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [currentIndex]);

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000));
    }, 500);

    return () => window.clearInterval(timerId);
  }, [startedAt]);

  useEffect(() => {
    if (effect === 'idle') {
      return;
    }

    const timerId = window.setTimeout(() => setEffect('idle'), 520);
    return () => window.clearTimeout(timerId);
  }, [effect]);

  const moveToNextQuestion = (
    nextCorrectCount: number,
    nextAttemptCount: number,
    nextAccuracy: number,
    nextScore: number,
    nextMaxCombo: number,
  ) => {
    const isLastQuestion = currentIndex + 1 >= questions.length;
    if (isLastQuestion) {
      onFinish(
        nextCorrectCount,
        nextAttemptCount,
        nextAccuracy,
        Math.max(1, Math.floor((Date.now() - startedAt) / 1000)),
        nextScore,
        nextMaxCombo,
      );
      return;
    }

    setCurrentIndex((index) => index + 1);
    setAnswerInput('');
    setFeedback('NEXT STAGE READY');
    setIsAdvancing(false);
    window.requestAnimationFrame(() => inputRef.current?.focus());
  };

  const completeAnswer = (
    completedInput: string,
    nextAcceptedKeyCount: number,
    nextMissKeyCount: number,
  ) => {
    if (!currentQuestion || isAdvancing) {
      return;
    }

    const nextAttemptCount = attemptCount + 1;
    const nextCorrectCount = correctCount + 1;
    const nextCombo = combo + 1;
    const nextMaxCombo = Math.max(maxCombo, nextCombo);
    const gainedScore = 1000 + nextCombo * 120 + Math.max(0, 60 - elapsedSeconds) * 3;
    const nextScore = score + gainedScore;
    const totalKeyCount = nextAcceptedKeyCount + nextMissKeyCount;
    const nextAccuracy =
      totalKeyCount === 0 ? 100 : Math.round((nextAcceptedKeyCount / totalKeyCount) * 100);

    setAnswerInput(completedInput);
    setAttemptCount(nextAttemptCount);
    setCorrectCount(nextCorrectCount);
    setCombo(nextCombo);
    setMaxCombo(nextMaxCombo);
    setScore(nextScore);
    setFeedback(getClearLabel(nextCombo));
    setEffect('clear');
    setIsAdvancing(true);
    if (audioSettings.seEnabled) {
      playCorrectSound();
    }
    window.setTimeout(
      () =>
        moveToNextQuestion(
          nextCorrectCount,
          nextAttemptCount,
          nextAccuracy,
          nextScore,
          nextMaxCombo,
        ),
      640,
    );
  };

  const registerMissKey = () => {
    setMissKeyCount((count) => count + 1);
    setCombo(0);
    setFeedback('MISS / CORRECT KEY REQUIRED');
    setEffect('miss');
    if (audioSettings.seEnabled) {
      playMissSound();
    }
  };

  const acceptText = (text: string, baseInput = answerInput) => {
    if (!currentQuestion || isAdvancing) {
      return;
    }

    const nextText = difficulty === 'nightmare' ? text : text.toLocaleLowerCase();
    const proposedInput = baseInput + nextText;

    if (!hasMatchingPrefix(proposedInput, typingAnswers, difficulty)) {
      registerMissKey();
      return;
    }

    setAnswerInput(proposedInput);
    const nextAcceptedKeyCount = acceptedKeyCount + nextText.length;
    setAcceptedKeyCount(nextAcceptedKeyCount);
    setFeedback('TYPE THE ANSWER');
    if (audioSettings.seEnabled) {
      playKeySound();
    }

    if (isCorrectAnswer(proposedInput, typingAnswers, difficulty)) {
      completeAnswer(proposedInput, nextAcceptedKeyCount, missKeyCount);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!currentQuestion || isAdvancing) {
      return;
    }

    if (!answerInput) {
      setFeedback('TYPE TO START');
      return;
    }

    if (isCorrectAnswer(answerInput, typingAnswers, difficulty)) {
      completeAnswer(answerInput, acceptedKeyCount, missKeyCount);
      return;
    }

    setFeedback('KEEP TYPING');
  };

  const handleAnswerKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (isComposing || event.nativeEvent.isComposing) {
      return;
    }

    if (event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
      return;
    }

    if (event.key === 'Backspace') {
      event.preventDefault();
      setAnswerInput((input) => input.slice(0, -1));
      return;
    }

    if (isPrintableKey(event.key)) {
      event.preventDefault();
      acceptText(event.key);
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    registerMissKey();
  };

  const handleCompositionStart = () => {
    compositionBaseRef.current = answerInput;
    setIsComposing(true);
  };

  const handleCompositionEnd = (event: CompositionEvent<HTMLInputElement>) => {
    setIsComposing(false);

    const baseInput = compositionBaseRef.current;
    const composedValue = event.currentTarget.value;
    const addedText = composedValue.startsWith(baseInput)
      ? composedValue.slice(baseInput.length)
      : event.data;

    if (!addedText) {
      inputRef.current?.focus();
      return;
    }

    const proposedInput = baseInput + addedText;
    if (!hasMatchingPrefix(proposedInput, typingAnswers, difficulty)) {
      setAnswerInput(baseInput);
      window.requestAnimationFrame(() => {
        if (inputRef.current) {
          inputRef.current.value = baseInput;
          inputRef.current.focus();
        }
      });
      registerMissKey();
      return;
    }

    setAnswerInput(baseInput);
    window.requestAnimationFrame(() => acceptText(addedText, baseInput));
  };

  if (!currentQuestion) {
    return (
      <main className="screen quiz-screen">
        <section className="quiz-panel">
          <h1>NO DATA</h1>
          <p>この組み合わせの問題データを追加してください。</p>
          <button className="primary-button" onClick={onRestart} type="button">
            BACK TO TITLE
          </button>
        </section>
      </main>
    );
  }

  return (
    <main
      className={`screen quiz-screen battle-screen ${effect}`}
      onMouseDown={() => inputRef.current?.focus()}
    >
      <section className="status-bar hud-bar" aria-label="プレイ状況">
        <div>
          <span className="status-label">SCORE</span>
          <strong>{score.toLocaleString()}</strong>
        </div>
        <div>
          <span className="status-label">COMBO</span>
          <strong>{combo}</strong>
        </div>
        <div>
          <span className="status-label">ACCURACY</span>
          <strong>{accuracy}%</strong>
        </div>
        <div>
          <span className="status-label">TIME</span>
          <strong>{formatTime(elapsedSeconds)}</strong>
        </div>
        <div>
          <span className="status-label">STAGE</span>
          <strong>{stageLabel}</strong>
        </div>
      </section>

      <section className={`quiz-panel arena-panel ${effect}`} aria-labelledby="question-title">
        <div className="arena-topline">
          <span>QUESTION NODE {String(currentIndex + 1).padStart(2, '0')}</span>
          <span>{difficulty.toUpperCase()}</span>
        </div>
        <h1 id="question-title">{currentQuestion.prompt}</h1>
        {currentQuestion.hint ? <p className="hint">HINT: {currentQuestion.hint}</p> : null}
        <div className={`battle-callout ${effect}`} aria-live="polite">
          {feedback}
        </div>
      </section>

      <form className="answer-form console-panel" onSubmit={handleSubmit}>
        <label htmlFor="answer">INPUT CONSOLE</label>
        <div
          className={`typing-display${displayLengthClass} ${effect === 'miss' ? 'error' : ''} ${
            effect === 'clear' ? 'complete' : ''
          }`}
        >
          {answerInput ? (
            Array.from(answerInput).map((char, index) => (
              <span
                className="typed-char valid"
                key={`${char}-${index}-${answerInput.length}`}
                style={{ animationDelay: `${Math.min(index, 8) * 12}ms` }}
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))
          ) : (
            <span className="typing-guide">TYPE YOUR ANSWER</span>
          )}
        </div>
        <input
          aria-label="答えを入力"
          autoComplete="off"
          className="answer-input"
          id="answer"
          inputMode="text"
          onCompositionEnd={handleCompositionEnd}
          onCompositionStart={handleCompositionStart}
          onKeyDown={handleAnswerKeyDown}
          onChange={(event) => {
            if (isComposing) {
              setAnswerInput(event.target.value);
            }
          }}
          onPaste={handlePaste}
          placeholder="TYPE"
          ref={inputRef}
          type="text"
          value={answerInput}
        />
        <div className="button-row">
          <button className="secondary-button" onClick={onRestart} type="button">
            QUIT
          </button>
        </div>
      </form>

      <div className="floating-audio-controls" aria-label="音声設定">
        <button
          className={audioSettings.seEnabled ? 'sound-toggle active' : 'sound-toggle'}
          onClick={() =>
            onToggleAudio({ ...audioSettings, seEnabled: !audioSettings.seEnabled })
          }
          type="button"
        >
          SE {audioSettings.seEnabled ? 'ON' : 'OFF'}
        </button>
        <button
          className={audioSettings.bgmEnabled ? 'sound-toggle active' : 'sound-toggle'}
          onClick={() =>
            onToggleAudio({ ...audioSettings, bgmEnabled: !audioSettings.bgmEnabled })
          }
          type="button"
        >
          BGM {audioSettings.bgmEnabled ? 'ON' : 'OFF'}
        </button>
      </div>
    </main>
  );
}
