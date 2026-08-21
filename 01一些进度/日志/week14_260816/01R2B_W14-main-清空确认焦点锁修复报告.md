# Week 14 main 第 01 批 R2：清空确认焦点锁修复报告

- 日期：2026-08-21～2026-08-22
- 开发结论：`PASS（R2 开发修复候选；不是 Week 14 最终独立验收 PASS）`
- 证据性质：R2 开发侧执行结果；不是 Week 14 最终独立验收
- 源码分支：`zhennn/w14-v3-cash-assets-market-data`
- R2 起点：`789ebd57e91700a3233d9a8e9814887403f6121d`
- 源码修复提交：`ac30891e31ac51da1dc1fb33b499fdaa372d16e3`
- 最终 HEAD：`49fa99ca70d87c455cebd3d48c5210fef4199ccb`
- 最终 tree：`eecd4e371e161ea1ae13cbdd7785720f533677dc`

## 结论

`W14-R1D-P1-01` 的最小源码修复、永久自动回归和隔离真实 Chrome 定向确认均已完成：清空确认区展开后会聚焦确认输入框；普通 `Tab` 与 `Shift+Tab` 只在输入框、确认按钮和取消按钮的当前可用集合中循环；`Escape` 和点击取消都会关闭确认区并把焦点送回触发按钮。清空确认文字、`confirmClear()`、`onClear()`、只读保护、文件行为、成功／错误提示和 V3 合同未改。

定向测试、Week 14 闭集、两次独立全量测试、typecheck、lint、production build 和两类 diff-check 全部退出 0。随后在 Google Chrome Guest Profile 的全新隔离会话、独立 production origin 与 macOS 原生文件选择器中创建一次性虚构账本，实际复核初始焦点、正向两圈、反向一圈、焦点不外逃和 Escape 返回；没有输入正式清空文字，没有调用清空，文件哈希与修改时间未变。补充 DevTools 观察中 Network 无请求，Console 无 application error／exception。

因此本轮结论为 `PASS（R2 开发修复候选；不是 Week 14 最终独立验收 PASS）`。原 `01D = FAIL` 与 `01R1D = FAIL` 均完整保留；本轮不生成 `01R2C / 01R2D`，也不允许合入或推送。

## 一、修复与范围

| 文件 | 变更 |
| --- | --- |
| `src/app/SettingsWorkspace.tsx` | 为确认 region、输入框、确认与取消按钮增加稳定 ref；展开后聚焦输入框；在区域边界处回绕 `Tab / Shift+Tab`；跳过 disabled 控件；稳定 Escape 监听依赖，并在卸载时取消待执行焦点恢复。 |
| `src/app/SettingsWorkspace.test.tsx` | 增加初始焦点、正向两圈、反向一圈、Escape 返回、取消返回、disabled 跳过和 ledger epoch 清理回归；保留错误／正确确认文本、成功反馈生命周期与只读理由回归。 |

本轮只修改上述两个允许文件。没有新依赖、package／lockfile、fixture、schema、B/C、Binance、NLP、CS2026、全局模态系统或无关样式变更。

## 二、测试—修复—重测

| 门 | 实际结果 |
| --- | --- |
| 修改前基线 | `npx vitest run src/app/SettingsWorkspace.test.tsx`；exit 0；1 file / 5 tests |
| 受控红灯 | 新增测试后同一命令；exit 1；1 file；3 failed / 7 passed；失败点为旧实现未聚焦输入框 |
| 最终定向 | 同一命令；exit 0；1 file / 10 tests |
| Week 14 定向闭集 | 从 `main...HEAD` 枚举非空 58 个测试文件，NUL 仅作文件分隔；exit 0；58 files / 739 tests |
| 第一次全量 | `npm test`；exit 0；85 files / 919 tests |
| 第二次全量 | 独立再次调用 `npm test`；exit 0；85 files / 919 tests |
| README 后最终全量 | 源码 README 同步真实状态后再次独立调用 `npm test`；exit 0；85 files / 919 tests |
| TypeScript | `npm run typecheck`；exit 0 |
| ESLint | `npm run lint`；exit 0；`--max-warnings=0` |
| Production | `npm run build`；exit 0；Next.js 15.5.22；5 个静态页；route `/` 339 kB，First Load 441 kB |
| 差异 | `git diff --check` 与 `git diff --check main...HEAD` 均 exit 0 |
| 残留与边界 | 无 `.only`、`.skip`、debugger、新 console、敏感路径、package／lockfile，无意外二进制或越界文件 |

前两次全量都发生在最后一次 source/test 变化之后。源码 README 更新后又独立执行一次最终全量；此后未再修改源码、测试、配置或 fixture。

## 三、隔离真实 Chrome 定向确认

### 环境与一次性虚构文件

