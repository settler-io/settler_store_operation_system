"use client";

export function MkLeaderBoardTable({params, counter}: {params: Array<any>, counter: number}) {
  // ランキングに応じたスタイル
  const getRankStyle = (rank: number) => {
    if (rank === 1) return {
      color: '#FFD700',
      textShadow: '0 0 10px #FFD700, 0 0 20px #FFD700, 0 0 30px #FFD700, 2px 2px 0 #000',
      badge: '👑'
    };
    if (rank === 2) return {
      color: '#C0C0C0',
      textShadow: '0 0 10px #C0C0C0, 0 0 20px #C0C0C0, 2px 2px 0 #000',
      badge: '🥈'
    };
    if (rank === 3) return {
      color: '#CD7F32',
      textShadow: '0 0 10px #CD7F32, 0 0 20px #CD7F32, 2px 2px 0 #000',
      badge: '🥉'
    };
    return {
      color: '#00FFFF',
      textShadow: '0 0 5px #00FFFF, 0 0 10px #00FFFF, 2px 2px 0 #000',
      badge: '★'
    };
  };

  const getRankBg = (rank: number) => {
    if (rank === 1) return "linear-gradient(90deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 215, 0, 0.05) 100%)";
    if (rank === 2) return "linear-gradient(90deg, rgba(192, 192, 192, 0.2) 0%, rgba(192, 192, 192, 0.05) 100%)";
    if (rank === 3) return "linear-gradient(90deg, rgba(205, 127, 50, 0.2) 0%, rgba(205, 127, 50, 0.05) 100%)";
    return "linear-gradient(90deg, rgba(0, 255, 255, 0.1) 0%, rgba(0, 255, 255, 0.02) 100%)";
  };

  return (
    <>
      {params.map((row, index) => {
        const rank = counter + index + 1;
        const rankStyle = getRankStyle(rank);
        const rankBg = getRankBg(rank);

        return (
          <tr
            key={index}
            className="arcade-row"
            style={{
              background: rankBg,
              borderBottom: '2px solid rgba(0, 255, 255, 0.3)',
              height: `${100 / params.length}%`
            }}
          >
            {/* 順位 */}
            <td style={{
              width: '25%',
              verticalAlign: 'middle',
              padding: '0.5rem 1rem',
              whiteSpace: 'nowrap'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                gap: '0.75rem'
              }}>
                <span style={{
                  fontSize: 'clamp(1.5rem, 3vw, 3rem)',
                  lineHeight: 1
                }}>{rankStyle.badge}</span>
                <span className="pixel-text" style={{
                  fontSize: 'clamp(2rem, 4vw, 4.5rem)',
                  fontWeight: 'bold',
                  color: rankStyle.color,
                  textShadow: rankStyle.textShadow,
                  lineHeight: 1
                }}>
                  {rank}位
                </span>
              </div>
            </td>

            {/* 名前 */}
            <td style={{
              width: '45%',
              verticalAlign: 'middle',
              padding: '0.5rem 1.5rem'
            }}>
              <div className="pixel-text" style={{
                fontSize: 'clamp(1.5rem, 3.5vw, 4rem)',
                fontWeight: 'bold',
                color: '#FFFFFF',
                textShadow: '0 0 10px rgba(255,255,255,0.8), 0 0 20px rgba(0,255,255,0.5), 2px 2px 0 #000',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                lineHeight: 1.2,
                letterSpacing: '0.05em'
              }}>
                {row['name']}
              </div>
            </td>

            {/* ポイント */}
            <td style={{
              width: '30%',
              verticalAlign: 'middle',
              padding: '0.5rem 1rem',
              textAlign: 'right'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '0.5rem'
              }}>
                <span className="pixel-text" style={{
                  fontSize: 'clamp(2rem, 4vw, 4.5rem)',
                  fontWeight: 'bold',
                  color: rank <= 3 ? '#FFD700' : '#00FF00',
                  textShadow: rank <= 3
                    ? '0 0 10px #FFD700, 0 0 20px #FFD700, 0 0 30px #FFD700, 2px 2px 0 #000'
                    : '0 0 10px #00FF00, 0 0 20px #00FF00, 0 0 30px #00FF00, 2px 2px 0 #000',
                  lineHeight: 1
                }}>
                  {row['points']}
                </span>
                <span className="pixel-text" style={{
                  fontSize: 'clamp(1rem, 2vw, 2rem)',
                  fontWeight: 'bold',
                  color: '#FFFFFF',
                  textShadow: '0 0 5px rgba(255,255,255,0.5), 1px 1px 0 #000',
                  lineHeight: 1
                }}>
                  ポイント
                </span>
              </div>
            </td>
          </tr>
        );
      })}
    </>
  )
}
