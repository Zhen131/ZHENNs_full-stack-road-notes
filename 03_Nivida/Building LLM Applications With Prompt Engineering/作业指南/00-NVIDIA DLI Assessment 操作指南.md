# NVIDIA DLI 作业操作指南

课程：Building LLM Applications With Prompt Engineering

适用对象：零基础，只想按步骤操作、跑通评分、拿到证书

预计耗时：20–40 分钟（含环境启动）

状态：方案基于课程全部课件与作业数据推导得出，代码用的全是课程教过的写法；**未在 NVIDIA 服务器上实跑验证**，以实际输出为准

---

## 一、这个作业要你做什么

作业给你 10 封虚构的顾客邮件，寄给一家叫 BuyBuy 的零售店，有夸的也有骂的。

你要写一段程序，读完这 10 封信，回答两句话：

1. 差评最集中在哪一**类商品**
2. 差评最多的是哪个**门店**

这不是填空题，作业里没有 `FIXME`。它给你一块空白区域让你自己写。但本指南已经把代码准备好了，**照着复制粘贴即可，无需自己编写代码**。

**自查答案**（仅用于核对，不要写进代码）：

- 商品类别 = `furniture`（家具）。5 封差评分别是餐桌、沙发、书架、躺椅、床架，全部属于家具。
- 门店 = `New York`（纽约）。纽约 4 封差评，奥克兰 1 封。

评分程序很可能会换一批新邮件来测试，**把答案写死在代码里必然不通过**。

---

## 二、你只需要动一个地方

整个课程环境里，需要修改的文件只有一个：

| 文件 | 动作 |
| --- | --- |
| `6-Assessment/61-Assessment.ipynb` | **唯一要动的文件** |
| `6-Assessment/62-Conclusion.ipynb` | 不用动，是结课总结页 |
| `1-Intro` 至 `5-Tools` 全部文件 | 不用动，是教学内容 |
| `6-Assessment/data/emails.json` | 不用动，是给你的数据 |

在 `61-Assessment.ipynb` 这一个文件内部，各小节的处理方式：

| 小节标题 | 动作 |
| --- | --- |
| Imports | 只运行，不改 |
| Create a Model Instance | 只运行，不改 |
| Assessment Objective | 纯说明文字，跳过 |
| Customer Emails | 只运行，不改 |
| Product Categories | 纯说明文字，跳过 |
| Checking Your Work | 只运行，不改（会报错，这是设计好的） |
| **Your Work Here** | **全部工作都在这里** |
| Get Certificate for the Workshop | 纯说明文字，按第七步操作 |

**记住一个关键词：`Your Work Here`。** 页面往下滚，找到这个标题，下面那块空白就是唯一的工作区。

---

## 三、JupyterLab 基本操作

JupyterLab 是一个在浏览器里写和运行 Python 代码的网页。页面由一格一格（称为"单元格"）组成：灰底的是代码格，白底的是说明文字。

**运行一个代码格**

- 点一下灰色代码格，按 `Shift + Enter`
- 左边显示 `[*]`：正在运行，等待，不要重复点击
- 左边显示 `[数字]`：这一格已运行完毕
- 出现红色文字：停下来，对照第九节的出错表处理，不要连续重跑

**新建一个代码格**（后面要用 6 次）

- 方法一：点一下某个格子的**左侧空白**，格子左边出现蓝色竖条后，按字母 `B`，下方即新增一个空代码格
- 方法二：把鼠标移到两个格子中间，出现 `+ Code` 按钮，点它

**保存**

- Windows：`Ctrl + S`；Mac：`Cmd + S`

**一个重要概念：Notebook 是有记忆的**

只要页面没有重启 Kernel，**之前成功运行过的内容会一直留在内存里**。某一格报错，既不会清空内存，也不会影响其他格子。

所以中途遇到报错时，通常**不需要从头重跑一遍**，只要把出问题的那一格解决掉，再继续往下即可。只有页面显示 Kernel 重启 / Connecting，才需要从最顶端重新按顺序运行。

---

## 四、第一步：打开作业文件

1. 在 NVIDIA 课程页面点击 `LAUNCH` 或 `START` 启动实验环境，等待 JupyterLab 打开。
2. 在左侧文件列表双击文件夹 `6-Assessment`。
3. 双击 `61-Assessment.ipynb`。
4. 确认标签页名称是 `61-Assessment.ipynb`。
5. 保存一次。

---

