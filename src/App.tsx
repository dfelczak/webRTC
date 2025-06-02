import './App.css'
import { useEffect, useRef, useState } from 'react'

import { Mic, MicOff, PhoneOff } from 'lucide-react'
import { FullScreenBackdrop } from './ui/FullScreenBackdrop'
import type { Mode } from './types'
import { Wizard } from './Wizard'
import { Spinner } from './ui/Spinner'
import { FailedConnectionState } from './ui/FailedConnectionState'
import { CallControls } from './ui/CallControls'
import { ClosedConnectionState } from './ui/ClosedConnectionState'

const encodeSDP = (sdp: RTCSessionDescriptionInit) => encodeURIComponent(btoa(JSON.stringify(sdp)))
const decodeSDP = (encoded: string) => JSON.parse(atob(decodeURIComponent(encoded)))

export default function App() {
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)

  const pcRef = useRef<RTCPeerConnection | null>(null)
  const [pc, setPc] = useState<RTCPeerConnection | null>(null)
  const [localSDP, setLocalSDP] = useState('')
  const [remoteSDP, setRemoteSDP] = useState('')
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [offerLink, setOfferLink] = useState<string | null>(null)
  const [mode, setMode] = useState<Mode>('idle')
  const [autoOfferLoaded, setAutoOfferLoaded] = useState(false)
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState>('new')
  const [muted, setMuted] = useState(false)

  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !muted
      })
      setMuted((m) => !m)
    }
  }

  const disconnect = () => {
    if (pcRef.current) {
      pcRef.current.close()
      setPc(null)
    }
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    setOfferLink(null)
    setLocalSDP('')
    setRemoteSDP('')
    setMode('idle')
    setMuted(false)
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const offerEncoded = params.get('offer')

    const autoGenerateAnswer = async (offer: RTCSessionDescriptionInit) => {
      console.log({ pcRef, stream })
      if (!pcRef.current || !stream) return
      try {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(offer))

        stream.getTracks().forEach((track) => {
          pcRef.current?.addTrack(track, stream)
        })

        const answer = await pcRef.current.createAnswer()
        await pcRef.current.setLocalDescription(answer)
        setLocalSDP(JSON.stringify(answer, null, 2))
        setAutoOfferLoaded(true)
      } catch {
        alert('SDP niepoprawne')
      }
    }

    if (offerEncoded && !autoOfferLoaded) {
      try {
        const offer = decodeSDP(offerEncoded)
        setRemoteSDP(JSON.stringify(offer, null, 2))
        setMode('answering')
        autoGenerateAnswer(offer)
      } catch {
        alert('Nieprawidłowy link SDP.')
      }
    }
  }, [autoOfferLoaded, pc, stream])

  useEffect(() => {
    const autoStart = async () => {
      try {
        const _pc = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        })
        pcRef.current = _pc
        setPc(_pc)

        _pc.ontrack = (event) => {
          console.log('ONTRACK', event)
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0]
          }
        }

        _pc.onicecandidate = (event) => {
          if (!event.candidate && _pc.localDescription) {
            setLocalSDP(JSON.stringify(_pc.localDescription, null, 2))
          }
        }

        _pc.onconnectionstatechange = () => {
          console.log(_pc.connectionState)
          setConnectionState(_pc.connectionState)
        }

        const localStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        })
        setStream(localStream)

        localStream.getTracks().forEach((track) => {
          _pc.addTrack(track, localStream)
        })

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream
        }
      } catch {
        alert('Nie udało się uruchomić kamery – przeglądarka wymaga akcji użytkownika.')
      }
    }

    autoStart()
  }, [])

  useEffect(() => {
    if (pcRef.current && stream && mode !== 'answering') {
      createOffer()
    }
  }, [pc, stream, mode])

  useEffect(() => {
    if (stream && connectionState === 'connecting') {
      stream.getTracks().forEach((track) => {
        track.onended = () => {
          console.log('Remote track ended – peer się rozłączył!')
        }
      })
    }
  }, [connectionState, stream])

  const createOffer = async () => {
    if (!pcRef.current || !stream) {
      alert('Najpierw uruchom kamerę!')
      return
    }
    setMode('offering')
    const offer = await pcRef.current.createOffer()
    await pcRef.current.setLocalDescription(offer)
    setLocalSDP(JSON.stringify(offer, null, 2))
    setOfferLink(`${window.location.origin}${window.location.pathname}?offer=${encodeSDP(offer)}`)
  }

  const setRemote = async () => {
    if (!pcRef.current) return
    try {
      const desc = JSON.parse(remoteSDP)
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(desc))
    } catch {
      alert('SDP niepoprawne')
    }
  }

  return (
    <>
      <video
        ref={localVideoRef}
        autoPlay
        playsInline
        muted
        className={
          connectionState === 'new'
            ? 'bg-black rounded w-screen h-screen object-cover'
            : 'fixed bottom-4 right-4  w-64 h-36 rounded-2xl border border-gray-300 dark:border-gray-700 shadow-lg bg-black object-cover z-50'
        }
      />

      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="bg-black rounded w-screen h-screen object-cover"
      />

      <CallControls muted={muted} onToggleMute={toggleMute} onDisconnect={disconnect} />

      {'new' === connectionState && (
        <Wizard
          offerLink={offerLink}
          setRemote={setRemote}
          remoteSDP={remoteSDP}
          mode={mode}
          localSDP={localSDP}
          setRemoteSDP={setRemoteSDP}
        />
      )}

      {'connecting' === connectionState && (
        <FullScreenBackdrop>
          <div className="flex min-h-64 flex items-center justify-center">
            <Spinner />
          </div>
        </FullScreenBackdrop>
      )}

      {'failed' === connectionState && <FailedConnectionState />}
      {['closed', 'disconnected'].includes(connectionState) && <ClosedConnectionState />}
    </>
  )
}
