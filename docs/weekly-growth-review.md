# Weekly search and inquiry review

Owner: Nicholas Howell. Proposed first manual review: **November 6, 2026**, covering operational activity from October 30 through November 5. This is a review template, not an automated schedule or a commitment to ongoing distribution. Use the [growth plan](site-growth-audit-2026-10-30.md) for positioning and content priorities.

The question each week is whether founders with a real app or prototype problem are finding the sites and taking a useful next step. Count qualified inquiries and paid work separately from visits, contact events, and search impressions.

**Current scope:** SEO/GEO, search-console follow-through, and site content. Nicholas has deferred all video, social posts, and outreach. Retain existing launch drafts as reference material; this review does not authorize publishing or contacting anyone.

## Starting baseline

| Observation                                        | Personal                                                       | Full Stack Technologies             | Meaning                                                                  |
| -------------------------------------------------- | -------------------------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------ |
| October 30 current live inventory                  | 12 sitemap pages                                               | 36 sitemap pages                    | All 48 pass the final core checks; this is not an indexed-page count.    |
| Initial Google Web clicks / impressions            | 2 / 17, October 13–28                                          | 0 / 0, October 28 only              | Different observed periods; neither is a seven-day comparison baseline.  |
| Initial Google generative AI report                | 1 impression on the former `/shiftsum/overview`, October 13–28 | Not observed                        | Keep separate from Web totals; do not assume the audiences are disjoint. |
| Initial release QA `contact_open` events           | 1                                                              | 1                                   | Earlier staff tests, separate from the later browser check below.        |
| Later controlled browser QA                        | 1 each: open, start, error, success                            | 1 each: open, start, error, success | Eight new QA events, excluded from customer activity.                    |
| Real inquiries, qualified conversations, paid work | Not yet reconciled                                             | Not yet reconciled                  | Unknown, not zero. Establish from the private inquiry record.            |

