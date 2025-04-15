import * as path from "node:path";
import * as fs from "node:fs";
import { fileURLToPath } from 'node:url';
import yargs from "yargs";
// @ts-expect-error strange tsx type declaration
import { require } from 'tsx/cjs/api'
import { LayoutConfig } from "./types";
import { getCurrentOutputs, setOutputs } from "./output";

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

console.log(`Found selected preset "${result.layout}"`)

const selectedLayout = layouts.find((layout) => layout.name === result.layout);
if (!selectedLayout) {
    process.exit(1)
}

const currentOutputs = getCurrentOutputs();
setOutputs(currentOutputs, selectedLayout)

