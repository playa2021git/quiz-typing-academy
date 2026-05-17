import type { QuizResult } from '../types';

type ResultScreenProps = {
  result: QuizResult;
  onRetry: () => void;
};

const formatSeconds = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const restSeconds = seconds % 60;
  return minutes > 0 ? `${minutes}分${restSeconds}秒` : `${restSeconds}秒`;
};

export default function ResultScreen({ result, onRetry }: ResultScreenProps) {
  // 結果画面では学習者が振り返りやすい指標だけを絞って表示します。
  const accuracy = Math.round((result.correctCount / result.totalQuestions) * 100);
  const averageSeconds = result.elapsedSeconds / result.totalQuestions;

  return (
    <main className="screen result-screen">
      <section className="result-panel" aria-labelledby="result-title">
        <p className="eyebrow">Result</p>
        <h1 id="result-title">おつかれさまでした！</h1>

        <div className="result-grid">
          <div className="result-item">
            <span>正答数</span>
            <strong>
              {result.correctCount} / {result.totalQuestions}
            </strong>
          </div>
          <div className="result-item">
            <span>正答率</span>
            <strong>{accuracy}%</strong>
          </div>
          <div className="result-item">
            <span>かかった時間</span>
            <strong>{formatSeconds(result.elapsedSeconds)}</strong>
          </div>
          <div className="result-item">
            <span>平均解答時間</span>
            <strong>{averageSeconds.toFixed(1)}秒</strong>
          </div>
        </div>

        <button className="primary-button start-button" onClick={onRetry} type="button">
          もう一度プレイする
        </button>
      </section>
    </main>
  );
}
