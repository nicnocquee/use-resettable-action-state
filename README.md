# use-resettable-action-state

A custom hook that enhances the [useActionState](https://react.dev/reference/react/useActionState) hook with the following features.

| 🌟  | Feature                | Description                                                                                                                                                                                                                         |
| --- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🔄  | Reset function         | The hook returns a function to reset the state of the action. This is useful when you want to reset the form, for example. Read more about it in [this blog post](https://www.nico.fyi/blog/reset-state-from-react-useactionstate). |
| ✉️  | Payload state          | The hook returns the payload that was passed to the action. This is useful when you want to keep the form filled with what the user has already entered after the action completes.                                                 |
| 🛠️  | Before action function | You can pass a function to be called before the action is performed. This is useful when you want to cancel the action before it starts, or modify the payload before it is passed to the action.                                   |

## Installation

```bash
npm install use-resettable-action-state
```

## Usage

### Resetting the state

In the example below, if the `doSomething` action returns an error, the error will be displayed in the form. Then, y clicking the reset button, the `state` will be reset to `null` which will clear the error message.

```tsx:app/page.tsx
'use client';
import { doSomething } from './actions'; // server action
import { useResettableActionState } from 'use-resettable-action-state';

export default function Form() {
  const [state, submit, isPending, reset] = useResettableActionState(
    doSomething,
    null,
  );

  return (
    <form action={submit} id="theform">
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

When the action returns the new state, React will reset the form. However, there are cases where you want to keep the form filled. For example, when the new state is an error, you may want to keep the form filled with values that the user has already entered. This way, the user doesn't have to re-enter the values.

```tsx:app/page.tsx
'use client';
import { doSomething } from './actions';
import { useResettableActionState } from 'use-resettable-action-state';

export default function Form({ initialState }: { initialState: { name: string | null, error: string | null } }) {
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
        defaultValue={payload?.get('name') || state?.name || initialState?.name || ''}
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

### Cancel the action

You might want to cancel the action before it starts. For example, you may want to validate the form before the action is performed. In the example below, we will cancel the action if the user did not repeat the password correctly.

```tsx:app/page.tsx
'use client';
import { doSomething } from './actions';
import { useResettableActionState } from 'use-resettable-action-state';

export default function Form({ initialState }: { initialState: { password: string | null, error: string | null } }) {
  const [state, submit, isPending, reset, payload] = useResettableActionState(
    doSomething,
    initialState,
    undefined,
    async (payload, abortController) => {
      if (payload?.get('password') !== payload?.get('repeat-password')) {
        abortController.abort({
          error: 'Passwords do not match',
        });
      }
      return payload;
    },
  );

  return (
    <form action={submit}>
      {state && !state.error && <p>Success!</p>}
      {state && state.error && <p className="bg-red-500 text-white p-4">{state.error}</p>}
      <input
        type="password"
        name="password"
        id="password"
        placeholder="Enter new password"
      />
      <input
        type="password"
        name="repeat-password"
        id="repeat-password"
        placeholder="Repeat the new password"
      />
      <p>{state && state.data?.message}</p>

      <button disabled={isPending} type="submit">
        {isPending ? 'Loading...' : 'Submit'}
      </button>
    </form>
  );
}
```

### Modify the payload before the action is performed

You might want to modify the payload before the action is performed. In the example below, we will find out the IP address of the user and add it to the payload before sending.

```tsx:app/page.tsx
'use client';
import { doSomething } from './actions';
import { useResettableActionState } from 'use-resettable-action-state';

export default function Form({ initialState }: { initialState: { name: string | null, error: string | null } }) {
  const [state, submit, isPending, reset, payload] = useResettableActionState(
    doSomething,
    initialState,
    undefined,
    async (payload) => {
      const ip = await fetch('https://api.ipify.org?format=json').then(res => res.json()).then(data => data.ip);
      if (ip) {
        payload.set('ip', ip);
      }
      return payload;
    },
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
      />
      <input type="hidden" name="ip" value="" />

      <p>{state && state.data?.message}</p>

      <button disabled={isPending} type="submit">
        {isPending ? 'Loading...' : 'Submit'}
      </button>
    </form>
  );
}
```

## Demo

[Check out the demo here.](https://playground.nico.fyi/use-action-state/reset)

## License

MIT

## Author

Nico Prananta. Website: https://nico.fyi.
