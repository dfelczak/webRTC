import { useCopyToClipboard } from './hooks/useCopyToClipboard'
import type { Mode } from './types'
import { Button } from './ui/Button'
import { CTA } from './ui/CTA'
import { Divider } from './ui/Divider'
import { FullScreenBackdrop } from './ui/FullScreenBackdrop'
import { Textarea } from './ui/Textarea'

type WizardProps = {
  offerLink: string | null
  setRemote: () => void
  setRemoteSDP: (value: string) => void
  remoteSDP: string
  mode: Mode
  localSDP: string
}

export function Wizard({
  offerLink,
  setRemote,
  remoteSDP,
  mode,
  localSDP,
  setRemoteSDP,
}: WizardProps) {
  const [, copyToClipboard] = useCopyToClipboard()

  return (
    <FullScreenBackdrop>
      {offerLink && (
        <>
          <CTA
            title={'Share this link to start your video call'}
            subtitle="Send the link below to your friend. Then paste answer SDP in the textbox below."
            button={<Button onClick={() => copyToClipboard(offerLink)}>Copy to clipboard</Button>}
          >
            <input
              value={offerLink}
              readOnly
              className="w-full bg-gray-800 p-2 rounded text-xs font-mono mb-2"
              onFocus={(e) => e.target.select()}
            />
          </CTA>

          <Divider text="Step 2" />
        </>
      )}

      {offerLink && (
        <CTA
          title={'Paste answer SDP from your peer in the textbox below'}
          button={
            <Button onClick={setRemote} disabled={!remoteSDP}>
              Establish connection
            </Button>
          }
        >
          <Textarea
            placeholder="Paste it here"
            value={remoteSDP}
            onChange={(e) => setRemoteSDP(e.target.value)}
            rows={6}
            className="w-full block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring"
          />
        </CTA>
      )}
      {mode === 'answering' && (
        <CTA
          title={'Copy and send answer SDP shown below to your friend'}
          button={<Button onClick={() => copyToClipboard(localSDP)}>Copy to clipboard</Button>}
        >
          <Textarea
            value={localSDP}
            readOnly
            rows={6}
            className="w-full bg-gray-800 p-2 rounded text-xs font-mono"
          />
        </CTA>
      )}
    </FullScreenBackdrop>
  )
}
