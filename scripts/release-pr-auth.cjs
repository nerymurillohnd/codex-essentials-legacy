#!/usr/bin/env node
// @ts-check

const RELEASE_PR_TITLE_PATTERN = /^chore(?:\([^()\r\n]+\))?: release\b/u;
const RELEASE_PR_LABELS = new Set([
  "autorelease: pending",
  "autorelease: tagged",
]);

/** @param {string} title @param {string} authorType @param {string[]} labels */
function isTrustedReleasePleasePullRequest(title, authorType, labels) {
  return (
    authorType === "Bot" &&
    RELEASE_PR_TITLE_PATTERN.test(title) &&
    labels.some((label) => RELEASE_PR_LABELS.has(label))
  );
}

module.exports = {
  isTrustedReleasePleasePullRequest,
  RELEASE_PR_LABELS,
  RELEASE_PR_TITLE_PATTERN,
};
