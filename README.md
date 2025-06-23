# use-resettable-action-state

A custom hook that enhances the [useActionState](https://react.dev/reference/react/useActionState) hook with reset function and payload state.

## Usage

### Reseting the state

```tsx:app/page.tsx
'use client';
import { useRef } from 'react';
import { doSomething } from './actions'; // server action
import { useResettableActionState } from 'use-resettable-action-state';

export default function Form() {
  const [state, submit, isPending, reset] = useResettableActionState(
    doSomething,
    null,
  );

  return (
    <form action={submit}>
      {state && state.error && (
        <p className="bg-red-500 text-white p-4">{state.error}</p>
      )}
      <p>{state && state.data?.message}</p>
      <input
        disabled={isPending}
        type="text"
        name="name"
        id="name"
        placeholder="Enter your name"
        defaultValue={(state?.data?.name as string) || ''}
      />

      <div className="flex flex-row justify-between items-center w-full">
        <button
          type="button"
          onClick={() => {
            reset();
          }}
        >
          Reset
        </button>
        <button form="theform" disabled={isPending} type="submit">
          {isPending ? 'Loading...' : 'Submit'}
        </button>
      </div>
    </form>
  );
}
```

### Using the payload state

When the action returns the new state, React will reset the form. But there are cases where you want to keep the form filled. For example, when the new state is an error, you may want to keep the form filled with values that the user has already entered. This way user doesn't have to re-enter the values.

```tsx:app/page.tsx
'use client';
import { useRef } from 'react';
import { doSomething } from './actions';
import { useResettableActionState } from 'use-resettable-action-state';

export default function Form({ initialState }: { initialState: { name: string | null, error : stting | null } }) {
  const [state, submit, isPending, reset, payload] = useResettableActionState(
    doSomething,
    initialState,
  );

  return (
    <form action={submit}>
      {state && !state.error && <p>Success!</p>}
            {state && state.error && <p className="bg-red-500 text-white p-4">{state.error}</p>}
      <input
        type="text"
        name="name"
        id="name"
        placeholder="Enter your name"
        defaultValue={initialState?.name || state?.name || payload?.name || ''}
      />
      <p>{state && state.data?.message}</p>
      <button type="button" onClick={() => reset()}>
        Reset
      </button>
      <button disabled={isPending} type="submit">
        {isPending ? 'Loading...' : 'Submit'}
      </button>
    </form>
  );
}
```

In the example above, the form will be initially filled with the `initialState.name` if it exists. Then the user can type a different name and submit the form. If the action succeeds, the input will show the new name. If the action fails, the input will show the name from the `payload` which is the name that the user has already entered.

## Demo

[Check out the demo here.](https://playground.nico.fyi/use-action-state/reset)

## License

MIT

## Author

Nico Prananta. Website: https://nico.fyi. Twitter: https://twitter.com/2co_p
