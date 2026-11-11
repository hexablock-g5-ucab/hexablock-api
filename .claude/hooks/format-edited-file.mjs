// PostToolUse hook: formats only the file Claude just edited (not the whole repo).
import { execSync } from 'node:child_process';

let raw = '';
process.stdin.on('data', (chunk) => (raw += chunk));
process.stdin.on('end', () => {
  try {
    const file = JSON.parse(raw)?.tool_input?.file_path;
    if (file && /\.(ts|js|mjs|json|md|ya?ml)$/.test(file)) {
      execSync(`npx --no -- prettier --write --ignore-unknown "${file}"`, { stdio: 'ignore' });
    }
  } catch {
    // Formatting is a convenience; never block the agent.
  }
});