## 五、第二步：按顺序运行现成的格子（不修改任何内容）

从文件最上方开始，逐格按 `Shift + Enter` 往下运行，直到 `Your Work Here` 之前为止。

**1. Imports 那一格**

直接运行。没有红色报错即可继续。这一格已经把后面要用到的工具全部导入，包括 `BaseModel`、`Field`、`ChatPromptTemplate`、`RunnableLambda`、`StrOutputParser`、`pprint` 和评分函数 `run_assessment`。

**2. Create a Model Instance 那一格**

直接运行，三行内容一个字都不要改：

```python
base_url = os.getenv("NVIDIA_BASE_URL")
model = 'nvidia/nemotron-3-nano-30b-a3b'
llm = ChatNVIDIA(base_url=base_url, model=model, temperature=0)
```

**3. Customer Emails 下面的两格**

直接运行。第一格把 10 封邮件读入变量 `emails`，第二格打印前 3 封。

成功标志：屏幕上出现三段英文邮件（分别是夸搅拌机、投诉餐桌、夸运动鞋）。

**4. Checking Your Work 下面的两格**

这两格运行的是一个故意写错的示例链（无视邮件内容、硬答 clothing 和 Dallas），只为演示调用方式。**它们跟你的解法无关，跑不跑都行。**

务必分清这两格的区别：

| 格子 | 内容 | 预期结果 |
| --- | --- | --- |
| 第 1 格 | `mock_chain.invoke(emails)` | **应该成功**，打印一句英文。这是环境里第一次真正调用模型 |
| 第 2 格 | `try: run_assessment(mock_chain)` | 打印一段"未通过"的提示。**这个"报错"是设计好的，属正常** |

**如果第 1 格报 `ReadTimeout: ... Read timed out. (read timeout=60)`**，这不是正常现象，而是模型服务在 60 秒内没有响应（环境刚启动、服务未预热时常见）。处理办法：

- 先重新运行这一格一次，多数情况下第二次就通了
- 仍然超时，就新建一格运行下面这一行，把等待上限从 60 秒放宽到 300 秒，然后再试：

```python
llm._client.timeout = 300
```

**第 2 格建议直接跳过**，它会额外消耗几次模型调用，对拿证书没有帮助。

运行到这里，准备工作结束。

---

## 六、第三步：粘贴 6 段代码

位置：`Your Work Here` 标题**下面**。

按第三节的方法新建 6 个代码格，**按顺序**一格粘贴一段，**每粘一段就运行一次**，确认没有红色报错再粘下一段。

### 代码格 1：定义每封邮件要提取的 4 项信息

```python
class EmailInfo(BaseModel):
    """Information extracted from a single customer email."""

    sentiment: str = Field(
        description="Either 'positive' or 'negative'. Use 'negative' if the customer "
                    "is complaining, dissatisfied, or unhappy in any way."
    )
    product: str = Field(
        description="The specific product the customer bought, e.g. 'dining table', 'blender'."
    )
    product_category: str = Field(
        description="The broad category the product belongs to, as a single short lowercase "
                    "noun such as 'furniture', 'clothing', 'electronics', 'kitchen appliances'. "
                    "A dining table, a couch, a bookshelf, a recliner chair and a bed frame "
                    "all belong to the category 'furniture'."
    )
    store_location: str = Field(
        description="The city of the BuyBuy store mentioned in the email, e.g. 'New York'. "
                    "Return only the city name. Use 'unknown' if no location is mentioned."
    )
```

成功标志：运行后无红色报错（这一格没有输出，属正常）。

### 代码格 2：搭建"读一封信 → 提取 4 项信息"的链

```python
extract_prompt = ChatPromptTemplate.from_messages([
    ("system", "Extract the requested structured data from the customer email."),
    ("human", "Email: {email}")
])

extract_chain = extract_prompt | llm.with_structured_output(EmailInfo)
```

成功标志：运行后无红色报错。

### 代码格 3：拿一封信试跑，确认链是通的

```python
pprint(extract_chain.invoke({"email": emails[1]}))
```

成功标志：打印结果中 `sentiment` 为 negative、`product_category` 为 furniture、`store_location` 为 New York。

看到这个结果，说明整套方案可行。

这一格是整个流程中第一次真正调用模型，两种失败要分开处理：

- 报 `ReadTimeout`：模型服务超时，与代码无关。新建一格运行 `llm._client.timeout = 300`，然后重新运行代码格 2 和代码格 3
- 报其他错误（返回空、结构化输出不支持等）：跳到第九节的备用方案

