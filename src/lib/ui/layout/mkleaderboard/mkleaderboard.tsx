"use client";

import React, { useState } from 'react'
import useInterval from 'use-interval';
import { MkLeaderBoardTable } from "./mkleaderboard-table";
import './arcade.css';

export function MkLeaderBoard({onethree_result, twofive_result, tournament_result}: {onethree_result: Array<any>, twofive_result: Array<any>, tournament_result: Array<any>}) {
    const [counter, setCount] = useState(0)
    useInterval(() => {
      const count = counter > 5 ? 0 : counter + 1
      setCount(count);
    }, 5000);

    if (counter > 2) {
        // トナメリーダーボード
        const index = (counter - 3) * 5
        return (
          <div className="crt-screen grid-bg" style={{
            width: '100vw',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            backgroundImage: `url("/logo.jpg")`,
            backgroundBlendMode: "darken",
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            backgroundPosition: "center",
            backgroundSize: "cover"
          }}>
            {/* オーバーレイ */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.9), rgba(128,0,128,0.4), rgba(0,0,0,0.9))'
            }} />

            {/* メインコンテンツ */}
            <div style={{
              position: 'relative',
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              padding: '2rem'
            }}>
              {/* タイトル */}
              <div style={{textAlign: 'center', marginBottom: '1rem', flexShrink: 0}}>
                <h1 className="pixel-text" style={{
                  fontSize: 'clamp(2rem, 5vw, 5rem)',
                  color: '#00FFFF',
                  textShadow: '0 0 20px #00FFFF, 0 0 40px #FF00FF, 4px 4px 0 #000',
                  animation: 'glitch 5s infinite',
                  margin: 0,
                  lineHeight: 1.2
                }}>
                  MUSAPO-KANDA
                </h1>
                <div className="arcade-header pixel-text" style={{
                  fontSize: 'clamp(1.5rem, 3vw, 3rem)',
                  color: '#FFD700',
                  textShadow: '0 0 20px #FFD700, 2px 2px 0 #000',
                  marginTop: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  display: 'inline-block'
                }}>
                  トナメリーダーボード
                </div>
              </div>

              {/* テーブル */}
              <div style={{flex: 1, display: 'flex', justifyContent: 'center', minHeight: 0}}>
                <div className="neon-border" style={{
                  background: 'rgba(0, 0, 0, 0.8)',
                  backdropFilter: 'blur(10px)',
                  padding: '2rem',
                  borderRadius: '8px',
                  width: '100%',
                  maxWidth: '1400px',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <table className="pixel-text" style={{
                    width: '100%',
                    height: '100%',
                    tableLayout: 'fixed',
                    borderCollapse: 'separate',
                    borderSpacing: 0
                  }}>
                    <tbody style={{height: '100%', display: 'table', width: '100%'}}>
                      <MkLeaderBoardTable params={tournament_result.slice(index, index + 5)} counter={index} />
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 装飾 */}
              <div className="pixel-text" style={{
                position: 'absolute',
                top: '1rem',
                left: '1rem',
                color: '#0FF',
                fontSize: 'clamp(0.75rem, 1.5vw, 1rem)'
              }}>
                ▲▼◀▶ ARCADE MODE
              </div>
              <div className="pixel-text" style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                color: '#0FF',
                fontSize: 'clamp(0.75rem, 1.5vw, 1rem)'
              }}>
                {counter - 2}/3 ●●●
              </div>
            </div>
          </div>
        )
    } else {
        // リングリーダーボード (1-3-3 と 2-5-5)
        const index = counter * 5

        return (
          <div className="crt-screen grid-bg" style={{
            width: '100vw',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            backgroundImage: `url("/logo.jpg")`,
            backgroundBlendMode: "darken",
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            backgroundPosition: "center",
            backgroundSize: "cover"
          }}>
            {/* オーバーレイ */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.9), rgba(0,128,128,0.4), rgba(0,0,0,0.9))'
            }} />

            {/* メインコンテンツ */}
            <div style={{
              position: 'relative',
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              padding: '2rem'
            }}>
              {/* タイトル */}
              <div style={{textAlign: 'center', marginBottom: '1rem', flexShrink: 0}}>
                <h1 className="pixel-text" style={{
                  fontSize: 'clamp(2rem, 5vw, 5rem)',
                  color: '#00FFFF',
                  textShadow: '0 0 20px #00FFFF, 0 0 40px #FF00FF, 4px 4px 0 #000',
                  animation: 'glitch 5s infinite',
                  margin: 0,
                  lineHeight: 1.2
                }}>
                  MUSAPO-KANDA
                </h1>
                <div className="arcade-header pixel-text" style={{
                  fontSize: 'clamp(1.5rem, 3vw, 3rem)',
                  color: '#FFD700',
                  textShadow: '0 0 20px #FFD700, 2px 2px 0 #000',
                  marginTop: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  display: 'inline-block'
                }}>
                  リングリーダーボード
                </div>
              </div>

              {/* 2列のテーブル */}
              <div style={{
                flex: 1,
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '2rem',
                minHeight: 0
              }}>
                {/* 1-3-3 */}
                <div style={{display: 'flex', flexDirection: 'column', minHeight: 0}}>
                  <div className="arcade-header pixel-text" style={{
                    fontSize: 'clamp(1.2rem, 3vw, 3rem)',
                    color: '#FF1493',
                    textShadow: '0 0 20px #FF1493, 2px 2px 0 #000',
                    textAlign: 'center',
                    padding: '0.75rem 1.5rem',
                    marginBottom: '0.5rem',
                    flexShrink: 0
                  }}>
                    1-3-3
                  </div>
                  <div className="neon-border" style={{
                    flex: 1,
                    background: 'rgba(0, 0, 0, 0.8)',
                    backdropFilter: 'blur(10px)',
                    padding: '1.5rem',
                    borderRadius: '8px',
                    borderColor: '#FF1493',
                    boxShadow: '0 0 10px #FF1493, 0 0 20px #FF1493, inset 0 0 10px #FF1493',
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 0
                  }}>
                    <table className="pixel-text" style={{
                      width: '100%',
                      height: '100%',
                      tableLayout: 'fixed',
                      borderCollapse: 'separate',
                      borderSpacing: 0
                    }}>
                      <tbody style={{height: '100%', display: 'table', width: '100%'}}>
                        <MkLeaderBoardTable params={onethree_result.slice(index, index + 5)} counter={index} />
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 2-5-5 */}
                <div style={{display: 'flex', flexDirection: 'column', minHeight: 0}}>
                  <div className="arcade-header pixel-text" style={{
                    fontSize: 'clamp(1.2rem, 3vw, 3rem)',
                    color: '#00FF00',
                    textShadow: '0 0 20px #00FF00, 2px 2px 0 #000',
                    textAlign: 'center',
                    padding: '0.75rem 1.5rem',
                    marginBottom: '0.5rem',
                    flexShrink: 0
                  }}>
                    2-5-5
                  </div>
                  <div className="neon-border" style={{
                    flex: 1,
                    background: 'rgba(0, 0, 0, 0.8)',
                    backdropFilter: 'blur(10px)',
                    padding: '1.5rem',
                    borderRadius: '8px',
                    borderColor: '#00FF00',
                    boxShadow: '0 0 10px #00FF00, 0 0 20px #00FF00, inset 0 0 10px #00FF00',
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 0
                  }}>
                    <table className="pixel-text" style={{
                      width: '100%',
                      height: '100%',
                      tableLayout: 'fixed',
                      borderCollapse: 'separate',
                      borderSpacing: 0
                    }}>
                      <tbody style={{height: '100%', display: 'table', width: '100%'}}>
                        <MkLeaderBoardTable params={twofive_result.slice(index, index + 5)} counter={index}/>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* 装飾 */}
              <div className="pixel-text" style={{
                position: 'absolute',
                top: '1rem',
                left: '1rem',
                color: '#0FF',
                fontSize: 'clamp(0.75rem, 1.5vw, 1rem)'
              }}>
                ▲▼◀▶ ARCADE MODE
              </div>
              <div className="pixel-text" style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                color: '#0FF',
                fontSize: 'clamp(0.75rem, 1.5vw, 1rem)'
              }}>
                {counter + 1}/3 ●●●
              </div>
            </div>
          </div>
        )
    }
}
