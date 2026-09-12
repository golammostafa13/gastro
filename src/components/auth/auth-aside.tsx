import { LansodAd } from "@/components/lansod-ad";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { textClass } from "@/lib/i18n/content";
import { cn } from "@/lib/utils";

/**
 * Who the library is for, and that is now the whole of it.
 *
 * The tagline ("The gut, read closely") and the lead under it were here and
 * have been taken out at the brief's request. Two things were bought with the
 * ~150px they occupied, and both are worth more on this page than the words
 * were: the column now fits a laptop window without scrolling, and the form is
 * the first thing under the wordmark rather than the fourth.
 *
 * What is left says the one thing a reader at this door cannot get anywhere
 * else on it — that this is a library for clinicians and not a shop. The
 * wordmark above it already says what it is called and the tract beside it
 * already says what it is about, so the sentence that used to sit here was, on
 * inspection, the third statement of the same fact.
 *
 * Desktop only. On a phone the form is the page, and nothing should stand
 * between the reader and it.
 */
export function AuthAside({ lang }: { lang: Locale }) {
  const dict = getDictionary(lang);

  return (
    <p
      className={cn(
        "door__rise hidden items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-ink-mute lg:inline-flex",
        textClass(lang),
      )}
    >
      <span
        aria-hidden="true"
        className="brand-mark inline-block size-2 rounded-full"
      />
      {dict.auth.sideEyebrow}
    </p>
  );
}

/**
 * The sponsor, under the form.
 *
 * This library exists because a pharmaceutical company paid for a print run,
 * and the deal is that its product is on the page. It is *here*, at the door,
 * rather than only inside the library: a reader who never gets past this page
 * has still seen the pack, which is the deal, and putting it at the door means
 * the catalogue pages can carry it once, quietly, in a sidebar instead of
 * everywhere.
 *
 * Under the form rather than over it, and that is not a demotion. Above, it
 * would stand between a reader and the only thing this page asks of them,
 * which is the one placement a sponsor should not want: an advert in the way of
 * the task is an advert being resented. Below, it is the last thing on the page
 * and the first thing the eye lands on after the button.
 *
 * The `door` variant rather than the tall `panel` one, and the separate
 * `CourtesyBy` block that used to sit beside it is gone. Both are the same
 * decision: the page has to fit a laptop window, the advert was the tallest
 * thing on it at 400px, and `CourtesyBy` named the company a second time about
 * an inch from where the card already names it. Laid on its side the card is
 * ~140px and has lost nothing — the pack still turns, and the eyebrow, the
 * product, the strength, the company and the legal line are all still on it.
 *
 * Shown at every width, unlike the eyebrow above it, and the class list used to
 * say `hidden lg:flex` while rendering on a phone regardless — `.lansod-ad`
 * carries its own `display: flex` at equal specificity and wins on source
 * order, so the utility was a comment that did nothing. Made honest rather than
 * enforced, because on inspection the phone should have it: the rule this page
 * follows is that nothing stands *between* a reader and the form, and the
 * advert is below it. The sponsor paid for the print run, and a phone reader
 * who never scrolls past the button is the one reader most likely to see
 * nothing of them at all.
 */
export function AuthSponsor({ lang }: { lang: Locale }) {
  const dict = getDictionary(lang);

  return (
    <LansodAd
      copy={dict.sponsor}
      variant="door"
      className="door__rise w-full text-left"
      bnClass={textClass(lang)}
    />
  );
}

/**
 * The card itself: heading, and whatever form the door needs. Shared so that
 * the password and the register are visibly the same object seen twice rather
 * than two pages that happen to look similar.
 *
 * Three boxes, and the shape of this is the record of two things that were
 * tried here and taken back out:
 *
 *   • `.door__card` runs the **entry** — the card tips upright out of the page,
 *     the same move `.reveal-3d` makes for a section. It is the only 3D move
 *     left on the object itself.
 *   • `.door__pane` is the **sheet** — square to the reader, translucent over
 *     the lit field behind it, with a lit top bevel and a specular band across
 *     it, standing above its own pool of light. The transparency is what makes
 *     it an object standing in the room rather than a panel laid over a picture
 *     of one. What keeps it readable is the blur behind it rather than the
 *     opacity in front — see the note in the stylesheet, which carries the
 *     contrast measurements.
 *
 *     Square, and it stays square: a resting tilt was the obvious way to make
 *     this page read as 3D and it does not survive contact with the form. The
 *     email field is `autoFocus` (deliberately — see `DoorForm`), so
 *     `:focus-within` is true before the first paint and a straighten-on-focus
 *     rule would fire before anyone saw it; and a login card left askew while
 *     you copy a word off a printed page is an obstacle, not a style. A stack
 *     of leaves behind the pane was the second attempt, and it went the same
 *     way for a plainer reason: three sets of rounded corners around one form
 *     is busier than the form, and the depth is not worth what it costs the
 *     thing a reader is trying to fill in. The depth on this page belongs to
 *     the light behind it — see `DoorFlow` — and to the tract beside it.
 *   • `.door__pane-body` holds the **content** above the bevel and the sheen,
 *     which are absolutely positioned pseudo-elements and would otherwise paint
 *     over the heading.
 */
