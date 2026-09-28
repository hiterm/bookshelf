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
fixture = Path('e2e-mock-api/fixtures.ts')
candidate = fixture.read_bytes()
baseline = subprocess.check_output(['git', '--no-pager', 'show', f'a91368c:{fixture}'])
results = []
identities = None
out = Path(tempfile.mkdtemp(prefix='test-runtime-'))
print(f'Reports: {out}', flush=True)
print(subprocess.check_output(['node', '--version'], text=True).strip(), flush=True)
print(f'CPUs: {os.cpu_count()}; maxWorkers override: {os.environ.get("BENCH_WORKERS", "none")}', flush=True)


def collect(suites, ancestors=()):
    tests = []
    for suite in suites:
        names = (*ancestors, suite['title'])
        for spec in suite.get('specs', []):
            for test in spec['tests']:
                assert test['status'] == 'expected'
                assert len(test['results']) == 1 and test['results'][0]['status'] == 'passed'
                tests.append((*names, spec['title'], test['projectName']))
        tests.extend(collect(suite.get('suites', []), names))
    return tests


try:
    for index, variant in enumerate(['baseline', 'candidate', 'candidate', 'baseline', 'baseline', 'candidate'], 1):
        fixture.write_bytes(baseline if variant == 'baseline' else candidate)
        shutil.rmtree('dist', ignore_errors=True)
        report = out / f'{index}-{variant}.json'
        command = ['pnpm', 'run', 'test:e2e:mock-api', '--reporter=line,json', '--retries=0']
        if os.environ.get('BENCH_WORKERS'):
            command.append(f'--workers={os.environ["BENCH_WORKERS"]}')
        started = time.monotonic()
        with (out / f'{index}-{variant}.log').open('w') as log:
            subprocess.run(command, stdout=log, stderr=subprocess.STDOUT, check=True,
                           env={**os.environ, 'CI': 'true', 'PLAYWRIGHT_JSON_OUTPUT_NAME': str(report)})
        wall = time.monotonic() - started
        data = json.loads(report.read_text())
        tests = collect(data['suites'])
        assert len(tests) == 53
        names = collections.Counter(tests)
        if identities is None:
            identities = names
        assert names == identities, 'Test identities changed'
        row = {'order': index, 'variant': variant, 'wall_seconds': round(wall, 3),
               'playwright_seconds': round(data['stats']['duration'] / 1000, 3)}
        results.append(row)
        print(json.dumps(row), flush=True)
finally:
    fixture.write_bytes(candidate)
    (out / 'results.json').write_text(json.dumps(results, indent=2) + '\n')
    if os.environ.get('GITHUB_STEP_SUMMARY'):
        with open(os.environ['GITHUB_STEP_SUMMARY'], 'a') as summary:
            summary.write('## Paired mock-API runtime results\n\n```json\n' + json.dumps(results, indent=2) + '\n```\n')
