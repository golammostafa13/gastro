import { notFound } from "next/navigation";
import { DoorFlow } from "@/components/auth/door-flow";
import { DoorStage } from "@/components/auth/door-stage";
import { Brand } from "@/components/brand";
import { LanguageSwitch } from "@/components/language-switch";
import { getDictionary, hasLocale } from "@/lib/i18n";

/**
 * Door chrome: deliberately not the public header and footer. There is one
 * thing to do on these pages, plus the language switch, because a reader
 * should be able to get an account in their own language.
 *
 * There is no way past this page any more. The brand used to link to the
 * catalogue and a second link offered to skip the form entirely; both are gone
 * now that the shelves need an account, because a link that lands on a
 * redirect straight back here is worse than no link at all.
 *
 * ── The split ────────────────────────────────────────────────────────
 *
 * Two halves at `lg` and up, and the division is by *whose business it is*:
 *
 *   • the **panel** is the reader's — who the library is for, who paid for it,
 *     and the fields. It is on the **right**, and it is second in the DOM
 *     rather than repositioned: `order` moves it there at `lg` only, so a phone
 *     gets it first, which is the point below;
 *   • the **stage** is the library's — an abdomen on the left, playing, at the
 *     size an object needs to be looked at rather than glimpsed.
 *
 * It was one layer before: the anatomy ran full-bleed behind the whole page at
 * a third of its opacity, and the form sat on top of it. That version worked
 * and this one is better for a reason worth writing down. A background
 * *decorates* a page; it is the thing a reader's eye is trained to discard on
 * the way to the form, and it has to stay faint precisely because it is in the
 * way. Given its own half, the body stops being in the way, and everything that
 * had to be traded off against legibility — opacity, scale, and the amount of
 * movement a page can carry directly under a password field — comes back.
 *
 * What stands there is a studio film of a real abdomen with its backdrop keyed
 * off per pixel, so the organs are in the alcove rather than in a rectangle
 * laid over it. See `lib/anatomy-key`.
 *
 * Below `lg` there is no split: the panel is the page and the stage follows it,
 * a band under the fold. That way round on purpose, and it is the reason the
 * sides are done with `order` rather than with DOM position. On a phone the
 * form is the page, and a reader who has just typed the address off a printed
 * handout should land on the fields, not scroll past a gut to reach them —
 * the brand wordmark at the top already says which library this is, in words.
 *
 * ── One window ───────────────────────────────────────────────────────
 *
 * At `lg` the door is exactly `100dvh` and does not scroll; the panel scrolls
 * inside itself if it has to. That is what keeps the stage whole — a page that
 * scrolls would carry it off the top of the window, and half an abdomen is
 * worse than none — and it is why the tagline, the lead and the tall sponsor
 * panel all came out: the column had to fit. It does, at about 830px against a
 * 980px laptop window. The register form is taller and will scroll the panel,
 * which is the one place this arrangement gives way, and it gives way on the
 * half that can afford it.
 *
 * `DoorFlow` lives on the panel rather than the whole door, so the light is
 * where the type is. It is absolutely positioned inside its own clipped box
 * (see the stylesheet) rather than clipping this element, so a long register
 * form on a short window still scrolls.
 */
export default async function AuthLayout(props: LayoutProps<"/[lang]">) {
  const { lang } = await props.params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);

  return (
    <div className="door paper-grain relative min-h-dvh lg:grid lg:h-dvh lg:min-h-0 lg:grid-cols-2 lg:overflow-hidden">
      <div className="door__panel relative flex min-h-dvh flex-col lg:order-2 lg:h-dvh lg:min-h-0 lg:overflow-y-auto">
        <DoorFlow />

        <header className="relative z-10 flex w-full items-center justify-between gap-2 px-5 py-6 sm:gap-4 lg:px-10">
          <div className="min-w-0 shrink">
            <Brand />
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <LanguageSwitch lang={lang} label={dict.common.switchLanguage} />
          </div>
        </header>

        {/* `flex-col` with `my-auto` on the column inside, not `items-center`.
            They centre identically while there is room, and differ in the case
            that matters: when the panel's content is taller than the window —
            a short laptop, or the register form, which is the tallest on the
            site — `align-items: center` overflows the container at *both* ends
            and the top of the overflow cannot be scrolled to. An auto block
            margin gives up its space instead, so the column simply starts at
            the top and everything stays reachable. */}
        <main className="relative z-10 flex flex-1 flex-col">
          {props.children}
        </main>
      </div>

      <DoorStage />
    </div>
  );
}
