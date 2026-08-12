# Week 13 main 源码目录重构执行报告

日期：2026-08-12

执行轨道：长期产品账本 `main`

最终判定：`PASS`

## 结论

五阶段源码目录搬迁已在本地功能分支形成五个独立 commit，基线、每阶段和五阶段后的最终自动检查均通过。第一次真实 Google Chrome 尝试因系统文件选择器无法由自动化可靠完成而判 `BLOCKED`；随后在同一最终 production build 上补跑，由用户只接管原生 Save / Open picker，成功创建并重选唯一临时目录中的全新虚构 V2 `.lftl`。固定交易、认证保存、锁定释放、同文件重选解锁、持久化、1280 / 390 双视口、整页横向溢出和完整 console 均取得现场证据。01A 的全部完成线现已满足，本 01B 最终改判 `PASS`。

## Git 边界与最终状态

| 维护面 | 绝对路径 | 分支 / upstream | HEAD | 相对 `origin/main` | 状态 |
| --- | --- | --- | --- | --- | --- |
| 根文档仓库 | `/Users/zhuzhen0131/Library/Mobile Documents/iCloud~md~obsidian/Documents/全栈之路` | `main` / `origin/main` | 首次 BLOCKED 报告为 `d7bdbc262e21aeb1eb23f6b410246cb59e51c37f`；最终为本文件的 PASS 补证提交 | PASS 补证提交前 behind 0 / ahead 2；提交后 behind 0 / ahead 3 | 仅修改现有 01B，未 push，未 merge |
| 产品源码仓库 | `/Users/zhuzhen0131/Library/Mobile Documents/iCloud~md~obsidian/Documents/全栈之路/01一些进度/产出/LocalFirstTradingLedger` | `zhennn/w13-main-source-layout` / none | `5d064eb66fb4c9e7c1f3d79c00e7854b088398df` | behind 0 / ahead 5 | clean，未 push，未 merge |
| 源码 `main` | 同上，独立 worktree 分支指针 | `main` | `7481e781dffcd4f444e151d6baaf8778e5b9d170` | 本地与 `origin/main` 均为同一 hash | 本任务未修改 |

根文档最终 commit hash 无法在该 commit 的内容中自我引用；应以提交后 `git rev-parse HEAD` 为准。PASS 补证使用新的独立 commit，没有 amend 首次 BLOCKED 报告。本任务没有执行 fetch、pull、push、upstream 设置、tag、amend、rebase、cherry-pick、reset、PR、分支删除或任何 merge。

## 基线与五阶段提交

源码 base commit：`7481e781dffcd4f444e151d6baaf8778e5b9d170`

源码 final commit：`5d064eb66fb4c9e7c1f3d79c00e7854b088398df`

| 顺序 | 完整 hash | 标题 | 结果 |
| --- | --- | --- | --- |
| 1 | `92d65fd3580fb2f08605e0e958e707fc1e18cfa5` | `refactor: establish core source boundaries` | core 与 test-support 完成，通过本阶段 Gate |
| 2 | `2c6d6b917139339f3de40178501b1f1a5fd9e206` | `refactor: group storage and integrations under platform` | platform 完成，legacy 拒绝链保留，通过本阶段 Gate |
| 3 | `ad790b2e3d5b3a0c19a67b0971fc2f6822083fd7` | `refactor: organize product features` | 七个扁平 feature 完成，通过本阶段 Gate |
| 4 | `c8a171e8093a1ee160c3cf592cfb5893e388bfdf` | `refactor: align application shell and shared UI` | app / ui 与最终 Tailwind 扫描范围完成，通过本阶段 Gate |
| 5 | `5d064eb66fb4c9e7c1f3d79c00e7854b088398df` | `chore: enforce and document source layout` | ESLint、结构测试和英文说明完成，通过本阶段 Gate |

每次提交后均复核 `branch = zhennn/w13-main-source-layout`、worktree clean、upstream none。

## 自动检查证据

所有正式 Gate 都按 `npm test → npm run lint → npm run build → npm run typecheck → git diff --check` 顺序执行，build 与 typecheck 没有并行。

| 检查点 | `npm test` | lint | production build | typecheck | diff-check |
| --- | --- | --- | --- | --- | --- |
| `main@7481e78` 基线 | 58 文件 / 727 项，exit 0 | exit 0 | exit 0，`/` 303 kB，First Load 405 kB | exit 0 | exit 0 |
| 阶段 1 | 58 / 727，exit 0 | exit 0 | exit 0 | exit 0 | exit 0 |
| 阶段 2 | 58 / 727，exit 0 | exit 0 | exit 0 | exit 0 | exit 0 |
| 阶段 3 正式结果 | 58 / 727，exit 0 | exit 0 | exit 0 | exit 0 | exit 0 |
| 阶段 4 | 58 / 727，exit 0 | exit 0 | exit 0 | exit 0 | exit 0 |
| 阶段 5 | 59 / 732，exit 0 | exit 0 | exit 0 | exit 0 | exit 0 |
| 五提交后最终复跑 | 59 / 732，exit 0 | exit 0 | exit 0，`/` 303 kB，First Load 405 kB | exit 0 | exit 0 |

