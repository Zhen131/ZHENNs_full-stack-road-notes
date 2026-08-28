# 01D_W15-main｜账本 V4 数据校正与首页改造独立验收报告

- 日期：2026-08-28
- 轨道：长期账本产品 `main`
- 受验对象：`zhennn/w15-main-v4-display-home@755fdab`，7 个提交，116 文件，+7472 / -799
- 依据：`01A` 产品定义、`01B` 执行合同、`000_W15` 版本分层决策

## 结论

**有条件通过。** `01B` 的六项关键实现约束经代码层独立复核全部成立，未发现与产品决定相冲突之处。发现并已修复一项遗漏：升级过程销毁了仓库内全部 V3 格式样例。

本结论不覆盖测试执行结果。受验方报告的 92 文件 / 1081 项测试**未被独立复跑**，原因见证据边界，因此该项在本报告中既不判通过也不判失败。

## 一、证据边界（必须先读）

独立侧运行环境为 Linux；受验仓库的 `node_modules` 是在 macOS 上安装的原生构建（仅含 `binding-darwin-arm64`），执行 `npm test` 在启动阶段即因缺少 `@rolldown/binding-linux-arm64-gnu` 失败。重新安装依赖会覆盖用户 macOS 侧的既有环境，故未执行。

因此本次独立验收的证据仅限于：

| 项目 | 是否独立取得 |
| --- | --- |
| `tsc --noEmit` | 是，独立执行，退出码 0 |
| 源码层事实复核 | 是，逐项读取实现代码 |
| Git 状态与提交边界 | 是 |
| 全量自动化测试 | **否**，环境所限未复跑 |
| lint 与 production build | **否**，同上 |
| 真实 Chrome 四项手工确认 | **否**，未独立复现 |

受验方自报结论保留在 `01C`，不因本报告的未复跑项而被改写，也不因其自报通过而被本报告采信为独立证据。

## 二、六项关键约束复核

`01B` 中列为“最容易做错”的六处，逐项核对实现代码：

| 编号 | 约束 | 结论 | 证据 |
| --- | --- | --- | --- |
| V-01 | 交易与转移合并排序不得使用数组下标 tiebreak | 通过 | `positionReplay.ts` 将两类事实统一为带 `kind: "trade" \| "asset-transfer"` 的候选，按 `createdAt` 与种类比较，未出现两数组下标比较 |
| V-02 | 链上手续费对应成本转为已实现亏损 | 通过 | `positionReplay.ts` 中 `internal` 与 `external-out` 均执行 `realizedPnl = subtract(realizedPnl, feeCostBasis)`，来源位置扣减 `quantity + networkFee` |
| V-03 | 白拿类按到账当日单价计入成本，不得为零成本 | 通过 | `requireUnitPrice` 在缺少单价时抛错；`gain` 分支计算 `quantity × unitPrice` 同时累加 `giftIncome` |
| V-04 | 显示层禁止浮点 `log10` | 通过 | `formatLedgerNumber.ts` 使用 `decimal.abs().e` 取十进制指数 |
| V-05 | 四类转移不影响 USDT 现金 | 通过 | `cashReplay.ts` 未消费 `assetTransfers` |
| V-06 | 版本号分层，只升真正变化的那个 | 通过 | `BACKUP_FORMAT_VERSION = 3` 保持不变，`SUPPORTED_LEDGER_SCHEMA_VERSION = 4`，`fileFormatVersion = 2`、`cryptoVersion = 1` 均未动 |

V-06 为受验方自行发现并修正，见其提交 `80bb92d`。`01B` 原文写有“`BACKUP_FORMAT_VERSION` 改为 4”，该表述与 `000_W15` 的分层原则冲突，受验方按正确原则实施，判定为改进而非偏离。

## 三、发现的问题

### F-01｜升级销毁了全部 V3 格式样例（已修复）

**事实**：`test-fixtures/w11-b-import/` 下五份原为 `schemaVersion = 3` 的夹具被就地改写为 `4`；`test-fixtures/golden/` 仅新增 `golden-backup-format-v3-ledger-schema-v4.json` 一份。修复前，仓库内不存在任何一份 V3 格式的账本样例。

**影响**：违反 `000_W15` 第六节与根 `AGENTS.md` 的黄金样例要求。将来编写 V3 → V4 迁移器时无可信的旧格式输入，只能凭推测还原旧结构，推错即造成静默数据损坏。本机私有区虽存有真实的 V3 B 文件，但属真实数据，永久不得进入 Git，不能充当夹具。

**严重度**：P2。当前 Alpha 阶段不做迁移，不影响本批功能正确性；但属于一次性、不可逆的证据丢失——分支上的改写一旦合并且历史被压缩，重建成本将显著上升。

**修复**：独立侧从 `main` 历史取出 `valid-300.backup.json`（全虚构，300 笔交易，`backupFormatVersion = 3` + `ledgerSchemaVersion = 3` + `schemaVersion = 3`），冻结为 `test-fixtures/golden/golden-backup-format-v3-ledger-schema-v3.json`。

**根因**：`01B` 要求升级版本时新增黄金样例，但未同时禁止就地改写既有旧版本夹具。此为执行文档的表述缺口，非受验方主观违规。后续批次的执行文档应补上“既有旧版本夹具不得就地升级，需新增而非改写”。

## 四、未决与后续

| 项目 | 状态 |
| --- | --- |
| 全量测试、lint、build、Chrome 四项 | 未独立复跑；如需最终独立 `PASS`，须在具备 macOS 依赖的环境重跑 |
| 账目正确性 | **尚未达成。** 代码已支持 V4，但账本数据仍需重新生成 V4 的 B 文件并导入全新账本 |
| 生成 V4 的 B 文件 | 依赖用户补充：冷钱包与冷钱包理财各币种持仓数量、理财利息到账记录、托管型等量代换资产是否独立计币 |
| 分支去向 | 停留在 `755fdab` 之后的独立验收补充提交，未合并、未推送，由用户决定 |

## 五、独立侧本次改动

| 文件 | 改动 |
| --- | --- |
| `test-fixtures/golden/golden-backup-format-v3-ledger-schema-v3.json` | 新增，修复 F-01 |
| `README.md` | 重写为产品文档：移出逐周进展、提交坐标与逐批证据清单，补入版本分层、迁移四铁律与黄金样例要求 |

上述改动在受验分支上以独立提交记录，与受验方的 7 个提交分开，不混入其证据链。
