# Marketing and content plan

The [October 30 audit and growth plan](site-growth-audit-2026-10-30.md) sets the current priorities: founders taking apps and AI prototypes into production, transparent AI-assisted delivery, and a personal site centered on friendly, hands-on, one-on-one collaboration, supported by an anonymous experience story. It includes live search-console findings and the execution backlog. This document retains the existing content architecture and implementation history.

Content pass: October 28, 2026. This is an intent-based editorial plan, not keyword-volume research. No traffic, ranking, or lead forecasts are implied.

## Positioning

Nicholas Howell: an experienced full-stack developer, CTO, and founding engineer whom founders and small teams work with directly. Full Stack Technologies: the studio through which that work is delivered. Saint Petersburg, Florida is a factual location signal, not a claim about offices in other cities.

Lead with the work a buyer needs: building a product, repairing an application, or making a technical decision. Explain AI assistance as part of the process. Use product interfaces as evidence of design and engineering decisions; avoid implying customer adoption, commercial results, or product maturity from the examples.

## Existing pages and their jobs

| Pages                                  | Audience and purpose                                                 | Main action                            |
| -------------------------------------- | -------------------------------------------------------------------- | -------------------------------------- |
| Personal home                          | Establish Nicholas's experience, location, and working relationship  | Explore work or discuss a project      |
| Company home                           | Explain what the studio does and whom it serves                      | Choose a service or discuss a project  |
| Personal process / company engagements | Explain scope, review checkpoints, delivery, and handoff             | Bring a short project brief            |
| Company service overview               | Summarize available engagement types                                 | Open a focused service page            |
| Both FAQs                              | Answer pricing, ownership, fit, and maintenance questions            | Discuss the actual constraints         |
| Off the clock                          | Give the personal portfolio a human dimension                        | Continue exploring the portfolio       |
| Paradox                                | Demonstrate storytelling, onboarding, and interactive data decisions | Explore product development            |
| Timetrack                              | Demonstrate session tracking, inspectable records, and reporting     | Explore development or codebase review |
| Constellation                          | Demonstrate prioritization, planning, and client visibility          | Explore technical leadership           |
| Interactive demo                       | Let a visitor explore Paradox                                        | Return to the product explanation      |

The pass adds descriptive home headings, clearer commercial copy, specific meta descriptions and social metadata, crawlable links, and a route from each product page to services and guides. Duplicate home and blog-index aliases redirect to the primary URL. Demo pages remain accessible but are excluded from the sitemap and marked noindex.

## Added pages

| URL                                  | Search intent / question                              | Evidence or useful detail                                            |
| ------------------------------------ | ----------------------------------------------------- | -------------------------------------------------------------------- |
| `/services/product-development`      | Hire someone to build web or mobile software          | Deliverables, scope decisions, review process, Paradox example       |
| `/services/codebase-rescue`          | Assess and repair a difficult existing application    | Review boundaries, findings, remediation sequence, Timetrack example |
| `/services/fractional-cto`           | Get technical direction or embedded senior delivery   | Responsibilities, fit, expected outcomes, Constellation example      |
| `/blog`                              | Find practical product engineering guidance           | Three guides organized around a reader decision                      |
| `/blog/scope-first-software-release` | How should I scope the first build?                   | User journey, acceptance criteria, dependencies, briefing checklist  |
| `/blog/review-ai-generated-code`     | What should I check before accepting AI-written code? | Authorization, data writes, failures, meaningful tests, recovery     |
| `/blog/repair-or-rewrite`            | Should I repair or replace an existing application?   | Decision criteria, targeted replacement, migration costs             |

Services and the practical blog live on Full Stack Technologies. Valid former personal URLs permanently redirect to the FST canonical destination. The personal site links to selected FST resources rather than hosting duplicate libraries. Product examples remain on both brands with distinct contribution/decision copy for personal and problem/capability copy for FST, plus distinct metadata and self-canonicals.

## Potential pages, in priority order

