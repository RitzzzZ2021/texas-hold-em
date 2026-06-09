import type { Language } from "@/features/preferences/preferencesSlice";

type TranslationKey =
  | "appTitle"
  | "call"
  | "check"
  | "fold"
  | "hand"
  | "language"
  | "newHand"
  | "opponentThinking"
  | "pot"
  | "raise"
  | "shufflingDeck"
  | "toAct"
  | "winner"
  | "winners";

const translations: Record<Language, Record<TranslationKey, string>> = {
  en: {
    appTitle: "Texas Hold'em",
    call: "Call",
    check: "Check",
    fold: "Fold",
    hand: "Hand",
    language: "Language",
    newHand: "New hand",
    opponentThinking: "thinking...",
    pot: "Pot",
    raise: "Raise",
    shufflingDeck: "Shuffling deck...",
    toAct: "to act",
    winner: "Winner",
    winners: "Winners"
  },
  zh: {
    appTitle: "德州扑克",
    call: "跟注",
    check: "过牌",
    fold: "弃牌",
    hand: "牌局",
    language: "语言",
    newHand: "新牌局",
    opponentThinking: "思考中...",
    pot: "底池",
    raise: "加注",
    shufflingDeck: "正在洗牌...",
    toAct: "行动",
    winner: "赢家",
    winners: "赢家"
  }
};

export function t(language: Language, key: TranslationKey): string {
  return translations[language][key];
}
