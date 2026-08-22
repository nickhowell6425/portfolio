# Warden runbook — nickhowell6425/portfolio

Managed by Warden. These are the steps that cannot be automated through provider APIs today; each is verified by `warden verify` after it is done.

## Accounts (you own every one)

- GitHub: repository `nickhowell6425/portfolio` with the Warden App installed. Private repositories need the Team plan for rulesets.
- Vercel: team `team_gHc8XDOJVXjLgDtBxGpX0VDS`, project `portfolio`. Warden needs a seat on the team (tokens are not scoped below a role).
- Supabase: project `daxvlteupndmkolzfawr` in an organisation you own.

## Dashboard-only steps

1. **Supabase → Project Settings → Branching**: enable, connect the GitHub repository, tick 'Supabase changes only' off (every PR gets a branch).
2. **Supabase → Database → Backups**: enable point-in-time recovery (Pro add-on). Then restore to a branch once and record the date below.
3. **Vercel → Settings → Git**: turn off PR comments if you do not want them; confirm the production branch is `main`.

## Records

- Last tested restore: _not yet_
- Last `warden verify`: _not yet_
