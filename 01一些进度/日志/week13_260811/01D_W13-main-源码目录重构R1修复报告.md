# Week 13 main 源码目录重构 R1 修复报告

日期：2026-08-12

状态：`R1 开发执行 PASS；等待独立审计，尚未授权合并`

文档角色：针对 `01C_W13-main-源码目录重构独立审计问题与修复清单.md` 的 R1 修复完成报告

源码轨道：`01一些进度/产出/LocalFirstTradingLedger/`

源码分支：`zhennn/w13-main-source-layout`

## 一、最终结论（必填 1）

本轮判定为 `PASS`。

`01C` 确认的四类问题均已完成修复和验证：15 处自身稳定入口引用清零，3 组涉及 14 个文件的静态依赖环清零，结构守卫能够永久识别自身入口与静态循环，macOS Open picker 已提供可用的“所有文件”回退且应用自身仍拒绝非 `.lftl` 文件。

最终干净分支上的自动检查为 59 个测试文件、737 项测试全部通过，lint、production build、typecheck、`git diff --check` 全部通过。真实 Google Chrome 与原生 macOS 选择器完成了虚构 V2 `.lftl` 的创建、含费交易保存、锁定释放、无 Finder 搜索重选、同密码复读、非 `.lftl` 拒绝、1280px / 390px 响应式和 console 检查。

该 `PASS` 只说明 R1 开发执行满足本批完成线；仍需独立审计复查，不授权自动 merge 或 push。

## 二、冻结现场与提交链（必填 2—5）

### 2. 冻结 base commit

`5d064eb66fb4c9e7c1f3d79c00e7854b088398df`

开始写入前确认：源码分支正确、HEAD 等于冻结提交、工作树干净、无 upstream，源码 `main` 与 `origin/main` 均为 `7481e781dffcd4f444e151d6baaf8778e5b9d170`。

### 3. 最终 source commit

`beef4c897f29b55d4d111c97c765d439cf4f1fe3`

### 4. 原五个搬家 commit

原提交保持原顺序和原对象，未 amend、squash、rebase 或改写：

1. `92d65fd3580fb2f08605e0e958e707fc1e18cfa5 refactor: establish core source boundaries`
2. `2c6d6b917139339f3de40178501b1f1a5fd9e206 refactor: group storage and integrations under platform`
3. `ad790b2e3d5b3a0c19a67b0971fc2f6822083fd7 refactor: organize product features`
4. `c8a171e8093a1ee160c3cf592cfb5893e388bfdf refactor: align application shell and shared UI`
5. `5d064eb66fb4c9e7c1f3d79c00e7854b088398df chore: enforce and document source layout`

### 5. 本轮 R1 commits

1. `176e9fa365b4cf812394fe5e8c33ee28115697d0 refactor: enforce acyclic source boundaries`
2. `beef4c897f29b55d4d111c97c765d439cf4f1fe3 fix: allow macOS ledger file selection fallback`

结构守卫、15 处引用修复和两组跨区域拆环合并为第一个原子绿色提交：正式守卫在旧结构上必然红灯，若单独提交守卫便违反“每个正式 commit 都是绿色检查点”的要求。picker 修复按要求保持为独立 commit。

## 三、修复前与修复后结构证据（必填 6—7）

### 6. 修复前红灯证据

先扩充 `src/test-support/sourceLayout.test.ts`，再在尚未修复引用和依赖方向时运行：

- 自身稳定入口：准确报告 15 处，分别为 `platform/files` 9 处、`platform/legacy` 6 处。
- 静态依赖环：准确报告 3 个强连通分量，共涉及 14 个文件。
- 三组环与 `01C` 一致：`platform/legacy`、`features/backup ↔ platform/persistence`、`platform/coordination ↔ platform/files`。
- 错误输出包含文件路径、行号、import specifier、循环成员和形成循环的边。
- 该红灯只作为修复证据保留，没有形成红色 commit。

### 7. 修复后清零证据

- `npx vitest run src/test-support/sourceLayout.test.ts`：`1 file / 7 tests PASS`。
- 结构守卫对全部受管 `.ts / .tsx` 建图，包含 type-only import、`index.ts`、测试文件和 re-export；Tarjan 强连通分量结果为 0。
- `rg -n 'from "@/platform/files"' src/platform/files`：exit 1、零输出，即 0 处。
- `rg -n 'from "@/platform/legacy"' src/platform/legacy`：exit 1、零输出，即 0 处。
- ESLint 同步按全部一级区域和功能目录禁止自身稳定入口，并保留未登记深层 alias、跨边界 `../` 的限制。

