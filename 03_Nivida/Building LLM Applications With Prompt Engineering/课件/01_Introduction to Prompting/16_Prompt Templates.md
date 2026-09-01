In this notebook you'll learn how to capture reusable LLM functionality in prompt templates, and begin working with the powerful prompt template tools provided by LangChain.

---

## Objectives[](http://54.173.133.152/lab/lab/tree/1-Intro-to-Prompting/16-Prompt-Templates.ipynb#Objectives)

By the time you complete this notebook you will:

- Appreciate the need and ability to capture LLM-related tasks in prompt templates.
- Be able to create reusable prompt templates with LangChain.
- Use prompt templates to perform a variety of LLM-powered tasks on a collection of provided text samples.

---

## Imports[](http://54.173.133.152/lab/lab/tree/1-Intro-to-Prompting/16-Prompt-Templates.ipynb#Imports)

import os

from langchain_nvidia_ai_endpoints import ChatNVIDIA

from langchain_core.prompts import ChatPromptTemplate

---

## Create a Model Instance[](http://54.173.133.152/lab/lab/tree/1-Intro-to-Prompting/16-Prompt-Templates.ipynb#Create-a-Model-Instance)

base_url = os.getenv("NVIDIA_BASE_URL")

model = 'meta/llama-3.2-11b-vision-instruct'

llm = ChatNVIDIA(base_url=base_url, model=model, temperature=0)

---

## One-off Tasks vs. Reusable Functionality[](http://54.173.133.152/lab/lab/tree/1-Intro-to-Prompting/16-Prompt-Templates.ipynb#One-off-Tasks-vs.-Reusable-Functionality)

If you are the end user of an LLM-based application, especially a chatbot like Perplexity or ChatGPT, then you may very well undertake a process of iterative prompt development to elicit a response from the LLM-based application that is helpful to you. If, however, you are engineering prompts for use in an LLM-based application that you are building, it is often the case that you want to develop a prompt that captures some task or functionality, and that can be reused with a variety of inputs.

As a developer you are already deeply familiar with the progression from one-off tasks to more generalized, templated functionalities. There are many ways you do this, but as a simple and universally relatable example consider the following example of calculating the products of 2 numbers.

If you just needed to perform a calculation in a one-off manner for yourself, you could simply write a line of code like the following:

99 * 64

If however, you wanted to capture some more general functionality, say multiplying two numbers together, and wanted this functionality to be able to be reused across a variety of inputs, you would write something like the following function:

def multiply_two_numbers(a, b):

return a * b

At this point not only could you do the orignal calculation,...

multiply_two_numbers(99, 64)

...but you can reuse the function for an arbitrary number of calculations, including those deemed useful users other than yourself.

---

## Prompt Templates As Reusable Functionality[](http://54.173.133.152/lab/lab/tree/1-Intro-to-Prompting/16-Prompt-Templates.ipynb#Prompt-Templates-As-Reusable-Functionality)

Prompting is not so different. If you have a one off task, you just write a prompt for it:

one_off_prompt = "Translate the following from English to Spanish: 'Today is a good day.'"

print(llm.invoke(one_off_prompt).content)

If, however, you'd like to create reusable functionality, you might abstract part of the prompt away into arguments so that you're left with something you could reuse with arbitrary inputs, like the following:

def translate_from_english_to_spanish(english_statement):

return f"Translate the following from English to Spanish. Provide just the translated text: {english_statement}"

english_statements = [

'Today is a good day.',

'Tomorrow will be even better.',

'Next week, who can say.'

]

prompts = [translate_from_english_to_spanish(english_statement) for english_statement in english_statements]

prompts

translations = llm.batch(prompts)

for translation in translations:

print(translation.content)

Our `translate_from_english_to_spanish` function therefore creates a **prompt template** that capture the functionality of translating an English statement to Spanish.

Of course we could abstract even more out of our prompt and create an even more general template, if we wish:

def translate(from_language, to_language, statement):

return f"Translate the following from {from_language} to {to_language}. Provide only the translated text: {statement}"

