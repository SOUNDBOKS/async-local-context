import Logger from "../src"

Logger.log("Start");

Logger.augment(m => "[Global] " + m, async () => Logger.log("Bruh"));

Logger.augment(m => "[Global] " + m, async () => {
    await Promise.all([1, 2, 3, 4, 5].map(async n => {
        await Logger.augment(m => `[${n}]: ${m}`, async () => {
            await new Promise(resolve => setTimeout(resolve, Math.random() * 100))
            Logger.log("Bruh " + n)
            Logger.log("???")
        })
    }))
}).then(() => {
    Logger.log("Done")
})