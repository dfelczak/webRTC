import { useEffect, useRef } from 'react'

type Props = {
  stream: MediaStream | null
}

export const Video = ({ stream }: Props) => {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (ref.current && stream) {
      ref.current.srcObject = stream
    }
  }, [stream])

  return <video ref={ref} autoPlay playsInline className="w-full" />
}
