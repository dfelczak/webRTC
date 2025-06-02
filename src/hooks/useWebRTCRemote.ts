import { useEffect, useRef, useState } from 'react'

export const useWebRTCRemote = (offerSDP: string) => {
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [answerSDP, setAnswerSDP] = useState<string>()
  const peerRef = useRef<RTCPeerConnection | null>(null)

  useEffect(() => {
    const init = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      setLocalStream(stream)

      const peerConnection = new RTCPeerConnection()
      stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream))

      const remote = new MediaStream()

      peerConnection.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => remote.addTrack(track))
        setRemoteStream(remote)
      }
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription({ type: 'offer', sdp: offerSDP }),
      )
      const answer = await peerConnection.createAnswer()
      await peerConnection.setLocalDescription(answer)
      setAnswerSDP(answer.sdp)

      peerRef.current = peerConnection
    }

    if (offerSDP) init()
  }, [offerSDP])

  return { localStream, remoteStream, answerSDP }
}
