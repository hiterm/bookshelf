"""Temporary paired CI experiment; fail if either suite fails."""
import json
import os
import platform
from pathlib import Path
import shutil
import subprocess
import time

file = Path("src/features/books/BookList.test.tsx")
candidate = file.read_bytes()
baseline = subprocess.check_output([
    "git", "--no-pager", "show",
    f"6df6c17b09e5dda22c02a91ff7a1f91b79348f6e:{file}",
])
print(platform.platform(), "CPUs:", os.cpu_count(), flush=True)
subprocess.run(["node", "--version"], check=True)
subprocess.run(["lscpu"], check=True)
results = []
try:
    for variant in ["baseline", "candidate", "candidate", "baseline", "baseline", "candidate"]:
        file.write_bytes(baseline if variant == "baseline" else candidate)
        # Equal cold caches, including previous timing-based file scheduling.
        shutil.rmtree("node_modules/.vite/vitest", ignore_errors=True)
        report = f"/tmp/vitest-{len(results)}.json"
        start = time.monotonic()
        subprocess.run([
            "pnpm", "run", "test", "--reporter=default", "--reporter=json",
            f"--outputFile.json={report}",
        ], check=True)
        wall_seconds = time.monotonic() - start
        data = json.loads(Path(report).read_text())
        assert data["numPassedTests"] == 223
        assert len(data["testResults"]) == 41
        book_list = next(t for t in data["testResults"] if t["name"].endswith("/BookList.test.tsx"))
        result = dict(variant=variant, wallSeconds=wall_seconds,
                      bookListSeconds=(book_list["endTime"] - book_list["startTime"]) / 1000)
        results.append(result)
        print("MEASUREMENT", json.dumps(result), flush=True)
finally:
    file.write_bytes(candidate)

with open(os.environ["GITHUB_STEP_SUMMARY"], "a") as summary:
    summary.write("## Vitest paired measurements\n\n```json\n" + json.dumps(results, indent=2) + "\n```\n")
