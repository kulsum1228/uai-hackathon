// ============================================================
// components/VideoCall.jsx
// Full WebRTC video/audio call using Socket.io for signaling
//
// HOW WebRTC WORKS HERE:
//  1. Both peers join the Socket.io consultation room
//  2. The "caller" (whoever joins second via user_joined) creates
//     an RTCPeerConnection and sends an "offer" SDP via socket
//  3. The "callee" receives the offer, creates an "answer" SDP
//  4. Both sides exchange ICE candidates for network traversal
//  5. Once connected, media streams flow peer-to-peer
// ============================================================

import { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// STUN servers help peers discover their public IP/port
// Google's free STUN servers work for most networks
const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');

  .vc-wrapper {
    position: relative;
    background: #0a1628;
    border-radius: 12px;
    overflow: hidden;
    width: 100%;
    height: 100%;
    min-height: 480px;
    display: flex;
    flex-direction: column;
    font-family: 'DM Sans', sans-serif;
  }

  /* ── Video grid ── */
  .vc-videos {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr;
    gap: 4px;
    padding: 12px;
    position: relative;
  }
  .vc-videos.two-peers {
    grid-template-columns: 1fr 1fr;
  }

  .vc-video-tile {
    position: relative;
    background: #0f2040;
    border-radius: 10px;
    overflow: hidden;
    aspect-ratio: 16/9;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .vc-video-tile video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 10px;
  }
  .vc-video-label {
    position: absolute;
    bottom: 8px;
    left: 10px;
    background: rgba(0,0,0,0.55);
    color: #fff;
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 6px;
    backdrop-filter: blur(4px);
  }
  .vc-muted-overlay {
    position: absolute;
    inset: 0;
    background: #0f2040;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  .vc-avatar {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: #1a4a7a;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    font-weight: 600;
  }
  .vc-muted-name {
    font-size: 13px;
    color: rgba(255,255,255,0.7);
  }
  .vc-mic-off-badge {
    position: absolute;
    top: 8px;
    right: 8px;
    background: rgba(220,38,38,0.8);
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
  }

  /* ── Status bar ── */
  .vc-status {
    position: absolute;
    top: 16px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0,0,0,0.6);
    color: #fff;
    font-size: 12px;
    padding: 5px 14px;
    border-radius: 20px;
    backdrop-filter: blur(8px);
    white-space: nowrap;
    z-index: 10;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .vc-status-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
  }
  .vc-status-dot.connecting { background: #f59e0b; animation: pulse 1s infinite; }
  .vc-status-dot.connected  { background: #22c55e; }
  .vc-status-dot.ended      { background: #ef4444; }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.4; }
  }

  /* ── Controls bar ── */
  .vc-controls {
    background: rgba(0,0,0,0.7);
    backdrop-filter: blur(10px);
    padding: 14px 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    flex-shrink: 0;
  }
  .vc-ctrl-btn {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    transition: all 0.15s;
    flex-shrink: 0;
  }
  .vc-ctrl-btn.active   { background: rgba(255,255,255,0.15); color: #fff; }
  .vc-ctrl-btn.active:hover { background: rgba(255,255,255,0.25); }
  .vc-ctrl-btn.muted    { background: rgba(220,38,38,0.8); color: #fff; }
  .vc-ctrl-btn.end-call { background: #dc2626; color: #fff; width: 56px; height: 56px; font-size: 20px; }
  .vc-ctrl-btn.end-call:hover { background: #b91c1c; }

  /* ── Waiting / error states ── */
  .vc-waiting {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #fff;
    gap: 12px;
    padding: 32px;
  }
  .vc-waiting-icon { font-size: 40px; animation: pulse 1.5s ease-in-out infinite; }
  .vc-waiting-title { font-size: 16px; font-weight: 600; }
  .vc-waiting-desc  { font-size: 13px; color: rgba(255,255,255,0.6); text-align: center; }

  .vc-error {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 12px; padding: 32px;
  }
  .vc-error-icon  { font-size: 36px; }
  .vc-error-title { font-size: 15px; font-weight: 600; color: #fca5a5; }
  .vc-error-desc  { font-size: 13px; color: rgba(255,255,255,0.55); text-align: center; line-height: 1.5; }
  .vc-error-btn {
    margin-top: 8px;
    background: #1a5276; color: #fff; border: none; border-radius: 7px;
    padding: 9px 20px; font-size: 13px; font-weight: 500;
    font-family: 'DM Sans', sans-serif; cursor: pointer;
  }
  .vc-timer {
    font-size: 12px;
    color: rgba(255,255,255,0.55);
    font-variant-numeric: tabular-nums;
  }
`;

// ── Format call duration ──────────────────────────────────
const formatDuration = (secs) => {
  const m = Math.floor(secs / 60).toString().padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

// ============================================================
// Component
// ============================================================
const VideoCall = ({ consultationId, currentUser, peerName, callType = "video", onCallEnd }) => {
  const [status, setStatus]       = useState("connecting"); // connecting | waiting | connected | ended | error
  const [error, setError]         = useState("");
  const [micMuted, setMicMuted]   = useState(false);
  const [videoOff, setVideoOff]   = useState(callType === "audio");
  const [peerMicMuted, setPeerMicMuted]   = useState(false);
  const [peerVideoOff, setPeerVideoOff]   = useState(false);
  const [duration, setDuration]   = useState(0);
  const [hasPeer, setHasPeer]     = useState(false);

  // Refs — don't cause re-renders when changed
  const localVideoRef  = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef        = useRef(null);   // RTCPeerConnection
  const localStream    = useRef(null);   // MediaStream from camera/mic
  const socketRef      = useRef(null);
  const timerRef       = useRef(null);
  const isCallerRef    = useRef(false);  // true = sent offer, false = received offer

  // ── Setup: connect socket, get media, join room ──────────
  useEffect(() => {
    let mounted = true;

    const setup = async () => {
      try {
        // 1. Get camera / mic access
        const stream = await navigator.mediaDevices.getUserMedia({
          video: callType === "video",
          audio: true,
        });
        localStream.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        if (!mounted) return;

        // 2. Connect socket with JWT
        const token = localStorage.getItem("telehealth_token");
        const sock  = io(SOCKET_URL, {
          auth: { token: `Bearer ${token}` },
          transports: ["websocket"],
        });
        socketRef.current = sock;

        // 3. Register signaling event listeners BEFORE joining room
        registerSignalingEvents(sock);

        // 4. Join the consultation room
        sock.emit("join_consultation", { consultationId });
        setStatus("waiting");

      } catch (err) {
        if (!mounted) return;
        if (err.name === "NotAllowedError") {
          setError("Camera/microphone access was denied. Please allow access in your browser settings and try again.");
        } else if (err.name === "NotFoundError") {
          setError("No camera or microphone found on this device.");
        } else {
          setError(`Could not start call: ${err.message}`);
        }
        setStatus("error");
      }
    };

    setup();

    return () => {
      mounted = false;
      cleanup();
    };
  }, [consultationId]);

  // ── Start call duration timer when connected ─────────────
  useEffect(() => {
    if (status === "connected") {
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [status]);

  // ── Register all WebRTC signaling socket events ───────────
  const registerSignalingEvents = (sock) => {

    // Another participant joined — we become the caller and send an offer
    sock.on("user_joined", async ({ userId }) => {
      console.log("Peer joined, creating offer…");
      isCallerRef.current = true;
      setHasPeer(true);
      setStatus("connecting");
      await createPeerConnection(sock);
      await sendOffer(sock);
    });

    // We received an offer — we are the callee, send back an answer
    sock.on("webrtc_offer", async ({ offer }) => {
      console.log("Received offer, sending answer…");
      setHasPeer(true);
      setStatus("connecting");
      if (!peerRef.current) await createPeerConnection(sock);
      await peerRef.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerRef.current.createAnswer();
      await peerRef.current.setLocalDescription(answer);
      sock.emit("webrtc_answer", { consultationId, answer });
    });

    // We sent an offer and got an answer back
    sock.on("webrtc_answer", async ({ answer }) => {
      console.log("Received answer…");
      if (peerRef.current) {
        await peerRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    // Received an ICE candidate from the other peer — add it
    sock.on("webrtc_ice_candidate", async ({ candidate }) => {
      try {
        if (peerRef.current && candidate) {
          await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch { /* ignore stale candidates */ }
    });

    // Peer muted/unmuted their mic or camera
    sock.on("webrtc_peer_mic_toggle",   ({ muted    }) => setPeerMicMuted(muted));
    sock.on("webrtc_peer_video_toggle", ({ videoOff }) => setPeerVideoOff(videoOff));

    // Peer ended the call
    sock.on("webrtc_call_ended", () => {
      setStatus("ended");
      cleanup();
    });

    sock.on("joined_consultation", () => {
      console.log("Joined consultation room, waiting for peer…");
    });
  };

  // ── Create RTCPeerConnection and attach tracks ────────────
  const createPeerConnection = useCallback(async (sock) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    peerRef.current = pc;

    // Add all local media tracks to the connection
    localStream.current.getTracks().forEach((track) => {
      pc.addTrack(track, localStream.current);
    });

    // When remote tracks arrive, attach to the remote video element
    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
      setStatus("connected");
    };

    // Send ICE candidates to the other peer via socket
    pc.onicecandidate = (event) => {
      if (event.candidate && sock) {
        sock.emit("webrtc_ice_candidate", {
          consultationId,
          candidate: event.candidate,
        });
      }
    };

    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      console.log("Connection state:", state);
      if (state === "connected")     setStatus("connected");
      if (state === "disconnected" || state === "failed") setStatus("ended");
    };

    return pc;
  }, [consultationId]);

  // ── Caller: create and send offer ────────────────────────
  const sendOffer = async (sock) => {
    if (!peerRef.current) return;
    const offer = await peerRef.current.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: callType === "video",
    });
    await peerRef.current.setLocalDescription(offer);
    sock.emit("webrtc_offer", { consultationId, offer });
  };

  // ── Toggle mic ────────────────────────────────────────────
  const toggleMic = () => {
    if (!localStream.current) return;
    const audioTrack = localStream.current.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = micMuted; // flip
      setMicMuted(!micMuted);
      socketRef.current?.emit("webrtc_toggle_mic", {
        consultationId, muted: !micMuted,
      });
    }
  };

  // ── Toggle camera ─────────────────────────────────────────
  const toggleVideo = () => {
    if (!localStream.current) return;
    const videoTrack = localStream.current.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = videoOff; // flip
      setVideoOff(!videoOff);
      socketRef.current?.emit("webrtc_toggle_video", {
        consultationId, videoOff: !videoOff,
      });
    }
  };

  // ── End call ──────────────────────────────────────────────
  const endCall = () => {
    socketRef.current?.emit("webrtc_end_call", { consultationId });
    setStatus("ended");
    cleanup();
    onCallEnd?.();
  };

  // ── Cleanup: stop all tracks, close peer, disconnect socket
  const cleanup = () => {
    clearInterval(timerRef.current);
    localStream.current?.getTracks().forEach((t) => t.stop());
    peerRef.current?.close();
    socketRef.current?.disconnect();
    peerRef.current  = null;
    localStream.current = null;
  };

  const peerInitials = peerName?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?";

  return (
    <>
      <style>{CSS}</style>
      <div className="vc-wrapper">

        {/* Status bar */}
        {status !== "error" && (
          <div className="vc-status">
            <span className={`vc-status-dot ${status === "connected" ? "connected" : status === "ended" ? "ended" : "connecting"}`} />
            {status === "waiting"    && "Waiting for peer to join…"}
            {status === "connecting" && "Connecting…"}
            {status === "connected"  && <><span>Connected</span><span className="vc-timer">{formatDuration(duration)}</span></>}
            {status === "ended"      && "Call ended"}
          </div>
        )}

        {/* Error state */}
        {status === "error" && (
          <div className="vc-error">
            <span className="vc-error-icon">🚫</span>
            <p className="vc-error-title">Could not start call</p>
            <p className="vc-error-desc">{error}</p>
            <button className="vc-error-btn" onClick={() => window.location.reload()}>
              Try Again
            </button>
          </div>
        )}

        {/* Call ended */}
        {status === "ended" && (
          <div className="vc-waiting">
            <span className="vc-waiting-icon">📵</span>
            <p className="vc-waiting-title">Call Ended</p>
            <p className="vc-waiting-desc">Duration: {formatDuration(duration)}</p>
          </div>
        )}

        {/* Video tiles */}
        {(status === "waiting" || status === "connecting" || status === "connected") && (
          <div className={`vc-videos ${hasPeer ? "two-peers" : ""}`}>

            {/* Local video (you) */}
            <div className="vc-video-tile">
              {videoOff || callType === "audio" ? (
                <div className="vc-muted-overlay">
                  <div className="vc-avatar">
                    {currentUser?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "ME"}
                  </div>
                  <p className="vc-muted-name">You {callType === "audio" ? "(Audio)" : "(Camera off)"}</p>
                </div>
              ) : (
                <video ref={localVideoRef} autoPlay muted playsInline />
              )}
              {micMuted && <div className="vc-mic-off-badge">🔇</div>}
              <span className="vc-video-label">You</span>
            </div>

            {/* Remote video (peer) */}
            {hasPeer && (
              <div className="vc-video-tile">
                {peerVideoOff || callType === "audio" ? (
                  <div className="vc-muted-overlay">
                    <div className="vc-avatar">{peerInitials}</div>
                    <p className="vc-muted-name">{peerName} {callType === "audio" ? "(Audio)" : "(Camera off)"}</p>
                  </div>
                ) : (
                  <video ref={remoteVideoRef} autoPlay playsInline />
                )}
                {peerMicMuted && <div className="vc-mic-off-badge">🔇</div>}
                <span className="vc-video-label">{peerName}</span>
              </div>
            )}

            {/* Waiting for peer */}
            {!hasPeer && status === "waiting" && (
              <div style={{ position: "absolute", bottom: "20px", left: "50%", transform: "translateX(-50%)", color: "rgba(255,255,255,0.5)", fontSize: "13px" }}>
                Waiting for {peerName} to join…
              </div>
            )}
          </div>
        )}

        <audio ref={remoteVideoRef} autoPlay style={{ display: callType === "audio" ? "block" : "none", position: "absolute" }} />

        {/* Controls */}
        {status !== "error" && status !== "ended" && (
          <div className="vc-controls">
            {/* Mic toggle */}
            <button
              className={`vc-ctrl-btn ${micMuted ? "muted" : "active"}`}
              onClick={toggleMic}
              title={micMuted ? "Unmute microphone" : "Mute microphone"}
            >
              {micMuted ? "🔇" : "🎤"}
            </button>

            {/* Camera toggle (video calls only) */}
            {callType === "video" && (
              <button
                className={`vc-ctrl-btn ${videoOff ? "muted" : "active"}`}
                onClick={toggleVideo}
                title={videoOff ? "Turn on camera" : "Turn off camera"}
              >
                {videoOff ? "📷" : "🎥"}
              </button>
            )}

            {/* End call */}
            <button className="vc-ctrl-btn end-call" onClick={endCall} title="End call">
              📵
            </button>
          </div>
        )}

      </div>
    </>
  );
};

export default VideoCall;