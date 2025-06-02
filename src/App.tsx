import './App.css'
import { useEffect, useRef, useState } from 'react'

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
  const [mode, setMode] = useState<'idle' | 'offering' | 'answering'>('idle')
  const [autoOfferLoaded, setAutoOfferLoaded] = useState(false)

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

  const createAnswer = async () => {
    if (!pcRef.current) return
    const answer = await pcRef.current.createAnswer()
    await pcRef.current.setLocalDescription(answer)
    setLocalSDP(JSON.stringify(answer, null, 2))
  }

  const setAnswer = async () => {
    if (!pcRef.current) return
    try {
      const desc = JSON.parse(remoteSDP)
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(desc))
    } catch {
      alert('SDP niepoprawne')
    }
  }

  return (
    <div className="p-4 flex flex-col items-center bg-gray-900 min-h-screen text-white">
      <h1 className="text-2xl mb-4">WebRTC P2P Demo (link SDP)</h1>
      <div className="flex gap-8 mb-6">
        <div>
          <span className="block mb-2">Your Camera</span>
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-64 h-48 bg-black rounded"
          />
        </div>
        <div>
          <span className="block mb-2">Remote Camera</span>
          <video ref={remoteVideoRef} autoPlay playsInline className="w-64 h-48 bg-black rounded" />
        </div>
      </div>
      <div className="flex gap-4 mb-8">
        <button
          className="bg-green-600 px-4 py-2 rounded"
          onClick={createOffer}
          disabled={!pc || !stream || mode === 'answering'}
        >
          Create Offer & Link
        </button>
        {mode === 'answering' && (
          <>
            <button
              className="bg-pink-600 px-4 py-2 rounded"
              onClick={setRemote}
              disabled={!remoteSDP || !pc}
            >
              Set Remote Offer
            </button>
            <button
              className="bg-yellow-600 px-4 py-2 rounded"
              onClick={createAnswer}
              disabled={!pc}
            >
              Create Answer
            </button>
          </>
        )}
        {mode === 'offering' && (
          <button
            className="bg-purple-600 px-4 py-2 rounded"
            onClick={setAnswer}
            disabled={!remoteSDP || !pc}
          >
            Set Remote Answer
          </button>
        )}
      </div>
      {offerLink && (
        <div className="w-full max-w-2xl mb-4">
          <label className="block mb-1 font-bold text-green-400">
            Link z offerem – wyślij znajomemu:
          </label>
          <input
            value={offerLink}
            readOnly
            className="w-full bg-gray-800 p-2 rounded text-xs font-mono mb-2"
            onFocus={(e) => e.target.select()}
          />
        </div>
      )}
      <div className="w-full max-w-2xl mb-4">
        <label className="block mb-1">Local SDP (skopiuj/wklej do peer):</label>
        <textarea
          value={localSDP}
          readOnly
          rows={6}
          className="w-full bg-gray-800 p-2 rounded text-xs font-mono"
        />
      </div>
      <div className="w-full max-w-2xl mb-4">
        <label className="block mb-1">Remote SDP (wklej z peer lub z linka):</label>
        <textarea
          value={remoteSDP}
          onChange={(e) => setRemoteSDP(e.target.value)}
          rows={6}
          className="w-full bg-gray-800 p-2 rounded text-xs font-mono"
        />
      </div>
      <ol className="mt-6 text-xs opacity-70 list-decimal max-w-2xl mx-auto">
        <li>
          Peer A: kliknij <b>Create Offer & Link</b>.
        </li>
        <li>
          Wyślij wygenerowany <b>link</b> Peerowi B (np. Messenger/Slack).
        </li>
        <li>
          Peer B: otwiera link, kamera odpala się, kliknij <b>Set Remote Offer</b>, potem{' '}
          <b>Create Answer</b>.
        </li>
        <li>
          Peer B: skopiuj <b>Local SDP</b> i wyślij Peerowi A.
        </li>
        <li>
          Peer A: wklej do <b>Remote SDP</b>, kliknij <b>Set Remote Answer</b>.
        </li>
        <li>Po kilku sekundach powinno zadziałać (peer-to-peer obraz i dźwięk).</li>
      </ol>
      <p className="mt-6 text-xs opacity-50">
        * Połączenie działa tylko przez wymianę linka i kopiowanie SDP – czysty frontend, zero
        backendu.
      </p>
    </div>
  )
}
