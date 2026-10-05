# Dependency Security Review

Audit date: 2026-10-05

## Summary

`npm audit` reported 6 vulnerable package nodes: 1 high, 4 moderate, 1 low, and 0 critical. There are 6 distinct advisories. The three Vite advisories are aggregated under one package node.

This review is based on the dependency tree and published advisories; it does not independently demonstrate exploitability in the application.

## Findings

| # | Severity | Package / version | Dependency path | Advisory and impact |
|---|----------|-------------------|-----------------|---------------------|
| 1 | HIGH | `vite@5.4.21` | Direct dev dependency | [GHSA-fx2h-pf6j-xcff](https://github.com/advisories/GHSA-fx2h-pf6j-xcff): Windows alternate-path bypass of `server.fs.deny` (affected `<=6.4.2`). npm suggests `vite@8.3.2`, a major upgrade. |
| 2 | MODERATE | `vite@5.4.21` | Direct dev dependency | [GHSA-4w7w-66w2-5vf9](https://github.com/advisories/GHSA-4w7w-66w2-5vf9): optimized-dependency `.map` path traversal (affected `<=6.4.1`). |
| 3 | MODERATE | `vite@5.4.21` | Direct dev dependency | [GHSA-v6wh-96g9-6wx3](https://github.com/advisories/GHSA-v6wh-96g9-6wx3): Windows UNC-path handling may disclose NTLMv2 hashes (affected `<=6.4.2`). |
| 4 | MODERATE | `esbuild@0.21.5` | Transitive via Vite | [GHSA-67mh-4wv8-2f99](https://github.com/advisories/GHSA-67mh-4wv8-2f99): a website can send requests to the development server and read responses (affected `<=0.24.2`). npm's suggested Vite upgrade is a major upgrade. |
| 5 | LOW | `serialize-javascript@7.1.1` | Transitive via `vite-plugin-pwa` / Workbox | [GHSA-gfhx-hw2g-v5hg](https://github.com/advisories/GHSA-gfhx-hw2g-v5hg): XSS through an unescaped `</script>` in serialized function bodies (affected `>=7.1.1 <7.1.2`). |
| 6 | MODERATE | `uuid@7.0.3` | Transitive via `@capacitor/cli@8.5.2` -> `xcode@3.0.1` | [GHSA-w5hq-g745-h8pq](https://github.com/advisories/GHSA-w5hq-g745-h8pq): missing buffer bounds check in UUID v3/v5/v6 when a buffer is provided (affected `<11.1.1`). npm also reports the containing `xcode` and `@capacitor/cli` nodes as affected by this same advisory. |

## Recommended remediation

- Upgrade Vite to a patched version and validate compatibility with the Vite plugins; npm's current suggested fix is `vite@8.3.2`, which is outside the declared Vite 5 range.
- Apply the non-breaking fixes offered by `npm audit fix` for the remaining dependency paths, then verify the resulting tree and run the build. Review compatibility before using overrides or major upgrades for the Capacitor CLI / `xcode` / `uuid` chain.
