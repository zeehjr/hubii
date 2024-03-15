import { ZodIssue } from 'zod';

export class DivergentSchemaError extends Error {
  issues: ZodIssue[];
  constructor(serviceName: string, url: string, issues: ZodIssue[]) {
    const stringIssues = issues.map((issue) => issue.path).join(',');
    console.log(issues);
    super(
      `Divergent schema on service ${serviceName}, at url ${url}: ${stringIssues}`
    );
    this.issues = issues;
  }
}
