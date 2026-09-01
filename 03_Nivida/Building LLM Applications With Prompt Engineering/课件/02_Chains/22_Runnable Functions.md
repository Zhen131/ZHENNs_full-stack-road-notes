In this notebook you will learn how to convert custom functions into runnables that can be included in LangChain chains.

---

## Objectives[](http://54.173.133.152/lab/lab/tree/2-Chains/22-Runnable-Functions.ipynb#Objectives)

By the time you complete this notebook you will:

- Understand how to create custom runnable functions and include them in your LangChain chains.
- Use custom runnable functions to preprocess data before sending it to an LLM.
- Use custom functions to batch translate raw text into prompt templates.
- Create a LangChain sentiment analysis chain utilizing multiple custom runnable functions.

---

## Imports[](http://54.173.133.152/lab/lab/tree/2-Chains/22-Runnable-Functions.ipynb#Imports)

import os

from langchain_nvidia_ai_endpoints import ChatNVIDIA

from langchain_core.prompts import ChatPromptTemplate

from langchain_core.output_parsers import StrOutputParser

from langchain_core.runnables import RunnableLambda

---

## Create a Model Instance[](http://54.173.133.152/lab/lab/tree/2-Chains/22-Runnable-Functions.ipynb#Create-a-Model-Instance)

base_url = os.getenv("NVIDIA_BASE_URL")

model = 'meta/llama-3.2-11b-vision-instruct'

llm = ChatNVIDIA(base_url=base_url, model=model, temperature=0)

---

## Using `RunnableLambda` to Create Custom Runnable Functions[](http://54.173.133.152/lab/lab/tree/2-Chains/22-Runnable-Functions.ipynb#Using-RunnableLambda-to-Create-Custom-Runnable-Functions)

We have already seen that LangChain provides composable runnables in the forms of LLM instances, prompt templates, and output parsers. Another powerful tool that LangChain provides is the ability to convert arbitrary functions into runnables with `RunnableLambda`.

from langchain_core.runnables import RunnableLambda

We will begin exploring custom runnable functions with a simply math function.

def double(x):

return 2*x

It should come as no surprise that this simple Python function does not have a LangChain runnable's `invoke` (or `batch` or `stream`) method.

try:

double.invoke(2)

except AttributeError:

print('`double` is a Python function and does not have an `invoke` method.')

However, we can easily convert it into a LangChain runnable by passing it into `RunnableLambda`.

runnable_double = RunnableLambda(double)

runnable_double.invoke(6)

runnable_double.batch([2, 4, 6, 8])

Like other runnables, custom function runnables like `runnable_double` can be composed into chains.

multiply_by_eight = runnable_double | runnable_double | runnable_double

multiply_by_eight.invoke(11)

Your own creativity is the only limit as to how you might utilize custom functions in your chains, but for the remainder of this notebook we'll explore a couple common use cases for custom runnable functions in chains.

---

## Data Management[](http://54.173.133.152/lab/lab/tree/2-Chains/22-Runnable-Functions.ipynb#Data-Management)

Whether for formatting, correction, or validation, you may wish to perform some work on data passing through your chains either before or after interacting with an LLM.

As an example, suppose you are building a sentiment analysis application where user reviews are analyzed for their sentiment. User reviews can contain various inconsistencies like mixed capitalization, extra whitespace, and contractions. Normalizing this text before sending it to the LLM can improve the accuracy of the sentiment analysis.

The following `normalize_text` function will normalize text by converting it to lowercase, expanding contractions, and removing extra whitespace.

import re

import contractions # pip install contractions

  

def normalize_text(text):

# Convert text to lowercase

text = text.lower()

# Expand contractions

text = contractions.fix(text)

# Remove extra whitespace

text = re.sub(r'\s+', ' ', text).strip()

return text

---

## Exercise: Create Runnable Function to Normalize Text[](http://54.173.133.152/lab/lab/tree/2-Chains/22-Runnable-Functions.ipynb#Exercise:-Create-Runnable-Function-to-Normalize-Text)

