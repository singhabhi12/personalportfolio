# Handoff: Claude Design project → local Claude Code (VS Code)

This runs entirely on your machine, in your local Claude Code CLI — this Cowork session can't drive it directly (design-system auth needs an interactive terminal, which only your local install has). Here's the exact sequence.

---

## 0. Get the repo onto your machine

You already have it: `portfolio-source.zip`, sent earlier in this conversation. Unzip it and open the folder in VS Code:

```
unzip portfolio-source.zip -d portfolio
cd portfolio
code .
```

If you'd rather start fresh from just the Claude Design output, skip this — step 2 below works against any repo, empty or not.

---

## 1. Open a terminal in VS Code and start Claude Code

```
claude
```

(inside the `portfolio` folder, so it operates on the right repo)

---

## 2. Authorize design-system access — one time

```
/design-login
```

This is the step that fails in Cowork (no interactive terminal here) but works fine in your local VS Code terminal. Follow the browser prompt it opens; it grants Claude Code read access to your claude.ai Design projects.

---

## 3. Pull the design in

Try the built-in skill first:

```
/design-sync
```

If Claude Code asks which project, give it the exact name of your Claude Design project (whatever you named it when you ran the A1–A12 prompts). It will list components, diff them against what's already in the repo, and sync incrementally — not a wholesale overwrite, so it won't clobber `lib/content.ts` or anything you've hand-edited.

**If `/design-sync` isn't available locally** (older Claude Code version, or the skill isn't installed), ask directly instead:

```
Use the DesignSync tool to list my Claude Design projects, find the one for my portfolio,
and pull its components into this repo. Match them against DESIGN_PLAN.md and
CODE_PLAN.md in this folder, and implement following the B1–B7 prompts in PROMPT_PACK.md
and PROMPT_PACK_ADDENDUM.md.
```

Claude Code has the same `DesignSync` tool this session tried to use — it just needs the local auth from step 2 to actually call it.

---

## 4. Point it at your plans

Make sure these are in the repo root before you start (all delivered earlier in this conversation — re-download from the project's `claude/` folder if you don't have local copies):

- `DESIGN_PLAN.md`
- `CODE_PLAN.md`
- `PROMPT_PACK.md`
- `PROMPT_PACK_ADDENDUM.md`
- `PORTFOLIO_DESIGN_SOURCE_OF_TRUTH_1.md` (the v2.1 constitution — this is what's in your project instructions)

Claude Code will read these as it implements, the same way this session did. Then run the B1 → B7 prompts from the pack in order.

---

## If Claude Design has no "project" to sync (you used chat, not the Design workspace)

Some Claude Design sessions produce components as chat artifacts rather than a saved Design *project* — in that case there's nothing for `/design-login` + `/design-sync` to point at. Two fallbacks:

1. **In Claude Design**, check for a "Send to Claude Code" / export action on the project or on individual screens — if present, it seeds a workspace directly and skips all of the above.
2. **Manual export** — copy each screen's generated code from Claude Design (most screens have a code/export panel), paste into files under `components/` in the repo, then tell local Claude Code: *"I've pasted the Claude Design output for [screen] into components/[Name].tsx — reconcile it against globals.css tokens and CODE_PLAN.md's component rules."*

---

## Order of operations, start to finish

1. Run A1 → A8 (+ A9 → A12 from the addendum) in Claude Design, reviewing each stage.
2. Unzip the repo, open in VS Code, `claude`.
3. `/design-login` once.
4. `/design-sync` (or the manual DesignSync prompt above) to pull the approved screens in.
5. Run B1 → B7 from the prompt packs for anything Design didn't cover (asset pipeline, case study routing, Phase 2 hooks).
6. Run C1 → C5 for content, SEO, deploy, and accessibility.