- Chrome：Google Chrome `151.0.7922.171`。
- 隔离：从日常 Profile 菜单进入全新 Guest Profile；Chrome 报告该窗口为 `incognito`，测试窗口与日常窗口分离。日常 Profile 未打开账本、未导航至测试 origin，也未处理任何账本数据。
- Origin：Next production `http://127.0.0.1:3457/`；结束后端口已释放。
- 原生选择器：通过 macOS Save picker 定位 `/private/tmp/w14-r2-dev-chrome.QTF8RE/files/` 并创建一次性虚构账本。输入名为 `W14-R2-DEV-FAKE.lftl`，选择器追加扩展名后的实际文件为 `W14-R2-DEV-FAKE.lftl.lftl`；名称仍包含合同要求的标记。
- 文件终态：1627 bytes，权限 `-rw-------`，SHA-256 `74e1443e17ddfac9c094e971c48c643849dce0db7cce9d627544693bb1767d98`，mtime epoch `1787326047`。焦点验证前后哈希与 mtime 不变。
- 数据边界：只输入一次性虚构密码和虚构账本；密码不写入文档。没有读取真实 B/C、未知旧连接或日常 Profile 数据。

### 焦点证据

| 步骤 | 实际结果 |
| --- | --- |
| 打开确认区 | 设置 → 危险操作 → 打开清空账本操作；初始焦点为 `AXTextField / 输入清空确认文本` |
| 正向两圈 | `输入框 → 确认按钮 → 取消 → 输入框 → 确认按钮 → 取消 → 输入框` |
| 反向一圈 | `输入框 → 取消 → 确认按钮 → 输入框` |
| 不外逃 | 上述 6 次 `Tab` 与 3 次 `Shift+Tab` 的实际 AX trace 均只出现三个确认控件，没有 Chrome 地址栏、页面导航或其他页面控件 |
| Escape | 确认区关闭；焦点为 `AXButton / 打开清空账本操作` |
| 数据行为 | 未输入正式确认文字，未点击确认按钮，`onClear()` 未触发，虚构文件哈希与 mtime 未变化 |

### Console 与 Network

- 焦点 trace 完成后，在同一 Guest 会话打开 DevTools；Console 的 default levels 页面没有可见 application error 或 exception。面板显示 1 条被 level/filter 隐藏的浏览器消息，没有把它冒充运行期错误归零；DevTools Issues 计数也不等同于 application exception。
- Network 开始记录后，补充执行非破坏性的打开确认区与 Escape 关闭；请求表始终为空，没有意外网络活动。
- 焦点闭环证据来自真实 Chrome 的 AX focused element trace，DevTools 截图只作为 Console／Network 辅证，不替代原生选择器和实际键盘路径。
- 收尾时只关闭 Guest ledger window；核验为 `ledger_windows=0 / incognito_windows=0 / total_windows=1`，日常 Chrome 窗口保留。production 服务停止后 `3457` 无监听。

本节只是 R2 开发侧定向回归，不是重新执行完整 CH-01～CH-14，也不是独立验收。

## 四、Git 与证据边界

### 源码仓库

- 源码修复提交：`ac30891e31ac51da1dc1fb33b499fdaa372d16e3 fix: trap focus in clear ledger confirmation`
- 状态文档提交：`49fa99ca70d87c455cebd3d48c5210fef4199ccb docs: record clear confirmation repair status`
- 结束 branch：`zhennn/w14-v3-cash-assets-market-data`
- 结束 HEAD：`49fa99ca70d87c455cebd3d48c5210fef4199ccb`
- 结束 tree：`eecd4e371e161ea1ae13cbdd7785720f533677dc`
- `main...HEAD`：`0 behind / 20 ahead`
- upstream：无
- staged / unstaged / untracked：无；source worktree clean
- 源码 README：已同步 01D／01R1D 失败边界、R2 开发侧通过证据和“不是独立 PASS”；README 后最终 `npm test` 为 85 files / 919 tests

### 根文档仓库

- 本报告只记录 R2 开发修复候选 `PASS`，不生成 `01R2C / 01R2D`，不写 Week 14 最终独立 PASS。
- 原未跟踪 `01R1D_W14-main-导入恢复阻断自动锁定独立复验报告.md` 保持原样；本轮写入前 SHA-256 为 `b8a507b0ea73b2a80ef473f5e35e4644f7e23ed60945acc433501e6d72ce55dd`。
- 根文档只允许精确暂存本报告、`00-当前开发状态.md` 和 `99_W14-第十四周日志.md`；禁止使用批量暂存，禁止把原 `01R1D` 纳入 R2 提交。
- 根提交结果与最终 HEAD 以本轮结束时的 Git 实时审计为准；无论根提交是否获权限层允许，原 `01R1D` 都必须继续保持未跟踪且字节不变。

## 五、下一步与通过线

R2 开发任务已完成；下一步只能由全新独立执行者冻结 `49fa99c`，重新阅读 01B、01R1C、01R1D 与本报告，并决定新的独立复验范围。开发侧本轮焦点 trace 与 DevTools 辅证不能被直接复用为独立结论。

只有新的独立复验明确 `PASS`，Week 14 才有资格讨论合入 `main`；在此之前原 `01D = FAIL`、`01R1D = FAIL`、真实 V3 B 禁止和 NLP 暂停都继续有效。

## 六、禁止项

- 未 merge、push、设置 upstream、pull、rebase、cherry-pick、squash、amend、reset、PR、tag 或删分支。
- 未修改源码 `main`，未进入或修改 `CS2026`、`02_NLP`、外部参考项目或私人数据。
- 未生成或导入真实 V3 B/C，未输入正式清空文字，未执行清空。
- 原 `01D = FAIL`、`01R1D = FAIL` 与 `W14-R1D-P1-01` 继续保留；自动测试全绿不改写独立结论。
