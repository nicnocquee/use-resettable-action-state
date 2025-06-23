import { startTransition, useActionState, useCallback, useState } from 'react';

/**
 * A custom hook that enhances the useActionState hook with
 * - reset function.
 * - payload state.
 * @param action - The action to be performed.
 * @param initialState - The initial state of the action.
 * @param permalink - The permalink of the action.
 * @returns Array of [state, submit function, isPending, reset function, and payload].
 */
export function useResettableActionState<State, Payload>(
  action: (state: Awaited<State>, payload: Payload) => State | Promise<State>,
  initialState: Awaited<State>,
  permalink?: string,
): [
  state: Awaited<State>,
  dispatch: (payload: Payload | null) => void,
  isPending: boolean,
  reset: () => void,
  payload: Payload | null,
] {
  const [payload, setPayload] = useState<Payload | null>(null);
  const [state, actionSubmit, isPending] = useActionState(
    async (state: Awaited<State>, payload: Payload | null) => {
      if (!payload) {
        return initialState;
      }
      const data = await action(state, payload);
      return data;
    },
    initialState,
    permalink,
  );

  const submit: typeof actionSubmit = useCallback(
    (payload: Payload | null) => {
      setPayload(payload);
      actionSubmit(payload);
    },
    [actionSubmit],
  );

  const reset = useCallback(() => {
    startTransition(() => {
      submit(null);
    });
  }, [submit]);

  return [state, submit, isPending, reset, payload];
}
