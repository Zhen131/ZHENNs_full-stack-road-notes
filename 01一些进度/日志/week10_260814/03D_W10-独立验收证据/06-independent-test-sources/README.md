# 独立测试源码说明

本轮没有创建五个独立测试源码文件。

原因：P-04 无法取得浏览器实际下载文件，P-05 无法设置 `prefers-reduced-motion: reduce`。按照 03C 的前置能力 Gate，测试必须在 T0 后、T1 前停止，因此没有创建临时独立源码副本，也没有进入 T2–T5 受控测试。

本目录保留用于证明：没有用临时测试文件或开发 AI 的旧测试结果填补本轮 `BLOCKED`。

## 续跑补充

上述说明仅对应首轮。2026-07-26 续跑在固定提交 `git archive` 生成的系统临时副本中创建并执行了独立测试，且没有写入正式源码仓库。

- Chrome/production 自动化脚本直接保存在本目录。
- `second-round-controlled/` 保存 T2–T5 与 OBS 的全部独立测试源码。
- `npm-audit-runner.mjs` 是原计划的只读审计记录器；外部审批在进程启动前拒绝执行，因此它没有产生 audit 输出。
- 受控测试的首次 glob 基础设施失败见 `../21-controlled-tests-first.txt`；唯一有效执行见 `../22-controlled-tests-second.txt`。
- OBS 唯一执行见 `../28-obs-tests.txt`。
