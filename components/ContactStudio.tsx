"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { contact, identity } from "@/lib/content";
import type { Stage, Vec3 } from "@/lib/desk-scene";
import {
  COMPOSE_QUERY,
  ENTRY,
  FLAP,
  MARKS,
  PLANE,
  PLANE_OVERSHOOT,
  SHEET,
  STILL_DURATION,
  approach,
  beat,
  clamp01,
  decayBounce,
  easeInCubic,
  easeInOutCubic,
  easeOutCubic,
  flightPoint,
  lerp,
  revealFor,
  sheetCentre,
  stageFor,
} from "@/lib/desk-scene";
import { STILL_FLAG } from "@/lib/motion";
import {
  emptyDraft,
  firstError,
  mailtoHref,
  postLetter,
  contactEndpoint,
  validate,
  type LetterDraft,
  type LetterField,
} from "@/lib/contact-send";
import type { Studio } from "./studio-scene";

/* The contact studio.

   Two things are happening at once and it is worth saying which is which. The
   form is ordinary React and works on its own — it is server-rendered into the
   static export, so someone with no JavaScript, no WebGL, or a slow connection
   gets a letter they can fill in and post. The scene is an enhancement layered
   over it: three.js draws the typewriter and the box, and this component moves
   the sheet between them by projecting a world-space anchor through the same
   camera, every frame.

   The choreography is driven from one clock inside the animation loop rather
   than from a chain of timeouts. Beats overlap by design (lib/desk-scene.ts
   MARKS), and overlapping timeouts drift apart the moment a frame is slow —
   a fold that finishes after the letter has already left is the one failure
   this arrangement cannot have.

   Under 820px none of that is built. A phone has no room for a typewriter, a
   letterbox, a sheet big enough to type on and the button that sends it, and
   of those four only the last two are why anyone opened the page — so the
   phone gets the sheet, full width, with the send button under it on the same
   screen. The letter still leaves: with no box to post it into it is folded
   into a paper plane and thrown off the corner. That path is `mode: "plain"`,
   which is also what a desktop with no WebGL gets, and it is run by the
   `plane` effect below rather than by the loop — there is no loop without a
   scene, and four hinges are four CSS transitions.

   The send plays for everyone, including under `prefers-reduced-motion` — the
   reasoning is at STILL_FLAG in lib/desk-scene.ts, and it is a decision about
   this page rather than about the site. `?motion=still` is the way back to the
   quiet version. */

type Phase = "writing" | "sending" | "delivered" | "handoff" | "failed";
type Mode = "plain" | "scene";
type Fold = "flat" | "lower" | "both";

/* One live copy of everything the loop mutates. None of it belongs in state:
   it changes every frame, and a re-render per frame would be a re-render per
   frame. */
interface Live {
  studio: Studio | null;
  /** Which arrangement of the desk the scene was built as — the anchors the
      sheet is hung from live here. Null until a scene exists. */
  stage: Stage | null;
  /** performance.now() when the send began, or 0 while someone is still typing. */
  sendAt: number;
  /** performance.now() when the box was told to expect a letter, or 0. On its
      own clock because the lid also plays where there is no send to hang it
      off — see FLAP in lib/desk-scene.ts. */
  flapAt: number;
  /** Sheet standing above the platen, in scene units — eased toward `target`. */
  visible: number;
  target: number;
  /** Set once someone reaches for the signature blanks. The page has been drawn
      out to be signed and does not go back in, so the reveal stops following
      the typing and stays at its ceiling. */
  drawn: boolean;
  /** Keystroke impulse and the box's answer, both decaying to 0. */
  clack: number;
  /** Running count of keystrokes. Counted rather than flagged so the scene can
      see how many it missed while a frame was slow. */
  strikes: number;
  recoil: number;
  receive: number;
  flap: number;
  fold: Fold;
  last: number;
  /** Set once the loop has run the final beat, so it only lands once. */
  landed: boolean;
  /** The letter is gone and the loop is to leave it alone — reduced motion,
      where it is posted where it stood rather than flown across the desk. */
  posted: boolean;
}

