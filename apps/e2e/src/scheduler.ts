/**
 * @fileoverview E2E テスト用 cron スケジューラ
 *
 * `cron-schedule.json` に定義されたジョブ一覧を登録し、
 * 指定スケジュールで子プロセスとしてコマンドを実行する。
 *
 * node-cron を使用しています。
 * https://github.com/node-cron/node-cron
 *
 * @example 起動方法
 * ```bash
 * npx tsx src/scheduler.ts
 * ```
 *
 * @example cron-schedule.json の書式
 * ```json
 * [
 *   {
 *     "name": "hoge-e2e",
 *     "schedule": "0 3 * * *",
 *     "command": "TEST_BASE=single-user.Agroup001.json pnpm test",
 *     "timezone": "Asia/Tokyo"
 *   }
 * ]
 * ```
 *
 * @module scheduler
 */
import cron from 'node-cron';
import { exec } from 'child_process';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

/**
 * cron-schedule.json の 1 エントリに対応するジョブ定義。
 */
interface CronJob {
  /** ログ出力に使用されるジョブの識別名 */
  name: string;
  /** node-cron 互換の cron 式 (例: `"0 3 * * *"`) */
  schedule: string;
  /** 子プロセスで実行するシェルコマンド */
  command: string;
  /** IANA タイムゾーン文字列。省略時は UTC として扱われる */
  timezone?: string;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const e2eRoot = resolve(__dirname, '..');
const scheduleFile = resolve(e2eRoot, 'cron-schedule.json');
const jobs: CronJob[] = JSON.parse(readFileSync(scheduleFile, 'utf-8'));

console.log(`[scheduler] ${jobs.length} 件のジョブを登録します`);

for (const job of jobs) {
  if (!cron.validate(job.schedule)) {
    console.error(`[scheduler] 無効なcron式: "${job.schedule}" (${job.name})`);
    continue;
  }

  cron.schedule(job.schedule, () => {
    const startTime = new Date().toISOString();
    console.log(`[scheduler] [${startTime}] "${job.name}" 開始: ${job.command}`);

    exec(job.command, { cwd: e2eRoot }, (error, stdout, stderr) => {
      const endTime = new Date().toISOString();
      if (stdout) console.log(stdout);
      if (stderr) console.error(stderr);

      if (error) {
        console.error(`[scheduler] [${endTime}] "${job.name}" 失敗 (exit code: ${error.code})`);
      } else {
        console.log(`[scheduler] [${endTime}] "${job.name}" 完了`);
      }
    });
  }, {
    timezone: job.timezone,
  });

  console.log(`[scheduler] "${job.name}" 登録完了 — ${job.schedule} (${job.timezone ?? 'UTC'})`);
}

console.log('[scheduler] スケジューラ起動完了。ジョブ待機中...');
