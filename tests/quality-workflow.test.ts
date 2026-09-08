import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse } from "yaml";
import { describe, expect, it } from "vitest";

const repositoryRoot = resolve(import.meta.dirname, "..");
const workflowPath = resolve(repositoryRoot, ".github/workflows/quality.yml");
const prettierWorkflowPath = resolve(
  repositoryRoot,
  ".github/workflows/prettier.yml",
);
const checkoutAction =
  "actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1";
const setupNodeAction =
  "actions/setup-node@820762786026740c76f36085b0efc47a31fe5020";
const autofixAction =
  "autofix-ci/action@c5b2d67aa2274e7b5a18224e8171550871fc7e4a";

interface WorkflowStep {
  name?: string;
  uses?: string;
  run?: string;
  if?: string;
  env?: Record<string, string>;
  with?: Record<string, unknown>;
  "continue-on-error"?: boolean;
}

interface WorkflowJob {
  name?: string;
  "runs-on"?: string;
  "timeout-minutes"?: number;
  if?: string;
  "continue-on-error"?: boolean;
  steps?: WorkflowStep[];
}

interface Workflow {
  name?: string;
  on?: Record<string, unknown>;
  permissions?: Record<string, string>;
  concurrency?: {
    group?: string;
    "cancel-in-progress"?: boolean;
  };
  jobs?: Record<string, WorkflowJob>;
}

const workflow = parse(readFileSync(workflowPath, "utf8")) as Workflow;
const prettierWorkflow = parse(
  readFileSync(prettierWorkflowPath, "utf8"),
) as Workflow;

function getOnlyJob(): WorkflowJob {
  const jobs = Object.values(workflow.jobs ?? {});
  expect(jobs).toHaveLength(1);
  return jobs[0]!;
}

function getStep(name: string): WorkflowStep {
  const step = getOnlyJob().steps?.find((candidate) => candidate.name === name);
  expect(step).toBeDefined();
  return step!;
}

