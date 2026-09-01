In this notebook we introduce agents which can reason about tool use and integrate the actual invocation of tools into LLM responses. Think of this as a bit of extra credit: you just learned about tool calling, and agents are a fun and powerful next step that you're well prepared for.

![[Pasted image 20260901113508.png]]

---

## Objectives[](http://54.173.133.152/lab/lab/tree/5-Tools/52-Agents.ipynb#Objectives)

By the time you complete this notebook you will:

- Understand the role of agents in the context of LLM tool use.
- Create and utilize a simple agent capable of folding tool use results into LLM responses.
- Integrate agents you create into LCEL chains.

---

## Imports[](http://54.173.133.152/lab/lab/tree/5-Tools/52-Agents.ipynb#Imports)

import os

import math

import requests

  

from langchain_nvidia_ai_endpoints import ChatNVIDIA

  

from pydantic import BaseModel, Field

from langchain_core.tools import tool

from langchain_core.runnables import RunnableLambda

from langchain_core.prompts import ChatPromptTemplate

  

from langchain.agents import create_agent

  

  

---

## Create a Model Instance[](http://54.173.133.152/lab/lab/tree/5-Tools/52-Agents.ipynb#Create-a-Model-Instance)

base_url = os.getenv("NVIDIA_BASE_URL")

model = 'nvidia/nemotron-3-nano-30b-a3b'

llm = ChatNVIDIA(base_url=base_url, model=model, temperature=0)

---

## Agents[](http://54.173.133.152/lab/lab/tree/5-Tools/52-Agents.ipynb#Agents)

In the previous notebook we created tools, used LLMs to decide when to invoke them, and wrote a simple dispatch function to execute tool calls. That approach had a critical gap: we never fed the tool's return value back to the LLM, so it couldn't incorporate tool results into its response. **Agents** solve this.

An agent uses an LLM as a reasoning engine that decides which tools to call, actually calls them, and uses the results to formulate a response. You'll recognize that agents operate on the same message types you used in Section 3, and that tool argument schemas use the same Pydantic patterns from Section 4. Agents are a deep topic worthy of their own study; here we'll cover the fundamentals.

---

## A Tool for an Agent[](http://54.173.133.152/lab/lab/tree/5-Tools/52-Agents.ipynb#A-Tool-for-an-Agent)

Before we can create agents, we need tools for them to use. We'll create two simple tools: one for multiplication and one for square roots. Having two tools will let us see how agents can chain multiple tool calls together.

class Multiply(BaseModel):

"""Use when needed to get the product of multiplying two integers together."""

a: int = Field(..., description="First integer to multiply.")

b: int = Field(..., description="Second integer to multiply.")

@tool(args_schema=Multiply)

def multiply(a: int, b: int) -> int:

return a * b

class SquareRoot(BaseModel):

"""Use when needed to get the square root of a number."""

x: float = Field(..., description="The number to take the square root of.")

  

@tool(args_schema=SquareRoot)

def square_root(x: float) -> float:

return math.sqrt(x)

Here we do a quick sanity check to make sure the tools behave as expected.

multiply.invoke({'a': 12, 'b': 10}), square_root.invoke({'x': 144})

tools = [multiply, square_root]

---

## Creating a Simple Agent with LangGraph[](http://54.173.133.152/lab/lab/tree/5-Tools/52-Agents.ipynb#Creating-a-Simple-Agent-with-LangGraph)

