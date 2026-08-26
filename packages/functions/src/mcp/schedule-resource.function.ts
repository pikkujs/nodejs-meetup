import { z } from 'zod'
import { pikkuMCPResourceFunc } from '#pikku/mcp'

export const ScheduleResourceInput = z.object({})

export const scheduleResource = pikkuMCPResourceFunc({
  input: ScheduleResourceInput,
  func: async (_services, _input, { rpc, mcp }) => {
    const { slots } = await rpc.invoke('listSchedule', {})

    return [
      {
        uri: mcp.uri!,
        text: slots
          .map(
            (slot) =>
              `${slot.isCurrent ? '>' : ' '} ${slot.timeLabel}  ${slot.title}` +
              (slot.speaker ? ` — ${slot.speaker}` : ''),
          )
          .join('\n'),
      },
    ]
  },
})