describe("quality workflow", () => {
  it("runs for every pull request, generated release dispatch, and pushes only to main", () => {
    expect(workflow.on).toEqual({
      pull_request: null,
      workflow_dispatch: {
        inputs: {
          base_sha: { required: true, type: "string" },
          head_sha: { required: true, type: "string" },
          pr_title: { required: false, type: "string", default: "" },
          pr_author_type: { required: false, type: "string", default: "" },
          pr_labels: { required: false, type: "string", default: "" },
          checkout_ref: { required: false, type: "string", default: "" },
        },
      },
      push: { branches: ["main"] },
    });
  });

  it("uses read-only permissions and cancels only superseded runs", () => {
    expect(workflow.permissions).toEqual({ contents: "read" });
    expect(workflow.concurrency).toEqual({
      group:
        "${{ github.workflow }}-${{ github.event.pull_request.number || inputs.checkout_ref || github.ref }}",
      "cancel-in-progress": true,
    });
  });

  it("defines one stable bounded quality job", () => {
    expect(getOnlyJob()).toMatchObject({
      name: "Required quality gates",
      "runs-on": "ubuntu-latest",
      "timeout-minutes": 15,
    });
  });

  it("keeps the approved steps in exact order without extra actions", () => {
    expect(
      getOnlyJob().steps?.map(({ name, uses, run, if: condition }) => ({
        name,
        uses,
        run,
        if: condition,
      })),
    ).toEqual([
      {
        name: "Check out repository",
        uses: checkoutAction,
        run: undefined,
        if: undefined,
      },
      {
        name: "Set up Node.js",
        uses: setupNodeAction,
        run: undefined,
        if: undefined,
      },
      {
        name: "Install dependencies",
        uses: undefined,
        run: "HUSKY=0 npm ci",
        if: undefined,
      },
      {
        name: "Run quality checks",
        uses: undefined,
        run: "npm run check",
        if: undefined,
      },
      {
        name: "Run plugin documentation gate",
        uses: undefined,
        run:
          [
            "set -euo pipefail",
            'gate_dir="$RUNNER_TEMP/release-documentation-gate"',
            'mkdir -p "$gate_dir"',
            "git fetch origin main",
            'git show origin/main:scripts/documentation-gate.cjs > "$gate_dir/documentation-gate.cjs"',
            'git show origin/main:scripts/error-utils.cjs > "$gate_dir/error-utils.cjs"',
            'git show origin/main:scripts/release-pr-auth.cjs > "$gate_dir/release-pr-auth.cjs"',
            'node "$gate_dir/documentation-gate.cjs" --root "$GITHUB_WORKSPACE" \\',
            '  --base "$BASE_SHA" \\',
            '  --head "$HEAD_SHA" \\',
            '  --title "$PR_TITLE" \\',
            '  --author-type "$PR_AUTHOR_TYPE" \\',
            '  --labels "$PR_LABELS"',
          ].join("\n") + "\n",
        if: "github.event_name == 'pull_request' || github.event_name == 'workflow_dispatch'",
      },
      {
        name: "Validate plugin change routing",
        uses: undefined,
        run:
          [
            "set -euo pipefail",
            'contract_dir="$RUNNER_TEMP/release-contract"',
            'mkdir -p "$contract_dir"',
            "git fetch origin main",
            'git show origin/main:scripts/validate-release-contract.cjs > "$contract_dir/validate-release-contract.cjs"',
            'git show origin/main:scripts/marketplace-contract.cjs > "$contract_dir/marketplace-contract.cjs"',
            'git show origin/main:scripts/error-utils.cjs > "$contract_dir/error-utils.cjs"',
            'git show origin/main:scripts/release-pr-auth.cjs > "$contract_dir/release-pr-auth.cjs"',
            'NODE_PATH="$GITHUB_WORKSPACE/node_modules" node "$contract_dir/validate-release-contract.cjs" --root "$GITHUB_WORKSPACE" \\',
            '  --base "$BASE_SHA" \\',
            '  --head "$HEAD_SHA" \\',
            '  --title "$PR_TITLE" \\',
            '  --author-type "$PR_AUTHOR_TYPE" \\',
            '  --labels "$PR_LABELS"',
          ].join("\n") + "\n",
        if: "github.event_name == 'pull_request' || github.event_name == 'workflow_dispatch'",
      },
      {
        name: "Validate direct-push routing",
        uses: undefined,
        run: 'npm run validate:release-contract -- --base "$BASE_SHA" --head "$HEAD_SHA" --direct',
        if: "github.event_name == 'push'",
      },
    ]);
  });

  it("pins checkout and Node setup with deterministic inputs", () => {
    expect(getStep("Check out repository")).toMatchObject({
      uses: checkoutAction,
      with: { "fetch-depth": 0, ref: "${{ inputs.checkout_ref || '' }}" },
    });
    expect(getStep("Set up Node.js")).toMatchObject({
      uses: setupNodeAction,
      with: {
        "node-version-file": ".nvmrc",
        cache: "npm",
        "cache-dependency-path": "package-lock.json",
      },
    });
  });

  it("installs locked dependencies and always runs the canonical gate", () => {
    expect(getStep("Install dependencies")).toMatchObject({
      run: "HUSKY=0 npm ci",
    });
    const qualityStep = getStep("Run quality checks");
    expect(qualityStep.run).toBe("npm run check");
    expect(qualityStep).not.toHaveProperty("if");
  });

  it("runs documentation validation with quoted PR or dispatched SHAs", () => {
    expect(getStep("Run plugin documentation gate")).toMatchObject({
      if: "github.event_name == 'pull_request' || github.event_name == 'workflow_dispatch'",
      env: {
        BASE_SHA:
          "${{ github.event.pull_request.base.sha || inputs.base_sha }}",
        HEAD_SHA:
          "${{ github.event.pull_request.head.sha || inputs.head_sha }}",
        PR_TITLE: "${{ github.event.pull_request.title || inputs.pr_title }}",
        PR_AUTHOR_TYPE:
          "${{ github.event.pull_request.user.type || inputs.pr_author_type }}",
        PR_LABELS:
          "${{ join(github.event.pull_request.labels.*.name, ',') || inputs.pr_labels }}",
      },
      run:
        [
          "set -euo pipefail",
          'gate_dir="$RUNNER_TEMP/release-documentation-gate"',
          'mkdir -p "$gate_dir"',
          "git fetch origin main",
          'git show origin/main:scripts/documentation-gate.cjs > "$gate_dir/documentation-gate.cjs"',
          'git show origin/main:scripts/error-utils.cjs > "$gate_dir/error-utils.cjs"',
          'git show origin/main:scripts/release-pr-auth.cjs > "$gate_dir/release-pr-auth.cjs"',
          'node "$gate_dir/documentation-gate.cjs" --root "$GITHUB_WORKSPACE" \\',
          '  --base "$BASE_SHA" \\',
          '  --head "$HEAD_SHA" \\',
          '  --title "$PR_TITLE" \\',
          '  --author-type "$PR_AUTHOR_TYPE" \\',
          '  --labels "$PR_LABELS"',
        ].join("\n") + "\n",
    });
  });

  it("enforces path-based plugin routing with the same PR or dispatched SHAs", () => {
    expect(getStep("Validate plugin change routing")).toMatchObject({
      if: "github.event_name == 'pull_request' || github.event_name == 'workflow_dispatch'",
      env: {
        BASE_SHA:
          "${{ github.event.pull_request.base.sha || inputs.base_sha }}",
        HEAD_SHA:
          "${{ github.event.pull_request.head.sha || inputs.head_sha }}",
        PR_TITLE: "${{ github.event.pull_request.title || inputs.pr_title }}",
        PR_AUTHOR_TYPE:
          "${{ github.event.pull_request.user.type || inputs.pr_author_type }}",
        PR_LABELS:
          "${{ join(github.event.pull_request.labels.*.name, ',') || inputs.pr_labels }}",
      },
      run:
        [
          "set -euo pipefail",
          'contract_dir="$RUNNER_TEMP/release-contract"',
          'mkdir -p "$contract_dir"',
          "git fetch origin main",
          'git show origin/main:scripts/validate-release-contract.cjs > "$contract_dir/validate-release-contract.cjs"',
          'git show origin/main:scripts/marketplace-contract.cjs > "$contract_dir/marketplace-contract.cjs"',
          'git show origin/main:scripts/error-utils.cjs > "$contract_dir/error-utils.cjs"',
          'git show origin/main:scripts/release-pr-auth.cjs > "$contract_dir/release-pr-auth.cjs"',
          'NODE_PATH="$GITHUB_WORKSPACE/node_modules" node "$contract_dir/validate-release-contract.cjs" --root "$GITHUB_WORKSPACE" \\',
          '  --base "$BASE_SHA" \\',
          '  --head "$HEAD_SHA" \\',
          '  --title "$PR_TITLE" \\',
          '  --author-type "$PR_AUTHOR_TYPE" \\',
          '  --labels "$PR_LABELS"',
        ].join("\n") + "\n",
    });
  });

  it("allows no job or step to hide or skip a failure", () => {
    const job = getOnlyJob();
    expect(job).not.toHaveProperty("continue-on-error");
    expect(job).not.toHaveProperty("if");
    for (const step of job.steps ?? []) {
      expect(step).not.toHaveProperty("continue-on-error");
    }
  });
});

