Most notebooks so far have used `meta/llama-3.2-11b-vision-instruct` for direct responses. This notebook adds `nvidia/nemotron-3-nano-30b-a3b` so we can compare direct prompting with an explicitly requested reasoning mode:

- Llama 3.2 11B remains the direct-response baseline.
- Nemotron 3 Nano receives a `/think` system message when reasoning is the behavior under study. Its final answer and reasoning trace use different response fields.

This comparison lets us choose reasoning only when the task justifies the additional latency, output length, and parsing care.

In the previous notebook, we learned about Chain-of-Thought (CoT) prompting, a technique where we ask a general chat model to work step by step. What changes when a model also provides a reasoning mode designed for that work?

In this notebook, we'll request that mode explicitly, inspect its separate reasoning metadata, and compare its trade-offs with a direct response.

![[Pasted image 20260901112513.png]]

---

## Objectives[](http://54.173.133.152/lab/lab/tree/3-Prompting-With-Messages/35-Reasoning-Models.ipynb#Objectives)

By the time you complete this notebook you will:

- Understand what reasoning models are and how they differ from standard LLMs
- Recognize the trade-offs involved in using reasoning models
- Learn how to handle reasoning traces returned by a model endpoint
- Be able to integrate reasoning models into LangChain chains

---

## Imports[](http://54.173.133.152/lab/lab/tree/3-Prompting-With-Messages/35-Reasoning-Models.ipynb#Imports)

import os

import re

import time

  

from langchain_nvidia_ai_endpoints import ChatNVIDIA

from langchain_core.prompts import ChatPromptTemplate

from langchain_core.output_parsers import StrOutputParser, JsonOutputParser

from langchain_core.runnables import RunnableLambda

from langchain_core.messages import AIMessage

---

## Create Model Instances[](http://54.173.133.152/lab/lab/tree/3-Prompting-With-Messages/35-Reasoning-Models.ipynb#Create-Model-Instances)

In this notebook, we'll be comparing a standard LLM with a reasoning model. Let's create both.

For our reasoning model, we'll use [**`nvidia/nemotron-3-nano-30b-a3b`**](https://build.nvidia.com/nvidia/nemotron-3-nano-30b-a3b). The `/think` system message requests reasoning, and the endpoint returns that reasoning separately from the final answer.

base_url = os.getenv("NVIDIA_BASE_URL")

  

# Our standard model (same as previous notebooks)

standard_llm = ChatNVIDIA(base_url=base_url, model='meta/llama-3.2-11b-vision-instruct', temperature=0)

  

# A reasoning model

reasoning_llm = ChatNVIDIA(

base_url=base_url,

model='nvidia/nemotron-3-nano-30b-a3b',

temperature=0.5, # See model card for task-specific temperature/sampling parameter recommendations.

max_completion_tokens=2048, # Reasoning models need enough room for analysis plus the final answer.

)

---

## Streaming Printing Helper[](http://54.173.133.152/lab/lab/tree/3-Prompting-With-Messages/35-Reasoning-Models.ipynb#Streaming-Printing-Helper)

In this notebook we will use the following helper function to print streaming responses from the LLM.

def sprint(stream):

for chunk in stream:

if chunk.additional_kwargs.get('reasoning_content'): ## Display reasoning metadata when present.

print(chunk.additional_kwargs.get('reasoning_content', ""), end='', flush=True)

if chunk.content:

print("\033[1m" + chunk.content + "\033[0m", end='', flush=True) ## Otherwise, we will print output in bold.

---

## Reasoning Models[](http://54.173.133.152/lab/lab/tree/3-Prompting-With-Messages/35-Reasoning-Models.ipynb#Reasoning-Models)

In the previous notebook, a Chain-of-Thought prompt asked a general chat model to show intermediate steps. A reasoning mode supplies a model and serving path designed to allocate more work before the final answer.

**Reasoning models and reasoning modes** take this a step further. They are trained or fine-tuned to support extended deliberation before producing a final answer. The interface used here makes that choice explicit with the `/think` system message.

