In this notebook, you will learn about one of the most famous prompting techniques called Chain-of-Thought prompting.

---

## Objectives[](http://54.173.133.152/lab/lab/tree/3-Prompting-With-Messages/34-Chain-of-Thought.ipynb#Objectives)

By the time you complete this notebook you will:

- Learn Chain-of-Thought prompting
- Encounter and appreciate LLM hallucination

---

## Imports[](http://54.173.133.152/lab/lab/tree/3-Prompting-With-Messages/34-Chain-of-Thought.ipynb#Imports)

import os

from langchain_nvidia_ai_endpoints import ChatNVIDIA

from langchain_core.prompts import ChatPromptTemplate

from langchain_core.output_parsers import StrOutputParser

---

## Create a Model Instance[](http://54.173.133.152/lab/lab/tree/3-Prompting-With-Messages/34-Chain-of-Thought.ipynb#Create-a-Model-Instance)

base_url = os.getenv("NVIDIA_BASE_URL")

model = 'meta/llama-3.2-11b-vision-instruct'

llm = ChatNVIDIA(base_url=base_url, model=model, temperature=0)

---

## LLMs Jump to Conclusions[](http://54.173.133.152/lab/lab/tree/3-Prompting-With-Messages/34-Chain-of-Thought.ipynb#LLMs-Jump-to-Conclusions)

Since LLMs are primarily designed to generate what is most likely to come next in a stream of text, it's no surprise that they can often "jump to conclusions" in scenarios that actually require complex reasoning.

Consider the following example, which challenges the LLM to do some multiplication. Before invoking the LLM, we'll use Python to provide us with the actual answer.

expression1 = "345 * 88888"

expression2 = "345*88888"

eval(expression1), eval(expression2)

print(llm.invoke(f'What is {expression1}? Give me just the answer').content)

print(llm.invoke(f'What is {expression2}? Give me just the answer').content)

This answer is incorrect, but given what we know about LLMs, again, that they are designed primarily to generate the most likely response given the data they were trained on, it may not come as a surprise.

Significant changes are likely to occur in coming years, but as it stands, and in spite of the common use of terms like "Artificial **Intelligence**", LLMs are not well suited, at least not without additional user support, to deliberate step by step reasoning. Rather, LLMs are, because of their design, well suited to jumping to conclusions.

---

## Hallucination[](http://54.173.133.152/lab/lab/tree/3-Prompting-With-Messages/34-Chain-of-Thought.ipynb#Hallucination)

This phenomenon of LLMs generating incorrect information, often with what appears like "confidence" to outside observers, is called **hallucination**. Because of their design, an LLM will usually say something incorrect (unbeknownst to the LLM itself) rather than say nothing at all. While it's true that LLMs over time are hallucinating less, and that over time they will continue to improve in this regard, hallucination is an inherent characteristic of LLM generation.

Regarding LLM hallucination, you need to commit the following golden rules to memory:

1. All LLMs hallucinate.
2. You are responsible for what your LLMs generate in your applications.

---

## Chain-of-Thought Prompting[](http://54.173.133.152/lab/lab/tree/3-Prompting-With-Messages/34-Chain-of-Thought.ipynb#Chain-of-Thought-Prompting)

Returning to the main subject matter of this notebook, while LLMs are not well-suited to long-form deliberate reasoning, there are techniques we can utilize to guide LLMs towards taking a more deliberate step by step approach when the task demands it. One such technique is call Chain-of-Thought

