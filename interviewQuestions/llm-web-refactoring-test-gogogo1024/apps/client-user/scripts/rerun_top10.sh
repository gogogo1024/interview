#!/usr/bin/env bash
set -euo pipefail

# 工作目录
cd /Users/huangcheng/Documents/github/interview/interviewQuestions/llm-web-refactoring-test-gogogo1024/apps/client-user
mkdir -p /tmp/playwright-reruns

# Quote a string safely for shell single-quoted usage
shell_quote() {
  # wraps argument in single quotes, escaping any embedded single quotes
  printf "'%s'" "$(printf '%s' "$1" | sed "s/'/'\"'\"'/g")"
}

TOP10="/tmp/playwright-traces/summaries/top10.txt"
if [ ! -f "$TOP10" ]; then
  echo "Top10 missing: $TOP10" >&2
  exit 1
fi

# We'll parse top10 CSV-like lines: <rank>,<label>,<score>,<id>
# Determine default workers for reruns (allow override via env RERUN_WORKERS)
cpu_count=$(getconf _NPROCESSORS_ONLN 2>/dev/null || echo 2)
if [ "$cpu_count" -gt 1 ]; then
  default_rerun_workers=$((cpu_count - 1))
else
  default_rerun_workers=1
fi
RERUN_WORKERS=${RERUN_WORKERS:-$default_rerun_workers}
echo "Using RERUN_WORKERS=$RERUN_WORKERS" >&2

ALLTESTS=/tmp/playwright-all-tests.txt

