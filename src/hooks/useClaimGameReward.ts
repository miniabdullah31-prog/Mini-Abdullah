import { useEffect, useRef } from "react";
import { claimReward } from "../services/rewardsService";

/** Award coins once when a game level is cleared. Server rejects duplicates. */
export function useClaimGameReward(
  gameId: string,
  level: number,
  won: boolean,
) {
  const lastKey = useRef("");

  useEffect(() => {
    if (!won) {
      return;
    }
    const key = `${gameId}:L${level}`;
    if (lastKey.current === key) {
      return;
    }
    lastKey.current = key;
    claimReward("game", key).catch(() => {
      if (lastKey.current === key) {
        lastKey.current = "";
      }
    });
  }, [won, gameId, level]);
}
