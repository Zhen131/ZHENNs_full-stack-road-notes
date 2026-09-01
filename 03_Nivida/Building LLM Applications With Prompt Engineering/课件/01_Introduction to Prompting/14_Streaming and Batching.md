In this notebook you'll learn how to stream model responses and handle multiple chat completion requests in batches.

---

## Objectives[](http://54.173.133.152/lab/lab/tree/1-Intro-to-Prompting/14-Streaming-and-Batching.ipynb#Objectives)

By the time you complete this notebook, you will:

- Learn to stream model responses.
- Learn to batch model responses.
- Compare the performance of batch processing to single prompt chat completion.

---

## Imports[](http://54.173.133.152/lab/lab/tree/1-Intro-to-Prompting/14-Streaming-and-Batching.ipynb#Imports)

Here we import the `ChatNVIDIA` class from `langchain_nvidia_ai_endpoints`, which will enable us to interact with the remote `meta/llama-3.2-11b-vision-instruct` endpoint.

import os

from langchain_nvidia_ai_endpoints import ChatNVIDIA

---

## Create a Model Instance[](http://54.173.133.152/lab/lab/tree/1-Intro-to-Prompting/14-Streaming-and-Batching.ipynb#Create-a-Model-Instance)

base_url = os.getenv("NVIDIA_BASE_URL")

model = 'meta/llama-3.2-11b-vision-instruct'

llm = ChatNVIDIA(base_url=base_url, model=model, temperature=0)

---

## Sanity Check[](http://54.173.133.152/lab/lab/tree/1-Intro-to-Prompting/14-Streaming-and-Batching.ipynb#Sanity-Check)

Before proceeding with new use cases, let's sanity check that we can interact with our course model endpoint via LangChain.

prompt = 'Where and when was NVIDIA founded?'

result = llm.invoke(prompt)

print(result.content)

---

## Streaming Responses[](http://54.173.133.152/lab/lab/tree/1-Intro-to-Prompting/14-Streaming-and-Batching.ipynb#Streaming-Responses)

As an alternative to the `invoke` method, you can use the `stream` method to receive the model response in chunks. This way, you don't have to wait for the entire response to be generated, and you can see the output as it is being produced. Especially for long responses, or in user-facing applications, streaming output can result in a much better user experience.

Let's create a prompt that generates a longer response.

prompt = 'Explain who you are in roughly 500 words.'

Given this prompt, let's see how the `stream` function works.

for chunk in llm.stream(prompt):

print(chunk.content, end='')

The `stream` method in LangChain serves as a foundational tool and shows the response as it is being generated. This can make the interaction with the LLMs feel more responsive and improve the user experience.

---

In subsequent notebooks we will import this helper function to assist our work.

---

## Batching Responses[](http://54.173.133.152/lab/lab/tree/1-Intro-to-Prompting/14-Streaming-and-Batching.ipynb#Batching-Responses)

You can also use `batch` to call the prompts on a list of inputs. Calling `batch` will return a list of responses in the same order as they were passed in.

Not only is `batch` convenient when working with collections of data that all need to be responded to in some way by an LLM, but the `batch` method is designed to process multiple prompts concurrently, effectively running the responses in parallel as much as possible. This allows for more efficient handling of multiple requests, reducing the overall time needed to generate responses for a list of prompts. By batching requests, you can leverage the computational power of the language model to handle multiple inputs simultaneously, improving performance and throughput.

We'll demonstrate the functionality and performance benefits of batching by using this list of prompts about state capitals.

state_capital_questions = [

'What is the capital of California?',

'What is the capital of Texas?',

'What is the capital of New York?',

'What is the capital of Florida?',

'What is the capital of Illinois?',

'What is the capital of Ohio?'

]

Using `batch` we can pass in the entire list...

capitals = llm.batch(state_capital_questions)

... and get back a list of responses.

len(capitals)

for capital in capitals:

print(capital.content)

One thing to note is that `batch` is not engaging with the LLM in a multi-turn conversation (a topic we will cover at length later in the workshop). Rather, it is asking multiple questions to a new LLM instance each time.

---

## Comparing batch and invoke Performance[](http://54.173.133.152/lab/lab/tree/1-Intro-to-Prompting/14-Streaming-and-Batching.ipynb#Comparing-batch-and-invoke-Performance)

Just to make a quick observation about the potential performance gains from batching, here we time a call to `batch`. Note the `Wall time`.

%%time

llm.batch(state_capital_questions)

And now to compare, we iterate over the `state_capital_questions` list and call `invoke` on each item. Again, note the `Wall time` and compare it to the results from batching above.

%%time

for cq in state_capital_questions:

llm.invoke(cq)

---

## Exercise: Batch Process to Create an FAQ Document[](http://54.173.133.152/lab/lab/tree/1-Intro-to-Prompting/14-Streaming-and-Batching.ipynb#Exercise:-Batch-Process-to-Create-an-FAQ-Document)

For this exercise you'll use batch processing to respond to a variety of LLM-related questions in service of creating an FAQ document (in this notebook setting the document will just be something we print to screen).

Here is a list of LLM-related questions.

faq_questions = [

'What is a Large Language Model (LLM)?',

'How do LLMs work?',

'What are some common applications of LLMs?',

'What is fine-tuning in the context of LLMs?',

'How do LLMs handle context?',

'What are some limitations of LLMs?',

'How do LLMs generate text?',

'What is the importance of prompt engineering in LLMs?',

'How can LLMs be used in chatbots?',

'What are some ethical considerations when using LLMs?'

]

You job is to populate `faq_answers` below with a list of responses to each of the questions. Use the `batch` method to make this very easy.

Upon successful completion, you should be able to print the return value of calling the following `create_faq_document` with `faq_questions` and `faq_answers` and get an FAQ document for all of the LLM-related questions above.

def create_faq_document(faq_questions, faq_answers):

faq_document = ''

for question, response in zip(faq_questions, faq_answers):

faq_document += f'{question.upper()}\n\n'

faq_document += f'{response.content}\n\n'

faq_document += '-'*30 + '\n\n'

  

return faq_document

If you get stuck, check out the _Solution_ below.

### Your Work Here[](http://54.173.133.152/lab/lab/tree/1-Intro-to-Prompting/14-Streaming-and-Batching.ipynb#Your-Work-Here)

faq_answers = []

# This should work after you successfully populate `faq_answers` with LLM responses.

print(create_faq_document(faq_questions, faq_answers))

### Solution[](http://54.173.133.152/lab/lab/tree/1-Intro-to-Prompting/14-Streaming-and-Batching.ipynb#Solution)

4 cells hidden

## Summary[](http://54.173.133.152/lab/lab/tree/1-Intro-to-Prompting/14-Streaming-and-Batching.ipynb#Summary)

In this notebook you learned how to stream and batch model responses, and used batched LLM calls to generate a helpful FAQ document.

In the next notebook you'll begin focusing more heavily on the creation of prompts themselves with an emphasis on iterative prompt development and engineering prompts that are very specific.

---

Continue the unified course path

**Next step:** Open `1-Intro-to-Prompting/15-Iterative-Prompting.ipynb` next: **Iterative Prompt Development**.

**Before moving on:** Keep one case where streaming or batching changed the workflow payoff, so the next notebook can focus on improving the prompt itself rather than the transport pattern.

Click to add a cell.