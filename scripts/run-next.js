const { spawn } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const [major] = process.versions.node
  .split(".")
  .map((value) => Number.parseInt(value, 10));

const command = process.argv[2] ?? "dev";
const extraArgs = process.argv.slice(3);
const env = { ...process.env };

if (major >= 25 && !env.NODE_OPTIONS?.includes("--localstorage-file=")) {
  const localStorageFile = path.join(os.tmpdir(), "chentodo-node-localstorage");
  fs.mkdirSync(path.dirname(localStorageFile), { recursive: true });
  const localStorageOption = `--localstorage-file=${localStorageFile}`;
  env.NODE_OPTIONS = env.NODE_OPTIONS
    ? `${env.NODE_OPTIONS} ${localStorageOption}`
    : localStorageOption;
}

const nextBin = require.resolve("next/dist/bin/next");
const child = spawn(process.execPath, [nextBin, command, ...extraArgs], {
  stdio: "inherit",
  env,
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});

child.on("error", (error) => {
  console.error(error);
  process.exit(1);
});
