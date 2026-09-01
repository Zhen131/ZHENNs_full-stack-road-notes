In this notebook you will learn about LangChain runnables, and the ability to compose them into chains using LangChain Expression Language (LCEL).

![[Pasted image 20260901111442.png]]

---

## Objectives[](http://54.173.133.152/lab/lab/tree/2-Chains/21-LCEL.ipynb#Objectives)

By the time you complete this notebook you will:

- Understand LangChain runnables as units of work in LangChain.
- Intentionally use LLM instances and prompt templates as runnables.
- Create and use runnable output parsers.
- Compose runnables into LangChain chains using LCEL pipe syntax.

---

## Imports[](http://54.173.133.152/lab/lab/tree/2-Chains/21-LCEL.ipynb#Imports)

import os

from langchain_nvidia_ai_endpoints import ChatNVIDIA

from langchain_core.prompts import ChatPromptTemplate

from langchain_core.output_parsers import StrOutputParser

---

## Create a Model Instance[](http://54.173.133.152/lab/lab/tree/2-Chains/21-LCEL.ipynb#Create-a-Model-Instance)

base_url = os.getenv("NVIDIA_BASE_URL")

model = 'meta/llama-3.2-11b-vision-instruct'

llm = ChatNVIDIA(base_url=base_url, model=model, temperature=0)

---

## LangChain Runnables[](http://54.173.133.152/lab/lab/tree/2-Chains/21-LCEL.ipynb#LangChain-Runnables)

In the previous notebook you learned to create simple LangChain prompt templates, and to instantiate them with specific values for their template placeholders with the `invoke` method.

template = ChatPromptTemplate.from_template("Answer the following question: {question}")

prompt = template.invoke({"question": "In what city is NVIDIA world headquarters?"})

You also know, that when sending a prompt to an LLM instance that we have created in LangChain (in our case the LangChain component `ChatNVIDIA`), that we use the model instances's `invoke` method.

response = llm.invoke(prompt)

print(response.content)

The presence of the `invoke` method on both LLM instances, and on prompt templates is not coincidental, they are both LangChain **runnables**.