Let's see this in action with a puzzle requiring some multi-step logical thinking. We'll present both models with the same problem and compare their responses.

problem = """You are a world-class logician. Read the following short story carefully:

Alice, Bob, and Charlie are the only three people in a house. At midnight, exactly one of them is in the kitchen, exactly one is in the bedroom, and exactly one is in the bathroom.

The light in the kitchen is on.

Alice hates bright lights and never enters a room that has its light on.

Bob is afraid of the dark and never enters a room that has its light off.

Charlie always tells the truth.

Charlie says: “Bob is in the bathroom.”

Where is each person, and is the bedroom light on or off?

Answer with exactly four sentences: one stating where Alice is, one stating where Bob is, one stating where Charlie is, and one stating whether the bedroom light is on or off.

Do not guess."""

If you're interested try to work the problem out for yourself. When you're ready view the solution by viewing the cell immediately below.

**Click to show solution**

> Alice is in the bedroom.  
> Bob is in the bathroom.  
> Charlie is in the kitchen.  
> The bedroom light is off.

First, let's see how our direct-response model performs on this logic puzzle.

## Diagnostic Check: What's actually coming out of the stream.

# stream = standard_llm.stream(problem)

# print(next(stream))

# print(next(stream))

sprint(standard_llm.stream(problem))

And now let's give the problem to a reasoning model.

## Diagnostic Check: What's actually coming out of the stream.

# stream = reasoning_llm.stream([("system", "/think"), ("user", problem)])

# print(next(stream))

# print(next(stream))

  

sprint(reasoning_llm.stream([("system", "/think"), ("user", problem)]))

Compare both final answers with the revealed solution before comparing their response shape. A longer answer or reasoning trace is not evidence that the answer is correct. The direct call returns answer content, while the `/think` call can also stream a reasoning trace through `reasoning_content`.

The serving API separates that trace from the final answer, so LangChain exposes it as response metadata rather than ordinary message content.

---

## The Trade-Offs[](http://54.173.133.152/lab/lab/tree/3-Prompting-With-Messages/35-Reasoning-Models.ipynb#The-Trade-Offs)

Reasoning paths can improve some complex tasks, but they also introduce trade-offs:

1. **Latency**: Generating a reasoning trace can lengthen a request.
2. **Cost**: More generated tokens can mean higher API cost or more self-hosted compute.
3. **Limited benefit for simple tasks**: Straightforward questions may not improve enough to justify the extra work.

Let's measure the latency difference on a simple task.

simple_task = "Summarize the benefits of exercise in one sentence."

  

# Time the standard model

start = time.time()

standard_response = standard_llm.invoke(simple_task)

standard_time = time.time() - start

  

# Time the reasoning model

start = time.time()

reasoning_response = reasoning_llm.invoke([("system", "/think"), ("user", simple_task)])

reasoning_time = time.time() - start

  

standard_text = standard_response.content or ""

reasoning_text = reasoning_response.content or ""

reasoning_trace = reasoning_response.response_metadata.get("reasoning_content", "")

  

print(f"Standard model: {standard_time:.1f} seconds, {len(standard_text)} answer characters")

print(f"Reasoning model: {reasoning_time:.1f} seconds, {len(reasoning_text)} answer characters")

print(f"Reasoning trace: {len(reasoning_trace)} separate metadata characters")

print(f"\nReasoning/direct latency ratio: {reasoning_time/standard_time:.1f}x")

  

The measurements above show the latency for this run. For an application, compare task quality, latency, and token use before choosing the reasoning path.

---

## Handling Reasoning Traces[](http://54.173.133.152/lab/lab/tree/3-Prompting-With-Messages/35-Reasoning-Models.ipynb#Handling-Reasoning-Traces)

As we saw above, our NIM-hosted model keeps streaming reasoning in `additional_kwargs['reasoning_content']`. For a completed non-streaming response, the same field is available through `response_metadata['reasoning_content']`, while `.content` carries the final answer. Not all reasoning models or endpoints work this way. There are two common paradigms you'll encounter:

