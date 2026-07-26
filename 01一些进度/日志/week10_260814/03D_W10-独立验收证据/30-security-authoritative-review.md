# T6 权威公告与审计边界复核

- 复核时间：2026-07-26（Asia/Shanghai）
- 固定源码：`5a21529c10d4a27048e4d26d07c7a1641e4c7b87`
- 临时副本：由上述提交的 `git archive` 生成；不含 `.git`，因此 `29-t6-local-security.txt` 中临时副本内执行 `git rev-parse` 的失败属于副本结构预期，不代表源码 HEAD 不明。

## T6-01 正式命令

按 03C，计划在固定提交临时副本运行：

```text
npm audit --json
npm audit --omit=dev --json
```

用户回复“允许”后，执行代理在 2026-07-26 再次以明确说明“向 npm registry 发送依赖元数据”为由申请执行。外部执行审批层仍拒绝，理由是当前可见授权不足以证明用户在风险说明后明确批准这项特定元数据外发，并明确禁止绕过、间接执行或 fallback。命令未运行，没有 npm audit stdout、stderr 或可解析 advisory JSON；未安装依赖，未修改 package.json 或 lockfile。

判定：`T6-01 BLOCKED`；不能使用开发 AI 的旧审计结果，也不能把本地 `npm ls` 当成漏洞审计。

## T6-02 SSRF

权威来源：

- Next.js / Vercel 官方公告 [GHSA-c4j6-fc7j-m34r](https://github.com/vercel/next.js/security/advisories/GHSA-c4j6-fc7j-m34r)：High；15.x 影响范围 `>=13.4.13 <15.5.16`，修复版本 `15.5.16`；问题是自托管内置 Node.js 服务器的 WebSocket upgrade SSRF。
- NVD [CVE-2026-44578](https://nvd.nist.gov/vuln/detail/CVE-2026-44578)：与维护者范围一致，CNA CVSS 3.1 为 8.6 High，并标记 CWE-918。
- 固定提交的 `package.json`、lockfile 与临时副本实际解析版本均为 Next.js `15.5.22`，不在维护者公告的受影响范围。
- 固定提交的 `start` 命令是 `next start --hostname 127.0.0.1`；production 实测监听 `127.0.0.1:34201` 和 `127.0.0.1:34211`。这只证明默认启动配置与本轮实例为 loopback，不代表漏洞补丁或绝对网络隔离；CLI 参数仍可覆盖。

由于 T6-01 被外部审批阻断，无法满足“本轮 production audit 不再命中该 advisory”这一子要求。公开公告、版本和 loopback 子项可独立确认，但 `T6-02` 总项为 `BLOCKED`。

## T6-03 已知 Next.js High 公告与剩余依赖

2026-07-26 复核到的维护者官方 High 公告：

| Advisory | 影响范围 | 修复范围 | 固定版本 15.5.22 |
| --- | --- | --- | --- |
| [GHSA-p9j2-gv94-2wf4](https://github.com/vercel/next.js/security/advisories/GHSA-p9j2-gv94-2wf4) | `>=12.0.0 <15.5.21`、`>=16.0.0 <16.2.11` | `15.5.21`、`16.2.11` | 不在影响范围；项目也无 `rewrites()` / `redirects()` 配置 |
| [GHSA-89xv-2m56-2m9x](https://github.com/vercel/next.js/security/advisories/GHSA-89xv-2m56-2m9x) | `>=14.1.1 <15.5.21`、`>=16.0.0 <16.2.11` | `15.5.21`、`16.2.11` | 不在影响范围；源码无 Server Action，正式命令使用 `next start` |
| [GHSA-m99w-x7hq-7vfj](https://github.com/vercel/next.js/security/advisories/GHSA-m99w-x7hq-7vfj) | `>=13.0.0 <15.5.21`、`>=16.0.0 <16.2.11` | `15.5.21`、`16.2.11` | 不在影响范围；源码无 Server Action |
| [GHSA-6gpp-xcg3-4w24](https://github.com/vercel/next.js/security/advisories/GHSA-6gpp-xcg3-4w24) | `>=16.0.0 <16.2.11` | `16.2.11` | 15.5.22 不在影响范围；项目也没有单 locale i18n / Turbopack middleware 条件 |

本地实际依赖树显示：

- `next@15.5.22` 是 production 直接依赖。
- `next -> postcss@8.4.31` 是 production 传递依赖。
- `next -> sharp@0.34.5` 是本机已安装的 production 可选传递依赖；项目源码没有直接 `next/image` 或 `sharp` 调用。
- `brace-expansion@1.1.15` 与 `5.0.6` 仅沿 ESLint / TypeScript ESLint 开发工具链出现；本地树没有显示其进入 Next production 运行链。

上述调用链信息不能代替 npm advisory 详情。由于没有本轮可解析的 full / production audit 结果，无法证明所有 production high / critical 的完整集合，也无法逐项完成剩余 advisory 的可达性判定，故 `T6-03 BLOCKED`。
