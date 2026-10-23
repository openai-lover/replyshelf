# ReplyShelf

**A little less replying.** Find the answer you already wrote, even when the question sounds different.

A new project made on October 23–24, 2026 for [Hacktoberfest Open-Source AI Challenge Week 3: Slow and Steady](https://dev.to/challenges/hacktoberfest-week3-2026-10-19). Built with AI coding assistance.

## Try it

Hosted app: https://replyshelf-local-ai.nununong.chatgpt.site

1. Ask “My accountant needs proof that I paid.”
2. Inspect the invoice answer and similarity score.
3. Review the exact stored text, then copy it. Nothing is sent automatically.
4. Try “What is the weather in Tokyo tomorrow?” to see a withheld result.
5. Open **My shelf** to replace fictional samples with your own reviewed answers.
6. Open **Behind the shelf** and run the reproducible local comparison.

The initial model/runtime download needs internet. No API key or AI service account is needed. A modern browser with WebAssembly is required. Tested in Chromium on Windows. Model and runtime caching depends on the browser; fully offline operation is not guaranteed.

## Run locally

Requires Node.js 20+; no package install or build step.

```sh
node server.mjs
# Open http://127.0.0.1:4190/
node --test tests/core.test.mjs
```

Serve `dist/` over HTTPS or localhost for clipboard/worker functionality. Any static host can serve it. The development server listens only on 127.0.0.1.

## The open AI component

The browser downloads the Apache-2.0 licensed **Xenova/all-MiniLM-L6-v2** ONNX model through **Transformers.js 3.8.1**, also Apache-2.0. In a Web Worker, `feature-extraction` runs with `dtype: 'q8'`, WebAssembly, mean pooling, and normalized 384-dimensional vectors. Cosine similarity ranks saved questions. The returned answer is the exact stored answer: no generative language model rewrites policy or invents details.

Vectors are cached in worker memory by their exact text. Changing a question generates a new vector. Edits invalidate displayed results; request IDs discard results computed against an older shelf. Work is serialized in the worker, with at most one active user search.

- Similarity < 0.42: no ready-to-copy reply.
- Top-two gap < 0.06: ambiguity notice and alternatives.
- Otherwise: a candidate, still requiring human review.

These are uncalibrated heuristics, not a probability or a safety guarantee. English is the intended language. Up to 100 answers; each question is limited to 500 characters. Long input can still be truncated by the model tokenizer. Short, specific questions work best.

## An honest small comparison

The in-app comparison uses 8 fixed synthetic paraphrases and 3 unrelated questions, defined in `dist/core.js`. It compares the model with a Jaccard word-overlap baseline over the same stored questions, without stopword removal. Ties use shelf order. This is a demonstration, not a representative benchmark or an accuracy claim.

One observed Chromium/Windows run on October 24, 2026:

| Measure | Result |
| --- | --- |
| Semantic top-1 retrieval | 6 / 8 |
| Word-overlap top-1 retrieval | 6 / 8 |
| Semantic misses flagged ambiguous | 2 / 2 |
| Unrelated questions withheld | 3 / 3 |

Semantic retrieval found the invoice for “My accountant needs proof that I paid” and email change for a different-mailbox question. It confused inviting a colleague with transferring ownership. Word overlap got those two workspace questions right but missed invoice/email. Neither method dominates this tiny set. The ambiguity UI is part of the product, not an excuse to hide misses. Run and download the full results yourself. Timing varies with device and cache and excludes model download.

## Data and privacy

- Queries, embeddings, and answers are processed in the browser, not sent to an AI inference service.
- Shelf entries persist in localStorage; embeddings live in worker memory.
- No app backend, analytics, cookies, or sign-in implementation. Hosting providers may collect standard access logs.
- Hugging Face and jsDelivr receive model/runtime requests, and Google Fonts receives font requests. These include ordinary network metadata. Download privacy is distinct from query privacy.
- Browser storage is not app-encrypted. Do not store secrets or sensitive customer records. Export backups before clearing browser data.
- JSON imports have a 1 MB / 100-entry cap, field validation and a replacement confirmation. Removing entries or replacing a shelf can be undone for 10 seconds.
- Text is rendered with `textContent`, not inserted as HTML.

## Files

`dist/index.html`: UI · `dist/style.css`: responsive design · `dist/app.js`: interaction/persistence · `dist/engine.js`: local inference · `dist/core.js`: data/ranking/validation · `tests/core.test.mjs`: seven unit tests.

## License and acknowledgements

Application code: MIT, see LICENSE. Model and runtime are fetched from their publishers and remain under their respective licenses; they are not relicensed by this repository.

- [ONNX model and Apache-2.0 license](https://huggingface.co/Xenova/all-MiniLM-L6-v2)
- [Original sentence-transformers model](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2)
- [Transformers.js source and license](https://github.com/huggingface/transformers.js)
- [ONNX Runtime](https://github.com/microsoft/onnxruntime), MIT (transitive runtime)
- DM Sans and Libre Caslon Display via Google Fonts, SIL Open Font License.

All example answers and evaluation questions are synthetic and describe a fictional service. They are not advice or real company policies.
