import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import path from "node:path";

const evidenceDir = process.env.EVIDENCE_DIR;
if (!evidenceDir) throw new Error("EVIDENCE_DIR is required");

const commands = [
  {
    id: "full",
    args: ["audit", "--json"],
    stdout: "25-npm-audit-full.stdout.json",
    stderr: "25-npm-audit-full.stderr.txt",
  },
  {
    id: "production",
    args: ["audit", "--omit=dev", "--json"],
    stdout: "26-npm-audit-production.stdout.json",
    stderr: "26-npm-audit-production.stderr.txt",
  },
];

const summary = [];
for (const command of commands) {
  const startedAt = new Date().toISOString();
  const execution = spawnSync("npm", command.args, {
    cwd: process.cwd(),
    encoding: "utf8",
    env: process.env,
    maxBuffer: 64 * 1024 * 1024,
  });
  const endedAt = new Date().toISOString();
  const stdout = execution.stdout ?? "";
  const stderr = execution.stderr ?? "";
  writeFileSync(path.join(evidenceDir, command.stdout), stdout);
  writeFileSync(path.join(evidenceDir, command.stderr), stderr);
  let parsed = false;
  try {
    JSON.parse(stdout);
    parsed = true;
  } catch {
    parsed = false;
  }
  summary.push({
    id: command.id,
    cwd: process.cwd(),
    command: `npm ${command.args.join(" ")}`,
    startedAt,
    endedAt,
    exitCode: execution.status,
    signal: execution.signal,
    error: execution.error ? String(execution.error) : null,
    stdoutBytes: Buffer.byteLength(stdout),
    stdoutSha256: createHash("sha256").update(stdout).digest("hex"),
    stderrBytes: Buffer.byteLength(stderr),
    stderrSha256: createHash("sha256").update(stderr).digest("hex"),
    jsonParsed: parsed,
  });
}

writeFileSync(
  path.join(evidenceDir, "27-npm-audit-command-summary.json"),
  `${JSON.stringify(summary, null, 2)}\n`,
);
process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
