import TcmTerm from "@/components/TcmTerm";
import { TCM_GLOSSARY } from "@/data/tcm-glossary";

/**
 * Renders text with automatic TcmTerm popovers for any recognized glossary terms.
 */
const TcmRichText = ({ text, className }: { text: string; className?: string }) => {
  // Build a sorted list of terms (longest first to avoid partial matches)
  const entries = Object.entries(TCM_GLOSSARY)
    .map(([key, entry]) => ({ key, term: entry.term }))
    .sort((a, b) => b.term.length - a.term.length);

  // Build regex matching any glossary term (case-insensitive)
  const pattern = entries.map((e) => e.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  if (!pattern) return <span className={className}>{text}</span>;

  const regex = new RegExp(`(${pattern})`, "gi");
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, i) => {
        const match = entries.find((e) => e.term.toLowerCase() === part.toLowerCase());
        if (match) {
          return <TcmTerm key={i} termKey={match.key}>{part}</TcmTerm>;
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
};

export default TcmRichText;
