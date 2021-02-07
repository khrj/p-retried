import * as retried from 'https://deno.land/x/retried@1.0.1/mod.ts'

interface InputOptions extends retried.OperationOptions {
    /** 
     * Function invoked on each retry. Receives the error thrown by `input` as
     * the first argument with properties `attemptNumber` and `retriesLeft`
     * which indicate the current attempt number and the number of attempts
     * left, respectively.
     *
     * ```ts
     * import pRetried from 'https://deno.land/x/p_retried/mod.ts'
     *
     * async function run () => {
     *     const response = await fetch('https://sindresorhus.com/unicorn')
     *         if (!response.ok) {
     *             throw new Error(response.statusText)
     *         }
     *         return response.json()
     *     }
     * }
     *
     * const result = await pRetried(run, {
     *    onFailedAttempt: error => {
     *        console.log(`Attempt ${error.attemptNumber} failed. There are ${error.retriesLeft} retries left.`); 
     *        // 1st request => Attempt 1 failed. There are 4 retries left. 
     *        // 2nd request => Attempt 2 failed. There are 3 retries left. 
     *        // ...
     *    },
     *    retries: 5
     * })
     *
     * console.log(result)
     * ```
     *
     * The `onFailedAttempt` function can return a promise. For example, you can
     * do some async logging:
     *
     * ```ts
     * import pRetried from 'https://deno.land/x/p_retried/mod.ts'
     * import { log } from './async-logger.ts'
     * const run = async () => { 
     *     // … 
     * }
     *
     * const result = await pRetried(run, {
     *     onFailedAttempt: async error => {
     *         await logger.log(error)
     *     }
     * })
     * ```
     *
     * If the `onFailedAttempt` function throws, all retries will be aborted and
     * the original promise will reject with the thrown error.
     */
    onFailedAttempt?: (error: RetryError) => void | Promise<void>,

    /** Number of tries to retry before rejecting */
    retries?: number
}

interface Options extends retried.OperationOptions {
    onFailedAttempt: (error: RetryError) => void | Promise<void>,
    retries: number
}

interface RetryError extends Error {
    attemptNumber: number,
    retriesLeft: number
}

export class AbortError extends Error {
    originalError: Error

    /**
     * Throwing an instance of the returned object will abort retrying and
     * reject the promise.
     * 
     * @param message The error message or an instance of a thrown `Error` / custom `Error`
     */
    constructor(message: string | Error) {
        super()

        if (message instanceof Error) {
            this.originalError = message
            message = message.message
        } else {
            this.originalError = new Error(message)
            this.originalError.stack = this.stack
        }

        this.name = 'AbortError'
        this.message = message
    }
}

const decorateErrorWithCounts = (error: Error, attemptNumber: number, { retries }: Options) => {
    // Minus 1 from attemptNumber because the first attempt does not count as a retry
    const retriesLeft = retries - (attemptNumber - 1)

    let retryError = error as RetryError

    retryError.attemptNumber = attemptNumber
    retryError.retriesLeft = retriesLeft

    return retryError
}

/**
 * Returns a `Promise` that is fulfilled when calling `input` returns a
 * fulfilled promise. If calling `input` returns a rejected promise, `input` is
 * called again until the maximum number of retries is reached. It then rejects
 * with the last rejection reason. 
 *
 * It doesn't retry on `TypeError` as that's a user error. The only exclusion to
 * this logic is when `TypeError` is thrown by `fetch`'s API with the message
 * 'Failed to fetch', which indicates that a request was not successful due to a
 * network error -
 * https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#Checking_that_the_fetch_was_successful
 *
 * However, beware that `fetch` may throw `TypeError` with different error
 * messages on different platforms for similar situations. See whatwg/fetch#526
 * (comment) -
 * https://github.com/whatwg/fetch/issues/526#issuecomment-554604080.
 *
 * @param input Function to be called, will be passed a single parameter that is
 * the attempt number. Is espected to return a `Promise` or any value.
 * 
 * @param inputOptions Additional options passed to `retried` - https://github.com/KhushrajRathod/retried
 */
export default function pRetried(
    input: (attempt: number) => Promise<any>,
    inputOptions: InputOptions
): Promise<any> {
    return new Promise((resolve, reject) => {
        const options: Options = {
            onFailedAttempt: () => { },
            retries: 10,
            ...inputOptions
        }

        const operation = retried.operation(options)

        operation.attempt(async attemptNumber => {
            try {
                resolve(await input(attemptNumber))
            } catch (error) {
                if (!(error instanceof Error)) {
                    reject(new TypeError(`Non-error was thrown: "${error}". You should only throw errors.`))
                    return
                }

                if (error instanceof AbortError) {
                    operation.stop()
                    reject(error.originalError)
                } else if (error instanceof TypeError && error.message !== 'Failed to fetch') {
                    operation.stop()
                    reject(error)
                } else {
                    const retryError = decorateErrorWithCounts(error, attemptNumber, options)

                    try {
                        await options.onFailedAttempt(retryError)
                    } catch (error) {
                        reject(error)
                        return
                    }

                    if (!operation.retry(error)) {
                        reject(operation.getMainError())
                    }
                }
            }
        })
    })
}