describe("prettier autofix workflow", () => {
  function getPrettierJob(): WorkflowJob {
    const job = prettierWorkflow.jobs?.["prettier"];
    expect(job).toBeDefined();
    return job!;
  }

  function getPrettierStep(name: string): WorkflowStep {
    const step = getPrettierJob().steps?.find(
      (candidate) => candidate.name === name,
    );
    expect(step).toBeDefined();
    return step!;
  }

  it("uses npm and the repository Node version for formatting", () => {
    expect(prettierWorkflow.permissions).toEqual({ contents: "write" });
    expect(getPrettierJob()).toMatchObject({
      "runs-on": "ubuntu-latest",
      "timeout-minutes": 10,
    });
    expect(getPrettierStep("Check out repository").uses).toBe(checkoutAction);
    expect(getPrettierStep("Set up Node.js")).toMatchObject({
      uses: setupNodeAction,
      with: {
        "node-version-file": ".nvmrc",
        cache: "npm",
        "cache-dependency-path": "package-lock.json",
      },
    });
    expect(getPrettierStep("Install dependencies").run).toBe("HUSKY=0 npm ci");
    expect(getPrettierStep("Format repository").run).toBe("npm run format");
    expect(getPrettierStep("Commit autofix changes")).toMatchObject({
      uses: autofixAction,
      with: { "commit-message": "Apply Prettier format" },
    });
  });

  it("does not reintroduce Yarn into the formatter workflow", () => {
    const workflowText = readFileSync(prettierWorkflowPath, "utf8");
    expect(workflowText).not.toMatch(/\byarn\b/u);
  });
});
