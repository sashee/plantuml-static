import packageJson from "./package.json" assert {type: "json"};
import {dirname, join} from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const {plantumlVersion} = packageJson.version.match(/^[^.]+\.[^.]+\.[^.]+-(?<plantumlVersion>.*)$/).groups;

export const version = plantumlVersion;

export const path = join(__dirname, "vendor", "plantuml.jar");
