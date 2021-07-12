
<div align="center">
    <img src="assets/logo.svg" width="700" height="500" alt="Retry Icon">
    <h1>Promise Retried</h1>
    <p>
        <b>Retry a promise-returning or async function. Deno port of <a href="https://github.com/sindresorhus/p-retry">sindresorhus's p-retry for node</a></b>
    </p>
    <p>
        <img alt="build status" src="https://img.shields.io/github/workflow/status/khrj/p-retried/Deno?label=checks" >
        <img alt="language" src="https://img.shields.io/github/languages/top/khrj/p-retried" >
        <img alt="code size" src="https://img.shields.io/github/languages/code-size/khrj/p-retried">
        <img alt="issues" src="https://img.shields.io/github/issues/khrj/p-retried" >
        <img alt="license" src="https://img.shields.io/github/license/khrj/p-retried">
        <img alt="version" src="https://img.shields.io/github/v/release/khrj/p-retried">
    </p>
    <p>
        <b><a href="https://deno.land/x/p_retried">View on deno.land</a></b>
    </p>
    <br>
    <br>
    <br>
</div>

Abstraction for exponential and custom retry strategies for failed operations

## Usage

```ts
import pRetried, {
    AbortError,
} from "https://deno.land/x/p_retried@1.0.7/mod.ts"

async function run() {
    const response = await fetch("https://sindresorhus.com/unicorn")

    // Abort retrying if the resource doesn't exist
    if (response.status === 404) {
        throw new AbortError(response.statusText)
    }

    return response.blob()
}

console.log(await pRetried(run, { retries: 5 }))
```

## API

See https://doc.deno.land/https/deno.land/x/p_retried@1.0.7/mod.ts

## Tip

You can pass arguments to the function being retried by wrapping it in an inline arrow function:

```js
import pRetried from "https://deno.land/x/p_retried@1.0.7/mod.ts"

const run = async emoji => {
    // …
}

// Without arguments
await pRetried(run, {
    retries: 5,
})

// With arguments
await pRetried(() => run("🦄"), {
    retries: 5,
})
```

## Supporters

- HUGE thanks to @sindresorhus -- this repository is mostly his code, modified to work with Deno

[![Stargazers repo roster for @khrj/p-retried](https://reporoster.com/stars/khrj/p-retried)](https://github.com/khrj/p-retried/stargazers)

[![Forkers repo roster for @khrj/p-retried](https://reporoster.com/forks/khrj/p-retried)](https://github.com/khrj/p-retried/network/members)

## Related

- [p-timeout](https://github.com/khrj/p-timeout)
- [p-queue](https://github.com/khrj/p-queue)
- [retried](https://github.com/khrj/retried)
- [...more](https://github.com/khrj/deno-modules)

## License

- Promise Retried is licensed under the MIT license.
- Code is adapted from [Sindre's p-retry for node](https://github.com/sindresorhus/p-retry) (also under the MIT license)
