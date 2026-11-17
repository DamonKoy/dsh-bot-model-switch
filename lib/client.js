window.__ModuleLoader__.load({
	id: "dsh-bot-model-switch",
	factory: (require) => {
		var module = { exports: {} }
		var exports = module.exports
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" })
		let react = require("react")
		let h = react.createElement

		const NS = "model-switch"

		// Undo lives in the browser, never in state.json: the host stays the only
		// writer of the team, and a reload keeps the last few runs undoable.
		const UNDO_KEY = "dsh-model-switch.undo.v1"
		const UNDO_MAX = 5

		const zh = {
			"card.title": "批量切换模型",
			"card.description": "把这个团队的每个 Bot 一次切到同一个模型。走 DS Bot 自己的写入通道，不会和运行中的 Bot 引擎抢 state.json。",
			"field.model": "目标模型",
			"field.modelHint": "从当前可用模型里选，切换会立即对每个 Bot 生效。",
			"field.scope": "范围",
			"scope.all": "全部 Bot（含主 Bot）",
			"scope.exceptMain": "除主 Bot 外全部",
			"action.switch": "一键切换",
			"action.switching": "切换中…",
			"action.restore": "撤销上一次切换",
			"action.restoring": "撤销中…",
			"count": "共 {n} 个 Bot，其中 {k} 个已是该模型",
			"switching": "正在切换 {i}/{n}：{name}",
			"done": "完成：{n} 个 Bot 已切到该模型。",
			"none": "所有 Bot 已是该模型，未做改动。",
			"nothing": "没有可切换的 Bot。",
			"rolledBack": "第 {i} 个失败，已把先前改过的 {k} 个回滚。原因：{error}",
			"rollbackFailed": "失败且回滚不完整，请手动检查：{list}",
			"restored": "已撤销上一次切换，{n} 个 Bot 回到原模型。",
			"noUndo": "没有可撤销的记录。",
			"undoSkipped": "撤销：还原 {n} 个，跳过 {k} 个（{list}）。",
			"loading": "正在读取模型列表…",
			"noModels": "还没读到模型列表。",
			"noServed": "只有本地 CLI 路由，换引擎要在 Bot 设置里做。",
			"pick": "请选择模型",
			"preview.title": "将改动 {n} 个，跳过 {s} 个",
			"preview.main": "主",
			"preview.empty": "选中目标模型后这里显示预览。",
			"preview.same": "已是该模型：{n} 个",
			"batch.partial": "改好 {a} 个；失败 {b} 个（{list}）；跳过 {s} 个。",
			"batch.allSkipped": "没有可切换的 Bot：{s} 个全部跳过。",
			"batch.skippedLine": "跳过 {n} 个：{list}",
			"skip.engine": "当前跑在本地 CLI，换引擎要在 Bot 设置里确认",
			"skip.local": "目标为本地 CLI 路由",
			"skip.needsKey": "渠道缺 API Key",
			"perBot.title": "逐个 Bot 设置",
			"perBot.hint": "每个 Bot 一行，选好模型点「应用」。只改改动过的行。",
			"perBot.colName": "Bot",
			"perBot.colNow": "当前",
			"perBot.colNew": "改为",
			"perBot.apply": "应用改动",
			"perBot.applying": "应用中…",
			"perBot.count": "共 {n} 个待改动。",
			"perBot.same": "已是该模型",
			"perBot.applied": "已应用 {n} 个改动。",
			"perBot.partial": "改好 {a} 个；失败 {b} 个（{list}）。",
			"perBot.refresh": "刷新",
			"perBot.effortKeep": "不改强度",
			"perBot.effortLoad": "读取档位…",
			"perBot.effortNone": "无档位",
			"perBot.skipEngine": "{name} 换引擎需在 Bot 设置确认，已跳过",
			"tab.batch": "批量",
			"tab.perBot": "逐个",
			"effort.label": "思考强度",
			"effort.keep": "不改",
			"undo.none": "无可撤销",
		}

		const en = {
			"card.title": "Batch switch model",
			"card.description": "Move every Bot in this team to one model at once. Uses DS Bot own write path, so it never races the running Bot engine over state.json.",
			"field.model": "Target model",
			"field.modelHint": "Pick from the models currently available. The switch applies to each Bot immediately.",
			"field.scope": "Scope",
			"scope.all": "Every Bot (main included)",
			"scope.exceptMain": "Every Bot except the main one",
			"action.switch": "Switch all",
			"action.switching": "Switching…",
			"action.restore": "Undo last switch",
			"action.restoring": "Undoing…",
			"count": "{n} Bots, {k} already on this model",
			"switching": "Switching {i}/{n}: {name}",
			"done": "Done: {n} Bots moved to this model.",
			"none": "Every Bot is already on this model; nothing changed.",
			"nothing": "No Bots to switch.",
			"rolledBack": "Failed at #{i}; rolled back the {k} already changed. Reason: {error}",
			"rollbackFailed": "Failed, and the rollback is incomplete. Check manually: {list}",
			"restored": "Undid the last switch; {n} Bots are back on their previous model.",
			"noUndo": "Nothing to undo.",
			"undoSkipped": "Undo: restored {n}, skipped {k} ({list}).",
			"loading": "Reading the model list…",
			"noModels": "No model list yet.",
			"noServed": "Only local CLI routes; the engine is changed in the Bot's own settings.",
			"pick": "Pick a model",
			"preview.title": "{n} to change, {s} skipped",
			"preview.main": "main",
			"preview.empty": "Pick a target model to see the preview.",
			"preview.same": "already on it: {n}",
			"batch.partial": "Changed {a}; failed {b} ({list}); skipped {s}.",
			"batch.allSkipped": "Nothing to switch: all {s} skipped.",
			"batch.skippedLine": "Skipped {n}: {list}",
			"skip.engine": "runs on a local CLI; the engine change needs the Bot's own settings",
			"skip.local": "target is a local CLI route",
			"skip.needsKey": "the provider has no API key",
			"perBot.title": "Set each Bot",
			"perBot.hint": "One row per Bot. Pick a model, then Apply. Only changed rows are written.",
			"perBot.colName": "Bot",
			"perBot.colNow": "Now",
			"perBot.colNew": "Change to",
			"perBot.apply": "Apply changes",
			"perBot.applying": "Applying…",
			"perBot.count": "{n} pending.",
			"perBot.same": "already on it",
			"perBot.applied": "Applied {n} change(s).",
			"perBot.partial": "Changed {a}; failed {b} ({list}).",
			"perBot.refresh": "Refresh",
			"perBot.effortKeep": "keep thinking level",
			"perBot.effortLoad": "Reading levels…",
			"perBot.effortNone": "no levels",
			"perBot.skipEngine": "{name} needs the engine change confirmed in its own settings; skipped",
			"tab.batch": "Batch",
			"tab.perBot": "Per Bot",
			"effort.label": "Thinking",
			"effort.keep": "keep",
			"undo.none": "nothing to undo",
		}

		/** One request over DS Bot's own `api/bot` channel, same transport the app uses. */
		async function call(endpoint, payload) {
			const response = await fetch("api/bot", {
				method: "POST",
				credentials: "same-origin",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ endpoint, payload: payload ?? null }),
			})
			if (!response.ok) throw new Error("HTTP " + response.status)
			const result = await response.json()
			if (!result.ok) throw new Error((result.error && result.error.message) || "Request failed")
			return result.value
		}

		/**
		 * A local agent route — `local-codex-cli/...` — runs in a CLI, not on a served
		 * model. `update-bot` refuses to cross that line without `changeEngine: true`,
		 * and that confirmation belongs to the Bot's own settings, so a batch never
		 * sends it: those rows are skipped and named instead.
		 */
		function isLocalRoute(ref) {
			return String(ref ?? "").split("/")[0].startsWith("local-")
		}

		function engineKey(ref) {
			const route = String(ref ?? "").split("/")[0]
			return route.startsWith("local-") ? route : "model"
		}

		/** One catalog entry, from either shape the host may send. */
		function refEntry(entry, provider) {
			if (entry === undefined || entry === null) return null
			if (typeof entry === "string") {
				const ref = provider ? provider + "/" + entry : entry
				return { ref, name: entry, needsKey: false, local: isLocalRoute(ref) }
			}
			if (typeof entry !== "object") return null
			const pid = provider || entry.provider
			const id = entry.id || entry.model
			const ref = typeof entry.ref === "string" ? entry.ref : (pid && id ? pid + "/" + id : null)
			if (!ref) return null
			return {
				ref,
				name: entry.name || entry.label || ref,
				needsKey: entry.needsKey === true,
				local: isLocalRoute(ref),
			}
		}

		/**
		 * The served models, read from the state view.
		 *
		 * The host sends `models` as a flat list of `{ref, provider, id, name,
		 * needsKey?}` — one entry per model, `ref` already assembled. The provider
		 * grouped shapes are still walked as a fallback, so a host change shortens
		 * the list instead of emptying it.
		 */
		function catalogOf(state) {
			const out = []
			const seen = new Set()
			const push = (entry, provider) => {
				const item = refEntry(entry, provider)
				if (!item || seen.has(item.ref)) return
				seen.add(item.ref)
				out.push(item)
			}
			if (!state || typeof state !== "object") return out
			const flat = Array.isArray(state.models) ? state.models
				: Array.isArray(state.catalog) ? state.catalog
					: null
			if (flat) {
				for (const entry of flat) push(entry)
				return out.sort((a, b) => a.ref.localeCompare(b.ref))
			}
			const groups = Array.isArray(state.providers) ? state.providers : null
			if (groups) {
				for (const group of groups) {
					const pid = group && (group.id || group.provider || group.name)
					const models = (group && group.models) || []
					if (!Array.isArray(models)) continue
					for (const model of models) push(model, pid)
				}
			} else if (state.providers && typeof state.providers === "object") {
				// Flat map form: { providerId: [models] } or { providerId: { models: [] } }
				for (const pid of Object.keys(state.providers)) {
					const value = state.providers[pid]
					const models = Array.isArray(value) ? value : (value && Array.isArray(value.models) ? value.models : null)
					if (!models) continue
					for (const model of models) push(model, pid)
				}
			}
			return out.sort((a, b) => a.ref.localeCompare(b.ref))
		}

		/**
		 * Pull the bot list and the main bot ids out of the read-only state view.
		 *
		 * `model` is what the Bot will actually run on: the pick, else the one last
		 * applied. `effort` rides along so a run can record what to put back.
		 */
		function botsOf(state) {
			const bots = (state && state.bots) || []
			const list = (Array.isArray(bots) ? bots : Object.values(bots)).map((b) => {
				const ref = b.model ?? b.appliedModel ?? ""
				return {
					id: b.id,
					name: b.name || b.id,
					model: ref,
					effort: b.effort,
					local: isLocalRoute(ref),
				}
			})
			const mainIds = (state && state.mainBotIds) || []
			return { list, mainIds }
		}

		/**
		 * Whether a failure is an accident (network, 5xx, unreadable answer) rather
		 * than the host refusing this one Bot. Only accidents abort a run; a refusal
		 * is a row to report and move past.
		 */
		function looksUnexpected(error) {
			const message = String((error && error.message) || error || "")
			if (/^HTTP (?:5\d\d|0|408|429)$/.test(message)) return true
			if (/failed to fetch|networkerror|network request failed|load failed|timeout|aborted/i.test(message)) return true
			return !!error && error.name === "TypeError"
		}

		function readUndo() {
			try {
				if (typeof window === "undefined" || !window.localStorage) return []
				const raw = window.localStorage.getItem(UNDO_KEY)
				const list = raw ? JSON.parse(raw) : []
				return Array.isArray(list) ? list.filter((item) => item && Array.isArray(item.items)) : []
			} catch {
				return []
			}
		}

		function writeUndo(list) {
			try {
				if (typeof window === "undefined" || !window.localStorage) return false
				window.localStorage.setItem(UNDO_KEY, JSON.stringify(list.slice(0, UNDO_MAX)))
				return true
			} catch {
				return false
			}
		}

		function pushUndo(record) {
			const list = readUndo()
			list.unshift(record)
			writeUndo(list)
			return Math.min(list.length, UNDO_MAX)
		}

		function popUndo() {
			const list = readUndo()
			if (list.length === 0) return null
			writeUndo(list.slice(1))
			return list[0]
		}

		/**
		 * Put back what the newest record wrote. Each row is checked first: a Bot
		 * whose model no longer equals what that run set was changed by someone
		 * else since, and is named instead of overwritten.
		 */
		async function undoLast(t) {
			const record = popUndo()
			if (!record) return { kind: "hint", text: t("noUndo") }
			const state = await call("state", {})
			const byId = new Map(botsOf(state).list.map((bot) => [bot.id, bot]))
			const skipped = []
			let restored = 0
			for (const item of record.items.slice().reverse()) {
				const bot = byId.get(item.id)
				if (!bot || (bot.model || "") !== item.toModel) {
					skipped.push(item.name || item.id)
					continue
				}
				const undo = { id: item.id, model: item.fromModel }
				if (item.toEffort !== undefined) undo.effort = item.fromEffort
				try {
					await call("update-bot", undo)
					restored += 1
				} catch (error) {
					skipped.push((item.name || item.id) + "（" + error.message + "）")
				}
			}
			return skipped.length > 0
				? { kind: "error", text: fmt(t, "undoSkipped", { n: restored, k: skipped.length, list: skipped.join("、") }) }
				: { kind: "ok", text: fmt(t, "restored", { n: restored }) }
		}

		// Thinking levels per model ref, for the life of the page: the host answers
		// `efforts(ref)` and the list does not change under a running session.
		const levelCache = new Map()

		function fmt(t, key, vars) {
			let text = t(key)
			if (vars) for (const k of Object.keys(vars)) text = text.split("{" + k + "}").join(String(vars[k]))
			return text
		}

		const styles = {
			wrap: { display: "flex", flexDirection: "column", gap: "10px", padding: "4px 0" },
			row: { display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" },
			select: {
				minWidth: "260px", padding: "6px 8px", borderRadius: "8px",
				border: "1px solid var(--dsw-alias-border-l2)", background: "var(--dsw-alias-bg-layer-2)",
				color: "inherit", fontSize: "13px",
			},
			button: {
				padding: "6px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "13px",
				border: "1px solid var(--dsw-alias-border-l2)", background: "var(--dsw-alias-bg-layer-2)",
				color: "inherit",
			},
			buttonPrimary: {
				padding: "6px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "13px",
				border: "1px solid transparent", background: "var(--dsw-alias-label-primary, #4D6BFE)",
				color: "#fff",
			},
			tabRow: { display: "flex", gap: "6px", marginBottom: "2px" },
			tab: { padding: "4px 12px", borderRadius: "8px", cursor: "pointer", fontSize: "12px",
				border: "1px solid var(--dsw-alias-border-l2)", background: "transparent", color: "inherit", opacity: 0.65 },
			tabActive: { padding: "4px 12px", borderRadius: "8px", cursor: "pointer", fontSize: "12px",
				border: "1px solid transparent", background: "var(--dsw-alias-label-primary, #4D6BFE)", color: "#fff", opacity: 1 },
			table: { display: "flex", flexDirection: "column", gap: "4px", maxHeight: "320px", overflowY: "auto" },
			tr: { display: "grid", gridTemplateColumns: "1fr 150px 150px", gap: "8px", alignItems: "center", fontSize: "12.5px" },
			th: { fontSize: "11.5px", opacity: 0.6, paddingBottom: "2px" },
			previewRow: { display: "flex", gap: "8px", alignItems: "baseline", fontSize: "12.5px", lineHeight: "18px" },
			name: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
			miniSelect: { width: "100%", padding: "4px 6px", borderRadius: "6px", fontSize: "12px",
				border: "1px solid var(--dsw-alias-border-l2)", background: "var(--dsw-alias-bg-layer-2)", color: "inherit" },
			tag: { fontSize: "11px", opacity: 0.55 },
			hint: { fontSize: "12px", opacity: 0.7 },
			error: { fontSize: "12px", color: "var(--dsw-alias-label-danger, #E02135)" },
			ok: { fontSize: "12px", color: "var(--dsw-alias-label-success, #10B981)" },
		}

		/**
		 * What a batch would do, worked out before anything is written: rows already
		 * on the model, rows that will change, rows this panel must not touch (a
		 * local CLI engine, a provider without a key). A skip is a named result — it
		 * never fails a run and never rolls the batch back.
		 */
		function planOf(snapshot, target, scope) {
			const plan = { same: [], todo: [], skip: [] }
			if (!snapshot || !target) return plan
			const entry = snapshot.catalog.find((item) => item.ref === target)
			const picked = scope === "exceptMain"
				? snapshot.list.filter((bot) => !snapshot.mainIds.includes(bot.id))
				: snapshot.list
			for (const bot of picked) {
				if (bot.model === target) {
					plan.same.push(bot)
					continue
				}
				if (isLocalRoute(target)) {
					plan.skip.push({ bot, why: "local" })
					continue
				}
				if (engineKey(target) !== engineKey(bot.model)) {
					plan.skip.push({ bot, why: "engine" })
					continue
				}
				if (entry && entry.needsKey) {
					plan.skip.push({ bot, why: "needsKey" })
					continue
				}
				plan.todo.push(bot)
			}
			return plan
		}

		function skipText(t, plan) {
			if (plan.skip.length === 0) return null
			const list = plan.skip.map((item) => item.bot.name + "（" + t("skip." + item.why) + "）").join("、")
			return fmt(t, "batch.skippedLine", { n: plan.skip.length, list })
		}

		/**
		 * Per-Bot editor: one row per Bot, each with its own picker.
		 *
		 * A row shows the model the Bot runs on now; only a row whose pick differs is
		 * written, so an accidental Apply never rewrites 30 Bots with the values they
		 * already had. A thinking level is offered only for the picked model, and only
		 * after the user picks one is it sent.
		 */
		function PerBotPanel(props) {
			const t = props.t
			const catalog = props.catalog
			const onChanged = props.onChanged
			const [rows, setRows] = react.useState([])
			const [draft, setDraft] = react.useState({})
			const [levels, setLevels] = react.useState({})
			const [busy, setBusy] = react.useState(false)
			const [status, setStatus] = react.useState(null)
			const [undoCount, setUndoCount] = react.useState(readUndo().length)

			const load = react.useCallback(() => {
				call("state", {})
					.then((state) => {
						const { list, mainIds } = botsOf(state)
						const withMain = list.map((b) => ({ ...b, isMain: mainIds.includes(b.id) }))
						withMain.sort((a, b) => (a.name || "").localeCompare(b.name || ""))
						setRows(withMain)
						setDraft({})
						if (withMain.length === 0) setStatus({ kind: "hint", text: t("nothing") })
					})
					.catch((error) => setStatus({ kind: "error", text: error.message }))
			}, [])

			react.useEffect(() => { load() }, [load])

			const ensureLevels = (ref) => {
				if (!ref || isLocalRoute(ref)) return
				if (levelCache.has(ref)) {
					setLevels((prev) => (prev[ref] === undefined ? { ...prev, [ref]: levelCache.get(ref) } : prev))
					return
				}
				setLevels((prev) => ({ ...prev, [ref]: "loading" }))
				call("efforts", { ref })
					.then((value) => {
						const list = (value && Array.isArray(value.efforts) ? value.efforts : []).map((item) => ({
							id: item.id,
							name: item.name || item.id,
						}))
						levelCache.set(ref, list)
						setLevels((prev) => ({ ...prev, [ref]: list }))
					})
					.catch(() => {
						levelCache.set(ref, [])
						setLevels((prev) => ({ ...prev, [ref]: [] }))
					})
			}

			// What to send for one row, or null when the row is untouched.
			const patchOf = (row) => {
				const want = draft[row.id]
				if (!want) return null
				const patch = {}
				if (want.model && want.model !== row.model) patch.model = want.model
				if (want.effort !== undefined && want.effort !== (row.effort ?? "")) {
					patch.effort = want.effort === "" ? null : want.effort
				}
				return Object.keys(patch).length === 0 ? null : patch
			}

			const pending = rows.filter((row) => patchOf(row) !== null)

			const apply = async () => {
				if (busy || pending.length === 0) return
				setBusy(true)
				setStatus(null)
				const done = []
				const failed = []
				let accident = null
				try {
					for (let i = 0; i < pending.length; i += 1) {
						const row = pending[i]
						const patch = patchOf(row)
						if (patch === null) continue
						// Re-checked here: the engine line cannot be crossed from this
						// panel, so a stale draft never half-applies a Bot.
						if (patch.model && engineKey(patch.model) !== engineKey(row.model)) {
							failed.push(row.name + "（" + t("skip.engine") + "）")
							continue
						}
						try {
							await call("update-bot", { id: row.id, ...patch })
							done.push({
								row,
								patch,
								fromModel: row.model,
								fromEffort: row.effort ?? null,
							})
						} catch (error) {
							if (looksUnexpected(error)) {
								accident = { error, index: i }
								break
							}
							failed.push(row.name + "（" + error.message + "）")
						}
					}

					if (done.length > 0 && !accident) {
						setUndoCount(pushUndo({
							at: Date.now(),
							items: done.map((item) => ({
								id: item.row.id,
								name: item.row.name,
								fromModel: item.fromModel,
								fromEffort: item.fromEffort,
								toModel: item.patch.model ?? item.fromModel,
								toEffort: item.patch.effort === undefined ? undefined : item.patch.effort,
							})),
						}))
						if (onChanged) onChanged()
					}

					if (accident) {
						const stuck = []
						for (const item of done.slice().reverse()) {
							const undo = { id: item.row.id, model: item.fromModel }
							if (item.patch.effort !== undefined) undo.effort = item.fromEffort
							try {
								await call("update-bot", undo)
							} catch {
								stuck.push(item.row.name)
							}
						}
						setStatus({
							kind: "error",
							text: stuck.length
								? fmt(t, "rollbackFailed", { list: stuck.join(", ") })
								: fmt(t, "rolledBack", { i: accident.index + 1, k: done.length, error: accident.error.message }),
						})
					} else if (failed.length > 0) {
						setStatus({
							kind: "error",
							text: fmt(t, "perBot.partial", { a: done.length, b: failed.length, list: failed.join("、") }),
						})
					} else {
						setStatus({ kind: "ok", text: fmt(t, "perBot.applied", { n: done.length }) })
					}
					load()
				} catch (error) {
					setStatus({ kind: "error", text: error.message })
				} finally {
					setBusy(false)
				}
			}

			const undo = async () => {
				if (busy) return
				setBusy(true)
				setStatus(null)
				try {
					setStatus(await undoLast(t))
				} catch (error) {
					setStatus({ kind: "error", text: error.message })
				} finally {
					setBusy(false)
					setUndoCount(readUndo().length)
					if (onChanged) onChanged()
					load()
				}
			}

			const allowed = (row) => {
				const refs = catalog.filter((item) => !item.local).map((item) => item.ref)
				if (row.model && !refs.includes(row.model)) refs.unshift(row.model)
				const want = draft[row.id] && draft[row.id].model
				if (want && !refs.includes(want)) refs.push(want)
				return refs
			}

			const head = h(
				"div",
				{ key: "head", style: styles.tr },
				h("div", { style: styles.th }, t("perBot.colName")),
				h("div", { style: styles.th }, t("perBot.colNow")),
				h("div", { style: styles.th }, t("perBot.colNew")),
			)

			const body = rows.map((row) => {
				const want = draft[row.id] || {}
				const picked = want.model || row.model
				const list = allowed(row)
				const stops = levels[picked]
				const stopsReady = Array.isArray(stops)
				return h(
					"div",
					{ key: row.id, style: styles.tr },
					h(
						"div",
						{ style: { display: "flex", gap: "6px", alignItems: "baseline", minWidth: 0 } },
						h("span", { style: styles.name, title: row.name }, row.name),
						row.isMain ? h("span", { style: styles.tag }, "main") : null,
					),
					h("div", { style: styles.name, title: row.model || "" }, row.model || "—"),
					h(
						"div",
						{ style: { display: "flex", flexDirection: "column", gap: "4px" } },
						h(
							"select",
							{
								style: styles.miniSelect,
								value: picked,
								disabled: busy,
								onFocus: () => ensureLevels(picked),
								onChange: (event) => {
									const value = event.target.value
									setDraft((prev) => {
										const next = { ...prev }
										next[row.id] = { ...(next[row.id] || {}), model: value }
										delete next[row.id].effort
										return next
									})
									ensureLevels(value)
								},
							},
							list.map((ref) => h("option", { key: ref, value: ref }, ref)),
						),
						stopsReady && stops.length > 0
							? h(
								"select",
								{
									style: styles.miniSelect,
									value: want.effort === undefined ? "" : want.effort,
									disabled: busy,
									onChange: (event) => {
										const value = event.target.value
										setDraft((prev) => {
											const next = { ...prev }
											next[row.id] = { ...(next[row.id] || {}), effort: value }
											return next
										})
									},
								},
								[
									h("option", { key: "", value: "" }, t("perBot.effortKeep")),
									...stops.map((stop) => h("option", { key: stop.id, value: stop.id }, stop.name)),
								],
							)
							: levels[picked] === "loading"
								? h("span", { style: styles.tag }, t("perBot.effortLoad"))
								: null,
					),
				)
			})

			const children = [
				h("div", { key: "hint", style: styles.hint }, t("perBot.hint")),
				h("div", { key: "table", style: styles.table }, [head, ...body]),
				h(
					"div",
					{ key: "actions", style: styles.row },
					h(
						"button",
						{
							style: styles.buttonPrimary,
							disabled: busy || pending.length === 0,
							onClick: apply,
						},
						busy ? t("perBot.applying") : t("perBot.apply"),
					),
					h(
						"button",
						{ style: styles.button, disabled: busy, onClick: load },
						t("perBot.refresh"),
					),
					h(
						"button",
						{ style: styles.button, disabled: busy || undoCount === 0, onClick: undo },
						t("action.restore"),
					),
					h("span", { style: styles.hint }, fmt(t, "perBot.count", { n: pending.length })),
				),
			]

			if (status) {
				children.push(
					h(
						"div",
						{ key: "status", style: status.kind === "error" ? styles.error : status.kind === "ok" ? styles.ok : styles.hint },
						status.text,
					),
				)
			}

			return h("div", { style: styles.wrap }, children)
		}

		function ModelSwitchCard(props) {
			const t = props.t
			const [catalog, setCatalog] = react.useState([])
			const [snapshot, setSnapshot] = react.useState(null)
			const [target, setTarget] = react.useState("")
			const [scope, setScope] = react.useState("all")
			const [busy, setBusy] = react.useState(false)
			const [progress, setProgress] = react.useState(null)
			const [status, setStatus] = react.useState(null)
			const [tab, setTab] = react.useState("batch")
			const [undoCount, setUndoCount] = react.useState(0)

			const snap = react.useCallback((state) => {
				const entries = catalogOf(state)
				const { list, mainIds } = botsOf(state)
				setCatalog(entries)
				setSnapshot({ list, mainIds, catalog: entries })
			}, [])

			react.useEffect(() => {
				setUndoCount(readUndo().length)
				let alive = true
				call("state", {})
					.then((state) => {
						if (alive) snap(state)
					})
					.catch(() => {
						if (alive) {
							setCatalog([])
							setSnapshot(null)
						}
					})
				return () => {
					alive = false
				}
			}, [snap])

			const plan = planOf(snapshot, target, scope)

			const refresh = () => {
				call("state", {}).then(snap).catch(() => {})
			}

			const run = async () => {
				if (!target || busy) return
				setBusy(true)
				setStatus(null)
				setProgress(null)
				const changed = []
				const failed = []
				let accident = null
				try {
					// Re-read right before writing: the preview may be minutes old, and a
					// Bot moved meanwhile must not be counted as "already there".
					const state = await call("state", {})
					snap(state)
					const fresh = planOf(
						{ ...botsOf(state), catalog: catalogOf(state) },
						target,
						scope,
					)
					if (fresh.todo.length === 0) {
						setStatus({
							kind: fresh.same.length > 0 ? "ok" : "hint",
							text: fresh.same.length > 0
								? t("none")
								: fmt(t, "batch.allSkipped", { s: fresh.skip.length }),
						})
						return
					}

					for (let i = 0; i < fresh.todo.length; i += 1) {
						const bot = fresh.todo[i]
						setProgress({ i: i + 1, n: fresh.todo.length, name: bot.name })
						try {
							await call("update-bot", { id: bot.id, model: target })
							changed.push(bot)
						} catch (error) {
							if (looksUnexpected(error)) {
								accident = { error, index: i }
								break
							}
							failed.push(bot.name + "（" + error.message + "）")
						}
					}

					if (changed.length > 0 && !accident) {
						setUndoCount(pushUndo({
							at: Date.now(),
							items: changed.map((bot) => ({
								id: bot.id,
								name: bot.name,
								fromModel: bot.model,
								fromEffort: bot.effort ?? null,
								toModel: target,
							})),
						}))
					}

					if (accident) {
						// Only an accident rolls back: a named refusal is a result, not a
						// reason to undo the Bots that went through.
						const stuck = []
						for (const done of changed.slice().reverse()) {
							try {
								await call("update-bot", { id: done.id, model: done.model })
							} catch {
								stuck.push(done.name)
							}
						}
						setStatus({
							kind: "error",
							text: stuck.length
								? fmt(t, "rollbackFailed", { list: stuck.join(", ") })
								: fmt(t, "rolledBack", { i: accident.index + 1, k: changed.length, error: accident.error.message }),
						})
					} else if (failed.length > 0) {
						setStatus({
							kind: "error",
							text: fmt(t, "batch.partial", {
								a: changed.length,
								b: failed.length,
								list: failed.join("、"),
								s: fresh.skip.length,
							}),
						})
					} else {
						setStatus({ kind: "ok", text: fmt(t, "done", { n: changed.length }) })
					}
				} catch (error) {
					setStatus({ kind: "error", text: error.message })
				} finally {
					setProgress(null)
					setBusy(false)
					refresh()
				}
			}

			const undoRun = async () => {
				if (busy) return
				setBusy(true)
				setStatus(null)
				try {
					setStatus(await undoLast(t))
				} catch (error) {
					setStatus({ kind: "error", text: error.message })
				} finally {
					setUndoCount(readUndo().length)
					setBusy(false)
					refresh()
				}
			}

			const models = catalog.filter((item) => !item.local)

			const children = [
				h("div", { key: "hint", style: styles.hint }, t("field.modelHint")),
				h(
					"div",
					{ key: "row", style: styles.row },
					h(
						"select",
						{
							style: styles.select,
							value: target,
							disabled: busy,
							onChange: (event) => setTarget(event.target.value),
						},
						[
							h("option", { key: "", value: "" }, t("pick")),
							...models.map((item) => h("option", { key: item.ref, value: item.ref }, item.ref)),
						],
					),
					h(
						"select",
						{
							style: styles.select,
							value: scope,
							disabled: busy,
							onChange: (event) => setScope(event.target.value),
						},
						[
							h("option", { key: "all", value: "all" }, t("scope.all")),
							h("option", { key: "exceptMain", value: "exceptMain" }, t("scope.exceptMain")),
						],
					),
				),
			]

			if (snapshot && target) {
				const rows = plan.todo.map((bot) => h(
					"div",
					{ key: bot.id, style: styles.previewRow },
					h("span", { style: styles.name, title: bot.name }, bot.name),
					bot.isMain === true || snapshot.mainIds.includes(bot.id)
						? h("span", { style: styles.tag }, t("preview.main"))
						: null,
					h("span", { style: styles.tag }, bot.model || "—"),
					h("span", { style: styles.tag }, "→ " + target),
				))
				children.push(h(
					"div",
					{ key: "preview", style: styles.hint },
					[
						h("div", { key: "title" }, fmt(t, "preview.title", { n: plan.todo.length, s: plan.skip.length })),
						h("div", { key: "same", style: styles.tag }, fmt(t, "preview.same", { n: plan.same.length })),
						rows.length > 0 ? h("div", { key: "rows", style: styles.table }, rows) : null,
						skipText(t, plan) ? h("div", { key: "skip", style: styles.tag }, skipText(t, plan)) : null,
					],
				))
			} else if (target) {
				children.push(h("div", { key: "preview-empty", style: styles.hint }, t("preview.empty")))
			}

			children.push(h(
				"div",
				{ key: "actions", style: styles.row },
				h(
					"button",
					{
						style: styles.buttonPrimary,
						disabled: busy || !target || plan.todo.length === 0,
						onClick: run,
					},
					busy ? t("action.switching") : t("action.switch"),
				),
				h(
					"button",
					{
						style: styles.button,
						disabled: busy || undoCount === 0,
						onClick: undoRun,
					},
					busy ? t("action.restoring") : t("action.restore"),
				),
				h("span", { style: styles.tag }, undoCount > 0 ? String(undoCount) : t("undo.none")),
			))

			if (progress) {
				children.push(
					h(
						"div",
						{ key: "progress", style: styles.hint },
						fmt(t, "switching", { i: progress.i, n: progress.n, name: progress.name }),
					),
				)
			}

			if (!models.length) {
				children.push(h(
					"div",
					{ key: "nomodels", style: styles.hint },
					catalog.length > 0 ? t("noServed") : t("noModels"),
				))
			}

			if (status) {
				children.push(
					h(
						"div",
						{ key: "status", style: status.kind === "error" ? styles.error : status.kind === "ok" ? styles.ok : styles.hint },
						status.text,
					),
				)
			}

			const tabs = h(
				"div",
				{ key: "tabs", style: styles.tabRow },
				h(
					"button",
					{
						style: tab === "batch" ? styles.tabActive : styles.tab,
						onClick: () => setTab("batch"),
					},
					t("tab.batch"),
				),
				h(
					"button",
					{
						style: tab === "perBot" ? styles.tabActive : styles.tab,
						onClick: () => setTab("perBot"),
					},
					t("tab.perBot"),
				),
			)

			if (tab === "perBot") {
				return h("div", { style: styles.wrap }, [
					tabs,
					h(PerBotPanel, {
						key: "perbot",
						t,
						catalog,
						onChanged: () => setUndoCount(readUndo().length),
					}),
				])
			}

			return h("div", { style: styles.wrap }, [tabs, ...children])
		}

		exports.name = "model-switch"
		exports.inject = ["slots", "locale"]
		exports.apply = function apply(ctx) {
			const t = (key) => {
				const zhMode = String((ctx.locale && ctx.locale.locale) || "zh").toLowerCase().startsWith("zh")
				const dict = zhMode ? zh : en
				return dict[key] || en[key] || key
			}

			ctx.effect(() => {
				try {
					return ctx.locale.register(NS, { zh, en })
				} catch {
					return () => {}
				}
			}, "model-switch: dictionaries")

			// `plugins.bundle.config` is the settings area a bundle may append its own
			// card to. Unlike `sidebar.panellist` (a whole page) the row here is a
			// panel inside the plugin settings page, which is where a switch like
			// this belongs. The register signature mirrors archive-manager, the
			// only working bundle that uses this slot.
			ctx.effect(() => {
				const slots = ctx.slots
				if (!slots || typeof slots.inject !== "function") return () => {}
				return slots.inject("plugins.bundle.config", () =>
					slots.register(
						{
							name: "plugins.bundle.config",
							key: "model-switch",
							locale: ctx.locale,
						},
						(props) => react.createElement(ModelSwitchCard, { ...props, t }),
					),
				)
			}, "model-switch: settings panel")
		}

		return module.exports
	},
})
