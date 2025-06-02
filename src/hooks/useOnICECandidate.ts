import { useEffect, type RefObject } from 'react'

export function useOnICECandidate(
  pcRef: RefObject<RTCPeerConnection | null>,
  setLocalSDP: (sdp: string) => void,
) {
  useEffect(() => {
    const pc = pcRef.current
    if (!pc) return

    const handleIce = (event: RTCPeerConnectionIceEvent) => {
      if (!event.candidate && pc.localDescription) {
        setLocalSDP(JSON.stringify(pc.localDescription, null, 2))
      }
    }

    pc.addEventListener('icecandidate', handleIce)
    return () => pc.removeEventListener('icecandidate', handleIce)
  }, [pcRef, setLocalSDP])
}
