# 浏览器下载证据说明

本目录没有保留浏览器下载文件。

P-04 中，探针页面生成了名为 `codex-capability-probe.json` 的 58 字节 Blob，但浏览器控制层的下载事件监听超时，也未取得可审查的实际文件路径。页面显示的文件名、字节数和 JSON 不能替代实际下载文件回读，因此 P-04 记为 `BLOCKED`。

本轮没有进入 production 备份测试，没有生成或读取任何用户账本下载。

## 续跑补充

上述说明仅对应首轮。续跑用全新临时 Chrome Profile 和完全虚构账本取得了三个真实浏览器下载：

- `local-first-trading-ledger-backup-v1-20260726-112328Z.json`：首次 focused 尝试产物，保留失败历史。
- `local-first-trading-ledger-backup-v1-20260726-112421Z.json`：主取证 V1，3656 bytes，SHA-256 `44a0e88776f4c2ad96b6454df2f6687593db430e32cdd2f369a5ee44295e80c4`。
- `reload-local-first-trading-ledger-backup-v1-20260726-112541Z.json`：reload/unlock 独立闭环，1859 bytes，SHA-256 `f8607731f282dbffbd8bda39ccb63ad5ebab98076fdc98c51bc85013010e0fa7`。

这些文件都是测试虚拟数据，不含用户真实账本。
