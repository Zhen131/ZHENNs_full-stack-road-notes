# 04 — Idea 赛一页 A4 · 英文稿 v2（中英对照）

日期：2026-09-02　｜　状态：英文初稿，待排进 PDF 实测页数
交付：不超过一页 A4，12 号字，单倍行距

> **v2 相对 v1（中文初稿）的变化**，全部来自产品负责人本轮意见：
> - 第二节补「人不是故意撒谎，是真心以为自己当时是那么想的」。
> - 第三节新增**思维复利**：金钱可以复利，判断被反复验证为可信之后，思维也开始复利——不再只用钱衡量一个人。
> - 第七节改写：**目前尚未接入任何 AI 模型、NLP 或相关算法，只是在打地基**；仓库仍在建设中，不是产品也不是 demo。
> - 第九节新增：感谢学院提供机会；以及**即使没有这场比赛也会继续做下去**，因为相信除自己之外总有人会真正需要它。
>
> **英文是交付内容，中文只是给自己看的对照，不进 PDF。**

---

## Title / 标题

**Zhenn's Ledger — a local AI that connects what you said to what you actually did**

Zhu Zhen · Faculty of Informatics, University of Debrecen · AI Idea Competition
github.com/Zhen131/ZHENNs_Ledger

> Zhenn's Ledger —— 一个把你说过的话和你实际做过的事连起来的本地 AI

---

## 1. The problem / 问题

> Every tool today answers the same question: what happened to my money. None of them answer the one that matters: why did I do that, and will I do it again. That answer was never in the data. You cannot recover "I panicked" from a CSV file — it exists only in the second the decision is made.
>
> It is not just me. Barber and Odean (Journal of Finance, 2000) followed 66,465 American households from 1991 to 1996. Those who traded the most earned 11.4% a year; the market earned 17.9%. The gap came from costs and bad timing, not from picking bad stocks. The problem was proven twenty-six years ago. No consumer tool has solved it since — because the data it needs is data nobody hands over.

**中文**：今天所有工具回答的都是同一个问题：我的钱发生了什么。没有一个回答真正要紧的那个：我当时为什么那么做，下次还会不会。这个答案从来就不在数据里——你没法从一份 CSV 里还原出「我当时慌了」，它只存在于决策发生的那一秒。
这不只是我一个人。Barber 与 Odean（Journal of Finance, 2000）追踪了 66,465 户美国散户在 1991 至 1996 年的交易：交易最频繁的那批年化 11.4%，市场是 17.9%。差距来自交易成本与糟糕的择时，不是选股。问题在二十六年前就被证明了，二十六年来没有一个消费级工具解决它——因为它需要的数据，没人交得出来。

---

## 2. Why the existing attempts fail / 别人试过为什么没成

> Open-source local ledgers protect privacy but have no AI at all. AI bookkeepers turn a sentence into a transaction, but only follow the money. Trading journals do study psychology — in the cloud, for a subscription, and by asking you to tag your own emotions by hand. Nobody fills in that form.
>
> And even when they do, the form collects what you *think* you were thinking. People are not lying on purpose here. They genuinely believe their own account of themselves — which is exactly why self-report is the least reliable instrument in behavioural finance.

**中文**：开源的本地账本隐私做得好，但一个 AI 功能都没有。AI 记账助手能把一句话变成一笔账，却只管钱去哪了。交易日志软件确实在做交易心理——但在云端、要订阅费，而且要你手动给自己的情绪打标签。没人会填那个表。
就算填了，那个表收上来的也只是「你以为你当时在想什么」。**人在这件事上不是故意撒谎——他是真心相信自己那套说法。** 这恰恰是为什么自述是行为金融学里最不可靠的一件工具。

---

## 3. The idea — three layers / 我的想法：三层

> **One: infer from behaviour, and ask nothing.** The ledger already knows the second each trade happened and what the price was doing then. A buy that lands in the 97th percentile of an asset's 24-hour move is not a reported feeling. It is a fact. Trades do not lie.
>
> **Two: put the record and the account side by side.** Every trade can carry the sentence I wrote at that moment. The ledger says: you bought at the top of a fourteen-percent day. My own words say: the fundamentals changed, I am here for the long term. The distance between those two sentences is how much I lie to myself.
>
> This runs in both directions. When they disagree, that is a blind spot. When they agree, again and again, that is discipline — and for the first time it is measurable. A person whose stated reasoning keeps matching what he actually did has earned something real: his own words stop being mood and become evidence. **Money compounds. When your judgement is repeatedly shown to be reliable, your thinking starts to compound too** — and that is worth more than measuring a person by their balance alone.
>
> **Three: silence is data.** People do not skip the note at random. They skip it when they are impulsive, when they feel caught out, when they are in a hurry at an airport. Absence correlates with impulse, so absence is a signal, not a hole. Layers one and three need nothing from the user, so the system still works for someone who never writes a single word.

