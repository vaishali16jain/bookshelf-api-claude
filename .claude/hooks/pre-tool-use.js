#!/usr/bin/env node
// PreToolUse safety gate: blocks destructive shell commands and obvious secret leakage.
// Claude Code passes the pending tool call as JSON on stdin; exit code 2 blocks the call
// and the stderr message is shown to Claude.

const destructivePatterns = [
  /rm\s+-rf/i,
  /git\s+push\s+.*--force/i,
  /git\s+reset\s+--hard/i,
  /drop\s+table/i,
  /drop\s+database/i,
  /truncate\s+table/i,
  /--no-verify/i,
  /Remove-Item\s+.*-Recurse\s+.*-Force/i,
];

const secretPatterns = [
  /api[_-]?key\s*[:=]\s*['"][^'"]{8,}/i,
  /secret\s*[:=]\s*['"][^'"]{8,}/i,
  /aws_(access_key_id|secret_access_key)\s*[:=]/i,
  /-----BEGIN (RSA|EC|OPENSSH|PRIVATE) KEY-----/,
  // A file reader whose own arguments (same command segment) include a .env / .env.* file.
  /\b(cat|type|more|less|head|tail|Get-Content|gc)\s+(?:[^|;&\n]*?[\s'"/\\])?\.env(\.[\w-]+)?(?=$|[\s'"|;&)])/im,
];

// `rm -rf` is allowed only when every target is a build/output directory in the project root.
const allowedRmTargets = /^(\.\/)?(target|data|node_modules)\/?$/;

function isAllowedRm(segment) {
  const match = segment.match(/^\s*rm\s+-rf\s+(.+?)\s*$/);
  if (!match) {
    return false;
  }
  return match[1]
    .split(/\s+/)
    .every((arg) => allowedRmTargets.test(arg.replace(/^['"]|['"]$/g, "")));
}

// Drops allowed `rm -rf <build dir>` segments so the destructive patterns only see the rest.
function withoutAllowedRm(command) {
  return command
    .split(/&&|\|\||[;|\n]/)
    .filter((segment) => !isAllowedRm(segment))
    .join(" ; ");
}

function block(reason) {
  process.stderr.write(`BLOCKED: ${reason}\n`);
  process.exit(2);
}

let raw = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => (raw += chunk));
process.stdin.on("end", () => {
  let command = raw;
  try {
    const event = JSON.parse(raw);
    command = (event.tool_input && event.tool_input.command) || "";
  } catch {
    // not JSON, treat raw input as the literal command text
  }

  const checkedCommand = withoutAllowedRm(command);
  for (const pattern of destructivePatterns) {
    if (pattern.test(checkedCommand)) {
      block(`command matches destructive pattern ${pattern}.`);
    }
  }

  for (const pattern of secretPatterns) {
    if (pattern.test(command)) {
      block(`command appears to expose a secret (pattern ${pattern}).`);
    }
  }

  process.exit(0);
});
