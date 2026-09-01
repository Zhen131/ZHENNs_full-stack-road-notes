# NVIDIA DLI 作业操作指南（Building LLM Applications With Prompt Engineering）

日期：2026-09-01

状态：已通读全部课件和 10 封邮件原文，方案已确定；**尚未在 NVIDIA 服务器上实跑验证**

目标：只动一个文件 `6-Assessment/61-Assessment.ipynb`，粘贴 6 段代码，跑通评分，回课程网页拿证书。

---

## 零、一分钟看懂你要干嘛

这门课的作业**不是填空题**。它给你一块空白区域（写着 `Your Work Here`），让你自己写代码。

但是对你来说其实更省事：**下面第五步里那 6 段代码，你原封不动复制粘贴就行，一个字都不用改。**

要解决的问题：有 10 封顾客邮件，有夸的有骂的。你要写一段程序，让它读完这 10 封信，回答两句话：

1. 骂得最多的是哪**类商品**
2. 骂得最多的是哪个**门店**

我已经把 10 封信全读了，正确答案是：

- 商品类别 = **furniture（家具）**：餐桌、沙发、书架、躺椅、床架，5 封差评全是家具
- 门店 = **New York（纽约）**：纽约 4 封差评，奥克兰 1 封

这个答案你**只用来自查**，不要写死在代码里（判分程序很可能会换一批新邮件测你，写死必挂）。

---

## 一、你到底要在哪儿改

| 文件 | 你要做什么 |
| --- | --- |
| `6-Assessment/61-Assessment.ipynb` | **唯一要动的文件**。在 `Your Work Here` 标题下面新建 6 个代码格，粘贴代码 |
| `6-Assessment/62-Conclusion.ipynb` | **完全不用动**。就是一页恭喜你 + 问卷链接，看看就行 |
| `1-Intro` 到 `5-Tools` 所有文件 | **完全不用动**。那是教学内容，不参与评分 |
| `data/emails.json` | **不要改**。这是给你的数据 |

再说细一点，`61-Assessment.ipynb` 这一个文件里面：

| 小节标题 | 你的动作 |
| --- | --- |
| Imports | 只运行，不改 |
| Create a Model Instance | 只运行，不改 |
| Assessment Objective | 纯文字说明，跳过 |
| Customer Emails | 只运行，不改（它帮你把邮件读进变量 `emails`） |
| Product Categories | 纯文字说明，跳过 |
| Checking Your Work | 只运行，不改（它跑一个故意写错的示例，**会报错，这是正常的**） |
| **Your Work Here** | **← 全部工作都在这里。新建 6 个格子粘代码** |
| Get Certificate | 纯文字说明，按里面说的回网页点按钮 |

所以你需要"精准定位"的地方只有一个词：**`Your Work Here`**。往下滚，看到这个标题，下面那块空白就是你的战场。

---

## 二、关于"我是不是漏复制了东西"

我核对过了，你复制的内容**基本是完整的**。缺的只有下面这些，而且都不影响做题：

| 缺的东西 | 影响 | 怎么办 |
| --- | --- | --- |
| `assessment_helper.py` 的源码 | **唯一有实质影响的**。这是判分程序，它长什么样我看不到 | 第四步教你一行命令打印出来 |
| 各章节里折叠起来的 `Solution` 参考答案（课件里显示成 "1 cell hidden"） | 无。那是教学练习的答案，不是作业 | 不用管 |
| `ASSESS TASK` 按钮的那张截图（你的 61 文件里那个位置是空的） | 无。我在第七步用文字描述了 | 不用管 |
| 前 5 章可能也有自己的 `data/` 文件夹 | 无。作业只用 `6-Assessment/data/emails.json`，你已经复制到了 | 不用管 |

**最坏打算**：万一进去发现 Notebook 里还有你没复制到的内容（比如多一个提示、多一个格子），不要慌，直接把你看到的截图或文字发我，我改指南。你已有的信息足够我把主体方案定死了。

---

## 三、要不要现在启动 JupyterLab？

先说 JupyterLab 是什么：它就是一个**在浏览器里写和跑 Python 代码的网页**。页面由一格一格组成（叫"单元格 / cell"），灰底的是代码格，白底的是说明文字。点一下代码格，按 `Shift+Enter`，那一格就跑起来，结果显示在下面。仅此而已。

**要不要现在启动？**