The first 46-page release crawl checked 50 internal destinations and 127 image URLs successfully; those are historical checkpoint counts. [PR #66](https://github.com/nickhowell6425/portfolio/pull/66), commit `30d69a1`, published the personal collaboration story and FST Timetrack walkthrough, bringing the live inventory to 48 pages. [PR #67](https://github.com/nickhowell6425/portfolio/pull/67), commit `1cfa332`, published the subsequent copy cleanup. The current final live pass passed all core checks.

The [audit](site-growth-audit-2026-10-30.md#search-console-and-bing-baseline) preserves original report dates and indexing caveats. The October 30 [console checkpoint](site-growth-audit-2026-10-30.md#final-console-checkpoint--october-30) confirms **Success for both Google and Bing sitemaps: 12 personal and 36 FST URLs**. Google reports product development and codebase rescue indexed, coaching discovered but not indexed, and the new proof pages unknown. A selective Bing indexing request was accepted. Sitemap discovery and accepted requests do not establish that every page is indexed.

## The weekly review

1. **Check delivery and reconcile inquiries.** Review actual inbox threads and any delivery failures. Exclude labeled tests and spam. Count each person/project once, including inquiries that cross both sites or arrive directly by email. Unknown source stays unknown; ask how they found Nicholas during the normal conversation.
2. **Record the pipeline.** Count new real inquiries, newly qualified inquiries, conversations held, paid assessments, proposals sent, and builds won. Record dates for stage changes so an existing lead is not counted as new each week. Qualification means a specific user/problem, a plausible funded next step, and access to the decision maker; record what is still unconfirmed.
3. **Check visibility.** For each domain, record Google Web clicks/impressions and the latest available report date. Compare the latest complete seven-day period with the preceding seven days using identical filters. If reporting lags, keep that window separate from the operational week. Record relevant queries and landing pages when available; at this volume, report counts rather than dramatic percentage changes.
4. **Check discovery and AI visibility.** Record sitemap read dates and the index status of priority pages: both homes; FST product development, codebase rescue, coaching, the production/build-versus-buy guides, and the Timetrack walkthrough; and the personal collaboration story. Note actionable crawl/canonical issues. Record Google generative AI and Bing search/AI metrics only when available, with their own dates and definitions. Missing data is not zero. Review comparable 28-day search periods monthly when conducting this review.
5. **Choose one change.** Write the strongest buyer question or obstacle, one next action, its owner, and the next review date. Improve the offer or proof when relevant visitors do not inquire; investigate scope, price, and trust when qualified conversations stall. Do not increase promotion while delivery is failing.

Operations use America/New_York. Preserve each reporting tool's date range and timezone with exports instead of assuming cross-tool days align. Keep exports and customer records in a private location; this repository needs only the process and any approved aggregate summaries.

## Private lead ledger template

Copy this empty structure into an existing private record. Keep names, email addresses, message text, confidential project details, and actual deal values out of this repository and analytics event properties.

| Lead ID | First received | Brand and landing page | Source | Need and qualification | Current stage | Next action and due date | Outcome dates and value |
| ------- | -------------- | ---------------------- | ------ | ---------------------- | ------------- | ------------------------ | ----------------------- |
| —       | —              | —                      | —      | —                      | —             | —                        | —                       |

Use stages **new → qualified → conversation held → assessment paid → proposal sent → build won**, with **not a fit**, **on hold**, and **lost** as explicit outcomes. Skip stages that do not apply; a direct build need not pass through a paid assessment. “Paid” requires payment evidence, and “won” requires an accepted engagement. Store dates for milestones, the reason for a loss/pause, and the next follow-up privately.

## Excluding tests and interpreting events

`contact_open` means the drawer opened; `contact_start` means form input began; `contact_success` means the email provider accepted a submission; `contact_error` means a submission failed. None proves a unique person, a delivered inbox message, or a qualified lead. Current custom properties are only `brand` and `source_path`; source attribution comes from available reporting and the private lead conversation.

Maintain a private QA exclusion log with test label, timestamp/timezone, brand, source path, event type, and confirmed count. Mark every labeled delivery-test inquiry as **test**, never as a lead, even if it reached the real inbox. The initial browser QA exclusion is one release-QA `contact_open` per brand.

Four delivery tests used direct POST requests to the public contact API on October 30. The later pair verified the released routing from both forms to `admin@fullstacktechnologiesllc.com`:

| Test label                              | Time in UTC  | API result           | Inbox evidence                                                                                    | Lead exclusion                  |
| --------------------------------------- | ------------ | -------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------- |
| `SiteCheck-20261030-2012-personal`      | Around 20:12 | HTTP 200, `ok: true` | Receipt confirmed by Nicholas; not independently verified in the connected Gmail account          | One test submission, not a lead |
| `SiteCheck-20261030-2012-fst`           | 20:12:57     | HTTP 200, `ok: true` | Receipt confirmed by Nicholas and independently found in Gmail INBOX; SPF, DKIM, and DMARC passed | One test submission, not a lead |
| `SiteCheck-Admin-202610302044-personal` | 20:44:16     | HTTP 200, `ok: true` | Independently verified in the shared admin inbox                                                  | One test submission, not a lead |
| `SiteCheck-Admin-202610302044-fst`      | 20:44:16     | HTTP 200, `ok: true` | Independently verified in the shared admin inbox                                                  | One test submission, not a lead |

These direct API tests did **not** emit browser contact events. Exclude **all four labeled submissions** from lead counts; do not subtract invented browser events. Nicholas confirmed both original messages arrived, and the two later admin tests independently established delivery from both brands to the released shared-inbox destination. Recipient verification is complete.

### Controlled browser analytics check

Vercel's **21:00–22:00 UTC** query window was empty before the October 30 tests. The analytics query uses that rounded window; the browser actions occurred at approximately 21:34 and 21:35 UTC. Each brand used one drawer visit: open, begin input, submit an invalid email to receive a server-validation HTTP 400, then correct the email and retry successfully. The failed request preserved the draft. This checked the API validation-error path, not a provider outage or HTTP 502 failure.

| Brand    | Source path                     | Approximate UTC time | Delivered message label                   |
| -------- | ------------------------------- | -------------------- | ----------------------------------------- |
| Personal | `/home/working-through-a-build` | 21:34                | `SiteCheck-Events-20261030-2134-personal` |
| FST      | `/services/codebase-rescue`     | 21:35                | `SiteCheck-Events-20261030-2135-fst`      |

Vercel confirmed **exactly one `contact_open`, `contact_start`, `contact_error`, and `contact_success` per brand**, with the correct `brand` and `source_path`: **eight new QA events**. Both successful messages were independently confirmed in the admin inbox. Unlike the earlier direct POST checks, these browser tests emitted contact events.

Exclude these **eight events and two delivered test emails** from customer activity and leads. There are now **six successful labeled test emails cumulatively**. Retain the earlier two QA opens as separate exclusions for their own window; do not subtract them from the 21:00–22:00 UTC browser-check window.

For each reporting window, retain raw counts, matched QA exclusions, and adjusted counts. Subtract a known test only when it falls within that window and matches the relevant brand/event. Do not subtract the initial two QA opens again in later weeks. If aggregation prevents reliable separation, label the count **includes QA; customer count unknown** instead of guessing. Use the private ledger for real inquiry and qualification totals.

## November 6 review record

- Operational window: October 30–November 5; search windows and latest report dates: **pending**.
- Per-domain search clicks/impressions, priority-page indexing, and available AI metrics: **pending**.
- Raw contact events / confirmed test exclusions / adjusted events: **pending**.
- Real inquiries / newly qualified / conversations held / paid assessments / proposals / builds won: **pending private reconciliation**.
- Delivery issues, repeated buyer question, and channel effort: **pending**.
- One next action, owner, and next review date: **pending review**.