print(llm.invoke(translate('English', 'French', 'Computers have many languages of their own')).content)

---

## LangChain's `ChatPromptTemplate.from_template`[](http://54.173.133.152/lab/lab/tree/1-Intro-to-Prompting/16-Prompt-Templates.ipynb#LangChain's-ChatPromptTemplate.from_template)

There's nothing inherently wrong with developing your own conventions for creating prompt templates, but LangChain ships with a very large collection of templating mechanisms that are easy to use, flexible, well-maintained, and widely adopted.

We will start with perhaps the most basic way to create prompt templates for a chat model `ChatPromptTemplate.from_template`. First we need to import `ChatPromptTemplate` into our environment.

from langchain_core.prompts import ChatPromptTemplate

We can now create a template, very much like we did above through the creation of a function. Let's revisit creating a template for translating an English statement to Spanish.

english_to_spanish_template = ChatPromptTemplate.from_template(

"Translate the following from English to Spanish."

" Provide only the translated text: '{english_statement}'"

)

As you can see, this is pretty much identical to the f-string we returned in our `translate_from_english_to_spanish` function above.

To create an actual prompt from the template, we use the template's `invoke` method.

prompt = english_to_spanish_template.invoke("Today is a good day.")

At which point we can now pass it into our LLM as we have been.

print(llm.invoke(prompt).content)

---

## Chat Prompt Template Details[](http://54.173.133.152/lab/lab/tree/1-Intro-to-Prompting/16-Prompt-Templates.ipynb#Chat-Prompt-Template-Details)

If we look more carefully at the prompt we just created from the template, we'll see that there's a bit more going on than the creation of a string:

print(prompt)

Under the hood, it would appear that LangChain is constructing a list of `messages`, and specifically, a `HumanMessage` whose `content` is the string prompt we intended to create.

You'll be learning a lot throughout the workshop about `messages`, including `HumanMessage`s, but for now, recall from an earlier notebook when you began interacting with our course model endpoint with the `OpenAI` library that we had to take care to interact with the **chat** completions endpoint, given that we are working with a chat model, and that when constructing our prompt, we had to include some additional structure to our prompt, including the creation of a `messages` list and the specification of our prompt as being associated with a `user` role. Here's a reminder from that previous notebook:

```python
response = client.chat.completions.create(
    model=model,
    messages=[{'role': 'user', 'content': prompt}]
)
```

The important thing for you to understand now, is that when working with chat models specifically, the model expects interactions via messages in a turn-based structure where for each message, it is associated with a specific role like AI assistant, human user, or others.

One of the great things about working with LangChain is that a lot of the specific formatting required to adhere to the expectations of working with a chat model are taken care of for you, but at the same time, when needed, you can drill down for full control of your program.

---

## Prompt Templates for Multiple Values[](http://54.173.133.152/lab/lab/tree/1-Intro-to-Prompting/16-Prompt-Templates.ipynb#Prompt-Templates-for-Multiple-Values)

For reference, here is the template we created above to translate a statement from English to Spanish, as well as its use with our course model.

english_to_spanish_template = ChatPromptTemplate.from_template(

"Translate the following from English to Spanish."

" Provide only the translated text '{english_statement}'"

)

  

prompt = english_to_spanish_template.invoke("Today is a good day.")

  

print(llm.invoke(prompt).content)

You may have noticed when calling `invoke` on the template, that we passed in a single string...

english_to_spanish_template.invoke("Today is a good day.")

...which in this case was fine since the template `"Translate the following from English to Spanish: '{english_statement}'"` was only expecting a single value, namely, `english_statement`.

When invoking templates that expect multiple values, and in fact as a best practice even for templates that expect a single value, instead of passing in a string, we pass in a `dict` that maps the template placeholders to their intended values. Thus, a better way of invoking our template would be:

english_to_spanish_template.invoke({"english_statement": "Today is a good day."})

...which as you can see results in the same prompt.

Specifying which string maps to which placeholder via dictionary items becomes essential when working with prompts that expect multiple value. Here we demonstrate the creation and use of our more general template from above that allows for the translation from and to arbitrary languages.

