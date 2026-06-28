export async function fetchJSON(url: string) {
    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok) {
        throw new Error(`Fetch failed: ${res.status}`);
    }

    return data;
}