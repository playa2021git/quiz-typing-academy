import type {
  AudioSettings,
  EnglishLevel,
  GameSettings,
  HistoryGeographyLevel,
  Language,
  LearningLevel,
  SelectOption,
  Subject,
  TypingDifficulty,
} from '../types';
import { translate, type TranslationKey } from '../i18n';
import LanguageSwitch from './LanguageSwitch';

type StartScreenProps = {
  audioSettings: AudioSettings;
  language: Language;
  settings: GameSettings;
  onLanguageChange: (language: Language) => void;
  onSettingsChange: (settings: GameSettings) => void;
  onStart: () => void;
  onToggleAudio: (settings: AudioSettings) => void;
};

const subjectOptions: Array<SelectOption<Subject> & { labelKey: TranslationKey }> = [
  { value: 'history', label: 'History', labelKey: 'history' },
  { value: 'geography', label: 'Geography', labelKey: 'geography' },
  { value: 'english', label: 'English Vocabulary', labelKey: 'english' },
];

const difficultyOptions: Array<
  SelectOption<TypingDifficulty> & { labelKey: TranslationKey }
> = [
  { value: 'easy', label: 'Easy', labelKey: 'easy' },
  { value: 'normal', label: 'Normal', labelKey: 'normal' },
  { value: 'hard', label: 'Hard', labelKey: 'hard' },
  { value: 'nightmare', label: 'Nightmare', labelKey: 'nightmare' },
];

const gradeLevelOptions: Array<
  SelectOption<HistoryGeographyLevel> & { labelKey: TranslationKey }
> = [
  { value: 'grade1', label: 'Grade 1', labelKey: 'grade1' },
  { value: 'grade2', label: 'Grade 2', labelKey: 'grade2' },
  { value: 'grade3', label: 'Grade 3', labelKey: 'grade3' },
];

const englishLevelOptions: Array<SelectOption<EnglishLevel> & { labelKey: TranslationKey }> = [
  { value: 'eiken5', label: 'Eiken 5', labelKey: 'eiken5' },
  { value: 'eiken4', label: 'Eiken 4', labelKey: 'eiken4' },
  { value: 'eiken3', label: 'Eiken 3', labelKey: 'eiken3' },
  { value: 'eikenPre2', label: 'Eiken Pre-2', labelKey: 'eikenPre2' },
  { value: 'eiken2', label: 'Eiken 2', labelKey: 'eiken2' },
  { value: 'eikenPre1', label: 'Eiken Pre-1', labelKey: 'eikenPre1' },
  { value: 'eiken1', label: 'Eiken 1', labelKey: 'eiken1' },
];

const getLevelOptions = (
  subject: Subject,
): Array<SelectOption<LearningLevel> & { labelKey: TranslationKey }> =>
  subject === 'english' ? englishLevelOptions : gradeLevelOptions;

export default function StartScreen({
  audioSettings,
  language,
  settings,
  onLanguageChange,
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
        <p className="eyebrow">{translate(language, 'quizTypingLearning')}</p>
        <h1 id="app-title">QUIZ TYPING ACADEMY</h1>
        <p className="lead">{translate(language, 'bootLead')}</p>
        <p className="press-start">{translate(language, 'pressStart')}</p>
      </section>

      <section className="settings-panel command-panel" aria-label="ゲーム設定">
        <div className="panel-header">
          <span>{translate(language, 'missionConfig')}</span>
          <span>{translate(language, 'ready')}</span>
        </div>

        <LanguageSwitch language={language} onLanguageChange={onLanguageChange} />

        <div className="setting-group">
          <span className="setting-label">{translate(language, 'subject')}</span>
          <div className="segmented-grid">
            {subjectOptions.map((option) => (
              <button
                className={settings.subject === option.value ? 'choice-button active' : 'choice-button'}
                key={option.value}
                onClick={() => updateSubject(option.value)}
                type="button"
              >
                {translate(language, option.labelKey)}
              </button>
            ))}
          </div>
        </div>

        <div className="setting-group">
          <span className="setting-label">{translate(language, 'typingDifficulty')}</span>
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
                {translate(language, option.labelKey)}
              </button>
            ))}
          </div>
        </div>

        <label className="select-row">
          <span className="setting-label">{translate(language, 'learningLevel')}</span>
          <select
            value={settings.level}
            onChange={(event) =>
              onSettingsChange({ ...settings, level: event.target.value as LearningLevel })
            }
          >
            {levelOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {translate(language, option.labelKey)}
              </option>
            ))}
          </select>
        </label>

        <div className="audio-control-grid" aria-label={translate(language, 'audioLabel')}>
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

        <button className="primary-button start-button" onClick={onStart} type="button">
          {translate(language, 'startGame')}
        </button>
      </section>
    </main>
  );
}
