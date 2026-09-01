In this notebook you'll learn how to provide chat models with instructive examples by way of a technique called few-shot prompting.

---

## Objectives[](http://54.173.133.152/lab/lab/tree/3-Prompting-With-Messages/32-Few-Shot-Prompting.ipynb#Objectives)

By the time you complete this notebook you will:

- Understand how to perform few-shot prompting.
- Observe the effect and limitations of the few-shot prompting technique.
- Learn methods for efficiently creating and editing few-shot prompts.

---

## Imports[](http://54.173.133.152/lab/lab/tree/3-Prompting-With-Messages/32-Few-Shot-Prompting.ipynb#Imports)

import os

from langchain_nvidia_ai_endpoints import ChatNVIDIA

from langchain_core.prompts import ChatPromptTemplate, FewShotChatMessagePromptTemplate

from langchain_core.output_parsers import StrOutputParser

---

## Create a Model Instance[](http://54.173.133.152/lab/lab/tree/3-Prompting-With-Messages/32-Few-Shot-Prompting.ipynb#Create-a-Model-Instance)

base_url = os.getenv("NVIDIA_BASE_URL")

model = 'meta/llama-3.2-11b-vision-instruct'

llm = ChatNVIDIA(base_url=base_url, model=model, temperature=0)

---

## Few Shot Prompting[](http://54.173.133.152/lab/lab/tree/3-Prompting-With-Messages/32-Few-Shot-Prompting.ipynb#Few-Shot-Prompting)

We can provide example human / AI interactions as a part of our prompt to influence the behavior of the model's responses. Let's create a simple chain to begin playing around with this idea.

prompt_template = ChatPromptTemplate.from_messages([

("human", "{prompt}")

])

parser = StrOutputParser()

chain = prompt_template | llm | parser

Let's say, for some reason, we want the model to repeat back to us whatever we say, but in all capital letters. We could do the following.

chain.invoke({"prompt": "Repeat back whatever I say to you, but in all capital letters: hello"})

The explicit instruction in our prompt did a sufficient job getting the model to respond as we desired. Let's, however, try to get the model to behave in the same way via few-shot prompting. To do this, instead of relying on giving the model explicit instructions, we'll extend our prompt template to contain several human / AI example interactions.

prompt_template = ChatPromptTemplate.from_messages([

("human", "hello"),

("ai", "HELLO"),

("human", "red"),

("ai", "RED"),

("human", "blue"),

("ai", "BLUE"),

("human", "{prompt}")

])

chain = prompt_template | llm | parser

Having constructed our few shot prompt, we'll send the model a new prompt, but this time we won't provide any explicit instructions about what the model ought to do.

chain.invoke({"prompt": "hi"})

chain.invoke({"prompt": "orange"})

What's interesting here is that at no point in time have we given any explicit or specific instructions to the model about what it ought to do.

So how much will these few-shot prompt examples actually influence the model? The short answer is we have to test and see.

Here's an exmaple where we get the correct uppercasing, but not a mirrored response.

chain.invoke({"prompt": "nvidia"})

And given that all of our shots were single word single response examples, we shouldn't be too surprised if prompts that are departures from our examples don't work as expected.

chain.invoke({"prompt": "How's it going today?"})

---

## Aside: Few Shot Prompting Alone[](http://54.173.133.152/lab/lab/tree/3-Prompting-With-Messages/32-Few-Shot-Prompting.ipynb#Aside:-Few-Shot-Prompting-Alone)

We've introduced few-shot prompting here in isolation for the sake of learning the core concepts, but in practice, few-shot prompting is just one of several tools at your disposal when prompting LLMs, and typically you will be using them in tandem with other techniques like being specific in your main prompt (as we've already covered) and utilizing the system message, which we'll cover in the next notebook.

That said, for now we're going to continue exploring the use of few-shot prompts largely in isolation of other techniques, primarily so you can focus on learning how to work with them fluently before being asked to use the technique in concert with others.

---

## Few Shot Prompt Templates[](http://54.173.133.152/lab/lab/tree/3-Prompting-With-Messages/32-Few-Shot-Prompting.ipynb#Few-Shot-Prompt-Templates)

Especially when working with just a few example shots that we want to use for all subsequent interactions, there's nothing wrong with just hardcoding our few-shot prompts into a prompt template like we just did.

Sometimes, however, we might wish to use (or try out) different combinations of examples with a static base prompt, or, ingest user / AI example interactions from data. In scenarios like these, we can use `FewShotChatMessagePromptTemplate` to assist us.

Let's imagine we want to construct a prompt that generates information about a given city, but we want to be very specific about the format of the information that the model generates. This seems like a good use case for few-shot prompting.

The end prompt we have in mind might look something like the following, with a human prompt template for a human to invoke with a city name, but also (currently commented out since it is not defined), a `few_shot_prompt` containing examples for how the model ought to format its response.

