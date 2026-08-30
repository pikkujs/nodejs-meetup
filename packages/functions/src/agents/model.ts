/**
 * Every agent runs on the `default` alias, resolved from the `models` table in
 * pikku.config.json — that table is the one place the model changes.
 *
 * The reasoning options cannot live there, since it holds only a model string.
 * `forceReasoning` is load-bearing: the runner resolves `languageModel` to the
 * OpenAI Responses API, and @ai-sdk/openai only emits the `reasoning` block for
 * models matching a hardcoded o1/o3/o4-mini/gpt-5 prefix test. `glm-*` fails it,
 * so without this the effort is dropped with a warning and the cap does nothing.
 * `systemMessageMode` is pinned because `forceReasoning` would otherwise flip it
 * to `developer`.
 */
export const agentProviderOptions = {
  openai: {
    forceReasoning: true,
    reasoningEffort: 'low',
    systemMessageMode: 'system',
  },
}
