export async function fetchJSON<T = unknown>(url: string): Promise<T> {
    const res = await fetch(url);

    if (!res.ok) {
        throw new Error(`Fetch failed: ${res.status} ${res.statusText} (${url})`);
    }

    return (await res.json()) as T;
}
