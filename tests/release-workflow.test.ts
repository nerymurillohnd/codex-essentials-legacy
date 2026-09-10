import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse } from "yaml";
import { describe, expect, it } from "vitest";

type Step = {
  name?: string;
  uses?: string;
  run?: string;
  if?: string;
  env?: Record<string, string>;
  with?: Record<string, unknown>;
};

type Workflow = {
  jobs?: Record<string, { steps?: Step[] }>;
};

const repositoryRoot = resolve(import.meta.dirname, "..");
const workflow = parse(
  readFileSync(
    resolve(repositoryRoot, ".github/workflows/release-please.yml"),
    "utf8",
  ),
) as Workflow;
const releaseSteps = workflow.jobs?.["release"]?.steps ?? [];
const validateSteps = workflow.jobs?.["validate"]?.steps ?? [];

function step(name: string): Step {
  const result = releaseSteps.find((candidate) => candidate.name === name);
  expect(result).toBeDefined();
  return result!;
}

describe("release workflow", () => {
  it("installs the required npm version before project commands", () => {
    for (const steps of [validateSteps]) {
      const setupIndex = steps.findIndex(
        (candidate) => candidate.name === "Set up Node.js",
      );
      expect(setupIndex).toBeGreaterThanOrEqual(0);
      expect(steps[setupIndex]).toMatchObject({
        with: {
          "node-version-file": ".nvmrc",
          "package-manager-cache": false,
        },
      });
      expect(steps[setupIndex + 1]).toMatchObject({
        name: "Install repository npm",
        run:
          [
            'cd "$RUNNER_TEMP"',
            "npm install --global npm@12.0.2",
            "npm --version",
          ].join("\n") + "\n",
      });
    }
  });

  it("formats generated release changelogs before dispatching quality", () => {
    expect(
      step("Set up Node.js for generated release pull requests"),
    ).toMatchObject({
      if: "steps.release.outputs.prs_created == 'true'",
      uses: "actions/setup-node@820762786026740c76f36085b0efc47a31fe5020",
      with: {
        "node-version-file": ".nvmrc",
        "package-manager-cache": false,
      },
    });
    expect(
      step("Install repository npm for generated release pull requests"),
    ).toMatchObject({
      if: "steps.release.outputs.prs_created == 'true'",
      run:
        [
          'cd "$RUNNER_TEMP"',
          "npm install --global npm@12.0.2",
          "npm --version",
        ].join("\n") + "\n",
    });
    expect(
      step("Install dependencies for generated release pull requests"),
    ).toMatchObject({
      if: "steps.release.outputs.prs_created == 'true'",
      run: "HUSKY=0 npm ci",
    });
    const format = step("Format generated release pull requests");
    expect(format).toMatchObject({
      if: "steps.release.outputs.prs_created == 'true'",
      env: {
        GH_TOKEN: "${{ secrets.GITHUB_TOKEN }}",
        RELEASE_PRS: "${{ steps.release.outputs.prs }}",
      },
    });
    expect(format.run).toContain(
      'git diff --name-only "origin/main...HEAD" -- "plugins/*/CHANGELOG.md"',
    );
    expect(format.run).toContain("npm exec prettier --write -- $changelogs");
    expect(format.run).toContain(
      'gh api --method PATCH "repos/${GITHUB_REPOSITORY}/git/refs/heads/${branch}"',
    );
    expect(format.run).toContain("-F force=false");
    expect(
      releaseSteps.findIndex(
        (candidate) =>
          candidate.name === "Format generated release pull requests",
      ),
    ).toBeLessThan(
      releaseSteps.findIndex(
        (candidate) =>
          candidate.name === "Run quality for generated release pull requests",
      ),
    );
  });
});
