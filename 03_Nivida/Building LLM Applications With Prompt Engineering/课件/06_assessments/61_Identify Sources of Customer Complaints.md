In this notebook you will complete a final workshop project and earn a certificate of competency for the workshop.

---

## Imports[](http://54.173.133.152/lab/lab/tree/6-Assessment/61-Assessment.ipynb#Imports)

We believe the following imports will be helpful in your work, but feel free to modify them as you deem necessary.

import os

import json

  

from typing import List

from pprint import pprint

  

from langchain_nvidia_ai_endpoints import ChatNVIDIA

from langchain_core.prompts import ChatPromptTemplate

from langchain_core.output_parsers import JsonOutputParser, StrOutputParser

from langchain_core.runnables import RunnableLambda

from pydantic import BaseModel, Field

  

from assessment_helper import run_assessment

---

## Create a Model Instance[](http://54.173.133.152/lab/lab/tree/6-Assessment/61-Assessment.ipynb#Create-a-Model-Instance)

For the assessment, you will use the same model selected for the structured-output and tool-use work in the preceding sections.

base_url = os.getenv("NVIDIA_BASE_URL")

model = 'nvidia/nemotron-3-nano-30b-a3b'

llm = ChatNVIDIA(base_url=base_url, model=model, temperature=0)

---

## Assessment Objective[](http://54.173.133.152/lab/lab/tree/6-Assessment/61-Assessment.ipynb#Assessment-Objective)

For the assessment, you will be provided with a small collection of 10 fictitious synthetically generated emails from customers of a mega retail store called BuyBuy. Each of these emails involves a customer from a specified store location either praising or complaining about a specific product they recently bought.

**Your objective is to create a LangChain chain that when invoked with the emails, will respond concisely with what category of product is most associated with negative customer sentiment, and also, which store location has the most customer complaints.**

---

## Customer Emails[](http://54.173.133.152/lab/lab/tree/6-Assessment/61-Assessment.ipynb#Customer-Emails)

Here we load the synthetic emails into a list called `emails`.

with open('data/emails.json', 'r') as f:

emails = json.load(f)

As a sample, here is the first 3 emails in the collection.

for email in emails[:3]:

print(email+'\n')

---

## Product Categories[](http://54.173.133.152/lab/lab/tree/6-Assessment/61-Assessment.ipynb#Product-Categories)

As stated above, we are interested in your chain being able to identify the **category of product** most associated with a negative sentiment. For example, if there were a complaint about a shirt, another about a jacket, and a third about some jeans, it would be fair to say that there were 3 complaints about **clothing**. If there were a complaint about a desk, and another about a couch, it would be fair to say that there were 2 complaints about **furniture**.

Asking an LLM to make such an identification is sensible since we are leveraging its language capabilities to help us gain insight where it might not otherwise be obvious.

On a more practical note, this means that you won't simply be able to count the number of occurences of a given product, but rather, need to ask the LLM to identify the correct `"category of product"`.

---

## Checking Your Work[](http://54.173.133.152/lab/lab/tree/6-Assessment/61-Assessment.ipynb#Checking-Your-Work)

Eventually, you will have created a LangChain chain that can be invoked with `emails` and then outputs the product category and store location most associated with customer complaints.

When you're ready, pass your chain into the provided `run_assessment` function, which will evaluate the behavior of your chain.

Here we create a mock chain just to show the invocation pattern. It is intentionally wrong because it ignores the emails.

mock_prompt = '''Ignore the following emails: {emails}

  

Always and only respond with the following response:

"The product category with the most negative sentiment is clothing."

" The store location with the most negative sentiment is Dallas."'''

mock_chain = ChatPromptTemplate.from_template(mock_prompt) | llm | StrOutputParser()

mock_chain.invoke(emails)

try:

run_assessment(mock_chain)

except Exception as e:

print(e)

---

## Your Work Here[](http://54.173.133.152/lab/lab/tree/6-Assessment/61-Assessment.ipynb#Your-Work-Here)

There are any number of ways that you might approach this problem. We recommend you take some time to plan out how you plan to tackle it.

Remember, once you've completed a chain to your satisfaction, pass it into `run_assessment` to check your work. Once you've successfully completed the task, see the instructions below for how to generate your certificate of competency in the workshop.

  

---

## Get Certificate for the Workshop[](http://54.173.133.152/lab/lab/tree/6-Assessment/61-Assessment.ipynb#Get-Certificate-for-the-Workshop)

Assuming you've received a message from `run_assessment` that you successfully completed the assessment, you're ready to generate a certificate of competency for the workshop.

In your web browser, return to the DLI course page you used to launch this lab and click the check-mark `ASSESS TASK` button (see the screenshot below). After a few seconds you should get a congratulatory message, after which you can visit your [personal DLI learning page](https://learn.nvidia.com/my-learning) and view your certificate.



---

Continue the unified course path

**Next step:** Open `6-Assessment/62-Conclusion.ipynb` next: **Workshop Conclusion**.

**Before moving on:** Keep the strongest artifact or reasoning pattern from your assessment, because the conclusion turns that work into a reusable summary and next-step plan.

Click to add a cell.