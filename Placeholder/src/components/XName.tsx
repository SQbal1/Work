/**
 * Renders a product name with every standalone/trailing X in the brand
 * gradient — the X-family convention shared with PayX and RideX. Single
 * source of truth for the gradient-X treatment; do not reimplement locally.
 */
export function XName({ name }: { name: string }) {
  const parts = name.split(/(X(?=\s|$))/);
  return (
    <>
      {parts.map((part, i) =>
        part === "X" ? (
          <span key={i} className="text-gradient-x">
            X
          </span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}
