# 04 — Idea 赛一页 A4 · 英文稿 v3（按取舍决定砍到一页）

日期：2026-09-02　｜　状态：英文稿，待排进 PDF 实测页数
排版：**12 号字、单倍行距、Times New Roman、页边距 2cm**（规则只规定字号与行距，字体和页边距未规定，这是合法的多争空间）

> **v3 相对 v2 的删减**（全部按产品负责人决定）
> - Barber & Odean 压成一句：只留 11.4% vs 17.9%、「差距来自行为不是选股」、以及「二十六年没人解决」。
> - **砍掉**第六节的「这是 agent 不是 chatbot」。
> - **砍掉**第七节的加密参数细节，只说仓库仍在打地基。
> - 第八节只留两条：用户从不写字怎么办、怎么验证它说得对。
> - 结尾三层（感谢、即使没有比赛也会做、神笔马良）全部保留。
>
> **中文只是对照，不进 PDF。**

---

## 正文（英文，交付内容）

**Zhenn's Ledger — a local AI that connects what you said to what you actually did**

Zhu Zhen · Faculty of Informatics, University of Debrecen · AI Idea Competition
github.com/Zhen131/ZHENNs_Ledger

**The problem.** Every tool today tells you what happened to your money. None tell you why you did it, or whether you will do it again. That answer was never in the data — you cannot recover "I panicked" from a CSV file. Barber and Odean showed in 2000 that the most active of 66,465 households earned 11.4% a year against a market return of 17.9%: a gap made by behaviour, not by picking bad stocks. Twenty-six years later no consumer tool has solved it, because the data it needs is data nobody hands over.

The tools that exist either protect your privacy and have no AI, or use AI only to follow the money. Trading journals do study psychology, but in the cloud, for a subscription, and by asking you to tag your own emotions by hand. Nobody fills that form in — and when they do, it collects what they *think* they were thinking. People are not lying on purpose. They believe their own account of themselves.

**The idea, in three layers.** *One: infer from behaviour, and ask nothing.* The ledger already knows the second each trade happened and what the price was doing then. A buy landing in the 97th percentile of an asset's 24-hour move is not a reported feeling. It is a fact. Trades do not lie.

*Two: put the record beside the account.* Every trade can carry the sentence I wrote at that moment. The ledger says: you bought at the top of a fourteen-percent day. My own words say: the fundamentals changed, I am here for the long term. The distance between those two sentences is how much I lie to myself. This runs both ways — when they disagree, that is a blind spot; when they agree again and again, that is discipline, and for the first time it is measurable. Money compounds. When your judgement is repeatedly shown to be reliable, your thinking starts to compound too.

*Three: silence is data.* People do not skip the note at random. They skip it when they are impulsive, when they feel caught out, when they are in a hurry. Absence correlates with impulse, so absence is a signal, not a hole. Layers one and three ask nothing of the user, so the system still works for someone who never writes a word.

**This is reconciliation, not lie detection.** AI that claims to detect lying from voice or micro-expressions does not survive scrutiny. This does something older and duller: it checks a stated account against a verifiable record, the way an audit does. It never says "you are lying." It says "what you claimed and what the record shows do not agree."

**Why it must be local.** It needs a person's whole trade history plus the notes they wrote for nobody else, and trading records are among the most private data anyone holds. There is a harder reason: people only tell themselves the truth when they are certain no one else is reading. Privacy here is not a feature — it is the precondition for the data to exist at all.

**Why it must be AI.** Two of the three layers do not need it. Percentile statistics are arithmetic, and I do not intend to call them AI; knowing where not to use AI is how I know where to use it. The second layer is different, and it is not sentence parsing. Contradiction there is semantic, not lexical: "the fundamentals changed, I am here for the long term" and "you bought in the 97th percentile" do not clash on the surface. They clash because a genuinely long-term investor does not care where the short-term price sits — and the same intent has unlimited phrasings, so enumeration always misses, and it misses the most original people first. Meaning also depends on the person's own history: "I added a little" means different things to someone who usually buys 500 and someone who usually buys 5. That requires the whole history, which is why *why AI* and *why local* are two conclusions drawn from one constraint. Above all, a fixed rule only catches the excuses I already thought of. Self-deception is not finite and it evolves alongside self-knowledge: each time I am caught, I invent a better reason. No rule written in advance can keep up. The value of a model is not recognising the patterns I listed — it is finding the ones I did not.

**Where this stands.** I want to be exact, because an idea is easy to overstate. The repository is still being built. It is the foundation only: a local-first encrypted ledger that runs fully offline, with no server and no account. **No AI model has been connected to it yet — no NLP, no agent, none of the algorithms above.** What I can show instead is that the idea did not appear yesterday. I have kept my own trading ledger since December 2024, the month I started investing, and 415 real trades have been converted and validated against it. The field that stores the original sentence for each trade was built in June 2026; the rule that it must never be trimmed, summarised or rewritten was added on 31 July 2026. Both are older than this idea. My data structure was protecting the raw material before I knew what it was for.

**What I already know is hard.** If a user never writes anything, the second layer loses its input; the only remedy is to make speaking almost free — voice, one sentence, always skippable, never blocking. And there is no ground truth for "was that impulsive," so evaluation will not measure label accuracy. It will measure the realised outcome of each class of behaviour, which is an objective number already in the ledger.

