// 画面・問題データ・結果表示で共有する型をここに集約します。
export type Subject = 'history' | 'geography' | 'english';

export type TypingDifficulty = 'easy' | 'normal' | 'hard' | 'nightmare';

export type HistoryGeographyLevel = 'grade1' | 'grade2' | 'grade3';

export type EnglishLevel =
  | 'eiken5'
  | 'eiken4'
  | 'eiken3'
  | 'eikenPre2'
  | 'eiken2'
  | 'eikenPre1'
  | 'eiken1';

export type LearningLevel = HistoryGeographyLevel | EnglishLevel;

export type GameScreen = 'start' | 'quiz' | 'result';

export type Question = {
  id: string;
  subject: Subject;
  level: LearningLevel;
  difficulty: TypingDifficulty;
  prompt: string;
  answer: string;
  acceptableAnswers: string[];
  hint?: string;
};

export type GameSettings = {
  subject: Subject;
  difficulty: TypingDifficulty;
  level: LearningLevel;
};

export type QuizResult = {
  correctCount: number;
  totalQuestions: number;
  elapsedSeconds: number;
};

export type SelectOption<T extends string> = {
  value: T;
  label: string;
};
