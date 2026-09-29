# Design rationale

This is a local presentation, not an operating intake system. Primary behavioral goal: understand support → confirm fit/funding/location → inspect service scope → choose a low-pressure contact method. Outcomes must ultimately be checked with participants and referrers; visual implementation does not establish increased conversion.

## Flow and recovery

| Stage | Need/action | Hesitation | Feedback/recovery | Success |
|---|---|---|---|---|
| Orient | What, who, where | NDIS jargon | Explicit provider/location and everyday-language H1 | Can explain the service |
| Choose | Select a need/service | Unsure of category | Related services and “not sure” contact path | Relevant detail page |
| Assess | Scope, funding, area, safety | Funding eligibility/worker change | Clear status labels, agreements, telephone alternative | Can identify next question |
| Enquire | Select purpose and reply method | Sensitive information | Minimum fields, nearby errors, preserved entries | Demo confirmation, explicitly unsent |
| Return/error | Find contact or recover | Network/empty result | Retry, clear filters, phone and home links | No dead end |

## Evidence ledger

| Principle/source | Participants/task and finding | Confidence/limits | Decision and falsifier |
|---|---|---|---|
| [Cowan 2001](https://doi.org/10.1017/S0140525X01003922) | Synthesis of constrained working-memory tasks; limited chunks can be actively held | Strong for limited capacity; not a fixed web menu count | Visible services and contextual next steps. Falsified if participants lose context or cannot classify needs. |
| [Choice overload meta-analysis](https://doi.org/10.1086/651235) | Choice studies across differing tasks; near-zero average with substantial variation | Strong corrective evidence, context-dependent | Keep all six services; improve labels instead of arbitrarily removing options. Falsified if labels worsen completion time/errors. |
| [Tuch et al. 2012](https://doi.org/10.1016/j.ijhcs.2012.06.003) | Brief website exposures measuring aesthetic first impressions | Promising for perception, not evidence of conversion or usability | Familiar header/content/footer and restrained visual complexity. Test comprehension separately from preference. |
| [WCAG 2.2](https://www.w3.org/TR/WCAG22/) | Normative accessibility standard, not an experimental population | Strong requirements; automated checks are incomplete | Semantic controls, visible focus, AA contrast, reflow, labels and status. Falsified by failures in automated/manual interaction checks. |

## Expression

Route: ui-design-index → ui-landing-patterns. Patterns: outcome-led editorial hero; task-oriented service discovery; proof close to decisions. ui-ux-pro-max adds implementation checks; its automatically suggested search-first homepage is not used because the user approved an enquiry-led brief. Existing brand greens are retained; warm paper and clay add contrast and rhythm. Fraunces headings and DM Sans body are self-hosted. No animation is required to read content.

References reviewed in the preceding research: [Scope](https://www.scopeaust.org.au/), [Mable](https://mable.com.au/), [Five Good Friends](https://www.fivegoodfriends.com.au/), [Silverchain](https://www.silverchain.org.au/), [Ability WA](https://www.abilitywa.com.au/), [Life Without Barriers](https://www.lwb.org.au/), [genU](https://www.genu.org.au/), [Chorus](https://chorus.org.au/), [My Place](https://www.myplace.org.au/), [MercyCare](https://www.mercycare.com.au/), [Amana Living](https://www.amanaliving.com.au/). They supply task labels, care pathways, process visibility and editorial grouping, not copied designs or evidence of conversion.

## Source decisions

- Source: https://ocdbrilliance.com.au/ captured in source-site.html/source-content.md. Logo and owner photo are from that site and retained only for the requested local presentation.
- Original service/funding cards say expanding for DVA/aged care, while FAQ explicitly says not delivering. Use coming soon and do not imply bookable.
- Cancellation FAQ and terms differ. Keep the source legal archive and surface the conflict; do not choose a fee or period on the participant's behalf.
- Pricing and registration reform articles are archived source text, not freshly verified policy advice. Put date/context next to the article.
- Images created with built-in imagegen are illustrative. Hero, texture and montage originals are preserved under public/assets. Optimize format/size only; no generated person is named as staff. The montage includes a non-Perth landmark, so it is labeled an illustration of support rather than a location photo.
- No production claims of independently verified registration, current availability, or comprehensive WCAG conformance.

Validation: route/browser tests and axe audits, 320/390/768/1440 widths, text scaling, reduced motion, keyboard, form retry and no-JS checks. Recommended follow-up: ask 5 representative participants/referrers to find domestic support, establish funding status and complete an enquiry; measure task completion, errors, confidence and time, with no fabricated benchmark or guaranteed uplift.
