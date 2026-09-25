# VECTOR OPS — Public Alpha Deployment Validation

**Date:** 25 September 2026  
**Branch:** `build/vertical-slice`  
**Milestone:** M5 — Public Demo  
**Status:** Production deployment active; production smoke test pending

## Purpose

This document records the first production deployment of the VECTOR OPS public alpha and separates deployment infrastructure validation from the remaining production interaction smoke test.

## Deployment architecture

The public alpha is deployed as a static Astro build through Cloudflare Pages.

```text
GitHub repository
miichalbe/vector-ops
        ↓
production branch
build/vertical-slice
        ↓
Cloudflare Pages build
npm run build
        ↓
static output
dist/
        ↓
Cloudflare global network
        ↓
vector.michalbiernacki.com
```

The existing `michalbiernacki.com` site remains on its existing OVH Web Hosting service. VECTOR OPS does not share that site's document root or runtime.

DNS for `michalbiernacki.com` remains hosted at OVH. The VECTOR OPS subdomain is delegated to Cloudflare Pages using a CNAME record:

```text
vector.michalbiernacki.com
CNAME → vector-ops-7jf.pages.dev
```

This keeps the public demo isolated from the existing portfolio hosting while preserving the existing domain and nameserver configuration.

## Deployment result

Cloudflare Pages successfully:

- connected to the GitHub repository;
- built the `build/vertical-slice` branch;
- produced and deployed the static Astro application;
- exposed the generated Pages deployment successfully;
- accepted the custom domain `vector.michalbiernacki.com`.

The custom-domain DNS record was added manually in the OVH DNS zone.

## External availability check

After DNS propagation, the production endpoint responded successfully:

```text
curl -I https://vector.michalbiernacki.com
HTTP/2 200
server: cloudflare
content-type: text/html; charset=utf-8
```

The site was also manually confirmed to load successfully in a browser over HTTPS.

This establishes that:

- DNS resolution is working;
- the custom domain is routed to Cloudflare Pages;
- HTTPS is active;
- the production static site is being served successfully.

## Validation already completed before deployment

Before production deployment, the current alpha passed:

- automated runtime tests;
- Astro / TypeScript checking;
- production build verification;
- full manual reference-run acceptance;
- full manual fresh-run acceptance;
- onboarding / synthetic-data disclosure validation;
- Decision Focus, Timeline, AAR, Replay and New run checks.

The deployed build therefore follows a locally accepted release candidate rather than serving as the first validation environment.

## Remaining production gate

Deployment infrastructure is **PASS**.

The remaining M5 gate is a reduced production smoke test on `https://vector.michalbiernacki.com`.

Required checks:

- first-load onboarding appears and holds scenario time at `07:40`;
- `Start scenario` begins progression;
- `About this demo` opens and closes without state loss;
- Live Activity, entity selection, Assessment and Projection render correctly;
- all three Decision Focus points remain operable;
- the reference run reaches AAR;
- Replay same seed resets correctly;
- New run produces a different seed and valid baseline;
- at least one fresh-seed production run reaches AAR;
- no asset, routing, caching or HTTPS issue appears in the deployed environment.

## Conclusion

VECTOR OPS is now publicly reachable on its production custom domain:

`https://vector.michalbiernacki.com`

The deployment path is confirmed as **GitHub → Cloudflare Pages → OVH-managed CNAME → custom HTTPS domain**.

M5 should be considered complete only after the production smoke test passes and its result is recorded.
