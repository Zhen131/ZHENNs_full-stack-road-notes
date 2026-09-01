In this notebook you'll learn how to creae and use parallel chains to easuly run independent events concurrently (or at least in a non-blocking way).

![[Pasted image 20260901111832.png]]

---

## Objectives[](http://54.173.133.152/lab/lab/tree/2-Chains/24-Parallel-Chains.ipynb#Objectives)

By the time you complete this notebook you will:

- Be able to create and use chains that execute in parallel
- Think about and identify opportunities for parallelism in your chains

---

## Imports[](http://54.173.133.152/lab/lab/tree/2-Chains/24-Parallel-Chains.ipynb#Imports)

import os

from langchain_nvidia_ai_endpoints import ChatNVIDIA

from langchain_core.prompts import ChatPromptTemplate

from langchain_core.output_parsers import StrOutputParser

from langchain_core.runnables import RunnableLambda, RunnableParallel

---

## Create a Model Instance[](http://54.173.133.152/lab/lab/tree/2-Chains/24-Parallel-Chains.ipynb#Create-a-Model-Instance)

base_url = os.getenv("NVIDIA_BASE_URL")

model = 'meta/llama-3.2-11b-vision-instruct'

llm = ChatNVIDIA(base_url=base_url, model=model, temperature=0)

---

## Parallel Chain Execution[](http://54.173.133.152/lab/lab/tree/2-Chains/24-Parallel-Chains.ipynb#Parallel-Chain-Execution)

For the previous set of exercises you composed multiple chains to operate on a set of inputs **serially**, or in order. As a matter of fact, our task required us to do so: we needed to perform the spell and grammar checking prior to generating the additional text.

At times, when thinking about a chain of tasks we wish to perform, we might ascertain that some of the tasks can be performed in parallel. The great news is that LCEL provides us with easy to use syntax for the parallel execution of runnables in our chains.

We're going to begin our study of parallel chain execution with a non-LLM-related set of tasks, just to get familiar with the syntax, after which we'll apply what we've learned to create a chain that utilizes multiple LLM chains working in parallel.

---

## Identifying Opportunites for Parallel Execution[](http://54.173.133.152/lab/lab/tree/2-Chains/24-Parallel-Chains.ipynb#Identifying-Opportunites-for-Parallel-Execution)

It may seem obvious, but before we can perform parallel execution, we need to identify when it is possible. You may already be well-practiced thinking about the possibility of parallel execution from work you've done in other programming settings, but if not, it's a skill you'll pick up quickly.

In general, you just need to consider when the ouput of one process is required as the input to another. In such a case you've discovered the need for serial execution between the two process. If, however, both (or many) processes can operate without relying on the work of other processes, you likely have an opportunity to do parallel work.

Let's construct a toy example to explore this a little further. Let's say we have a piece of text...

text = 'building large language models with prompt engineering'

...and we would like to perform two pieces of work on it:

1. Title case the text
2. Count the number of words the text contains

If we ask ourselves whether or not the output to either of these tasks is needed as inputs to the other, we quicky understand that the answer is "no". Therefore, these tasks can be performed independently and because they can be performed independently they could also be exectuted in parallel.

---

## Constructing Parallel Runnables[](http://54.173.133.152/lab/lab/tree/2-Chains/24-Parallel-Chains.ipynb#Constructing-Parallel-Runnables)

Understanding that for our toy problem we could perform the 2 constituent tasks in parallel, let's look at how to accomplish this with LangChain.

To begin, let's create two runnables using `RunnableLambda` that each capture one of the sub-tasks we wish to perform.

First we define a runnable for title casing input text.

title_case = RunnableLambda(lambda text: text.title())

Next we define a runnable for counting the number of words in a given text.

count_words = RunnableLambda(lambda text: len(text.split()))

We can invoke both runnables with our text sample and see that they behave as expected.

title = title_case.invoke(text)

title

word_count = count_words.invoke(text)

word_count

If we wanted to crate a chain to execute these 2 steps serially, we could pipe them together, though care needs to be taken about the order of the serial pipe.

serial_chain = title_case | count_words # And NOT count_words | title_case

serial_chain.invoke(text)

In order to create a parallel chain in LCEL we can use `RunnableParallel` which expects as input a dictionary where each property is one of the runnables that we would like to execute in parallel.

As with any Python dictionary, ours needs to contain key/value pairs. In the case of parallel chain execution the key is an arbitrary value we set, and the value is the runnable itself.

The parallel chain will return a dictionary with the same properties we specify, with the keys we set being mapped to the results of the runnables we passed in.

An example will clarify.

parallel_chain = RunnableParallel({'title': title_case, 'word_count': count_words})

parallel_chain.invoke(text)

If we take a look at the computational graph for `parallel_chain` we can see that it indicates the two runnables (`title_case` and `count_words`) are being executed in parallel.