In LangChain, a **runnable** is a unit of work that can be invoked (as we've done with both LLM instances and prompt templates), batched and streamed (as we have done with LLM instances) and also transformed and composed (which we have not done yet).

Just to sanity check this, let's try the `batch` method, which we've used with LLM instances, but not on our prompt templates. Since prompt templates are runnables, like LLM instances, and since runnables can be batched, the following ought to work.

questions = [

{"question": "In what city is NVIDIA world headquarters?"},

{"question": "When was NVIDIA founded?"},

{"question": "Who is the CEO of NVIDIA?"},

]

prompts = template.batch(questions)

prompts

---

## LangChain Expression Language (LCEL)[](http://54.173.133.152/lab/lab/tree/2-Chains/21-LCEL.ipynb#LangChain-Expression-Language-\(LCEL\))

LCEL is a declarative way to compose runnables into **chains**: reusable compositions of functionality. We chain runnables together through LCEL's pipe `|` operator, which at a high level, will pipe the output of one runnable to the next.

For those of you who have worked with the Unix command line, you'll be familar with the `|` operator as a way to chain together the functionality of various programs in service of a larger goal.

If you don't know any Bash, don't worry too much about the following cell, but for those of you who do, you'll see we create a chain via the pipe operator to print "hello pipes" with `echo`, reverse the string with `rev` and then uppercase the reversed string with `tr`.

%%bash

echo hello pipes | rev | tr 'a-z' 'A-Z'

Similarly, and just as conveniently and powerfully, we can pipe together a great deal of LangChain functionality using LCEL's pipe operator.

---

## A Simple Chain[](http://54.173.133.152/lab/lab/tree/2-Chains/21-LCEL.ipynb#A-Simple-Chain)

Let's begin with a simple chain, relevant to the work you've already been doing. Just to keep everything where we can see it we will define here again our LLM instance and a prompt template.

llm = ChatNVIDIA(base_url=base_url, model=model, temperature=0)

template = ChatPromptTemplate.from_template("Answer the following question: {question}")

Now we'll create our first LCEL chain by composing these 2 together with a pipe. It makes sense intuitively that we'll want to utilize the prompt template first, and then send the resulting prompt to the LLM, so in our pipe we will put the template first.

chain = template | llm

We can visualize the computational graph represented by `chain` using the following helper method on the chain.

print(chain.get_graph().draw_ascii())

As you can see, the chain will expect a `PromptInput` which will be piped into our `ChatPromptTemplate` which will then be piped into our `ChatNVIDIA` model which will finally produce the `ChatNVIDIAOutput`.

Additionally, we can ascertain what kinds of inputs our chain expects, this time using a different helper method.

chain.input_schema.model_json_schema()

# chain.output_schema.model_json_schema()

The above is a [Pydantic](https://docs.pydantic.dev/latest/) object, which we're not going to cover in depth right now, but you'll notice immediately its `required` field states explicitly the name of any properties we are required to pass into `chain`.

Chains are composed of runnables, but are also runnables themselves. Thus, just like we would with any other runnable, we can use its `invoke` method.

We know the beginning of our chain expects a prompt input, and that the prompt template expects us to supply a value for `question`, so we'll invoke the chain while providing the expected value.

chain.invoke({"question": "Who founded NVIDIA?"})

It looks like we received a message from the model just like we have when invoking the model instance directly. Let's save the response and see if we view its `content` field as we've been able to do previously.

answer = chain.invoke({"question": "Who founded NVIDIA?"})

print(answer.content)

---

## Output Parsers[](http://54.173.133.152/lab/lab/tree/2-Chains/21-LCEL.ipynb#Output-Parsers)

Another core LangChain component is **output parsers**, which are classes to help structure LLM responses. Output parsers are, like LLM instances and prompt templates, runnables, which means we can use them in chains.

Let's begin with perhaps the most straightforward output parser, `StrOutputParser`, which is going to save us all the repetitive boilerplate of fishing the `content` field out of our model responses.

First we import the `StrOutputParser` class.

from langchain_core.output_parsers import StrOutputParser

Next we create an instance of the parser. For more advanced parsing techniques, some of which we'll see later, we can instantiate the parser with a variety of arguments, but for this simple parser we don't need to pass in any arguments when instantiating it.

parser = StrOutputParser()

Given our claims above about all runnables having `invoke`, `batch` and `stream` methods, we would expect to be able to call them on `parser`.

parser.invoke('parse this string')

parser.batch(['parse this string', 'and this string too'])

Additionally, and most importantly, we would also expect to be able to use `parser` in a chain. Let's recreate the chain from earlier but extend it by piping the model ouput into the output parser.

chain = template | llm | parser

Again, we can visualize the computational graph represented by `chain` using the following helper method on the chain.

print(chain.get_graph().draw_ascii())

And now let's invoke the chain, passing in the expected arguments.

chain.invoke({"question": "Who invented the use of the pipe symbol in Unix systems?"})

We hope you'll agree that being able to create declarative chains like this is a huge improvement over our previous methods.

---

## Exercise: Translation Revisited[](http://54.173.133.152/lab/lab/tree/2-Chains/21-LCEL.ipynb#Exercise:-Translation-Revisited)

Create a chain that is able to translate a given statement, source language, and target language you specify.

If you get stuck, check out the _Solution_ below.

### Your Work Here[](http://54.173.133.152/lab/lab/tree/2-Chains/21-LCEL.ipynb#Your-Work-Here)

  

### Solution[](http://54.173.133.152/lab/lab/tree/2-Chains/21-LCEL.ipynb#Solution)

6 cells hidden

## Summary[](http://54.173.133.152/lab/lab/tree/2-Chains/21-LCEL.ipynb#Summary)

In this notebook you learned how to work with runnables, and in particular, 3 of the core LangChain runnables: LLM instances, prompt templates, and output parsers.

In the next notebook we will continue our focus on creating and composing runnables by introducing the ability to create custom runnables.

---

Continue the unified course path

**Next step:** Open `2-Chains/22-Runnable-Functions.ipynb` next: **Runnable Functions**.

**Before moving on:** Keep one place where an explicit parser or prompt boundary clarified the workflow, because the next notebook extends that same runnable idea with your own custom logic.

Click to add a cell.