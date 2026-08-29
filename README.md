# Connexion

**American Express AI Innovation Hackathon 2026, Round 1 prototype.**
React + TypeScript + Vite, frontend only — no backend, no API keys, nothing
leaves the browser.

Connexion is a merchant data layer built on American Express's closed loop.
Merchants are nodes. Edges are complementary relationships inferred from card
transactions Amex already processes: customer overlap, and sequential spend
patterns such as "visits A, then B within two weeks." Everything in the product
reads from that one graph.

> **This is a demo, not a production build.** Every merchant, figure and score
> is synthetic, invented to show the system's reasoning. No American Express
> data is used, and nothing here is an American Express product. Business names
> are invented; the US cities and neighbourhoods are real, because attaching
> fabricated financials to real named companies would be a false claim about
> somebody's actual business. Anything that reads as AI-generated — the "AI
> explainability layer" on a match, the recruit pitch copy, the drafted outreach
> emails — is precomputed local text, not a live model call.

## Two roles, one graph

The app opens on a role chooser (`RoleSelectView`), because Connexion is two
interfaces over one graph.

### Amex admin — Gap Radar

One view: a carousel of 8 merchant clusters (three.js scenes, drag to rotate),
5 of which have a named structural gap — a category missing from an otherwise
tightly-overlapping cluster — and 3 of which are fully covered. Below the
carousel, a table of recruit targets for the current cluster's gap, ranked by
an "Amex fit" score (projected uplift 50%, confirmed merchant demand 25%, a
real-world growth signal 25%).

That growth signal is the "Growing match" column: it cross-checks the recruit
target's category and city against a separate, market-wide dataset of 57 real
US small businesses (on Amex or not), so the table can point at an actual,
currently-growing business that fits the gap — not just the one hand-picked
example prospect.

- **Why acquire →** opens a read-only breakdown of the fit score's three
  weighted factors.
- **Generate pitch →** opens the recruit pitch (reasoning, projected uplift,
  who's already waiting for a partner like this) plus a drafted outreach email
  you can edit, copy, or "send" — sending is simulated and says so, and every
  address uses the reserved `.example` domain.

### SME — Your standing, Matching

**Your standing** is a percentile read against nearby comparable merchants:
rank, a sales-vs-peer-median trend chart, and a nudge toward Matching when the
merchant is trailing.

**Matching** runs three gates before the actual queue:

1. **Consent**, given per clause (showing your business to other merchants,
   using card data to compute a match score, releasing contact details on a
   mutual match), dated, and reviewable/revocable at any time from the
   sidebar.
2. **A short preferences quiz** — what kind of partnership you're looking for.
   This reorders the queue; it does not change the score.
3. The **swipe queue** itself: 25 candidates already on Amex, ranked by a match
   score out of 100 — customer profile overlap 35%, industry overlap 25%,
   business value (uplift, penalized for lopsidedness) 25%, openness to
   collaborate 15%.

Swiping right sends a private like. It only becomes a match — dialog, contact
details, a drafted introduction email — once the other side likes back too.
Likes that haven't been returned yet sit in a separate Requests tab.

## Running it

```bash
npm install
npm run dev
```

No backend and no API keys. Open the URL Vite prints, usually
`http://localhost:5173`.

```bash
npm run build
npm run preview
```

## Where things live

```
src/
  data/
    graphEngineData.ts     25 match candidates and 9 recruit prospects
    graphSceneConfigs.ts   the 8 industry clusters' node/edge layout
    usMerchants.ts         57 US merchants behind the growing-match cross-check
  utils/
    matchScore.ts          the weighted 100 point SME match score
    prospectScore.ts       the weighted Gap Radar "Amex fit" score
    gapMatch.ts            cross-checks a recruit prospect against usMerchants.ts
    outreachEmails.ts      the drafted recruit and introduction emails
    graphIcons.ts          inline-SVG icon set for the graph nodes
    interaction3d.ts       the pointer-driven tilt/press behaviour on controls
  components/
    AmexCard3D.tsx              the card on the role picker, drawn procedurally, grabbable
    ConsentGate.tsx             the three-clause consent form
    PreferencesStep.tsx         the partnership-goals quiz
    GraphCanvas.tsx             the three.js cluster graph, shared across Gap Radar's carousel
    MatchModal.tsx              the match dialog and Amex's proposal preview
    PitchModal.tsx              the recruit pitch dialog
    ProspectAnalysisModal.tsx   the "why acquire" fit-score breakdown
    EmailComposer.tsx           editable, copyable, simulated-send email draft
    MerchantMark.tsx            each merchant's drawn brand monogram
    BenefitCharts.tsx           the uplift bar chart and 6-month ramp chart
  views/
    RoleSelectView.tsx      role chooser, the app's entry point
    GapRadarView.tsx        Amex admin's one view
    StandingView.tsx        SME landing
    MatchingView.tsx        consent, quiz, queue and requests
```

A few earlier-iteration files (`OverviewView.tsx`, `IntroDraft.tsx`,
`InsightPreview.tsx`, `utils/circuitScore.ts`, `utils/projectedInsight.ts`)
are still in the tree but no longer imported anywhere — safe to delete
whenever someone gets to it.

## What would change for a real build

- The synthetic data files would be replaced by real anonymised, aggregated
  transaction data, subject to Amex's aggregation thresholds and per-merchant
  consent.
- `matchScore.ts` and `prospectScore.ts` are stated weighted heuristics. A
  production version would need a real collaborative-filtering approach for
  matching, and real graph completion for gap detection.
- Cluster and graph node positions in `graphSceneConfigs.ts` are hand-placed
  for a stable demo rather than computed from a force-directed layout over the
  full network.
- Relationship tiers and growth figures are static fields rather than computed
  from redemption and transaction data over time.
- The "AI explainability layer" text, the recruit pitch copy, and the drafted
  emails are all composed locally from each card's own numbers. A real build
  would generate them with a model call grounded in the same figures.
