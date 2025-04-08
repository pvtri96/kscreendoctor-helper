import * as childProcess from "node:child_process";
import credential from "../credential.config";

const windowName = "\"Battle.net Login\""
const isWayland = process.env.XDG_SESSION_TYPE === "wayland";
const exec = "xdotool"

async function main() {
    let windowId = getWindowId()
    while (windowId === undefined) {
        await sleep(5000)
        windowId = getWindowId();
    }
    console.log("Found authentication window", windowId)

    let success = false;
    while (!success) {
        console.log("Attempt to fill in the login window", windowId)
        await fillLoginForm(windowId);
        await sleep(5000)
        if (getWindowId() === undefined) {
            success = true;
            console.log("Successfully login into Battle.net")
        }
    }

    process.exit(0)
}


async function fillLoginForm(windowId: string) {
    childProcess.execSync(`${exec} search --name ${windowName} windowactivate`);
    childProcess.execSync(`${exec} mousemove --window ${windowId} 50 225`);
    childProcess.execSync(`${exec} click --repeat 3 1`);

    childProcess.execSync(`${exec} type ${credential.username}`);
    childProcess.execSync(`${exec} key Tab`);
    childProcess.execSync(`${exec} type ${credential.password}`);

    childProcess.execSync(`${exec} key Return`);
}

function getWindowId() {
    try {
        console.log("Command", `${exec} search --name ${windowName}`)
        const windowId = childProcess.execSync(`${exec} search --name ${windowName}`, { encoding: "utf-8" })

        console.log("window result", windowId)
        return windowId.trim();
    } catch (e) {
        console.log("Error finding the window", e.message)
        return undefined
    }
}


function sleep(delay: number) {
    return new Promise(resolve => {
        setTimeout(resolve, delay)
    })
}

main();