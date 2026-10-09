"""Dependency safety audit: checks every resolved Maven dependency against the OSV database.

Usage (from the project root):
    python .claude/skills/code-review-skill/scripts/osv_audit.py

Exit code 0 = no known vulnerabilities, 1 = vulnerabilities found, 2 = audit could not run.
"""

import json
import os
import subprocess
import sys
import urllib.request

OSV_BATCH_URL = "https://api.osv.dev/v1/querybatch"
SCOPES = {"compile", "runtime", "test", "provided", "system"}


def resolve_dependencies(project_dir):
    output_file = os.path.join(project_dir, "target", "osv-deps.txt")
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    result = subprocess.run(
        f'mvn -q -B dependency:list -DoutputFile="{output_file}" -DexcludeTransitive=false',
        cwd=project_dir,
        shell=True,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        print(result.stdout + result.stderr, file=sys.stderr)
        sys.exit(2)

    dependencies = set()
    with open(output_file, encoding="utf-8") as handle:
        for line in handle:
            parts = line.strip().split(" ")[0].split(":")
            # group:artifact:type[:classifier]:version:scope
            if len(parts) >= 5 and parts[-1] in SCOPES:
                dependencies.add((parts[0], parts[1], parts[-2], parts[-1]))
    return sorted(dependencies)


def query_osv(dependencies):
    queries = [
        {"package": {"ecosystem": "Maven", "name": f"{group}:{artifact}"}, "version": version}
        for group, artifact, version, _ in dependencies
    ]
    request = urllib.request.Request(
        OSV_BATCH_URL,
        data=json.dumps({"queries": queries}).encode("utf-8"),
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(request, timeout=60) as response:
        return json.load(response)["results"]


def main():
    project_dir = os.environ.get("CLAUDE_PROJECT_DIR", os.getcwd())
    dependencies = resolve_dependencies(project_dir)
    if not dependencies:
        print("No dependencies resolved; audit could not run.", file=sys.stderr)
        sys.exit(2)

    try:
        results = query_osv(dependencies)
    except OSError as error:
        print(f"OSV query failed: {error}", file=sys.stderr)
        sys.exit(2)

    vulnerable = [
        (dependency, [vuln["id"] for vuln in result.get("vulns", [])])
        for dependency, result in zip(dependencies, results)
        if result.get("vulns")
    ]

    by_scope = {}
    for _, _, _, scope in dependencies:
        by_scope[scope] = by_scope.get(scope, 0) + 1
    print(f"Audited {len(dependencies)} resolved coordinates ({by_scope}) against OSV.")

    if not vulnerable:
        print("Result: 0 vulnerable coordinates.")
        sys.exit(0)

    print(f"Result: {len(vulnerable)} vulnerable coordinate(s):")
    for (group, artifact, version, scope), ids in vulnerable:
        print(f"  {group}:{artifact}:{version} ({scope}) -> {', '.join(ids)}")
    sys.exit(1)


if __name__ == "__main__":
    main()
