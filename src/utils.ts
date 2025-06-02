export const encodeSDP = (sdp: RTCSessionDescriptionInit) =>
  encodeURIComponent(btoa(JSON.stringify(sdp)))
export const decodeSDP = (encoded: string) => JSON.parse(atob(decodeURIComponent(encoded)))
