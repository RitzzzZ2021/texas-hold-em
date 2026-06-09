"use client";

import { setLanguage, type Language } from "@/features/preferences/preferencesSlice";
import { selectLanguage } from "@/features/preferences/selectors";
import { t } from "@/i18n/translations";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const options: Array<{ label: string; value: Language }> = [
  { label: "EN", value: "en" },
  { label: "中文", value: "zh" }
];

export function LanguageToggle() {
  const dispatch = useAppDispatch();
  const language = useAppSelector(selectLanguage);

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold uppercase text-slate-300">{t(language, "language")}</span>
      <div className="grid grid-cols-2 rounded-md border border-white/10 bg-slate-950/70 p-1">
        {options.map((option) => (
          <button
            className={[
              "h-8 min-w-12 rounded px-3 text-sm font-semibold transition",
              language === option.value ? "bg-amber-300 text-slate-950" : "text-slate-200 hover:bg-white/10"
            ].join(" ")}
            key={option.value}
            onClick={() => dispatch(setLanguage(option.value))}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
