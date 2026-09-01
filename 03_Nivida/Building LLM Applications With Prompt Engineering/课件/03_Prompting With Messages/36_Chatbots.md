In this notebook, you will learn how to store conversation history and thereby enable chatbot functionality in your LLM-based chains.

---

## Objectives[](http://54.173.133.152/lab/lab/tree/3-Prompting-With-Messages/36-Chatbots.ipynb#Objectives)

By the time you complete this notebook you will:

- Understand the core principles and techniques required to create chatbot applications capable of retaining conversation history.
- Create easy-to-use chatbots, capable of assuming a variety of different personas.
- Interact with a simple chatbot application interface, well-suited for chatbot application prototyping.

---

## Imports[](http://54.173.133.152/lab/lab/tree/3-Prompting-With-Messages/36-Chatbots.ipynb#Imports)

import os

from langchain_nvidia_ai_endpoints import ChatNVIDIA

from langchain_core.prompts import ChatPromptTemplate

from langchain_core.output_parsers import StrOutputParser

---

## Create a Model Instance[](http://54.173.133.152/lab/lab/tree/3-Prompting-With-Messages/36-Chatbots.ipynb#Create-a-Model-Instance)

base_url = os.getenv("NVIDIA_BASE_URL")

model = 'meta/llama-3.2-11b-vision-instruct'

llm = ChatNVIDIA(base_url=base_url, model=model, temperature=0)

---

## Placeholder Messages[](http://54.173.133.152/lab/lab/tree/3-Prompting-With-Messages/36-Chatbots.ipynb#Placeholder-Messages)

Before we begin work enabling conversation history and chatbot functionality, we need to introduce a new kind of message that we have not yet covered, **placeholder** messages.

Put simply, and as the name suggest, a placeholder message is used in a prompt template to hold the place of a list of other messages.

template_with_placeholder = ChatPromptTemplate.from_messages([

('placeholder', '{messages}'),

('human', '{prompt}')

])

messages = [

('human', 'The sun came up today.'),

('ai', 'That is wonderful!'),

('human', 'The sun went down today.'),

('ai', 'That is also wonderful!.')

]

prompt = 'What happened today?'

When invoking (or streaming or batching) prompt templates or chains that contain placeholder messages, we provide a value as the template indicates, only in the case of a placeholder message, we provide a list of other messages, rather than a string.

Here we invoke `template_with_placeholder`, passing in the `messages` list to fulfil the template's `messages` parameter, and the `prompt` string to fulfil its `prompt` parameter.

template_with_placeholder.invoke({'messages': messages, 'prompt': prompt})

As you can see, LangChain expanded the `placeholder` message, for which we provided a list, into a list of individual messages that we provided when invoking the prompt template.

It should come as no surprise that we can use this prompt template in chains just as we would any other.

chain = template_with_placeholder | llm | StrOutputParser()

chain.invoke({'messages': messages, 'prompt': prompt})

---

## Rudimentary Conversation History[](http://54.173.133.152/lab/lab/tree/3-Prompting-With-Messages/36-Chatbots.ipynb#Rudimentary-Conversation-History)

We can easily construct a rudimentary conversation history mechanism using a message placeholder. First we'll create a prompt template utilizing a placeholder, and use it in a simple chain.

chat_conversation_template = ChatPromptTemplate.from_messages([

('placeholder', '{chat_conversation}')

])

chat_chain = chat_conversation_template | llm | StrOutputParser()

Next we'll create a list to store our conversation, which we will add to over time.

chat_conversation = []

We will begin by appending our first prompt, as a `user` message to the `chat_conversation` list.

chat_conversation.append(('user', 'Hello, my name is Michael.'))

Just to test it out, we can now invoke our `chat_chain` with the current `chat_conversation` list.

chat_chain.invoke({'chat_conversation': chat_conversation})

It looks like the LLM is able to respond just fine. Since we are wanting to keep track of the conversation history, however, let's invoke the chain again, but this time append the response to the `chat_conversation` list as an `ai` message.

response = chat_chain.invoke({'chat_conversation': chat_conversation})

chat_conversation.append(('ai', response))

Looking at `chat_conversation` we see it now contains a list of the messages thus far.

chat_conversation

Let's repeat this same process with a new message, and let's pass in a prompt that relies on previous conversation history to answer correctly.

chat_conversation.append(('user', 'Do you remember what my name is?'))

