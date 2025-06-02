import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string'

export function useOfferLinkEncoder({
  sdp,
  ice,
}: {
  sdp: RTCSessionDescriptionInit['sdp']
  ice?: string
}) {
  if (!sdp) {
    return null
  }

  const offerEncoded = compressToEncodedURIComponent(JSON.stringify({ sdp, ice }))
  const link = `${location.origin}#offer=${offerEncoded}`

  return link
}

export function useOfferURLData() {
  const raw = decompressFromEncodedURIComponent(window.location.hash.replace('#offer=', ''))

  if (!raw) return null

  const offerData = JSON.parse(raw)

  return offerData.sdp
}