### 代码格 4：一次读完全部邮件

```python
def extract_all(email_list):
    return extract_chain.batch([{"email": email} for email in email_list])

extract_all_runnable = RunnableLambda(extract_all)
```

成功标志：运行后无红色报错。

### 代码格 5：统计差评最多的类别和门店

```python
from collections import Counter


def _get(info, key):
    return info[key] if isinstance(info, dict) else getattr(info, key)


def _top(counter):
    if not counter:
        return 'unknown'
    # 先按次数降序，次数相同时按名称升序，保证结果可复现
    return sorted(counter.items(), key=lambda item: (-item[1], item[0]))[0][0]


def summarize(infos):
    category_counts = Counter()
    location_counts = Counter()

    for info in infos:
        if 'neg' not in str(_get(info, 'sentiment')).lower():
            continue

        category = str(_get(info, 'product_category')).strip().lower()
        if category and category != 'unknown':
            category_counts[category] += 1

        location = str(_get(info, 'store_location')).strip().title()
        if location and location.lower() not in ('unknown', 'n/a', 'none', ''):
            location_counts[location] += 1

    return (
        f"The product category with the most negative sentiment is {_top(category_counts)}. "
        f"The store location with the most negative sentiment is {_top(location_counts)}."
    )


summarize_runnable = RunnableLambda(summarize)
```

成功标志：运行后无红色报错。

### 代码格 6：接起来，跑出结果

```python
chain = extract_all_runnable | summarize_runnable

result = chain.invoke(emails)
print(result)
```

成功标志：打印出这样一句话：

```text
The product category with the most negative sentiment is furniture. The store location with the most negative sentiment is New York.
```

只要 `furniture` 和 `New York` 两个词都正确，就可以进入下一步。

这一格会一次性发出 10 个请求。如果这里报 `ReadTimeout`，把**代码格 4** 改成下面这样加上限流（一次只发 2 个），再依次重跑代码格 4 和代码格 6：

```python
def extract_all(email_list):
    return extract_chain.batch(
        [{"email": email} for email in email_list],
        config={"max_concurrency": 2},
    )

extract_all_runnable = RunnableLambda(extract_all)
```


如果类别输出成了 `home furniture`、`furnishings` 之类的近义词，先直接进第七节试评分；若评分不通过，再回到代码格 1，在 `product_category` 的描述末尾补一句：

```text
Always answer with a single common English noun such as 'furniture', 'clothing', 'electronics'.
```

补完后从代码格 1 重新运行到代码格 6。

---

## 七、第四步：运行评分

新建第 7 个代码格，粘贴并运行：

```python
run_assessment(chain)
```

评分程序会用**三组**邮件测试你的链：课程原始的 10 封，外加两组对照邮件。所以它会调用几十次模型，**可能需要几分钟**。看到 `[*]` 就耐心等待，**绝对不要重复点击**。

正因为它会换数据测试，把 `furniture`、`New York` 写死在代码里一定不通过。

| 结果 | 处理方式 |
| --- | --- |
| 明确的通过 / 成功提示 | 进入第八节领证书 |
| 提示类别不对 | 回代码格 1，按第六节末尾的办法补一句描述，重跑后再评分 |
| 提示门店不对 | 检查代码格 6 打印的句子里门店名是否正确；确认 `.title()` 那行没漏 |
| 报 `NameError: run_assessment` | 回最上方 Imports 那一格重新运行一次 |
| 其他报错 | 对照第九节出错表 |

---

## 八、第五步：领取证书

**只有 `run_assessment` 明确显示通过后才执行这一步。**

1. 保存 Notebook。
2. 切换到启动实验的那个 **NVIDIA 课程网页**（不是 JupyterLab 标签页）。
3. 找到带对勾图标的 `ASSESS TASK` 按钮并点击。**不要点成 `STOP TASK`。**
4. 等待几秒，页面出现祝贺信息。
5. 打开 <https://learn.nvidia.com/my-learning>，找到本课程的证书。
6. **下载证书，并确认本地确实存在该文件。**
7. 确认下载完成后，再回去点击 `STOP TASK` 关闭实验环境。

证书已下载到本地，任务才算真正完成。

---

## 九、备用方案（仅在代码格 3 报错时使用）

如果 `with_structured_output` 在当前环境不可用（报错、返回空、长时间无响应），改用下面这个更简单但精度稍低的写法。新建一个代码格，整段粘贴并运行：

