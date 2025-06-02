import { useEffect, useRef, useState } from 'react'

export const useWebRTCLocal = () => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [offerSDP, setOfferSDP] = useState<string>()
  const peerRef = useRef<RTCPeerConnection | null>(null)

  useEffect(() => {
    const init = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      setLocalStream(stream)

      const peerConnection = new RTCPeerConnection()
      stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream))
      peerRef.current = peerConnection

      const offer = await peerConnection.createOffer()
      await peerConnection.setLocalDescription(offer)
      setOfferSDP(offer.sdp)
    }

    init()
  }, [])

  const acceptAnswer = async (sdp: string) => {
    if (!peerRef.current) return
    const desc = new RTCSessionDescription({ type: 'answer', sdp })
    await peerRef.current.setRemoteDescription(desc)
  }

  return { localStream, offerSDP, acceptAnswer }
}
