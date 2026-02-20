import TcmTerm from "@/components/TcmTerm";
import { useLanguage } from "@/context/LanguageContext";
import { getLocalizedGlossary } from "@/data/localized-data";

const TcmRichText = ({ text, className, variant }: { text: string; className?: string; variant?: "default" | "light" }) => {
  const { locale } = useLanguage();
  const glossary = getLocalizedGlossary(locale);

  const entries = Object.entries(glossary)
    .map(([key, entry]) => ({ key, term: entry.term }))
    .sort((a, b) => b.term.length - a.term.length);

  const pattern = entries.map((e) => e.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  if (!pattern) return <span className={className}>{text}</span>;

  const regex = new RegExp(`(${pattern})`, "gi");
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, i) => {
        const match = entries.find((e) => e.term.toLowerCase() === part.toLowerCase());
        if (match) {
          return <TcmTerm key={i} termKey={match.key} variant={variant}>{part}</TcmTerm>;
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
};

export default TcmRichText;