阶段 3 曾出现三次临时失败，已在提交前全部修复并从头复跑：

1. 首次为 5 个文件失败，59 项失败 / 668 项通过，原因是搬迁后的 fixture 地址和 mock 目标失效。
2. 第二次为 1 个文件失败，3 项失败 / 724 项通过，原因是 chart 测试仍按旧 mock 的 button role 查找。
3. 修正时一次过宽替换造成 4 项失败 / 723 项通过；立即收窄为 ECharts 边界 mock 和实际 `img` role，最终恢复 58 / 727。

没有删除测试、跳过检查或放宽业务断言。第五阶段新增 `sourceLayout.test.ts` 后测试上升到 59 / 732。

## diff 审计

- rename-aware diff 显示生产文件只发生目录移动、import / export 地址替换、稳定入口新增和计划内配置 / README 收口。
- 唯一生产改名为 `src/backup/backupContentIdentity.ts → src/platform/persistence/ledgerContentIdentity.ts`，`createLedgerDataContentIdentity` 导出保持不变。
- 生产函数体、类型合同、用户文案、CSS 内容和 Tailwind class 未改；`tailwind.config.ts` 仅将最终扫描范围收紧为 app / features / ui。
- `package.json` 与 `package-lock.json` 在 `7481e78..HEAD` 无 diff，没有安装依赖。
- 最终搜索未发现受 Git 管理的旧一级目录、旧 import、跨父目录 `../`、深层 alias 或旧 `backupContentIdentity` 路径。
- 未进入或修改 `LocalFirstTradingLedger-CS2026/` 与 `02_NLP/`。

## 最终源码目录与稳定入口

```text
src/
  README.md
  app/
  core/
    calculations/ catalog/ models/ policies/ shared/ state/ validation/
  features/
    backup/ charts/ fees/ market-data/ portfolio/ prices/ trades/
  platform/
    coordination/ encryption/ files/ integrations/ legacy/ persistence/
  test-support/
  ui/
```

七个 feature 均为扁平目录，同时具有 `index.ts` 和 `ui.ts`。跨边界只允许：

```text
@/core/<area>
@/platform/<area>
@/features/<feature>
@/features/<feature>/ui
@/app
@/ui
@/test-support
@root/package.json
```

ESLint `no-restricted-imports` 与 `sourceLayout.test.ts` 共同拒绝 `../`、深层 alias、未登记的旧 `@/` 地址和非法 `@root` 目标。

## 真实 Google Chrome 现场

### 环境与安全边界

- 使用最终 production build，Next.js 15.5.22，server 成功绑定 `http://127.0.0.1:3101`；现场页面使用同一 server 的隔离 `http://localhost:3101` origin。验收结束后 server 已停止，`lsof -nP -iTCP:3101 -sTCP:LISTEN` 无监听。
- 系统 Google Chrome 在精确 `127.0.0.1:3101` origin 检测到一条未知历史连接记录。本轮没有点击重连、没有重选未知文件、没有清除该记录；隔离 origin 从空白的“选择或新建 C”入口开始，未读取或修改任何个人账本。
- 成功补跑的唯一临时目录为 `/private/tmp/lftl-w13-source-layout-manual.Q8UaYb`，其中只有用户通过真实 macOS Save picker 创建的默认文件名 `local-first-trading-ledger.lftl`。默认文件名不影响唯一性：目录、文件和密码均为本批专用虚构测试数据。
- 新建后文件为 1606 bytes；固定交易认证写盘后为 3710 bytes；同文件重开并完成自动 Binance 公共行情刷新后为 4977 bytes。最终先在页面执行“立即锁定”并确认回到“解锁所选 C”，再关闭测试标签；随后用精确绝对路径删除整个临时目录，`test ! -e` 为 exit 0。删除不可恢复，但目录内只有本批虚构数据。
- 用户只在自动化无法可靠接管的真实 macOS Save / Open picker 中完成路径选择和确认；其余网页交易输入、认证状态、锁定、同密码解锁、持久化核对、双视口和 console 检查均在系统 Google Chrome 现场执行。

### 固定流程证据

