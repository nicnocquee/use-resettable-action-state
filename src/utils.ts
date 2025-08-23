import {
  startTransition,
  useActionState,
  useCallback,
  useMemo,
  useState,
} from 'react';

type BeforeAction<Payload> = (
  /**
   * The payload of the action.
   */
  payload: Payload | null,
  /**
   * The abort controller to cancel the action.
   */
  abortController: AbortController,
) => Promise<Payload | null>;

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
  /**
   * The action to be performed.
   */
  action: (state: Awaited<State>, payload: Payload) => State | Promise<State>,
  /**
   * The initial state of the action.
   */
  initialState: Awaited<State>,
  /**
   * The permalink of the action.
   */
  permalink?: string,
  /**
   * A function to be called before the action is performed. You can use this to cancel the action if needed by calling the abortController.abort() function. Or you can return a new payload to be used in the action.
   * @param payload - The payload of the action.
   * @param abortController - A function to cancel the action. Pass the state to the function to cancel the action.
   * @returns The payload of the action.
   */
  beforeAction?: BeforeAction<Payload>,
): [
  /**
   * The current state of the action.
   */
  state: Awaited<State>,
  /**
   * A function to dispatch the action.
   */
  dispatch: (payload: Payload | null) => void,
  /**
   * A boolean value to indicate if the action is pending.
   */
  isPending: boolean,
  /**
   * A function to reset the state of the action.
   */
  reset: () => void,
  /**
   * The payload that was passed to the action.
   */
  payload: Payload | null,
] {
  const [payload, setPayload] = useState<Payload | null>(null);

  const [state, actionSubmit, isPending] = useActionState(
    async (state: Awaited<State>, payload: Payload | null) => {
      if (beforeAction) {
        const abortController = new AbortController();
        const newPayload = await beforeAction(payload, abortController);
        if (abortController.signal.aborted) {
          if (abortController.signal.reason) {
            if (abortController.signal.reason instanceof DOMException) {
              // The abort function is called without a reason, so we return the initial state
              return initialState;
            }
            return abortController.signal.reason;
          }
          return initialState;
        }
        if (newPayload) {
          payload = newPayload;
        }
      }
      if (!payload) {
        return initialState;
      }
      const data = await action(state, payload);
      return data;
    },
    initialState,
    permalink,
  );

  /**
   * A function to dispatch the action.
   */
  const submit: typeof actionSubmit = useCallback(
    (payload: Payload | null) => {
      setPayload(payload);
      actionSubmit(payload);
    },
    [actionSubmit],
  );

  /**
   * A function to reset the action.
   */
  const reset = useCallback(() => {
    startTransition(() => {
      submit(null);
    });
  }, [submit]);

  return useMemo(
    () => [state, submit, isPending, reset, payload],
    [state, submit, isPending, reset, payload],
  );
}
