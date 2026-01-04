"use client";

import { MkLeaderBoard } from "@/ui/layout/mkleaderboard";
import { useEffect, useState } from "react";

export default function Page() {
  const [data, setData] = useState<{
    onethree_result: any[];
    twofive_result: any[];
    tournament_result: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const API_URL_RING = 'https://script.google.com/macros/s/AKfycbyJ8vrykgYN6CVplB-nV9kOq6MvyMXPRA2UNB3XFrin9FQnncqQkWEwvq4WqR8yX42Bdg/exec';
        const ring_response = await fetch(API_URL_RING);
        const ring_data = await ring_response.json();
        const onethree_result = ring_data.filter((e: any) => e.rate === '1-3');
        const twofive_result = ring_data.filter((e: any) => e.rate === '2-5');

        const API_URL_TOUR = 'https://script.google.com/macros/s/AKfycbzl-DRSM-NLRxFs4GsS_5p2WqodRO_AUL6qg6D_nOVWRia8F23bu_S6M2ksDrR1Katw-g/exec';
        const tournament_response = await fetch(API_URL_TOUR);
        const tournament_result = await tournament_response.json();

        setData({ onethree_result, twofive_result, tournament_result });
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch leaderboard data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(to bottom, #000000, #1a001a)',
        color: '#00FFFF',
        fontSize: '2rem',
        fontFamily: 'monospace'
      }}>
        Loading...
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(to bottom, #000000, #1a001a)',
        color: '#FF0000',
        fontSize: '2rem',
        fontFamily: 'monospace'
      }}>
        Failed to load data
      </div>
    );
  }

  return (
    <MkLeaderBoard
      onethree_result={data.onethree_result}
      twofive_result={data.twofive_result}
      tournament_result={data.tournament_result}
    />
  );
}
