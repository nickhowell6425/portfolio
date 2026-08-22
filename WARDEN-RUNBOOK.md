# Warden runbook — nickhowell6425/portfolio

Managed by Warden. These are the steps that cannot be automated through provider APIs today; each is verified by `warden verify` after it is done.

## Accounts (Warden-hosted; yours to take at any time)

- GitHub: repository `nickhowell6425/portfolio` with the Warden App installed. Private repositories need the Team plan for rulesets.
- Vercel: project `portfolio` on Warden's team (you are not a member of the team: members see every project on it). Transfer to a team of your own on request, free.
- Supabase: project `daxvlteupndmkolzfawr` in Warden's organisation (you are not a member: members see every project in it). Transfer to an organisation of your own on request, free. Your data lives there; Warden's responsibilities for it are in your agreement.

## Dashboard-only steps

1. **Supabase → Integrations → GitHub**: connect the repository, production branch `main`, deploy-to-production on, automatic branching on, 'Supabase changes only' ON. Previews without database changes use Warden's persistent `warden-preview` branch; only PRs that change migrations get a branch of their own (branch compute bills outside the spend cap).
2. **Supabase → Database → Backups**: Pro includes daily backups (7-day retention). Point-in-time recovery is a choice: $100/mo (7 days) + Small compute; worth it if the app takes payments or holds user content. Either way, restore once into a branch and record the date below.
3. **Vercel → Settings → Git**: turn off PR comments if you do not want them; confirm the production branch is `main`.

## Records

- Last tested restore: _not yet_
- Last `warden verify`: _not yet_