These are opportunities to write substantive pages when the supporting material is available. Do not publish empty routes or alternate versions of the same service page just to target more terms.

| Priority    | Proposed page                                 | Reader question                                           | What to gather before writing                                                                    |
| ----------- | --------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Next        | `/blog/software-project-brief`                | What should I send an engineer before asking for a quote? | A reusable brief with an explicitly fictional worked example                                     |
| Next        | `/blog/codebase-review-deliverables`          | What should a codebase review give me?                    | An anonymized finding and a sample prioritized remediation list                                  |
| Next        | `/blog/fractional-cto-or-senior-developer`    | Which kind of help does my team need?                     | A comparison of responsibility, availability, and implementation ownership                       |
| Next        | `/blog/software-handoff-checklist`            | What should I own and know after a build?                 | A practical checklist for access, deployment, recovery, and maintenance                          |
| Later       | `/blog/ai-session-time-vs-billable-time`      | How should overlapping AI sessions be reported?           | Timetrack screenshots and a numerical example clearly separated from contractual billing advice  |
| Later       | `/blog/client-portal-data-boundaries`         | How do I keep each client's information private?          | A reviewed technical example with authorization and negative tests                               |
| Later       | `/blog/forecast-ranges-for-software-projects` | Why give a delivery range rather than a single date?      | A worked example with assumptions and limitations; avoid unmeasured accuracy claims              |
| Conditional | `/services/ai-engineering-workflows`          | Can you help my team adopt AI coding tools?               | A distinct engagement scope, deliverables, and an example review workflow                        |
| Conditional | `/work/accounttouch`                          | What did Nicholas own and deliver?                        | Permission to publish, a verified role and timeline, approved visuals, and attributable outcomes |
| Conditional | `/work/fintech-platform`                      | What changed as the team and product grew?                | Permission, specific responsibility, and verifiable outcomes rather than a valuation headline    |

Avoid city-swapped landing pages, generic framework pages with no distinct service, invented client testimonials, unsourced savings statistics, and article variants that answer the same question.

## SEO and generative search

The implementation emphasizes readable server-rendered text, useful headings, internal links, consistent author/provider identities, canonical URLs, and structured data that reflects visible content. Articles have a byline, publication date, and BlogPosting markup; service pages identify the provider. Existing product FAQs remain explanatory content, without a promise of FAQ rich results.

