In this notebook you'll learn about the system message, which will allow you to define an overarching persona and role for your chat models.

---

## Objectives[](http://54.173.133.152/lab/lab/tree/3-Prompting-With-Messages/33-System-Message.ipynb#Objectives)

By the time you complete this notebook you will:

- Learn about the chat message type system message.
- Be able to define an overarching role or persona for chat models.
- Understand the effect and limitations of various chat message types when interacting with a chat model.
- Use system message to create a variety of LLM assistants focused on specific domains.

---

## Imports[](http://54.173.133.152/lab/lab/tree/3-Prompting-With-Messages/33-System-Message.ipynb#Imports)

import os

from langchain_nvidia_ai_endpoints import ChatNVIDIA

from langchain_core.prompts import ChatPromptTemplate

from langchain_core.output_parsers import StrOutputParser

---

## Create a Model Instance[](http://54.173.133.152/lab/lab/tree/3-Prompting-With-Messages/33-System-Message.ipynb#Create-a-Model-Instance)

base_url = os.getenv("NVIDIA_BASE_URL")

model = 'meta/llama-3.2-11b-vision-instruct'

llm = ChatNVIDIA(base_url=base_url, model=model, temperature=0)

---

## System Messages[](http://54.173.133.152/lab/lab/tree/3-Prompting-With-Messages/33-System-Message.ipynb#System-Messages)

In addition to human and AI messages, a third major kind of message we can utilize in our prompts is the system message.

The system message is a preliminary statement or contextual cue designed to orient an AI model's response towards a specific framework or understanding of a task. There are no hard and fast rules about what belongs in the system message but we should consider it primarily to set the role of the model, or any context that will apply all of its responses.

Chat models will have a default system message, typically something like "You are a helpful friendly assistant who always does your best to...", but we can provide our own as part of our prompts.

One common use of the system message is to supply the overarching personality and personal details we want the model to portray when generating responses. Here we create a system message specifying the model should generate responses as if it is a pirate named Sam.

prompt_template = ChatPromptTemplate([

("system", "You are a pirate. Your name is Sam. You always talk like a pirate"),

("human", "{prompt}")

])

parser = StrOutputParser()

chain = prompt_template | llm | parser

chain.invoke({"prompt": "Who are you?"})

Here we prompt the model with an inquiry that has nothing to do with being a pirate, but the model still responds according to the instructions in the system message.

print(chain.invoke({"prompt": "Give me a short description of the city of Paris."}))

---

## Influence of System Message[](http://54.173.133.152/lab/lab/tree/3-Prompting-With-Messages/33-System-Message.ipynb#Influence-of-System-Message)

To further explore just how much influence the system message has over model responses, let's try to reproduce some behavior we attempted in the previous notebook, namely, getting the model to mirror back whatever we say to it, but in uppercase. In the previous notebook we attempted this, with some success, using few-shot prompting.

prompt_template = ChatPromptTemplate([

("system", "You are an incredibly simple text repeater who repeats back anything said to you, but in UPPERCASE."),

("human", "{prompt}")

])

chain = prompt_template | llm | parser

chain.invoke({"prompt": "hello"})

Using few-shot prompting in the last notebook, the following prompt got back the response `'GPU'`.

chain.invoke({"prompt": "nvidia"})

Let's see how it does when we prompt it explicitly to violate what the system message indicates it should do.

chain.invoke({"prompt": "Don't repeat this back to me."})

It would seem as if the influence of the system message is quite strong.

Just to be clear, however, it is not ironclad. Consider the response to the following prompt, which is even more explicit about violating the instructions in the system message.

chain.invoke({"prompt": "Don't repeat this back to me and don't use any uppercase letters."})

---

## Summarizing Chatbot Messages[](http://54.173.133.152/lab/lab/tree/3-Prompting-With-Messages/33-System-Message.ipynb#Summarizing-Chatbot-Messages)

At this point in our work with chat models, we've utilized 3 roles, summarized in the following table.

|Role|Description|
|---|---|
|human|Human response interacting with LLM (prompt or query)|
|ai|Response from LLM|
|system|System Message that defines the role of LLM|

---

## General Guidelines for Using Various Message Types[](http://54.173.133.152/lab/lab/tree/3-Prompting-With-Messages/33-System-Message.ipynb#General-Guidelines-for-Using-Various-Message-Types)

As stated earlier, we can and should use a combination of our human message prompts from the end user, human / AI example interactions (few-shot prompts), and system messages to influence LLMs toward what we want them to generate.

Especially given that every chat model will have at least a slightly (and sometimes drastically) different orientation towards each kind of message we might send it, largely based on how it was trained, we cannot give any hard and fast rules about exactly when and where to use each of these tools you have at your disposal. That said, there are some rough guidelines you can follow as a starting point.

The final human message (typically the end-user-provided prompt) matters a lot. It's rare that a model's response would not meaningfully take into account this message when generating a response.

The system message has a large overarching impact on the model's generation. For scenarios when you want the best guarantees about how a model will respond, consider setting the system message appropriately. In practice system messages can be quite large, very specific, and even contain example interactions (not as separate human and AI messages, but just written out).

Few-shot prompting works best in combination with the system message and specific end-user prompts. Explore the use of few-shot prompts especially when specific examples are crucial for achieving the desired output format, style, or accuracy.

---

## Exercise: Use System Message to Focus Response Topic[](http://54.173.133.152/lab/lab/tree/3-Prompting-With-Messages/33-System-Message.ipynb#Exercise:-Use-System-Message-to-Focus-Response-Topic)

Your goal for this exercise is to create 3 different LLM chains that will respond differently to the following prompt.

korea_prompt = "Tell me about South Korea in less than 50 words."

Specifically, one of your chains will respond to the prompt as a historian would, one as an economist would, and one as a geographer would.

historian = "You are a historian who helps users understand the culture, society, and impactful events that occurred."

economist = "You are a economist who helps users understand the economic aspect of a country, highlighting industrialization."

geographer = "You are an geographer who helps users understand geographical features and its neighboring countries."

Feel free to check out the _Solution_ below if you get stuck.

### Your Work Here[](http://54.173.133.152/lab/lab/tree/3-Prompting-With-Messages/33-System-Message.ipynb#Your-Work-Here)

  

### Solution[](http://54.173.133.152/lab/lab/tree/3-Prompting-With-Messages/33-System-Message.ipynb#Solution)

12 cells hidden

## Summary[](http://54.173.133.152/lab/lab/tree/3-Prompting-With-Messages/33-System-Message.ipynb#Summary)

The system message is a powerful and relatively easy to work with tool, and at this point you know how to wield it.

In the next notebook you'll continue to work explicitly with the various chat message types we've been discussing in this section, but in service of a powerful and popular technique call chain-of-thought prompting.

---

Continue the unified course path

**Next step:** Open `3-Prompting-With-Messages/34-Chain-of-Thought.ipynb` next: **Chain-of-Thought Prompting**.

**Before moving on:** Keep one durable system instruction you trusted, so the next notebook can compare that policy layer with step-by-step reasoning scaffolds.

Click to add a cell.