translate_template = ChatPromptTemplate.from_template(

"Translate the following from {from_language} to {to_language}."

" Provide only the translated text: {statement}"

)

prompt = translate_template.invoke({

"from_language": "English",

"to_language": "French",

"statement": "Sometimes a little additional complexity is worth it."

})

print(llm.invoke(prompt).content)

---

## Exercise: Create Prompt Templates[](http://54.173.133.152/lab/lab/tree/1-Intro-to-Prompting/16-Prompt-Templates.ipynb#Exercise:-Create-Prompt-Templates)

This exercise is a little longer than previous exercises and will conclude this section. For it, you are going to capture 3 LLM-related tasks into prompt templates, and apply each of these tasks to a list of statements we will provide you.

The LLM-related tasks you should create templates for are:

- Sentiment analysis: ascertain whether the overall sentiment of a given piece of text is 'positive' or 'negative'.
- Main topic identification: identify and state the main topic for a given piece of text.
- Followup question generation: generate an appropriate and interesting followup question that will clarify some aspect of a given piece of text.

Please use `statements` immediately below as the pieces text you should use for each of your templates. Upon completion you should be able to perform 3 LLM-related tasks on all 5 pieces of provided text.

statements = [

"I had a fantastic time hiking up the mountain yesterday.",

"The new restaurant downtown serves delicious vegetarian dishes.",

"I am feeling quite stressed about the upcoming project deadline.",

"Watching the sunset at the beach was a calming experience.",

"I recently started reading a fascinating book about space exploration."

]

If you're up for the challenge, feel free to begin your work straightaway. If you'd like some assistance, click on _Walkthrough_ below to expand a step by step walkthrough of the exercise.

### Your Work Here[](http://54.173.133.152/lab/lab/tree/1-Intro-to-Prompting/16-Prompt-Templates.ipynb#Your-Work-Here)

  

---

## Walkthrough[](http://54.173.133.152/lab/lab/tree/1-Intro-to-Prompting/16-Prompt-Templates.ipynb#Walkthrough)

### Prompt Template for Sentiment Analysis[](http://54.173.133.152/lab/lab/tree/1-Intro-to-Prompting/16-Prompt-Templates.ipynb#Prompt-Template-for-Sentiment-Analysis)

Start by constructing prompt templates for each of the LLM-related tasks we'd like to accomplish, beginning with a prompt template for sentiment analysis.

Feel free to check out the _Solution_ below if you get stuck.

### Your Work Here[](http://54.173.133.152/lab/lab/tree/1-Intro-to-Prompting/16-Prompt-Templates.ipynb#Your-Work-Here)

sentiment_template = 'TODO'

### Solution[](http://54.173.133.152/lab/lab/tree/1-Intro-to-Prompting/16-Prompt-Templates.ipynb#Solution)

1 cell hidden

### Prompt Template for Main Topic Identification[](http://54.173.133.152/lab/lab/tree/1-Intro-to-Prompting/16-Prompt-Templates.ipynb#Prompt-Template-for-Main-Topic-Identification)

Next create a prompt template for main topic identification.

Feel free to check out the _Solution_ below if you get stuck.

### Your Work Here[](http://54.173.133.152/lab/lab/tree/1-Intro-to-Prompting/16-Prompt-Templates.ipynb#Your-Work-Here)

main_topic_template = 'TODO'

### Solution[](http://54.173.133.152/lab/lab/tree/1-Intro-to-Prompting/16-Prompt-Templates.ipynb#Solution)

1 cell hidden

### Prompt Template for Followup Question Generation[](http://54.173.133.152/lab/lab/tree/1-Intro-to-Prompting/16-Prompt-Templates.ipynb#Prompt-Template-for-Followup-Question-Generation)

Next create a prompt template for generating a relevant followup question.

Feel free to check out the _Solution_ below if you get stuck.

### Your Work Here[](http://54.173.133.152/lab/lab/tree/1-Intro-to-Prompting/16-Prompt-Templates.ipynb#Your-Work-Here)

