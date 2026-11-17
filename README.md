# dsh-bot-model-switch

English | [中文](README.zh.md)

[![npm](https://img.shields.io/npm/v/dsh-bot-model-switch)](https://www.npmjs.com/package/dsh-bot-model-switch)

Switch the model of **every Bot in a DS Bot team at once**, or **set each Bot individually**, from one card in the plugin settings page.

Built for [DS Bot](https://github.com/Fei2411/DS-Bot) — a team of long-lived Bots on DeepSeek Harness. When a team grows past a handful of Bots, changing each one's model through its own settings card stops being a chore and starts being a source of drift: half the team on the old model, half on the new, nobody sure which. This plugin turns that into one decision.

## What you get

- **Batch mode** — pick one model, apply it to every Bot. Scope can be the whole team or every Bot except the main one, and the preview names the Bots that will be skipped before anything is written.
- **Per-Bot mode** — one row per Bot with its current model, a model picker, and an optional thinking level. Only rows you actually changed are written; untouched Bots are never contacted.
- **Pre-flight, not all-or-nothing** — a Bot that cannot take the target model is named and skipped rather than aborting the run. A refusal from the host is a row to report; only an accident (network failure, 5xx, unreadable answer) stops the batch.
- **Undo** — the last five runs are kept in `localStorage` under `dsh-model-switch.undo.v1`. Undo verifies each Bot still holds the value the run wrote, and skips the ones somebody changed in the meantime instead of overwriting them.
- **Real rollback** — when a batch does fail mid-way, the Bots it already changed are put back in reverse order, and anything that could not be put back is named.

## Requirement — read this first

**This plugin needs a DS Bot host.** It talks to `POST api/bot`, the endpoint DS Bot adds on top of DeepSeek Harness for its team view. A plain `dsh web` profile does not serve that route, so the card will load but every read fails with `unauthorized` and no model list appears.

That is also why the host half (`lib/index.js`) is deliberately empty. All writes go through the host's own `update-bot` endpoint, so the running Bot engine stays the single writer of its state. A plugin that wrote `state.json` directly would race the engine and lose somebody's message — this plugin does not do that.

## Install

With DS Bot's plugin manager, add:

```
dsh-bot-model-switch
```

Or from a terminal, in the profile DS Bot actually uses:

```sh
dsh plugin --profile <profile> add dsh-bot-model-switch
```

From the GitHub source instead:

```sh
dsh plugin --profile <profile> add github:DamonKoy/dsh-bot-model-switch
```

Restart DS Bot once so the bundle patch is picked up. The card then appears in the plugin settings page under **Batch switch model**.

## How it writes

Every change is one `POST api/bot` request with `{ endpoint: "update-bot", payload: { id, model } }`. Models are read from the same `state` endpoint the app itself uses.

- A **local CLI route** (`local-*/…`) that would cross the model↔CLI line is skipped, not forced: the host requires an explicit `changeEngine` confirmation for that, and that confirmation belongs to the Bot's own settings, not to a batch button.
- A model whose provider has **no API key** (`needsKey`) is filtered out of the picker rather than offered and then rejected.
- **Thinking level is never carried across a model change** unless you pick one. Different models serve different levels, and sending a level the new model does not have makes the host reject the whole patch — which would leave the model unchanged too.

## Scope and limits

- Manages models for Bots in the **current DS Bot team** on the machine you are running. It is not a provider manager, not a router, and it does not add or configure providers.
- Does not touch `state.json`, the session store, or any credential.
- No network access beyond `api/bot` on the same origin.
- Undo history lives in the browser, so it is per-browser-profile and does not survive clearing site data.

## Not the same plugin

There is an unrelated `dsh-model-switch` by another author, listed in the DSH directory. That one routes models per role inside a single Harness session. This one changes the **model of each Bot in a DS Bot team**. Different packages, different authors, different scope — install whichever matches what you are running.

## License

MIT
