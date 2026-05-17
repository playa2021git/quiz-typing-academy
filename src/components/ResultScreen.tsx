import { translate } from '../i18n';
import type { AudioSettings, Language, QuizResult } from '../types';
import LanguageSwitch from './LanguageSwitch';

type ResultScreenProps = {
  audioSettings: AudioSettings;
  language: Language;
  result: QuizResult;
  onRetry: () => void;
  onBackToTitle: () => void;
  onLanguageChange: (language: Language) => void;
  onToggleAudio: (settings: AudioSettings) => void;
};

const formatSeconds = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const restSeconds = seconds % 60;
  return minutes > 0 ? `${minutes}分${restSeconds}秒` : `${restSeconds}秒`;
};

const getRank = (accuracy: number, maxCombo: number) => {
  if (accuracy >= 98 && maxCombo >= 10) {
    return 'SSS';
  }
  if (accuracy >= 94 && maxCombo >= 8) {
    return 'SS';
  }
  if (accuracy >= 88 && maxCombo >= 5) {
    return 'S';
  }
  if (accuracy >= 75) {
    return 'A';
  }
  if (accuracy >= 55) {
    return 'B';
  }
  return 'C';
};

export default function ResultScreen({
  audioSettings,
  language,
  result,
  onRetry,
  onBackToTitle,
  onLanguageChange,
  onToggleAudio,
}: ResultScreenProps) {
  // 結果画面ではゲームらしいランクと、学習の振り返りに必要な指標を並べます。
  const accuracy = result.accuracy;
  const averageSeconds = result.elapsedSeconds / result.totalQuestions;
  const rank = getRank(accuracy, result.maxCombo);

  return (
    <main className="screen result-screen">
      <section className={`result-panel rank-${rank.toLowerCase()}`} aria-labelledby="result-title">
        <p className="eyebrow">{translate(language, 'missionComplete')}</p>
        <h1 id="result-title">{translate(language, 'resultReport')}</h1>

        <div className="rank-display" aria-label={`Rank ${rank}`}>
          {rank}
        </div>

        <div className="result-grid">
          <div className="result-item">
            <span>{translate(language, 'score')}</span>
            <strong>{result.score.toLocaleString()}</strong>
          </div>
          <div className="result-item">
            <span>{translate(language, 'accuracy')}</span>
            <strong>{accuracy}%</strong>
          </div>
          <div className="result-item">
            <span>{translate(language, 'maxCombo')}</span>
            <strong>{result.maxCombo}</strong>
          </div>
          <div className="result-item">
            <span>{translate(language, 'clearCount')}</span>
            <strong>
              {result.correctCount} / {result.totalQuestions}
            </strong>
          </div>
          <div className="result-item">
            <span>{translate(language, 'time')}</span>
            <strong>{formatSeconds(result.elapsedSeconds)}</strong>
          </div>
          <div className="result-item">
            <span>{translate(language, 'avgAnswer')}</span>
            <strong>{averageSeconds.toFixed(1)}秒</strong>
          </div>
        </div>

        <div className="button-row result-actions">
          <button className="primary-button" onClick={onRetry} type="button">
            {translate(language, 'retry')}
          </button>
          <button className="secondary-button" onClick={onBackToTitle} type="button">
            {translate(language, 'backToTitle')}
          </button>
        </div>

        <div className="audio-control-grid result-audio" aria-label={translate(language, 'audioLabel')}>
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
      </section>
    </main>
  );
}
