# Personal and business website audit and growth plan

October 30, 2026. Sites: [Nicholas Howell](https://www.nickhowell.dev/) and [Full Stack Technologies](https://fullstacktechnologiesllc.com/).

The opportunity is to turn an already crawlable portfolio into a clear route from founder problem to paid engineering help. Lead FST with taking apps and AI prototypes into production. Use Nicholas’s personal site to show what working directly with him feels like: one-on-one collaboration, hands-on engineering, candid conversation, and useful guidance. His experience and judgment support that working relationship. Be explicit about AI use, explain the economics, and show the checks that make the result usable.

Nicholas selected founders needing an app or AI prototype brought to production as the primary audience. He wants the personal site to emphasize a friendly, direct, hands-on working relationship and the acquisition story to remain anonymous. These decisions govern this plan. The audit and planning goal is complete. He subsequently authorized implementation; the first release status is recorded below. Later sections preserve the original audit baseline and longer-term backlog.

## First release implementation — October 30

**Published.** [PR #65](https://github.com/nickhowell6425/portfolio/pull/65), commit `c84e589`, was deployed through the project's existing Git integration after Nicholas approved Vercel team access. Both canonical domains showed the new release, and the live crawl passed all 46 sitemap pages, 50 internal destinations, and 127 image URLs.

| Work                   | Status                                                                                                                                                                                                                                                                                                                                                                      |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Personal positioning   | Homepage, process, FAQ, CTA, metadata, and Person description now emphasize direct collaboration, hands-on work, and approachable guidance. Existing acquisition experience remains anonymous; the dollar value and ambiguous company reference were removed.                                                                                                               |
| Business positioning   | Homepage, services, engagements, FAQ, and metadata now lead with founders taking app ideas and AI prototypes into production. AI use and scope/cost conversations are explicit.                                                                                                                                                                                             |
| First useful content   | Added `/services/ai-development-coaching`, `/blog/ai-prototype-to-production`, and `/blog/build-vs-buy-software`, with navigation and internal links. The cost comparison is explicitly fictional and includes a sensitivity example.                                                                                                                                       |
| Conversion reliability | Missing email configuration returns 503; provider failures return 502. The UI reports failure, retains drafts, prevents simultaneous sends, and offers the relevant public email address. Only an accepted response produces a confirmation.                                                                                                                                |
| Inquiry measurement    | Added open, start, success, and error events with brand and known canonical source path. Form values are excluded; pageview/event URL query strings and fragments are stripped. Analytics received one QA `contact_open` event per brand. These are tests, not customer inquiries; receipt of the other event types was not established by this check.                      |
| Search cleanup         | Stable two-segment aliases now redirect permanently. Updated the existing crawler summary. The live 46-page crawl passed metadata, schema, canonicals, links, sitemap, and indexability checks; demos remain noindex and unknown routes return genuine 404 responses.                                                                                                       |
| Google Search Console  | The FST sitemap was refreshed after publication and shows **Success**. Its last observed **32 discovered pages** lags the live 35-page FST inventory. The personal sitemap shows Success. A live check found the new coaching URL eligible for indexing; the manual indexing request failed because the reCAPTCHA service was unavailable, so submission was not confirmed. |
| Bing                   | Both canonical domains are verified and both sitemaps were submitted. The personal sitemap shows **Success, 11 URLs**. The FST sitemap was still processing at the last observation.                                                                                                                                                                                        |
| Email delivery         | Two labeled direct API tests returned HTTP 200 with `ok: true`, and Nicholas confirmed that both original messages arrived. The FST message was also independently found in Gmail INBOX with SPF, DKIM, and DMARC passing. These tests are excluded from leads and did not emit browser contact events.                                                                     |
| Older showcase claim   | Removed Coverly's absolute “never shared / no one but you” privacy copy and the settings screenshot carrying that claim. Removed the matching tile, sidebar anchor, and summary claim so the promise is not repeated elsewhere. A complete product data-flow review was not part of this site release.                                                                      |

Validation: production build, lint, formatting, and TypeScript passed. All 46 sitemap pages passed the content check (11 personal, 35 FST) and the subsequent live crawl. All three contact checks passed against a local server with the email key explicitly disabled. Browser inspection covered both desktop homepages and 390-pixel mobile layouts; the failed-send message and draft retention after closing/reopening were verified. The separate production email and analytics checks are recorded above, with test exclusions in the [weekly review](weekly-growth-review.md#excluding-tests-and-interpreting-events).

Local Lighthouse checks met every current CI budget. Personal desktop/mobile scores were 78/100 performance, 96/96 accessibility, 96/96 best practices, and 100/100 SEO. FST desktop/mobile scored 98/100 performance, 100/100 accessibility, 96/96 best practices, and 100/100 SEO. Observed LCP was 99–315 ms on the final runs; CLS was at most 0.000054. One noisy initial personal desktop run scored 54, then 78 on a single repeat. The known personal contrast finding and local analytics-script 404 explain the unchanged deductions; these are local lab results, not field performance or proof that analytics is receiving events.

Release follow-through: recheck FST's processing Bing sitemap and Google's lagging discovered-page count, then retry the coaching indexing request when the reCAPTCHA service works. Continue inspecting priority URLs and record real inquiry sources and outcomes in the private lead ledger. Indexing eligibility and sitemap acceptance do not establish that every page is indexed.

## Second sprint prepared — awaiting release

The next content changes are prepared for the [FST Timetrack reporting walkthrough](https://fullstacktechnologiesllc.com/blog/timetrack-session-reporting) and [personal story about working through a build](https://www.nickhowell.dev/home/working-through-a-build). These are intended publication URLs; this checkpoint does not record the second sprint as published. The copy explains concrete engineering decisions and distinguishes the sample-data interface from capture, authentication, and export behavior.

The [Timetrack launch draft](timetrack-content-launch.md) contains a 60–90-second demo script and three finished LinkedIn drafts; nothing has been posted. The [weekly growth review](weekly-growth-review.md) defines the first review for November 6, qualification stages, and test exclusions. It is a manual review plan, not an automatically scheduled task.

Both forms are configured to use the shared business admin inbox. The routing change awaits release and a new delivery check; the two confirmed original messages establish delivery before this recipient change.

## Findings that determine the priorities

**Historical planning baseline, before the first release.** The findings and technical observations below preserve the starting point. Use the release sections above for completed work and current follow-through.

| Priority | Finding                                                                                                            | Consequence and action                                                                                                                                                                     |
| -------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| P0       | Contact code can return success without sending email; the client also returns success after a failed request      | Repair success/error handling and verify both inboxes before promoting either site. This is a confirmed code risk, not a confirmed production delivery failure.                            |
| P0       | FST has no submitted sitemap in the inspected Google property                                                      | Submit the existing production sitemap and inspect priority URLs after the next content release. A missing submission does not mean Google cannot discover the sitemap through robots.txt. |
| P1       | Both homepages describe general development rather than the new founder offer                                      | Align hero, introduction, metadata, service descriptions, and primary CTA around the chosen buyer.                                                                                         |
| P1       | Seven product showcases demonstrate interfaces but do not by themselves establish commercial results               | Turn one relevant project into an evidenced production walkthrough with status, contribution, constraints, release checks, and actual outcomes.                                            |
| P1       | Vercel pageview analytics exists; inquiry events and source-to-sale attribution are absent from the inspected code | Reuse the existing analytics system and a small lead ledger. Measure qualified inquiries and paid work.                                                                                    |
| P1       | Personal experience is present but buried; no personal essay library exists                                        | Bring the anonymous growth/acquisition experience forward and explain decisions and lessons. Keep general service advice on FST.                                                           |
| P2       | Bing opens to onboarding with no properties in the account used                                                    | Add and verify both sites as an implementation task; measure ordinary search and supported AI citations.                                                                                   |
| P2       | Stable aliases use temporary redirects, and some titles are lengthy                                                | Small cleanup during the content release, not a reason to rebuild the site.                                                                                                                |

### Live technical baseline

The October 30 crawl covered all **43 sitemap URLs: 11 personal and 32 FST**. All returned HTTP 200, had distinct titles and descriptions within the crawl, one H1, and the intended self-canonical. All 47 unique internal linked destinations and 129 unique image URLs checked returned 200. Rendered images had alt attributes; that alone does not establish the quality of every description.

Robots responses reference the appropriate sitemaps. Public sitemap pages are indexable; demo wrappers/raw demos are noindex; unknown routes return genuine 404/noindex responses. HTTP/www normalization and the sampled cross-domain resource redirects work. Structured-data JSON parses and includes Person/Organization, breadcrumbs, articles, services, and creative works as applicable. This is syntax and implementation verification, not a Google rich-result eligibility guarantee.

The content architecture already separates the brands sensibly. Preserve it. Personal has the profile, process, FAQ, interests, and seven showcases. FST has four company pages, seven showcases, three service pages, a blog index and three articles, nine AI-playbook pages, and five prompt-library pages.

Source locations for implementation:

- Contact delivery: `app/api/contact/route.ts:64–84`; failed-send return: `components/providers/contact-provider.tsx:112–115`; draft clearing: `components/overlays/message-drawer.tsx:102–107`.
- Home positioning: `components/content/company-hero.tsx`, `components/content/portrait-hero.tsx`, `lib/brands.ts`, and brand home entries in `lib/content.ts`.
- Existing experience: `lib/content.ts:213–214`; existing analytics: `app/[brand]/layout.tsx:192`.
- Canonicals, article/service markup, and alias handling: `app/[brand]/[[...slug]]/page.tsx`; host ownership: `proxy.ts`; sitemap: `app/sitemap.ts`.
- Existing rendered-content regression check: `scripts/check-content.mjs`.

The reviewed [successful CI run](https://github.com/nickhowell6425/portfolio/actions/runs/41082943966) passed the 43-page content check. Its localhost mobile Lighthouse run reported performance 84, accessibility 96, best practices 96, SEO 100, CLS 0, and observed LCP 1,381 ms. These are lab results for the tested page, not production Core Web Vitals or a complete accessibility assessment.

Desktop browser inspection confirms that the visual system is distinctive and product-focused. At a 390-pixel mobile viewport, the FST hero occupies much of the first screen with a logo, wordmark, and general introduction. Keep the visual identity, shorten that hierarchy, and put a readable founder-specific action in the hero. The current mobile top-bar contact action becomes an icon. Add an explicit text CTA in the content. This is a conversion hypothesis to test, not evidence of abandonment.

## Search Console and Bing baseline

These are historical browser observations from the October 30 planning pass, before implementation. Search performance, sitemap discovery, and indexing reports have different update dates; their totals must not be treated as a single current inventory. Submission and verification changes completed afterward are recorded in the first release section above.

| Metric                          | Personal                                                                     | FST                                                        |
| ------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Verified property inspected     | Domain property `nickhowell.dev`                                             | Domain property `fullstacktechnologiesllc.com`             |
| Web report filter               | 3 months selected; actual chart October 13–28                                | 3 months selected; actual chart October 28 only            |
| Clicks / impressions            | 2 / 17                                                                       | 0 / 0                                                      |
| CTR / average position          | 11.8% / 8.1; too little data for a performance conclusion                    | No meaningful baseline                                     |
| Query table                     | No rows available                                                            | No data                                                    |
| Sitemap                         | Success; submitted October 14, read October 27, 22 discovered pages          | No submitted sitemaps                                      |
| Indexing                        | October 22 snapshot: 8 indexed, 17 not indexed                               | Overview says processing data                              |
| Reasons for personal exclusions | 3 redirects; 14 discovered, currently not indexed                            | Not yet available                                          |
| Generative AI report            | Beta report visible: 1 impression on old `/shiftsum/overview`, October 13–28 | No separate AI report observed in the inspected navigation |
| Field Core Web Vitals           | Insufficient usage data on mobile and desktop                                | Insufficient usage data on mobile and desktop              |

Personal Web page rows: `/home/how-i-work` 1 click/7 impressions; `/home/off-clock` 1/4; `/shiftsum/overview` 0/3; `/paradox/timeline-view` 0/2; `/` 0/1; `/home/straight-answers` 0/1. Page-row impressions need not sum to the property-level total. There is no query-level evidence here for choosing commercial keywords.

The personal homepage inspection confirms “URL is on Google.” Its recorded last crawl is October 14 by Googlebot smartphone, with successful fetch and crawling/indexing allowed. Google selected the inspected canonical homepage. That old crawl should not be mistaken for verification of the latest copy.

FST homepage inspection also confirms “URL is on Google,” with an October 29 smartphone crawl, successful fetch, crawling/indexing allowed, and the inspected URL selected as canonical. One valid breadcrumb item is reported. Therefore, the empty sitemap-submission list and still-processing coverage report do not mean the business homepage is unindexed.

Both properties’ Manual actions and Security issues reports say “No issues detected.” The personal discovered-but-not-indexed examples include old `/clients/*` pages, component-library pages, `/home/about`, and a demo. Reconcile them with today’s routes before treating them as failures. Do not try to index every historical URL.

Two old URLs receiving impressions already resolve correctly: `/shiftsum/overview` permanently redirects to `/timetrack/overview`; `/paradox/timeline-view` permanently redirects to `/paradox/overview#interactive-data`. The current 11-URL personal sitemap is smaller than the 22-URL October 27 snapshot. That difference alone is not an error.

The FST overview also reports six HTTPS pages with zero non-HTTPS pages and six valid breadcrumb items with zero invalid items. These are report-specific counts, not the current number of indexable URLs.

Bing sign-in succeeded using the Google identity already used for Search Console. The account shows the welcome screen and offers importing sites or adding them manually. No sites were listed. This does not establish that no other account has properties. No site imports, verification grants, sitemap submissions, or indexing requests were performed during this planning pass.

### Search console implementation checklist

1. Submit `https://fullstacktechnologiesllc.com/sitemap.xml` to its Google domain property. Keep the existing successful `https://www.nickhowell.dev/sitemap.xml` submission; confirm Google reads the updated inventory.
2. Inspect the FST home, product-development service, codebase-rescue service, and first revised guide. Compare live availability, robots/noindex, declared canonical, Google-selected canonical, and current index status. Request indexing selectively after meaningful changes.
3. Reconcile personal exclusions against the live sitemap. Redirects and intentionally excluded demos need no indexing fix. Prioritize current personal proof pages and FST service/proof pages if they remain unindexed after discovery and crawling have had time to occur.
4. Add both canonical sites to Bing. If using Search Console import, review the exact OAuth access requested at that step; manual verification is an alternative. Submit both sitemaps, inspect the same priority URLs, and check Site Explorer/crawl diagnostics.
5. Add a small deploy-time IndexNow notification only after verification is working and publishing becomes regular. Notify changed canonical URLs, not the entire site on every unrelated build. It is a discovery aid, not a ranking or indexing promise.
6. Review Search Console weekly for the first month and after each release; save comparable 28-day reports monthly. Check manual actions, security, HTTPS, and coverage for both properties. Recheck stale reports rather than pressing “Validate fix” without a diagnosed issue.

Useful destinations: [personal Search Console](https://search.google.com/search-console?resource_id=sc-domain%3Anickhowell.dev), [FST Search Console](https://search.google.com/search-console?resource_id=sc-domain%3Afullstacktechnologiesllc.com), [Bing Webmaster Tools](https://www.bing.com/webmasters/).

## Positioning and offers

### FST serves founders moving toward real users

The best initial customer has a specific user/problem, an app idea or working prototype, and a need for an experienced engineer to own the next release. They may have built with an AI app builder or coding agent and now need reliable permissions, data handling, integrations, deployment, and support. Qualify on the problem, existing artifacts, scope, budget boundary, deadline, and who can make decisions. Do not require them to know the technology vocabulary.

Proposed home headline: **“Turn your app idea or AI prototype into software people can use.”**

Supporting copy: “Work directly with Nicholas Howell to scope, build, and launch your product. We use AI openly to reduce repetitive work and shorten feedback cycles, with experienced engineering behind architecture, testing, and release. We can build for you or help you learn to build and maintain it.”

Primary CTA: **“Discuss your app”**. Secondary CTA: **“See a prototype become a product”**, linking to an actual walkthrough once ready. Near the main action, explain what to send: who it is for, what works today, and what is stopping the launch.

Suggested home SEO title: “AI-Assisted App Development for Founders | Full Stack Technologies”. Suggested description: “Take an app idea or AI prototype into production with Nicholas Howell. Clear scope, reviewed code, deployment, handoff, and practical AI guidance.” Use these as editorial drafts, not fixed character-limit targets.

| Offer                    | Buyer situation                                             | Concrete deliverable                                                                                          | Existing route to reuse                                                                                            |
| ------------------------ | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| App and prototype review | “It works in the demo; can I launch it?”                    | Findings ordered by launch risk, repair/build recommendation, release scope, and estimate assumptions         | `/services/codebase-rescue`; revise title and copy to welcome prototypes while retaining existing rescue relevance |
| First production release | “I know the problem; help me ship the first useful version” | One agreed user journey, acceptance criteria, implementation, release evidence, deployment and handoff        | `/services/product-development`                                                                                    |
| Build with me            | “Help me and my team use AI well”                           | Tool/repository setup, project context, permissions, review/test workflow, and a real change shipped together | One new `/services/ai-development-coaching` page after scope is agreed                                             |
| Technical leadership     | “We need continuing judgment and delivery ownership”        | Explicit availability, decisions owned, implementation responsibilities, and support boundaries               | `/services/fractional-cto`                                                                                         |

Use a short fit conversation followed by a bounded paid assessment when uncertainty is material. Offer fixed-scope milestones after discovery; agree change handling and support separately. Publish actual price ranges only after minimum engagement, capacity, and billing terms are decided. There is no invented price or turnaround promise in this plan.

### Make AI transparency a commercial advantage

Explain what AI does, who is accountable, and what the buyer owns. Extend the existing AI resources/cost material rather than creating a second competing transparency library. Link the explanation from services, proposals, and FAQs.

Every engagement should specify the tools used; human review responsibilities; what project data may be sent to which tools; account ownership; included versus separately billed AI usage; the pricing basis; repository/hosting access; third-party dependencies; handoff; maintenance; and how the client can continue independently. Client-owned accounts and repositories should be the default proposal where practical, with licensing limitations stated accurately.

“Cheaper and faster” needs a comparison. Show a real project’s scope, elapsed delivery time, human effort, AI/tool spend, review/rework, ongoing costs, and result. Do not turn overlapping agent sessions into an implied billable-time policy. Agree the policy first. Start with “AI helps us reduce repetitive work and test ideas sooner”; graduate to numerical comparisons only when measured on comparable work.

AI use is already prominent in competing offerings. [HatchWorks](https://hatchworks.com/generative-driven-development/) emphasizes senior engineers orchestrating AI, [thoughtbot](https://thoughtbot.com/services) combines product delivery with improving client teams, and [VeryCreatives](https://verycreatives.com/) emphasizes accountable staged delivery. These are observations of their marketing, not independently verified delivery outcomes. FST’s proposed distinction is direct access to Nicholas, a narrowly scoped founder release, visible engineering evidence, clear economics, and the ability to learn alongside delivery.

### Use build versus buy as a useful supporting argument

Campaign angle: **“Before you buy another subscription, see what you could build.”** Decision principle: buy standard capabilities, build what differentiates the product, and integrate when that solves the problem more cheaply. This fits a founder audience better than an absolute “never buy SaaS” rule.

Compare 12- and 24-month costs: purchase/license fees, configuration, integration, migration, internal administration, and exit costs versus discovery, build, infrastructure/API usage, monitoring, maintenance, security updates, support, and future changes. Recommend buying when an existing tool meets the need and ongoing ownership outweighs any advantage of a custom build.

Retool’s February 2026 survey of 817 builders, including its customers, reports 35% had replaced at least one SaaS tool and 78% expected more custom builds. This makes the topic worth testing; the selected vendor-survey population does not establish demand among FST’s founders or prove savings. [Retool research](https://retool.com/blog/ai-build-vs-buy-report-2026)

DORA offers a framework for estimating adoption costs and business value. METR’s February 2026 update explains why selection and measurement effects weaken a universal AI productivity estimate. Use project evidence rather than borrowing a competitor’s speed multiplier. [DORA framework](https://dora.dev/ai/roi/report/), [METR study update](https://metr.org/blog/2026-02-24-uplift-update/)

## Working with Nicholas and personal credibility

The personal site’s central question is **“What would it be like to work with Nick?”** Lead with the relationship: the visitor can bring an unfinished idea, ask questions in their own words, and work directly with the person making technical decisions and writing the code. Use the warmth and candor of a conversation with a friend, expressed through concrete working habits.

Proposed personal headline: **“A technical partner you can talk things through with.”**

Supporting copy: “Hey, I’m Nick. I work one-on-one with founders to turn ideas into working products. You’ll work directly with me: talking through decisions, trying things out, and figuring out the next step. I write the code, explain the tradeoffs, and keep you in the loop—including where AI helps and where it needs a closer look.”

Primary CTA: **“Tell me what you’re working on.”** Supporting line: “An idea, a rough prototype, or a problem you’re stuck on is a good place to start.” Secondary link: **“What working together looks like”**, pointing to the existing `/home/how-i-work` page.

Suggested SEO title: “Nicholas Howell | Hands-On Developer and Technical Partner”. Suggested description: “Work one-on-one with Nick Howell to build your app, talk through technical decisions, and use AI thoughtfully. Direct collaboration from idea to launch.” Keep Nicholas Howell as the consistent formal identity in metadata and structured data; use Nick naturally in first-person copy.

### Show the working relationship

Give the personal homepage this order:

1. **Meet Nick:** the conversational hero, portrait, and invitation to talk about the visitor’s project.
2. **What working together feels like:** direct conversations, hands-on building, honest feedback, and explanations that make decisions easier. Offer learning alongside the work without requiring the founder to code.
3. **Experience behind the advice:** a concise anonymous growth/acquisition story and relevant responsibilities, linked to deeper experience when available.
4. **A decision from a real project:** show the problem, how it was discussed, what changed, and why. Let visitors see the judgment they would be working with.
5. **Start a conversation:** repeat the personal invitation, with a clear route to FST for specific services and engagement details.

Revise `/home/how-i-work` around the actual relationship: the first conversation, how a rough idea becomes a next step, how the founder sees progress, how questions and disagreements get resolved, and what happens at handoff. A short, clearly labeled example progress note can demonstrate the voice: “The main flow is working. I found one edge case we should fix before launch. Here’s what it affects and what I recommend.” Do not present illustrative messages as client evidence.

Use `/home/straight-answers` for practical concerns: “Do I need to understand the code?”, “Will I work directly with you?”, “Can I learn as we go?”, and “What happens if the scope changes?” Describe communication channels and check-in cadence only once agreed. Friendly access should have clear working hours and response expectations; do not promise unlimited availability or instant replies.

Write as “I” and “you,” with natural contractions, specific examples, and room for personality. Explain technical terms when they help a decision. Keep `/home/off-clock` as a human introduction. If a real collaborator can provide a publishable testimonial, favor a specific example of communication and follow-through; never invent one.

### Let experience support the relationship

Use the acquisition experience already on the site: helping an unnamed fintech startup grow from three people to more than 20 and through an acquisition. Keep the company anonymous. The current site’s “multi-million-dollar” description is an existing first-person assertion, not independently substantiated by this audit; it is unnecessary to the stronger engineering story and can be omitted. Do not upgrade “helped build through an acquisition” into “founded and sold multiple companies.”

The experience material should answer: What have you taken responsibility for? How do you make decisions? How will that help us work together? A short anonymous experience timeline can give stages, responsibilities, technical constraints, team changes, and lessons without revealing names or transaction terms. Retain already-public AccountTouch material only to the extent Nicholas wants it public; do not add newly researched employer/acquisition identities.

Clarify the existing “Pinnacle since 2019” reference so visitors understand the relationship to today’s FST. Do not invent a rebrand, merger, or continuity statement. If that detail is distracting and not needed, remove it in the content pass.

| Personal owns                                                                                                 | FST owns                                                                                              | Connection                                                                          |
| ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Working relationship, first-person experience, anonymous acquisition lessons, judgment, experiments, guidance | Services, founder checklists, production guides, playbook, prompt library, costs and engagement terms | Personal links to the relevant service; FST bylines and studio bio link to Nicholas |
| A project’s decisions and Nicholas’s contribution                                                             | A project’s buyer problem, delivery process, and business result                                      | Different narratives using the same factual evidence and interfaces                 |

Revise the existing personal home, process, and FAQ first, then add an experience section before starting a large essay library. Publish one firsthand piece at a time. Suggested topics: “How I help a founder decide what to build first”; “What changed as our engineering team grew”; and “An AI experiment that changed how I work.” Each needs a real incident, a decision, an artifact or example, what happened, and the limitation. “I stay current” becomes credible through dated experiments, including results that did not work.

## Content and SEO/GEO program

The first release should improve existing commercial pages, add one distinct coaching offer, and publish proof. Avoid creating separate near-identical pages for every AI builder or city.

| Order | Page or asset                                             | Search intent hypothesis                                          | Evidence and CTA                                                                                       |
| ----- | --------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| 1     | FST home and `/services/product-development`              | AI-assisted app development, MVP developer for founders           | Defined first release, ownership and launch deliverables; discuss an app                               |
| 2     | `/services/codebase-rescue`                               | AI prototype review, app not ready for production                 | Example findings and repair-versus-rewrite decision; request a review                                  |
| 3     | One existing product overview upgraded to a case study    | Can this engineer ship something like mine?                       | Current maturity, role, constraints, measured result if available; matching offer                      |
| 4     | New `/blog/ai-prototype-to-production`                    | What is missing from my working AI demo?                          | Real authorization, data-write, integration, deployment and recovery examples; prototype review        |
| 5     | Existing `/blog/review-ai-generated-code`                 | How do I know AI code is safe to use?                             | Link to the above production guide and one reviewed finding; review offer                              |
| 6     | New `/services/ai-development-coaching`                   | Help setting up AI development and learning a dependable workflow | Exact session outputs, prerequisites, repo example; discuss coaching                                   |
| 7     | New `/blog/build-vs-buy-software`                         | Should I build or buy this tool?                                  | Transparent worked total-cost example, explicitly hypothetical if not a real project; scope discussion |
| 8     | Existing first-release scope and repair-or-rewrite guides | How much should I build; what can be kept?                        | Sharpen founder decisions and connect to assessment/build offers                                       |
| 9     | Personal home, process, FAQ, and supporting experience    | Working directly with Nick; hands-on technical guidance           | Concrete collaboration habits and anonymous experience; tell Nick what you are working on              |

These are intent-led topics, not measured keyword volumes. After query rows become available, group actual demand into brand, prototype readiness, MVP development, AI workflow setup, and build-versus-buy. Prioritize pages bringing relevant inquiries over broad informational impressions.

### Search and answer-engine fundamentals

Google’s current guidance prioritizes useful, original, expert-led content and normal SEO. It explicitly says special AI text files, content chunking, or special schema are not needed for its generative search features. Keep the existing `llms.txt` only as a convenient summary; do not make it the growth strategy. [Google generative-search guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)

For this site, the practical work is concise answers to real founder questions, reproducible examples, clear authorship, dated technical claims, and links between related proof, guidance, and offers. Preserve readable server-rendered text. Expand structured data only when it accurately describes visible content. Maintain consistent Person/Organization identities; add verified profile links where useful. Do not publish invented reviews, client results, or schema claims.

Google requires a page to be indexed and eligible for a snippet to support its AI search features. Keep robots, canonicals, internal links, and hosting access correct. [Google AI feature eligibility](https://developers.google.com/search/docs/appearance/ai-features)

There is a visible generative-AI beta report in this personal Search Console property. Measure it directly rather than assuming all AI data is inseparable from Web reporting. Older Google documentation still describes inclusion in the overall Web report; report availability and definitions should be recorded with the date.

Bing’s AI Performance report measures citations, cited pages, and sampled grounding queries across supported Microsoft/partner surfaces. It does not measure all AI engines or equate citation counts with leads. Its October 2026 Topics Portfolio beta requires sufficient data and may not appear for these small sites. [Bing AI Performance](https://blogs.bing.com/webmaster/2026/2/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview/), [Topics Portfolio](https://blogs.bing.com/webmaster/2026/10/introducing-topics-portfolio-beta-in-ai-performance/)

Track AI referral visits when available and ask leads how they found Nicholas. Once monthly, record a small fixed set of founder questions across the engines clients actually use, with date, surface, wording, and cited URLs. Treat those observations as a diagnostic sample, not an objective universal rank. Earn mentions through original work, useful participation, collaborations, and permissioned case studies.

Keep Saint Petersburg as a truthful location signal. A Google Business Profile is appropriate only if the business meets its eligibility requirements, including in-person customer contact; an online-only studio is not eligible. Do not create fictitious offices or city-swapped pages. [Google eligibility guidance](https://support.google.com/business/answer/13763036)

### Technical changes in the next release

- Preserve correct brand ownership, sitemap separation, noindex demo rules, historical redirects, and canonical URLs. Do not change service slugs merely for new wording.
- Make stable `/home/about` and `/blog/index` aliases permanent rather than temporary redirects. Shorten long showcase titles for readable results, without treating a character threshold as a ranking rule.
- When touching navigation, use real links for destinations currently implemented as buttons; body links already provide crawler access.
- Repair contact failure handling, keep unsent drafts, provide a direct-email fallback, and restore visible focus and email/autocomplete semantics. A successful provider acceptance and an actual delivered test message are different verification steps.
- Add a concise explanation near the form of how inquiry information is used, and ensure any privacy page reflects actual processing. Avoid sending inquiry text, names, or email addresses as analytics properties.
- Test the revised hero, menus, service navigation, and contact drawer on mobile and keyboard. Use existing content tests plus targeted contact success/failure checks. No redesign or new analytics dependency is justified by this audit.

## Marketing experiments and measurement

Start with the founder’s voice and useful evidence. Organic search is a compounding channel; the current search history is too small to rely on for near-term pipeline.

| Experiment                     | Six-week commitment                                                                           | Destination                                   | Decision signal                                                     |
| ------------------------------ | --------------------------------------------------------------------------------------------- | --------------------------------------------- | ------------------------------------------------------------------- |
| Founder LinkedIn content       | Two substantive posts weekly, derived from real work; one short demo every two weeks          | Relevant guide, case study, or review offer   | Qualified founder conversations and booked reviews, not likes       |
| Existing network and referrals | Plan 10–15 relevant conversations with prior collaborators and founders                       | Clear review/build offer                      | Repeated launch blockers and willingness to buy a bounded next step |
| Founder workshop               | Propose one “Your AI prototype works. Can you launch it?” session to an appropriate community | Ungated readiness checklist plus review offer | Attendance-to-conversation and assessment requests                  |
| Public proof artifact          | One sanitized review example or small sample repository with an explanation                   | Case study and service page                   | Relevant questions, referrals, and resulting inquiries              |
| Search-led articles            | One substantial evidence-based piece every two weeks                                          | Existing service pages                        | Indexing, relevant queries, and assisted qualified inquiries        |

These are experiments, not claims that one channel is proven best for FST. Use the personal account for judgment and conversation; use the company site for the offer and evidence. Do not launch a separate podcast, daily AI-news feed, multiple social channels, paid ads, or a gated course now. No outreach messages were sent in this audit.

### Six-week publishing sequence

| Week | Main asset                                                     | Reuse and commercial link                                                                |
| ---- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| 1    | Revised positioning, service pages, and lead-flow verification | Personal post showing what working with Nick feels like; invitation to discuss a project |
| 2    | Production walkthrough of one real product                     | Short narrated demo plus one engineering decision; link to first-release service         |
| 3    | Prototype-to-production checklist/article                      | Two concrete failure/repair examples; link to prototype review                           |
| 4    | Anonymous personal growth/acquisition lesson                   | Founder post about one decision and its consequence; link to experience                  |
| 5    | Build-with-me offer and actual setup walkthrough               | Show a real change from brief through review; link to coaching                           |
| 6    | Build-versus-buy guide with complete cost assumptions          | Founder decision post or workshop; link to scope discussion                              |

Pick the product for week two based on actual production evidence, not visual polish. Label prototype, internal tool, beta, and production accurately. If outcome data is unavailable, show the release process and limitations without substituting a business-success claim.

### Measurement that can guide spending

Use the installed analytics integration for `contact_open`, `contact_start`, `contact_success`, and `contact_error` if the current account supports the required events. Define success as provider acceptance, not drawer closure. Verify event availability before choosing an alternative. Include brand, page, offer, and non-personal campaign/source fields. Deduplicate repeated submission events.

Keep a minimal lead record: date, source, landing page, need, stage, qualified/unqualified reason, review booked, paid assessment, build won, revenue, and reason lost. Keep contact details in the appropriate private system, not the public repository or analytics events. Ask “How did you find me?” because referrers and cross-domain attribution are incomplete.

The weekly scorecard should show qualified inquiries, conversations, paid assessments, proposals, builds won, and channel effort. The monthly scorecard adds per-domain search clicks/impressions, current priority-page indexing, relevant queries, generative-search impressions where exposed, Bing citations, and conversion counts. Do not add AI-report impressions to Web impressions as though they were disjoint audiences.

Initial management target, not a forecast: by day 90, seek eight qualified founder conversations, three paid assessments, and one production-build engagement. Recalibrate after the first four weeks against actual capacity, prices, and observed conversion. A qualified conversation means a specific user/problem, a plausible funded next step, and access to the decision maker. Traffic growth alone is not success.

If visibility rises without inquiries, improve intent/offer/CTA fit. If inquiries are irrelevant, narrow the audience and examples. If relevant conversations do not become paid assessments, examine scope, proof, price, and trust. Avoid spending more on distribution until the lead flow is reliable.

## Execution backlog and checkpoints

The estimates below are planning allowances, not delivery quotes. Technical work belongs to the implementation owner; Nicholas supplies firsthand examples and approves factual claims and actual commercial terms.

| When                | Work                                                                                         | Owner                                                        | Definition of done                                                                                                                                 |
| ------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| By November 6       | Repair contact success/failure behavior, accessible inputs, fallback; verify both inboxes    | Engineering                                                  | Success delivers a test inquiry, failure preserves draft and displays error; no false success event                                                |
| By November 6       | Instrument inquiry events and start the private lead ledger                                  | Engineering + Nicholas                                       | Open/start/success/error events verified on both brands; page, offer, and source recorded without inquiry contents or contact details in analytics |
| By November 6       | Record baseline, submit FST sitemap, reconcile personal inventory, set up Bing               | Engineering with account owner for any required access grant | Submitted/verified status visible; priority URLs inspected; delayed data recorded accurately                                                       |
| By November 13      | Rewrite both heroes, home copy, descriptions, services, FAQs, and AI disclosure consistently | Nicholas + editorial/engineering                             | FST offer and personal working relationship clear in each first screen; ownership/pricing match real terms; content checks pass                    |
| By November 13      | Choose one project and gather evidence                                                       | Nicholas                                                     | Status, contribution, constraints, screenshots, release checks, and publishable outcomes collected                                                 |
| By November 29      | Publish first walkthrough, production guide, and anonymous personal experience               | Nicholas + editorial/engineering                             | Distinct personal/company narratives, citations where needed, relevant CTAs, live canonical/indexing checks                                        |
| By November 29      | Run initial distribution and measure leads                                                   | Nicholas                                                     | At least four weeks of consistent records; repeated buyer objections captured                                                                      |
| By December 29      | Complete six-week content sequence; assess coaching demand and channel quality               | Nicholas                                                     | Prioritize the offer/channel producing qualified conversations; revise or stop weak experiments                                                    |
| By January 28, 2027 | Review 90-day pipeline and content results                                                   | Nicholas                                                     | Compare with management targets; choose next case study and focus area from actual leads and queries                                               |

First implementation scope: shared contact flow and its callers/checks; heroes and metadata; relevant `lib/content.ts` entries; minimal new coaching/guide entries; navigation/sitemap generation through the existing model; analytics events; Search Console/Bing setup. Preserve unrelated product interactions. Run lint, typecheck, build, the existing content suite, and meaningful contact-path tests when those changes are made.

Decisions needed before publishing commercial promises: minimum engagement, capacity, billing model, included AI spend, ongoing support, and which project has enough evidence for the first case study. No further company names are required. The privacy choice, founder audience, and emphasis on friendly one-on-one collaboration are already settled.

## Scope and limitations

Completed: repository/content inspection; live sitemap, metadata, links, images, redirect and crawler checks; desktop homepage review and mobile FST review; Google performance, sitemap, personal indexing, both homepage inspections, personal AI report, both security/manual-action reports and field-data availability; Bing account availability; current primary-source and competitor research; prioritized plan.

Not completed: implementation/deployment, production inquiry submission and inbox receipt, account-level analytics review, paid keyword-volume research, customer willingness-to-pay validation, exhaustive backlink audit, production field performance measurement, full accessibility/security testing, or verification of private acquisition figures. The FST indexing report is still processing. No public copy, outreach, advertising, search settings, or sitemap registrations were changed.

Search results and AI citations are not guaranteed. The current sample is too small for ranking or conversion conclusions. The immediate risk is promoting a stronger offer before the contact-delivery behavior is fixed and verified.
