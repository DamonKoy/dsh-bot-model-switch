/**
 * dsh-model-switch — host half.
 *
 * Deliberately does nothing beyond existing as a loadable row. Every model
 * change is issued by the browser half through DS Bot's own `api/bot`
 * channel (`update-bot`), so the host's in-memory state stays authoritative
 * and no external writer races the Bot engine's `stamp()` check.
 *
 * Writing `state.json` from here would recreate exactly the failure mode that
 * lost a group message on 2026-11-12: the engine keeps its own copy and the
 * two writers overwrite each other.
 */
export const name = 'model-switch'

export const inject = []

export function apply() {
  // No host-side behaviour is needed. Kept intentionally empty.
}