Wealth does not come from being right once. It comes from not making the same mistake twice — and you cannot stop a mistake you do not remember making.

I am grateful to the Faculty for making a place where an unfinished idea can be shown at all. But I would keep building this either way. I believe that one day someone other than me will need it.

I grew up in China with the story of Ma Liang, a boy whose brush could paint whatever was missing: the village had no waterwheel, so he painted one. I needed a tool to see who I really am with money. I looked for it, and it was not there. **I am a programmer now. When the tool is missing, I paint it.**

---

## 中文对照（不进 PDF）

**标题**：Zhenn's Ledger —— 一个把你说过的话和你实际做过的事连起来的本地 AI

**问题**：今天所有工具告诉你的都是你的钱发生了什么，没有一个告诉你你为什么那么做、下次还会不会。这个答案从来不在数据里——你没法从一份 CSV 里还原出「我当时慌了」。Barber 与 Odean 在 2000 年证明：66,465 户散户里交易最频繁的那批年化 11.4%，市场是 17.9%——**差距来自行为，不是选股**。二十六年过去，没有一个消费级工具解决它，因为它需要的数据没人交得出来。

**为什么别人没成**：现有工具要么保护隐私但没有 AI，要么用 AI 只盯着钱去哪了。交易日志软件确实在做心理，但在云端、要订阅、还要你手动打情绪标签。没人填那个表——就算填了，收上来的也只是「你以为你当时在想什么」。**人不是故意撒谎，他是真心相信自己那套说法。**

**三层想法**：
*一，不问任何人，从行为推断。* 账本知道每笔交易发生在哪一秒、那一刻价格在干什么。一笔落在 24 小时涨幅第 97 百分位的买入不是被汇报的感受，是事实。成交记录不会撒谎。
*二，把记录和自述并排放。* 账本说：你买在一个当天涨 14% 的日子的最高点。我的话说：基本面变了，我做长期。这两句之间的距离就是我自欺的程度。**双向的**：对不上是盲点，一次次对得上就是纪律，而且第一次可测量。**金钱可以复利；当你的判断被反复证明可靠，你的思维也开始复利。**
*三，沉默也是数据。* 人不写理由不是随机的——冲动时不写、心虚时不写、赶时间时不写。缺席与冲动正相关，所以缺席是信号不是缺口。第一、三层完全不需要用户开口，所以哪怕一个人一言不发，系统照样工作。

**这不是测谎，是核对**：靠语音或微表情测谎的 AI 站不住。这套系统做的是更老更笨的事——把自述与可查证的记录做核对，跟审计一样。它从不说「你在说谎」，只说「你声称的和记录显示的不一致」。

**为什么必须本地**：它需要一个人全部的成交记录，加上他写给自己看的话，而交易记录本身就是最私密的数据之一。更硬的理由是：**只有确定没人会看，人才会对自己说实话。** 隐私在这里不是卖点，是这份数据能不能存在的前提。

**为什么非要 AI**：三层里两层不需要，分位数统计是算术，我不打算管它叫 AI——**知道哪里不该用 AI，恰恰证明我知道该用在哪。** 第二层不同，它做的不是解析句子：矛盾是语义的不是词汇的；同一个意图有无限种说法，列举法必然漏，而且最先漏掉说法最独特的人；同一句话的含义还取决于这个人的历史，这需要全部历史——**所以「为什么要 AI」和「为什么必须本地」是同一个约束推出的两个结论**。最重要的一条：固定规则只能抓住我事先想得到的借口，而自欺不是有限的，它随自我认知一起进化——每被抓一次，我就发明一个更好的理由。任何事先写好的规则都追不上。**模型的价值不在识别我列出的模式，而在发现我没列出的那些。**

**现在到哪一步**：想法太容易被夸大，所以我把话说准。**仓库仍在建设中，只是地基**——一个完全离线、无服务端无账号的本地优先加密账本。**目前没有接入任何 AI 模型：没有 NLP、没有 agent、上面说的算法一个都还没有。** 我能拿出来的是另一件事：这个想法不是昨天冒出来的。我从 2024 年 12 月开始记自己的账本——那正是我开始投资的月份——415 笔真实交易已完成转换与校验。而保存每笔原话的字段建于 2026 年 6 月，「不得 trim、摘要或改写」这条规矩加于 7 月 31 日。**两者都早于这个想法。在我还不知道它有什么用之前，我的数据结构就已经在替它守住原始语料了。**

**我知道的难处**：如果用户从不写字，第二层就没有输入；唯一的解法是把开口成本压到接近零——语音、一句话、随时可跳过、永不拦路。另外「这笔算不算冲动」没有标准答案，所以评估不测标签准确率，而是测每一类行为后来的实际盈亏——那是账本里现成的客观数字。

**结尾**：财富不是靠对一次得来的，是靠不第二次犯同一个错——而你没法阻止一个你不记得自己犯过的错。
感谢学院提供了一个地方，让一个还没做完的想法也能被看见。但**即使没有这场比赛，我也会继续做下去。我相信总有一天，除了我之外也会有人真正需要它。**
我在中国长大，听着神笔马良的故事——一个少年有一支笔，能把缺的东西画出来：村里没有水车，他就画一架水车。我需要一个工具去看清自己在钱这件事上到底是什么样的人。我找过，它不存在。**而我现在是个程序员。缺什么工具，我就自己画一个。**