**中文**：
**第一层：不问任何人，从行为本身推断。** 账本本来就知道每笔交易发生在哪一秒，也知道那一刻价格在干什么。一笔落在该资产 24 小时涨幅第 97 百分位的买入，不是一种被汇报的感受，那是事实。成交记录不会撒谎。
**第二层：把记录和自述并排放。** 每笔交易都可以带着我当时写下的那句话。账本说：你买在了一个当天涨 14% 的日子的最高点。我自己的话说：基本面变了，我是做长期的。这两句话之间的距离，就是我自欺的程度。
**这是双向的。** 对不上是盲点；一次又一次对得上，那就是纪律——而且第一次变得可测量。一个人的自述如果长期与他实际做的事吻合，他就挣到了真东西：他的话不再是心情，而成了证据。**金钱可以复利。当你的判断被反复证明可靠，你的思维也开始复利**——这比只用余额衡量一个人有价值得多。
**第三层：沉默也是数据。** 人不写理由不是随机的。冲动时不写，心虚时不写，在机场赶时间时不写。缺席与冲动正相关，所以缺席是信号，不是缺口。第一层和第三层完全不需要用户开口，所以哪怕一个人从头到尾一言不发，系统照样工作。

---

## 4. This is reconciliation, not lie detection / 这不是测谎，是核对

> AI that claims to detect lying from voice or micro-expressions does not survive scrutiny. This does something older and duller: it checks a person's stated account against a verifiable record, the way an audit does. It never says "you are lying". It says "what you claimed and what the record shows do not agree."

**中文**：那些声称靠语音或微表情检测说谎的 AI，在学术上站不住。这套系统做的是更老、更笨的事：把一个人的自述与一份可查证的记录做核对，跟审计一样。它从不说「你在说谎」，它说的是「你声称的和记录显示的不一致」。

---

## 5. Why it must be local / 为什么必须跑在本地

> It needs a person's entire trade history, plus the notes they wrote for nobody else — and trading records are among the most private data anyone holds. There is a harder reason too: people only tell themselves the truth when they are certain no one else is reading. Privacy here is not a feature. It is the precondition for the data to exist at all.

**中文**：它需要一个人全部的成交记录，加上他写给自己看、不打算给任何人看的话——而交易记录本身就是一个人手里最私密的数据之一。还有一条更硬的理由：**只有在确定没有人会看的前提下，人才会对自己说实话。** 隐私在这里不是卖点，是这份数据能不能存在的前提。

---

## 6. Why it must be AI / 为什么非要 AI 不可

> Two of the three layers do not need AI. Percentile statistics are arithmetic, and I do not intend to call them AI. **Knowing where not to use AI is how I know where to use it.** The second layer is different, and it is not sentence parsing.
>
> **Contradiction is semantic, not lexical.** "The fundamentals changed, I am here for the long term" and "you bought in the 97th percentile" do not contradict each other on the surface. They contradict because a genuinely long-term investor does not care where the short-term price sits. Following that requires understanding intent — and the same intent has unlimited phrasings. Enumeration always misses, and it misses the most original people first.
>
> **Meaning depends on the person's own history.** "I added a little" means different things to someone who usually buys 500 and someone who usually buys 5. That requires the whole history — which is why *why AI* and *why local* are two conclusions drawn from one constraint.
>
> **A fixed rule only catches the excuses I already thought of.** Rules have to enumerate self-deception in advance. Self-deception is not finite, and it evolves alongside self-knowledge: every time I am caught, I invent a better reason. No rule written in advance can keep up with that. The value of a model is not recognising the patterns I listed — it is finding the ones I did not.

**中文**：三层里有两层不需要 AI。分位数统计是算术，我不打算管它叫 AI。**知道哪里不该用 AI，恰恰证明我知道该用在哪。** 第二层不一样，而且它做的不是解析句子。
**矛盾是语义的，不是词汇的。** 「基本面变了，我是做长期的」和「你买在第 97 百分位」表面上并不矛盾。它们矛盾是因为一个真正做长期的人不在意短期价格位置。跟上这条推理需要理解意图——而同一个意图有无限多种说法。列举法必然漏，而且最先漏掉说法最独特的那些人。
**同一句话的含义取决于这个人自己的历史。**「我加了一点」，对一个平时单笔 500 的人和平时单笔 5 的人含义完全不同。这需要全部历史——**所以「为什么要 AI」和「为什么必须本地」是同一个约束推出的两个结论。**
**固定规则只能抓住我事先想得到的那些借口。** 规则必须预先穷举所有自欺方式。而自欺不是有限的，它会随着自我认知一起进化：每被抓住一次，我就发明一个更好的理由。任何事先写好的规则都追不上它。模型的价值不在于识别我列出的模式，而在于**发现我没列出的那些**。

