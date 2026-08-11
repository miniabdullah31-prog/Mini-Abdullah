import { useCallback, useRef } from 'react';
import { Platform, ScrollView } from 'react-native';

/**
 * Scroll a focused form field into view above the soft keyboard.
 * Pair with windowSoftInputMode=adjustResize and KeyboardAvoidingView.
 */
export function useFormScroll(topPadding = 20) {
  const scrollRef = useRef<ScrollView>(null);
  const cardOffset = useRef(0);
  const fieldOffsets = useRef<Record<string, number>>({});

  const onCardLayout = useCallback((y: number) => {
    cardOffset.current = y;
  }, []);

  const registerField = useCallback((key: string, y: number) => {
    fieldOffsets.current[key] = y;
  }, []);

  const scrollToField = useCallback(
    (key: string) => {
      const fieldY = fieldOffsets.current[key];
      if (fieldY == null) {
        return;
      }
      const targetY = Math.max(0, cardOffset.current + fieldY - topPadding);
      const delay = Platform.OS === 'android' ? 280 : 100;
      setTimeout(() => {
        scrollRef.current?.scrollTo({ y: targetY, animated: true });
      }, delay);
    },
    [topPadding],
  );

  return { scrollRef, onCardLayout, registerField, scrollToField };
}
