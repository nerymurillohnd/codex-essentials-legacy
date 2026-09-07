export const coverageProfiles = {
  "coverage-contract.test.ts": [],
  "error-utils.test.ts": ["scripts/error-utils.cjs"],
  "github-labels.test.ts": [
    "scripts/github-labels.cjs",
    "scripts/validate-github-labels.cjs",
  ],
  "marketplace-pipeline.test.ts": [
    "scripts/documentation-gate.cjs",
    "scripts/generate-marketplace.cjs",
    "scripts/marketplace-contract.cjs",
    "scripts/validate-marketplace.cjs",
    "scripts/validate-plugins.cjs",
  ],
  "path-utils.test.ts": ["scripts/path-utils.cjs"],
  "project-bootstrap.test.ts": ["scripts/project-bootstrap.cjs"],
  "quality-workflow.test.ts": [],
  "release-contract.test.ts": ["scripts/validate-release-contract.cjs"],
  "script-entrypoints.test.ts": ["scripts/plugin-manifest-guard.cjs"],
  "typecheck.test.ts": ["scripts/typecheck.cjs"],
} as const;

export function resolveCoverageInclude(args: readonly string[]) {
  const selectedProfiles = Object.entries(coverageProfiles).filter(
    ([testFile]) => args.some((argument) => argument.endsWith(testFile)),
  );
  const sources =
    selectedProfiles.length > 0
      ? selectedProfiles.flatMap(([, profile]) => profile)
      : Object.values(coverageProfiles).flat();
  return [...new Set(sources)];
}
