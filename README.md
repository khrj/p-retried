# P(romise) Retried

> Retry a promise-returning or async function

Abstraction for exponential and custom retry strategies for failed operations

## Usage

``` ts
import pRetried, { AbortError } from 'https://deno.land/x/p_retried@1.0.1/mod.ts'

async function run () {
	const response = await fetch('https://sindresorhus.com/unicorn')

	// Abort retrying if the resource doesn't exist
	if (response.status === 404) {
		throw new AbortError(response.statusText)
	}

	return response.blob()
}

console.log(await pRetried(run, { retries: 5 }))
```

## API

See https://doc.deno.land/https/deno.land/x/p_retried@1.0.1/lib/mod.ts

## Tip

You can pass arguments to the function being retried by wrapping it in an inline arrow function:

``` js
import pRetried from 'https://deno.land/x/p_retried@1.0.1/mod.ts'

const run = async emoji => {
    // …
}

// Without arguments
await pRetried(run, {
    retries: 5
})

// With arguments
await pRetried(() => run('🦄'), {
    retries: 5
})
```

## License

P(romise) Retried is licensed under the MIT license.
Code is adapted from https://github.com/sindresorhus/p-retry (also under the MIT license)