```python
plan_b_template = ChatPromptTemplate.from_template('''\
You are a customer feedback analyst for a retail store called BuyBuy.

Below is a list of customer emails. Read all of them carefully and do the following:
1. Decide which emails express negative sentiment (a complaint or dissatisfaction).
2. For each negative email, identify the broad category of the product, for example
   furniture, clothing, electronics, or kitchen appliances. A dining table, a couch,
   a bookshelf, a recliner chair and a bed frame are all "furniture".
3. For each negative email, identify the city of the store mentioned.
4. Count them up and find the most frequent category and the most frequent city.

Emails:
{emails}

Respond with exactly two sentences and nothing else:
The product category with the most negative sentiment is <category>. \
The store location with the most negative sentiment is <city>.''')

chain = plan_b_template | llm | StrOutputParser()

print(chain.invoke(emails))
```

备用方案里变量名同样叫 `chain`，因此第七节的 `run_assessment(chain)` 照常使用。

注意：备用方案的统计由模型自己完成，可能数错。**优先使用第六节的主方案，备用方案只作兜底。**

---

## 十、出错分流表

| 现象 | 先做什么 | 不要做什么 |
| --- | --- | --- |
| `NameError: emails is not defined` | 回 Customer Emails 那一格重新运行 | 不要自己造数据 |
| `NameError: llm is not defined` | 回 Create a Model Instance 那一格重新运行 | 不要改模型名 |
| `NameError: BaseModel` / `Field` / `RunnableLambda` 等 | 回最上方 Imports 那一格重新运行 | 不要自己补写 import |
| `IndentationError` / `SyntaxError` | 粘贴时缩进被吃掉了。把整格清空，重新粘贴一次 | 不要逐行手动调缩进 |
| `[*]` 长时间不结束 | 模型正在推理，等待 1–2 分钟；评分那一格可能要几分钟 | 不要重复点击运行 |
| `ReadTimeout: ... read timeout=60` | 先重跑一次该格；仍超时就运行 `llm._client.timeout = 300` 后重试 | 不要以为是代码写错了 |
| 运行 `.batch()` 那一步超时 | 按第六节代码格 6 的说明给 `.batch()` 加 `max_concurrency` 限流 | 不要一次次盲目重跑 |
| 页面显示 Connecting / Kernel 重启 | 从 Notebook 最顶端按顺序重新运行全部格子 | 不要相信页面上残留的旧输出 |
| 代码格 3 报错 | 改用第九节备用方案 | 不要反复重跑同一格 |
| 评分不通过 | 先看代码格 6 打印的句子对不对，再针对性调整 | 不要连续提交碰运气 |
| 反复调整仍不通过 | 新建一格运行 `!cat assessment_helper.py`，直接查看评分程序的判定条件 | 不要修改这个文件 |

---

## 十一、不要做的事

- 不要修改 `62-Conclusion.ipynb`，不要修改 `1-Intro` 至 `5-Tools` 的任何文件。
- 不要修改 `base_url`、`model`、`temperature` 这三行。
- 不要修改 `data/emails.json`。
- 不要把变量名 `chain` 改成别的，`run_assessment(chain)` 依赖它。
- 不要把 `furniture` 和 `New York` 写死在代码里，评分程序可能更换测试数据。
- 不要在 `run_assessment` 通过之前点击课程页的 `ASSESS TASK`。
- 不要在证书下载完成之前点击 `STOP TASK`。
- 在没有真实评分输出之前，不要认为自己已经通过。

---

## 附：方案来源

本指南的 6 段代码均取自课程内已教授的写法，未引入课程之外的库或 API：

- 代码格 1、2：`4-Structured-Output/43-Document-Tagging` 的 Pydantic + `with_structured_output` 提取模式
- 代码格 4：`1-Intro-to-Prompting/14-Streaming-and-Batching` 的 `.batch()` 批处理
- 代码格 4、5：`2-Chains/22-Runnable-Functions` 的 `RunnableLambda` 自定义组件
- 代码格 6：`2-Chains/23-Combining-Chains` 的链式组合

作业开头 Imports 那一格提供的 `List`、`pprint`、`JsonOutputParser`、`RunnableLambda`、`BaseModel`、`Field`，本身就是出题方给出的解题方向提示，与本方案一致。

设计上把"提取信息"交给模型、"统计计数"交给 Python，是为了避免模型算错数字，这是本方案比备用方案更稳的原因。
