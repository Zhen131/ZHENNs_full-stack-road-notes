In this notebook you learn to augment your LLM with the ability to indicate that external, non-LLM related functionality ought to be utilized, a technique we call tool use.

![[Pasted image 20260901113421.png]]

---

## Objectives[](http://54.173.133.152/lab/lab/tree/5-Tools/51-Tool-Calling.ipynb#Objectives)

By the time you complete this notebook you will:

- Understand what a tool is in the context of LLM applications.
- Be able to create tools.
- Learn about how model recommendations about when and how to use a tool are materialized.

---

## Imports[](http://54.173.133.152/lab/lab/tree/5-Tools/51-Tool-Calling.ipynb#Imports)

import os

from langchain_nvidia_ai_endpoints import ChatNVIDIA

from langchain_core.prompts import ChatPromptTemplate

from langchain_core.runnables import RunnableLambda

from pydantic import BaseModel, Field

import wikipediaapi

---

## Create a Model Instance[](http://54.173.133.152/lab/lab/tree/5-Tools/51-Tool-Calling.ipynb#Create-a-Model-Instance)

base_url = os.getenv("NVIDIA_BASE_URL")

model = 'nvidia/nemotron-3-nano-30b-a3b'

llm = ChatNVIDIA(base_url=base_url, model=model, temperature=0)

---

## LLMs Using Tools[](http://54.173.133.152/lab/lab/tree/5-Tools/51-Tool-Calling.ipynb#LLMs-Using-Tools)

Throughout the workshop we've been exploring some of the amazing tasks that LLMs are capable of doing, but of course they aren't well-suited to every task. Whether it's for a task that a model would try to do but probably shouldn't, like math or other calculation-based tasks, or for a task that is downright impossible for an LLM, like making calls to external services, sometimes we want to augment our LLM-based applications to be able to use tools external to the LLM itself.

You've done some of this already by creating custom runnables via `RunnableLambda` and including them in your chains. These custom runnables can perform arbitrary tasks, not necessarily using an LLM.

Now we are going to look at a different powerful technique whereby we provide an LLM with a collection of functions, or "tools" that might be appropriate to use, depending on the user's input, and allow the LLM to decide when using one or several of the tools will be appropriate. Additionally, we will use the LLM to provide details about how the tool (or tools) it deems appropriate to use ought to be called.

A lot of what you learned in the previous section around structured data generation applies to LLM tool calling: The LLM is able to generate output conforming to a specific structure. In the case of tool calling, the LLM will be generating its output to indicate which tool ought to be called, and what arguments ought to be passed to it.

---

## Simple Tool Creation[](http://54.173.133.152/lab/lab/tree/5-Tools/51-Tool-Calling.ipynb#Simple-Tool-Creation)

To begin, we need to know how to create an LLM tool. Perhaps the easiest way is with the `tool` decorator, which we can apply to any function, converting the function into a tool.

from langchain_core.tools import tool

Here we apply the `tool` decorator to a very simple `add` function

@tool

def add(a: int, b: int) -> int:

"""Add two numbers"""

return a + b

Since `add` is no longer a Python function, but rather a tool, it has some specific attributes associated with it that we can inspect. The first is its name, a string based on the name we used for the decorated Python function.

add.name

Next is a `description`, which you'll notice is created from the decorated function's docstring.

add.description

As was the case with Pydantic classes used for structured data output in the previous section, our docstrings are going to be used by LangChain under the hood to convey information to the LLM, and thus, not only is it important to add a meaningful docstring to your tools, but it is in fact required.

Tools also have an `args` attribute. Because we used type hints on our definition above, we see that each arg has some additional information around its type associated with it.

add.args

---

## Invoking Tools[](http://54.173.133.152/lab/lab/tree/5-Tools/51-Tool-Calling.ipynb#Invoking-Tools)

Tools are not literal functions, and we cannot call them with `()` as we would a vanilla Python function. Trying to do so will throw an exception.

try:

