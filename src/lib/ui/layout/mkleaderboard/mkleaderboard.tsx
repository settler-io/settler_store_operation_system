"use client";

import React, { useState } from 'react'
import useInterval from 'use-interval';
import { MkLeaderBoardTable } from "./mkleaderboard-table";
import './arcade.css';

export function MkLeaderBoard({onethree_result, twofive_result, tournament_result}: {onethree_result: Array<any>, twofive_result: Array<any>, tournament_result: Array<any>}) {
    const [counter, setCount] = useState(0)
    useInterval(() => {
      const count = counter >= 12 ? 0 : counter + 1
      setCount(count);
    }, 5000);

    if (counter >= 8) {
        // トナメリーダーボード
        const index = (counter - 8) * 5
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
                  padding: '1.3rem 0.75rem',
                  display: 'inline-block'
                }}>
                  トナメリーダーボード
                </div>
              </div>

              {/* テーブル */}
              <div style={{flex: 1, display: 'flex', justifyContent: 'center', minHeight: 0}}>
                <div className="neon-border" style={{
                  background: 'rgba(0, 0, 0, 0.8)',
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
    } else if (counter >= 4) {
        // 2-5-5
        const index = (counter - 4) * 5
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
                  padding: '1.0rem 0.75rem',
                  display: 'inline-block'
                }}>
                  2-5-5
                </div>
              </div>

              {/* テーブル */}
              <div style={{flex: 1, display: 'flex', justifyContent: 'center', minHeight: 0}}>
                <div className="neon-border" style={{
                  background: 'rgba(0, 0, 0, 0.8)',
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
                        <MkLeaderBoardTable params={twofive_result.slice(index, index + 5)} counter={index}/>
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
        // 1-3-3
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
                  padding: '1.0rem 0.75rem',
                  display: 'inline-block'
                }}>
                  1-3-3
                </div>
              </div>

              {/* テーブル */}
              <div style={{flex: 1, display: 'flex', justifyContent: 'center', minHeight: 0}}>
                <div className="neon-border" style={{
                  background: 'rgba(0, 0, 0, 0.8)',
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
                        <MkLeaderBoardTable params={onethree_result.slice(index, index + 5)} counter={index}/>
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
    }
}