export default function ContactStudio() {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const letterRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const gaugeRef = useRef<HTMLDivElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);
  const fieldRefs = useRef<Partial<Record<LetterField, HTMLElement | null>>>({});

  const [mode, setMode] = useState<Mode>("plain");
  const [phase, setPhase] = useState<Phase>("writing");
  /* The composer is open: the sheet is lifted clear of the page, everything
     behind it is dark, and the only two things on the screen are the letter
     and the keyboard. Phones only — see COMPOSE_QUERY in lib/desk-scene.ts. */
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState<LetterDraft>(emptyDraft);
  const [errors, setErrors] = useState<Partial<Record<LetterField, string>>>({});
  /* Frozen at the moment of sending. The fold layer renders this rather than
     `draft`, so a stray keystroke can never rewrite a letter mid-flight. */
  const [sealed, setSealed] = useState<LetterDraft | null>(null);
  const [dateline, setDateline] = useState(contact.dateline);

  const ids = useId();
  const fieldId = (field: LetterField) => `${ids}-${field}`;

  const live = useRef<Live>({
    studio: null,
    stage: null,
    sendAt: 0,
    flapAt: 0,
    visible: SHEET.visibleAtRest,
    target: SHEET.visibleAtRest,
    drawn: false,
    clack: 0,
    strikes: 0,
    recoil: 0,
    receive: 0,
    flap: 0,
    fold: "flat",
    last: 0,
    landed: false,
    posted: false,
  });

  /* The date is filled in after mount, not during render: this page is
     prerendered at build time, and a date baked into the HTML would both be
     wrong by the time anyone read it and disagree with the client on hydration. */
  useEffect(() => {
    setDateline(
      `${contact.dateline} · ${new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date())}`
    );
  }, []);

  /* ---------- The scene ---------- */

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;

    let cancelled = false;
    let frame = 0;
    let studio: Studio | null = null;

    (async () => {
      /* Decided once, at mount. A window that is turned round mid-visit keeps
         the stage it arrived with — the camera refits to the new shape, and a
         scene torn down and rebuilt under a half-written letter is worse than
         a scene seen from a slightly odd seat. */
      const stage = stageFor();
      if (!stage) return;
      const { createStudio, supportsWebGL } = await import("./studio-scene");
      if (cancelled || !supportsWebGL()) return;

      try {
        studio = await createStudio(canvas, stage);
      } catch {
        /* A context that exists but refuses to build a scene — a blocklisted
           driver, a lost context on wake. The form is already on the page and
           already works, so there is nothing to report and nothing to retry. */
        return;
      }
      if (cancelled) {
        studio.dispose();
        return;
      }

      live.current.studio = studio;
      live.current.stage = stage;
      setMode("scene");

      const loop = (now: number) => {
        frame = requestAnimationFrame(loop);
        step(now, studio!);
      };
      frame = requestAnimationFrame(loop);
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      live.current.studio = null;
      live.current.stage = null;
      studio?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- The frame ---------- */

  /* Everything continuous happens here, off one clock: the sheet climbing as
     someone types, the machine's answer to a keystroke, the whole send. */
  const step = useCallback((now: number, studio: Studio) => {
    const state = live.current;
    const stage = state.stage;
    if (!stage) return;
    const dt = state.last ? Math.min(now - state.last, 64) : 16;
    state.last = now;

    const letter = letterRef.current;
    const sending = state.sendAt > 0;
    const t = sending ? now - state.sendAt : 0;

    /* --- the sheet --- */
    /* Two things move it. While someone is typing it climbs out of the roller,
       eased toward whatever the line count asks for. Once the send starts it
       stops climbing and is *drawn out* instead — forward and toward the middle
       of the desk, the way a hand takes a page out of a machine. */
    const fed = sending ? easeOutCubic(beat(t, MARKS.feedStart, MARKS.feedEnd)) : 0;
    if (!sending) state.visible += (state.target - state.visible) * approach(dt, 130);

    /* --- the creases --- */
    const fold: Fold = !sending
      ? "flat"
      : t >= MARKS.upperStart
        ? "both"
        : t >= MARKS.lowerStart
          ? "lower"
          : "flat";
    if (letter && fold !== state.fold) {
      state.fold = fold;
      letter.dataset.fold = fold;
    }

    /* --- the props --- */
    state.clack *= Math.exp(-dt / 90);
    if (sending) {
      const rock = beat(t, MARKS.recoilStart, MARKS.recoilEnd);
      state.recoil = rock > 0 && rock < 1 ? decayBounce(rock) : 0;
      state.receive = 1 - beat(t, MARKS.receiveStart, MARKS.receiveEnd);
      if (t < MARKS.receiveStart) state.receive = 0;
    }

    /* The lid, off its own clock. Written as open minus shut rather than as a
       chain of cases so the two halves can overlap without a seam: `beat`
       clamps, so before its cue each term is 0 and the lid is simply shut. */
    if (state.flapAt) {
      const f = now - state.flapAt;
      state.flap = clamp01(
        easeOutCubic(beat(f, FLAP.openStart, FLAP.openEnd)) -
          easeInOutCubic(beat(f, FLAP.closeStart, FLAP.closeEnd))
      );
    }

    studio.render(
      {
        clack: state.clack,
        recoil: state.recoil,
        receive: state.receive,
        flap: state.flap,
        strikes: state.strikes,
      },
      dt
    );

    /* --- the letter, hung off the scene --- */
    if (letter && state.posted) {
      /* Nothing to place: it went into the box without a journey. Held here
         rather than left to the branch below, which would write a rest-position
         transform over it on the very next frame. */
      letter.style.opacity = "0";
    } else if (letter) {
      const flying = sending && t >= MARKS.flightStart;
      const inRoller = sheetCentre(state.visible, stage.platen);

      let point: Vec3 = inRoller;
      let lean = SHEET.lean;
      let tilt = 0;
      let turn = 0;
      let shrink = 1;
      let eaten = 0;

      if (sending) {
        point = [
          lerp(inRoller[0], stage.held[0], fed),
          lerp(inRoller[1], stage.held[1], fed),
          lerp(inRoller[2], stage.held[2], fed),
        ];
        lean = lerp(SHEET.lean, SHEET.leanHeld, fed);
      }

      if (flying) {
        const f = beat(t, MARKS.flightStart, MARKS.flightEnd);
        /* Slow away, quick across, slow in — a hand's arc, not a projectile's. */
        const eased = f < 0.5 ? easeInCubic(f * 2) / 2 : 0.5 + easeOutCubic((f - 0.5) * 2) / 2;
        point = flightPoint(eased, stage.held, stage.slot, stage.flight);
        /* Banks into the arc, then turns square to the box's face for the slot. */
        tilt = Math.sin(f * Math.PI) * ENTRY.bank;
        turn = lerp(0, stage.turn, easeInOutCubic(f));
        shrink = lerp(1, ENTRY.shrink, easeInOutCubic(f));
        /* And the last of it drops through the slot, bottom edge first. */
        eaten = easeInCubic(beat(t, MARKS.swallowStart, MARKS.flightEnd));
        point = [point[0], point[1] - ENTRY.drop * eaten, point[2]];
      }

      const at = studio.project(point);
      const scale = (at.unit * SHEET.height) / letter.offsetHeight;

      letter.style.transform =
        `translate3d(${at.x - letter.offsetWidth / 2}px, ${at.y - letter.offsetHeight / 2}px, 0)` +
        ` scale(${scale * shrink}) rotateX(${lean * 360}deg) rotateY(${turn}deg) rotateZ(${tilt}deg)`;

      /* One clip, two jobs — and they never overlap in time.

         At rest it cuts the sheet at the roller's lip. DOM cannot go behind the
         canvas, so this is what makes paper come *out of* the typewriter rather
         than hover in front of it; it is released as the sheet is drawn clear.

         At the end it stands in for the same missing occlusion at the other
         end of the journey: the folded letter is eaten from its bottom edge as
         it goes through the slot, which is a letter being posted. Fading it out
         instead — the first version did — is a letter dissolving in mid-air.

         Both are measured in the element's own pixels, because the clip lands
         before the transform that scales it. */
      const third = letter.offsetHeight / 3;
      let cut = 0;
      if (eaten > 0) {
        /* From the bottom of the folded band up through it. */
        cut = third * (1 + eaten);
      } else if (fed < 1) {
        const lip = studio.project(stage.platen);
        const below = (at.y + (letter.offsetHeight / 2) * scale - lip.y) / scale;
        cut = Math.max(0, Math.min(below, letter.offsetHeight)) * (1 - fed);
      }
      letter.style.clipPath = cut > 0.5 ? `inset(0 0 ${cut}px 0)` : "";
      /* Only the last sliver fades, so the very end is not a hard pop. */
      letter.style.opacity = eaten > 0.86 ? String(1 - (eaten - 0.86) / 0.14) : "";
    }

    /* --- landing --- */
    if (sending && !state.landed && t >= MARKS.deliveredAt) {
      state.landed = true;
      settle();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- Typing ---------- */

  /* How far the sheet should be standing out of the roller: far enough to show
     everything written on it, plus the one blank line the caret is about to
     move onto. That is the reveal — paper feeding up a line at a time to meet
     the typing, which is the whole reason the machine is drawn at all.

     The height comes from the gauge, not from the textarea. A textarea's
     scrollHeight is floored at its own client height, and this one is stretched
     down the sheet by `flex: 1`, so it reports the same number for one line as
     for ten. The gauge is the same text at the same width with no height of its
     own, so its height *is* the height of the writing. */
  const measureReveal = useCallback(() => {
    const body = bodyRef.current;
    const gauge = gaugeRef.current;
    const letter = letterRef.current;
    if (!body || !gauge || !letter) return SHEET.visibleAtRest;
    const line = parseFloat(getComputedStyle(body).lineHeight);
    if (!line) return SHEET.visibleAtRest;
    /* Summed up the offsetParent chain rather than read in one go: the cue's
       wrapper is a positioning context, so the textarea's own offsetTop stops
       being "within the sheet" the moment anything is interposed. Layout
       offsets, not getBoundingClientRect — the letter wears a scale transform,
       and rects measure after it while offsetHeight measures before. */
    let top = 0;
    for (
      let node: HTMLElement | null = body;
      node && node !== letter;
      node = node.offsetParent as HTMLElement | null
    ) {
      top += node.offsetTop;
    }
    return revealFor(top + gauge.offsetHeight + line, letter.offsetHeight);
  }, []);

  /* Paper only ever feeds one way. Deleting a paragraph does not wind the sheet
     back into the roller, so the reveal is a high-water mark rather than a
     reading — without the `max`, cutting text would run the machine backwards.
     A fresh sheet resets it; see `writeAnother`. */
  const feed = useCallback(() => {
    const state = live.current;
    if (state.drawn) return;
    state.target = Math.max(state.target, measureReveal());
  }, [measureReveal]);

  /* The gauge is written here rather than rendered, because it is a measuring
     device and not content: React would put the new text in a tick later, and
     the sheet would spend that tick answering the keystroke before last.

     It holds the message and nothing else \u2014 never the placeholder. The
     placeholder is a hint, not typing, and an early version measured it as if
     it were: the sheet stood four lines out of the roller before a key had
     been pressed, which is the "too much paper at rest" this reveal exists to
     avoid. A fresh sheet shows the top of the page down to the caret's first
     line; the rest of the hint waits under the roller, and typing brings the
     page up through it line by line. (The zero-width space gives an empty
     message the height of that one caret line.) */
  useEffect(() => {
    const gauge = gaugeRef.current;
    if (gauge) gauge.textContent = `${draft.message}\u200b`;
    feed();
  }, [draft.message, feed]);

  /* And once more when the mono face the gauge is measured in actually arrives.
     Measured against a fallback metric the placeholder wraps a line early or
     late, and the sheet settles at the wrong height and stays there. */
  useEffect(() => {
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) feed();
    });
    return () => {
      cancelled = true;
    };
  }, [feed]);

  const onField = (field: LetterField) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = event.target.value;
    setDraft((current) => ({ ...current, [field]: value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));

    live.current.clack = 1;
    live.current.strikes += 1;
  };

  /* Reaching for the signature draws the whole page out of the machine: a
     letter is signed in the hand, not in the roller, and the blanks are at the
     foot of the sheet where the reveal has not reached. It does not go back in
     afterwards — `drawn` is what stops the message field pulling it down again
     on the next keystroke. */
  const onSign = () => {
    live.current.drawn = true;
    live.current.target = SHEET.visibleMax;
    openComposer();
  };

  /* ---------- The composer ---------- */

  /* Opened by touching any blank on the sheet, and closed by touching
     anything that is not one. There is deliberately no `blur` handler: a blur
     fires before the click that caused it, so closing on blur would drop the
     page back to its resting layout in the instant between someone pressing
     the send button and that press landing — and the button would no longer
     be under the finger. Everything except the sheet and that button is
     behind the scrim, so a tap on the scrim is the only "outside" there is,
     and it says so explicitly. */
  const openComposer = useCallback(() => {
    if (window.matchMedia(COMPOSE_QUERY).matches) setComposing(true);
  }, []);

  const closeComposer = useCallback(() => {
    setComposing(false);
    /* The keyboard goes with it. Left focused, iOS keeps the keyboard up over
       a page that has just stopped making room for it. */
    (document.activeElement as HTMLElement | null)?.blur();
  }, []);

  /* Where the keyboard's top edge is.

     `100svh` is the viewport a phone has before a keyboard opens, and once one
     is up it is roughly half a screen too tall — so the composer cannot be
     sized in it. visualViewport is the part still being looked at, and it is
     the only thing that knows. `offsetTop` matters as much as `height`: the
     composer is fixed, fixed boxes are laid out against the *layout* viewport,
     and on iOS a focused field scrolls that viewport out from under them. The
     pair of them put the sheet back over the part of the screen that is
     actually visible, on every frame the keyboard or the page moves. */
  useEffect(() => {
    const root = document.documentElement;
    if (!composing) {
      delete root.dataset.composing;
      root.style.removeProperty("--compose-top");
      root.style.removeProperty("--compose-h");
      return;
    }
    root.dataset.composing = "";

    const view = window.visualViewport;
    const sync = () => {
      root.style.setProperty("--compose-top", `${view ? view.offsetTop : 0}px`);
      root.style.setProperty("--compose-h", `${view ? view.height : window.innerHeight}px`);
    };
    sync();
    view?.addEventListener("resize", sync);
    view?.addEventListener("scroll", sync);
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeComposer();
    };
    window.addEventListener("keydown", key);

    return () => {
      view?.removeEventListener("resize", sync);
      view?.removeEventListener("scroll", sync);
      window.removeEventListener("keydown", key);
    };
  }, [composing, closeComposer]);

  /* ---------- The paper plane ---------- */

  /* Where the sheet is, and where it is going.

     Both are measured rather than written down, because neither is knowable
     from here: the sheet's size is whatever the phone left it after the lead
     and the button took their share, and the corner is wherever the corner is
     from that. The numbers go onto the stage as custom properties and the
     plane — a fixed element, so it can leave the screen without handing the
     document a sideways scrollbar — reads them from there. Writing them on an
     ancestor rather than on the plane itself is what lets this run before the
     plane exists: it is rendered by the same click that calls this, one React
     commit later, and custom properties inherit.

     The destination is a sheet's width past the top-right corner, so the
     plane is gone before it fades rather than fading because it has stopped.
     --fly-turn is the bearing of that trip, and the dart is drawn nose-up, so
     it is the angle of the throw plus a quarter turn. */
  const aimPlane = useCallback(() => {
    const letter = letterRef.current;
    const stage = stageRef.current;
    if (!letter || !stage) return;

    const box = letter.getBoundingClientRect();
    stage.style.setProperty("--plane-x", `${box.left}px`);
    stage.style.setProperty("--plane-y", `${box.top}px`);
    stage.style.setProperty("--plane-w", `${box.width}px`);
    stage.style.setProperty("--plane-h", `${box.height}px`);

    const overshoot = box.width * PLANE_OVERSHOOT;
    const x = window.innerWidth + overshoot - (box.left + box.width / 2);
    const y = -overshoot - (box.top + box.height / 2);
    stage.style.setProperty("--fly-x", `${x}px`);
    stage.style.setProperty("--fly-y", `${y}px`);
    stage.style.setProperty("--fly-turn", `${(Math.atan2(y, x) * 180) / Math.PI + 90}deg`);
  }, []);

  /* The four beats, once the plane is on the page.

     Timeouts rather than a clock, and that is a different call from the one
     the scene makes — there the beats are frames of one continuous motion and
     drift between them is visible; here each beat is a CSS transition that
     owns its own timing, and a late `data-fold` only means the hinge starts
     late, not that two halves of one move come apart.

     The first state is set a frame late on purpose. A transition needs a
     frame at its starting value to have something to transition *from*, and
     an element that is inserted already folded has simply always been folded.
     Two frames, because one is not reliably enough after a commit. */
  useEffect(() => {
    const plane = planeRef.current;
    if (!plane || !sealed || mode !== "plain") return;

    if (document.documentElement.dataset.motion === STILL_FLAG) {
      /* No aim and no throw: it is folded, and then it is not there. */
      plane.dataset.shape = "dart";
      const quiet = window.setTimeout(() => {
        if (planeRef.current) planeRef.current.dataset.fly = "gone";
      }, STILL_DURATION);
      return () => window.clearTimeout(quiet);
    }

    const at = (ms: number, part: "fold" | "shape" | "fly", value: string) =>
      window.setTimeout(() => {
        if (planeRef.current) planeRef.current.dataset[part] = value;
      }, ms);

    let first = 0;
    const frame = requestAnimationFrame(() => {
      first = requestAnimationFrame(() => {
        if (planeRef.current) planeRef.current.dataset.fold = "crease";
      });
    });
    const timers = [
      at(PLANE.dartAt, "shape", "dart"),
      at(PLANE.bankAt, "fly", "bank"),
      at(PLANE.flightAt, "fly", "away"),
    ];

    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(first);
      timers.forEach(window.clearTimeout);
    };
  }, [sealed, mode]);

  /* ---------- Sending ---------- */

  const outcome = useRef<Promise<boolean> | null>(null);

  const settle = useCallback(() => {
    (async () => {
      const ok = await (outcome.current ?? Promise.resolve(true));
      /* Three endings, not two. With an endpoint configured the letter really
         has been posted and "delivered" is the truth; without one the animation
         is the whole of what happened, and saying "posted" would be a claim
         about a message that is still sitting in this tab. */
      setPhase(!ok ? "failed" : contactEndpoint ? "delivered" : "handoff");
      /* And the room comes back up, on the same beat. The composer is held
         open through the whole send on purpose — the letter is folded and
         thrown from where it was being written, over the dark, rather than
         dropped back onto the page first and folded there. */
      setComposing(false);
      if (!ok) {
        /* The letter comes back out of the box with every word still in it —
         and the box shuts behind it, or the lid stands open over a letter that
         never went in. */
        const state = live.current;
        state.sendAt = 0;
        state.flapAt = 0;
        state.flap = 0;
        state.posted = false;
        state.fold = "flat";
        state.drawn = true;
        state.target = SHEET.visibleMax;
        const letter = letterRef.current;
        if (letter) {
          letter.dataset.fold = "flat";
          letter.style.opacity = "";
          letter.style.clipPath = "";
        }
        setSealed(null);
      }
    })();
  }, []);

  /* The next blank still to fill, in the order someone writing a letter would
     reach them — or null when the letter is finished. It is what the button
     asks for and where the button sends you, so the label and the behaviour
     cannot disagree about which blank is next. */
  const blank: LetterField | null = !draft.message.trim()
    ? "message"
    : !draft.name.trim()
      ? "name"
      : !draft.email.trim()
        ? "email"
        : null;

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (phase === "sending") return;

    /* An unfinished letter is not a failed one. While a blank is still blank
       the button was asking for it by name, so pressing it takes you there and
       says nothing else — scolding someone in red for not having filled in a
       field the button just invited them to fill in is a form arguing with
       itself. Errors are kept for what is written but wrong: an address that
       cannot be replied to. */
    if (blank) {
      if (blank === "message") bodyRef.current?.focus();
      else {
        onSign();
        fieldRefs.current[blank]?.focus();
      }
      return;
    }

    const found = validate(draft);
    if (Object.keys(found).length) {
      setErrors(found);
      const first = firstError(found);
      if (first) fieldRefs.current[first]?.focus();
      return;
    }

    setSealed({ ...draft });
    setPhase("sending");
    /* The keyboard is done with; the composer is not, and stays until the
       letter has landed. Blurring here rather than closing means the sheet
       keeps its lifted position for the fold, and the plane is aimed from it. */
    (document.activeElement as HTMLElement | null)?.blur();

    /* On the tall stage the button sits under a stage most of a screen high,
       so the box the letter is about to fly into can be above the fold when
       the button is pressed. The stage is brought fully into view first — the
       smallest scroll that does it, and none at all where it already is,
       which is every wide screen. Smooth unless the visit asked for the quiet
       version. */
    stageRef.current?.scrollIntoView({
      block: "nearest",
      behavior: document.documentElement.dataset.motion === STILL_FLAG ? "auto" : "smooth",
    });

    /* Nothing navigates here. An earlier version handed the letter straight to
       the visitor's mail client inside this click — which is the only moment a
       browser will allow it — and the cost was a mail window thrown over the
       send at the instant it began, which is both startling and a spoiler.

       So the mail client is now offered afterwards, as a button in the panel
       below, and the send is allowed to be the send. With an endpoint — the
       site's own /api/contact by default — that step never appears: the letter
       is posted over the wire while the animation plays, with nothing to click. */
    outcome.current = contactEndpoint ? postLetter(draft) : Promise.resolve(true);

    const still = document.documentElement.dataset.motion === STILL_FLAG;

    live.current.landed = false;
    if (mode === "scene" && !still) {
      const at = performance.now();
      live.current.sendAt = at;
      live.current.flapAt = at + MARKS.flapAt;
    } else if (mode === "scene") {
      /* A box to answer, and the quiet ending asked for. The letter is sealed
         and gone where it stood, and the lid is the whole acknowledgement —
         without it the letter vanishes and the scene never answers, which is
         the difference between "posted" and "lost". Cued now rather than at
         MARKS.flapAt because there is no flight for it to wait for. */
      const letter = letterRef.current;
      if (letter) letter.dataset.fold = "both";
      live.current.posted = true;
      live.current.flapAt = performance.now();
      window.setTimeout(settle, STILL_DURATION);
    } else {
      /* No scene, so no box: the sheet becomes a paper plane instead. The
         folds themselves are run by the `plane` effect below — it needs the
         thing in the document before it can start moving it — and all this
         does is aim it and start the clock the panel changes over on. */
      aimPlane();
      window.setTimeout(settle, still ? STILL_DURATION : PLANE.deliveredAt);
    }
  };

  const writeAnother = () => {
    setPhase("writing");
    setComposing(false);
    setSealed(null);
    setDraft(emptyDraft);
    setErrors({});
    const state = live.current;
    state.sendAt = 0;
    state.flapAt = 0;
    state.flap = 0;
    state.landed = false;
    state.posted = false;
    state.drawn = false;
    state.fold = "flat";
    state.visible = SHEET.visibleAtRest;
    state.target = SHEET.visibleAtRest;
    const letter = letterRef.current;
    if (letter) {
      letter.dataset.fold = "flat";
      letter.style.opacity = "";
      letter.style.clipPath = "";
    }
    bodyRef.current?.focus();
  };

  const state: Phase = phase;
  /* Handoff counts as delivered here. The two endings differ in what the panel
     below offers — one of them still has a mail client to open — but the sheet
     itself is equally gone in both, and a letter that reappears on the desk
     once it has been folded and sent is a letter that was never sent. Only a
     failure brings it back, with every word still in it. */
  const letterState =
    state === "sending"
      ? "sealing"
      : state === "delivered" || state === "handoff"
        ? "delivered"
        : "writing";

  return (
    <div className="studio">
      <header className="studio-head">
        <p className="widget-label">{contact.label}</p>
        <h1 className="studio-line">{contact.line}</h1>
      </header>

      {/* `data-empty` once the sheet has left and is not coming back. Only the
          phone layout reads it, and what it does there is let the stage give
          its height up: the scene still has a desk to show after a send, and
          a phone is left with a sheet-shaped hole between the lead and the
          acknowledgement. Giving it back puts the reply, and the button that
          writes another, where the letter was. */}
      {/* The room going dark behind the letter.

          A real button, not a decorated div: it is the way out of the
          composer, it is the only way out that is not the keyboard's own
          dismiss key, and a tap target covering the whole screen with no name
          on it is invisible to anyone not looking at it. It sits before the
          sheet in the source so that the sheet, which is lifted over it, is
          also the next thing after it in the tab order. */}
      <button
        type="button"
        className="compose-scrim"
        data-open={composing ? "" : undefined}
        onClick={closeComposer}
        tabIndex={composing ? 0 : -1}
        aria-hidden={composing ? undefined : true}
      >
        <span className="sr-only">{contact.compose.close}</span>
      </button>

      <div
        className="studio-stage"
        ref={stageRef}
        data-mode={mode}
        data-writing={composing ? "" : undefined}
        data-empty={letterState === "delivered" ? "" : undefined}
      >
        {/* The scene, or nothing at all. The element is always here because
            the scene needs somewhere to build and decides at mount whether it
            is going to — but where it decides not to, the desk is not
            described to anybody: a phone that draws no typewriter and no
            letterbox must not announce two props that are not on the page. */}
        <canvas
          className="studio-canvas"
          ref={canvasRef}
          role={mode === "scene" ? "img" : undefined}
          aria-label={mode === "scene" ? contact.sceneAlt : undefined}
          aria-hidden={mode === "scene" ? undefined : true}
        />

        <div className="letter" ref={letterRef} data-state={letterState} data-fold="flat">
          <form className="letter-face" onSubmit={onSubmit} id={`${ids}-form`} noValidate>
            <p className="letter-dateline">{dateline}</p>
            <p className="letter-salutation">{contact.salutation}</p>

            <label className="sr-only" htmlFor={fieldId("message")}>
              {contact.fields.message.srOnly}
            </label>
            {/* The wrapper exists for the cue: a blinking block cursor over
                the first character cell, standing in for the caret before the
                sheet has focus. A sheet of paper offers no affordance at all —
                nothing looks like a field — so the machine shows where the
                next letter will land, the way a terminal does. It is CSS-only:
                shown while the message is empty and unfocused, gone the moment
                either changes, and the native caret blinks on in the same
                cell. */}
            <div className="letter-writing">
              <textarea
                className="letter-body"
                id={fieldId("message")}
                ref={(node) => {
                  bodyRef.current = node;
                  fieldRefs.current.message = node;
                }}
                value={draft.message}
                onChange={onField("message")}
                onFocus={openComposer}
                placeholder={contact.placeholder}
                aria-invalid={Boolean(errors.message)}
                aria-describedby={errors.message ? `${fieldId("message")}-error` : undefined}
                spellCheck
              />
              <span className="letter-cue" aria-hidden="true" />
            </div>
            {errors.message && (
              <p className="letter-error" id={`${fieldId("message")}-error`}>
                {errors.message}
              </p>
            )}

            {/* The gauge: the same text, at the same width, in the same face,
                with no height of its own — so its height is the height of the
                writing and the sheet knows how far to feed. Written by hand in
                an effect, never rendered; see the reveal above. */}
            <div className="letter-gauge" ref={gaugeRef} aria-hidden="true" />

            <div className="letter-sign">
              <span className="letter-dash" aria-hidden="true">
                —
              </span>
              <span className="letter-blanks">
                <label className="sr-only" htmlFor={fieldId("name")}>
                  {contact.fields.name.label}
                </label>
                <input
                  className="letter-blank"
                  id={fieldId("name")}
                  ref={(node) => {
                    fieldRefs.current.name = node;
                  }}
                  value={draft.name}
                  onChange={onField("name")}
                  onFocus={onSign}
                  placeholder={contact.fields.name.placeholder}
                  autoComplete="name"
                  aria-invalid={Boolean(errors.name)}
                />
                {errors.name && <p className="letter-error">{errors.name}</p>}

                <label className="sr-only" htmlFor={fieldId("email")}>
                  {contact.fields.email.label}
                </label>
                <input
                  className="letter-blank"
                  id={fieldId("email")}
                  ref={(node) => {
                    fieldRefs.current.email = node;
                  }}
                  type="email"
                  value={draft.email}
                  onChange={onField("email")}
                  onFocus={onSign}
                  placeholder={contact.fields.email.placeholder}
                  autoComplete="email"
                  aria-invalid={Boolean(errors.email)}
                />
                {errors.email && <p className="letter-error">{errors.email}</p>}
              </span>
            </div>
          </form>

          {/* The fold layer. Three windows onto the same still copy of the sheet,
              hinged on the creases they share — see the fold block in
              app/globals.css. Identical to the live form by construction: same
              elements, same classes, same metrics, only frozen and inert.

              Only where there is a box to fold a letter *for*. On a phone the
              sheet is folded the other way — see the plane below — and a
              letter cannot be folded both ways at once. */}
          {sealed && mode === "scene" && (
            <div className="letter-seal" aria-hidden="true">
              <div className="seal-mid">
                <SealBand band={1} draft={sealed} dateline={dateline} />
                <div className="seal-flap seal-flap--lower">
                  <SealBand band={2} draft={sealed} dateline={dateline} />
                </div>
                <div className="seal-flap seal-flap--upper">
                  <SealBand band={0} draft={sealed} dateline={dateline} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* The plane. A sibling of the sheet rather than a child of it,
            because the sheet carries a `perspective` and an element with one
            is the containing block for every fixed descendant under it — the
            plane would be pinned to the sheet it is trying to leave.

            Laid exactly over that sheet at the moment of sending and given
            the same writing to fold, so the handover is invisible; the live
            face underneath hides in the same frame. The three attributes are
            the three things happening to it, and the effect above sets them
            on the beat. See the plane block in app/globals.css. */}
        {sealed && mode === "plain" && (
          <div
            className="plane"
            ref={planeRef}
            aria-hidden="true"
            data-fold="flat"
            data-shape="sheet"
            data-fly="held"
          >
            <div className="plane-sheet">
              <PlaneHalf side="right" draft={sealed} dateline={dateline} />
              <PlaneHalf side="left" draft={sealed} dateline={dateline} />
            </div>
            <div className="plane-dart">
              <span className="plane-wing plane-wing--far" />
              <span className="plane-wing plane-wing--near" />
            </div>
          </div>
        )}
      </div>

      {/* One slot, four things that can be standing in it. Written out rather
          than folded into one conditional: the three endings differ in what
          they *offer*, not only in what they say, and a chain of ternaries
          across a button, a link and a mail handoff reads as a puzzle. */}
      <div className="studio-foot" data-writing={composing ? "" : undefined}>
        {(state === "writing" || state === "sending") && (
          <>
            {/* The button names the next blank until there is no next blank.
                Not disabled while the letter is unfinished — a dead button
                explains nothing, and this one is the instructions. */}
            <button
              className="btn-ink"
              type="submit"
              form={`${ids}-form`}
              data-prompting={blank ? "" : undefined}
              disabled={state === "sending"}
            >
              {state === "sending"
                ? contact.sending
                : blank === "message"
                  ? contact.prompts.message
                  : blank
                    ? contact.prompts.sign
                    : contact.send}
            </button>
            <p className="studio-aside">
              {contact.aside}
              <a className="contact-email link-sweep" href={`mailto:${identity.email}`}>
                {identity.email}
              </a>
            </p>
          </>
        )}

        {state === "delivered" && (
          <div className="studio-note" data-tone="delivered" role="status">
            <button className="btn-ink" type="button" onClick={writeAnother}>
              {contact.delivered.again}
            </button>
            <p className="studio-aside">
              <span className="studio-note-label">{contact.delivered.label}</span>
              {mode === "scene" ? contact.delivered.line : contact.delivered.flown}
            </p>
          </div>
        )}

        {state === "handoff" && (
          <div className="studio-note" data-tone="handoff" role="status">
            {/* A link, not a scripted navigation: the visitor clicks it, so
                no browser has any reason to block or query it. */}
            <a className="btn-ink" href={mailtoHref(draft)}>
              {contact.handoff.open}
            </a>
            <p className="studio-aside">
              <span className="studio-note-label">{contact.handoff.label}</span>
              {contact.handoff.line}
            </p>
            <div className="studio-note-row">
              <button className="studio-again" type="button" onClick={writeAnother}>
                {contact.handoff.again}
              </button>
            </div>
          </div>
        )}

        {state === "failed" && (
          <div className="studio-note" data-tone="failed" role="status">
            <button className="btn-ink" type="button" onClick={writeAnother}>
              {contact.failed.retry}
            </button>
            <p className="studio-aside">
              <span className="studio-note-label">{contact.failed.label}</span>
              {contact.failed.line}{" "}
              <a className="contact-email link-sweep" href={mailtoHref(draft)}>
                {identity.email}
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/** The sheet as it was at the moment of sending: the same page, frozen.

    A real textarea and real inputs, readonly. Rendering these as paragraphs
    would re-wrap the text a pixel differently and the swap from live sheet to
    sealed one would flicker. The writing wrapper is kept for the same reason —
    same elements, same metrics — though its cue can never show: a sealed
    letter always has a message.

    Both folds render it. Every window either of them opens is a window onto
    this, which is what lets the paper move while the writing stays put. */
function StillFace({ draft, dateline }: { draft: LetterDraft; dateline: string }) {
  return (
    <div className="letter-face">
      <p className="letter-dateline">{dateline}</p>
      <p className="letter-salutation">{contact.salutation}</p>
      <div className="letter-writing">
        <textarea className="letter-body" value={draft.message} readOnly tabIndex={-1} />
      </div>
      <div className="letter-sign">
        <span className="letter-dash">—</span>
        <span className="letter-blanks">
          <input className="letter-blank" value={draft.name} readOnly tabIndex={-1} />
          <input className="letter-blank" value={draft.email} readOnly tabIndex={-1} />
        </span>
      </div>
    </div>
  );
}

/** One third of the sealed sheet, shown through a window that tall. */
function SealBand({
  band,
  draft,
  dateline,
}: {
  band: 0 | 1 | 2;
  draft: LetterDraft;
  dateline: string;
}) {
  return (
    <div className="seal-clip">
      <div className="seal-page" data-band={band}>
        <StillFace draft={draft} dateline={dateline} />
      </div>
    </div>
  );
}

/** One half of the sheet the plane is folded from, shown through a window
    that wide. The left half is the one that turns; both are the same page,
    slid under their own window, so the crease runs down writing that does
    not move with it. */
function PlaneHalf({
  side,
  draft,
  dateline,
}: {
  side: "left" | "right";
  draft: LetterDraft;
  dateline: string;
}) {
  return (
    <div className={`plane-half plane-half--${side}`}>
      <div className="plane-clip">
        <div className="plane-page">
          <StillFace draft={draft} dateline={dateline} />
        </div>
      </div>
    </div>
  );
}