add(3, 4)

except Exception as e:

print(e)

Rather, tools have an `invoke` method, which we always supply with a dict mapping the decorated function's expected arguments to the actual values we want to pass in.

add.invoke({'a': 3, 'b': 5})

---

## Pydantic Classes with Tools[](http://54.173.133.152/lab/lab/tree/5-Tools/51-Tool-Calling.ipynb#Pydantic-Classes-with-Tools)

Just as we used Pydantic classes in the previous section to articulate the specific structure of a data type we wanted the LLMs output to conform to, we also can use them to articulate the schema for the arguments that the LLM will recommend we pass to a given tool.

Here we create a Pydantic class `Add` to specify the schema for the arguments that would be passed into the `add` tool. Using Pydantic gives us a great deal more control over the intended structure of a tool's argument schema, including field validation and more which we won't be covering today. At the least it gives us an easy and clean way to specify the schema, and makes it very simple to provide the LLM with additional information about how the tool should be called by adding descriptions to each of the schema's fields.

It's worth mentioning that the `...` in the `Field` description indicates that the field is required.

class Add(BaseModel):

"""Use when and if you need to add two numbers."""

a: int = Field(..., description="First integer")

b: int = Field(..., description="Second integer")

Having defined a Pydantic class for the `add` tool's argument schema, we can associate it with the actual `add` tool by supplying it as the value to an `args_schema` argument passed into the `tool` decorator.

@tool(args_schema=Add)

def add(a: int, b: int) -> int:

return a + b

You'll notice that we no longer supply a docstring directly to the tool definition, since we have provided it as part of the Pydantic class associated with it.

---

## Exercise: Make a Multiply Tool[](http://54.173.133.152/lab/lab/tree/5-Tools/51-Tool-Calling.ipynb#Exercise:-Make-a-Multiply-Tool)

As a simple exercise, create a multiply tool intended to multiply together 2 whole numbers. Use a Pydantic class to specify the tool's argument schema.

Feel free to check out the _Solution_ below if you get stuck.

### Your Work Here[](http://54.173.133.152/lab/lab/tree/5-Tools/51-Tool-Calling.ipynb#Your-Work-Here)

  

### Solution[](http://54.173.133.152/lab/lab/tree/5-Tools/51-Tool-Calling.ipynb#Solution)

3 cells hidden

## Binding Tools to a Model[](http://54.173.133.152/lab/lab/tree/5-Tools/51-Tool-Calling.ipynb#Binding-Tools-to-a-Model)

Now that we have created a couple of LLM tools, we want to make an LLM aware that they are available to be used. The most straightforward way to do this is with the `bind_tools` method available on LLM instances, which expects a list of tool definitions. We already defined an LLM instance `llm` above, so let's construct a list containing our 2 tools and bind them to the LLM instance.

tools = [add, multiply]

llm_with_tools = llm.bind_tools(tools)

When an LLM instance has had tools bound to it, we can still use it for non-tool related calls as we usually would. Here we provide a prompt that has nothing to do with addition or multiplication.

response = llm_with_tools.invoke('Who are you?')

Looking at the response we see a typical `AIMessage` response from the LLM.

response

The content of the response is pretty much what we would expect.

response.content

If, however, we prompt the model with a prompt having to do with multiplication, a task for which we have bound a tool to manage, we see some very important differences.

response = llm_with_tools.invoke('What is 1234 times 5678?')

response

At a glance it appears that the content of the response is empty, which we can confirm here.

response.content

However, there is a new property associated with the response that we haven't seen before: `tool_calls`.

response.tool_calls

As you can see, `tool_calls` is a list containing, in this case, a single dict. The dict contains the name of one of the tools we've bound to the model (`multiply`) as well as an inner dict conforming to the arg schema associated with the tool, namely, two integer arguments `a` and `b`. Just like when we used the LLM to generate structured data, the LLM has conformed to our specification while supplying the details of the values, this time `1234` and `5678` which it was able to extract from user-provided prompt `"What is 1234 times 5678?"`.

