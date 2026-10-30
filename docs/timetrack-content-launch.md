# Timetrack demo and LinkedIn drafts

Draft for Nicholas Howell’s review, October 30, 2026. Nothing has been recorded or posted. Lead with preserving short manual work in a summary, then explain the choice behind a report total. The audience is founders deciding how to take a working app into a dependable next release.

## Demo recording plan

Target length: 75–85 seconds. Record the [personal Timetrack overview](https://www.nickhowell.dev/timetrack/overview), then show simple example cards or the corresponding sections of the [reporting walkthrough](https://fullstacktechnologiesllc.com/blog/timetrack-session-reporting) after that article is published. Keep **“Sample data · interface demo”** visible throughout the dashboard segment. Mask account/client labels, rates, and currency totals. Show only the dial, its controls, and the relevant duration information.

The portfolio dial uses fixed/generated sample sessions. Its sign-in animation is also a client-side demonstration. Neither proves live session capture, authentication, exports, or production operation. Do not present the sign-in animation or a static report screenshot as a working backend. Label the separate cards **“Illustrative example”**; they explain verified implementation decisions rather than data collected by the demo. Keep private source code, repositories, commits, and test screenshots out of the recording.

| Time      | Picture                                                                                                                | Spoken copy                                                                                                                                                                                                                                                                            |
| --------- | ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0–12 sec  | Dial in Day view; sample-data label visible                                                                            | “A fifteen-minute review can disappear from a summary if the longest sessions always win. Here’s how I approached that problem in Timetrack.”                                                                                                                                          |
| 12–25 sec | Select a session marker, then switch Day to Week                                                                       | “This dashboard uses sample data. You can inspect individual sessions and switch between a day and a week. The next question is what survives when those records become a summary.”                                                                                                    |
| 25–43 sec | Illustrative list: longer agent sessions plus a manual review of 15 minutes; keep the review visible                   | “The summary keeps each distinct work item, including short manual entries. A brief review should still be visible alongside long agent sessions. I checked that case directly instead of assuming a plausible-looking summary would preserve it.”                                     |
| 43–65 sec | Calculation card: 20 records × 59 seconds; each displayed as 0.02 h; displayed total 0.40 h; raw-total rounding 0.33 h | “The detailed report has another explicit choice. Twenty fifty-nine-second records display as point-zero-two hours each, adding to point-four-zero. Rounding their raw total once gives point-three-three. Timetrack totals the displayed lines so a reader can reproduce the number.” |
| 65–85 sec | Hold the two decisions, then Nicholas on camera or the personal CTA                                                    | “I use AI in development, and I still work through decisions like these with you: what gets included, what a number means, and how we check it. Bring the app or the part that feels unclear. We can work through the next step together.”                                             |

Read once at a natural pace before recording and trim pauses to stay under 90 seconds. Keep the rounding rule visible with both results; do not present it as a billing policy. The end card links to the reporting walkthrough once live and invites a conversation about the viewer’s app.

## LinkedIn post 1

A fifteen-minute review can disappear from a work summary when the longest sessions take every spot.

That was an important case to work through in Timetrack. Long agent sessions and a short manual review can both belong in the record of what happened.

The summary keeps each distinct work item, including those short manual entries. I checked an example with a brief review alongside much longer sessions to make sure it stayed visible.

It’s a small product decision with a clear consequence: someone reading the summary should be able to see the work that mattered, even when it took less time.

These are the questions I enjoy working through with founders. What does your product keep? What does it leave out? Does that match what the person using it needs to know?

I’ve written up the Timetrack decisions here: https://fullstacktechnologiesllc.com/blog/timetrack-session-reporting

## LinkedIn post 2

A small reporting decision from Timetrack: the total should add up from the lines someone can actually see.

Take twenty records lasting fifty-nine seconds each. Display each one to two decimal places in hours, and each reads 0.02.

Add those displayed lines: 0.40 hours.

Add the raw seconds first and round once: 0.33 hours.

Timetrack’s detailed report uses the first approach. A reader can reproduce the printed total by adding the printed lines. The tradeoff is that rounding each line can move the result away from the raw-duration total, so the rule needs to be clear.

I kept that example in a check for future changes. It gives the next implementation a concrete behavior to preserve.

When we build an app together, this is part of the work: agree what the numbers mean, make the calculation inspectable, and check the awkward examples.

The walkthrough: https://fullstacktechnologiesllc.com/blog/timetrack-session-reporting

## LinkedIn post 3

When a founder shows me an app, I like to pick one result and work back through the decisions behind it together.

For Timetrack, that meant asking how a short manual review stays visible in a summary, how the displayed report lines add up, and which version someone sees when they reopen a saved report.

Those questions give us specific behaviors to inspect and examples to check.

I use AI openly in development. I also want you to understand the decisions that affect your product, so you can help shape it and take it further yourself.

You don’t need to arrive with all the answers. Bring the idea, the prototype, or the part that feels unclear. We can work through the next useful step together.

Here’s what that working relationship looks like: https://www.nickhowell.dev/home/working-through-a-build

## Review and publication checklist

This repository is public. Keep private source paths, repository links, commit identifiers, code excerpts, and test fixtures in a separate private evidence record. The checklist below records the narrow findings that support these drafts.

- [x] The summary keeps distinct work items rather than cutting the list to only the longest entries. A regression example retains a fifteen-minute manual review alongside much longer agent sessions.
- [x] The detailed report preserves individual intervals and totals their displayed rounded hours. Twenty 59-second records produce displayed total `0.40`; the 1,180 raw seconds rounded once in hours produce `0.33`.
- [x] Opening a saved report reads its stored document. Describe that behavior without claiming tamper-proof storage.
- [x] On October 30, the existing detailed-report and summary-report regression checks passed **11/11** with Node 24. They cover displayed totals, short manual blocks, and summary inputs without invented prose. This is internal review evidence, not a marketing outcome or a complete application audit.
- [x] Portfolio sample-data and interaction boundaries were inspected. No real collection, authentication, or export is exercised by the interface demo.
- [ ] Nicholas reviews the voice and confirms the described decisions reflect his work.
- [ ] Publish and check the reporting walkthrough and personal companion before using their links in these posts; the links are intended destinations, not a claim that those drafts are already live.
- [ ] Record the actual demonstrated controls; keep sample-data labels visible, mask account/client labels and money figures, and show no private code.
- [ ] Check captions, arithmetic, legibility, runtime, and final destination links before posting.
- [ ] Confirm the linked showcase accurately describes data processing. Do not repeat an “all on your machine” promise: the application uses user-controlled hosted services, and optional enrichment can send bounded prompt excerpts to a model provider.
- [ ] Record the publication date and destination in the [weekly review](weekly-growth-review.md), then track relevant founder conversations. Publishing is a separate authorized action.

No client identities, savings percentages, speed multipliers, adoption figures, or maturity claims are part of these drafts. Nothing has been posted externally.