To create an agent capable of utilizing tools when appropriate, and integrating the result of a tool call into its response, we will use [LangGraph](https://langchain-ai.github.io/langgraph/).

LangGraph is a spinoff open-source project from the folks who created LangChain. At a high level, LangGraph promotes the easy creation of graph-based workflows. Graphs are a collection of nodes, each responsible for doing some sort of computational work, and edges, which map between nodes and define when and how nodes will be invoked to perform work.

We are going to limit our work with LangGraph here to using a simple, yet powerful, prebuilt agent that ships with LangGraph, but if you find yourself wanting to learn more about agent creation, we highly recommend taking the time to learn more about [LangGraph](https://langchain-ai.github.io/langgraph/).

---

## Creating a Simple Agent with LangGraph[](http://54.173.133.152/lab/lab/tree/5-Tools/52-Agents.ipynb#Creating-a-Simple-Agent-with-LangGraph)

As we mentioned above, agent creation is a large topic worthy of its own coverage. However, LangGraph ships with some pre-built graphs that are very easy to use, and we are going to leverage one of them in this workshop, namely, a **ReAct** agent graph.

**ReAct** stands for "Reason and Act" ([link to paper](https://arxiv.org/abs/2210.03629)). For this workshop we can think about the ReAct paradigm as a way of instructing an LLM to reason about whether or not it should use an external tool, or tools, and then when appropriate, utilize these tools before generating a final response.

With LangGraph, to create a ReAct agent, we can simply import the `create_agent` function, and pass it an LLM instance (created above), and a list of tools (also created above) that the agent should have access to.

from langchain.agents import create_agent

agent = create_agent(llm, tools=tools)

We can use a helper method on the agent to inspect its graph without calling an external rendering service.

print(agent.get_graph().draw_ascii())

As mentioned above, the graph consists of nodes, capable of performing work, and edges which describe how data ought to be passed between nodes in order to accomplish work.

In this view, incoming data is routed to `agent`, our LLM instance. The agent either continues to the `tools` node and receives the tool result, or sends a final response to the end of the graph and returns control to the user.

---

## Invoking the Agent[](http://54.173.133.152/lab/lab/tree/5-Tools/52-Agents.ipynb#Invoking-the-Agent)

LangGraph graphs are stateful, meaning, every graph has some state defined (usually a dict) that different parts of the graph can read from and write to.

In the case of the pre-built `create_agent` graph we are using here, the graph's state has already been defined for us as a dict with a single `messages` key which itself contains a list of messages.

What this means for us presently is that when we use the `agent` graph, we need to add our human message prompt to its state, namely, the `messages` property of a dict, and, that any other activity (such as AI messages) in the graph will also be added to this same `messages` property.

Just like LangChain chains, our LangGraph agent has `invoke`, `batch` and `stream` methods on it. To begin, let's use the `invoke` method on the graph using a simple prompt, and one where we would not expect the agent to believe it requires the use of the `multiply` tool we have provided.

The return value of invoking the graph will be the state of the agent graph after it completes, which we'll store in a variable for further exploration below.

agent_state = agent.invoke({"messages": ["Give a short summary of directed cyclical graphs in the context of computer science."]})

The returned `agent_state` is a dict with a `messages` key as seen below.

print(agent_state)

As a convenience, LangGraph messages have a `pretty_print` method. Let's loop over the messages and use this helper method to get a clearer read out.

for message in agent_state['messages']:

message.pretty_print()

---

## Invoking the Agent to Use a Tool[](http://54.173.133.152/lab/lab/tree/5-Tools/52-Agents.ipynb#Invoking-the-Agent-to-Use-a-Tool)

Next let's invoke our agent graph, but this time expect the use of the `multiply` tool.

agent_state = agent.invoke({"messages": ["What is 19944 times 2342?"]})

for message in agent_state['messages']:

message.pretty_print()

Notice the sequence: our `HumanMessage`, then an `AIMessage` indicating a tool call (not a direct response), then a `ToolMessage` with the tool's return value, and finally another `AIMessage` that uses the tool result to answer the original question.

Let's try one more prompt, but this time using a prompt that ought to require that the `multiply` tool be used more than once.

agent_state = agent.invoke({"messages": ["What is 9877 times 22875, and then what is the square root of that result?"]})

  

for message in agent_state['messages']:

message.pretty_print()

---

## Verifying Correct Tool Selection[](http://54.173.133.152/lab/lab/tree/5-Tools/52-Agents.ipynb#Verifying-Correct-Tool-Selection)

Let's verify that our agent correctly avoids using the `multiply` tool when it's not needed by asking a question that doesn't involve multiplication.

agent_state = agent.invoke({"messages": ["In what year was NVIDIA founded?"]}) # The actual answer is 1993

for message in agent_state['messages']:

message.pretty_print()

The agent correctly determined that the `multiply` tool was not needed to answer this question about NVIDIA's founding year, and responded directly with a helpful answer. This is exactly the behavior we want: the agent reasons about whether or not a tool is appropriate before deciding to use it.

It's worth noting that this correct tool selection behavior is not guaranteed with all models. Smaller models may struggle to reason about when to use tools, sometimes calling them unnecessarily. Choosing a capable model is an important consideration when building agents.

---

## Prompt Engineer Better Tool Use[](http://54.173.133.152/lab/lab/tree/5-Tools/52-Agents.ipynb#Prompt-Engineer-Better-Tool-Use)

At this point in the workshop we already know the importance of specific prompting. So let's try to be more specific in our prompt in order to get the LLM agent to behave as we would like.

If we wanted we could try being more specific about when the agent ought to be using its tools by writing a longer more specific prompt, but since we are trying to impact the overarching behavior of the model, it might make more sense for us to try including a system message.

Let's try the following which is quite explicit about the behavior we would like, and utilizes zero-shot COT prompting (in the form of "Think hard about...").

system_message = """\

You are a helpful assistant capable of tool calling when helpful, necessary, and appropriate.

  

Think hard about whether or not you need to call a tool, \

based on your tools' descriptions and use them, but only when appropriate!

  

Whether or not you need to call a tool, address the user's query in a helpful informative way.

"""

`create_agent` accepts a `system_prompt` argument for including a system message. Here's the docstring if you'd like to explore the full API:

help(create_agent)

With that in mind, we'll recreate our `agent` instance, but this time passing in the system message we drafted above.

agent = create_agent(llm, tools=tools, system_prompt=system_message)

Let's invoke our new agent with the same prompt that was giving us trouble above to see if the inclusion of the system message impacted its behavior.

agent_state = agent.invoke({"messages": ['In what year was NVIDIA founded?']})

for message in agent_state['messages']:

message.pretty_print()

The agent correctly answered the question without using the `multiply` tool. Let's also confirm multiplication still works as expected.

agent_state = agent.invoke({"messages": ['What is 87889 times 23484?']})

for message in agent_state['messages']:

message.pretty_print()

System prompts remain a valuable tool for shaping agent behavior, just as they are for standard LLM calls.

---

## Creating a Chain for Agent Invocation[](http://54.173.133.152/lab/lab/tree/5-Tools/52-Agents.ipynb#Creating-a-Chain-for-Agent-Invocation)

We can invoke the agent directly, but let's build a chain that accepts a simple string prompt and returns a simple string response. We need two lightweight helpers:

1. A `RunnableLambda` to wrap a string prompt into the `{"messages": [...]}` format the agent expects.
2. Another `RunnableLambda` to extract just the final message content from the agent's state.

convert_to_agent_state = RunnableLambda(lambda prompt: {'messages': [prompt]})

chain = convert_to_agent_state | agent

agent_state = chain.invoke('In what year was NVIDIA founded?')

for message in agent_state['messages']:

message.pretty_print()

agent_state_parser = RunnableLambda(lambda final_agent_state: final_agent_state['messages'][-1].content)

Now we can compose the full chain -- string in, string out:

chain = convert_to_agent_state | agent | agent_state_parser

chain.invoke('In what year was NVIDIA founded?')

Let's also verify multiplication still works through the chain.

chain.invoke("What is 19944 times 2342?")

19944*2342

---

## Exercise: Create Air Quality Agent[](http://54.173.133.152/lab/lab/tree/5-Tools/52-Agents.ipynb#Exercise:-Create-Air-Quality-Agent)

For this exercise you will create an agent that is capable of using an external API to fetch real-time air quality information for a given location.

To assist your work, we've provided the following function that given latitude and longitude coordinates will return the current air quality, as a categorical string, for that location.

You don't need to concern yourself too much with the inner workings of this function. Just know that it uses the free open source weather API Open Meteo to fetch results and then converts the numerical results retrieved from the API into a categorical string like "Good", "Fair", "Poor" etc.

def get_air_quality_category_for_location(latitude: float, longitude: float) -> str:

base_url = "https://air-quality-api.open-meteo.com/v1/air-quality"

params = {

"latitude": latitude,

"longitude": longitude,

"hourly": "european_aqi"

}

  

try:

response = requests.get(base_url, params=params)

response.raise_for_status()

data = response.json()

  

if "hourly" in data:

euro_aqi = data['hourly']['european_aqi'][0]

# Determine AQI category

if euro_aqi <= 20:

return "Good"

elif euro_aqi <= 40:

return "Fair"

elif euro_aqi <= 60:

return "Moderate"

elif euro_aqi <= 80:

return "Poor"

elif euro_aqi <= 100:

return "Very Poor"

else:

return "Extremely Poor"

else:

return "No air quality data found for the given coordinates."

  

except requests.exceptions.RequestException as e:

return f"An error occurred: {e}"

Our LLM can convert a location name into latitude and longitude on its own, so we don't need a separate tool for that. Let's verify by asking for Mumbai's coordinates.

print(llm.invoke("Give me the latitude and longitude coordinates for Mumbai, India as floating point numbers.").content)

With thse coordinates we can now demonstrate how the `get_air_quality_category_for_location` is able to retrieve real-time air-quality information about the location.

get_air_quality_category_for_location(19.0760, 72.8777)

To complete this exercise, you'll need to do the following:

- Create a tool out of the provided `get_air_quality_category_for_location` function.
- Create an agent (using `create_agent`) that can utilize the tool you created and respond to the user.
- Create a chain utilizing your agent that will expect a string prompt and return a string response from the agent.

By the time you sucessfully complete your chain, you should be able to batch send it the following prompts, getting back appropriate responses to them all.

air_quality_agent_test_prompts = [

"What is the current air quality in Korobosea in Papua New Guinea?",

"What is the current air quality in Washington DC?",

"What is the current air quality in Mumbai?",

"Where is the city of Rome located?" # Make sure agent behaves as expected when not needing to make a tool call.

]

If you're up for the challenge, feel free to jump right in. If you prefer, expand the _Walkthrough_ section below for step-by-step guidance.

### Your Work Here[](http://54.173.133.152/lab/lab/tree/5-Tools/52-Agents.ipynb#Your-Work-Here)

  

## Walkthrough[](http://54.173.133.152/lab/lab/tree/5-Tools/52-Agents.ipynb#Walkthrough)

### Create Tool[](http://54.173.133.152/lab/lab/tree/5-Tools/52-Agents.ipynb#Create-Tool)

As a first step, convert the `get_air_quality_category_for_location` function into a tool.

Feel free to check out the _Solution_ below if you get stuck.

### Your Work Here[](http://54.173.133.152/lab/lab/tree/5-Tools/52-Agents.ipynb#Your-Work-Here)

  

### Solution[](http://54.173.133.152/lab/lab/tree/5-Tools/52-Agents.ipynb#Solution)

6 cells hidden

### Create System Message for Agent[](http://54.173.133.152/lab/lab/tree/5-Tools/52-Agents.ipynb#Create-System-Message-for-Agent)

If you were creating this agent from scratch, you would have eventually discovered on our test inputs that it had a tendency to discuss out loud that it wanted to use a the air quality tool, in a way that was not entirely helpful to the end user. Knowing what you do about iterative prompt engineering you would have then iterated on a system message to address this behavior.

For the sake of this walkthrough we are going to spare you the process of iteratively developing an effective system message yourself and just provide you here with an effective system message we arrived at through an iterative process.

system_message = """\

You are a helpful assistant capable of tool calling when helpful, necessary, and appropriate.

  

Think hard about whether or not you need to call a tool, \

based on your tools' descriptions and use them, but only when appropriate!

  

Whether or not you need to call a tool, address the user's query in a helpful informative way.

  

As you do not have a tool for long/lat, you should use your knowledge to predict the latitute and longitude.

You should roughly know the long/lat of most locations from training, so be confident and do not ask for it.

  

You should ALWAYS actually address the query and NEVER discuss your thought process about whether or not to use a tool.

"""

### Create an Agent[](http://54.173.133.152/lab/lab/tree/5-Tools/52-Agents.ipynb#Create-an-Agent)

Now that you've created the tool you'd like your agent to utilize, a system message to guide its behavior, and an LLM instance (defined above as `llm`), you are ready to create an agent instance using `create_agent`.

Feel free to check out the _Solution_ below if you get stuck.

### Your Work Here[](http://54.173.133.152/lab/lab/tree/5-Tools/52-Agents.ipynb#Your-Work-Here)

  

### Solution[](http://54.173.133.152/lab/lab/tree/5-Tools/52-Agents.ipynb#Solution)

8 cells hidden

### Create Chain[](http://54.173.133.152/lab/lab/tree/5-Tools/52-Agents.ipynb#Create-Chain)

Now let's create a chain that we can invoke with a simple string prompt and receive back a simple string response. You're welcome to re-use any of the code from earlier in the notebook.

Feel free to check out the _Solution_ below if you get stuck.

### Your Work Here[](http://54.173.133.152/lab/lab/tree/5-Tools/52-Agents.ipynb#Your-Work-Here)

  

### Solution[](http://54.173.133.152/lab/lab/tree/5-Tools/52-Agents.ipynb#Solution)

7 cells hidden

## Summary[](http://54.173.133.152/lab/lab/tree/5-Tools/52-Agents.ipynb#Summary)

In this notebook, you learned to create agents capable of using and integrating tools. Furthermore, you got hands-on experience composing agents into LCEL chains, thus integrating what you learned in this notebook with your previous efforts.

---

Continue the unified course path

**Next step:** Open `6-Assessment/61-Assessment.ipynb` next: **Assessment: Identify Sources of Customer Complaints**.

**Before moving on:** Save one agent pattern that felt reliable, because the assessment asks you to combine prompts, messages, tools, and evidence into one inspectable workflow.