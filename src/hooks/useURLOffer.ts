export function useURLOffer() {
  const params = new URLSearchParams(window.location.search)
  const offerEncoded = params.get('offer')
  return offerEncoded
}
