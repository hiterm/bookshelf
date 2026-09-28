"""Temporary paired benchmark; run only in a disposable, otherwise idle checkout."""

import collections
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import time

root = Path(__file__).resolve().parents[1]
os.chdir(root)
paths = [Path(p) for p in ['src/features/books/bookSearch.test.ts', 'src/features/books/resolvePendingAuthors.test.ts', 'src/features/books/displayAuthorYomis.test.ts', 'src/features/books/entity/Book.test.ts', 'src/features/books/entity/BookFormat.test.ts', 'src/features/books/entity/BookStore.test.ts', 'src/features/books/import/importSelection.test.ts', 'src/features/books/import/toImportBookInput.test.ts', 'src/features/books/import/filterImportedBooks.test.ts', 'src/features/history/operationType.test.ts', 'src/components/errors/appError.test.ts', 'src/mocks/mockStore.test.ts', 'src/mocks/handlers.test.ts', 'e2e-mock-api/mockStore.test.ts']]
saved = {p: p.read_bytes() for p in paths}
baseline = {p: subprocess.check_output(["git", "--no-pager", "show", f"a91368c:{p}"]) for p in paths}
results = []
identities = None
out = Path(tempfile.mkdtemp(prefix='test-runtime-'))
print(f'Reports: {out}', flush=True)
print(subprocess.check_output(['node', '--version'], text=True).strip(), flush=True)
print(f'CPUs: {os.cpu_count()}; maxWorkers override: {os.environ.get("BENCH_WORKERS", "none")}', flush=True)
try:
    for index, variant in enumerate(['baseline', 'candidate', 'candidate', 'baseline', 'baseline', 'candidate'], 1):
        for p, data in saved.items():
            p.write_bytes(data)
        if variant == 'baseline':
            for p, data in baseline.items():
                p.write_bytes(data)
        shutil.rmtree('node_modules/.vite/vitest', ignore_errors=True)
        report = out / f'{index}-{variant}.json'
        command = ['pnpm', 'run', 'test', '--reporter=default', '--reporter=json', f'--outputFile={report}']
        if os.environ.get('BENCH_WORKERS'):
            command.append(f'--maxWorkers={os.environ["BENCH_WORKERS"]}')
        started = time.monotonic()
        with (out / f'{index}-{variant}.log').open('w') as log:
            subprocess.run(command, stdout=log, stderr=subprocess.STDOUT, check=True)
        wall = time.monotonic() - started
        data = json.loads(report.read_text())
        tests = [test for file in data['testResults'] for test in file['assertionResults']]
        assert len(tests) == 228 and all(t['status'] == 'passed' for t in tests)
        names = collections.Counter(t['fullName'] for t in tests)
        if identities is None:
            identities = names
        assert names == identities, 'Test identities changed'
        files = {Path(f['name']).name: round((f['endTime'] - f['startTime']) / 1000, 3) for f in data['testResults'] if Path(f['name']).name.startswith('BookList')}
        row = {'order': index, 'variant': variant, 'wall_seconds': round(wall, 3), 'book_list_files': files}
        results.append(row)
        print(json.dumps(row), flush=True)
finally:
    for p, data in saved.items():
        p.write_bytes(data)
    (out / 'results.json').write_text(json.dumps(results, indent=2) + '\n')
    if os.environ.get('GITHUB_STEP_SUMMARY'):
        with open(os.environ['GITHUB_STEP_SUMMARY'], 'a') as summary:
            summary.write('## Paired test runtime results\n\n```json\n' + json.dumps(results, indent=2) + '\n```\n')
