import { useEffect, type RefObject } from 'react'
import { ICE_SERVER_URL } from '../consts'

export function useRTCPeerConnection({
  pcRef,
  streamRef,
  setIsStreamSet,
  localVideoRef,
}: {
  pcRef: RefObject<RTCPeerConnection | null>
  streamRef: RefObject<MediaStream | null>
  setIsStreamSet: (state: boolean) => void
  localVideoRef: RefObject<HTMLVideoElement | null>
}) {
  useEffect(() => {
    const autoStart = async () => {
      try {
        const peerConnection = new RTCPeerConnection({
          iceServers: [{ urls: ICE_SERVER_URL }],
        })
        pcRef.current = peerConnection

        const localStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        })

        streamRef.current = localStream
        setIsStreamSet(true)

        localStream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, localStream)
        })

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream
        }
      } catch {
        alert('There as a problem with you camera, check browser settings')
      }
    }

    autoStart()
  }, [])
}
