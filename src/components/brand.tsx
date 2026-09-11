import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * The wordmark: the mark in a gradient tile, then the name in two tones.
 *
 * One component for every place the name appears (header, footer, the door,
 * the admin rail, the intro curtain), because a mark that is re-typed at each
 * call site drifts. The gradients live in globals.css (`.brand-mark`,
 * `.brand-grad`) so both halves of the lockup pull from the same three tokens
 * and stay in step through the light/dark swap.
 */

/**
 * `md` (the header lockup) sets its name fluidly rather than at a fixed size.
 * The wordmark is `whitespace-nowrap` and sits in a bar that also has to hold
 * the language switch and three round controls. "Gastroenterology Book Bank"
 * is sixteen characters in its first word alone: at a flat 1.2rem it overruns a
 * 360px phone and pushes the menu button off the screen, which is what the
 * clamp is for. Already at full size by ~440px, so every viewport with the
 * room is unchanged.
 */
const sizes = {
  sm: { tile: "size-8 rounded-[9px]", text: "text-[1.05rem]" },
  md: {
    tile: "size-9 rounded-[10px]",
    text: "text-[clamp(1rem,4.4vw,1.2rem)]",
  },
  lg: { tile: "size-11 rounded-xl", text: "text-[1.5rem]" },
} as const;

/**
 * The mark, as geometry rather than as an image: an open book with a coil
 * turning out of the gutter.
 *
 * Not the ancestor's mark recoloured, and the reason is written into the file
 * it was inherited from. That drawing had **three** page-leaves fanning out of
 * the fold, and the three leaves *were* the "3" of Cef 3; carried across to a
 * maternity library they would have been three leaves that mean nothing, which
 * is the most common way a rebrand goes visibly wrong. The same trap is set
 * again here: the maternity mark put an arc with a disc inside it in the
 * gutter, read as an arm around a newborn, and that shape happens to also read
 * as a wall around a lumen. Keeping it would have been defensible and wrong —
 * two sibling libraries with one drawing in two colours.
 *
 * So the boards stay, because they are what makes the tile say "library" at
 * 16px without help from the wordmark beside it, and the gutter is re-cut. In
 * it, one continuous curve that opens as it turns: a hollow viscus seen in
 * section, and equally a page curling out of the fold. It is deliberately not
 * closed — a ring reads as a letter O at small sizes — and it is one shape
 * rather than a diagram of a gut, because at the sizes this is used a diagram
 * is a smudge.
 *
 * That disc is load-bearing beyond the logo. `components/intro-curtain.tsx`
 * zooms the page through it (the counter of the mark becomes the aperture the
 * site opens behind), so its centre at (24, 11.4) in this 48-unit box is the
 * same point as `transform-origin: 50% 24%` in `globals.css`. Moving it means
 * moving that too; there is no way to derive one from the other in CSS.
 *
 * Every path is white on the tile's own gradient, so this one drawing serves
 * light mode, dark mode, the favicon and the touch icon without a second copy.
 * The art carries its own padding inside the 48-unit box, which is why it can
 * be dropped in at any size without a wrapper doing the insetting.
 */
export function BrandArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {/* The two page blocks. Both the top and the bottom edge fall from the
          outer corner into the gutter, which is the whole reason a filled shape
          reads as a board seen slightly from above rather than as a rectangle.
          The channel down the middle is left unpainted: the tile shows through
          it as the gutter. */}
      <path
        d="M22.6 24.6c-1.9-2.7-5-4.3-8.5-4.3H9.2A2.2 2.2 0 0 0 7 22.5v12.2c0 1.2 1 2.2 2.2 2.2h5c3.4 0 6.5 1.6 8.4 4.3z"
        fill="#fff"
        fillOpacity="0.96"
      />
      <path
        d="M25.4 24.6c1.9-2.7 5-4.3 8.5-4.3h4.9a2.2 2.2 0 0 1 2.2 2.2v12.2c0 1.2-1 2.2-2.2 2.2h-5c-3.4 0-6.5 1.6-8.4 4.3z"
        fill="#fff"
        fillOpacity="0.96"
      />

      {/* The coil. One turn that starts tight beside the counter and widens as
          it goes, ending free. The widening is the whole shape: a constant
          radius would be a ring, and a ring at this size is the letter O.

          Its tail ends at y≈19.7 and the boards begin at y≈20.3. That channel
          is the tightest measurement in the drawing, and it still closes at
          16px, where 48 units are three to the pixel — which is what
          `markSmall` in `scripts/build-icons.mjs` is for. */}
      <path
        d="M27.8 14.6A5.7 5.7 0 0 0 29.4 9.5A6.4 6.4 0 0 0 25.3 5.1A7.2 7.2 0 0 0 18.8 6.5A7.9 7.9 0 0 0 16.4 13.6A8.6 8.6 0 0 0 21.8 19.7"
        stroke="#fff"
        strokeWidth="2.9"
        strokeLinecap="round"
        fill="none"
      />

      {/* The counter, and the lumen. The intro curtain flies the page through
          this. */}
      <circle cx="24" cy="11.4" r="2.5" fill="#fff" />
    </svg>
  );
}

export function BrandMark({
  size = "md",
  className,
}: {
  size?: keyof typeof sizes;
  className?: string;
}) {
  const s = sizes[size];
  return (
    <span
      className={cn(
        "brand-mark relative inline-flex shrink-0 items-center justify-center",
        s.tile,
        className,
      )}
    >
      {/* Full-bleed: the art carries its own margin inside the 48-unit box, so
          the tile needs no padding of its own to sit it correctly. */}
      <BrandArt className="size-full" />
    </span>
  );
}

/**
 * The full lockup. `as` lets a footer render it as a heading and a header
 * render it inside its own link without nesting interactive elements.
 */
export function Brand({
  size = "md",
  className,
  markOnly = false,
}: {
  size?: keyof typeof sizes;
  className?: string;
  /** For the admin rail, where there is only room for the tile. */
  markOnly?: boolean;
}) {
  const s = sizes[size];

  if (markOnly) return <BrandMark size={size} className={className} />;

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <BrandMark size={size} />
      {/* One gradient across the whole name, not just the first word: over
          three syllables it actually travels, which is the point of it.
          Latin-only: the mark is the name, and a name is not translated. */}
      <span
        className={cn(
          "brand-grad font-extrabold leading-none tracking-[-0.025em] whitespace-nowrap",
          s.text,
        )}
      >
        {site.name}
      </span>
    </span>
  );
}
