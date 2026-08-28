# Connexion

**American Express AI Innovation Hackathon 2026, Round 1 prototype.**
React + TypeScript + Vite, frontend only.

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
> somebody's actual business.

## Two roles, two products

The app opens on a role chooser, because Connexion is two interfaces over one
graph.

### Amex admin

| View | What it does |
| --- | --- |
| **Growth Radar** | The fastest growing small businesses in the region, ranked on 12 month card volume across 50 merchants in 28 US cities. Some are not on Amex, which is the point: the radar sees a business before it is a customer, so the same screen is a portfolio view and an acquisition list. |
| **Overview** | The graph model, and the way into the three prongs. |
| **Graph** | The full merchant graph as a three.js scene that builds itself in and rotates. Node colour is industry, dashed edges are weak cross cluster signal, a gold line marks a Tier 3 structural relationship, and red wireframe markers are structural gaps. |
| **Matching** | The matching queue as the merchant sees it. |
| **Gap Radar** | Clusters with strong mutual overlap but a missing category, plus who to recruit to fill each one. |
| **Recruit Pitch** | The pitch a not yet Amex business is shown, and a recruitment email that can be dispatched to a selected list of prospects. |

### SME

| View | What it does |
| --- | --- |
| **Your standing** | Where the merchant sits against comparable merchants nearby, ranked on card sales. Position first, revenue underneath, a hoverable month by month chart, and a recommended action when they trail the median. |
| **Matching** | Consent, then the queue, then requests. |

## How matching works

**Consent first.** Matching is off until the merchant agrees to three things
separately: showing their name and logo to other participating merchants, using
their card data to compute a match score, and releasing contact details on a
mutual match. All three are required, the button says so, and consent is dated,
reviewable and revocable from the sidebar afterwards. This is what authorises
the brand reveal on the cards.

**A match score out of 100**, weighted across four stated factors:

| Factor | Weight | What it protects against |
| --- | --- | --- |
| Customer profile | 35% | A partnership nobody crosses between |
| Industry overlap | 25% | Partnering with a competitor |
| Business value | 25% | Lopsided value, the failure mode that sank Plenti |
| Openness to collaborate | 15% | A merchant who never opens the app or replies |

Business value prices lopsidedness into the score rather than reporting it
beside the score. Openness reads how recently the merchant opened Connexion and
how often they reply, so a dormant merchant is marked down.

**A like is not a match.** Swiping right sends a like, which stays private. It
becomes a match only when the other merchant likes back, and only then does the
dialog open, contact details move, and the introduction email unlock. Requests
is a second tab splitting matches from likes still waiting.

**Connexion writes the first message.** After a mutual match, one button drafts
the introduction: for the SME, in their own voice, opening with who they are and
what they run; for the Amex admin, as a relationship manager. On the recruit
side the same mechanism dispatches a per prospect email built from that
prospect's own cluster evidence. Sending is simulated and says so, and every
address uses the reserved .example domain.

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
    graphEngineData.ts     16 match candidates and 4 recruit prospects
    graphSceneConfigs.ts   node and edge layout for the three.js graphs
    usMerchants.ts         50 US merchants behind Growth Radar
  utils/
    matchScore.ts          the weighted 100 point match score
    outreachEmails.ts      the drafted introduction and recruitment emails
    interaction3d.ts       the pointer driven 3D behaviour on every control
    projectedInsight.ts    projections for prospects with no history
  components/
    AmexCard3D.tsx         the card, drawn procedurally, grabbable
    ConsentGate.tsx        the three clause consent form
    EmailComposer.tsx      composed outreach, copyable, never sent
    MerchantMark.tsx       each merchant's own brand mark
    GraphCanvas.tsx        the three.js graph, shared by Graph and Gap Radar
    MatchModal.tsx         Amex's proposal and the match dialog
  views/
    GrowthRadarView.tsx    Amex admin landing
    StandingView.tsx       SME landing
    MatchingView.tsx       the queue, requests and consent
    GapRadarView.tsx       clusters and recruit targets
    RecruitPitchView.tsx   prospect pitch and recruitment dispatch
```

## What would change for a real build

- The synthetic data files would be replaced by real anonymised, aggregated
  transaction data, subject to Amex's aggregation thresholds and per merchant
  consent.
- The match score here is a stated weighted model. A production version would
  need a real collaborative filtering approach, and gap detection would need
  real graph completion.
- Graph node positions are hand placed for a stable demo rather than computed
  from a force directed layout over the full network.
- Relationship tiers are simulated with a static months active field rather than
  computed from redemption data over time.
- The drafted emails are composed locally from each card's own numbers. A real
  build would generate them with a model call grounded in the same figures.
