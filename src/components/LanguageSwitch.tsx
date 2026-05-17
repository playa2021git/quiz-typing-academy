import { translate } from '../i18n';
import type { Language } from '../types';

type LanguageSwitchProps = {
  language: Language;
  onLanguageChange: (language: Language) => void;
};

export default function LanguageSwitch({
  language,
  onLanguageChange,
}: LanguageSwitchProps) {
  return (
    <div className="language-switch" aria-label={translate(language, 'language')}>
      <button
        className={language === 'ja' ? 'sound-toggle active' : 'sound-toggle'}
        onClick={() => onLanguageChange('ja')}
        type="button"
      >
        {translate(language, 'japanese')}
      </button>
      <button
        className={language === 'en' ? 'sound-toggle active' : 'sound-toggle'}
        onClick={() => onLanguageChange('en')}
        type="button"
      >
        {translate(language, 'englishLanguage')}
      </button>
    </div>
  );
}
