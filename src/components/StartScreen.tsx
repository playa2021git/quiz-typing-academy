import type {
  AudioSettings,
  EnglishLevel,
  GameSettings,
  HistoryGeographyLevel,
  LearningLevel,
  SelectOption,
  Subject,
  TypingDifficulty,
} from '../types';

type StartScreenProps = {
  audioSettings: AudioSettings;
  settings: GameSettings;
  onSettingsChange: (settings: GameSettings) => void;
  onStart: () => void;
  onToggleAudio: (settings: AudioSettings) => void;
};

const subjectOptions: SelectOption<Subject>[] = [
  { value: 'history', label: 'History' },
  { value: 'geography', label: 'Geography' },
  { value: 'english', label: 'English Vocabulary' },
];

const difficultyOptions: SelectOption<TypingDifficulty>[] = [
  { value: 'easy', label: 'Easy' },
  { value: 'normal', label: 'Normal' },
  { value: 'hard', label: 'Hard' },
  { value: 'nightmare', label: 'Nightmare' },
];

const gradeLevelOptions: SelectOption<HistoryGeographyLevel>[] = [
  { value: 'grade1', label: 'Grade 1' },
  { value: 'grade2', label: 'Grade 2' },
  { value: 'grade3', label: 'Grade 3' },
];

const englishLevelOptions: SelectOption<EnglishLevel>[] = [
  { value: 'eiken5', label: 'Eiken 5' },
  { value: 'eiken4', label: 'Eiken 4' },
  { value: 'eiken3', label: 'Eiken 3' },
  { value: 'eikenPre2', label: 'Eiken Pre-2' },
  { value: 'eiken2', label: 'Eiken 2' },
  { value: 'eikenPre1', label: 'Eiken Pre-1' },
  { value: 'eiken1', label: 'Eiken 1' },
];

const getLevelOptions = (subject: Subject): SelectOption<LearningLevel>[] =>
  subject === 'english' ? englishLevelOptions : gradeLevelOptions;

export default function StartScreen({
  audioSettings,
  settings,
  onSettingsChange,
  onStart,
  onToggleAudio,
}: StartScreenProps) {
  const levelOptions = getLevelOptions(settings.subject);

  const updateSubject = (subject: Subject) => {
    // 教科を切り替えたとき、存在しないレベルが残らないよう初期値を入れ直します。
    const nextLevel = subject === 'english' ? 'eiken5' : 'grade1';
    onSettingsChange({ ...settings, subject, level: nextLevel });
  };

  return (
    <main className="screen start-screen">
      <section className="hero-panel boot-panel" aria-labelledby="app-title">
        <p className="eyebrow">QUIZ × TYPING × LEARNING</p>
        <h1 id="app-title">QUIZ TYPING ACADEMY</h1>
        <p className="lead">
          ANSWER THE QUIZ. STRIKE THE KEYS. CLEAR THE STAGE.
        </p>
        <p className="press-start">PRESS START</p>
      </section>

      <section className="settings-panel command-panel" aria-label="ゲーム設定">
        <div className="panel-header">
          <span>MISSION CONFIG</span>
          <span>READY</span>
        </div>

        <div className="setting-group">
          <span className="setting-label">Subject</span>
          <div className="segmented-grid">
            {subjectOptions.map((option) => (
              <button
                className={settings.subject === option.value ? 'choice-button active' : 'choice-button'}
                key={option.value}
                onClick={() => updateSubject(option.value)}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="setting-group">
          <span className="setting-label">Typing Difficulty</span>
          <div className="segmented-grid four">
            {difficultyOptions.map((option) => (
              <button
                className={
                  settings.difficulty === option.value ? 'choice-button active' : 'choice-button'
                }
                key={option.value}
                onClick={() => onSettingsChange({ ...settings, difficulty: option.value })}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <label className="select-row">
          <span className="setting-label">Learning Level</span>
          <select
            value={settings.level}
            onChange={(event) =>
              onSettingsChange({ ...settings, level: event.target.value as LearningLevel })
            }
          >
            {levelOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="audio-control-grid" aria-label="音声設定">
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

        <button className="primary-button start-button" onClick={onStart} type="button">
          START GAME
        </button>
      </section>
    </main>
  );
}
