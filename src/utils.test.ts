/// <reference types="vitest/globals" />
import { act, renderHook, waitFor } from '@testing-library/react';
import { useResetableActionState } from './utils.js';
import { startTransition } from 'react';

test('reset function sets state back to initialState', async () => {
  const initialState = { count: 0 };
  const action = async (
    state: typeof initialState,
    payload: { amount: number },
  ) => ({ count: state.count + payload.amount });

  const { result } = renderHook(() =>
    useResetableActionState(action, initialState),
  );

  // increment state
  await act(async () => {
    startTransition(() => {
      result.current[1]({ amount: 5 });
    });
  });

  // state should be incremented
  await waitFor(() => {
    expect(result.current[0]).toEqual({ count: 5 });
  });

  // reset state
  await act(async () => {
    result.current[3]();
  });

  // state should be back to initialState
  await waitFor(() => {
    expect(result.current[0]).toEqual(initialState);
  });
});

test('returns payload', async () => {
  const initialState = { count: 0 };
  const action = async (
    state: typeof initialState,
    payload: { amount: number },
  ) => ({ count: state.count + payload.amount });

  const { result } = renderHook(() =>
    useResetableActionState(action, initialState),
  );

  // submit payload
  await act(async () => {
    startTransition(() => {
      result.current[1]({ amount: 5 });
    });
  });

  expect(result.current[4]).toEqual({ amount: 5 });

  // submit payload again
  await act(async () => {
    startTransition(() => {
      result.current[1]({ amount: 3 });
    });
  });

  expect(result.current[4]).toEqual({ amount: 3 });

  // reset payload
  await act(async () => {
    result.current[3]();
  });

  // payload should be null
  expect(result.current[4]).toEqual(null);
});