- 你**不需要**为了"让我先看看"而启动。我要的信息已经够了。
- 但你**必须**启动才能做作业，而且这门课跑得很快（不像 Diffusion 要训练几十分钟），从启动到拿证书，顺利的话 **20–40 分钟**能搞定。
- 所以：**等你有一段完整的空闲时间再启动，一口气做完。** 启动之后就照着下面第四步往下走。

---

## 四、进环境后的前四件事

1. 回 NVIDIA 课程页，点 `LAUNCH` 或 `START` 启动实验，等 JupyterLab 打开。
2. 左边文件列表里，双击文件夹 `6-Assessment`，再双击 `61-Assessment.ipynb`。
3. 确认标签页标题是 `61-Assessment.ipynb`，不是别的。
4. 按 `Ctrl+S`（Mac 是 `Cmd+S`）先保存一次。

**运行代码格的方法**（全篇通用）：

- 点一下灰色代码格 → 按 `Shift+Enter`
- 左边出现 `[*]`：正在跑，等着，别重复点
- 左边变成 `[数字]`：跑完了
- 出现红色文字：先停下来看第九步的出错表，别连着重跑

**新建一个代码格的方法**（后面要用 6 次）：

- 点一下某个格子（点它左边的空白，格子会有蓝色竖条，说明是"命令模式"）
- 按字母 `B` → 下面就多出一个空的代码格
- 点进去就能粘贴
- 如果按 `B` 没反应，就用鼠标：把光标移到两个格子中间，会出现一个 `+ Code` 按钮，点它

---

## 五、第一步：把现成的格子按顺序跑一遍（不要改任何东西）

从 `61-Assessment.ipynb` 最上面开始，一格一格按 `Shift+Enter` 往下跑，一直跑到 `Your Work Here` 之前。具体是：

1. **Imports 那一格** —— 直接跑。跑完没红字就行。
2. **Create a Model Instance 那一格** —— 直接跑。里面是这三行，不要改：

```python
base_url = os.getenv("NVIDIA_BASE_URL")
model = 'nvidia/nemotron-3-nano-30b-a3b'
llm = ChatNVIDIA(base_url=base_url, model=model, temperature=0)
```

3. **Customer Emails 下面两格** —— 直接跑。第一格把邮件读进变量 `emails`，第二格打印前 3 封。

   成功标志：屏幕上出现三段英文邮件（Sarah 夸搅拌机、Alex 骂餐桌、Mia 夸运动鞋）。

4. **Checking Your Work 下面几格** —— 直接跑。

   **重要：这里会打印出一段错误信息，这是正常的，是设计好的。** 它跑的是一个"故意写错"的示例链（无视邮件、硬答 clothing 和 Dallas），判分程序当然不让它过。

   **请把这段红字/错误信息完整看一遍并记下来**，因为它会告诉你判分程序到底在挑什么毛病，非常有用。

---

## 六、第二步：先看一眼判分程序（强烈建议做）

这一步不是作弊，`assessment_helper` 是它自己给你的文件。目的是搞清楚它凭什么判你及格。

在 `Your Work Here` 下面新建一个代码格，粘贴这一行，然后 `Shift+Enter`：

```python
!cat assessment_helper.py
```

屏幕上会打印出判分程序的源码。**把打印出来的内容截图或复制下来**，看两件事：

- 它是拿原来这 10 封邮件测，还是自己另外准备了一批邮件
- 它检查你的回答时，是找 "furniture" 这个词，还是别的判断方式

看不懂没关系，**发给我，我一眼就能告诉你要不要调整。** 如果你不想中断，也可以先跳过，直接照第七步做，多半是能过的。

（如果这行命令报 `No such file`，换成 `!ls` 看看当前目录有哪些文件，把结果发我。）

---

## 七、第三步：粘贴 6 段代码（核心步骤）

位置：`Your Work Here` 这个标题**下面**。按第四步教的方法，新建 6 个代码格，**按顺序**一格粘一段，**每粘一段就按 `Shift+Enter` 跑一次**，确认没红字再粘下一段。

### 代码格 1：告诉模型，每封邮件要提取哪 4 项信息

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
        description="The broad category the product belongs to, as a short lowercase noun, "
                    "e.g. 'furniture', 'clothing', 'electronics', 'kitchen appliances'. "
                    "A dining table, a couch, a bookshelf, a recliner chair and a bed frame "
                    "all belong to the category 'furniture'."
    )
    store_location: str = Field(
        description="The city of the BuyBuy store mentioned in the email, e.g. 'New York'. "
                    "Use 'unknown' if the email does not mention any location."
    )