print(parallel_chain.get_graph().draw_ascii())

---

## Using Parallel Outputs[](http://54.173.133.152/lab/lab/tree/2-Chains/24-Parallel-Chains.ipynb#Using-Parallel-Outputs)

Parallel chains are runnables and therefore can be composed with other runnables.

We should keep in mind that the output of a parallel chain is a dictionary. Some runnables, like prompt templates, expect dictionary values as their input, but others may not.

Of course, we can construct custom runnables to handle the output of parallel runnables, if needed.

With our current toy exercise, for example, should we wish to create a simple printout for our title-cased title and its word count, we could create a runnable that expects a dictionary as its input and uses its values to construct the output.

describe_title = RunnableLambda(lambda x: f"'{x['title']}' has {x['word_count']} words.")

Just to test `describe_title` out, let's invoke it with a dictionary.

describe_title.invoke({'title': title, 'word_count': word_count})

Seeing that this works as expected, let's add it to our existing chain.

final_chain = parallel_chain | describe_title

Looking at our final chain, we can see it has been extended, and now contains parallel and serial components.

print(final_chain.get_graph().draw_ascii())

And we can invoke it with a given title.

final_chain.invoke(title)

---

## Dictionary Literal Syntax for Parallel Runnables[](http://54.173.133.152/lab/lab/tree/2-Chains/24-Parallel-Chains.ipynb#Dictionary-Literal-Syntax-for-Parallel-Runnables)

As a matter of convenience, LCEL allows us to replace calls to `RunnableParallel` with simply the dictionary literal we would have passed into `RunnableParallel`.

As an example, here's a definition of `final_chain` fully articulated, and using a call to `RunnableParallel`.

final_chain = RunnableParallel({'title': title_case, 'word_count': count_words}) | describe_title

Should we wish, we could rewrite the chain as follows, removing the call to `RunnableParallel` and leaving only the dictionary literal:

final_chain = {'title': title_case, 'word_count': count_words} | describe_title

final_chain.invoke(title)

There are some gotcha's to this syntax, however. For example, if we tried to rewrite our earlier `parallel_chain`...

parallel_chain = RunnableParallel({'title': title_case, 'word_count': count_words})

...which contains no pipe characters and is only the single parallel runnable, it would look like this.

parallel_chain = {'title': title_case, 'word_count': count_words}

This looks good and didn't throw any errors when we defined it, but if now we try to invoke it, you'll see we get an attribute error about dict objects not having invoke attributes, which is true.

try:

parallel_chain.invoke(title)

except AttributeError as e:

print(e)

The takeaway is that you're always safe using `RunnableParallel`, and even if you prefer the dict literal syntax, use `RunnableParallel` when the Python interpreter would not be able to understand that your runnable isn't simply a Python dict.

---

## Exercise: Create a Chain with Parallel LLM Tasks[](http://54.173.133.152/lab/lab/tree/2-Chains/24-Parallel-Chains.ipynb#Exercise:-Create-a-Chain-with-Parallel-LLM-Tasks)

We are going to revisit an exercise you completed several notebooks ago when we introduced you to prompt templates, but before you learned about LCEL chains.

If you recall you were given the following list of statements...

statements = [

"I had a fantastic time hiking up the mountain yesterday.",

"The new restaurant downtown serves delicious vegetarian dishes.",

"I am feeling quite stressed about the upcoming project deadline.",

"Watching the sunset at the beach was a calming experience.",

"I recently started reading a fascinating book about space exploration."

]

...after which you created prompts for sentiment analysis, main topic extraction, and followup question generation and ultimately created a summary output that looked like the following:

> Statement: I had a fantastic time hiking up the mountain yesterday.
> Overall sentiment: Positive
> Main topic: Hiking
> Followup question: What were some of the most challenging or memorable parts of your hiking experience?
> 
> Statement: The new restaurant downtown serves delicious vegetarian dishes.
> Overall sentiment: Positive
> Main topic: Vegetarian restaurants.
> Followup question: What types of vegetarian dishes are served at the new downtown restaurant that are worth trying?
> 
> Statement: I am feeling quite stressed about the upcoming project deadline.
> Overall sentiment: Negative
> Main topic: Project deadline stress
> Followup question: How do you typically manage stress and pressure when working towards a significant deadline in a project?
> 
> Statement: Watching the sunset at the beach was a calming experience.
> Overall sentiment: Positive
> Main topic: The experience of watching a sunset at the beach.
> Followup question: What are some other activities that people often do at the beach at sunset?
> 
> Statement: I recently started reading a fascinating book about space exploration.
> Overall sentiment: Positive
> Main topic: Space exploration
> Followup question: What are some of the most significant discoveries or achievements made in the field of space exploration that the book might touch on?

