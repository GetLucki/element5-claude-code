import { useLanguage, Locale } from "@/context/LanguageContext";
import { Globe } from "lucide-react";

const LOCALES: { code: Locale; label: string }[] = [
  { code: "sv", label: "SV" },
  { code: "en", label: "EN" },
  { code: "zh", label: "中文" },
];

interface LanguageSelectorProps {
  variant?: "pills" | "compact";
  className?: string;
}

const LanguageSelector = ({ variant = "pills", className = "" }: LanguageSelectorProps) => {
  const { locale, setLocale } = useLanguage();

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <Globe className="h-4 w-4 text-muted-foreground" />
      {LOCALES.map((l) => (
        <button
          key={l.code}
          onClick={() => setLocale(l.code)}
          className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
            locale === l.code
              ? "bg-secondary text-secondary-foreground"
              : variant === "compact"
                ? "text-muted-foreground hover:text-foreground"
                : "bg-muted/60 text-muted-foreground hover:bg-muted"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
};

export default LanguageSelector;