1. **Structured API fields** — The serving infrastructure parses thinking server-side and places it in a separate response field (like `reasoning_content`). This is what our NIM endpoint does.
2. **Inline `<think>` tags** — Some models or self-hosted endpoints leave `<think>...</think>` tags directly in the response text.

To build robust applications, it's good practice to handle both cases. Let's create a helper function that does this.

test_message = "<think>Let me think about this for a second...</think>Thinking is great!"

re.sub(r'<think>.*?</think>', '', test_message, flags=re.DOTALL)

Let's create a simple helper function using the same method to work on model responses.

def strip_thinking(message):

"""Return the final answer while dropping model-specific reasoning traces.

  

Some reasoning models emit <think>...</think> in visible content.

Nemotron 3 Nano exposes reasoning in response metadata instead, while

message.content carries the final answer.

"""

content = message.content or ""

cleaned = re.sub(r'<think>.*?</think>', '', content, flags=re.DOTALL)

if '<think>' in cleaned:

cleaned = re.sub(r'<think>.*', '', cleaned, flags=re.DOTALL)

return AIMessage(content=cleaned.strip(), additional_kwargs={})

  

Let's test this helper with a fresh response from our reasoning model. Since our NIM endpoint separates thinking into response metadata, the `.content` field already contains only the final answer. The function returns that content; for a response with inline `<think>` tags, it removes the tagged block.

response = reasoning_llm.invoke([("system", "/think"), ("user", "What is the capital of France?")])

print(response.content)

print("\nReasoning trace preview:")

print(response.response_metadata.get("reasoning_content", "")[:500])

  

stripped_response = strip_thinking(response)

print(stripped_response.content)

visible_content = response.content or ""

reasoning_trace = response.response_metadata.get("reasoning_content", "")

print(f"Visible answer before stripping: {len(visible_content)} characters")

print(f"Reasoning trace side channel: {len(reasoning_trace)} characters")

print(f"After stripping: {len(stripped_response.content)} characters")

  

**Important Note:** The format of reasoning traces is not standardized across models. Some models use visible `<think>` tags; this endpoint exposes reasoning in response metadata such as `reasoning_content` while keeping the final answer in `content`. Always check the model documentation and inspect one response before you wire a reasoning model into a parser or tool call.

That said, the principle remains the same: you'll need to handle this content appropriately for your use case.

---

## Integrating into Chains[](http://54.173.133.152/lab/lab/tree/3-Prompting-With-Messages/35-Reasoning-Models.ipynb#Integrating-into-Chains)

Now, how do we use our `strip_thinking` function in a LangChain chain? If you recall from earlier notebooks, we can use `RunnableLambda` to wrap any Python function and make it part of a chain.

Let's build a chain that uses the reasoning model and cleanly strips out the thinking process.

reasoning_prompt = ChatPromptTemplate.from_messages([

("system", "/think"),

("user", "{input}"),

])

  

clean_reasoning_chain = reasoning_prompt | reasoning_llm | RunnableLambda(strip_thinking) | StrOutputParser()

result = clean_reasoning_chain.invoke({"input": "In one sentence, what's the best thing anyone of any age can do?"})

print(result)

The chain works as follows:

1. `reasoning_llm` generates a response with a final answer plus model-specific reasoning metadata.
2. `RunnableLambda(strip_thinking)` keeps the final answer and drops visible or side-channel reasoning traces.
3. `StrOutputParser()` extracts the clean string content.

The user or downstream runnables in the chain see only the polished final answer, while the model still benefits from its internal reasoning process.

---

## Why Stripping Matters: Structured Output[](http://54.173.133.152/lab/lab/tree/3-Prompting-With-Messages/35-Reasoning-Models.ipynb#Why-Stripping-Matters:-Structured-Output)

You might wonder: "Why remove a visible `<think>` block? Can't I just ignore it?"

Our current endpoint keeps the reasoning trace out of `.content`, so its trace does not break the JSON parser. Other endpoints may return inline `<think>` tags, and those tags do break a JSON-only contract. The following message reproduces that response shape before we use the live endpoint.