## 四、自动检查与对抗验证（必填 8—10）

### 8. 各阶段自动检查

| 阶段 | 测试 | lint | build | typecheck | diff-check |
| --- | --- | --- | --- | --- | --- |
| 冻结基线 `5d064eb` | 59 files / 732 tests | PASS | PASS | PASS | PASS |
| 结构 R1 候选 | 59 files / 734 tests | PASS | PASS | PASS | PASS |
| picker R1 候选 | 59 files / 737 tests | PASS | PASS | PASS | PASS |
| 最终干净分支复跑 | 59 files / 737 tests | PASS | PASS | PASS | PASS |

最终 production build 使用 Next.js 15.5.22，`/` 为 303 kB、First Load JS 为 406 kB。build 与 typecheck 始终依次执行，没有并行。

### 9. 最终测试数量

最终为 `59 个测试文件 / 737 项测试`，相对冻结基线没有减少测试文件，正式测试增加 5 项。

### 10. 对抗守卫验证

曾临时创建：

- `src/core/catalog/__sourceLayoutSelfFixture.ts`
- `src/core/catalog/__sourceLayoutCycleA.ts`
- `src/core/catalog/__sourceLayoutCycleB.ts`

结构测试准确失败并报告 1 处自身入口违规、1 个涉及 2 个文件的最小循环。随后撤销三个夹具，目标结构测试恢复 `7 / 7 PASS`，完整自动门禁恢复通过。临时夹具未进入任何 commit。

## 五、真实 Chrome、macOS picker 与响应式证据（必填 11—14、18）

### 11. 真实 Google Chrome 流程

production build 绑定 `127.0.0.1:3101`，浏览器使用隔离的 `http://localhost.:3101/` origin；只在临时目录内新建虚构 V2 文件 `local-first-trading-ledger.lftl`，没有选择或读取个人账本。

验证数据：

- 新建 1 条固定手续费规则：`R1 Fixed 5`，平台 `R1EX`，BTC 固定费 `5 USDT`。
- 新增 BTC 买入：`0.1 BTC × 65000 USDT = 6500 USDT`。
- 精确规则候选被采用，实际手续费为 `5 USDT`，买入总支出和剩余含费成本均为 `6505 USDT`。
- 新增 BTC 手动价格 `66000 USDT`；持仓市值为 `6600 USDT`，未实现盈亏为 `95 USDT`。
- 锁定并释放后，从原生 Open picker 重新选择同一文件、输入同一虚构密码解锁。
- FeeRule、交易、5 USDT 手续费、0.1 BTC 持仓、6505 USDT 含费成本和 66000 USDT 手动价格全部复读一致。
- 重开时自动 Binance 刷新另写入一条公开行情事实；切回“手动价格”后仍准确恢复 66000 USDT 和 95 USDT，证明手动价格事实仍在文件中。

### 12. macOS picker 无 Finder 搜索验证

在普通 macOS Open picker 中直接进入临时目录，未使用 Finder 搜索：

1. 默认 `Local-First Trading Ledger` 类型下，macOS 仍把目标 `.lftl` 显示为灰色。
2. 修复后的面板出现 `Show Options → Format → All Files`。
3. 切换到 `All Files` 后，列表中的同一 `local-first-trading-ledger.lftl` 可直接选择并进入密码页。
4. 同密码解锁和完整数据复读通过。

因此本轮实现的是目标明确允许的“所有文件”兼容回退，不再依赖 Finder 搜索强制选择。

### 13. 非 `.lftl` 拒绝

同一原生列表中选择虚构 `not-a-ledger.json` 后，应用停留在选择入口并显示“请选择扩展名为 .lftl 的 C 文件”，未进入密码页。正式测试进一步证明拒绝发生在 `getFile()` / 内容读取之前，且不会发布连接记录；取消选择仍保持零写入。

### 14. 1280px、390px 与 console

- 1280 × 800：`innerWidth = clientWidth = scrollWidth = bodyScrollWidth = 1280`，样式完整，无整页横向溢出。
- 390 × 844：`innerWidth = clientWidth = scrollWidth = bodyScrollWidth = 390`，样式完整，无整页横向溢出。
- 手机视口中的两张宽表保留局部 `overflow-x: auto`，这是预期的局部滚动，不构成整页溢出。
- console error：`0`。
- 页面没有应用错误。

### 18. 是否需要用户完成原生系统操作

