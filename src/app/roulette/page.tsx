"use client";

import { QRCodeSVG } from "qrcode.react";
import { useCallback, useEffect, useRef, useState } from "react";

// セクターと画像の対応表
const sectors = [
  { name: "1BB", image: "/roulette/1BB.png" },
  { name: "25BB", image: "/roulette/25BB.png" },
  { name: "1BB", image: "/roulette/1BB.png" },
  { name: "2BB", image: "/roulette/2BB.png" },
  { name: "5BB", image: "/roulette/5BB.png" },
  { name: "2BB", image: "/roulette/2BB.png" },
  { name: "1BB", image: "/roulette/1BB.png" },
  { name: "2BB", image: "/roulette/2BB.png" },
  { name: "10BB", image: "/roulette/10BB.png" },
  { name: "2BB", image: "/roulette/2BB.png" },
  { name: "1BB", image: "/roulette/1BB.png" },
  { name: "5BB", image: "/roulette/5BB.png" },
  { name: "1BB", image: "/roulette/1BB.png" },
  { name: "2BB", image: "/roulette/2BB.png" },
];

// スクロールアニメーションのメッセージ
const scrollMessages = [
  "リングイベント SPIN & DROP!",
  "フルハウス以上の役でルーレットStart!!",
  "ルーレットで出た出目が次のポットに投入!!",
  "役が完成していて、相手に降りられてしまっても、ハンドをショーすればルーレットStart!!",
];

// ランダムなルームIDを生成
function generateRoomId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

type Mode = "select" | "display" | "controller";
type ConnectionStatus = "disconnected" | "connecting" | "connected";

