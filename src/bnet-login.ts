import * as childProcess from "node:child_process";
import credential from "../credential.config";
import { isWayland } from "./utils";
import { getCurrentOutputs } from "./output";

const windowName = "\"Battle.net Login\""
const exec = isWayland ? "kdotool" : "xdotool"

async function main() {
    let windowId = getWindowId()
    while (windowId === undefined) {
        await sleep(5000)
        windowId = getWindowId();
    }
    console.log("Found authentication window", windowId)
    await sleep(5000)

    let success = false;
    while (!success) {
        console.log("Attempt to fill in the login window", windowId)
        await fillLoginForm(windowId);
        await sleep(5000)
        windowId = getWindowId()
        if (windowId === undefined) {
            success = true;
            console.log("Successfully login into Battle.net")
        }
    }

    process.exit(0)
}


async function fillLoginForm(windowId: string | undefined) {
    if (!windowId) {
        return;
    }

    return isWayland ? fillLoginFormWayland(windowId) : fillLoginFormX11(windowId)
}

async function fillLoginFormX11(windowId: string | undefined) {
    childProcess.execSync(`${exec} search --name ${windowName} windowactivate`);
    childProcess.execSync(`${exec} mousemove --window ${windowId} 50 225`);
    childProcess.execSync(`${exec} click --repeat 3 1`);

    childProcess.execSync(`${exec} type ${credential.username}`);
    childProcess.execSync(`${exec} key Tab`);
    childProcess.execSync(`${exec} type ${credential.password}`);

    childProcess.execSync(`${exec} key Return`);
}

async function fillLoginFormWayland(windowId: string | undefined) {
    const outputs = getCurrentOutputs();
    const enabledOutput = outputs.find(o => o.enabled === true);
    if (!enabledOutput) {
        console.error("Could not identify any output")
        process.exit(1)
    }

    let location: { x: number; y: number };
    if (enabledOutput.scale === 1) {
        location = { x: 600, y: 375 }
    } else if (enabledOutput.scale === 1.25) {
        location = { x: 500, y: 300 }
    } else {
        console.error("Could not identify screen scale")
        process.exit(1)
    }

    childProcess.execSync(`ydotool mousemove --absolute -x 0 -y 0 && ydotool mousemove -x ${location.x} -y ${location.y}`)

    await sleep(500)
    childProcess.execSync(`${exec} search --name ${windowName} windowraise`);
    await sleep(500)
    console.log("perform the click")
    childProcess.execSync(`ydotool click 0xC0`)
    await sleep(500)

    if(getActiveWindowId() !== windowId) {
        console.log("Different active window id")
        return;
    }

    // /usr/include/linux/input-event-codes.h
    childProcess.execSync(`ydotool key 29:1 30:1 30:0 29:0 111:1 111:0`); // Ctrl + A then DELETE
    childProcess.execSync(`ydotool type ${credential.password}`);

    childProcess.execSync(`ydotool key 28:1 28:0`);
}

function getWindowId(): string | undefined {
    try {
        console.log("Command", `${exec} search --name ${windowName}`)
        const windowId = childProcess.execSync(`${exec} search --name ${windowName}`, { encoding: "utf-8" }).trim()

        console.log("Window result", windowId === "" ? undefined : windowId)
        return windowId === "" ? undefined : windowId
    } catch (e) {
        console.log("Error finding the window", e.message)
        return undefined
    }
}

function getActiveWindowId(): string | undefined {
    try {
        console.log("Command", `${exec} getactivewindow`)
        const windowId = childProcess.execSync(`${exec} getactivewindow`, { encoding: "utf-8" }).trim()

        console.log("Active window result", windowId === "" ? undefined : windowId)
        return windowId === "" ? undefined : windowId
    } catch (e) {
        console.log("Error finding the window", e.message)
        return undefined
    }
}

function sleep(delay: number) {
    return new Promise(resolve => setTimeout(resolve, delay))
}

main();
