# WebRTC P2P Video MVP

**[👉 Live Demo on Netlify](https://app.netlify.com/projects/ddwebrtc/deploys)**

---

## Description

This is a minimal application for **peer-to-peer video calling** using WebRTC, built with React + TypeScript + Vite.  
**No backend, no signaling server** – the entire offer/answer (SDP) exchange happens via shareable links and copy-paste.

The project is designed to **demonstrate real-world WebRTC flows** with a full observability/debug panel (event logs, state changes, etc).

---

## How This App Works

1. **Peer A** (you) opens the app, allows camera/mic access.
2. Click “Create Offer & Link” to generate a link containing the encoded SDP offer.
3. Share the link with your friend (Peer B).
4. Peer B opens the link, allows camera/mic, pastes/sets the “remote offer,” generates an “answer.”
5. Peer B sends the generated answer SDP back to Peer A.
6. Peer A pastes the answer back in their app and clicks “Set Remote Answer.”
7. Video and audio flow **directly peer-to-peer** – no servers in the middle.

---

## Important WebRTC Limitations and Realities

### 1. Only 1:1 Connections

- Each pair of peers can only have one call. You can’t add a third participant to the same call without building extra signaling and multi-peer support.
- Each PeerConnection is **strictly one audio-video stream in both directions**.

### 2. No True Bidirectional “Disconnect”

- When one side clicks “Disconnect” (closes their PeerConnection), only **their own UI** reflects this immediately.
- The other peer detects disconnect **with delay** (via ended tracks, ICE timeouts, or via observability/logs).
- **WebRTC does not auto-propagate “disconnect” to the other side** – a signaling channel (e.g. WebSocket) would be needed for true sync.

### 3. Manual SDP Exchange

- The flow is all about sharing links (with encoded SDP) and copy-pasting answers between peers.  
  This is not production-grade UX, but perfect to demo bare WebRTC with zero backend.

### 4. Compatibility Issues

- For best results, test on Chrome ↔ Chrome, on different devices.
- Chrome ↔ Firefox/Safari might work, but can break due to SDP/ICE differences (sometimes you get audio but no video, etc).

### 5. Mute/Disconnect

- Mute works locally: disables your mic for the other side (they can’t hear you).
- Disconnect turns off your camera and mic, and closes the connection – but the other peer doesn’t get instant feedback (see above).

### 6. No Signaling Server

- No way to “join” an ongoing call, and no way to fully sync disconnects between both sides – there’s no backend message exchange.
- Everything is manual, on purpose.

---

## Observability

The app includes a built-in **debug panel**:

- You can view live: PeerConnection state, ICE, gathering status, track events, WebRTC logs, all events in real-time.
- Toggle the panel with the bug icon button in the top-left corner.

---

## Typical Pitfalls / Gotchas

- **1:1 only** – no more than two participants per call.
- **Paste the full link!** – SDP exchange is all-or-nothing. Any cut-off or modified link = fail.
- **Don’t use private/incognito mode or browsers with blocked permissions – camera/mic access is required.**


## Local Development

```bash
yarn install
yarn dev
