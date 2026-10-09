#!/usr/bin/env node
// PostToolUse formatter: routes the created/edited file to the right formatter by extension.
// Claude Code passes the completed tool call as JSON on stdin (tool_input.file_path).
// Formatting failures are reported on stderr but never fail the tool call.

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectDir = process.env.CLAUDE_PROJECT_DIR || path.resolve(__dirname, '..', '..');

function run(command) {
  const result = spawnSync(command, { cwd: projectDir, shell: true, encoding: 'utf8' });
  if (result.status !== 0) {
    process.stderr.write(`Formatter failed: ${command}\n${result.stdout || ''}${result.stderr || ''}\n`);
  }
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => (raw += chunk));
process.stdin.on('end', () => {
  let filePath;
  try {
    const event = JSON.parse(raw);
    filePath = event.tool_input && event.tool_input.file_path;
  } catch {
    filePath = raw.trim();
  }

  if (!filePath) {
    process.exit(0);
  }
  filePath = path.resolve(projectDir, filePath);
  if (!fs.existsSync(filePath)) {
    process.exit(0);
  }

  switch (path.extname(filePath).toLowerCase()) {
    case '.java':
      // Format only the edited file; the pom's includes still limit Spotless to src/**.
      run(
        `mvn -q -f "${path.join(projectDir, 'pom.xml')}" com.diffplug.spotless:spotless-maven-plugin:apply ` +
          `"-DspotlessFiles=${escapeRegex(filePath)}"`,
      );
      break;
    case '.js':
    case '.html':
    case '.css':
    case '.md':
    case '.json':
      run(`npx --yes prettier --write "${filePath}"`);
      break;
    default:
    // no formatter for this file type
  }

  process.exit(0);
});
