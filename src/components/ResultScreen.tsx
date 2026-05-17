import type { AudioSettings, QuizResult } from '../types';

type ResultScreenProps = {
  audioSettings: AudioSettings;
  result: QuizResult;
  onRetry: () => void;
  onBackToTitle: () => void;
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
  result,
  onRetry,
  onBackToTitle,
  onToggleAudio,
}: ResultScreenProps) {
  // 結果画面ではゲームらしいランクと、学習の振り返りに必要な指標を並べます。
  const accuracy = Math.round((result.correctCount / Math.max(1, result.totalAttempts)) * 100);
  const averageSeconds = result.elapsedSeconds / result.totalQuestions;
  const rank = getRank(accuracy, result.maxCombo);

  return (
    <main className="screen result-screen">
      <section className={`result-panel rank-${rank.toLowerCase()}`} aria-labelledby="result-title">
        <p className="eyebrow">MISSION COMPLETE</p>
        <h1 id="result-title">RESULT REPORT</h1>

        <div className="rank-display" aria-label={`Rank ${rank}`}>
          {rank}
        </div>

        <div className="result-grid">
          <div className="result-item">
            <span>SCORE</span>
            <strong>{result.score.toLocaleString()}</strong>
          </div>
          <div className="result-item">
            <span>ACCURACY</span>
            <strong>{accuracy}%</strong>
          </div>
          <div className="result-item">
            <span>MAX COMBO</span>
            <strong>{result.maxCombo}</strong>
          </div>
          <div className="result-item">
            <span>CLEAR</span>
            <strong>
              {result.correctCount} / {result.totalQuestions}
            </strong>
          </div>
          <div className="result-item">
            <span>TIME</span>
            <strong>{formatSeconds(result.elapsedSeconds)}</strong>
          </div>
          <div className="result-item">
            <span>AVG ANSWER</span>
            <strong>{averageSeconds.toFixed(1)}秒</strong>
          </div>
        </div>

        <div className="button-row result-actions">
          <button className="primary-button" onClick={onRetry} type="button">
            RETRY
          </button>
          <button className="secondary-button" onClick={onBackToTitle} type="button">
            BACK TO TITLE
          </button>
        </div>

        <div className="audio-control-grid result-audio" aria-label="音声設定">
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
      </section>
    </main>
  );
}