| 固定流程 | 结果 |
| --- | --- |
| 系统 Chrome 打开最终 production server | `PASS`；隔离 origin 从空白新建 / 选择入口进入最终 build |
| 系统 Save picker 创建全新 V2 `.lftl` | `PASS`；用户手动选择唯一临时目录，文件实际落盘，默认文件名为 `local-first-trading-ledger.lftl` |
| BTC 买入 0.1 / 65000 / 6500 USDT / fee 5 USDT | `PASS`；日期为 2026-08-12，页面预览买入总支出 6505 USDT 后保存 |
| 交易、持仓、含费结果与认证保存 | `PASS`；页面显示交易 1 笔、BTC 0.1、含费均价 65050 USDT、剩余含费成本 6505 USDT、已实现净盈亏 0 USDT，并出现“已保存到本地”“交易已认证保存” |
| 锁定并释放、系统 Open picker 重选同一文件、同密码解锁 | `PASS`；第一次锁定后返回文件入口，用户从同一目录重选同一默认文件，自动化使用同一虚构密码解锁成功 |
| 重开后的交易 / 持仓 / 含费持久化 | `PASS`；日期、交易数量、6500 成交额、5 手续费、6505 总支出 / 剩余成本和 65050 含费均价均与锁定前一致 |
| 1280 × 800 完整页面 | `PASS`；`innerWidth = clientWidth = scrollWidth = bodyScrollWidth = 1280`，H1 和完整应用正常渲染，无整页横向溢出、无 Application error |
| 390 × 844 完整页面 | `PASS`；`innerWidth = clientWidth = scrollWidth = bodyScrollWidth = 390`，H1 和响应式应用正常渲染，无整页横向溢出；页面内检测到 2 个具有自身 overflow 规则的局部横向滚动容器 |
| Chrome console error 状态 | `PASS`；完整流程结束前和最终锁定后两次读取均为 `[]` |
| 最终释放与清理 | `PASS`；视口 override 已 reset，页面回到锁定解锁入口，测试标签关闭，精确临时目录删除，server 停止，3101 无监听 |

解锁后自动行情成功更新 1 项、失败 0 项，BTC 页面价为 `63854.44000000 USDT`；这是公开行情刷新，不改变固定交易的事实、手续费或含费成本。双视口截图只作为现场目视辅助，最终判定同时依赖实际 DOM 尺寸、应用文本和 console 证据，不以截图替代固定流程。

### 浏览器执行偏差

1. 第一次尝试使用临时目录 `/private/tmp/lftl-w13-source-layout-smoke.jPHe6X`。受控标签中的 File System Access picker 立即返回取消，普通标签又无法可靠操作原生保存面板，目录始终为空；因此当时的 01B 正确判为 `BLOCKED`，没有冒充 PASS。该空目录当时已删除。
2. 后续补跑由用户手动完成真实 macOS Save / Open picker，解决的是浏览器自动化能力边界，没有绕过系统 picker，也没有用 jsdom、组件测试、嵌入式浏览器或直接写文件替代真实 Chrome 证据。
3. 自动填充 `type=date` 一度只改变可见 DOM value，未触发 React 受控状态；现场改用该原生日期控件的年、月、日分段键盘输入，页面日期校验消失后才保存。没有直接修改 `.lftl` 或应用状态。
4. 第一次尝试中，为将普通 Chrome 标签导航到本地 server，一次系统粘贴误取了用户剪贴板中原有的整段任务目标，Chrome 将其当作 Google 搜索查询提交并返回 413。该页面已立即关闭，没有继续搜索；不包含 `.lftl`、交易数据或个人账本内容，但任务文本确实被提交给 Google。后续已停止使用系统剪贴板，此执行风险不因最终 PASS 而删除或淡化。

## 与 01A 的偏差、完成项与风险

1. 自动检查、五提交顺序、目录结构、稳定入口、唯一改名和 Git 边界与 01A 一致。
2. 阶段 3 因路径搬迁将 Dashboard chart 测试由相对文件 mock 改为 ECharts 边界 mock，查询 role 改为实际组件的 `img`；这是入口地址变化引起的测试适配，没有改生产行为或放宽业务断言。
3. 为隔离未知历史连接，Chrome 实际页面使用 `localhost:3101` origin，server 仍精确绑定 `127.0.0.1:3101`。页面访问的是同一个最终 production server，且从空白连接状态完成全流程；这项安全隔离没有降低验收范围。
4. 用户协助原生 Save / Open picker 是本轮明确授权的真实系统选择器操作；应用内步骤与证据读取仍由自动化完成。没有剩余 Chrome 强制证据缺口。
5. 本 01B 是源码目录重构的开发执行报告；`PASS` 证明 01A 规定的本批实现与真实 Chrome Gate 已完成，不扩张为未来其他批次的独立 NND 结论，也不改变历史 Week 11 / Week 12 判定。

## 最终自检

| 检查 | 结果 |
| --- | --- |
| 源码只在 `zhennn/w13-main-source-layout` | 是 |
| 五个独立 commit，顺序和标题符合 01A | 是 |
| 源码 worktree clean，upstream none | 是 |
| 源码 `main` 与 `origin/main` 仍为 `7481e78` | 是 |
| 未 merge、未 push | 是 |
| 真实 Chrome 完整通过 | 是；真实 Save / Open picker、固定交易、认证保存、同文件重开、持久化、1280 / 390、console 和清理均 `PASS` |
| 仅更新现有 01B，未更新当前状态，未生成 01C / 01D，未写 99 日志 | 是 |
