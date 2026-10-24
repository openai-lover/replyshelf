# Security and data boundaries

ReplyShelf is a browser-local demo for short, reviewed support answers. Do not enter secrets or sensitive customer records.

## What happens to data

- The app uses no inference API or application backend. Questions and answers are not uploaded.
- Saved cards persist in this origin's localStorage, without app-level encryption or synchronization. Anyone using the same browser profile can access them. Export a backup before clearing browser storage.
- A dedicated worker receives only question text and card IDs, not answer bodies. Cached vectors contain saved questions in memory, while incoming-query vectors are not kept in the reusable cache. Worker memory disappears when the document closes.
- Every reply is exact saved text rendered using textContent. Imported strings are not executed as HTML.
- The user explicitly copies a reply; there is no email or message-sending integration.

## Runtime supply boundary

Transformers.js 3.8.1, its matching WASM runtime, and the q8 model are packaged with the site. Model revision: `751bff37182d3f1213fa05d7196b954e230abad9`. The developer script uses HTTPS publisher sources, and SHA-256 checks prevent silently replacing assets on subsequent preparations. Browser model-cache reuse is disabled so the packaged model is selected; ordinary HTTP caching remains under the browser/host's control. Remote model loading is disabled.

The supplied Content-Security-Policy limits scripts and connections to this origin, with WebAssembly compilation allowed. No third-party fonts, analytics, runtime scripts or inference connections are required. Host/platform access logs and any platform login are separate from the application. This is not a guarantee against a compromised host, compromised browser, or malicious extension.

`dist/_headers` requests CSP, no-referrer, nosniff, and disabled camera/microphone/location/payment permissions from compatible static hosts. A CSP meta tag also protects the document. Other hosts must configure response headers themselves, particularly the worker response. Verify actual deployed responses rather than assuming `_headers` support. The local development server applies these headers; it listens only on loopback.

## Imports and edits

Imports are JSON, limited to 1 MB and 100 entries. Fields have type, non-empty, and size limits; duplicate IDs are rejected after trimming. Import replacement needs an in-app confirmation. Removals and imports offer a 10-second undo. Storage-write errors are reported rather than pretending a save succeeded. An edit invalidates displayed matches and stale worker results are discarded.

## Review scope — October 24, 2026

Ten unit tests cover validation/ranking/ambiguity boundaries. Browser checks cover real inference under CSP, a 390px responsive layout, persistence/edit/copy/removal, and inert rendering of HTML-shaped text. A source scan for private keys and common token patterns found no matches. The data and illustrations are synthetic; no real customer records are included in the source or screenshots.

An npm registry advisory query returned no advisories for the queried browser runtime versions. The package's unused Node-side `sharp` dependency declaration returned advisories; this app does not install or ship sharp or the Node runtime. This is not a complete transitive dependency or penetration audit. Keep reviewing upstream releases before changing the pinned browser bundle.

## Model limitations

The intended language is English. Input may be truncated by the model tokenizer. The 0.42 similarity cutoff and 0.06 ambiguity gap are heuristics, not calibrated confidence or safety guarantees. An incorrect reply can still be offered. Review its source question and the entire answer before using it.
