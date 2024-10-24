# kscreendoctor helper

This tool provide utility script to allow defining type-safe screenlayout presets then run it via a simple command, e.g.: `pnpm run main -l desk`

# Setup

Bundled script shall be delivered later, for now, it is necessary to clone the repository then build it on your own.

```
git clone
```

To build, the repo shall require:
- Nodejs: 20 or higher
- PNPM: 9 or higher

```
pnpm install
```

Afterward, the layout can be configured via a Typescript file `screenlayout.config.ts`, e.g.:

```
import { LayoutConfig } from "./src/types";

const hdmiDummy = {
    name: "HDMI-Dummy",
    waylandName: "HDMI-A-1",
    x11Name: "HDMI-A-0",
}
const lgMonitor = {
    name: "LG",
    waylandName: "DP-1",
    x11Name: "DisplayPort-0",
}

export const layouts: LayoutConfig[] = [

        {
            name: "hdmi",
            outputs: [
                {
                    ...lgMonitor,
                    enabled: false,
                },
                {
                    ...hdmiDummy,
                    enabled: true,
                    mode: { refreshRate: 60, size: { width: 1920, height: 1080 } },
                    scale: 1.25
                }
            ]
        },
        {
            name: "lg",
            outputs: [
                {
                    ...lgMonitor,
                    enabled: true,
                    mode: { refreshRate: 165, size: { width: 2560, height: 1440 } }
                },
                {
                    ...hdmiDummy,
                    enabled: false
                }
            ]
        },
]
```

There are a lot of properties which can be configured via the script, which can be found via `./src/types.ts`.
The configure file can be either a Typescript or Javascript (however, for code-completion, Typescript is recommended).
After the file is created, the script can be run like: 
```
pnpm run apply --layout hdmi
```

To run your script from anoter working directory, PNPM allow specifying an absolute path via `-C <path_to_repo>`, e.g.:

```
pnpm -C $HOME/.screenlayout run apply --layout hdmi
```

# Contributing

Issues or PRs are welcome, or try to contact me via the github profile ;)