是，但范围受控：首次 Save picker 曾请用户选择临时目录；文件未实际落盘后，后续由本机界面控制完成保存。macOS 自动锁屏使合法文件重选暂时中断，用户只需解锁 Mac 一次。密码、普通页面操作、原生 picker 的“所有文件”切换、重选和数据核验均由执行者完成。

最终先锁定并释放文件，再关闭 Chrome 验收标签页。随后永久删除了仅含虚构 `.lftl` 与虚构 JSON 的临时目录，并关闭本地 3101 端口服务；临时文件不可恢复。

## 六、实际修改范围（必填 15）

### 结构与入口

- 15 处 `platform/files`、`platform/legacy` 内部自身入口引用改为同目录精确相对引用。
- 新增窄入口 `src/platform/persistence/identity.ts`，只导出内容身份函数；`backupImportPreflight.ts` 不再加载整个 persistence barrel。
- 新增 `src/platform/files/ledgerFileSessionLease.ts`，提取 `LedgerFileSessionLease` 类型，并从稳定入口与 coordination 保留兼容 type export，使 files / coordination 依赖成为单向。
- `sourceLayout.test.ts` 使用现有 TypeScript AST 解析静态 import、re-export、import equals、import type 和字面量 dynamic import，并用 Tarjan SCC 检查循环。
- `eslint.config.mjs`、结构测试和 `src/README.md` 同步登记 `@/platform/persistence/identity` 与自身入口合同。

### 文件选择器

- Save picker 保持 `local-first-trading-ledger.lftl`、`.lftl` 类型和 `excludeAcceptAllOption: true`。
- Open picker 保持 `.lftl` 类型提示，但改为 `excludeAcceptAllOption: false`，允许 macOS 暴露 `All Files`。
- 应用层 `.lftl` 扩展名、大小、UTF-8、V2 合同、AES-GCM、fileId / revision、写入与连接记录安全链均保留。
- 新增并强化 adapter / controller 测试，覆盖 picker 参数、非 `.lftl` 读取前拒绝、取消零写入、错误文件不发布连接和 Save 严格配置。

从冻结 base 到最终 HEAD 的变更清单不包含 `package.json`、lockfile、CSS 或 Tailwind 配置；未增加依赖，未修改 UI 文案或账本/备份/加密数据合同。

## 七、计划偏差（必填 16）

存在两项已解释的执行差异，但均未偏离完成线：

1. 原建议把自身入口、拆环和守卫分成多个提交；实际合并为一个结构原子提交，因为永久守卫在旧结构上必然失败，拆分会产生正式红色 commit。picker 仍保持独立提交。
2. 本机 macOS / Chrome 的默认类型映射仍会把 `.lftl` 置灰；本轮按任务允许的完成线启用并验证 `All Files` 回退，而不是改变扩展名、MIME 或放松应用验证。

没有进入 UI 美化、NLP、CS2026、外部参考项目或个人真实账本；没有更新 `00-当前开发状态.md`，也没有修改 01A、01B、01C。

## 八、两个 Git 仓库最终状态（必填 17）

### 源码仓库

- 分支：`zhennn/w13-main-source-layout`
- HEAD：`beef4c897f29b55d4d111c97c765d439cf4f1fe3`
- 工作树：clean
- upstream：none
- `main`：`7481e781dffcd4f444e151d6baaf8778e5b9d170`
- `origin/main`：`7481e781dffcd4f444e151d6baaf8778e5b9d170`
- 状态：未 merge、未 push、未设置 upstream、未创建 PR、未删除分支

### 根文档仓库

- 分支：`main`
- `01C` 独立提交：`afa772a9320b4767eec0d981975496e4913b5b39 docs: 记录 Week 13 源码目录重构独立审计问题`
- 本 01D 将以独立中文提交 `docs: 记录 Week 13 源码目录重构 R1 修复结果` 收口。
- 用户自己的 `.obsidian/app.json` 修改保持原样、未暂存、未提交。
- 除 `.obsidian/app.json` 外无遗留工作树变化；未 push。

## 九、未完成项与剩余风险（必填 19）

必需完成项：无。

剩余边界：

1. 本机仍需在原生 Open picker 中选择 `All Files` 才能点选 `.lftl`；这是本轮明确接受并验证的兼容路径，未来 Chrome / macOS 类型映射变化后仍应保留真实选择器回归验收。
2. `All Files` 会让其他扩展名出现在面板中，但应用已经在读取和密码流程前拒绝非 `.lftl`，不会因此降低文件合同或连接记录安全。
3. 本报告属于开发执行证据，仍需独立审计确认后才可讨论合并；当前没有 merge 或 push 授权。
