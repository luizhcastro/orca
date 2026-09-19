import { BRIDGE_FAULT_GRANT, BRIDGE_NAVIGATE_BACK_NOTIFY } from './bridge-envelope'

/**
 * Which grant each grant-gated `notify` name rides, and whether the host will act on one.
 *
 * `foreground` and `terminalViewport` are the protocol's own and ride no grant, so they are not
 * listed. A name that is listed is served only when `init.grants.native` carried the grant beside
 * it — inert while every page is offered `fault`, and load-bearing the moment a grant is per-route.
 *
 * Name and grant are separate columns because they are not always the same word: `navigate-back` is
 * the second verb of `navigate`, so an app that implements navigation implements both and nothing
 * new enters `MOBILE_WEB_SHELL_GRANTS`. Keyed on the notify name alone, it would be refused by
 * every shell that exists.
 */
const BRIDGE_NOTIFY_GRANTS: Readonly<Record<string, string | undefined>> = {
  [BRIDGE_FAULT_GRANT]: BRIDGE_FAULT_GRANT,
  [BRIDGE_NAVIGATE_BACK_NOTIFY]: 'navigate'
}

/** The `notify` names a grant gates, whichever grant each of them rides. */
export const BRIDGE_GRANT_GATED_NOTIFY_NAMES: readonly string[] = Object.keys(BRIDGE_NOTIFY_GRANTS)

export type BridgeNotifyRefusal = 'before-ready' | 'ungranted'

/**
 * Two refusals, not one.
 *
 * A page that has not asked for a session has been told nothing, so it holds no grant and cannot
 * have been given one. A page that has been told a list can still post a name outside it, and a
 * host issuing a grant is worth nothing if it serves the name anyway.
 */
export function bridgeNotifyRefusal(args: {
  name: string
  /** Whether this host has answered a `ready` yet, which is the only thing that issues grants. */
  initSent: boolean
  granted: readonly string[]
}): BridgeNotifyRefusal | null {
  if (!args.initSent) {
    return 'before-ready'
  }
  const grant = BRIDGE_NOTIFY_GRANTS[args.name]
  return grant !== undefined && !args.granted.includes(grant) ? 'ungranted' : null
}