response = chat_chain.invoke({'chat_conversation': chat_conversation})

chat_conversation.append(('ai', response))

chat_conversation

As you can see, by appending user prompt and AI responses to `chat_conversation` as `user` and `ai` messages respectively, and then invoking our placeholder-containing `chat_chain` with the entire up-to-date conversation, we now have the ability to converse with the LLM in a way where it retains details from earlier in the conversation.

At its most basic level, all chatbot functionality that is capable of retaining conversation history utilizes this method of passing in the conversation prior to new user messages.

---

## Chatbot Class[](http://54.173.133.152/lab/lab/tree/3-Prompting-With-Messages/36-Chatbots.ipynb#Chatbot-Class)

We can encapsulate the functionality we achieved above into a class that will make interacting with our conversation history-enabled LLM much simpler. Please read the following `Chatbot` class definition, including its comments, carefully.

class Chatbot:

def __init__(self, llm):

# This is the same prompt template we used earlier, which a placeholder message for storing conversation history.

chat_conversation_template = ChatPromptTemplate.from_messages([

('placeholder', '{chat_conversation}')

])

  

# This is the same chain we created above, added to `self` for use by the `chat` method below.

self.chat_chain = chat_conversation_template | llm | StrOutputParser()

  

# Here we instantiate an empty list that will be added to over time.

self.chat_conversation = []

  

# `chat` expects a simple string prompt.

def chat(self, prompt):

# Append the prompt as a user message to chat conversation.

self.chat_conversation.append(('user', prompt))

response = self.chat_chain.invoke({'chat_conversation': self.chat_conversation})

# Append the chain response as an `ai` message to chat conversation.

self.chat_conversation.append(('ai', response))

# Return the chain response to the user for viewing.

return response

  

# Clear conversation history.

def clear(self):

self.chat_conversation = []

Let's instantiate a chatbot instance.

chatbot = Chatbot(llm)

We can now utilize its `chat` method.

print(chatbot.chat('Hi, my name is Michael.'))

# print(chatbot.chat_conversation)

print(chatbot.chat('I just want to be reminded of my name please. What\'s my name'))

# print(chatbot.chat_conversation)

print(chatbot.chat("Tell me something interesting I probably don't know about pi."))

print(chatbot.chat("That's really cool! Give me another.")) # Note we are not being specific about what "another" refers to...the LLM needs to have previous messages to understand our intent.

---

## More Advanced Chatbots[](http://54.173.133.152/lab/lab/tree/3-Prompting-With-Messages/36-Chatbots.ipynb#More-Advanced-Chatbots)

The topic of managing conversation history, and therefore of creating chatbots is actually quite large and there are many more advanced techniques that are outside the scope of this workshop. We do, however, want to provide you with some additional references for further study, should you wish to pursue the topic further.

