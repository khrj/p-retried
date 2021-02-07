# P(romise) Retried

> Retry a promise-returning or async function

Abstraction for exponential and custom retry strategies for failed operations

## Usage

```ts
import pRetried from 'https://deno.land/x/p-retried@1.0.0/mod.ts'

async function run () {
	const response = await fetch('https://sindresorhus.com/unicorn')

	// Abort retrying if the resource doesn't exist
	if (response.status === 404) {
		throw new pRetried.AbortError(response.statusText)
	}

	return response.blob()
}

console.log(await pRetry(run, { retries: 5 }))
```

## API

See https://doc.deno.land/https/deno.land/x/p-retried@1.0.0/lib/mod.ts

## Tip

You can pass arguments to the function being retried by wrapping it in an inline arrow function:

```js
const pRetry = require('p-retry');

const run = async emoji => {
	// …
};

(async () => {
	// Without arguments
	await pRetry(run, {retries: 5});

	// With arguments
	await pRetry(() => run('🦄'), {retries: 5});
})();
```

## License

P(romise) Retried is licensed under the MIT license.
Code is adapted from https://github.com/sindresorhus/p-retry (also under the MIT license)