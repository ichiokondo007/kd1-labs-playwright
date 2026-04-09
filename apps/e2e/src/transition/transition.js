import transitionConfig from '../transition.json';
const config = transitionConfig;
/** single-user JSON の transitions.checkTimeoutMs 未指定・null 時の待ち（ミリ秒） */
const TRANSITION_CHECK_TIMEOUT = 10000;
/**
 * pageurl テンプレートと params から実際の URL を組み立てる。
 * 例: "/example/canvas-yjs/:id" + [{ id: "abc" }] -> "/example/canvas-yjs/abc"
 */
function buildUrl(pageurl, params) {
    if (!params || params.length === 0)
        return pageurl;
    const replacements = params[0];
    let url = pageurl;
    for (const [key, value] of Object.entries(replacements)) {
        url = url.replace(`:${key}`, value);
    }
    return url;
}
/**
 * transition.json（SSOT）から pageurl に対応する data-testid を取得する。
 * 登録が無い場合はエラーを throw する。
 */
function getDataTestIdByPageurl(pageurl) {
    const entry = config.transitions.find((e) => e.pageurl === pageurl);
    if (!entry) {
        throw new Error(`transition.json に pageurl "${pageurl}" が登録されていません。SSOT のため登録が必要です。`);
    }
    return entry['data-testid'];
}
/**
 * 指定されたページURLへ遷移し、transition.json で定義された data-testid の要素が
 * 表示されるまで待つ。表示されない場合は指定フォーマットでエラーを throw する。
 */
export async function transition(page, params) {
    const { pageurl, params: urlParams, checkTimeoutMs, testName = '', loginUser = '' } = params;
    const waitMs = checkTimeoutMs ?? TRANSITION_CHECK_TIMEOUT;
    const expectedDataTestId = getDataTestIdByPageurl(pageurl);
    const url = buildUrl(pageurl, urlParams);
    await page.goto(url);
    await page.waitForLoadState('domcontentloaded');
    try {
        await page
            .getByTestId(expectedDataTestId)
            .waitFor({ state: 'visible', timeout: waitMs });
    }
    catch {
        throw new Error(`testName:${testName}, loginUser:${loginUser}, transitioncheck:${expectedDataTestId} NG`);
    }
}