- [Session-based conversation history, and history trimming](https://python.langchain.com/docs/how_to/chatbots_memory/): LangChain ships with tooling for wrapping chains in a way that provides history management, and specifically, managing multiple conversation sessions. This resource introduces the use of LangChain tooling for managing session-based conversation history, and also covers some techniques for managing the length of conversation history via message trimming and summarization, an important topic as chat conversations may grow large, or even too large to continue passing into an LLM.
- [Conversational RAG](https://python.langchain.com/docs/tutorials/qa_chat_history/): Retrieval Augmented Generation, or RAG (see [this DLI self-paced course](https://learn.nvidia.com/courses/course-detail?course_id=course-v1:DLI+S-FX-15+V1) for more) is a technique whereby LLMs can be provided real-time context from external data sources in support of generating their response. This resource discusses RAG in the context of chatbots capable of retaining conversation history.

---

## Exercise: Enable Role-based Chatbots[](http://54.173.133.152/lab/lab/tree/3-Prompting-With-Messages/36-Chatbots.ipynb#Exercise:-Enable-Role-based-Chatbots)

For this exercise you'll enable your chatbot instances to assume a specific role by leveraging a system message.

Below is the class definition for `ChatbotWithRole` which currently is identical to the `Chatbot` class definition above except that we've defined a `system_message` argument (defaulting to an empty string) that be used when instantiating `ChatbotWithRole` instances.

Edit the class definition as needed so that you can supply a system message that will create a specific role for your chatbot. Upon completion you should be able to use system messages like the following to create an overarching role for your chatbot to assume.

Feel free to check out the _Solution_ below if you get stuck.

brief_chatbot_system_message = "You always answer as briefly and concisely as possible."

  

curious_chatbot_system_message = """\

You are incredibly curious, and often respond with reflections and followup questions that lean the conversation in the direction of playfully \

understanding more about the subject matters of the conversation."""

  

increased_vocabulary_system_message = """\

You always respond using challenging and often under-utilized vocabulary words, even when your response could be made more simply."""

### Your Work Here[](http://54.173.133.152/lab/lab/tree/3-Prompting-With-Messages/36-Chatbots.ipynb#Your-Work-Here)

Update the following class definition so that the passed-in `system_message` is effectively utilized by chatbot instances.

class ChatbotWithRole:

def __init__(self, llm, system_message=''):

# This is the same prompt template we used earlier, which a placeholder message for storing conversation history.

chat_conversation_template = ChatPromptTemplate.from_messages([

('placeholder', '{chat_conversation}')

])

  

# This is the same chain we created above, added to `self` for use by the `chat` method below.

self.chat_chain = chat_conversation_template | llm | StrOutputParser()

  

# Here we instantiate an empty list that will be added to over time.

self.chat_conversation = []

  

# `chat` expects a simple string prompt.

def chat(self, prompt):

# Append the prompt as a user message to chat conversation.

self.chat_conversation.append(('user', prompt))

response = self.chat_chain.invoke({'chat_conversation': self.chat_conversation})

# Append the chain response as an `ai` message to chat conversation.

self.chat_conversation.append(('ai', response))

# Return the chain response to the user for viewing.

return response

  

# Clear conversation history.

def clear(self):

self.chat_conversation = []

### Try Out a Chatbot With a Role[](http://54.173.133.152/lab/lab/tree/3-Prompting-With-Messages/36-Chatbots.ipynb#Try-Out-a-Chatbot-With-a-Role)

After successfully implementing `ChatbotWithRole`, try creating an instance of it with a system message of your choosing and interact with it.

  

### Solution[](http://54.173.133.152/lab/lab/tree/3-Prompting-With-Messages/36-Chatbots.ipynb#Solution)

8 cells hidden

## Gradio[](http://54.173.133.152/lab/lab/tree/3-Prompting-With-Messages/36-Chatbots.ipynb#Gradio)

_"Gradio is the fastest way to demo your machine learning model with a friendly web interface so that anyone can use it, anywhere!"_

If you find yourself building chatbots, especially for prototypes or even personal use chatbots, you might consider [Gradio](https://www.gradio.app/), which makes it easy to setup a pleasant chat interface, including in Jupyter environments.

Pass a `chatbot` instance (created with either the `Chatbot` class or `ChatbotWithRole` class) into the following `create_chatbot_interface` function and have a conversation. If you're interested, check out [chat_helpers/gradio_interface.py](http://54.173.133.152/lab/files/3-Prompting-With-Messages/chat_helpers/gradio_interface.py?_xsrf=2%7C7fca0a86%7Ca23434af16dab75034f90cb3d5029ff0%7C1788253280) for the source code.

from chat_helpers.gradio_interface import create_chatbot_interface_from_bot

app = create_chatbot_interface_from_bot(curious_chatbot)

app.launch(share=True)

---

## Summary[](http://54.173.133.152/lab/lab/tree/3-Prompting-With-Messages/36-Chatbots.ipynb#Summary)

In this notebook you learned how to leverage a new message type, a placeholder message, to create chatbots capable of retaining conversation history.

This was the final notebook in this section focused primarily on the explicit use of chat message types to benefit your LLM-based application code, and you learned a variety of techniques in addition to managing conversation history, like few-shot prompting, utilizing the system message, and performing chain-of-though prompting.

In this next section you will focus your attention on using a variety of prompt engineering techniques to enable your LLM-based applications to generated structured data, a powerful capability that unlocks the ability of your LLM-based applications to interact more immediately with downstream code, and opens incredible possibilities for using LLMs to tag and anaylyze large collections of textual data.

---

Continue the unified course path

**Next step:** Open `4-Structured-Output/40-Section-Introduction.ipynb` next: **Section 4: Structured Output**.

**Before moving on:** Keep one conversational behavior you want to make machine-readable, because the next section turns free-form assistant output into typed fields other systems can trust.

Click to add a cell.