---

## LLMs Don't Call Tools[](http://54.173.133.152/lab/lab/tree/5-Tools/51-Tool-Calling.ipynb#LLMs-Don't-Call-Tools)

As we just saw, our LLM is up to the task of indicating when a tool ought to be called, and of _supplying arguments_ for how the tool ought to be called, but when we say the model is "making a tool call," is is not actually invoking the tool.

---

## Actually Calling Tools[](http://54.173.133.152/lab/lab/tree/5-Tools/51-Tool-Calling.ipynb#Actually-Calling-Tools)

There are a lot of ways to actually call the tool(s) the model indicates we should with the arguments it supplies, and importantly, to supply the result of an actual tool invocation back to the model so that it can use what the tool returns in its response back to the prompt it was given. By far the most common way to do this is with something we call agents, a topic we will look at in the next notebook.

As you'll see when we build agents in the next notebook, LangChain is going to be doing a lot of work under the hood and hidden from us. With that in mind we'd like to spend a little time here, even though using agents is a much better approach in general, showing how to actually invoke tools when a model indicates we should.

Recall that the response we got back to our multiplication prompt from`llm_with_tools` contained a `tool_calls` property.

response.tool_calls

Let's get a single `tool` call (and in this case the only tool call) out of the `tool_calls` list.

tool_call = response.tool_calls[0]

tool_call

As you'll recall `tool_call` contains the args intended to be passed to the actual tool invocation...

tool_call_args = tool_call["args"]

... and a name field indicating which `tool` ought to be called.

tool_to_call_name = tool_call["name"]

This value is a string and matches the name field on the `tool` itself.

tool_to_call_name

tool_to_call_name == multiply.name

The tool itself, however, is not a string, and we can't invoke `tool_to_call_name`. Therefore we need some way to map the tool name to the actual tool, in this case `multiply` (not a string). For this we'll create a simple mapping of tool name to actual tool, including both our `add` and `multiply` tools.

tool_map = {

"add": add,

"multiply": multiply

}

With this map and the name of the tool, now we can get back the actual tool to call.

tool_to_call = tool_map[tool_to_call_name]

We can print `tool_to_call` and `multiply` to compare that they are the same.

print(tool_to_call)

print(multiply)

tool_to_call is multiply

Finally, we can test invoking our tool by invoking it with the supplied arguments.

tool_to_call.invoke(tool_call_args)

tool_to_call.invoke({'a': 1234, 'b': 5678})

---

## Adding Actual Tool Calling to a Chain[](http://54.173.133.152/lab/lab/tree/5-Tools/51-Tool-Calling.ipynb#Adding-Actual-Tool-Calling-to-a-Chain)

That was a lot of detail, but we wanted you to understand what was going on when we provided you with the following function, which will expect a model response and if there is a tool call, go through the process we just walked through to actually invoke the tool with the LLM-supplied arguments and return the result of the actual tool invocation.

In the case that the LLM did not indicate a tool call, then the function simply returns the content of the model's (non-tool call) response.

# Very naive implementation of actual tool calling.

def call_tools(response):

  

if not response.tool_calls:

return response.content

  

tool_map = {

"add": add,

"multiply": multiply

}

  

# In this naive implementation, we are only supporting a single tool call.

tool_call = response.tool_calls[0]

selected_tool = tool_map[tool_call["name"]]

args = tool_call["args"]

return selected_tool.invoke(args)

We ought now to be able to create a simple chain with our tool-bound LLM and a custom runnable using the `call_tools` function we just defined.

chain = llm_with_tools | RunnableLambda(call_tools)

First, let's invoke the chain on a non add or multiply related prompt

chain.invoke("Who are you?")

And now we'll try it with some multiplication.

chain.invoke("What is the product of 1234 and 5678?")

1234 * 5678

And now we'll try some addition.

chain.invoke("What 1234567 plus 10111213?")

