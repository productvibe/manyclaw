# publish.md — How to ship ManyClaw

## Problem: git history has large files

Old `release/` build artifacts were committed to git history before the repo was cleaned up. GitHub rejects pushes with files over 100MB. These need to be purged from history before the first push.

### Fix: rewrite history with git-filter-repo

```bash
pip3 install git-filter-repo --break-system-packages

cd ~/Projects/manyclaw

# Remove release/ from all history
git filter-repo --path release --invert-paths --force

# Re-add the remote (filter-repo removes it)
git remote add origin https://github.com/productvibe/manyclaw.git

# Push
git push -u origin main
```

---

## First publish

### 1. Push the repo

```bash
# Ensure you're on the productvibe account
gh auth switch --user productvibe

# Create the repo (if not already done)
gh repo create productvibe/manyclaw --public --description "Manage multiple OpenClaw instances on one machine"

# Push (after purging large files from history — see above)
cd ~/Projects/manyclaw
git remote add origin https://github.com/productvibe/manyclaw.git
git push -u origin main

# Note: if protection is already on and you need to push setup commits directly:
# gh api repos/productvibe/manyclaw/branches/main/protection -X DELETE
# git push
# ... then re-enable protection (step 2)
```

### 2. Protect the main branch

Require PRs with 1 approval. No direct pushes, not even from admins. Stale approvals dismissed on new commits.

```bash
gh api repos/productvibe/manyclaw/branches/main/protection \
  -X PUT \
  -H "Accept: application/vnd.github+json" \
  --input - <<'EOF'
{
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": true
  },
  "enforce_admins": true,
  "required_status_checks": null,
  "restrictions": null
}
EOF
```

This means:
- Nobody can push directly to `main` (not even admins)
- All changes need a PR with at least 1 approval
- Stale approvals are dismissed if new commits are pushed

### 3. Create the GitHub Release

```bash
gh release create v0.0.1 \
  apps/desktop/release/ManyClaw-0.0.1-arm64.dmg \
  --title "ManyClaw v0.0.1" \
  --notes "First signed and notarized release. macOS arm64." \
  --repo productvibe/manyclaw
```

Or via the GitHub UI:
- Repo → Releases → Create a new release
- Tag: `v0.0.1`, Target: `main`
- Attach: `apps/desktop/release/ManyClaw-0.0.1-arm64.dmg`
- Publish

The download button on manyclaw.app points to `/releases/latest` — it will work automatically.

### 4. Deploy the website to Cloudflare Pages

- Go to dash.cloudflare.com → Workers & Pages → Create → Pages
- Connect GitHub → select `productvibe/manyclaw`
- Build settings:
  - Root directory: `website`
  - Build command: `pnpm build`
  - Output directory: `build/client`
  - Environment variable: `NODE_VERSION = 20`
- Deploy

Cloudflare auto-deploys on every push to `main` after this.

### 5. Custom domain

- Cloudflare Pages → Custom domains → Add `manyclaw.app`
- Update DNS to point to Cloudflare (add the CNAME they provide)

---

## Subsequent releases

### Build

```bash
cd ~/Projects/manyclaw/apps/desktop
APPLE_ID="developer@productamp.io" \
APPLE_APP_SPECIFIC_PASSWORD="<app-specific-pw>" \
APPLE_TEAM_ID="JS353BKF9P" \
pnpm dist:mac
```

### Tag and release

```bash
# Bump version in apps/desktop/package.json first
git add apps/desktop/package.json apps/desktop/CHANGELOG.md
git commit -m "chore: bump version to X.X.X"
git tag vX.X.X
git push && git push --tags

# Create release with DMG
gh release create vX.X.X \
  apps/desktop/release/ManyClaw-X.X.X-arm64.dmg \
  --title "ManyClaw vX.X.X" \
  --notes "$(cat apps/desktop/CHANGELOG.md | head -30)" \
  --repo productvibe/manyclaw
```

Auto-update in the app checks GitHub Releases on launch. Users get notified and can install with one click.

---

## Signing credentials

- Apple ID: `developer@productamp.io` (single m)
- Team ID: `JS353BKF9P`
- Legal entity: SEVEN LABS AS (Productvibe brand)
- App-specific passwords: generate at appleid.apple.com → App-Specific Passwords
- Signing identity in Keychain: `Developer ID Application: SEVEN LABS AS (JS353BKF9P)`

Note: the Apple ID account must have agreed to all current developer agreements at appstoreconnect.apple.com or notarization will return 401.