export default function RoulettePage() {
  // モード選択
  const [mode, setMode] = useState<Mode>("select");
  const [roomId, setRoomId] = useState<string>("");
  const [inputRoomId, setInputRoomId] = useState<string>("");
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected");

  // ルーレット状態
  const [isSpinning, setIsSpinning] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [resultImage, setResultImage] = useState<string>("");
  const [isScrollTextVisible, setIsScrollTextVisible] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);

  const rouletteRef = useRef<HTMLDivElement>(null);
  const beepRef = useRef<HTMLAudioElement | null>(null);
  const resultEffectRef = useRef<HTMLAudioElement | null>(null);
  const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<number | null>(null);
  const isSpinningRef = useRef(false);
  const currentRotationRef = useRef(0);

  // WebRTC (PeerJS)
  const peerRef = useRef<import("peerjs").default | null>(null);
  const connRef = useRef<import("peerjs").DataConnection | null>(null);

  // 音声を有効化
  const enableAudio = useCallback(() => {
    if (audioEnabled) return;
    if (beepRef.current) {
      beepRef.current.volume = 0;
      beepRef.current.play().then(() => {
        beepRef.current!.pause();
        beepRef.current!.currentTime = 0;
        beepRef.current!.volume = 1;
      }).catch(() => {});
    }
    if (resultEffectRef.current) {
      resultEffectRef.current.volume = 0;
      resultEffectRef.current.play().then(() => {
        resultEffectRef.current!.pause();
        resultEffectRef.current!.currentTime = 0;
        resultEffectRef.current!.volume = 1;
      }).catch(() => {});
    }
    setAudioEnabled(true);
  }, [audioEnabled]);

  // イージング関数
  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

  // スクロールテキスト表示/非表示
  const showScrollText = useCallback(() => setIsScrollTextVisible(true), []);
  const hideScrollText = useCallback(() => setIsScrollTextVisible(false), []);

  // 非操作タイマーリセット
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current);
    if (!isScrollTextVisible) {
      inactivityTimeoutRef.current = setTimeout(() => showScrollText(), 30000);
    }
  }, [isScrollTextVisible, showScrollText]);

  // 結果表示
  const showResultDisplay = useCallback((sectorIndex: number) => {
    const sector = sectors[sectorIndex];
    setResultImage(sector.image);
    setShowResult(true);
    resultEffectRef.current?.play();
    setTimeout(() => {
      setShowResult(false);
      resetInactivityTimer();
    }, 7000);
  }, [resetInactivityTimer]);

  // ルーレット回転
  const spinRoulette = useCallback((spinDuration: number, finalRotation: number) => {
    if (isSpinningRef.current) return;

    isSpinningRef.current = true;
    setIsSpinning(true);
    hideScrollText();

    const startTime = performance.now();
    const startRotation = currentRotationRef.current;
    const totalRotation = finalRotation - startRotation;
    const sectorAngle = 360 / sectors.length;
    let lastBeepSector = -1;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / spinDuration, 1);
      const easeProgress = easeOutCubic(progress);
      const newRotation = startRotation + totalRotation * easeProgress;
      currentRotationRef.current = newRotation;

      if (rouletteRef.current) {
        rouletteRef.current.style.transform = `rotate(${newRotation}deg)`;
      }

      const normalizedAngle = ((newRotation % 360) + 360) % 360;
      const currentSector = Math.floor(normalizedAngle / sectorAngle);
      if (currentSector !== lastBeepSector && beepRef.current) {
        beepRef.current.currentTime = 0;
        beepRef.current.play().catch(() => {});
        lastBeepSector = currentSector;
      }

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        const finalAngle = newRotation % 360;
        const sectorIndex = Math.floor((360 - finalAngle) / sectorAngle) % sectors.length;
        isSpinningRef.current = false;
        setIsSpinning(false);
        showResultDisplay(sectorIndex);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [hideScrollText, showResultDisplay]);

  // スピン実行（ローカル + リモート送信）
  const triggerSpin = useCallback(() => {
    if (isSpinningRef.current) return;

    const spinDuration = Math.random() * 8000 + 11000;
    const finalRotation = currentRotationRef.current + 360 * 5 + Math.random() * 360;

    // WebRTCで送信
    if (connRef.current && connRef.current.open) {
      connRef.current.send({ type: "spin", spinDuration, finalRotation });
    }

    // ローカルでもスピン
    spinRoulette(spinDuration, finalRotation);
  }, [spinRoulette]);

  // WebRTCメッセージ受信時
  const handlePeerData = useCallback((data: unknown) => {
    const msg = data as { type: string; spinDuration?: number; finalRotation?: number };
    if (msg.type === "spin" && msg.spinDuration && msg.finalRotation) {
      spinRoulette(msg.spinDuration, msg.finalRotation);
    }
  }, [spinRoulette]);

  // ディスプレイモード開始（PC側）
  const startDisplayMode = useCallback(async () => {
    const newRoomId = generateRoomId();
    setRoomId(newRoomId);
    setMode("display");
    setConnectionStatus("connecting");

    const { default: Peer } = await import("peerjs");
    const peer = new Peer(`roulette-${newRoomId}`, {
      debug: 2,
    });

    peer.on("open", () => {
      console.log("Peer opened with ID:", peer.id);
      setConnectionStatus("disconnected"); // 待機中
    });

    peer.on("connection", (conn) => {
      console.log("Connection received from:", conn.peer);
      connRef.current = conn;

      conn.on("open", () => {
        console.log("Connection opened");
        setConnectionStatus("connected");
      });

      conn.on("data", handlePeerData);

      conn.on("close", () => {
        console.log("Connection closed");
        setConnectionStatus("disconnected");
      });
    });

    peer.on("error", (err) => {
      console.error("Peer error:", err);
    });

    peerRef.current = peer;
  }, [handlePeerData]);

  // コントローラーモード開始（スマホ側）
  const startControllerMode = useCallback(async () => {
    if (!inputRoomId.trim()) return;

    setMode("controller");
    setConnectionStatus("connecting");

    const { default: Peer } = await import("peerjs");
    const peer = new Peer({
      debug: 2,
    });

    peer.on("open", () => {
      console.log("Controller peer opened");
      const conn = peer.connect(`roulette-${inputRoomId.toUpperCase()}`);

      conn.on("open", () => {
        console.log("Connected to display");
        connRef.current = conn;
        setConnectionStatus("connected");
      });

      conn.on("data", handlePeerData);

      conn.on("close", () => {
        console.log("Connection closed");
        setConnectionStatus("disconnected");
      });

      conn.on("error", (err) => {
        console.error("Connection error:", err);
        setConnectionStatus("disconnected");
      });
    });

    peer.on("error", (err) => {
      console.error("Peer error:", err);
      setConnectionStatus("disconnected");
    });

    peerRef.current = peer;
  }, [inputRoomId, handlePeerData]);

  // クリックイベント
  const handleClick = useCallback(() => {
    enableAudio();
    triggerSpin();
  }, [enableAudio, triggerSpin]);

  // キーボードイベント
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" && mode !== "select") {
        enableAudio();
        triggerSpin();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [triggerSpin, enableAudio, mode]);

  // 音声有効化イベント
  useEffect(() => {
    const handleInteraction = () => enableAudio();
    window.addEventListener("click", handleInteraction);
    window.addEventListener("touchstart", handleInteraction);
    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
    };
  }, [enableAudio]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current);
      if (connRef.current) connRef.current.close();
      if (peerRef.current) peerRef.current.destroy();
    };
  }, []);

  // 初期タイマー
  useEffect(() => {
    if (mode !== "select") resetInactivityTimer();
  }, [resetInactivityTimer, mode]);

  // QRコードURL
  const qrUrl = typeof window !== "undefined"
    ? `${window.location.origin}${window.location.pathname}?room=${roomId}`
    : "";

  // URLからルームIDを取得
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const room = params.get("room");
      if (room) {
        setInputRoomId(room);
      }
    }
  }, []);

  // モード選択画面
  if (mode === "select") {
    return (
      <>
        <style jsx global>{`
          body {
            margin: 0;
            padding: 0;
            min-height: 100vh;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            font-family: Arial, sans-serif;
          }
          .select-container {
            text-align: center;
            color: white;
            padding: 40px;
          }
          .select-title {
            font-size: 36px;
            margin-bottom: 40px;
            color: #ffcc00;
            text-shadow: 0 0 20px rgba(255, 204, 0, 0.5);
          }
          .select-btn {
            display: block;
            width: 300px;
            margin: 20px auto;
            padding: 25px 40px;
            font-size: 24px;
            border: none;
            border-radius: 15px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: bold;
          }
          .display-btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          .display-btn:hover {
            transform: scale(1.05);
            box-shadow: 0 10px 30px rgba(102, 126, 234, 0.5);
          }
          .controller-btn {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
          }
          .controller-btn:hover {
            transform: scale(1.05);
            box-shadow: 0 10px 30px rgba(245, 87, 108, 0.5);
          }
          .room-input-container {
            margin-top: 30px;
          }
          .room-input {
            padding: 15px 25px;
            font-size: 24px;
            border: 3px solid #ffcc00;
            border-radius: 10px;
            background: rgba(255, 255, 255, 0.1);
            color: white;
            text-align: center;
            width: 200px;
            text-transform: uppercase;
          }
          .room-input::placeholder {
            color: rgba(255, 255, 255, 0.5);
          }
          .connect-btn {
            margin-top: 15px;
            padding: 15px 40px;
            font-size: 20px;
            background: #ffcc00;
            color: #000;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            font-weight: bold;
          }
          .connect-btn:hover {
            background: #ffd633;
          }
          .connect-btn:disabled {
            background: #666;
            cursor: not-allowed;
          }
          .or-divider {
            margin: 30px 0;
            color: rgba(255, 255, 255, 0.5);
            font-size: 18px;
          }
        `}</style>
        <div className="select-container">
          <h1 className="select-title">🎰 ルーレット</h1>

          <button className="select-btn display-btn" onClick={startDisplayMode}>
            📺 ディスプレイモード
            <br />
            <span style={{ fontSize: "14px", fontWeight: "normal" }}>（PC側・QRコード表示）</span>
          </button>

          <div className="or-divider">― または ―</div>

          <div className="room-input-container">
            <input
              type="text"
              className="room-input"
              placeholder="ルームID"
              value={inputRoomId}
              onChange={(e) => setInputRoomId(e.target.value.toUpperCase())}
              maxLength={6}
            />
            <br />
            <button
              className="connect-btn"
              onClick={startControllerMode}
              disabled={inputRoomId.length < 4}
            >
              📱 コントローラーとして接続
            </button>
          </div>
        </div>
      </>
    );
  }

  // ルーレット画面（ディスプレイ・コントローラー共通）
  return (
    <>
      <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
          height: 100vh;
          width: 100vw;
          overflow: hidden;
          display: flex;
          justify-content: center;
          align-items: center;
          color: white;
          font-family: Arial, sans-serif;
          text-align: center;
        }
        .background-video {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          z-index: -1;
        }
        .content {
          position: relative;
          z-index: 1;
        }
        .roulette-container {
          position: relative;
          width: 1900px;
          height: 1900px;
          margin: 20px auto;
          cursor: pointer;
        }
        .roulette {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background-color: white;
          background-image: url('/roulette/roulette1.png');
          background-size: cover;
          background-position: center;
          transform: rotate(0deg);
          cursor: pointer;
        }
        .pointer {
          position: absolute;
          top: -99px;
          left: 50%;
          width: 0;
          height: 0;
          border-left: 60px solid transparent;
          border-right: 60px solid transparent;
          border-top: 132px solid black;
          transform: translateX(-50%);
        }
        .pointer::after {
          content: '';
          position: absolute;
          top: -129px;
          left: -48px;
          width: 0;
          height: 0;
          border-left: 48px solid transparent;
          border-right: 48px solid transparent;
          border-top: 120px solid yellow;
        }
        .result-container {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) scale(0);
          width: 300px;
          height: 300px;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: rgba(0, 0, 0, 0.8);
          border-radius: 20px;
          z-index: 10;
          transition: transform 0.5s ease;
        }
        .result-container.animate {
          animation: zoomInWobbleOut 7s ease-in-out forwards;
        }
        @keyframes zoomInWobbleOut {
          0% { transform: translate(-50%, -50%) scale(0); }
          20% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.05); }
          70% { transform: translate(-50%, -50%) scale(0.95); }
          90% { transform: translate(-50%, -50%) scale(1); }
          100% { transform: translate(-50%, -50%) scale(0); }
        }
        .result-image {
          max-width: 400%;
          max-height: 400%;
          border-radius: 10px;
          background-color: transparent;
        }
        .casino-sign {
          position: absolute;
          top: 500px;
          left: 50%;
          transform: translate(-50%, -50%) scale(0);
          width: 3000px;
          height: 200px;
          background: #14133d;
          border: 12px solid #ffcc00;
          border-radius: 50px;
          box-shadow: 0 0 30px #ffcc00, inset 0 0 20px #ffcc00;
          overflow: hidden;
          z-index: 10;
          opacity: 0;
          transition: transform 0.5s ease, opacity 0.5s ease;
        }
        .casino-sign.visible {
          transform: translate(-50%, -50%) scale(1);
          opacity: 1;
        }
        .scroll-text {
          position: absolute;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: left;
          align-items: center;
          white-space: nowrap;
          overflow: hidden;
          z-index: 4;
        }
        .scroll-text span {
          font-size: 150px;
          font-weight: bold;
          color: #fff;
          text-shadow: 0 0 10px #ffcc00, 0 0 20px #ff9900;
          animation: scroll 45s linear infinite;
          white-space: pre;
        }
        @keyframes scroll {
          0% { transform: translateX(20%); }
          100% { transform: translateX(-100%); }
        }
        .connection-status {
          position: fixed;
          top: 10px;
          right: 10px;
          padding: 8px 15px;
          border-radius: 8px;
          font-size: 14px;
          z-index: 100;
          font-weight: bold;
        }
        .connection-status.connected {
          background: rgba(0, 255, 0, 0.3);
          color: #0f0;
        }
        .connection-status.connecting {
          background: rgba(255, 255, 0, 0.3);
          color: #ff0;
        }
        .connection-status.disconnected {
          background: rgba(255, 0, 0, 0.3);
          color: #f00;
        }
        .spin-hint {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 24px;
          color: rgba(255, 255, 255, 0.7);
          z-index: 5;
          pointer-events: none;
        }
        .qr-overlay {
          position: fixed;
          top: 10px;
          left: 10px;
          background: white;
          padding: 15px;
          border-radius: 15px;
          z-index: 100;
          text-align: center;
        }
        .qr-title {
          color: #333;
          font-size: 14px;
          margin-bottom: 10px;
          font-weight: bold;
        }
        .room-id-display {
          color: #333;
          font-size: 24px;
          font-weight: bold;
          margin-top: 10px;
          letter-spacing: 3px;
        }
        .audio-enable-btn {
          position: fixed;
          top: 50px;
          right: 10px;
          padding: 15px 25px;
          font-size: 18px;
          background: rgba(255, 204, 0, 0.9);
          color: #000;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          z-index: 100;
          font-weight: bold;
          box-shadow: 0 0 15px rgba(255, 204, 0, 0.5);
          animation: pulse 2s infinite;
        }
        .audio-enable-btn:hover {
          background: rgba(255, 220, 50, 1);
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        /* スマホ用レスポンシブ */
        @media screen and (max-width: 768px) {
          .roulette-container {
            width: 90vw;
            height: 90vw;
            margin: 10px auto;
          }
          .pointer {
            top: -30px;
            border-left: 20px solid transparent;
            border-right: 20px solid transparent;
            border-top: 44px solid black;
          }
          .pointer::after {
            top: -43px;
            left: -16px;
            border-left: 16px solid transparent;
            border-right: 16px solid transparent;
            border-top: 40px solid yellow;
          }
          .result-container {
            width: 150px;
            height: 150px;
          }
          .result-image {
            max-width: 300%;
            max-height: 300%;
          }
          .casino-sign {
            top: 60%;
            width: 95vw;
            height: 60px;
            border: 4px solid #ffcc00;
            border-radius: 15px;
          }
          .scroll-text span {
            font-size: 40px;
          }
          .spin-hint {
            font-size: 16px;
            bottom: 10px;
          }
          .connection-status {
            font-size: 10px;
            padding: 5px 8px;
          }
          .qr-overlay {
            display: none;
          }
          .audio-enable-btn {
            padding: 10px 20px;
            font-size: 14px;
          }
        }

        @media screen and (max-width: 480px) {
          .roulette-container {
            width: 95vw;
            height: 95vw;
            margin: 5px auto;
          }
          .pointer {
            top: -25px;
            border-left: 15px solid transparent;
            border-right: 15px solid transparent;
            border-top: 35px solid black;
          }
          .pointer::after {
            top: -34px;
            left: -12px;
            border-left: 12px solid transparent;
            border-right: 12px solid transparent;
            border-top: 32px solid yellow;
          }
          .result-container {
            width: 120px;
            height: 120px;
          }
          .result-image {
            max-width: 250%;
            max-height: 250%;
          }
          .casino-sign {
            height: 50px;
          }
          .scroll-text span {
            font-size: 30px;
          }
          .spin-hint {
            font-size: 14px;
          }
        }
      `}</style>

      <audio ref={beepRef} src="/roulette/beep.wav" preload="auto" />
      <audio ref={resultEffectRef} src="/roulette/result_effect.mp3" preload="auto" />

      <video className="background-video" autoPlay loop muted playsInline>
        <source src="/roulette/background.mp4" type="video/mp4" />
      </video>

      {/* 接続状態 */}
      <div className={`connection-status ${connectionStatus}`}>
        {connectionStatus === "connected" && "✓ 接続済"}
        {connectionStatus === "connecting" && "⏳ 接続中..."}
        {connectionStatus === "disconnected" && (mode === "display" ? "📡 待機中" : "✗ 未接続")}
      </div>

      {/* QRコード表示（ディスプレイモードのみ） */}
      {mode === "display" && roomId && (
        <div className="qr-overlay">
          <div className="qr-title">スマホでスキャン</div>
          <QRCodeSVG value={qrUrl} size={150} />
          <div className="room-id-display">{roomId}</div>
        </div>
      )}

      {/* 音声有効化ボタン */}
      {!audioEnabled && (
        <button className="audio-enable-btn" onClick={enableAudio}>
          🔊 音声ON
        </button>
      )}

      {/* ルーレット */}
      <div className="content" onClick={handleClick}>
        <div className="roulette-container">
          <div className="roulette" ref={rouletteRef}></div>
          <div className="pointer"></div>
        </div>

        <div className={`casino-sign ${isScrollTextVisible ? "visible" : ""}`}>
          <div className="scroll-text">
            <span>{scrollMessages.join("           ")}</span>
          </div>
        </div>

        <div className={`result-container ${showResult ? "animate" : ""}`}>
          {resultImage && <img src={resultImage} alt="結果画像" className="result-image" />}
        </div>
      </div>

      {!isSpinning && (
        <div className="spin-hint">
          {mode === "controller" ? "画面タップでスピン" : "画面クリック または Enterキーでスピン"}
        </div>
      )}
    </>
  );
}
