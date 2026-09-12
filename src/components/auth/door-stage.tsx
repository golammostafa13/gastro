import { AnatomyFilm } from "@/components/auth/anatomy-film";

/**
 * The library's half of the door.
 *
 * A lit alcove with an abdomen standing in it, and almost everything here is
 * about making it read as a *place the body is in* rather than as a picture
 * pasted on the other half of the page. The ground is its own deeper wash (see
 * `.door__stage` in the stylesheet), there is a pool of light under it, and the
 * seam between the two halves is a single hairline rather than a hard colour
 * change — the two halves are one room seen twice, not two pages.
 *
 * That reading is the whole reason the film is keyed rather than simply played
 * (`lib/anatomy-key`). A video element here would have brought its own studio
 * backdrop with it, and a navy rectangle inside a pale alcove is a television
 * in a room, not an object in one.
 *
 * Server Component. The only thing here that ships is `AnatomyFilm`, which is
 * a canvas, a 1px `<video>` and a loader; everything else — the ground, the
 * pool, the seam — is server-rendered and costs nothing.
 *
 * There is no caption and no hint. One revision carried "Drag to turn the
 * tract" along the bottom, and it went when the drag did: this plays on its
 * own, and an instruction for a gesture that does nothing is worse than
 * silence. The whole pane is `aria-hidden` — it is a moving decoration, and
 * everything it says about the library is already said in words by the
 * wordmark and the eyebrow on the other half.
 */
export function DoorStage() {
  return (
    <div className="door__stage lg:order-1" aria-hidden="true">
      <div className="door__stage-ground" />
      <div className="door__stage-pool" />

      <AnatomyFilm />
    </div>
  );
}
