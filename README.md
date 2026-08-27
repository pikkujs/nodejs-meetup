# The Node.js meetup app

One evening, in one room. Attendees ask questions from their phones and vote on
each other's; the host runs the board from a laptop; the projector shows what to
ask next. Behind that, one of every Pikku wire, so the whole framework can be
demonstrated on something that actually gets used.

Written up in [knowledge/](knowledge/index.md) — every non-obvious choice has a
note explaining what it rules out.

## Running it

```sh
bun install
bun run dev          # API on :3000, frontend on :7104
```

`.env` is generated on first run and is gitignored. Set `ORGANISER_PASSCODE` in
it before demoing anything the organiser does; the passcode is never in the code.

If you `pikku db reset`, restart `bun run dev` too — the reset drops the
better-auth user rows out from under the running server, and sign-in starts
returning 500 until it restarts.

## The wires, and how to show each one

| Wire | Where | How to see it |
| --- | --- | --- |
| **HTTP + RPC** | `packages/functions/src/functions/meetup/` | The app itself. Open /app on a phone. |
| **Channel** (websocket) | `eventhub-topics.d.ts`, `functions/meetup/live.ts` | Broadcasts every room event. Wired and inspectable; the UI polls instead — see `lib/live.ts`. |
| **Agent** | `agents/meetup-host.agent.ts` | Ask it "what did the room ask tonight". Needs `LITELLM_PROXY_URL` and `LITELLM_API_KEY`. |
| **Workflow** | `workflows/run-the-meetup.workflow.ts` | `startMeetupRun` below — the whole evening in a minute. |
| **Scheduler** | `schedules/start-the-meetup.schedule.ts` | Starts the same workflow at 18:30 on a Thursday. |
| **Queue** | `queues/outbound.queue.ts` | Two workers pick up as each talk closes. Watch the dev log. |
| **Addon** | `addons/admin.addon.ts` | Scoped user admin — list, ban, view-as — without writing a screen for it. |
| **Email** | `emails/templates/talk-summary.*` | Rendered and logged by `LocalEmailService` as each talk closes. |

### Run the whole evening in a minute

```sh
curl -s -X POST http://localhost:3000/rpc/startMeetupRun \
  -H 'Content-Type: application/json' \
  -d '{"rpcName":"startMeetupRun","data":{"passcode":"YOUR_PASSCODE","talkDuration":"5s","interludeDuration":"3s"}}'
```

Every slot goes on stage in turn, each talk closes into the queue, and the
summary email is rendered to the log. The room follows along live — leave
/app/stage on the projector and watch it advance.

The organiser's Next button overrides the workflow at any point. That is
deliberate: see
[the evening is a workflow](knowledge/decisions/the-evening-is-a-workflow.md).

Note the RPC envelope — `{"rpcName": ..., "data": ...}`, not the bare input.

### The GitHub issues worker opens nothing

`closeSlot` still queues `github-issues` as each talk ends, the worker still
runs, and it logs the issue it would have opened for every unanswered question.
It files none.

`@pikku/addon-github` used to do the filing, and it is no longer wired: the
addon registers 811 functions and 1,416 schemas at module top level, which costs
more than Cloudflare allows a Worker at startup, so the worker failed to boot at
all — [pikkujs/pikku#1497](https://github.com/pikkujs/pikku/issues/1497).
`functions/meetup/create-github-issue.function.ts` is the stand-in, and the
place a direct `fetch` goes when the questions should really outlive the night.

`GITHUB_TOKEN` and `GITHUB_ISSUES_REPO` are still declared and still read, so
nothing about the configuration has to be rediscovered when that happens.

## Checks

```sh
npx pikku all --tsc-summary        # codegen + typecheck
npx pikku knowledge validate       # the knowledge base is consistent
npx pikku scenario run local       # 8 API scenarios
npx pikku scenario run local --run browser   # 14 browser scenarios
```
