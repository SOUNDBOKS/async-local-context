
# Async-Logger

Implements a logger based on [async-local-context](../async-context/Readme.md) to control logging behaviour through async callstacks in an intuitive way. The logger is generic over the type of messages you want to send and is not limited to strings or the underlying sink.


## Installation

`yarn add @soundboks/async-logger`

## Usage

```ts
import { AsyncLogger } from "@soundboks/async-logger"

// initialize the base sink
const Logger = new AsyncLogger<string>(console.log)

// log straight to the sink
Logger.log("basic") // 'basic' -> console.log

// augment logs with extra context
Logger.augment(msg => `[Context: ] ${msg}`, async () => {
    Logger.log("Hello, ") // '[Context: ] Hello, ' -> console.log
    Logger.log("World!") // '[Context: ] World!' -> console.log
})

// Override the logger
Logger.collect(msg => console.error(msg), async () => {
    Logger.log("Where does my log go?") // 'Where does my log go?' -> console.error
})

// Tap the logger, streaming into 2 sinks
Logger.tap(msg => console.error(msg), async () => {
    Logger.log("And now?") // 'And now?' -> console.log & console.error
})
```