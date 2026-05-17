# Quiz Typing Academy

Quiz Typing Academyは、クイズの答えを考えてタイピングする教育用ブラウザゲームです。通常のタイピング練習のように表示文字をそのまま打つのではなく、学習内容を思い出して入力するMVPとして作成しています。

## Features

- 教科選択: History / Geography / English Vocabulary
- 難易度選択: Easy / Normal / Hard / Nightmare
- 学習レベル選択: 中学1〜3年相当、英検5級〜1級
- 10問のクイズタイピング
- Enterキーまたはボタンで回答判定
- 正答数、進捗、経過時間、正答率の表示
- 結果画面で正答数、正答率、総時間、平均解答時間を表示
- 外部APIなし、ローカルのTypeScript配列で問題データを管理

## Tech Stack

- Vite
- React
- TypeScript
- CSS

## Getting Started

```bash
npm install
npm run dev
```

開発サーバーが起動したら、表示されたローカルURLをブラウザで開いてください。

## Build

```bash
npm run build
```

生成物は `dist/` に出力されます。`vite.config.ts` の `base` はGitHub Pagesのプロジェクトページ向けに `/quiz-typing-academy/` を設定しています。

## Project Structure

```text
src/
  components/
    QuizScreen.tsx
    ResultScreen.tsx
    StartScreen.tsx
  data/
    questions.ts
  App.tsx
  main.tsx
  styles.css
  types.ts
```

## Adding Questions

問題は `src/data/questions.ts` の `questionBanks` に追加します。各問題は次の形を基本にします。

```ts
{
  prompt: '「行く」は英語で？',
  answer: 'go',
  acceptableAnswers: ['go']
}
```

`answer` は代表解、`acceptableAnswers` は許容する別解です。日本語入力・英語入力の両方に対応できるよう、表記ゆれがある場合は `acceptableAnswers` に追加してください。

## Next Ideas

- 問題ごとの解説表示
- 学習履歴のローカル保存
- タイピング速度、ミス回数、連続正解ボーナス
- 教科・単元ごとの問題追加
- GitHub Pagesへの自動デプロイワークフロー