prompt = ChatPromptTemplate.from_messages([

("system", "/think"),

("human", "Respond with JSON only, no additional text. Extract name and age as JSON: {text}")

])

  

parser = JsonOutputParser() # Will parse key entities in the final output into a JSON object

First, let's try **without** removing the inline reasoning block.

inline_response = AIMessage(content='<think>Extract the fields.</think>{"name": "John Smith", "age": 35}')

  

try:

result = parser.invoke(inline_response)

print(f"Result: {result}")

except Exception as e:

print(f"Error: {type(e).__name__}")

print("The <think> block broke the JSON parser!")

Now let's try **with** our `strip_thinking` function in the chain.

chain_with_strip = prompt | reasoning_llm | RunnableLambda(strip_thinking) | parser

  

result = chain_with_strip.invoke({"text": "John Smith is 35 years old."})

print(f"Result: {result}")

The synthetic inline response fails until the thinking block is removed. The live chain also succeeds because `strip_thinking` accepts either response shape before the JSON parser.

---

## When to Retain a Reasoning Trace[](http://54.173.133.152/lab/lab/tree/3-Prompting-With-Messages/35-Reasoning-Models.ipynb#When-to-Retain-a-Reasoning-Trace)

Most applications should keep reasoning traces out of the user-facing answer. Retaining them can still help in bounded cases such as:

- **Interface demonstrations**: Showing how answer content and response metadata differ
- **Endpoint diagnostics**: Checking whether a serving change moved or reformatted the trace

Treat a reasoning trace as model-generated output, not a faithful explanation or a reason to trust the answer. If you display one, label that limitation and keep it separate from the final answer.

---

## Exercise: Build a Reasoning Chain[](http://54.173.133.152/lab/lab/tree/3-Prompting-With-Messages/35-Reasoning-Models.ipynb#Exercise:-Build-a-Reasoning-Chain)

For this exercise, you'll build a chain that uses the reasoning model for a math problem, strips any visible `<think>` block, and returns just the clean answer.

Here's the problem:

challenging_expression = "286899 * 3902789"

Let's see how our `standard_llm` does with this problem.

# print(standard_llm.invoke(f"What is {challenging_expression}?").content)

sprint(standard_llm.stream(f"What is {challenging_expression}?"))

print(f"ACTUAL ANSWER: {challenging_expression} = {eval(challenging_expression):,}")

Your task:

1. Create a chain using `reasoning_llm`
2. Include `strip_thinking` in the chain to remove any inline reasoning block
3. Use `StrOutputParser` to get clean string output
4. Invoke the chain with the provided problem

Feel free to check out the _Solution_ below if you get stuck.

### Your Work Here[](http://54.173.133.152/lab/lab/tree/3-Prompting-With-Messages/35-Reasoning-Models.ipynb#Your-Work-Here)

# Your code here

### Solution[](http://54.173.133.152/lab/lab/tree/3-Prompting-With-Messages/35-Reasoning-Models.ipynb#Solution)

2 cells hidden

## Summary[](http://54.173.133.152/lab/lab/tree/3-Prompting-With-Messages/35-Reasoning-Models.ipynb#Summary)

In this notebook, you learned:

- **Reasoning models and modes** support extended deliberation; this endpoint requests it with `/think`
- Their thinking may appear as inline `<think>...</think>` tags or in a separate response field like `reasoning_content`, depending on the model and serving infrastructure
- There are **trade-offs** in task quality, latency, and token use
- You can use `RunnableLambda` to remove inline reasoning blocks before structured parsing
- Retained traces can help with bounded interface diagnostics but need clear limitations

As you build applications, measure when the reasoning path improves the task enough to justify its runtime and parsing costs.

---

Continue the unified course path

**Next step:** Open `3-Prompting-With-Messages/36-Chatbots.ipynb` next: **Chatbots**.

**Before moving on:** Keep one judgment about when requested reasoning is worth its cost, because the next notebook folds those message choices into a longer conversational assistant.

Click to add a cell.