export function AuthCard({
  lang,
  title,
  lead,
  children,
  footer,
}: {
  lang: Locale;
  title: string;
  lead?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const bn = textClass(lang);

  return (
    <div className="door__card w-full">
      {/* No `bg-surface`. The pane is translucent now, and its background is a
          veil plus the blur behind it — two declarations that only work as a
          pair, so they live together in `.door__pane`. A utility class here
          would win the cascade and put the solid card back. */}
      <div className="door__pane rounded-3xl border border-line p-8 shadow-e4">
        <div className="door__pane-body">
          <h1
            className={cn(
              "door__mask text-[1.65rem] font-bold tracking-tight text-ink",
              bn,
            )}
          >
            <span>{title}</span>
          </h1>

          {lead ? (
            <p
              className={cn("door__rise mt-2.5 text-[0.92rem] text-ink-mute", bn)}
              style={{ "--lag": "0.26s" } as React.CSSProperties}
            >
              {lead}
            </p>
          ) : null}

          {/* `text-left`, against the column's `text-center`. The heading and
              the footer link want to be centred with everything else; a form
              does not. A centred label sitting over a left-aligned input reads
              as a mistake, and the error and hint lines under a field have to
              start where the field starts or they look like they belong to
              something else. */}
          <div
            className="door__rise mt-7 text-left"
            style={{ "--lag": "0.36s" } as React.CSSProperties}
          >
            {children}
          </div>
        </div>
      </div>

      {footer ? (
        <div
          className="door__rise"
          style={{ "--lag": "0.5s" } as React.CSSProperties}
        >
          {footer}
        </div>
      ) : null}
    </div>
  );
}

/**
 * The column everything on the panel sits in, and the camera it shares.
 *
 * One track, not two. The door used to be a two-column grid — copy left, card
 * right — and the grid is gone because the page is now split down the middle
 * against the stage: half a window is not wide enough for two columns of
 * anything, and trying gives a 12rem-wide advert beside a cramped form. So the
 * halves changed job. Reading order runs top to bottom here, and the thing that
 * was in the second column is the tract, next door.
 *
 * The card keeps `max-w-sm` and the copy `max-w-xl`, so the measure of the
 * running text is unchanged from the two-column version and only the
 * arrangement moved. Left-aligned rather than centred at `lg`: the stage is a
 * hard vertical edge down the middle of the window, and type centred in the
 * remaining half drifts away from it into the outer margin.
 *
 * Centred on both axes, and the two centrings are done differently on purpose.
 *
 * Horizontally it is `mx-auto` plus `items-center`, so the column sits in the
 * middle of the panel's half and every block in it is centred on the same axis
 * — eyebrow, card, advert. `text-center` rides along, which is right for the
 * eyebrow and the card's heading and is overridden back to `text-left` inside
 * the form: a centred field label floating over a left-aligned input is the one
 * place this rule would make the page harder to fill in.
 *
 * Vertically it is `my-auto`, deliberately not `items-center` on the parent —
 * see the note in the auth layout. The two agree while the content fits and
 * disagree when it does not: `align-items: center` overflows at both ends and
 * the top of the overflow cannot be scrolled to, where an auto margin gives up
 * its space instead. The column comes to about 830px, so it fits a laptop
 * window; the register form is taller and scrolls the panel inside itself,
 * which is the one place this arrangement gives way.
 *
 * The perspective is declared here rather than inside the card, so the card's
 * entry tips through the same vanishing point as the plumes drifting behind it.
 * A `perspective()` function in the card's own transform would give it a
 * private camera and the object would arrive into a slightly different room
 * from its own background.
 */
export function AuthLayoutGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="door__grid mx-auto my-auto flex w-full max-w-xl flex-col items-center gap-7 px-5 py-10 text-center sm:px-8 lg:px-12 xl:px-14">
      {children}
    </div>
  );
}
