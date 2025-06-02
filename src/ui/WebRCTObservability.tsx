import { useEffect, useState } from 'react'

type WebRTCObservabilityProps = {
  pcRef: React.RefObject<RTCPeerConnection | null>
  streamRef: React.RefObject<MediaStream | null>
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>
  localVideoRef: React.RefObject<HTMLVideoElement | null>
}

type LogEntry = { ts: number; msg: string }

export function WebRTCObservability({
  pcRef,
  streamRef,
  remoteVideoRef,
  localVideoRef,
}: WebRTCObservabilityProps) {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [peerState, setPeerState] = useState<string>('')
  const [iceState, setIceState] = useState<string>('')
  const [gatheringState, setGatheringState] = useState<string>('')
  const [trackStates, setTrackStates] = useState<string[]>([])

  const log = (msg: string) => {
    setLogs((prev) => [{ ts: Date.now(), msg }, ...prev.slice(0, 49)])
  }

  useEffect(() => {
    const pc = pcRef.current
    if (!pc) return
    log('PeerConnection: initialized')

    const onConnState = () => {
      setPeerState(pc.connectionState)
      log(`PeerConnectionState: ${pc.connectionState}`)
    }
    const onIceState = () => {
      setIceState(pc.iceConnectionState)
      log(`ICEConnectionState: ${pc.iceConnectionState}`)
    }
    const onIceGathering = () => {
      setGatheringState(pc.iceGatheringState)
      log(`ICEGatheringState: ${pc.iceGatheringState}`)
    }
    const onTrack = (e: RTCTrackEvent) => {
      log(`ontrack: ${e.track.kind} (id: ${e.track.id})`)
      setTrackStates((old) => [...old, `Track: ${e.track.kind} state: ${e.track.readyState}`])
      e.track.onended = () => log(`Track ended: ${e.track.kind}`)
      e.track.onmute = () => log(`Track muted: ${e.track.kind}`)
      e.track.onunmute = () => log(`Track unmuted: ${e.track.kind}`)
    }
    const onIceCandidate = (e: RTCPeerConnectionIceEvent) => {
      if (e.candidate) {
        log(`ICE candidate: ${e.candidate.candidate}`)
      } else {
        log('ICE gathering complete (no more candidates)')
      }
    }

    pc.addEventListener('connectionstatechange', onConnState)
    pc.addEventListener('iceconnectionstatechange', onIceState)
    pc.addEventListener('icegatheringstatechange', onIceGathering)
    pc.addEventListener('track', onTrack)
    pc.addEventListener('icecandidate', onIceCandidate)

    setPeerState(pc.connectionState)
    setIceState(pc.iceConnectionState)
    setGatheringState(pc.iceGatheringState)

    return () => {
      pc.removeEventListener('connectionstatechange', onConnState)
      pc.removeEventListener('iceconnectionstatechange', onIceState)
      pc.removeEventListener('icegatheringstatechange', onIceGathering)
      pc.removeEventListener('track', onTrack)
      pc.removeEventListener('icecandidate', onIceCandidate)
    }
  }, [pcRef.current])

  useEffect(() => {
    const s = streamRef.current
    if (!s) return
    log('MediaStream: initialized')
    s.getTracks().forEach((track) => {
      const logTrack = (ev: Event) => {
        log(`LocalStream ${track.kind} ${ev.type} (readyState: ${track.readyState})`)
      }
      track.addEventListener('ended', logTrack)
      track.addEventListener('mute', logTrack)
      track.addEventListener('unmute', logTrack)
    })
    return () => {
      s.getTracks().forEach((track) => {
        track.removeEventListener('ended', () => {})
        track.removeEventListener('mute', () => {})
        track.removeEventListener('unmute', () => {})
      })
    }
    // eslint-disable-next-line
  }, [streamRef.current])

  const [localSrc, setLocalSrc] = useState<string>('')
  const [remoteSrc, setRemoteSrc] = useState<string>('')
  useEffect(() => {
    setLocalSrc(localVideoRef.current && localVideoRef.current.srcObject ? 'MediaStream' : '-')
    setRemoteSrc(remoteVideoRef.current && remoteVideoRef.current.srcObject ? 'MediaStream' : '-')

    // eslint-disable-next-line
  }, [localVideoRef.current, remoteVideoRef.current])

  return (
    <div className="fixed top-4 right-4 z-50 w-[400px] max-h-[70vh] bg-black/90 text-green-200 rounded-xl shadow-lg p-4 text-xs overflow-y-auto font-mono space-y-2">
      <div className="font-bold text-lg text-white mb-2">WebRTC Observability</div>
      <div>
        <div>
          <span className="font-semibold text-green-300">PeerConnectionState:</span> {peerState}
        </div>
        <div>
          <span className="font-semibold text-green-300">ICEConnectionState:</span> {iceState}
        </div>
        <div>
          <span className="font-semibold text-green-300">ICEGatheringState:</span> {gatheringState}
        </div>
      </div>
      <div>
        <span className="font-semibold text-green-300">LocalVideo src:</span> {localSrc}
        <br />
        <span className="font-semibold text-green-300">RemoteVideo src:</span> {remoteSrc}
      </div>
      <div>
        <span className="font-semibold text-green-300">Tracks:</span>
        <ul className="pl-2">
          {trackStates.map((t, i) => (
            <li key={i}>- {t}</li>
          ))}
        </ul>
      </div>
      <div>
        <span className="font-semibold text-green-300">Live Event Log:</span>
        <ul className="pl-2 max-h-32 overflow-y-auto">
          {logs.map((l, i) => (
            <li key={i}>
              [{new Date(l.ts).toLocaleTimeString()}] {l.msg}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