Use what you've learned so far about creating runnable functions to create one out of the `normalize_text` function provided above.

Upon successful implementation, you should be able to use it to batch process the following toy list of reviews.

Feel free to check out the _Solution_ below if you get stuck.

reviews = [

"I LOVE this product! It's absolutely amazing. ",

"Not bad, but could be better. I've seen worse.",

"Terrible experience... I'm never buying again!!",

"Pretty good, isn't it? Will buy again!",

"Excellent value for the money!!! Highly recommend."

]

### Your Work Here[](http://54.173.133.152/lab/lab/tree/2-Chains/22-Runnable-Functions.ipynb#Your-Work-Here)

  

### Solution[](http://54.173.133.152/lab/lab/tree/2-Chains/22-Runnable-Functions.ipynb#Solution)

2 cells hidden

## Formatting Text for Prompt Templates[](http://54.173.133.152/lab/lab/tree/2-Chains/22-Runnable-Functions.ipynb#Formatting-Text-for-Prompt-Templates)

In the previous exercise you ended up with a list of normalized reviews like the following.

normalized_reviews = [

'i love this product! it is absolutely amazing.',

'not bad, but could be better. i have seen worse.',

'terrible experience... i am never buying again!!',

'pretty good, is not it? will buy again!',

'excellent value for the money!!! highly recommend.'

]

Let us assume now that we would like to pipe these normalized reviews in to a prompt template for sentiment analysis like the following `sentiment_template`.

sentiment_template = ChatPromptTemplate.from_template(

"In a single word, either 'positive' or 'negative',"

" provide the overall sentiment of the following piece of text: {text}"

)

We know from the previous notebook that to invoke the above template, we need to pass in a dictionary that contains keys for its placeholders (`{text}` in the above template), for example:

sentiment_template.invoke({"text": 'i love this product! it is absolutely amazing.'})

Therefore, in order to prepare the items in `normalized_review` for being piped into `sentiment_template`, we need to convert each line of text into a dictionary with the key `"text"` and the value the actual line of text.

Let's create a runnable lambda to accomplish this. For this function we'll use an actual lambda function since the work we need to do is so minimal and define the runnable lambda straightaway.

prep_for_sentiment_template = RunnableLambda(lambda text: {"text": text})

We can now use `prep_for_sentiment_template` to prep `normalized_reviews` for `sentiment_template`.

prep_for_sentiment_template.batch(normalized_reviews)

---

## Exercise: Create a Sentiment Analysis Chain[](http://54.173.133.152/lab/lab/tree/2-Chains/22-Runnable-Functions.ipynb#Exercise:-Create-a-Sentiment-Analysis-Chain)

For this exercise, create a sentiment analysis chain that you can pass the original `reviews` list above into as a batch.

Your chain should:

- Normalize the raw reviews.
- Prepare the normalized reviews for use in `sentiment_template` (defined above).
- Pipe the prepared normalized reviews through the `sentiment_template`.
- Pipe the prompt templates to `llm` (already defined above).
- Conclude by parsing the LLM outputs with an instance of `StrOutputParser`, which you will need to instantiate.

Feel free to check out the solution below if you get stuck.

### Your Work[](http://54.173.133.152/lab/lab/tree/2-Chains/22-Runnable-Functions.ipynb#Your-Work)

  

### Solution[](http://54.173.133.152/lab/lab/tree/2-Chains/22-Runnable-Functions.ipynb#Solution)

7 cells hidden

## Summary[](http://54.173.133.152/lab/lab/tree/2-Chains/22-Runnable-Functions.ipynb#Summary)

In this notebook you learned how to create custom runnables to include in your chains. As it turns out, chains themselves are runnables, and in the next notebook you'll begin learning how to chain together chains.

---

Continue the unified course path

**Next step:** Open `2-Chains/23-Combining-Chains.ipynb` next: **Combining Chains**.

**Before moving on:** Remember one custom function that belongs in the pipeline, so the next notebook can show how that piece composes with model-driven steps instead of standing alone.

Click to add a cell.