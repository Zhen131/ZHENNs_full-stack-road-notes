# 04 — Idea 赛一页 A4 · 英文稿 v4（压缩版）

日期：2026-09-02　｜　状态：英文稿，**待排进 PDF 实测页数**
排版：12 号字、单倍行距、**Times New Roman、页边距 2cm、段间不空行（用首行缩进分段）**

> 规则只规定了字号与行距，字体、页边距、段间距均未规定——这三项是合法的争取空间。
> 段间不空行这一条尤其关键：十几个段落各空一行，等于白白吃掉十几行、约 200 词的位置。

---

## 正文（英文，交付内容）

**Zhenn's Ledger — a local AI that connects what you said to what you actually did**

Zhu Zhen · Faculty of Informatics, University of Debrecen · AI Idea Competition · github.com/Zhen131/ZHENNs_Ledger

Every tool today tells you what happened to your money. None tell you why you did it, or whether you will do it again. That answer was never in the data — you cannot recover "I panicked" from a CSV file. Barber and Odean showed in 2000 that the most active of 66,465 households earned 11.4% a year against a market return of 17.9%: a gap made by behaviour, not by stock picking. Twenty-six years on, no consumer tool has solved it, because the data it needs is data nobody hands over.

Existing tools either protect your privacy and have no AI, or use AI only to follow the money. Trading journals do study psychology — in the cloud, for a subscription, and by hand-tagging your own emotions. Nobody fills that form in. And when they do, it records what they *think* they were thinking: people are not lying on purpose, they believe their own account of themselves.

**The idea has three layers.** *One: infer from behaviour, ask nothing.* The ledger already knows the second each trade happened and what the price was doing then. A buy landing in the 97th percentile of an asset's 24-hour move is not a reported feeling. It is a fact. Trades do not lie.

*Two: put the record beside the account.* Every trade can carry the sentence I wrote at that moment. The ledger says: you bought at the top of a fourteen-percent day. My own words say: the fundamentals changed, I am here for the long term. The distance between those two sentences is how much I lie to myself. It runs both ways — disagreement is a blind spot; agreement, again and again, is discipline, and for the first time it is measurable. Money compounds. When your judgement is repeatedly shown to be reliable, your thinking starts to compound too.

*Three: silence is data.* People do not skip the note at random. They skip it when they are impulsive, when they feel caught out, when they are in a hurry. Absence correlates with impulse, so absence is a signal, not a hole. Layers one and three ask nothing of the user, so the system still works for someone who never writes a word.

**This is reconciliation, not lie detection.** AI that claims to read lying from voice or micro-expressions does not survive scrutiny. This does something older and duller: it checks a stated account against a verifiable record, the way an audit does. It never says "you are lying" — it says "what you claimed and what the record shows do not agree."

**It must be local.** It needs a person's whole trade history plus the notes they wrote for nobody else, and trading records are among the most private data anyone holds. The harder reason: people only tell themselves the truth when they are certain no one else is reading. Privacy here is not a feature — it is the precondition for the data to exist.

**It must also be AI**, though two of the three layers do not need it: percentile statistics are arithmetic, and I will not call them AI. Knowing where not to use AI is how I know where to use it. The second layer is different. Contradiction there is semantic, not lexical — "the fundamentals changed, I am here for the long term" and "you bought in the 97th percentile" do not clash on the surface. They clash because a long-term investor does not care where the short-term price sits, and the same intent has unlimited phrasings, so enumeration always misses, and misses the most original people first. Meaning also depends on a person's whole history, which is why *why AI* and *why local* are two conclusions from one constraint. Above all, a fixed rule only catches the excuses I already thought of. Self-deception is not finite; it evolves alongside self-knowledge — each time I am caught, I invent a better reason. No rule written in advance can keep up. The value of a model is not recognising the patterns I listed, but finding the ones I did not.

**Where this stands.** An idea is easy to overstate, so I will be exact. The repository is still being built; it is the foundation only — a local-first encrypted ledger that runs fully offline, with no server and no account. **No AI model has been connected to it yet: no NLP, no agent, none of the algorithms above.** What I can show instead is that this idea did not appear yesterday. I have kept my own trading ledger since December 2024, the month I started investing, and 415 real trades have been converted and validated against it. The field storing the original sentence for each trade was built in June 2026; the rule that it must never be trimmed, summarised or rewritten was added on 31 July. Both are older than this idea — my data structure was protecting the raw material before I knew what it was for.

**What I already know is hard.** If a user never writes anything, the second layer loses its input; the only remedy is to make speaking almost free — voice, one sentence, always skippable. And there is no ground truth for "was that impulsive," so evaluation will not measure label accuracy but the realised outcome of each class of behaviour, an objective number already in the ledger.

Wealth does not come from being right once. It comes from not making the same mistake twice — and you cannot stop a mistake you do not remember making.

I am grateful to the Faculty for making a place where an unfinished idea can be shown at all. But I would keep building this either way. I believe that one day someone other than me will need it.

I grew up in China with the story of Ma Liang, a boy whose brush could paint whatever was missing: the village had no waterwheel, so he painted one. I needed a tool to see who I really am with money. I looked for it, and it was not there. **I am a programmer now. When the tool is missing, I paint it.**

---

## 中文对照（不进 PDF）

见 `04-Idea赛-一页纸-英文稿-v3.md` 的中文对照一节。v4 相对 v3 只做压缩，**没有删掉任何一个论点**，中文含义完全一致。

v4 相对 v3 的压缩手法（不删论点，只删字）：
- 合并短句、去掉重复的连接词（`There is a harder reason:` → `The harder reason:`）。
- 把小标题从独立段落改为句内加粗（`**It must be local.**` 直接起句），每处省一行。
- 砍掉「我加了一点，对平时单笔 500 和单笔 5 的人含义不同」这个例子，只留结论「含义取决于这个人的全部历史」。**这是 v4 唯一删掉的具体内容。**
- 学院、赛事、仓库三行合并为一行。

---

## 待办

- [ ] **实测页数**——词数只是估算，必须真的排成 PDF 才知道够不够
- [ ] 若超一页，按下表继续砍
- [ ] 定稿导出 PDF，与视频、Drive 链接一并提交

### 若仍超页，按此顺序继续砍

| 序 | 砍什么 | 约省 | 损失 |
| ---: | --- | ---: | --- |
| 1 | 「What I already know is hard」整段 | 55 | 少了自我审视，但风险登记在 00 文件里，答辩时口头补 |
| 2 | 第二段（现有工具三类）压成一句 | 35 | 少了「我真调研过」的信号，仓库和视频能补 |
| 3 | 「reconciliation, not lie detection」压成两句 | 25 | **不建议**——这是防止被学者当场质疑的护栏 |
| 4 | 感谢学院那一句 | 15 | **不建议**——这是产品负责人明确要求保留的 |

**一个字都不能砍的**：三层想法、「It must also be AI」整段、「No AI model has been connected to it yet」、`rawText` 早于想法那两句、以及结尾三段（复利式收尾、坚持、神笔马良）。
