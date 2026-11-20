# dsh-bot-model-switch

English | [中文](README.zh.md)

[![npm](https://img.shields.io/npm/v/dsh-bot-model-switch)](https://www.npmjs.com/package/dsh-bot-model-switch)

Switch the model of **every Bot in a DS Bot team at once**, or **set each Bot individually**, from one card in the plugin settings page.

Built for [DS Bot](https://github.com/Fei2411/DS-Bot) — a team of long-lived Bots on DeepSeek Harness. When a team grows past a handful of Bots, changing each one's model through its own settings card stops being a chore and starts being a source of drift: half the team on the old model, half on the new, nobody sure which. This plugin turns that into one decision.

## What you get

- **Batch mode** — pick one model, apply it to every Bot. Scope can be the whole team or every Bot except the main one, and the preview names the Bots that will be skipped before anything is written.
- **Per-Bot mode** — one row per Bot with its current model, a model picker, an optional thinking level, and a read-only context toggle. Only rows you actually changed are written; untouched Bots are never contacted.
- **Pre-flight, not all-or-nothing** — a Bot that cannot take the target model is named and skipped rather than aborting the run. A refusal from the host is a row to report; only an accident (network failure, 5xx, unreadable answer) stops the batch.
- **Undo** — the last five runs are kept in `localStorage` under `dsh-model-switch.undo.v1`. Undo verifies each Bot still holds the value the run wrote, and skips the ones somebody changed in the meantime instead of overwriting them.
- **Real rollback** — when a batch does fail mid-way, the Bots it already changed are put back in reverse order, including the thinking level it wrote, and anything that could not be put back is named.
- **One level for the whole batch** — the batch picker asks the target model for its levels and offers only those. A level is sent only when the model serves it; otherwise the Bot still gets the model and the preview says so per row (`model only` vs the level's name).
- **Context, read-only** — the `context` toggle on a per-Bot row asks the host's `run-stats` only when opened: at most two requests at a time, cached per Bot. It shows the next request's projected tokens against the route's context window; anything the host does not report shows `—`. It is a readout, not a setting — DSH has no Bot-level context field to write.
- **Read-back after writing** — a run re-reads the team and compares each Bot's *applied* model (and, in per-Bot mode, its level). A Bot that was written but did not take effect is named as `written but not applied`: it does not fail the run and it does not trigger a rollback.
- **Copy a row** — the `→` button on a per-Bot row copies that row's model and level to the other rows, locally; nothing is stored.

## Requirement — read this first

**This plugin needs a DS Bot host.** It is built against DSH 0.2.1-rc.4, and that is the only host version it has actually been run on. It declares `engines.dsh >=0.2.1-0 <0.3.0-0 || >=0.2.2-alpha.2 <0.3.0-0`: the whole 0.2.1 line plus the 0.2.2 prerelease line are accepted, 0.3.x is refused. The 0.2.2 line is declared compatible but has not been run-tested. It talks to `POST api/bot`, the endpoint DS Bot adds on top of DeepSeek Harness for its team view. A plain `dsh web` profile does not serve that route, so the card will load but every read fails with `unauthorized` and no model list appears.

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

Restart DS Bot once so the bundle patch is picked up. The card then appears in the plugin settings page under **Batch switch model**. The card registers itself under the package name `dsh-bot-model-switch` only — the host keys this slot by that name, and a mismatch leaves the section empty.

## How it writes

Every change is one `POST api/bot` request with `{ endpoint: "update-bot", payload: { id, model } }`, or `{ id, model, effort }` when a thinking level was picked. Models are read from the same `state` endpoint the app itself uses, and thinking levels come from `efforts(<model ref>)`.

- A **local CLI route** (`local-*/…`) that would cross the model↔CLI line is skipped, not forced: the host requires an explicit `changeEngine` confirmation for that, and that confirmation belongs to the Bot's own settings, not to a batch button.
- A model whose provider has **no API key** (`needsKey`) is filtered out of the picker rather than offered and then rejected.
- **A thinking level is never carried across a model change** unless you pick one, and never sent unless the target model serves it. `update-bot` resolves the level against the new model and throws *before* it writes, so an unserved level would take the model change down with it. The batch picker lists only what `efforts(<target>)` returned, and the per-Bot patch re-checks the same way.
- **A Bot running on a local CLI route keeps its own row only** — that engine change is confirmed in the Bot's own settings, not here.

## Scope and limits

- Manages models for Bots in the **current DS Bot team** on the machine you are running. It is not a provider manager, not a router, and it does not add or configure providers.
- Does not touch `state.json`, the session store, or any credential.
- No network access beyond `api/bot` on the same origin.
- Undo history lives in the browser, so it is per-browser-profile and does not survive clearing site data.

## Not the same plugin

There is an unrelated `dsh-model-switch` by another author, listed in the DSH directory. That one routes models per role inside a single Harness session. This one changes the **model of each Bot in a DS Bot team**. Different packages, different authors, different scope — install whichever matches what you are running.

## License

MIT
