"""Temporary CI measurement for the final reviewed candidate."""

import json
import os
import platform
from pathlib import Path
import shutil
import statistics
import subprocess
import time


file = Path("src/features/books/BookList.test.tsx")
final_candidate = file.read_bytes()
reviewed_candidate = subprocess.check_output(
    [
        "git",
        "--no-pager",
        "show",
        f"b7b86de605a772403ed18a61cbbf8e0b04f9c843:{file}",
    ]
)

print(platform.platform(), "CPUs:", os.cpu_count(), flush=True)
subprocess.run(["node", "--version"], check=True)
subprocess.run(["lscpu"], check=True)

results = []
try:
    order = ["reviewed", "final", "final", "reviewed", "reviewed", "final"]
    for variant in order:
        file.write_bytes(
            reviewed_candidate if variant == "reviewed" else final_candidate
        )
        shutil.rmtree("node_modules/.vite/vitest", ignore_errors=True)
        report = f"/tmp/vitest-final-{len(results)}.json"
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
            "variant": variant,
            "wallSeconds": wall_seconds,
            "bookListSeconds": (
                book_list["endTime"] - book_list["startTime"]
            )
            / 1000,
        }
        results.append(result)
        print("MEASUREMENT", json.dumps(result), flush=True)
finally:
    file.write_bytes(final_candidate)

medians = {
    variant: {
        key: statistics.median(
            result[key] for result in results if result["variant"] == variant
        )
        for key in ("wallSeconds", "bookListSeconds")
    }
    for variant in ("reviewed", "final")
}
print("MEDIANS", json.dumps(medians), flush=True)

with open(os.environ["GITHUB_STEP_SUMMARY"], "a") as summary:
    summary.write(
        "## Final Vitest measurements\n\n```json\n"
        + json.dumps({"results": results, "medians": medians}, indent=2)
        + "\n```\n"
    )
