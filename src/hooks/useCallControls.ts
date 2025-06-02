import { useState } from 'react'

export function useCallControls({
  pcRef,
  streamRef,
}: {
  pcRef: React.RefObject<RTCPeerConnection | null>
  streamRef: React.RefObject<MediaStream | null>
}) {
  const [muted, setMuted] = useState(false)

  const toggleMute = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !muted
      })
      setMuted((m) => !m)
    }
  }

  const disconnect = () => {
    if (pcRef.current) {
      pcRef.current.close()
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
    }
  }

  return { disconnect, toggleMute, muted }
}
