#!/usr/bin/env node

import { chmodSync, copyFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const hookDir = join(process.cwd(), ".husky", "_");
const sourceHookDir = join(process.cwd(), ".husky");
const hookNames = ["pre-commit", "pre-push"];

mkdirSync(hookDir, { recursive: true });
for (const hookName of hookNames) {
  copyFileSync(join(sourceHookDir, hookName), join(hookDir, hookName));
  chmodSync(join(hookDir, hookName), 0o755);
}