```

跑完没红字即可，不会有输出。

### 代码格 2：搭一条"读一封信 → 吐出这 4 项"的链

```python
extract_prompt = ChatPromptTemplate.from_messages([
    ("system", "Extract the requested structured data from the customer email."),
    ("human", "Email: {email}")
])

extract_chain = extract_prompt | llm.with_structured_output(EmailInfo)
```

跑完没红字即可。

### 代码格 3：先拿一封信试试，确认链是活的

```python
pprint(extract_chain.invoke({"email": emails[1]}))
```

**成功标志**：打印出来的东西里，`sentiment` 是 negative，`product` 是餐桌之类，`product_category` 是 furniture，`store_location` 是 New York。

看到这个结果，说明方案跑通了，剩下的都是水到渠成。如果这里报错，跳到第十步的"备用方案 Plan B"。

### 代码格 4：让它一次读完全部 10 封信

```python
def extract_all(emails):
    return extract_chain.batch([{"email": email} for email in emails])

extract_all_runnable = RunnableLambda(extract_all)
```

跑完没红字即可。

### 代码格 5：用 Python 数出"哪类商品差评最多、哪个门店差评最多"

```python
from collections import Counter

def _get(info, key):
    return info[key] if isinstance(info, dict) else getattr(info, key)

def summarize(infos):
    category_counts = Counter()
    location_counts = Counter()

    for info in infos:
        if 'neg' in str(_get(info, 'sentiment')).lower():
            category = str(_get(info, 'product_category')).strip().lower()
            location = str(_get(info, 'store_location')).strip()
            if category:
                category_counts[category] += 1
            if location and location.lower() not in ('unknown', 'n/a', 'none', ''):
                location_counts[location] += 1

    top_category = category_counts.most_common(1)[0][0] if category_counts else 'unknown'
    top_location = location_counts.most_common(1)[0][0] if location_counts else 'unknown'

    return (
        f"The product category with the most negative sentiment is {top_category}. "
        f"The store location with the most negative sentiment is {top_location}."
    )

summarize_runnable = RunnableLambda(summarize)
```

跑完没红字即可。

### 代码格 6：把两截接起来，跑一次看结果

```python
chain = extract_all_runnable | summarize_runnable

result = chain.invoke(emails)
print(result)
```

**成功标志**：打印出这么一句（大小写可能略有出入）：

```text
The product category with the most negative sentiment is furniture. The store location with the most negative sentiment is New York.
```

只要 `furniture` 和 `New York` 这两个词都对，就可以进下一步。

如果类别输出成了 `home furniture`、`furnishings` 之类的近义词，先别急，直接进第八步试评分——过了就过了。没过再回来，把代码格 1 里 `product_category` 那段描述末尾加一句：

```text
Always use a single common English noun such as 'furniture', 'clothing', 'electronics'.
```

改完从代码格 1 开始重跑到代码格 6。

---

## 八、第四步：跑评分

新建第 7 个代码格，粘贴并运行：

```python
run_assessment(chain)
```

等它跑完（会调用几次模型，可能要十几秒到一分钟），**不要重复点**。

结果处理：

| 看到什么 | 怎么办 |
| --- | --- |
| 明确的成功/通过提示 | 直接进第九步拿证书 |
| 说类别不对 | 回第七步末尾那个"近义词"处理办法 |
| 说门店不对 | 把代码格 6 的 `print(result)` 结果发我，一起看 |
| 报错说 chain 调用方式不对 | 把完整报错发我；多半是 `run_assessment` 传参方式和我猜的不同 |
| 报错说找不到 `run_assessment` | 回最上面 Imports 那一格重跑一次 |

---

## 九、第五步：回课程网页拿证书

**只有 `run_assessment` 明确显示通过之后才做这一步。**

1. `Ctrl+S` / `Cmd+S` 保存 Notebook。
2. 切回浏览器里那个**启动实验的 NVIDIA 课程页面**（不是 JupyterLab 那个标签页）。
3. 在页面上找到带对勾图标的 **`ASSESS TASK`** 按钮，点它。**千万别点成 `STOP TASK`。**
4. 等几秒，出现祝贺信息。
5. 打开 [https://learn.nvidia.com/my-learning](https://learn.nvidia.com/my-learning)，找到这门课的证书。
6. **下载证书，并确认电脑上真的存在这个文件。**
7. 确认下载好了，再回去点 `STOP TASK` 关掉实验。

证书已下载到本地，这次目标才算真的完成。

---

## 十、备用方案 Plan B（代码格 3 报错时才用）

如果 `with_structured_output` 在这个环境里不好使（报错、返回空、一直转圈），换成下面这个更笨但更稳的写法。**新建一个代码格**，把它整段粘进去跑：

```python
plan_b_template = ChatPromptTemplate.from_template('''\
You are a customer feedback analyst for a retail store called BuyBuy.

Below is a list of customer emails. Read all of them carefully and do the following:
1. Decide which emails express negative sentiment (a complaint or dissatisfaction).
2. For each negative email, identify the broad category of the product
   (for example: furniture, clothing, electronics, kitchen appliances).
   A dining table, a couch, a bookshelf, a recliner chair and a bed frame are all "furniture".
3. For each negative email, identify the city of the store mentioned.
4. Count them up.

Emails:
{emails}

Respond with exactly two sentences and nothing else:
The product category with the most negative sentiment is <category>. \
The store location with the most negative sentiment is <city>.''')

