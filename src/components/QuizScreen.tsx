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
import type { AudioSettings, Language, Question, TypingDifficulty } from '../types';
import { translate, type TranslationKey } from '../i18n';
import { playCorrectSound, playKeySound, playMissSound } from '../utils/audio';
import {
  getTypingAnswers,
  hasMatchingTypingPrefix,
  isCorrectTypingAnswer,
} from '../utils/answer';
import LanguageSwitch from './LanguageSwitch';

type QuizScreenProps = {
  audioSettings: AudioSettings;
  language: Language;
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
  onLanguageChange: (language: Language) => void;
  onRestart: () => void;
  onToggleAudio: (settings: AudioSettings) => void;
};

type BattleEffect = 'idle' | 'clear' | 'miss';

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const restSeconds = seconds % 60;
  return `${minutes}:${String(restSeconds).padStart(2, '0')}`;
};

const getClearLabel = (combo: number): TranslationKey => {
  if (combo >= 7) {
    return 'perfect';
  }
  if (combo >= 3) {
    return 'great';
  }
  return 'clear';
};

const isPrintableKey = (key: string) => key.length === 1;

export default function QuizScreen({
  audioSettings,
  language,
  questions,
  difficulty,
  startedAt,
  onFinish,
  onLanguageChange,
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
  const [feedbackKey, setFeedbackKey] = useState<TranslationKey>('typeAnswer');
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
    answerInput.length > 11 ? ' compact' : answerInput.length > 7 ? ' mid' : '';

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
    setFeedbackKey('nextStageReady');
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
    setFeedbackKey(getClearLabel(nextCombo));
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
    setFeedbackKey('missCorrectKeyRequired');
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

    if (!hasMatchingTypingPrefix(proposedInput, typingAnswers, difficulty)) {
      registerMissKey();
      return;
    }

    setAnswerInput(proposedInput);
    const nextAcceptedKeyCount = acceptedKeyCount + nextText.length;
    setAcceptedKeyCount(nextAcceptedKeyCount);
    setFeedbackKey('typeAnswer');
    if (audioSettings.seEnabled) {
      playKeySound();
    }

    if (isCorrectTypingAnswer(proposedInput, typingAnswers, difficulty)) {
      completeAnswer(proposedInput, nextAcceptedKeyCount, missKeyCount);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!currentQuestion || isAdvancing) {
      return;
    }

    if (!answerInput) {
      setFeedbackKey('typeToStart');
      return;
    }

    if (isCorrectTypingAnswer(answerInput, typingAnswers, difficulty)) {
      completeAnswer(answerInput, acceptedKeyCount, missKeyCount);
      return;
    }

    setFeedbackKey('keepTyping');
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
    if (!hasMatchingTypingPrefix(proposedInput, typingAnswers, difficulty)) {
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
          <h1>{translate(language, 'noData')}</h1>
          <p>{translate(language, 'noDataDescription')}</p>
          <button className="primary-button" onClick={onRestart} type="button">
            {translate(language, 'backToTitle')}
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
          <span className="status-label">{translate(language, 'score')}</span>
          <strong>{score.toLocaleString()}</strong>
        </div>
        <div>
          <span className="status-label">{translate(language, 'combo')}</span>
          <strong>{combo}</strong>
        </div>
        <div>
          <span className="status-label">{translate(language, 'accuracy')}</span>
          <strong>{accuracy}%</strong>
        </div>
        <div>
          <span className="status-label">{translate(language, 'time')}</span>
          <strong>{formatTime(elapsedSeconds)}</strong>
        </div>
        <div>
          <span className="status-label">{translate(language, 'stage')}</span>
          <strong>{stageLabel}</strong>
        </div>
      </section>

      <section className={`quiz-panel arena-panel ${effect}`} aria-labelledby="question-title">
        <div className="arena-topline">
          <span>
            {translate(language, 'questionNode')} {String(currentIndex + 1).padStart(2, '0')}
          </span>
          <span>{translate(language, difficulty)}</span>
        </div>
        <h1 id="question-title">{currentQuestion.prompt}</h1>
        {currentQuestion.hint ? (
          <p className="hint">
            {translate(language, 'hint')}: {currentQuestion.hint}
          </p>
        ) : null}
        <div className={`battle-callout ${effect}`} aria-live="polite">
          {translate(language, feedbackKey)}
        </div>
      </section>

      <form className="answer-form console-panel" onSubmit={handleSubmit}>
        <label htmlFor="answer">{translate(language, 'inputConsole')}</label>
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
            <span className="typing-guide">{translate(language, 'typeYourAnswer')}</span>
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
            {translate(language, 'quit')}
          </button>
        </div>
      </form>

      <div className="floating-audio-controls" aria-label={translate(language, 'audioLabel')}>
        <LanguageSwitch language={language} onLanguageChange={onLanguageChange} />
        <button
          className={audioSettings.seEnabled ? 'sound-toggle active' : 'sound-toggle'}
          onClick={() =>
            onToggleAudio({ ...audioSettings, seEnabled: !audioSettings.seEnabled })
          }
          type="button"
        >
          {translate(language, audioSettings.seEnabled ? 'seOn' : 'seOff')}
        </button>
        <button
          className={audioSettings.bgmEnabled ? 'sound-toggle active' : 'sound-toggle'}
          onClick={() =>
            onToggleAudio({ ...audioSettings, bgmEnabled: !audioSettings.bgmEnabled })
          }
          type="button"
        >
          {translate(language, audioSettings.bgmEnabled ? 'bgmOn' : 'bgmOff')}
        </button>
      </div>
    </main>
  );
}
