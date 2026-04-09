import fs from 'node:fs';
import path from 'node:path';
import type {
  Reporter,
  FullConfig,
  FullResult,
  TestCase,
  TestResult,
  TestStep,
} from '@playwright/test/reporter';
import type {
  RunResult,
  TestCaseResult,
  TestResultStatus,
  StepResult,
  UsecaseResult,
} from './types';

interface ReporterOptions {
  /** 出力先ディレクトリ。指定が無ければ test-results/history */
  outputDir?: string;
}

/**
 * テスト結果を独自スキーマの JSON で 1 実行 = 1 ファイルとして history フォルダに蓄積する。
 * single-user-runner が登録する `test.step('login' | 'transition' | 'usecase: <id>')`
 * を識別して階層化する。
 */
export default class ResultJsonReporter implements Reporter {
  private readonly outputDir: string;
  private readonly runId: string;
  private readonly results: TestCaseResult[] = [];
  private startTime = '';
  private startTimestamp = 0;
  private environment: RunResult['environment'] = {};

  constructor(options: ReporterOptions = {}) {
    this.outputDir = options.outputDir
      ? path.isAbsolute(options.outputDir)
        ? options.outputDir
        : path.resolve(process.cwd(), options.outputDir)
      : path.resolve(process.cwd(), 'test-results', 'history');
    this.runId = formatRunId(new Date());
  }

  onBegin(config: FullConfig): void {
    this.startTimestamp = Date.now();
    this.startTime = new Date(this.startTimestamp).toISOString();
    const firstProject = config.projects[0];
    this.environment = {
      baseURL: firstProject?.use?.baseURL,
      browser: firstProject?.name,
      headless: firstProject?.use?.headless ?? undefined,
      ci: !!process.env.CI,
    };
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    const start = result.startTime.toISOString();
    const end = new Date(result.startTime.getTime() + result.duration).toISOString();

    const tcResult: TestCaseResult = {
      testName: test.title,
      status: mapStatus(result.status),
      startTime: start,
      endTime: end,
      durationMs: result.duration,
      retry: result.retry,
      usecases: [],
    };

    for (const step of result.steps) {
      if (step.category !== 'test.step') continue;
      const title = step.title;

      if (title === 'login') {
        tcResult.login = toStepResult(step);
      } else if (title === 'transition') {
        tcResult.transition = toStepResult(step);
      } else if (title.startsWith('usecase: ')) {
        const usecaseId = title.replace(/^usecase:\s*/, '');
        tcResult.usecases.push({
          ...toStepResult(step),
          'usecase-id': usecaseId,
        } as UsecaseResult);
      }
    }

    if (result.error) {
      tcResult.error = {
        message: stripAnsi(result.error.message ?? ''),
        stack: result.error.stack ? stripAnsi(result.error.stack) : undefined,
      };
    }

    const evidence = collectEvidence(result);
    if (evidence) tcResult.evidence = evidence;

    this.results.push(tcResult);
  }

  async onEnd(_result: FullResult): Promise<void> {
    const endTimestamp = Date.now();
    const summary = {
      total: this.results.length,
      passed: this.results.filter((r) => r.status === 'passed').length,
      failed: this.results.filter((r) => r.status === 'failed').length,
      skipped: this.results.filter((r) => r.status === 'skipped').length,
      timedOut: this.results.filter((r) => r.status === 'timedOut').length,
    };

    const runResult: RunResult = {
      schemaVersion: '1.0',
      runId: this.runId,
      startTime: this.startTime,
      endTime: new Date(endTimestamp).toISOString(),
      executionTimeMs: endTimestamp - this.startTimestamp,
      environment: this.environment,
      summary,
      results: this.results,
    };

    fs.mkdirSync(this.outputDir, { recursive: true });
    const outFile = path.join(this.outputDir, `result-${this.runId}.json`);
    fs.writeFileSync(outFile, JSON.stringify(runResult, null, 2), 'utf-8');
    // eslint-disable-next-line no-console
    console.log(`\n[ResultJsonReporter] wrote ${outFile}`);
  }
}

function toStepResult(step: TestStep): StepResult {
  const start = step.startTime.toISOString();
  const end = new Date(step.startTime.getTime() + step.duration).toISOString();
  const result: StepResult = {
    name: step.title,
    status: step.error ? 'failed' : 'passed',
    startTime: start,
    endTime: end,
    durationMs: step.duration,
  };
  if (step.error) {
    result.error = {
      message: stripAnsi(step.error.message ?? ''),
      stack: step.error.stack ? stripAnsi(step.error.stack) : undefined,
    };
  }
  return result;
}

function collectEvidence(result: TestResult): TestCaseResult['evidence'] | undefined {
  const screenshots: string[] = [];
  let video: string | undefined;
  let trace: string | undefined;

  for (const att of result.attachments) {
    if (!att.path) continue;
    if (att.contentType?.startsWith('image/')) screenshots.push(att.path);
    else if (att.contentType?.startsWith('video/')) video = att.path;
    else if (att.name === 'trace') trace = att.path;
  }

  if (!screenshots.length && !video && !trace) return undefined;
  return {
    screenshots: screenshots.length ? screenshots : undefined,
    video,
    trace,
  };
}

function mapStatus(status: TestResult['status']): TestResultStatus {
  switch (status) {
    case 'passed':
    case 'failed':
    case 'timedOut':
    case 'skipped':
    case 'interrupted':
      return status;
    default:
      return 'failed';
  }
}

function formatRunId(date: Date): string {
  const pad = (n: number, w = 2) => n.toString().padStart(w, '0');
  return (
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
    `-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}` +
    `-${pad(date.getMilliseconds(), 3)}`
  );
}

// Playwright のエラーメッセージは ANSI カラーコードを含むので除去する
function stripAnsi(s: string): string {
  // eslint-disable-next-line no-control-regex
  return s.replace(/\u001b\[[0-9;]*m/g, '');
}
