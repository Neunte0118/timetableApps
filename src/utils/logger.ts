/**
 * アプリ全体で使う共通ロガー。
 *
 * - 開発時はコンソールにそのまま出力
 * - 本番時は warn/error のみ出力（info/debug は抑制）
 * - 将来的に外部ログ収集サービス（Sentry等）に差し替えやすいよう、
 *   呼び出し側は console.* を直接使わずこのモジュール経由にする。
 */

type LogPayload = unknown;

const isDev = import.meta.env.DEV;

function format(scope: string | undefined, message: unknown): unknown[] {
    return scope ? [`[${scope}]`, message] : [message];
}

export const logger = {
    debug(message: unknown, ...rest: LogPayload[]) {
        if (!isDev) return;
        console.debug(...format(undefined, message), ...rest);
    },

    info(message: unknown, ...rest: LogPayload[]) {
        if (!isDev) return;
        console.info(...format(undefined, message), ...rest);
    },

    warn(message: unknown, ...rest: LogPayload[]) {
        console.warn(...format(undefined, message), ...rest);
    },

    error(message: unknown, ...rest: LogPayload[]) {
        console.error(...format(undefined, message), ...rest);
    },

    /**
     * 特定モジュール用にタグ付きロガーを作る。
     * 例: const log = logger.scope("useSubjectsData");
     *     log.error("読み込み失敗", e);
     */
    scope(scope: string) {
        return {
            debug: (message: unknown, ...rest: LogPayload[]) => {
                if (!isDev) return;
                console.debug(...format(scope, message), ...rest);
            },
            info: (message: unknown, ...rest: LogPayload[]) => {
                if (!isDev) return;
                console.info(...format(scope, message), ...rest);
            },
            warn: (message: unknown, ...rest: LogPayload[]) => {
                console.warn(...format(scope, message), ...rest);
            },
            error: (message: unknown, ...rest: LogPayload[]) => {
                console.error(...format(scope, message), ...rest);
            },
        };
    },
};