chain = plan_b_template | llm | StrOutputParser()

print(chain.invoke(emails))
```

注意：Plan B 里变量名也叫 `chain`，所以第八步的 `run_assessment(chain)` 照跑不误。

Plan B 的风险是答案由模型自己数，可能数错；如果它答错了，多跑两次看看，或者把 `<category>` 换成更具体的引导。**优先用 Plan A（第七步），Plan B 只是兜底。**

---

## 十一、出错分流表

| 现象 | 先做什么 | 不要做什么 |
| --- | --- | --- |
| `NameError: emails is not defined` | 回 Customer Emails 那一格重跑 | 不要自己造数据 |
| `NameError: llm is not defined` | 回 Create a Model Instance 那一格重跑 | 不要改模型名 |
| `NameError: BaseModel / Field / ...` | 回最上面 Imports 那一格重跑 | 不要自己乱补 import |
| `IndentationError` / `SyntaxError` | 多半是粘贴时缩进被吃了。把整格删空，重新粘一次 | 不要手动一行行调缩进 |
| `[*]` 卡很久 | 模型在算，等 1–2 分钟 | 不要重复点运行 |
| Kernel 断了 / 页面显示 Connecting | 从 Notebook 最顶上重新按顺序跑一遍全部格子 | 不要相信页面上残留的旧输出 |
| 代码格 3 报错 | 走第十步 Plan B | 不要反复重跑同一格 |
| 评分说答案不对 | 先看代码格 6 打印的那句话对不对 | 不要连续提交碰运气 |

---

## 十二、不要做的事

- 不要改 `62-Conclusion.ipynb`，不要改 `1-Intro` 到 `5-Tools` 的任何文件。
- 不要改 `base_url`、`model`、`temperature` 这三行。
- 不要改 `data/emails.json`。
- 不要把 `chain` 这个变量名改成别的（`run_assessment(chain)` 要用它）。
- 不要在代码里把 `furniture` 和 `New York` 写死——判分程序很可能换数据测你。
- 不要在 `run_assessment` 通过之前点课程页的 `ASSESS TASK`。
- 不要在证书下载好之前点 `STOP TASK`。
- 在没有真实评分输出之前，不要认为自己已经通过。

---

## 附：本指南的可信度说明

- 6 段代码是我根据课件里 `43-Document-Tagging`（Pydantic 提取）、`24-Parallel-Chains`（RunnableLambda 组链）、`22-Runnable-Functions`（batch 批处理）的官方写法拼出来的，用的全是这门课教过的 API，**没有引入课程之外的东西**。
- 作业开头给你的那一堆 import（`List`、`pprint`、`JsonOutputParser`、`RunnableLambda`、`BaseModel`、`Field`）本身就是出题人给的路线提示，我的方案正好对上。
- 答案 furniture / New York 是我逐封读完 10 封邮件数出来的，确定。
- **但是**：`assessment_helper.py` 的源码我没有，所以"判分程序具体怎么判"是唯一的未知数。第六步那一行 `!cat assessment_helper.py` 就是为了消掉这个未知数。跑完把结果发我。
- 全部代码**未在真实环境验证过**。以你实跑的输出为准。
