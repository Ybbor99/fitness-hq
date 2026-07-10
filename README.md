# Fitness HQ — your personal workout PWA

A single-file workout tracker that runs entirely in your browser and works
offline once installed.

## The app is live at

**https://ybbor99.github.io/fitness-hq/**

Deployment is automatic: every push to this repo re-deploys the site via the
GitHub Actions workflow in `.github/workflows/deploy-pages.yml`.

## Put it on your iPhone home screen

1. Open the URL above in **Safari** (must be Safari)
2. Tap the **Share** button → **Add to Home Screen** → **Add**
3. Done — it has its own icon, opens full screen, works offline

## Where your data lives

Saved in the app's storage **on your phone** — it survives closing, restarting,
airplane mode. Two cautions: it's per-device (phone and laptop each keep their
own log), and "Clear Safari history & website data" would wipe it. Don't do
that, or ask Claude to add an export/backup button first.

## Updating the app later

Ask Claude for changes → commit the new `index.html` to this repo → the site
re-deploys automatically and the app updates itself on your phone. Your data
is untouched by updates.
