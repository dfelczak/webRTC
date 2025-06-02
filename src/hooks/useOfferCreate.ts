import { useEffect, type Dispatch, type RefObject, type SetStateAction } from 'react'
import { useURLOffer } from './useURLOffer'
import { encodeSDP } from '../utils'

export function useOfferCreate({
  pcRef,
  localVideoRef,
  setOfferLink,
}: {
  pcRef: RefObject<RTCPeerConnection | null>
  localVideoRef: RefObject<HTMLVideoElement | null>
  setOfferLink: Dispatch<SetStateAction<string | null>>
}) {
  const urlOffer = useURLOffer()
  useEffect(() => {
    if (!localVideoRef.current) return
    localVideoRef.current.addEventListener('play', () => {
      if (!urlOffer) {
        createOffer()
      }
    })
  }, [urlOffer, localVideoRef])

  const createOffer = async () => {
    if (!pcRef.current) {
      alert('Najpierw uruchom kamerę!')
      return
    }
    const offer = await pcRef.current.createOffer()
    await pcRef.current.setLocalDescription(offer)
    setOfferLink(`${window.location.origin}${window.location.pathname}?offer=${encodeSDP(offer)}`)
  }
}
