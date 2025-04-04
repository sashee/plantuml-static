import {test} from "node:test";
import { promisify } from "node:util";
import { exec } from "node:child_process";
import * as plantUml from "./index.js";
const execProm = promisify(exec);

test("can be called", async (t) => {
	const {stdout} = await execProm(`java -jar ${plantUml.path} -version`);
	console.log(stdout);
});
