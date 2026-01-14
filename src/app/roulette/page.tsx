"use client";

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

// WebSocket URL - 本番環境に合わせて変更してください
const WS_URL = typeof window !== "undefined"
  ? `ws://${window.location.hostname}:8080`
  : "ws://localhost:8080";

export default function RoulettePage() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [resultImage, setResultImage] = useState<string>("");
  const [isScrollTextVisible, setIsScrollTextVisible] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);

  const rouletteRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const beepRef = useRef<HTMLAudioElement | null>(null);
  const resultEffectRef = useRef<HTMLAudioElement | null>(null);
  const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<number | null>(null);
  const isSpinningRef = useRef(false);
  const currentRotationRef = useRef(0);

  // 音声を有効化（ブラウザの自動再生ポリシー対策）
  const enableAudio = useCallback(() => {
    if (audioEnabled) return;

    // 無音で再生して音声コンテキストを有効化
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
    console.log("Audio enabled");
  }, [audioEnabled]);

  // イージング関数
  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

  // スクロールテキスト表示
  const showScrollText = useCallback(() => {
    setIsScrollTextVisible(true);
  }, []);

  // スクロールテキスト非表示
  const hideScrollText = useCallback(() => {
    setIsScrollTextVisible(false);
  }, []);

  // 非操作タイマーリセット
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }
    if (!isScrollTextVisible) {
      inactivityTimeoutRef.current = setTimeout(() => {
        showScrollText();
      }, 30000);
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

  // ルーレット回転アニメーション
  const spinRoulette = useCallback((spinDuration: number, finalRotation: number, fromRemote = false) => {
    if (isSpinningRef.current && !fromRemote) return;

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

      // ビープ音
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
        // 回転完了
        const finalAngle = newRotation % 360;
        const sectorIndex = Math.floor((360 - finalAngle) / sectorAngle) % sectors.length;

        isSpinningRef.current = false;
        setIsSpinning(false);
        showResultDisplay(sectorIndex);

        // WebSocketに完了を通知
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: "spinComplete",
            currentRotation: newRotation,
          }));
        }
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [hideScrollText, showResultDisplay]);

  // スピンをトリガー
  const triggerSpin = useCallback(() => {
    if (isSpinningRef.current) return;

    const spinDuration = Math.random() * 8000 + 11000;
    const finalRotation = currentRotationRef.current + 360 * 5 + Math.random() * 360;

    // WebSocketで他のクライアントに通知
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "spin",
        spinDuration,
        finalRotation,
      }));
    }

    // ローカルでもスピン開始
    spinRoulette(spinDuration, finalRotation);
  }, [spinRoulette]);

  // WebSocket接続
  useEffect(() => {
    const connectWebSocket = () => {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connected");
        setWsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("Received:", data.type);

          switch (data.type) {
            case "spin":
              // 他のクライアントからのスピン（リモートからは常に受け付ける）
              console.log("Remote spin received, starting spin...");
              spinRoulette(data.spinDuration, data.finalRotation, true);
              break;
            case "sync":
              // 初期同期
              if (data.state.currentRotation) {
                currentRotationRef.current = data.state.currentRotation;
                if (rouletteRef.current) {
                  rouletteRef.current.style.transform = `rotate(${data.state.currentRotation}deg)`;
                }
              }
              break;
            case "spinComplete":
              // 他クライアントの完了通知
              currentRotationRef.current = data.currentRotation;
              break;
          }
        } catch (e) {
          console.error("Error parsing message:", e);
        }
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected");
        setWsConnected(false);
        // 再接続を試みる
        setTimeout(connectWebSocket, 3000);
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
    };
  }, [spinRoulette]);

  // キーボードイベント
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        triggerSpin();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [triggerSpin]);

  // クリックイベント
  const handleClick = useCallback(() => {
    enableAudio(); // クリック時に音声を有効化
    triggerSpin();
  }, [enableAudio, triggerSpin]);

  // 画面タッチ/クリックで音声有効化（リモートスピン用）
  useEffect(() => {
    const handleInteraction = () => {
      enableAudio();
    };

    window.addEventListener("click", handleInteraction, { once: false });
    window.addEventListener("touchstart", handleInteraction, { once: false });
    window.addEventListener("keydown", handleInteraction, { once: false });

    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
    };
  }, [enableAudio]);

  // 初期タイマー設定
  useEffect(() => {
    resetInactivityTimer();
  }, [resetInactivityTimer]);

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
          padding: 5px 10px;
          border-radius: 5px;
          font-size: 12px;
          z-index: 100;
        }

        .connection-status.connected {
          background: rgba(0, 255, 0, 0.3);
          color: #0f0;
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

        /* スマホ用レスポンシブ（横幅768px以下） */
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
            padding: 3px 6px;
          }
        }

        /* さらに小さいスマホ（横幅480px以下） */
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

          .audio-enable-btn {
            padding: 10px 20px;
            font-size: 14px;
          }
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
      `}</style>

      {/* Audio elements */}
      <audio ref={beepRef} src="/roulette/beep.wav" preload="auto" />
      <audio ref={resultEffectRef} src="/roulette/result_effect.mp3" preload="auto" />

      {/* 背景動画 */}
      <video className="background-video" autoPlay loop muted playsInline>
        <source src="/roulette/background.mp4" type="video/mp4" />
      </video>

      {/* WebSocket接続状態 */}
      <div className={`connection-status ${wsConnected ? "connected" : "disconnected"}`}>
        {wsConnected ? "Connected" : "Disconnected"}
      </div>

      {/* 音声有効化ボタン（未有効の場合のみ表示） */}
      {!audioEnabled && (
        <button className="audio-enable-btn" onClick={enableAudio}>
          🔊 音声ON
        </button>
      )}

      {/* ページのコンテンツ */}
      <div className="content" onClick={handleClick}>
        {/* ルーレット */}
        <div className="roulette-container">
          <div className="roulette" ref={rouletteRef}></div>
          <div className="pointer"></div>
        </div>

        {/* カジノ看板 */}
        <div className={`casino-sign ${isScrollTextVisible ? "visible" : ""}`}>
          <div className="scroll-text">
            <span>{scrollMessages.join("           ")}</span>
          </div>
        </div>

        {/* 結果画像表示用 */}
        <div className={`result-container ${showResult ? "animate" : ""}`}>
          {resultImage && (
            <img src={resultImage} alt="結果画像" className="result-image" />
          )}
        </div>
      </div>

      {/* スピンのヒント */}
      {!isSpinning && (
        <div className="spin-hint">
          画面をクリック または Enterキーでスピン
        </div>
      )}
    </>
  );
}
