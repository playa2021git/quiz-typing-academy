import type { Question, TypingDifficulty } from '../types';

const romajiVariantGroups = [
  ['sha', 'sya'],
  ['shu', 'syu'],
  ['sho', 'syo'],
  ['cha', 'tya', 'cya'],
  ['chu', 'tyu', 'cyu'],
  ['cho', 'tyo', 'cyo'],
  ['ja', 'zya', 'jya'],
  ['ju', 'zyu', 'jyu'],
  ['jo', 'zyo', 'jyo'],
  ['shi', 'si'],
  ['chi', 'ti'],
  ['tsu', 'tu'],
  ['fu', 'hu'],
  ['ji', 'zi'],
];

const isLatinTypingAnswer = (value: string) => /^[a-z0-9 .,'-]+$/i.test(value);

export const normalizeAnswerText = (value: string, difficulty: TypingDifficulty) => {
  const halfWidth = value.normalize('NFKC').trim();

  if (difficulty === 'nightmare') {
    return halfWidth;
  }

  const compacted = halfWidth.replace(/\s+/g, ' ');
  const lowered = compacted.toLocaleLowerCase();

  if (difficulty === 'hard' || difficulty === 'normal') {
    return lowered;
  }

  return lowered.replace(/\s/g, '');
};

const expandRomajiVariants = (value: string) => {
  if (!isLatinTypingAnswer(value)) {
    return [value];
  }

  let variants = new Set([value]);

  romajiVariantGroups.forEach((group) => {
    const nextVariants = new Set(variants);

    variants.forEach((variant) => {
      group.forEach((from) => {
        if (!variant.includes(from)) {
          return;
        }

        group.forEach((to) => {
          nextVariants.add(variant.split(from).join(to));
        });
      });
    });

    variants = nextVariants;
  });

  return Array.from(variants);
};

export const getTypingAnswers = (question: Question, difficulty: TypingDifficulty) => {
  const normalizedAnswers = question.acceptableAnswers
    .map((answer) => normalizeAnswerText(answer, difficulty))
    .filter(Boolean);

  return Array.from(new Set(normalizedAnswers.flatMap(expandRomajiVariants)));
};

export const isCorrectTypingAnswer = (
  input: string,
  typingAnswers: string[],
  difficulty: TypingDifficulty,
) => {
  const normalizedInput = normalizeAnswerText(input, difficulty);
  return typingAnswers.some((answer) => answer === normalizedInput);
};

export const hasMatchingTypingPrefix = (
  input: string,
  typingAnswers: string[],
  difficulty: TypingDifficulty,
) => {
  if (!input) {
    return true;
  }

  const normalizedInput = normalizeAnswerText(input, difficulty);
  return typingAnswers.some((answer) => answer.startsWith(normalizedInput));
};
