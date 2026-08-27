import type { FC } from 'react'
import { Badge, Box, Group, Stack, Text } from '@pikku/mantine/core'
import { asI18n, m } from '@/i18n/messages'
import { useReorderAnimation } from '@/lib/reorder'
import { RollingNumber } from './RollingNumber'

export type StageQuestion = {
  id: string
  body: string
  authorName: string
  votes: number
}

export interface StageBoardProps {
  questions: StageQuestion[]
  /** Questions past the top few — a count, because they will not fit on the wall. */
  remaining?: number
  /** Pizza, the break, the doors: nothing on stage to ask about. */
  interlude?: boolean
}

/**
 * The ranked list as the room sees it, five metres back.
 *
 * Sized in `vw`/`vh` rather than px: the only thing that matters is the fraction
 * of the projection a line occupies, and the same page is thrown at a 3m screen
 * and a 55" TV. Split out of StagePage so the Design tab can show the states the
 * projector passes through — the wall is the one surface nobody can re-render on
 * request during a talk.
 */
export const StageBoard: FC<StageBoardProps> = ({
  questions,
  remaining = 0,
  interlude = false,
}) => {
  const listRef = useReorderAnimation(questions.map((question) => question.id).join())

  return (
    <>
      <Stack gap="2.5vh" ref={listRef} style={{ flex: 1, justifyContent: 'center' }}>
        {interlude ? (
          <Text ta="center" c="dimmed" style={{ fontSize: '3vw' }}>
            {m.stage__interlude()}
          </Text>
        ) : questions.length === 0 ? (
          <Stack gap="1vh" align="center">
            <Text c="dimmed" style={{ fontSize: '3vw' }}>
              {m.stage__no_questions()}
            </Text>
            <Text c="dimmed" style={{ fontSize: '1.6vw' }}>
              {m.stage__prompt()}
            </Text>
          </Stack>
        ) : (
          questions.map((question, index) => (
            <Group
              key={question.id}
              data-reorder-key={question.id}
              wrap="nowrap"
              align="flex-start"
              gap="2vw"
            >
              {/* Rank, not vote count, at this size: from five metres the useful
                  fact is which one the host reads first. */}
              <Text
                ff="monospace"
                fw={700}
                c="var(--mantine-primary-color-filled)"
                style={{ fontSize: '3.6vw', lineHeight: 1, flex: 'none' }}
              >
                {asI18n(String(index + 1))}
              </Text>
              <Box style={{ minWidth: 0 }}>
                <Text fw={600} lh={1.25} style={{ fontSize: '2.6vw' }}>
                  {asI18n(question.body)}
                </Text>
                {/* The name is static; only the count moves. Splitting them lets
                    the number roll without the name flickering beside it. */}
                <Group gap="0.5vw" align="baseline" style={{ fontSize: '1.3vw' }}>
                  <Text c="dimmed" ff="monospace" style={{ fontSize: '1.3vw' }}>
                    {asI18n(`${question.authorName} ·`)}
                  </Text>
                  <RollingNumber
                    value={question.votes}
                    fontSize="1.3vw"
                    fontWeight={400}
                    color="var(--mantine-color-dimmed)"
                    label={m.questions__votes_label()}
                  />
                </Group>
              </Box>
            </Group>
          ))
        )}
      </Stack>

      {remaining > 0 ? (
        <Badge variant="light" size="xl" style={{ alignSelf: 'flex-start' }}>
          {m.stage__more({ count: remaining })}
        </Badge>
      ) : null}
    </>
  )
}