followup_template = 'TODO'

### Solution[](http://54.173.133.152/lab/lab/tree/1-Intro-to-Prompting/16-Prompt-Templates.ipynb#Solution)

1 cell hidden

### Create Lists of Prompts for Future Batching[](http://54.173.133.152/lab/lab/tree/1-Intro-to-Prompting/16-Prompt-Templates.ipynb#Create-Lists-of-Prompts-for-Future-Batching)

In order to generate batched responses for each of our 3 LLM-related tasks, we will need a list of prompts for each task.

For this step of the exercise, use `statements` (defined above) in conjunction with each of the prompt templates you just created to create a list of prompts for each of the 3 LLM-related tasks you'd like to accomplish.

Feel free to check out the _Solution_ below if you get stuck.

### Your Work Here[](http://54.173.133.152/lab/lab/tree/1-Intro-to-Prompting/16-Prompt-Templates.ipynb#Your-Work-Here)

sentiment_prompts = [] # TODO: populate with sentiment analysis prompts for each statement in `statements`.

main_topic_prompts = [] # TODO: populate with main topic prompts for each statement in `statements`.

followup_prompts = [] # TODO: populate with followup question prompts for each statement in `statements`.

### Solution[](http://54.173.133.152/lab/lab/tree/1-Intro-to-Prompting/16-Prompt-Templates.ipynb#Solution)

3 cells hidden

### Generate Responses for Each LLM Tasks Using Batching[](http://54.173.133.152/lab/lab/tree/1-Intro-to-Prompting/16-Prompt-Templates.ipynb#Generate-Responses-for-Each-LLM-Tasks-Using-Batching)

Use batching to call the LLM with each of your constructed prompts, once for each task.

Feel free to check out the _Solution_ below if you get stuck.

### Your Work Here[](http://54.173.133.152/lab/lab/tree/1-Intro-to-Prompting/16-Prompt-Templates.ipynb#Your-Work-Here)

sentiments = [] # TODO: use the LLM to populate this list with the sentiment of each statement in `statements`.

main_topics = [] # TODO: use the LLM to populate this list with the main topic of each statement in `statements`.

followups = [] # TODO: use the LLM to populate this list with a followup question for each statement in `statements`.

### Solution[](http://54.173.133.152/lab/lab/tree/1-Intro-to-Prompting/16-Prompt-Templates.ipynb#Solution)

3 cells hidden

### Print Results[](http://54.173.133.152/lab/lab/tree/1-Intro-to-Prompting/16-Prompt-Templates.ipynb#Print-Results)

Finally, loop over the original statements and all the model responses for the various topics to make a nice print out of everthing.

Feel free to check out the _Solution_ below if you get stuck.

### Your Work Here[](http://54.173.133.152/lab/lab/tree/1-Intro-to-Prompting/16-Prompt-Templates.ipynb#Your-Work-Here)

  

### Solution[](http://54.173.133.152/lab/lab/tree/1-Intro-to-Prompting/16-Prompt-Templates.ipynb#Solution)

2 cells hidden

## Summary[](http://54.173.133.152/lab/lab/tree/1-Intro-to-Prompting/16-Prompt-Templates.ipynb#Summary)

Through a combination of capturing LLM-related functionality in prompt templates, and batching calls to a chat model, you're already starting to peform legitimate work. Even with what you know thus far, it's not hard to see how you could easily extend it to create a serious amount of LLM-powered analysis and text generation on large collections of textual data.

However, we are just getting started. In the next notebook we are going to introduce something called LangChain Expression Language (LCEL) which will enable you to create concise but powerful chains of LLM application functionality. As you'll see, using LCEL chains will allow us to create functionalilty, much like you did in the previous exercise, much more efficiently.

---

Continue the unified course path

**Next step:** Open `1-Intro-to-Prompting/99-Appendix-Hyperparams.ipynb` next: **Appendix: Explore Hyperparameters**.

**Before moving on:** Save one template input-output pattern you trust, then use the appendix to see how generation settings change behavior around that same contract.

Click to add a cell.