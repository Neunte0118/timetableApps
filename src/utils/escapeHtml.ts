const ESCAPE_MAP: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
};

export function escapeHtml(input: string): string {
    return input.replace(/[&<>"']/g, (ch) => ESCAPE_MAP[ch]);
}

export function escapeHtmlWithoutWhiteList(input: string): string {
    const links: string[] = [];

    // 許可する <a href="...">...</a> を退避
    input = input.replace(
        /<a\s+href="(https?:\/\/[^"]+)">([\s\S]*?)<\/a>/gi,
        (_, href, text) => {
            const i = links.length;
            links.push(
                `<a href="${href}" target="_blank" rel="noopener noreferrer">${escapeHtml(text)}</a>`
            );
            return `__LINK_${i}__`;
        }
    );

    // 全体をエスケープ
    let html = escapeHtml(input);

    // <br> を復元
    html = html.replace(/&lt;br\s*\/?&gt;/gi, "<br />");

    // リンクを復元
    links.forEach((link, i) => {
        html = html.replace(`__LINK_${i}__`, link);
    });

    return html;
}