city_info_prompt_template = ChatPromptTemplate.from_messages([

# few_shot_prompt, # NOTE: we would like to provide several examples here in the form of a few-shot prompt.

("human", "Provide information about the following city in exactly the same format as you've done in previous responses: City: {city}")

])

Whether we author them ourselves, obtain them from a data source, or get an LLM to generate them for us, we can construct a list of the human / AI interaction examples we want to use in our few shot prompt.

city_examples_location = [

{"city": "Oakland", "output": "Oakland, USA, North America, Earth"},

{"city": "Paris", "output": "Paris, France, Europe, Earth"},

{"city": "Lima", "output": "Lima, Peru, South America, Earth"},

{"city": "Seoul", "output": "Seoul, South Korea, Asia, Earth"}

]

Since each item in `city_examples_location` is intended to represent a human message and AI message, it makes sense that next we can construct a prompt template to represent a single example interaction.

prompt_template_for_examples = ChatPromptTemplate.from_messages([

("human", "{city}"),

("ai", "{output}"),

])

And now, with our examples, and with our prompt template for the examples, we can use `FewShotChatMessagePromptTemplate` to construct a few shot prompt out of our examples.

`FewShotChatMessagePromptTemplate` expects 2 arguments:

1. `examples`: a list of dicts (ostensibly containing our examples)
2. `example_prompt`: the prompt template used to render our examples (ostensibly into `human` and `ai` messages)

few_shot_prompt = FewShotChatMessagePromptTemplate(

examples=city_examples_location,

example_prompt=prompt_template_for_examples

)

`few_shot_prompt` is a runnable, just like any other prompt template, which we can invoke. Here we invoke it and view the messages it is comprised of.

few_shot_prompt.invoke({}).to_messages()

With `few_shot_prompt` now defined, we can revisit our main `city_info_prompt_template`, but actually include the `few_shot_prompt` instead of leaving it commented out.

city_info_prompt_template = ChatPromptTemplate.from_messages([

few_shot_prompt,

("human", "Provide information about the following city in exactly the same format as you've done in previous responses: City: {city}")

])

Finally we can create a chain and use it, in this case, we'll send in a batch of city names.

chain = city_info_prompt_template | llm | parser

cities = [

"New York",

"London",

"Tokyo",

"Sydney",

"Cape Town",

"Toronto",

"Berlin",

"Buenos Aires",

"Dubai",

"Singapore"

]

chain.batch(cities)

This might seem like a lot of effort just to include some example shots in your prompt, and many times you will simply want to hardcode your examples into your main prompt. But as we mentioned before, there will be scenarios where you would wish to swap out the examples while keeping the rest of the structure of your main prompt, and this method allows for this quite nicely.

---

## Exercise: Swap in Different Few Shot Examples[](http://54.173.133.152/lab/lab/tree/3-Prompting-With-Messages/32-Few-Shot-Prompting.ipynb#Exercise:-Swap-in-Different-Few-Shot-Examples)

As an exercise on this very topic, you're going to recreate the chain we just made but with a new set of few-shot examples provided below.

We are going to also provide you with the rest of the chain, and your task simply is to **make as little modification as possible to get it to work with the new examples**.

Feel free to check out the _Solution_ below if you get stuck.

### Your Work Here[](http://54.173.133.152/lab/lab/tree/3-Prompting-With-Messages/32-Few-Shot-Prompting.ipynb#Your-Work-Here)

city_examples_slogan = [

{"city": "Oakland", "output": "Oakland, Bright Side of the Bay"},

{"city": "Paris", "output": "Paris, City of Light"},

{"city": "Lima", "output": "Lima, City of Kings"},

{"city": "Seoul", "output": "Seoul, Heartbeat of Korea"},

]

few_shot_prompt = FewShotChatMessagePromptTemplate(

examples=city_examples_location,

example_prompt=prompt_template_for_examples

)

city_info_prompt_template = ChatPromptTemplate.from_messages([

few_shot_prompt,

("human", "Provide information about the following city in exactly the same format as you've done in previous responses: City: {city}")

])

chain = city_info_prompt_template | llm | parser

chain.batch(cities)

### Solution[](http://54.173.133.152/lab/lab/tree/3-Prompting-With-Messages/32-Few-Shot-Prompting.ipynb#Solution)

7 cells hidden

## Summary[](http://54.173.133.152/lab/lab/tree/3-Prompting-With-Messages/32-Few-Shot-Prompting.ipynb#Summary)

In this notebook, using human and AI messages you were able to compose example interactions that impacted the behavior of your LLM.

In the next notebook, you'll learn about a 3rd message type, the system message, and use it to establish an overarching persona and role for a chat model.

---

Continue the unified course path

**Next step:** Open `3-Prompting-With-Messages/33-System-Message.ipynb` next: **System Message**.

**Before moving on:** Remember one example pair that changed the answer, because the next notebook adds a higher-level instruction layer that works alongside those demonstrations.