For this exercise you are going again to produce the same summary output given the same list, however, you are going to do so using chains, and especially, using parallel chains where possible.

### Runnables for Your Work[](http://54.173.133.152/lab/lab/tree/2-Chains/24-Parallel-Chains.ipynb#Runnables-for-Your-Work)

To get you started, and to avoid you repeating work you've already done elsewhere, we'll provide you with several runnables that you are going to use in your solution.

First are the 3 prompt templates needed for your LLM-related tasks.

sentiment_template = ChatPromptTemplate.from_template("""In a single word, either 'positive' or 'negative', \

provide the overall sentiment of the following piece of text: {text}""")

main_topic_template = ChatPromptTemplate.from_template("""Identify and state, as concisely as possible, the main topic \

of the following piece of text. Only provide the main topic and no other helpful comments. Text: {text}""")

followup_template = ChatPromptTemplate.from_template("""What is an appropriate and interesting followup question that would help \

me learn more about the provided text? Only supply the question. Text: {text}""")

Next is an output parser.

parser = StrOutputParser()

Finally is a custom runnable which expects a dictionary as input with 4 values(`statement`, `sentiment`, `main_topic`, `followup`), and produces the text output we desire for this task.

output_formatter = RunnableLambda(lambda responses: (

f"Statement: {responses['statement']}\n"

f"Overall sentiment: {responses['sentiment']}\n"

f"Main topic: {responses['main_topic']}\n"

f"Followup question: {responses['followup']}\n"

))

### Plan Your Chain(s)[](http://54.173.133.152/lab/lab/tree/2-Chains/24-Parallel-Chains.ipynb#Plan-Your-Chain\(s\))

Before doing any additional coding, spend some time thinking through how you ought to compose your chain, including any sub-chains. In particular, consider where in our task we can utilize parallel execution.

Feel free to use the cell immediately below to write down your thoughts and articulate a plan of action. When you're done compare it to our _Solution Plan_ below.

### Your Plan Here[](http://54.173.133.152/lab/lab/tree/2-Chains/24-Parallel-Chains.ipynb#Your-Plan-Here)

  

### Solution Plan[](http://54.173.133.152/lab/lab/tree/2-Chains/24-Parallel-Chains.ipynb#Solution-Plan)

The inputs and outputs for our full chain will be:

> statements -> formatted_output

Working backwards from `formatted_output` we know that we are going to need 4 values to provide it:

> statements ->
> [statement, sentiment, main_topic, followup_question] ->
> formatted_output

We ought to be able to capture `statement` from `statements` somehow and just pipe it through the chain, but for `sentiment`, `main_topic`, and `followup_question` these each will need to be their own LLM chain:

> statements ->
> [
>     statement,
>     sentiment_template -> llm -> parser,
>     main_topic_template -> llm -> parser,
>     followup_question_template -> llm -> parser
> ] ->
> formatted_output

As an observation, it looks like everything in my outline in between the brackets `[` and `]` can be done independently of each other, so it's likely I'll be able to perform parallel execution there.

In order to move from my 4 parallel chains, which will return a dictionary to `formatted_output` I'll need to use the `output_formatter` runnable defined above.

> statements ->
> [
>     statement,
>     sentiment_template -> llm -> parser,
>     main_topic_template -> llm -> parser,
>     followup_question_template -> llm -> parser
> ] ->
> output_formatter ->
> formatted_output

As a final detail, I need to prepare my inputs (`statments`), which are currently strings, for use in the prompt templates, which each expect a dictionary with a `text` property.

> statements ->
> prep_statements_for_templates ->
> [
>     statement,
>     sentiment_template -> llm -> parser,
>     main_topic_template -> llm -> parser,
>     followup_question_template -> llm -> parser
> ] ->
> output_formatter ->
> formatted_output

This looks like a good description and with it I'm ready to plan my next steps forward:

1. Create a custom runnable to convert my string inputs to dictionaries with a text field for use by the prompt templates.
2. Create 1 chain each for sentiment analysis, main topic extraction, and followup question generation (3 chains total)
3. Create a parallel chain with the 3 chains you just created, plus one more runnable (a custom runnable) that captures the passed-in text under the key `statement` (as is expected by the output formatter).
4. Chain together the `prep_for_inputs` runnable, the parallel chain, and the `output_formatter` runnable.
5. Use the full chain to batch process `statements`.

### Your Work Here[](http://54.173.133.152/lab/lab/tree/2-Chains/24-Parallel-Chains.ipynb#Your-Work-Here)

If you're up for it, jump right in and implement the desired functionality.

If you'd like to work through the exercise with some step-by-step guidance, open up the _Walkthrough_ section immediately below.

  

## Walkthrough[](http://54.173.133.152/lab/lab/tree/2-Chains/24-Parallel-Chains.ipynb#Walkthrough)

