import packageJson from "./package.json" assert {type: "json"};
import {writeFile} from "node:fs/promises";
import path from "node:path";
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { exec } from "node:child_process";
const execProm = promisify(exec);

if((await execProm("git status --porcelain=v2")).stdout !== "") {
	console.log("Git repo not clean, exiting");
	process.exit(-1);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const rl = readline.createInterface({ input, output });

const {major, minor, patch, plantumlVersion} = packageJson.version.match(/^(?<major>[^.]+)\.(?<minor>[^.]+)\.(?<patch>[^.]+)-(?<plantumlVersion>.*)$/).groups;

const newVersion = await (async () => {
	const releasesUrl = "https://api.github.com/repos/plantuml/plantuml/releases";
	const res = await fetch(releasesUrl);
	if(!res.ok) {
		console.error(res);
		throw new Error("Error downloading the releases");
	}
	const allReleases = await res.json();
	const availableReleases = allReleases
		// only stable releases
		.filter(({draft, prerelease}) => !draft && !prerelease)
		// sort by published date ascending
		.sort((r1, r2) => new Date(r1.published_at) - new Date(r2.published_at))
		.map(({tag_name}, i, l) => ({tag_name, position: l.length - i}));

	console.log(availableReleases.map(({tag_name, position}) => `${position}) ${tag_name}`).join("\n"));

	const selectedVersion = await rl.question('Which version? (default: 1): ');
	rl.close();
	return availableReleases.find(({position}) => String(position) === (selectedVersion !== "" ? selectedVersion : "1")).tag_name;
})();
const newPackageVersion = newVersion === plantumlVersion ? `${major}.${parseInt(minor) + 1}.${patch}-${newVersion}` : `${parseInt(major) + 1}.0.0-${newVersion}`;
console.log(`Publishing: ${newPackageVersion}`);

const newPackageJson = {
	...packageJson,
	version: newPackageVersion,
}

await writeFile(path.join(__dirname, "package.json"), JSON.stringify(newPackageJson, undefined, "\t"))
// update package-lock.json
await execProm("npm install");
await execProm("git add .");
await execProm(`git commit -m "${newPackageVersion}"`);
// tag release
await execProm(`git tag ${newPackageVersion}`);
await execProm("git push");
await execProm("git push --tags");
