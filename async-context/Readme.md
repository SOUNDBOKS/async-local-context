
# Async Local Context

## Installation

`yarn add @soundboks/async-local-context`

## Basic Usage

```ts

import { AsyncContextProvider } from "async-local-context"

interface Session { sessionId: number, ... }

// Create a new async context
// Note we are not passing a default, so trying to use it 
// outside of a context will fail
const SessionProvider = new AsyncContextProvider<Session>()

async function doImportantThings(): Promise<number> {
    // grab the sessionId from the surrounding context
    // will throw if called outside of a context
    const { sessionId, ... } = SessionProvider.use()

    console.log(sessionId)

    return 42
}

async function handleRequest(request: Request) {
    // Run 'doImportant things' in the context of request.session.id
    const result = SessionProvider.run({
        sessionId: request.session.id,
        ...
    }, async () => {
        return doImportantThings()
    })

    console.log(result) // 42
}
```

## API

### `AsyncContextProvider<T>::use() -> T`

Return the closest surrounding context or the defaultProvider if one is given and no context is found. If no context can be returned, this function throws.


### `AsyncContextProvider<T>::run(value: T, inner: () => Promise<U>) -> Promise<U>`

Execute a routine with the context `value`. Any calls to `.use` inside of inner will return `value`. Note that `inner` is called immediately and thus behaves very similarily to `Promise::new`.  
  
It is possible to nest calls to run arbitrarily, effectively forming something resembling stack frames that behave as you would expect.


```ts
const Store = new AsyncContextProvider(() => "Goldfish")

Store.run("Pufflefish", async () => {
    Store.run("Carp", async () => {
        Store.run("Catfish", async () => {
            console.log(Store.use()) // Catfish
        })

        console.log(Store.use()) // Carp
    })

    console.log(Store.use()) // Pufflefish
})

console.log(Store.use()) // Goldfish
```
