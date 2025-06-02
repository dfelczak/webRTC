import { useEffect, type RefObject } from 'react'

export function useOnLocalStreamReady(
  localVideoRef: RefObject<HTMLVideoElement | null>,
  streamRef: RefObject<MediaStream | null>,
) {
  useEffect(() => {
    if (localVideoRef.current && streamRef.current) {
      localVideoRef.current.srcObject = streamRef.current
    }
  }, [localVideoRef, streamRef])
}
