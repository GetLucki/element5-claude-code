import { useLanguage } from "@/context/LanguageContext";
import { getLocalizedGlossary } from "@/data/localized-data";
import { TcmGlossaryEntry } from "@/data/tcm-glossary";
import { Info } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface TcmTermProps {
  termKey: string;
  children?: React.ReactNode;
  variant?: "default" | "light";
}

const TcmTerm = ({ termKey, children, variant = "default" }: TcmTermProps) => {
  const { locale } = useLanguage();
  const glossary = getLocalizedGlossary(locale);
  const entry: TcmGlossaryEntry | undefined = glossary[termKey];
  if (!entry) return <>{children || termKey}</>;

  const buttonClass = variant === "light"
    ? "inline-flex items-center gap-1 text-sand font-medium underline decoration-sand/60 decoration-dotted underline-offset-2 hover:decoration-sand transition-colors"
    : "inline-flex items-center gap-1 text-secondary font-medium underline decoration-secondary/40 decoration-dotted underline-offset-2 hover:decoration-secondary transition-colors";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" className={buttonClass}>
          {children || entry.term}
          <Info className="h-3.5 w-3.5 shrink-0 opacity-60" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" side="top" align="start">
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-foreground">{entry.term}</span>
            {entry.chinese && (
              <span className="text-sm text-muted-foreground">{entry.chinese}</span>
            )}
          </div>
          <p className="text-sm font-medium text-secondary">{entry.short}</p>
          <p className="text-sm text-muted-foreground leading-relaxed">{entry.detail}</p>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default TcmTerm;
