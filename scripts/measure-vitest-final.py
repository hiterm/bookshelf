"""Temporary CI measurement for the final reviewed candidate."""

import json
import os
import platform
from pathlib import Path
import shutil
import statistics
import subprocess
import time


print(platform.platform(), "CPUs:", os.cpu_count(), flush=True)
subprocess.run(["node", "--version"], check=True)
subprocess.run(["lscpu"], check=True)

results = []
for run in range(3):
    shutil.rmtree("node_modules/.vite/vitest", ignore_errors=True)
    report = f"/tmp/vitest-final-{run}.json"
    start = time.monotonic()
    subprocess.run(
        [
            "pnpm",
            "run",
            "test",
            "--reporter=default",
            "--reporter=json",
            f"--outputFile.json={report}",
        ],
        check=True,
    )
    wall_seconds = time.monotonic() - start
    data = json.loads(Path(report).read_text())
    assert data["numPassedTests"] == 223
    assert len(data["testResults"]) == 41
    book_list = next(
        test
        for test in data["testResults"]
        if test["name"].endswith("/BookList.test.tsx")
    )
    result = {
        "run": run + 1,
        "wallSeconds": wall_seconds,
        "vitestSeconds": data["endTime"] / 1000 - data["startTime"] / 1000,
        "bookListSeconds": (book_list["endTime"] - book_list["startTime"]) / 1000,
    }
    results.append(result)
    print("MEASUREMENT", json.dumps(result), flush=True)

medians = {
    key: statistics.median(result[key] for result in results)
    for key in ("wallSeconds", "vitestSeconds", "bookListSeconds")
}
print("MEDIANS", json.dumps(medians), flush=True)

with open(os.environ["GITHUB_STEP_SUMMARY"], "a") as summary:
    summary.write(
        "## Final Vitest measurements\n\n```json\n"
        + json.dumps({"results": results, "medians": medians}, indent=2)
        + "\n```\n"
    )
