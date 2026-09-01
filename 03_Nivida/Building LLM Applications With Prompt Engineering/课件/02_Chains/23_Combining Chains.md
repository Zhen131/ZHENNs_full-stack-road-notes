In this notebook you'll learn how to compose multiple LLM-related chains.

---

## Objectives[](http://54.173.133.152/lab/lab/tree/2-Chains/23-Combining-Chains.ipynb#Objectives)

By the time you complete this notebook you will:

- Learn how to compose chains of chains
- Apply your ability to chain meaningful language tasks.

---

## Imports[](http://54.173.133.152/lab/lab/tree/2-Chains/23-Combining-Chains.ipynb#Imports)

import os

from langchain_nvidia_ai_endpoints import ChatNVIDIA

from langchain_core.prompts import ChatPromptTemplate

from langchain_core.output_parsers import StrOutputParser

from langchain_core.runnables import RunnableLambda, RunnableParallel

---

## Create a Model Instance[](http://54.173.133.152/lab/lab/tree/2-Chains/23-Combining-Chains.ipynb#Create-a-Model-Instance)

base_url = os.getenv("NVIDIA_BASE_URL")

model = 'meta/llama-3.2-11b-vision-instruct'

llm = ChatNVIDIA(base_url=base_url, model=model, temperature=0)

---

## Combining Multiple LLM Chains[](http://54.173.133.152/lab/lab/tree/2-Chains/23-Combining-Chains.ipynb#Combining-Multiple-LLM-Chains)

If you recall, runnables can be composed into chains, but also, chains are themselves runnables. Therefore, chains can be used to compose larger chains.

It's easy to imagine tasks we would like to perform that would require multiple calls to an LLM for the desired end result. We'll begin our exploration of chaining chains with such a scenario, where we will compose multiple LLM chains, piping the output of one chain into the next.

To do this we are going to work with the following list of `thesis_statements`. Note: any typos you see in the thesis statements are intentional.

thesis_statements = [

"The fundametal concepts quantum physcis are difficult to graps, even for the mostly advanced students.",

"Einstein's theroy of relativity revolutionised undrstanding of space and time, making it clear that they are interconnected.",

"The first law of thermodynmics states that energy cannot be created or destoryed, excepting only transformed from one form to another.",

"Electromagnetism is one of they four funadmental forces of nature, and it describes the interaction between charged particles.",

"In the study of mechanic, Newton's laws of motion provide a comprehensive framework for understading the movement of objects under various forces."

]

Our goal is going to be to expand each of these thesis statements into a well-written paragraph, with the thesis statement itself being the first paragraph. You may have noticed, however, that each of these thesis statements contains spelling and/or grammar errors that need correcting.

Therefore, we are going to create a chain first to address the spelling and grammar issues, and then chain the corrected thesis statements into a second LLM chain responsible for generating the full paragraphs.

---

## Exercise: Create a Spelling and Grammar Chain[](http://54.173.133.152/lab/lab/tree/2-Chains/23-Combining-Chains.ipynb#Exercise:-Create-a-Spelling-and-Grammar-Chain)

To begin, create `grammar_chain` which returns its inputs after performing spelling and grammar corrections on them.

We already have an LLM instance defined above (`llm`), but you will need to create both a prompt template and output parser to include in your chain.

You may need to develop your prompt template iteratively. Make sure especially that the chain returns only the corrected text, and not any additional comments etc. from the model.

Test your chain by sending it the batch of `thesis_statements` defined above.

Check out the solution below if you get stuck.

### Your Work Here[](http://54.173.133.152/lab/lab/tree/2-Chains/23-Combining-Chains.ipynb#Your-Work-Here)

grammar_chain = 'TODO' # TODO: grammar_chain should return its inputs after performing spelling and grammar on them.

### Solution[](http://54.173.133.152/lab/lab/tree/2-Chains/23-Combining-Chains.ipynb#Solution)

11 cells hidden

## Exercise: Create a Paragraph Generator Chain[](http://54.173.133.152/lab/lab/tree/2-Chains/23-Combining-Chains.ipynb#Exercise:-Create-a-Paragraph-Generator-Chain)

Create a second chain called `paragraph_generator_chain`. Given a sentence as input, it should use that sentence as the first sentence of a paragraph which it should generate.

**Note:** this chain should not contain any grammar or spell checking functionality. The chain should be responsible only for the paragraph generation task.

Test your chain by sending it the batch of `thesis_statements` defined above.

Feel free to check out the _Solution_ below if you get stuck.

### Your Work Here[](http://54.173.133.152/lab/lab/tree/2-Chains/23-Combining-Chains.ipynb#Your-Work-Here)

paragraph_generator_chain = 'TODO'

### Solution[](http://54.173.133.152/lab/lab/tree/2-Chains/23-Combining-Chains.ipynb#Solution)

9 cells hidden

## Exercise: Create a Chain of Chains[](http://54.173.133.152/lab/lab/tree/2-Chains/23-Combining-Chains.ipynb#Exercise:-Create-a-Chain-of-Chains)

Reusing the chains you've already created, create a `corrected_generator_chain` that uses the LLM first to perform spelling and grammar corrections on `thesis_statements` before then generating full paragraphs based the (corrected) thesis statements.

You don't need to overthink this. Just remember, chains are runnables, and can be piped together just like any other runnable.

Test your chain by sending it the batch of `thesis_statements` defined above.

Feel free to check out the _Solution_ below if you get stuck.

### Your Work Here[](http://54.173.133.152/lab/lab/tree/2-Chains/23-Combining-Chains.ipynb#Your-Work-Here)

  

### Solution[](http://54.173.133.152/lab/lab/tree/2-Chains/23-Combining-Chains.ipynb#Solution)

9 cells hidden

## Summary[](http://54.173.133.152/lab/lab/tree/2-Chains/23-Combining-Chains.ipynb#Summary)

In this notebook you learned to treat chains as the runnable they are and combine them together, including in ways that allowed you to leverage LLMs multiple times to accomplish a desired task.

In the next notebook you'll continue on the theme of chain composition, but this time focusing on the ability to create and utilize parallel chains.

---

Continue the unified course path

**Next step:** Open `2-Chains/24-Parallel-Chains.ipynb` next: **Parallel Chains**.

**Before moving on:** Keep one intermediate output that became the next chain input, because the next notebook asks which of those steps can safely branch and run at the same time.

Click to add a cell.