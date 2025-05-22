# use-resetable-action-state

A custom hook that enhances the [useActionState](https://react.dev/reference/react/useActionState) hook with reset function.

## Usage

```tsx:app/page.tsx
'use client';
import { useRef } from 'react';
import { doSomething } from './actions'; // server action
import { useResetableActionState } from 'use-resetable-action-state';

export default function Form() {
  const [state, submit, isPending, reset] = useResetableActionState(
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

## Demo

[Check out the demo here.](https://playground.nico.fyi/use-action-state/reset)

## License

MIT

## Author

Nico Prananta. Website: https://nico.fyi. Twitter: https://twitter.com/2co_p