# process a single top10 CSV line
process_line() {
  local line="$1"
  if [[ -z "${line// }" ]]; then
    return
  fi
  local label name prefix tokens specline specpath test_title specfile base_spec
  label=$(echo "$line" | awk -F',' '{print $2}' | sed 's/^ *//; s/ *$//')
  name=$(echo "$label" | sed 's/[[:space:]]/_/g')
  prefix=$(echo "$label" | sed 's/[^a-zA-Z0-9]/ /g' | awk '{print $1}' || true)
  echo "\n==========\nProcessing: $label -> $name" >&2

  # build candidate from ALLTESTS (ALLTESTS should exist before parallel run)
  tokens=$(echo "$label" | sed 's/[^a-zA-Z0-9]/\n/g' | awk 'length($0)>=3 {print $0}')
  specline=""
  if [ -n "$tokens" ] && [ -s "$ALLTESTS" ]; then
    local pipeline="cat '$ALLTESTS'"
    for t in $tokens; do
      pipeline="$pipeline | grep -iF '$t' || true"
    done
    pipeline="$pipeline | head -n1"
    specline=$(bash -lc "$pipeline" || true)
  fi

  specpath=""
  test_title=""
  if [ -n "$specline" ]; then
    specfile=$(echo "$specline" | sed -n 's/.*\] *\(.*\.spec\.ts\).*/\1/p' || true)
    if [ -z "$specfile" ]; then
      specfile=$(echo "$specline" | awk '{print $2}' | sed 's/:.*//')
    fi
    specfile=$(echo "$specfile" | tr -d '\r' | sed -E 's/[^[:print:]]//g' | sed 's/:.*$//')
    base_spec=$(basename "$specfile")
    specpath=$(find tests -type f -name "$base_spec" -print -quit || true)
    if [ -z "$specpath" ]; then
      specpath=$(find . -type f -name "$base_spec" | head -n1 || true)
    fi
    test_title=$(echo "$specline" | awk -F'›' '{print $NF}' | tr '\n' ' ' | sed -E 's/[[:space:]]+/ /g; s/^ //; s/ $//')
  fi

  if [ -z "$specpath" ] || [ ! -f "$specpath" ]; then
    tokens=$(echo "$label" | tr -cs '[:alnum:]' '\n' | awk 'length($0)>=2 {print tolower($0)}')
    local best_score=0 best_line=""
    if [ -n "$tokens" ] && [ -s "$ALLTESTS" ]; then
      while IFS= read -r candidate || [ -n "$candidate" ]; do
        candidate_lc=$(echo "$candidate" | tr '[:upper:]' '[:lower:]')
        score=0
        for t in $tokens; do
          if echo "$candidate_lc" | grep -qiF "$t"; then
            score=$((score + 1))
          fi
        done
        if [ "$score" -gt "$best_score" ]; then
          best_score=$score
          best_line="$candidate"
        elif [ "$score" -eq "$best_score" ] && [ "$score" -gt 0 ]; then
          if [ ${#candidate} -lt ${#best_line} ]; then
            best_line="$candidate"
          fi
        fi
      done < "$ALLTESTS"
    fi

    if [ "$best_score" -gt 0 ] && [ -n "$best_line" ]; then
      specline="$best_line"
      specfile=$(echo "$specline" | sed -n 's/.*\] *\(.*\.spec\.ts\).*/\1/p' || true)
      if [ -z "$specfile" ]; then
        specfile=$(echo "$specline" | awk '{print $2}' | sed 's/:.*//')
      fi
      specfile=$(echo "$specfile" | tr -d '\r' | sed -E 's/[^[:print:]]//g' | sed 's/:.*$//')
      base_spec=$(basename "$specfile")
      specpath=$(find tests -type f -name "$base_spec" -print -quit || true)
      if [ -z "$specpath" ]; then
        specpath=$(find . -type f -name "$base_spec" | head -n1 || true)
      fi
      test_title=$(echo "$specline" | awk -F'›' '{print $NF}' | tr '\n' ' ' | sed -E 's/[[:space:]]+/ /g; s/^ //; s/ $//')
    else
      specpath=$(find tests -type f -name "*${prefix}*.spec.ts" | head -n1 || true)
    fi
  fi

  export PLAYWRIGHT_STORAGE_STATE="/tmp/playwright-client-user-$(date +%s)-$$.json"
  TIMESTAMP=$(date +%s)
  outlog="/tmp/playwright-reruns/${name}.${TIMESTAMP}.log"

  # attempt runs
  if [ -n "$test_title" ]; then
    test_title=$(echo "$test_title" | tr '\n' ' ' | sed -E 's/[[:space:]]+/ /g; s/^ //; s/ $//')
    if [ -z "$test_title" ]; then
      run_and_copy "PLAYWRIGHT_STORAGE_STATE=$PLAYWRIGHT_STORAGE_STATE pnpm exec playwright test '$specpath' --workers=$RERUN_WORKERS --trace=on --config=playwright.config.ts --reporter=list"
    else
      if [ "${#test_title}" -gt 300 ]; then
        test_title="${test_title:0:300}"
      fi
      specpath_esc=$(shell_quote "$specpath")
      title_raw_esc=$(shell_quote "$test_title")
      escaped=$(python3 - <<PY
import re,sys
print(re.escape(sys.stdin.read().strip()))
PY
<<PY
$test_title
PY
)
      escaped_esc=$(shell_quote "$escaped")

      if run_and_copy "PLAYWRIGHT_STORAGE_STATE=$PLAYWRIGHT_STORAGE_STATE pnpm exec playwright test $specpath_esc -g $title_raw_esc --workers=$RERUN_WORKERS --trace=on --config=playwright.config.ts --reporter=list"; then
        true
      else
        exact_regex_esc=$(shell_quote "^$escaped$")
        if run_and_copy "PLAYWRIGHT_STORAGE_STATE=$PLAYWRIGHT_STORAGE_STATE pnpm exec playwright test $specpath_esc -g $exact_regex_esc --workers=$RERUN_WORKERS --trace=on --config=playwright.config.ts --reporter=list"; then
          true
        else
          if run_and_copy "PLAYWRIGHT_STORAGE_STATE=$PLAYWRIGHT_STORAGE_STATE pnpm exec playwright test $specpath_esc -g $escaped_esc --workers=$RERUN_WORKERS --trace=on --config=playwright.config.ts --reporter=list"; then
            true
          else
            run_and_copy "PLAYWRIGHT_STORAGE_STATE=$PLAYWRIGHT_STORAGE_STATE pnpm exec playwright test $specpath_esc --workers=$RERUN_WORKERS --trace=on --config=playwright.config.ts --reporter=list"
          fi
        fi
      fi
    fi
  else
    run_and_copy "PLAYWRIGHT_STORAGE_STATE=$PLAYWRIGHT_STORAGE_STATE pnpm exec playwright test '$specpath' --workers=$RERUN_WORKERS --trace=on --config=playwright.config.ts --reporter=list"
  fi

  if [ -z "$specpath" ]; then
    echo "No spec file found for prefix $prefix" >&2
    echo "No spec file found for $name" > "/tmp/playwright-reruns/${name}.nomatch.log"
  fi
}

# Parallel mode control: enable via RERUN_PARALLEL=1 (default 1)
RERUN_PARALLEL=${RERUN_PARALLEL:-1}
echo "RERUN_PARALLEL=$RERUN_PARALLEL" >&2

# ensure ALLTESTS exists before parallel workers read it
if [ ! -s "$ALLTESTS" ]; then
  TERM=dumb FORCE_COLOR=0 pnpm exec playwright test --list --config=playwright.config.ts > "$ALLTESTS"
fi

if [ "$RERUN_PARALLEL" -eq 1 ]; then
  # spawn background jobs with concurrency limit
  while IFS= read -r line || [ -n "$line" ]; do
    if [[ -z "${line// }" ]]; then
      continue
    fi
    # wait for slot
    while [ "$(jobs -rp | wc -l)" -ge "$RERUN_WORKERS" ]; do
      sleep 0.5
    done
    process_line "$line" &
  done < "$TOP10"
  wait
else
  while IFS= read -r line || [ -n "$line" ]; do
    process_line "$line"
  done < "$TOP10"
fi

echo "Done. Rerun artifacts in /tmp/playwright-reruns"
ls -1 /tmp/playwright-reruns | sed -n '1,200p'
