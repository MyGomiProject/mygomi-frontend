import { useState, useEffect } from 'react';

/**
 * @param value 지연시킬 입력값 (예: 검색어)
 * @param delay 지연 시간 (ms 단위, 보통 300ms를 권장합니다)
 */
export function useDebounce<T>(value: T, delay: number): T {
  // 1. 지연된 값을 저장할 내부 상태를 만듭니다.
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // 2. 입력값이 바뀔 때마다 타이머를 설정합니다.
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // 3. 만약 delay 시간 안에 값이 또 바뀌면(타이핑 중이라면) 이전 타이머를 취소합니다.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // value나 delay가 바뀔 때마다 실행됩니다.

  return debouncedValue;
}