# 02 — Idea 赛 3 分钟视频脚本

日期：2026-09-02　｜　状态：初稿 v1，待打磨
交付：YouTube 链接（不超过 3 分钟）

---

## 硬约束

- **官网原文只规定了两件事**：`a presentation video of up to 3 minutes`；语言可为匈牙利语或英语。格式、分辨率、是否露脸均无规定。
- **词数上限：350 词。** 非母语者稳妥语速约 130 词/分钟，3 分钟理论上限 390 词，扣掉停顿与喘气后可用约 350 词。
- **不要先写中文再翻译。** 翻出来的英文必定超长且是书面语，念出来不像人话。中英并排写，英文是念的，中文是理解用的，按英文词数卡死。
- 本稿实际词数：**344 词**，按 130 词/分钟约 2 分 39 秒，留 20 秒余量。

---

## 分镜脚本

### 镜头 1 — 钩子（0:00–0:22，48 词）

**画面**：黑底白字，两个数字砸出来。`11.4%` 和 `17.9%`，中间一道缺口。缺口上打一个词：`BEHAVIOUR`。

**English（念这个）**
> Between 1991 and 1996, two researchers tracked sixty-six thousand households at a US discount broker. The households that traded the most earned eleven point four percent a year. The market earned seventeen point nine. That gap is not bad stock picking. That gap is behaviour.

**中文（理解用）**
1991 到 1996 年，两位研究者追踪了美国一家折扣券商的六万六千户散户。交易最频繁的那一批，年化 11.4%。同期市场是 17.9%。这个差距不是选股不行，这个差距是行为。

---

### 镜头 2 — 问题（0:22–0:50，48 词）

**画面**：自己账本界面的录屏，持仓表、热力图划过。然后画面上浮出一个问号，压在数据上面。

**English**
> I have kept my own trading ledger since December 2024. It tells me what I own, and what I lost. It cannot tell me why I bought. No tool can. Because that answer was never in the data — you cannot recover "I panicked" from a CSV file.

**中文**
我从 2024 年 12 月开始记自己的交易账本。它能告诉我我持有什么、亏了多少。但它没法告诉我我当初为什么买。没有工具能。因为这个答案从来就不在数据里——你没法从一个 CSV 文件里还原出"我当时慌了"。

---

### 镜头 3 — 别人试过，失败了（0:50–1:15，45 词）

**画面**：三个 logo 或三个方块并排（本地开源账本 / AI 记账 / 交易日志），下面各打一行小字。最后一个方块上盖一个价签 `$169 / year`，再盖一个大叉。

**English**
> Trading journals tried to fix this. They ask you to tag your own emotions, for a hundred and sixty-nine dollars a year, in the cloud. Two problems. Nobody fills in the form. And what the form collects is what you *think* you were thinking.

**中文**
交易日志软件试过解决这件事。它让你自己给自己的情绪打标签，一年一百六十九美元，数据在云端。两个问题：没人愿意填这个表；而且这个表收上来的，是"你以为你当时在想什么"。

---

### 镜头 4 — 我的做法，第一层（1:15–1:45，45 词）

**画面**：一根 K 线暴拉，顶部一个买入箭头亮起。旁边不出现任何形容词，只浮出时间戳和"当日涨幅 +14%"。

**English**
> So I stopped asking. My ledger already knows when each trade happened, and what the price was doing at that moment. If I bought at the top of a fourteen percent daily candle, that is not a feeling I reported. That is a fact.

**中文**
所以我干脆不问了。我的账本本来就知道每一笔交易发生在什么时候，也知道那一刻价格在干什么。如果我在一根当日涨 14% 的柱子顶上买入，那不是我自己汇报的一种感受，那是一个事实。

---

### 镜头 5 — 第二层，爆点（1:45–2:15，57 词）

**画面**：左右分屏。左边冷色，写 `You bought at the top.`；右边暖色，写 `"Fundamentals changed. Long term."`。中间画一条会拉长的线，线上冒出一个词：`THE GAP`。

**English**
> And here is the second half. Every trade in my ledger carries the original sentence I wrote at the time. The system says: you bought at the top. My own words say: fundamentals changed, long term. The distance between those two sentences is how much I lie to myself. That is what I want to measure.