1234567 + 10111213

---

## Tool Calling is Not Perfect[](http://54.173.133.152/lab/lab/tree/5-Tools/51-Tool-Calling.ipynb#Tool-Calling-is-Not-Perfect)

Let's make the problem a bit more difficult for the model by providing it an addition problem to perform stated mostly in natural language rather than numbers.

chain.invoke("What is 9 million and 115 plus thirteen thousand three hundred and sixty three?")

9000115 + 13363

In this case we can see that we did not get the correct answer out of our chain. Let's look at the `tool_calls` property when invoking `llm_with_tools` on the same prompt to get more information about what might have gone wrong.

llm_with_tools.invoke("What is 9 million and 115 plus thirteen thousand three hundred and sixty three?").tool_calls

If we're unlucky enough to get a bad answer and look at the `args` property, we might see the model set `a` to `9000000` instead of `9000115` to consequently return the wrong result. This likely stems from language/intent ambiguity combined with some inconsistency in prompting, but it's still an error from our perspective.

Though tool calling is powerful, it can supply our applications with functionality that an LLM is ill-suited for. All of the same considerations we've made regarding hallucination still apply when using tools, so keep that in mind before adopting LLM-powered tool connectors across your problem stack.

---

## Exercise: Build a Tool to Query Wikipedia[](http://54.173.133.152/lab/lab/tree/5-Tools/51-Tool-Calling.ipynb#Exercise:-Build-a-Tool-to-Query-Wikipedia)

For this exercise you'll create and utilize a tool that can use the Wikipedia API.

The following function takes a given topic and returns either the first paragraph of the topic's Wikipedia summary, or a message that a Wikipedia page for the topic could not be found.

def get_wikipedia_intro(topic):

user_agent = 'MyApp/1.0 (myemail@example.com)'

wiki_wiki = wikipediaapi.Wikipedia(user_agent=user_agent)

page = wiki_wiki.page(topic)

if page.exists():

return page.summary.split('\n')[0] # Get the first paragraph of the summary

else:

return f"No Wikipedia page found for '{topic}'"

We want to use the tool you create out of this function to augment an LLM by allowing it to use the tool when it is asked about a topic too recent for it to actually know anything about.

Use the following approach:

- Create a tool out of the above function, being sure to give an explicit use case for it in its schema.
- Bind the tool to your LLM.
- Construct a chain with your tool-bound LLM and a custom runnable made out of the `call_tools` function immediately below (which contains a mapping to `get_wikipedia_intro`.
- Invoke your chain with a prompt about something the LLM itself could not know about, like the 2024 Summer Olympics.

Feel free to check out the Solution below if you get stuck.

def call_tools(response):

  

if not response.tool_calls:

return response.content

  

tool_map = {

"get_wikipedia_intro": get_wikipedia_intro

}

for tool_call in response.tool_calls:

selected_tool = tool_map[tool_call["name"]]

args = tool_call["args"]

return selected_tool.invoke(args)

### Your Work Here[](http://54.173.133.152/lab/lab/tree/5-Tools/51-Tool-Calling.ipynb#Your-Work-Here)

  

### Solution[](http://54.173.133.152/lab/lab/tree/5-Tools/51-Tool-Calling.ipynb#Solution)

6 cells hidden

## Summary[](http://54.173.133.152/lab/lab/tree/5-Tools/51-Tool-Calling.ipynb#Summary)

In this notebook you learned how to create tools for tasks an LLM is not well suited for. You also got to see the results, in a naive chain, of actually invoking a tool. In the next notebook we'll introduce agents, a much more powerful method of orchestrating tool use, allowing models to reason about tool use, and provide the results of actually calling tools as inputs back to the model in service of composing a helpful response.

---

Continue the unified course path

**Next step:** Open `5-Tools/52-Agents.ipynb` next: **Agents**.

**Before moving on:** Keep one case where a tool result should feed back into the model, because the next notebook adds the control loop that decides when and how to do that.