In this walkthrough we'll follow the course of action laid out in the _Solution Plan_ above, namely:

1. Create a custom runnable to convert your string inputs to dictionaries with a `text` field for use by the prompt templates.
2. Create 1 chain each for sentiment analysis, main topic extraction, and followup question generation (3 chains total)
3. Create a parallel chain with the 3 chains you just created, plus one more runnable (a custom runnable) that captures the passed-in text under the key `statement` (as is expected by the output formatter).
4. Chain together the `prep_for_inputs` runnable, the parallel chain, and the `output_formatter` runnable.
5. Use the full chain to batch process `statements`.

### Prepare Inpute for Prompt Templates[](http://54.173.133.152/lab/lab/tree/2-Chains/24-Parallel-Chains.ipynb#Prepare-Inpute-for-Prompt-Templates)

Create a custom runnable to convert your string inputs to dictionaries with a `text` field for use by the prompt templates.

Feel free to check out the _Solution_ below if you get stuck.

### Your Work Here[](http://54.173.133.152/lab/lab/tree/2-Chains/24-Parallel-Chains.ipynb#Your-Work-Here)

  

### Solution[](http://54.173.133.152/lab/lab/tree/2-Chains/24-Parallel-Chains.ipynb#Solution)

1 cell hidden

### Create LLM Chains[](http://54.173.133.152/lab/lab/tree/2-Chains/24-Parallel-Chains.ipynb#Create-LLM-Chains)

Create 1 chain each for sentiment analysis, main topic extraction, and followup question generation (3 chains total). Each chain should use the appropriate prompt template, along with our LLM instance and output parser.

Feel free to check out the _Solution_ below if you get stuck.

### Your Work Here[](http://54.173.133.152/lab/lab/tree/2-Chains/24-Parallel-Chains.ipynb#Your-Work-Here)

  

### Solution[](http://54.173.133.152/lab/lab/tree/2-Chains/24-Parallel-Chains.ipynb#Solution)

1 cell hidden

### Create a Parallel Chain[](http://54.173.133.152/lab/lab/tree/2-Chains/24-Parallel-Chains.ipynb#Create-a-Parallel-Chain)

Create a parallel chain with the 3 chains you just created, plus one more runnable (a custom runnable) that captures the passed-in text under the key `statement` (as is expected by the output formatter).

Feel free to check out the _Solution_ below if you get stuck.

### Your Work Here[](http://54.173.133.152/lab/lab/tree/2-Chains/24-Parallel-Chains.ipynb#Your-Work-Here)

  

### Solution[](http://54.173.133.152/lab/lab/tree/2-Chains/24-Parallel-Chains.ipynb#Solution)

1 cell hidden

### Compose Main Chain Out of Sub-chains[](http://54.173.133.152/lab/lab/tree/2-Chains/24-Parallel-Chains.ipynb#Compose-Main-Chain-Out-of-Sub-chains)

Chain together the `prep_for_inputs` runnable, the parallel chain, and the `output_formatter` runnable.

Feel free to check out the _Solution_ below if you get stuck.

### Your Work Here[](http://54.173.133.152/lab/lab/tree/2-Chains/24-Parallel-Chains.ipynb#Your-Work-Here)

  

### Solution[](http://54.173.133.152/lab/lab/tree/2-Chains/24-Parallel-Chains.ipynb#Solution)

2 cells hidden

### Execute the Chain[](http://54.173.133.152/lab/lab/tree/2-Chains/24-Parallel-Chains.ipynb#Execute-the-Chain)

Use the full chain to batch process `statements`.

Feel free to check out the _Solution_ below if you get stuck.

### Your Work Here[](http://54.173.133.152/lab/lab/tree/2-Chains/24-Parallel-Chains.ipynb#Your-Work-Here)

  

### Solution[](http://54.173.133.152/lab/lab/tree/2-Chains/24-Parallel-Chains.ipynb#Solution)

3 cells hidden

## Summary[](http://54.173.133.152/lab/lab/tree/2-Chains/24-Parallel-Chains.ipynb#Summary)

This notebook concludes this section, where you learned how to work in many ways with LangChain runnables, including the creation of custom runnables, and how to chain them together in a variety of manners and for an assortment of tasks.

You'll be composing runnables into chains for the duration of the workshop, starting in the next section, where you'll dive into LangChain messages, and how to leverage your understanding of them in a variey of ways to control the outputs of the LLMs you work with.

---

Continue the unified course path

**Next step:** Open `3-Prompting-With-Messages/30-Section-Introduction.ipynb` next: **Section 3: Prompting With Messages**.

**Before moving on:** Choose one branching workflow that benefited from parallel composition, then carry that mental model into the next section where message roles become another explicit control surface.

Click to add a cell.