"use client";

import React, { useState } from 'react'
import useInterval from 'use-interval';
import { MkLeaderBoardTable } from "./mkleaderboard-table";

export function MkLeaderBoard({onethree_result, twofive_result, tournament_result}: {onethree_result: Array<any>, twofive_result: Array<any>, tournament_result: Array<any>}) {
    const [counter, setCount] = useState(0)
    useInterval(() => {
      const count = counter > 5 ? 0 : counter + 1
      setCount(count);
    }, 5000);
    if (counter > 2) {
        const index = (counter -3) * 5
        return (
            <div style={{textShadow: "1px 1px 2px black", paddingTop: "100px", height: "1200px", backgroundImage: `url("/logo.jpg")`, backgroundColor: 'rgba(0, 0, 0, 0.95)', backgroundBlendMode: "darken", backgroundPosition: "360px"}}>
            <div style={{verticalAlign: "top", textAlign: "center", fontSize: "120px", color:'rgba(255, 255, 255)'}}>
                MUSAPO-KANDA<br/><br/><br/><br/><br/><br/>
                トナメリーダーボード
            </div>  
            
            <div style={{display: "inline-block", verticalAlign: "top", paddingLeft: "10%", paddingRight: "30%px", paddingTop: "12%"}}>
            <table style={{display: "inline-block", verticalAlign: "top", fontSize: "32px", color:'rgba(255, 255, 255)'}}>
              <tbody>
                <MkLeaderBoardTable params={tournament_result.slice(index, index + 5)} counter={index} />
              </tbody>
            </table>
            </div>
            </div>
          )
    } else {
        const index = counter * 5
    
        return (
            <div style={{textShadow: "1px 1px 2px black", paddingTop: "100px", height: "1200px", backgroundImage: `url("/logo.jpg")`, backgroundColor: 'rgba(0, 0, 0, 0.95)', backgroundBlendMode: "darken", backgroundPosition: "360px"}}>
            <div style={{verticalAlign: "top", textAlign: "center", fontSize: "120px", color:'rgba(255, 255, 255)'}}>
                MUSAPO-KANDA<br/><br/><br/><br/><br/><br/>
                リングリーダーボード
              </div>  
            
            <div style={{display: "inline-block", verticalAlign: "top", paddingLeft: "10%", paddingRight: "30%px", paddingTop: "12%"}}>
            <p style={{fontSize: "72px", paddingBottom: "80px", paddingLeft: "240px", color:'rgba(255, 255, 255)'}}>1-3-3</p>
            <table style={{display: "inline-block", verticalAlign: "top", fontSize: "32px", color:'rgba(255, 255, 255)'}}>
              <tbody>
                <MkLeaderBoardTable params={onethree_result.slice(index, index + 5)} counter={index} />
              </tbody>
            </table>
            
            </div>
            
            <div style={{display: "inline-block", verticalAlign: "top", paddingTop: "12%", paddingLeft:"320px"}}>
            <p style={{fontSize: "72px", paddingBottom: "80px", paddingLeft: "200px", color:'rgba(255, 255, 255)'}}>2-5-5</p>
            <table style={{display: "inline-block", verticalAlign: "top", fontSize: "32px", color:'rgba(255, 255, 255)'}}>
              <tbody>
                <MkLeaderBoardTable params={twofive_result.slice(index, index + 5)} counter={index}/>
              </tbody>
             
            </table>
            </div>
            </div>
              )
        }
} 