Google says its normal SEO fundamentals apply to AI features and no special AI markup or text file is required. The existing `llms.txt` has been refreshed as a site summary; it is not treated as a ranking mechanism. Other answer engines may select sources differently. Inclusion or citation is not guaranteed. See [Google's AI features guidance](https://developers.google.com/search/docs/appearance/ai-features) and [people-first content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content).

## Publishing and measurement

1. Read and edit the starter articles before public deployment; confirm that the byline and advice reflect Nicholas's views. Update dates if publication happens later.
2. Confirm the production personal origin in `NEXT_PUBLIC_PERSONAL_URL` (or the legacy `NEXT_PUBLIC_SITE_URL`). Local development currently uses localhost. FST defaults to `https://fullstacktechnologiesllc.com`; set its environment value if that changes. These values are part of the build, so rebuild after changing them.
3. Run lint, typecheck, a production build, and `pnpm test:content` against the running server. The content check covers both brands, links, canonical ownership, article metadata, aliases, and indexing rules. Unknown preview hosts receive a noindex header.
4. After deployment, verify the live canonical URLs and robots responses, submit each domain's sitemap in Search Console, and request inspection of the FST blog index and initial articles. Check production hosting settings for any additional crawl restrictions.
5. Record a baseline of search impressions, clicks, queries, indexed pages, and contact inquiries. Review topic performance after there is enough data to compare. Use observed questions and inquiries to choose the next article; do not publish to an arbitrary volume target.

No Search Console access, live rankings, external citations, search demand, or conversion results were measured in this repository pass. The starter articles use practical guidance and existing product examples, not invented project outcomes.

## AI playbook and prompt library extension

Added after Nicholas confirmed his tool preferences: Claude Code and Codex; Claude
`/design` for product design; Claude Code generally for implementation; Codex for
reviews, images and logo exploration, landing pages, and websites; sometimes both.
Model roles are recommendations, not a claim about Nicholas's exact account configuration.

The `/ai` section contains the SDLC, tool and model selection, engineering and design
responsibilities, lean versus in-house delivery, offshore handoff tradeoffs, resource
transparency, and a linked community-research page. `/prompts` contains eight templates
across discovery, design, implementation, review, and release, each with timing, required
context, and checks. Both sections live on FST and appear in its navigation, search, and sitemap. The
personal site links to selected resources on FST and redirects valid former resource URLs.

The team-size case is conditional: a focused project can suit a senior engineer with
focused design support, while ongoing capacity and support needs can justify permanent
staff. Offshore guidance addresses overlap, handoffs, access, ownership, and total cost;
it does not attribute quality to nationality or assert that distributed teams cannot work.
No universal headcount reduction, savings percentage, or unconfirmed billing policy is published.

Research read October 28, 2026:

- [Claude Code model configuration](https://code.claude.com/docs/en/model-config): model families and provider-specific alias behavior.
- [Claude /design](https://support.claude.com/en/articles/14604416-get-started-with-claude-design): design-system context, iteration, and handoff.
- [OpenAI models](https://developers.openai.com/api/docs/guides/latest-model) and [model selection](https://developers.openai.com/api/docs/guides/model-selection): dated model examples and evaluation guidance.
- [OpenAI review](https://learn.chatgpt.com/docs/code-review), [image tools](https://learn.chatgpt.com/docs/image-generation), and [reasoning prompts](https://developers.openai.com/api/docs/guides/reasoning-best-practices): relevant capabilities and prompting context.
- Five Reddit discussions are linked on `/ai/community-research`. They include Claude implementation/Codex review, the reverse split, handoff overhead, repeated findings, and disagreement about frontend work. These are self-selected reports, not representative market research or independently reproduced benchmark results.

Next useful additions are a permissioned, real project walkthrough with its brief,
approved design, implementation diff, and review evidence, and a completed project-level
AI usage disclosure once account ownership, pass-through charges, and any markup are agreed.
Update the visible model-review date only after rechecking the official model guidance.

## Brand ownership

| Content                                                 | Primary home           | Treatment on the other site                                              |
| ------------------------------------------------------- | ---------------------- | ------------------------------------------------------------------------ |
| Nicholas's profile, process, interests, and experience  | Personal               | FST explains who leads the studio and links article bylines to Nicholas  |
| Personal product contribution and engineering decisions | Personal               | Shared product interfaces with separate FST problem/capability framing   |
| Services, commercial fit, and engagements               | FST                    | Selected links from personal pages                                       |
| Practical engineering blog                              | FST                    | Short introductions and links from personal; Nicholas remains the author |
| AI delivery playbook and prompts                        | FST                    | Selected links; no duplicate personal library                            |
| Personal experiments and first-hand lessons             | Personal, when written | Link from FST when relevant; avoid republishing identical articles       |

The personal rail and search contain only personal pages and product work. Valid former
personal service, blog, AI, and prompt URLs redirect permanently to FST, resolving aliases
directly to the final canonical path. Unknown paths remain 404s. Each domain's sitemap
lists its own pages. This replaces the initial shared-library implementation above.

No new personal opinion articles have been fabricated. Good future personal pieces would
show a real decision in one of the products, an experiment Nicholas actually ran, or a
lesson from a permissioned engagement. Practical buyer guidance continues to belong to FST.
Deploy the brand split and FST destinations together so the permanent redirects have a
working destination. Confirm the production personal origin before building the release.

The project rail contains only Home and product projects. FST resource libraries are
linked from its home page and the home sidebar’s Resources group, without separate rail
icons. Helm is preserved alongside Paradox, Timetrack, and Constellation, with per-brand
framing and inclusion in the appropriate home links, navigation, and sitemap.
