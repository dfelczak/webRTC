import { useEffect, type RefObject } from 'react'

export function useOnConnectionStateChange(
  pcRef: RefObject<RTCPeerConnection | null>,
  setConnectionState: (state: RTCPeerConnectionState) => void,
) {
  useEffect(() => {
    const pc = pcRef.current
    if (!pc) return

    const handleState = () => {
      setConnectionState(pc.connectionState)
    }

    pc.addEventListener('connectionstatechange', handleState)
    return () => pc.removeEventListener('connectionstatechange', handleState)
  }, [pcRef, setConnectionState])
}
