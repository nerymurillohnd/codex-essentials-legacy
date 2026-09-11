import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse } from "yaml";
import { describe, expect, it } from "vitest";

const workflow = parse(
  readFileSync(
    resolve(import.meta.dirname, "../.github/workflows/governance.yml"),
    "utf8",
  ),
) as {
  on?: Record<string, unknown>;
  jobs?: Record<
    string,
    {
      name?: string;
      permissions?: Record<string, string>;
      steps?: Array<{ name?: string; run?: string }>;
    }
  >;
};

describe("governance workflow", () => {
  it("requires a label for each pull request before it can merge", () => {
    expect(workflow.on).toMatchObject({
      pull_request_target: {
        types: ["opened", "reopened", "synchronize", "labeled", "unlabeled"],
      },
    });
    expect(workflow.jobs?.["pull-request-label"]).toMatchObject({
      name: "Required PR label",
      permissions: { "pull-requests": "read" },
    });
    expect(workflow.jobs?.["pull-request-label"]?.steps?.[0]?.run).toContain(
      "pull request requires at least one label",
    );
  });

  it("adds a triage label to issues that arrive without one", () => {
    expect(workflow.on).toMatchObject({
      issues: { types: ["opened", "reopened"] },
    });
    expect(workflow.jobs?.["issue-label"]).toMatchObject({
      name: "Apply issue triage label",
      permissions: { issues: "write" },
    });
    expect(workflow.jobs?.["issue-label"]?.steps?.[0]?.run).toContain(
      "needs-triage",
    );
  });

  it("requires a current independent approval for third-party pull requests", () => {
    expect(workflow.on).toMatchObject({
      pull_request_review: { types: ["submitted"] },
      workflow_dispatch: {
        inputs: { pr_number: { required: true, type: "string" } },
      },
    });
    expect(workflow.jobs?.["contributor-review"]).toMatchObject({
      name: "Required contributor review",
      permissions: { "pull-requests": "read" },
    });
    expect(workflow.jobs?.["contributor-review"]?.steps?.[0]?.run).toContain(
      "third-party pull request requires an approval",
    );
  });
});
