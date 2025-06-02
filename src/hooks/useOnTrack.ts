import { useEffect, type RefObject } from 'react'

export function useOnTrack(
  pcRef: RefObject<RTCPeerConnection | null>,
  remoteVideoRef: RefObject<HTMLVideoElement | null>,
) {
  useEffect(() => {
    const pc = pcRef.current
    if (!pc) return

    const handleTrack = (event: RTCTrackEvent) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0]
      }
    }

    pc.addEventListener('track', handleTrack)
    return () => pc.removeEventListener('track', handleTrack)
  }, [pcRef, remoteVideoRef])
}
