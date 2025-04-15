import * as childProcess from "node:child_process";
import { LayoutConfig, Mode, Output, Position } from "./types";
import { isWayland } from "./utils";

export function getCurrentOutputs() {

    const kscreenDoctorOutput = childProcess.execSync("kscreen-doctor -j", { encoding: "utf-8" })

    // const kscreenDoctorOutput = fs.readFileSync(`${process.cwd()}/output.json`, { encoding: "utf-8" })

    const config = JSON.parse(kscreenDoctorOutput)

    return config.outputs as Output[]
}

export function setOutputs(currentOutputs: Output[], layout: LayoutConfig) {
    let command = `kscreen-doctor`;
    let options: string[] = []
    for (const layoutOutput of layout.outputs) {
        const outputName = isWayland ? layoutOutput.waylandName : layoutOutput.x11Name

        if (currentOutputs.findIndex(output => outputName === output.name) === -1) {
            continue;
        }
        for (const property of Object.keys(layoutOutput)) {
            if (property === "waylandName" || property === "x11Name" || property === "name") {
                continue
            }

            options.push(`output.${outputName}.${mapProperty(property, layoutOutput[property])}`)
        }
    }

    console.log("Executing command:")
    console.log([command, ...options].join(" "))

    childProcess.execSync([command, ...options].join(" "), { encoding: "utf-8", stdio: "inherit" })
}

function mapProperty(key: string, value: unknown): string {
    if (key === "enabled" && typeof value === "boolean") {
        return value ? "enable" : "disable"
    }
    if (key === "mode" && Mode.isInstance(value)) {
        const { refreshRate, size: { width, height } } = value;
        return `${key}.${width}x${height}@${refreshRate}`
    }
    if (key === "pos" && Position.isInstance(value)) {
        const { x, y } = value;
        return `position.${x},${y}`
    }

    return `${key}.${value}`
}