Introduced in 2023, [**Chain-of-Thought(CoT) prompting**](https://arxiv.org/pdf/2201.11903) is still one of the most popular prompting techniques. It supports complex reasoning capabilities by encouraging LLMs to break down complex problems into intermediate steps. CoT prompting involves providing examples that demonstrate step-by-step reasoning to solve a problem.

Here is the example from the paper that introduced CoT prompting.

![[Pasted image 20260901112406.png]]

As you can see in the right-hand-side example, by modeling for the LLM that it ought to break the complex task into smaller subtasks that it is more likely to be able to perform, the model is given "time to think" and can do better at tasks requiring complex reasoning.

---

## Chain-of-Though Multiplication[](http://54.173.133.152/lab/lab/tree/3-Prompting-With-Messages/34-Chain-of-Thought.ipynb#Chain-of-Though-Multiplication)

Let's try a CoT prompt for 3-digit long multiplication. We will start with an example multiplication prompt.

example_problem = 'What is 678 * 789?'

Next, we'll supply a chain-of-thought example of working through the problem step by step.

example_cot = '''\

Let me break this down into steps. First I'll break down 789 into hundreds, tens, and ones:

  

789 -> 700 + 80 + 9

  

Next I'll multiply 678 by each of these values, storing the intermediate results:

  

678 * 700 -> 678 * 7 * 100 -> 4746 * 100 -> 474600

  

My first intermediate result is 474600.

  

678 * 80 -> 678 * 8 * 10 -> 5424 * 10 -> 54240

  

My second intermediate result is 54240.

  

678 * 9 -> 6102

  

My third intermediate result is 6102.

  

My three intermediate results are 474600, 54240, and 6102.

  

Adding the first two intermediate results I get 474600 + 54240 -> 528840.

  

Adding 528840 to the last intermediate result I get 528840 + 6102 -> 534942

  

The final result is 534942.

'''

With our example problem and example CoT response, we can construct a one-shot prompt template.

multiplication_template = ChatPromptTemplate.from_messages([

('human', example_problem),

('ai', example_cot),

('human', '{long_multiplication_prompt}')

])

We'll now use this template in a simple chain.

multiplication_chain = multiplication_template | llm | StrOutputParser()

Let's revisit the original multiplication problem we tasked the LLM with to see if it does any better.

print(multiplication_chain.invoke(f'What is {expression1}?'))

# print(multiplication_chain.invoke(f'What is {expression2}?'))

# print(multiplication_chain.invoke(f'What is {expression2+"88888"}?'))

print(f"{expression1} = {eval(expression1)}")

print(f"{expression2} = {eval(expression2)}")

print(f"{expression2+'88888'} = {eval(expression2+'88888'):,}")

As you can see, the LLM followed the example in our CoT prompt, taking the problem step by step, and in this case, generated the correct response.

---

## Zero-shot Chain-of-Thought Prompting[](http://54.173.133.152/lab/lab/tree/3-Prompting-With-Messages/34-Chain-of-Thought.ipynb#Zero-shot-Chain-of-Thought-Prompting)

CoT prompting can get really verbose, and as we mentioned earlier, you shouldn't be shy about writing long prompts when needed to accomplish your goals.

That said, there are more elegant ways to leverage CoT methods with LLMs. One such variant is called [Zero-shot CoT](https://arxiv.org/abs/2205.11916). This prompting technique simply adds "Let's think step by step" to the prompt without supplying verbose CoT examples, and it has been shown to work quite well.

Let's construct a new prompt template to try Zero-shot CoT on long multiplication, following the example in the paper, simply supplying the language "Let's think step by step".

zero_shot_cot_prompt = ChatPromptTemplate([

("human", "{long_multiplication_prompt} Let's think step by step.")

])

zero_shot_multiplication_chain = zero_shot_cot_prompt | llm | StrOutputParser()

print(zero_shot_multiplication_chain.invoke(f'What is {expression1}?'))

# print(zero_shot_multiplication_chain.invoke(f'What is {expression2}?'))

# print(zero_shot_multiplication_chain.invoke(f'What is {expression2+"88888"}?'))

print(f"{expression1} = {eval(expression1):,}")

print(f"{expression2} = {eval(expression2):,}")

print(f"{expression2+'88888'} = {eval(expression2+'88888'):,}")

For our 3-digit long multiplication problem, simply prompting the model to think step by step performed as well as our more verbose CoT prompt.

---

## CoT Prompting In Practice[](http://54.173.133.152/lab/lab/tree/3-Prompting-With-Messages/34-Chain-of-Thought.ipynb#CoT-Prompting-In-Practice)

As with many other aspects of prompt engineering, especially given the variety of LLMs available (both now and in the future) it's difficult to give hard and fast rules about when and how exactly to employ CoT prompting. That said, we can offer you some good general guidelines to follow.

- Develop your prompts iteratively. Start simple, try zero-shot CoT when you think it might be helpful, and expand to use more verbose example-based CoT prompting when the need arises.
- Consider the use of external, non-LLM tools for tasks that LLMs may not be well-suited for (like math). We are going to look at tool use later in the workshop but the general idea is that LLMs are incredible, but not necessarily for every single task. Reflect if you will on the case of long multiplication about how fast, reliable, and effective simple Python is. Don't fall into the old adage _"If all you have is a hammer, everything looks like a nail."_ LLMs are only one of your many tools to use while building LLM-based applications.

---

## Exercise: Use an LLM to Solve a Word Problem[](http://54.173.133.152/lab/lab/tree/3-Prompting-With-Messages/34-Chain-of-Thought.ipynb#Exercise:-Use-an-LLM-to-Solve-a-Word-Problem)

For this exercise, use what you've learned in this notebook to a correct response back from our LLM to the following word problem.

word_problem = (

"Michael's car travels at 40 miles per hour. He is driving from 1 PM to 4 PM"

"and then travels back at a rate of 25 miles per hour due to heavy traffic."

" How long in terms of minutes did it take him to get back?"

)

Before beginning your work, here is the actual solution to the word problem.

> Michael drove 40 miles per hour for 3 hours, which means he drove 120 miles.
> 
> To come back at a rate of 25 miles per hour, it would have taken him 4.8 hours (120 miles / 25 mph) which is equivalent to **288** minutes (4.8 hours * 60 minutes/hour).
> 
> The correct answer is **288**.

Feel free to check out the _Solution_ below if you get stuck.

### Your Work Here[](http://54.173.133.152/lab/lab/tree/3-Prompting-With-Messages/34-Chain-of-Thought.ipynb#Your-Work-Here)

  

### Solution[](http://54.173.133.152/lab/lab/tree/3-Prompting-With-Messages/34-Chain-of-Thought.ipynb#Solution)

5 cells hidden

## Summary[](http://54.173.133.152/lab/lab/tree/3-Prompting-With-Messages/34-Chain-of-Thought.ipynb#Summary)

In this notebook, you experienced LLM hallucination, reflected on your models' natural inclinations to jump to conclusions, and learned several Chain-of-Thought prompting techniques to assist LLMs in performing tasks requiring step by step reasoning.

In the next notebook, you are going to learn how to make a chatbot using the prompt engineering techniques you now have at your disposal.

---

Continue the unified course path

**Next step:** Open `3-Prompting-With-Messages/35-Reasoning-Models.ipynb` next: **Reasoning Models**.

**Before moving on:** Save one task where explicit reasoning helped, because the next notebook asks whether a reasoning-specialized model changes that tradeoff enough to justify the extra cost.

Click to add a cell.