**中文**
接下来是第二半。我账本里的每一笔交易都带着我当时写下的那句原话。系统说：你在顶部买入。我自己的话说：基本面变了，长期看好。这两句话之间的距离，就是我自欺的程度。我想量的就是这个东西。

> **这是全片的爆点，念到这里要停一拍。** 画面上那条线拉开的动作就是整个视频的记忆点。

---

### 镜头 6 — 为什么必须本地 / 为什么是我（2:15–2:40，46 词）

**画面**：一台笔记本，数据在里面转，外面一圈云图标全部变灰。然后切到代码截图，高亮那句校验：历史导入要求保留原句，rawText 必须非空，且不会被 trim、摘要或重写。

**English**
> This only works locally. It needs my full trade history, and the private notes I wrote for nobody else. And it needs a ledger that kept those notes from day one — mine refuses to import a historical trade without its original sentence, and forbids rewriting it.

**中文**
这件事只能在本地做。它需要我全部的成交记录，加上我写给自己看、不打算给任何人看的那些话。而且它需要一个从第一天就把这些话存下来的账本——我的账本会拒绝导入任何一笔没有原句的历史交易，并且明令禁止改写它。

---

### 镜头 7 — 它怎么说话 + 收尾（2:40–3:00，55 词）

**画面**：一句冷冰冰的系统输出打在屏幕中央，逐字出现。最后一句留白，只剩一行字。

**English**
> It will never lecture me. It will say: eleven of your buys landed in the top five percent of daily gains. Those eleven are down six percent. Numbers are harsher than advice. Every tool today tells you what happened to your money. I am building the one that tells you what happened to you.

**中文**
它永远不会教训我。它只会说：你有十一笔买入落在当日涨幅最高的 5% 区间里，这十一笔现在浮亏 6%。数字比劝告狠得多。今天所有工具告诉你的都是"你的钱发生了什么"。我要做的这个，告诉你的是"你自己发生了什么"。

---

## 词数核对

| 镜头 | 词数 | 累计 |
| --- | ---: | ---: |
| 1 钩子 | 48 | 48 |
| 2 问题 | 48 | 96 |
| 3 别人的失败 | 45 | 141 |
| 4 第一层 | 45 | 186 |
| 5 爆点 | 57 | 243 |
| 6 本地 / 凭什么是我 | 46 | 289 |
| 7 收尾 | 55 | 344 |

**344 词 ≈ 2 分 39 秒**（按 130 词/分钟）。留 21 秒余量给停顿。**如果录出来超过 3 分钟，先砍镜头 3，那是唯一可以整段删掉而不伤逻辑的部分。**

---

## 制作方案

**版式**：主画面是动效，右下角小窗放自己的真人头像。不做纯大头讲三分钟。

**工具分工**（没有任何一个 AI 能一键搞定，必须分工）

| 环节 | 工具 | 理由 |
| --- | --- | --- |
| 示意图、对比图 | Napkin AI | 一段文字直接变示意图，免费。镜头 3 的三方对比、镜头 5 的分屏都适合 |
| 会动的幻灯片 + 右下角画中画 | Canva | 内置「边放幻灯片边录自己」，画中画位置就在角上 |
| 剪辑与字幕 | Descript | 语音转文字后删字即删视频，可无痕去掉口误与「呃」，自动生成字幕 |

**不建议**：VideoScribe / Doodly / simpleshow 这类真手绘白板。要么收费要么风格锁死，一天内上手风险高。**「会动的 PPT + 关键处一个手绘感图标」已经足够**，评委看的是想法不是动画水平。

**字幕**：一定要加英文字幕。非母语口音 + 评委里可能有匈牙利语母语者，字幕能救回大量理解损失。

---

## 待办

- [ ] 通读三遍掐表，超时就砍镜头 3
- [ ] 把念着拗口的词换掉（录之前先出声念一遍，卡壳的地方直接改）
- [ ] 录屏素材：账本解锁 → 首页 → 交易页 → 那句 rawText 校验代码
- [ ] 名字仍未定，镜头里暂不出现产品名
