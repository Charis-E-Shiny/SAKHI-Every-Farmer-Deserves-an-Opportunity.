// Renders a translated heading whose accent words are marked with asterisks
// ("Built for everyone who *feeds* a city."), so each language can put the
// accent where it falls in its own word order.

/**
 * @param text - text with `*accent*` spans
 * @param className - classes for the accent spans
 */
export function Emph({ text, className = "font-serif font-normal italic" }: { text: string; className?: string }) {
  return (
    <>
      {text.split(/(\*[^*]+\*)/).map((part, i) =>
        part.startsWith("*") && part.endsWith("*") && part.length > 2 ? (
          <span key={i} className={className}>
            {part.slice(1, -1)}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}
