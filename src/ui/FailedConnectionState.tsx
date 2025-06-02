import { CTA } from './CTA'
import { Button } from './Button'
import { useRefreshPage } from '../hooks/useRefreshPage'
import { FullScreenBackdrop } from './FullScreenBackdrop'

export function FailedConnectionState() {
  const refresh = useRefreshPage()
  return (
    <FullScreenBackdrop>
      <CTA
        title="Oh no, something went wrong!"
        subtitle="Refresh the page and try again"
        button={<Button onClick={refresh}>Refresh</Button>}
      />
    </FullScreenBackdrop>
  )
}