---

## 7. Where this actually stands / 这个项目现在到底到哪一步了

> I want to be exact about what I am submitting, because an idea is easy to overstate.
>
> **The repository is still being built.** It is not a product and not a demo. **No AI model has been connected to it — no NLP, no agent, none of the algorithms described above.** What exists today is the foundation: a local-first encrypted ledger in TypeScript and Next.js, fully offline, with no server and no account. Data lives in a single encrypted file on the user's own disk (AES-256-GCM, PBKDF2-SHA256), and the key never leaves session memory. It is covered by 106 test files and 1,185 automated tests, with typecheck, lint and a production build as release gates. It is an alpha.
>
> What I can show instead is that this idea did not appear yesterday. **I have kept my own trading ledger since December 2024** — the month I started investing — and 415 real trades across 13 assets have already been converted and validated against it. And the field that stores the original sentence for each trade was built in June 2026, with the rule that it must never be trimmed, summarised or rewritten added on 31 July 2026. **Both are older than this idea. My data structure was protecting the raw material before I knew what it was for.**

**中文**：我想把提交的东西说准确，因为一个想法太容易被夸大。
**这个仓库还在建设中。** 它不是产品，也不是 demo。**目前没有接入任何 AI 模型——没有 NLP，没有 agent，上面描述的算法一个都还没有。** 今天存在的是地基：一个用 TypeScript 和 Next.js 写的本地优先加密账本，完全离线，无服务端、无账号。数据保存在用户自己磁盘上的单个加密文件里（AES-256-GCM、PBKDF2-SHA256），密钥从不离开会话内存。106 个测试文件、1,185 项自动化测试，配合类型检查、lint 与生产构建作为发布闸门。它处于 Alpha。
我能拿出来的是另一件事：这个想法不是昨天冒出来的。**我从 2024 年 12 月开始记自己的交易账本**——那正是我开始投资的月份——13 个资产、415 笔真实交易已经完成转换与校验。而那个保存每笔交易原话的字段建于 2026 年 6 月，「原句不得被 trim、摘要或改写」这条规矩加于 2026 年 7 月 31 日。**两者都早于这个想法。在我还不知道它有什么用之前，我的数据结构就已经在替它守住原始语料了。**

---

## 8. What I already know is hard / 我知道的难处

> If a user never writes anything, the second layer loses its input; layers one and three still work, but the system is worth less. The only remedy is to make speaking almost free — voice input, one sentence, always skippable, never blocking. There is no labelled ground truth for "was that impulsive", so evaluation will not measure label accuracy; it will measure the realised outcome of each class of behaviour, which is an objective number already in the ledger. And whether a small local model can read free-form Chinese and Hungarian well enough is untested.

**中文**：如果一个用户从不写任何东西，第二层就失去输入；第一、三层仍然工作，但系统价值打折。唯一的解法是把开口成本压到接近零——语音输入、一句话即可、随时可跳过、永不拦路。「这笔算不算追高」没有标准答案，所以评估不去测标签准确率，而是测每一类行为后来的实际盈亏——那是账本里现成的客观数字。至于一个本地小模型能不能读懂自由书写的中文和匈牙利文，尚未实测。

---

## 9. Closing / 结尾

> Wealth does not come from being right once. It comes from not making the same mistake twice — and you cannot stop a mistake you do not remember making.
>
> I am grateful to the Faculty for creating a place where an unfinished idea can be shown at all. But I would keep building this either way. I believe that one day someone other than me will need it.
>
> I grew up in China with the story of Ma Liang, a boy with a brush that could paint whatever was missing: the village had no waterwheel, so he painted one. I needed a tool to see who I really am with money. I looked for it, and it was not there. **I am a programmer now. When the tool is missing, I paint it.**

**中文**：财富不是靠对一次得来的，是靠不第二次犯同一个错——而你没法阻止一个你不记得自己犯过的错。
感谢学院提供了这样一个地方，让一个还没做完的想法也能被看见。但**即使没有这场比赛，我也会继续做下去。我相信总有一天，除了我之外也会有人真正需要它。**
我在中国长大，听着神笔马良的故事——一个少年有一支笔，能把缺的东西画出来：村里没有水车，他就画一架水车。我需要一个工具，去看清自己在钱这件事上到底是什么样的人。我找过，它不存在。**而我现在是个程序员。缺什么工具，我就自己画一个。**

---

## 待办

- [ ] 逐段读一遍，标出要删的
- [ ] 排进 PDF **实测页数**（12 号字、单倍行距）——词数只是估算，页数才是硬约束
- [ ] 超页时的删减顺序见下
