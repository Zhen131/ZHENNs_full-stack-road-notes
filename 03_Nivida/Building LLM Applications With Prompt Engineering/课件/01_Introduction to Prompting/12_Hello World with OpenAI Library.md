In this notebook, we will use the OpenAI client to generate chat completions from Llama 3.2 11B Vision Instruct through the NVIDIA API Catalog. This introductory section covers the basic client setup and response shape.

---

## Objectives[](http://54.173.133.152/lab/lab/tree/1-Intro-to-Prompting/12-Hello-OpenAI.ipynb#Objectives)

By the time you complete this notebook you will:

- Understand how to set up and use the OpenAI library.
- Generate chat completions using Llama 3.2 11B Vision Instruct.
- Learn to interpret and utilize the API response.
- Understand the importance of using _chat_ completion endpoints with chat models.

---

## Imports[](http://54.173.133.152/lab/lab/tree/1-Intro-to-Prompting/12-Hello-OpenAI.ipynb#Imports)

Here we import the `OpenAI` library, which will enable us to interact with the NVIDIA API Catalog. The API Catalog exposes an OpenAI-compatible API, making it easy to work with using familiar tools.

import os

from openai import OpenAI

---

## Setting Up the OpenAI Client[](http://54.173.133.152/lab/lab/tree/1-Intro-to-Prompting/12-Hello-OpenAI.ipynb#Setting-Up-the-OpenAI-Client)

To start using the API, we need to set up the OpenAI client. This involves configuring the base URL and providing an API key.

In this course environment, the connection details have already been configured as environment variables, so we can simply retrieve them:

base_url = os.getenv("NVIDIA_BASE_URL")

The API key is also provided via environment variable. While you could use your own API key from [build.nvidia.com](https://build.nvidia.com/explore/discover), we've pre-configured one for this course:

api_key = os.getenv("NVIDIA_API_KEY")

With a `base_url` and `api_key` we can now instantiate an OpenAI client.

client = OpenAI(base_url=base_url, api_key=api_key)

---

## Observing Available Models[](http://54.173.133.152/lab/lab/tree/1-Intro-to-Prompting/12-Hello-OpenAI.ipynb#Observing-Available-Models)

Now that we've created an OpenAI client, we can use `client.models.list()` to inspect the available model catalog. We will keep the first view compact, then select the two models used in this workshop.

available_models = client.models.list()

len(available_models.data)

The full response contains more model cards than we need to display. The following filter keeps the workshop models visible while leaving `available_models.data` available for further exploration:

course_models = {

'meta/llama-3.2-11b-vision-instruct',

'nvidia/nemotron-3-nano-30b-a3b',

}

[model_card.id for model_card in available_models.data if model_card.id in course_models]

---

## Making a Simple Chat Completion Request[](http://54.173.133.152/lab/lab/tree/1-Intro-to-Prompting/12-Hello-OpenAI.ipynb#Making-a-Simple-Chat-Completion-Request)

With the `client` instance now created, we can make a simple request to generate chat completions by using the `client.chat.completions.create` method which expects a `model` to use for the completion, as well as a list of `messages` to send to the model. We will be discussing the details of the `messages` list in more detail below, but for now we will pass in a simple single message containing a prompt from the user (you) asking for a fun fact about space.

model = 'meta/llama-3.2-11b-vision-instruct'

prompt = 'Tell me a fun fact about space.'

response = client.chat.completions.create(

model=model,

messages=[{'role': 'user', 'content': prompt}]

)

print(response)

There's a fair amount of information provided in the API response, but the part we are most interested in is the response from the model.

Here we parse just the model's generated response out of the full API response.

model_response = response.choices[0].message.content

print(model_response)

---

## Exercise: Create Your First Prompt[](http://54.173.133.152/lab/lab/tree/1-Intro-to-Prompting/12-Hello-OpenAI.ipynb#Exercise:-Create-Your-First-Prompt)

Use our existing OpenAI `client` to generate and print a response from Llama 3.2 11B Vision Instruct to a prompt of your choice.

### Your Work Here[](http://54.173.133.152/lab/lab/tree/1-Intro-to-Prompting/12-Hello-OpenAI.ipynb#Your-Work-Here)

  

### Solution[](http://54.173.133.152/lab/lab/tree/1-Intro-to-Prompting/12-Hello-OpenAI.ipynb#Solution)

5 cells hidden

## Understanding Completion and Chat Completion Endpoints[](http://54.173.133.152/lab/lab/tree/1-Intro-to-Prompting/12-Hello-OpenAI.ipynb#Understanding-Completion-and-Chat-Completion-Endpoints)

We have been working with the OpenAI-compatible `chat.completions` interface. The OpenAI client also defines a legacy `completions` interface, but it expects a plain-text prompt and a compatible completion model. The NVIDIA model used here is a chat model, so we use `chat.completions`.

The `chat.completions` interface accepts a list of role-labeled messages. The API does not retain a conversation for you; multi-turn context comes from sending the earlier messages again in that list.

The legacy `completions` interface accepts a plain prompt and predicts a continuation. It is not the interface exposed for the course model.

The main takeaway is that when working with OpenAI-compatible chat models such as `meta/llama-3.2-11b-vision-instruct`, use `chat.completions` and not legacy `completions`.

---

## Summary[](http://54.173.133.152/lab/lab/tree/1-Intro-to-Prompting/12-Hello-OpenAI.ipynb#Summary)

By completing this notebook, you should now have a basic understanding of how to use the OpenAI library to generate chat completions, and parse out the model response. This foundation will prepare you for more advanced topics and techniques in prompt engineering.

In the next notebook, we will explore how to use LangChain to interact with language models, which will provide more flexibility and advanced capabilities for managing and generating text.

---

Continue the unified course path

**Next step:** Open `1-Intro-to-Prompting/13-Hello-LangChain.ipynb` next: **Hello World with LangChain**.

**Before moving on:** Keep one minimal request and response shape handy, so you can compare what the LangChain wrapper changes and what it leaves alone.