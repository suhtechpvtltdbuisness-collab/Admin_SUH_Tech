#!/usr/bin/env node

import { execFileSync } from "node:child_process";

const allowedEmail = "kumargautam3231@gmail.com";
const protectedFile = "scripts/validate-allowed-committer.mjs";

function readGitConfig(key) {
  try {
    return execFileSync("git", ["config", "--get", key], {
      encoding: "utf8",
    }).trim();
  } catch {
    return "";
  }
}

function readStagedFiles() {
  try {
    const output = execFileSync(
      "git",
      ["diff", "--cached", "--name-only", "--diff-filter=ACDMRTUXB"],
      { encoding: "utf8" },
    );
    return output
      .split("\n")
      .map((file) => file.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

const configuredEmail = readGitConfig("user.email");
const effectiveEmail = (
  configuredEmail ||
  process.env.GIT_AUTHOR_EMAIL ||
  process.env.GIT_COMMITTER_EMAIL ||
  ""
)
  .trim()
  .toLowerCase();
const stagedFiles = readStagedFiles();
const protectedFileChanged = stagedFiles.includes(protectedFile);

if (!effectiveEmail) {
  console.error("husky - blocked commit: git user.email is not configured.");
  console.error(`husky - set git user.email to ${allowedEmail} to continue.`);
  process.exit(1);
}

if (effectiveEmail !== allowedEmail) {
  if (protectedFileChanged) {
    console.error(
      `husky - blocked commit: ${protectedFile} is protected and can only be changed by ${allowedEmail}.`,
    );
  }
  console.error(
    "husky - blocked commit: only the approved Git identity can create commits here.",
  );
  console.error(`husky - expected: ${allowedEmail}`);
  console.error(`husky - found: ${configuredEmail || effectiveEmail}`);
  process.exit(1);
}

if (protectedFileChanged) {
  console.error(`husky - protected file check passed for ${protectedFile}.`);
}
