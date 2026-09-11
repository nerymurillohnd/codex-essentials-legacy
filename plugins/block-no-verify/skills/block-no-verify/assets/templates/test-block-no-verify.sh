#!/usr/bin/env bash
# Proves block-no-verify.py denies every named bypass (--no-verify,
# --no-gpg-sign, -c commit.gpgsign=false and its falsy synonyms) by every
# route — direct, chained, wrapped in sudo/env/nice/timeout/xargs, with a
# leading VAR= assignment, in any case (git binary name, flag values) — and
# that it does NOT deny ordinary git usage or a commit message that merely
# mentions the flag as quoted text. Run after any edit to the hook.
set -uo pipefail

HOOK="$(cd "$(dirname "$0")" && pwd)/block-no-verify.py"
pass=0
fail=0

verdict() {
  local value="$1" encoded
  encoded=$(printf '%s' "${value}" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))')
  printf '{"tool_name":"Bash","tool_input":{"command":%s}}' "${encoded}" |
    python3 "${HOOK}" |
    python3 -c 'import json,sys
raw=sys.stdin.read().strip()
if not raw: print("ALLOW"); raise SystemExit
print(json.loads(raw)["hookSpecificOutput"]["permissionDecision"].upper())'
}

want() { # want <expected> <command>
  local expected="$1" got
  got=$(verdict "$2")
  if [[ "${got}" == "${expected}" ]]; then
    pass=$((pass + 1))
  else
    fail=$((fail + 1))
    printf '  FAIL: expected %-5s got %-5s :: %s\n' "${expected}" "${got}" "$2"
  fi
}

echo "=== A. direct bypasses ==="
want DENY 'git commit -m "x" --no-verify'
want DENY 'git commit --no-gpg-sign -m "x"'
want DENY 'git commit -m "x" -c commit.gpgsign=false'
want DENY 'git -c commit.gpgsign=false commit -m "x"'
want DENY 'git --config commit.gpgsign=false commit -m "x"'

echo "=== B. wrapper bypasses ==="
for wrapper in "sudo" "env" "nice" "nohup" "timeout 5" "xargs" "command" "builtin" "noglob" "watch"; do
  want DENY "${wrapper} git commit -m \"x\" --no-verify"
done
want DENY 'GIT_AUTHOR_NAME=x git commit -m "x" --no-verify'
want DENY 'sudo env GIT_AUTHOR_NAME=x nice git commit -m "x" --no-verify'

echo "=== C. chained bypasses ==="
want DENY 'ls && git commit -m "x" --no-verify'
want DENY 'ls; sudo git commit -m "x" --no-verify'
want DENY 'true || git commit --no-gpg-sign -m "x"'

echo "=== D. case-insensitive bypasses ==="
want DENY 'GIT commit -m "x" --no-verify'
want DENY 'Git commit --no-gpg-sign -m "x"'
want DENY 'sudo GIT commit -m "x" --no-verify'
want DENY 'git -c commit.gpgsign=FALSE commit -m "x"'
want DENY 'git -c commit.gpgsign=False commit -m "x"'

echo "=== E. falsy commit.gpgsign values ==="
want DENY 'git -c commit.gpgsign=no commit -m "x"'
want DENY 'git -c commit.gpgsign=off commit -m "x"'
want DENY 'git -c commit.gpgsign=0 commit -m "x"'
want DENY 'git -c commit.gpgsign=NO commit -m "x"'
want DENY 'git -c commit.gpgsign=OFF commit -m "x"'

echo
echo "=== F. negative controls ==="
want ALLOW 'git status'
want ALLOW 'git commit -m "x"'
want ALLOW 'git commit -m "docs: explain --no-verify blocking"'
want ALLOW 'git commit -m "say \"hello\""'
want ALLOW 'git push origin main'
want ALLOW 'sudo git log'
want ALLOW 'env FOO=bar git status'
want ALLOW 'timeout 5 git status'
want ALLOW 'git -c color.ui=always status'
want ALLOW 'git -c commit.gpgsign=funky-not-a-bool commit -m "x"'
want ALLOW 'GIT status'

echo
echo "=== G. fail-closed corrupt input ==="
json_verdict() {
  printf '%s' "$1" | python3 "${HOOK}" | python3 -c 'import json,sys
raw=sys.stdin.read().strip()
if not raw: print("ALLOW"); raise SystemExit
print(json.loads(raw)["hookSpecificOutput"]["permissionDecision"].upper())'
}
got=$(json_verdict 'this is not json')
if [[ "${got}" == "DENY" ]]; then
  pass=$((pass + 1))
else
  fail=$((fail + 1))
  printf '  FAIL: invalid JSON should deny, got %s\n' "${got}"
fi
got=$(json_verdict '{"tool_name":"Bash"}')
if [[ "${got}" == "ALLOW" ]]; then
  pass=$((pass + 1))
else
  fail=$((fail + 1))
  printf '  FAIL: missing tool_input should allow, got %s\n' "${got}"
fi

echo
printf 'passed: %d   failed: %d\n' "${pass}" "${fail}"
[[ "${fail}" -eq 0 ]] && {
  echo "PASS"
  exit 0
}
echo "FAILED"
exit 1
