In this notebook, we will learn how to interact with LangChain to generate chat completions using Llama 3.2 11B Vision Instruct. This introductory exercise will help you understand the basics of setting up and using LangChain in a Jupyter environment.

---

## Objectives[](http://54.173.133.152/lab/lab/tree/1-Intro-to-Prompting/13-Hello-LangChain.ipynb#Objectives)

By the time you complete this notebook, you will:

- Have an introductory understanding of LangChain.
- Generate simple chat completions using LangChain.
- Compare the differences between using LangChain and the OpenAI library for chat completion.

---

## Imports[](http://54.173.133.152/lab/lab/tree/1-Intro-to-Prompting/13-Hello-LangChain.ipynb#Imports)

Here we import the `ChatNVIDIA` class from `langchain_nvidia_ai_endpoints`, which will enable us to interact with our remote `meta/llama-3.2-11b-vision-instruct` endpoint.

import os

from langchain_nvidia_ai_endpoints import ChatNVIDIA

---

## Using langchain_nvidia_ai_endpoints[](http://54.173.133.152/lab/lab/tree/1-Intro-to-Prompting/13-Hello-LangChain.ipynb#Using-langchain_nvidia_ai_endpoints)

As you have observed from the last notebook, using OpenAI completions can lead to a lot of code repetition.

There has been a lot of effort from developers to utilize AI applications efficiently. Amongst them, [LangChain](https://python.langchain.com/v0.2/docs/introduction/) is a popular LLM orchestration framework that aids users to interact with LLMs easily.

LangChain’s simplistic architecture and abstractions let developers effortlessly replace components like language models, prompt, and processing steps, with little modification. In addition, LangChain provides a consistent, unified interface across multiple LLMs from different providers, simplifying interactions and allowing developers to concentrate on application development rather than dealing with model-specific complexities.

This library is highly popular and evolves quickly with advancements in the field. While there are many parts of LangChain such as LangGraph, LangSmith, and LangServe, we are going to focus on LangChain core in our workshop today.

In order to use LangChain with our course model endpoint, we need a connector that presents the interface LangChain expects. We can do this with the `ChatNVIDIA` class from the `langchain-nvidia-ai-endpoints` package. With this tool, which uses the OpenAI-compatible API under the hood, we can iteratively develop and test prompts and use LangChain with NVIDIA NIM LLMs.

---

## Setting Up a Model Instance With LangChain[](http://54.173.133.152/lab/lab/tree/1-Intro-to-Prompting/13-Hello-LangChain.ipynb#Setting-Up-a-Model-Instance-With-LangChain)

To start using LangChain, we need to set up the ChatNVIDIA model instance. This involves configuring the base URL and model name, much as we did in the previous notebook with the `OpenAI` library.

base_url = os.getenv("NVIDIA_BASE_URL")

model = 'meta/llama-3.2-11b-vision-instruct'

llm = ChatNVIDIA(base_url=base_url, model=model, temperature=0)

You may have noticed we set a value called `temperature` to `0`. `temperature`. which is a floating point value between `0` and `1` is a way to control the randomness of a model's responses. When set to `0`, the LLM will always generate the text that it considers as having the highest probability of coming next. When set to higher values, it can generate text that is not necessarily what it considers to be the highest probability of coming next therefore introducing randomness and a sense of creativity in its generations.

We won't discuss modifying `temperature` to higher values in great detail, but remember, set it to `0` if you want deterministic responses, and set it higher if you want less deterministic (i.e. more creative) responses.

For those of you interested in learning more about how `temperature` and some other additional hyperparameters work, feel free to check out the appendix notebook, located in this directory, [99-Appendix-Hyperparams](http://54.173.133.152/lab/files/1-Intro-to-Prompting/99-Appendix-Hyperparams.ipynb?_xsrf=2%7C7fca0a86%7Ca23434af16dab75034f90cb3d5029ff0%7C1788253280).

---

## Making a Simple Request[](http://54.173.133.152/lab/lab/tree/1-Intro-to-Prompting/13-Hello-LangChain.ipynb#Making-a-Simple-Request)

We can now start sending chat completion prompts to our model. We'll begin by using the `invoke` method, which we hope you'll agree is much easier to use than was the OpenAI client in the previous notebook.

prompt = 'Who are you?'

result = llm.invoke(prompt)

print(result)

The result is similar to what we obtained using the OpenAI client, but it also includes metadata about the conversation and token usage. This will be useful for maintaining conversation context in more advanced applications.

To extract just the response from the model, we can simply use the result's `content` property, as below.

print(result.content)

---

## Exercise: Generate Your Own Completion[](http://54.173.133.152/lab/lab/tree/1-Intro-to-Prompting/13-Hello-LangChain.ipynb#Exercise:-Generate-Your-Own-Completion)

Use our existing model instance `llm` to generate and print a response from Llama 3.2 11B Vision Instruct to a prompt of your choice.

### Your Work Here[](http://54.173.133.152/lab/lab/tree/1-Intro-to-Prompting/13-Hello-LangChain.ipynb#Your-Work-Here)

  

### Solution[](http://54.173.133.152/lab/lab/tree/1-Intro-to-Prompting/13-Hello-LangChain.ipynb#Solution)

3 cells hidden

## Summary[](http://54.173.133.152/lab/lab/tree/1-Intro-to-Prompting/13-Hello-LangChain.ipynb#Summary)

You should now be able to use LangChain to generate chat completions and parse out the model response.

In the next notebook, you'll go a little further into using chat completions with LangChain by learning how to stream model responses and handle multiple chat completion requests in batches.

---

Continue the unified course path

**Next step:** Open `1-Intro-to-Prompting/14-Streaming-and-Batching.ipynb` next: **Streaming and Batching**.

**Before moving on:** Remember one place where the framework wrapper simplified the call, because the next notebook asks you to balance that convenience against response timing and throughput.

Click to add a cell.