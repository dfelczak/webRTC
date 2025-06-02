import { CTA } from './CTA'
import { FullScreenBackdrop } from './FullScreenBackdrop'

export function ClosedConnectionState() {
  return (
    <FullScreenBackdrop>
      <CTA title="Connection has been closed" subtitle="See you again!" button={undefined} />
    </FullScreenBackdrop>
  )
}
