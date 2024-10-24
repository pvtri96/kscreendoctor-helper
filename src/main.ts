import * as childProcess from "node:child_process";
import * as path from "node:path";
import * as fs from "node:fs";
import { fileURLToPath } from 'node:url';
import yargs from "yargs";
// @ts-expect-error strange tsx type declaration
import { require } from 'tsx/cjs/api'
import { LayoutConfig, Mode, Output, Position } from "./types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let configFileLocationCounter = 0;
let configFileLocation = path.join(__dirname, "screenlayout.config.ts")
while (!fs.existsSync(configFileLocation)) {
    const additionalParams = Array.from({ length: configFileLocationCounter }).map(() => "..");
    configFileLocation = path.join(__dirname, ...additionalParams, "screenlayout.config.ts");
    configFileLocationCounter++;
}

const { layouts: namedLayouts, default: defaultLayouts } = require(configFileLocation, import.meta.url)

const layouts: LayoutConfig[] = namedLayouts ?? defaultLayouts

const layoutPresets = layouts.map(layout => layout.name)

const result = yargs(process.argv.slice(2))
    .alias({ "layout": "l" })
    .choices("layout", layoutPresets)
    .describe("layout", "Select a preset layout from config")
    .demandOption(["layout"], "Please provide a layout")
    .parseSync()

console.log("selected preset", result.layout)
const isWayland = process.env.XDG_SESSION_TYPE === "wayland"

const selectedLayout = layouts.find((layout) => layout.name === result.layout);
if (!selectedLayout) {
    process.exit(1)
}

const currentOutputs = getCurrentOutputs();
setOutputs(currentOutputs, selectedLayout)


function getCurrentOutputs() {

    const kscreenDoctorOutput = childProcess.execSync("kscreen-doctor -j", { encoding: "utf-8" })

    // const kscreenDoctorOutput = fs.readFileSync(`${process.cwd()}/output.json`, { encoding: "utf-8" })

    const config = JSON.parse(kscreenDoctorOutput)

    return config.outputs as Output[]
}

function setOutputs(currentOutputs: Output[], layout: LayoutConfig) {
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
        return `${key}.x,y`
    }

    return `${key}.${value}`
}