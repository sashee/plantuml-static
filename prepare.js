import packageJson from "./package.json" assert {type: "json"};
import fs from "node:fs";
import {mkdir} from "node:fs/promises";
import path from "node:path";
import {pipeline} from "node:stream/promises";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const {plantumlVersion} = packageJson.version.match(/^[^.]+\.[^.]+\.[^.]+-(?<plantumlVersion>.*)$/).groups;

const downloadUrl = `https://github.com/plantuml/plantuml/releases/download/${plantumlVersion}/plantuml.jar`;

const res = await fetch(downloadUrl);
if (!res.ok) {
	console.error(res);
	throw new Error("Download failed");
}

await mkdir(path.join(__dirname, "vendor"), {recursive: true});

await pipeline(
	res.body,
	fs.createWriteStream(path.join(__dirname, "vendor", "plantuml.jar"))
);
