# VECTOR OPS — Public Alpha Deployment Validation

**Date:** 25 September 2026  
**Production branch:** `main`  
**Milestone:** M5 — Public Demo  
**Status:** Production deployment and smoke validation PASS

## Purpose

This document records the production deployment of the VECTOR OPS public alpha and the final reduced production smoke test used to close M5.

## Deployment architecture

The public alpha is deployed as a static Astro build through Cloudflare Pages.

```text
GitHub repository
miichalbe/vector-ops
        ↓
production branch
main
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
- built the accepted public-alpha release;
- produced and deployed the static Astro application;
- exposed the generated Pages deployment successfully;
- accepted the custom domain `vector.michalbiernacki.com`.

The custom-domain DNS record was added manually in the OVH DNS zone.

The first accepted public deployment was produced from `build/vertical-slice`. After the alpha acceptance chain passed, `main` was fast-forwarded to the identical accepted release state and Cloudflare Pages production branch control was changed to `main`. This leaves the public deployment pipeline in its intended release configuration without changing the accepted application behaviour.

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

## Validation completed before deployment

Before production deployment, the alpha passed:

- automated runtime tests;
- Astro / TypeScript checking;
- production build verification;
- full manual reference-run acceptance;
- full manual fresh-run acceptance;
- onboarding / synthetic-data disclosure validation;
- Decision Focus, Timeline, AAR, Replay and New run checks.

The deployed build therefore followed a locally accepted release candidate rather than serving as the first validation environment.

## Production smoke test

A reduced production smoke test was completed on `https://vector.michalbiernacki.com` after deployment.

The production environment was manually verified for:

- first-load onboarding and `07:40` ready state;
- `Start scenario` runtime progression;
- `About this demo` open / close behaviour, including backdrop and Escape dismissal;
- Live Activity, entity state and selected-entity inspection;
- Assessment and Projection presentation;
- all three Decision Focus interactions;
- reference run `8F4C` through completion and After-Action Report;
- same-seed Replay returning to the `07:40` baseline with `8F4C` preserved;
- New run generating a different seed and valid baseline;
- a representative fresh-seed run through completion and AAR;
- correct fresh-run seed / configuration reconstruction;
- no observed missing assets, routing failures, HTTPS failures, cache-related breakage or material layout regression.

**Production smoke result: PASS.**

After switching Cloudflare production branch control to `main`, the public endpoint was checked again and continued to return `HTTP/2 200` and load correctly in the browser.

## Release conclusion

The public alpha acceptance chain is complete:

```text
automated regression
+ local manual acceptance
+ production deployment
+ production smoke validation
= PASS
```

VECTOR OPS is publicly reachable at:

`https://vector.michalbiernacki.com`

The release pipeline is now **GitHub `main` → Cloudflare Pages → OVH-managed CNAME → custom HTTPS domain**.

M5 — Public Demo is complete. Further work moves to portfolio integration, case-study production and launch communication rather than additional public-alpha feature scope.
