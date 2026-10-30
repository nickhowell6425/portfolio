# Timetrack demo and LinkedIn drafts

Draft for Nicholas Howell’s review, October 30, 2026. Nothing has been recorded or posted. Lead with preserving short manual work in a summary, then explain what a reader sees when reopening a saved report. The audience is founders deciding how to take a working app into a dependable next release.

## Demo recording plan

Target length: 75–85 seconds. Record the [personal Timetrack overview](https://www.nickhowell.dev/timetrack/overview), then show simple example cards or the corresponding sections of the [reporting walkthrough](https://fullstacktechnologiesllc.com/blog/timetrack-session-reporting) after that article is published. Keep **“Sample data · interface demo”** visible throughout the dashboard segment. Mask account/client labels, rates, and currency totals. Show only the dial, its controls, and the relevant duration information.

The portfolio dial uses fixed/generated sample sessions. Its sign-in animation is also a client-side demonstration. Neither proves live session capture, authentication, exports, or production operation. Do not present the sign-in animation or a static report screenshot as a working backend. Label the separate cards **“Illustrative example”**; they explain verified implementation decisions rather than data collected by the demo. Keep private source code, repositories, commits, and test screenshots out of the recording.

| Time      | Picture                                                                                              | Spoken copy                                                                                                                                                                                                                                                    |
| --------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0–12 sec  | Dial in Day view; sample-data label visible                                                          | “A fifteen-minute review can disappear from a summary if the longest sessions always win. Here’s how I approached that problem in Timetrack.”                                                                                                                  |
| 12–25 sec | Select a session marker, then switch Day to Week                                                     | “This dashboard uses sample data. You can inspect individual sessions and switch between a day and a week. The next question is what survives when those records become a summary.”                                                                            |
| 25–43 sec | Illustrative list: longer agent sessions plus a manual review of 15 minutes; keep the review visible | “The summary keeps each distinct work item, including short manual entries. A brief review should still be visible alongside long agent sessions. I checked that case directly instead of assuming a plausible-looking summary would preserve it.”             |
| 43–65 sec | Illustrative cards: save a report, activity changes, reopen the saved document                       | “Another question is what you see when you reopen a report. Timetrack saves a snapshot at export. Opening it later reads that saved document, even when activity has changed. A fresh draft can reflect the changes. That gives us a clear behavior to check.” |
| 65–85 sec | Hold the two decisions, then Nicholas on camera or the personal CTA                                  | “I use AI in development, and I still work through decisions like these with you: what gets included, what gets preserved, and how we check it. Bring the app or the part that feels unclear. We can work through the next step together.”                     |

Read once at a natural pace before recording and trim pauses to stay under 90 seconds. Use the example cards to explain the saved-report behavior; do not present them as a live export. The end card links to the reporting walkthrough once live and invites a conversation about the viewer’s app.

## LinkedIn post 1

A fifteen-minute review can disappear from a work summary when the longest sessions take every spot.

That was an important case to work through in Timetrack. Long agent sessions and a short manual review can both belong in the record of what happened.

The summary keeps each distinct work item, including those short manual entries. I checked an example with a brief review alongside much longer sessions to make sure it stayed visible.

It’s a small product decision with a clear consequence: someone reading the summary should be able to see the work that mattered, even when it took less time.

These are the questions I enjoy working through with founders. What does your product keep? What does it leave out? Does that match what the person using it needs to know?

I’ve written up the Timetrack decisions here: https://fullstacktechnologiesllc.com/blog/timetrack-session-reporting

## LinkedIn post 2

When you reopen a saved report, which version should you see?

The document you saved, or a new view of everything that has changed since?

In Timetrack, export saves a snapshot of the report. Opening it later retrieves that stored document. A fresh draft can reflect updated activity without silently replacing the saved version.

That gives us a clear example to work through: save a report, change the underlying activity, then reopen the saved report. The expected behavior is easy to explain and specific enough to check.

These are the details I like talking through with founders. What does someone expect when they return to a screen? Which changes should they see? What should stay as they left it?

We can work through a concrete example together before committing to the behavior.

The walkthrough: https://fullstacktechnologiesllc.com/blog/timetrack-session-reporting

## LinkedIn post 3

When a founder shows me an app, I like to pick one result and work back through the decisions behind it together.

For Timetrack, that meant asking how a short manual review stays visible in a summary and which version someone sees when they reopen a saved report.

Those questions give us specific behaviors to inspect and examples to check.

I use AI openly in development. I also want you to understand the decisions that affect your product, so you can help shape it and take it further yourself.

You don’t need to arrive with all the answers. Bring the idea, the prototype, or the part that feels unclear. We can work through the next useful step together.

Here’s what that working relationship looks like: https://www.nickhowell.dev/home/working-through-a-build

## Review and publication checklist

This repository is public. Keep private source paths, repository links, commit identifiers, code excerpts, and test fixtures in a separate private evidence record. The checklist below records the narrow findings that support these drafts.

- [x] The summary keeps distinct work items rather than cutting the list to only the longest entries. A regression example retains a fifteen-minute manual review alongside much longer agent sessions.
- [x] Opening a saved report reads its stored document. Describe that behavior without claiming tamper-proof storage.
- [x] On October 30, the existing report regression checks passed **11/11** with Node 24. Coverage includes retaining short manual entries and preparing summary inputs without invented prose. This is internal review evidence, not a marketing outcome or a complete application audit.
- [x] Portfolio sample-data and interaction boundaries were inspected. No real collection, authentication, or export is exercised by the interface demo.
- [ ] Nicholas reviews the voice and confirms the described decisions reflect his work.
- [ ] Publish and check the reporting walkthrough and personal companion before using their links in these posts; the links are intended destinations, not a claim that those drafts are already live.
- [ ] Record the actual demonstrated controls; keep sample-data labels visible, mask account/client labels and money figures, and show no private code.
- [ ] Check captions, examples, legibility, runtime, and final destination links before posting.
- [ ] Confirm the linked showcase accurately describes data processing. Do not repeat an “all on your machine” promise: the application uses user-controlled hosted services, and optional enrichment can send bounded prompt excerpts to a model provider.
- [ ] Record the publication date and destination in the [weekly review](weekly-growth-review.md), then track relevant founder conversations. Publishing is a separate authorized action.

No client identities, savings percentages, speed multipliers, adoption figures, or maturity claims are part of these drafts. Nothing has been posted externally.
