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
| **Channel** (websocket) | `eventhub-topics.d.ts`, `functions/meetup/live.ts` | Two phones on /app/questions. Vote on one; the number moves on the other. |
| **Agent** | `agents/meetup-host.agent.ts` | Ask it "what did the room ask tonight". Needs `LITELLM_PROXY_URL` and `LITELLM_API_KEY`. |
| **Workflow** | `workflows/run-the-meetup.workflow.ts` | `startMeetupRun` below — the whole evening in a minute. |
| **Scheduler** | `schedules/start-the-meetup.schedule.ts` | Starts the same workflow at 18:30 on a Thursday. |
| **Queue** | `queues/outbound.queue.ts` | Two workers pick up as each talk closes. Watch the dev log. |
| **Addon** | `addons/github.addon.ts` | Unanswered questions become issues. Needs `GITHUB_TOKEN` + `GITHUB_ISSUES_REPO`. |
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

### Without a GitHub token

The `github-issues` worker retries three times and then fails the job with
`No GitHub connection — connect GitHub first`. That is the addon reporting an
unset credential, not a bug. Set `GITHUB_TOKEN` in `.env` to see it file real
issues.

## Checks

```sh
npx pikku all --tsc-summary        # codegen + typecheck
npx pikku knowledge validate       # the knowledge base is consistent
npx pikku scenario run local       # 8 API scenarios
npx pikku scenario run local --run browser   # 14 browser scenarios
```
