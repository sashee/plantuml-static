import packageJson from "./package.json" with {type: "json"};
import {writeFile, appendFile} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { exec } from "node:child_process";
const execProm = promisify(exec);

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const {major, minor, patch, plantumlVersion} = packageJson.version.match(/^(?<major>[^.]+)\.(?<minor>[^.]+)\.(?<patch>[^.]+)-(?<plantumlVersion>.*)$/).groups;

const newVersion = await (async () => {
	console.log("Current plantUml version: " + plantumlVersion);

	const releasesUrl = "https://api.github.com/repos/plantuml/plantuml/releases";
	const res = await fetch(releasesUrl);
	if(!res.ok) {
		console.error(res);
		throw new Error("Error downloading the releases");
	}
	const allReleases = await res.json();

	console.log("All available tag names: " + allReleases.map(({tag_name}) => tag_name).join(", "));

	const currentReleaseCreatedAt = allReleases.find(({tag_name}) => tag_name === plantumlVersion)?.created_at;
	if (!currentReleaseCreatedAt) {
		throw new Error("Could not find the current release for tag: " + plantumlVersion);
	}
	const currentReleaseDate = new Date(currentReleaseCreatedAt);

	console.log("Current release created at:" + currentReleaseDate.toISOString());

	const nextAvailableRelease = allReleases
		// only stable releases
		.filter(({draft, prerelease}) => !draft && !prerelease)
		// only releases that have a plantuml.jar inside
		.filter(({assets}) => assets.some(({name}) => name === "plantuml.jar"))
		// later than the current one
		.filter(({created_at}) => new Date(created_at).getTime() > currentReleaseDate.getTime())
		// sort by published date ascending
		.sort((r1, r2) => new Date(r1.published_at) - new Date(r2.published_at))
		.map(({tag_name}) => tag_name)
		[0];

	console.log("Next available release: " + nextAvailableRelease);

	return nextAvailableRelease;
})();

if (newVersion) {
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
	await appendFile(process.env.GITHUB_OUTPUT, `NEW_TAG=${newPackageVersion}`);
}else {
	console.log("There is no newer release");
}
