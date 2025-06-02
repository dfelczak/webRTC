import { Mic, MicOff, PhoneOff } from 'lucide-react'

type CallControlsProps = {
  muted: boolean
  onToggleMute: () => void
  onDisconnect: () => void
  disableMute?: boolean
  disableDisconnect?: boolean
}

export function CallControls({
  muted,
  onToggleMute,
  onDisconnect,
  disableMute = false,
  disableDisconnect = false,
}: CallControlsProps) {
  return (
    <div
      className="
      fixed left-0 bottom-0 z-30 p-8
      flex flex-row gap-6
      pointer-events-none
    "
      style={{}}
    >
      <div className="flex flex-row gap-6 pointer-events-auto">
        <button
          onClick={onToggleMute}
          disabled={disableMute}
          className={`
          w-14 h-14 flex items-center justify-center rounded-full
          shadow-lg transition-all
          ${muted ? 'bg-gray-600 hover:bg-gray-700' : 'bg-blue-600 hover:bg-blue-700'}
          active:scale-90
          outline-none focus:ring-2 focus:ring-blue-400
        `}
          title={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? (
            <MicOff className="w-7 h-7 text-white" />
          ) : (
            <Mic className="w-7 h-7 text-white" />
          )}
        </button>

        <button
          onClick={onDisconnect}
          disabled={disableDisconnect}
          className={`
          w-14 h-14 flex items-center justify-center rounded-full
          shadow-lg bg-red-600 hover:bg-red-700 active:scale-90
          outline-none focus:ring-2 focus:ring-red-400
        `}
          title="Disconnect"
        >
          <PhoneOff className="w-7 h-7 text-white" />
        </button>
      </div>
    </div>
  )
}
