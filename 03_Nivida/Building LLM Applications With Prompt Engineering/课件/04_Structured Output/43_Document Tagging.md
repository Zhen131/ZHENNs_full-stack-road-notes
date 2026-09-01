In this notebook you'll extend your structured-output skill set to long-form text. The model can usually return clean JSON; the harder part is deciding what evidence belongs in each field, what to omit, and how to represent uncertainty.

![[Pasted image 20260901113229.png]]

---

## Objectives[](http://54.173.133.152/lab/lab/tree/4-Structured-Output/43-Document-Tagging.ipynb#Objectives)

By the time you complete this notebook you will:

- Be able to construct Pydantic classes that represent collections of other Pydantic classes.
- Perform extraction and tagging against long-form text.

---

## Imports[](http://54.173.133.152/lab/lab/tree/4-Structured-Output/43-Document-Tagging.ipynb#Imports)

import os

from typing import List

from pprint import pprint

  

from langchain_nvidia_ai_endpoints import ChatNVIDIA

from langchain_core.prompts import ChatPromptTemplate

from pydantic import BaseModel, Field

---

## Create a Model Instance[](http://54.173.133.152/lab/lab/tree/4-Structured-Output/43-Document-Tagging.ipynb#Create-a-Model-Instance)

base_url = os.getenv("NVIDIA_BASE_URL")

model = 'nvidia/nemotron-3-nano-30b-a3b'

llm = ChatNVIDIA(base_url=base_url, model=model, temperature=0)

---

## Document Tagging[](http://54.173.133.152/lab/lab/tree/4-Structured-Output/43-Document-Tagging.ipynb#Document-Tagging)

The previous notebook introduced `with_structured_output`, which lets a Pydantic schema guide generation and validate the result. Here the same interface handles extraction and tagging. The new limitation is not JSON syntax; it is evidence selection. A long document can mention many possible entities, aliases, dates, and partial facts, and your schema decides which of those are worth carrying forward.

To learn the technique, let's assume that we want to extract the name of any piece of fruit mentioned in a piece of text. We'll begin, as in the previous notebook, by defining a schema and binding it to the model with `with_structured_output`. We can then compose that model with a prompt that supplies the text to inspect.

class Fruit(BaseModel):

"""The name of a piece of fruit."""

  

name: str = Field(description="The name of the piece of fruit")

structured_llm = llm.with_structured_output(Fruit)

Fruit.model_json_schema()

template = ChatPromptTemplate.from_messages([

("system", "Extract the requested structured data from the user input."),

("human", "Input: {input}")

])

chain = template | structured_llm

chain

And now we do something slightly different than what we did in the previous notebook. Instead of providing a single entity meant to be transformed into a structured data entity, we provide free form text.

Given the simplicity of the following statement, however, it should come as no surprise that our chain is well-capable to identify and capture the single piece of fruit mentioned.

chain.invoke({"input": "An apple fell from the tree."})

---

## Lists of Structured Data[](http://54.173.133.152/lab/lab/tree/4-Structured-Output/43-Document-Tagging.ipynb#Lists-of-Structured-Data)

When it comes to extracting and tagging multiple data entities out of free form text, we're still missing a key ingredient. We need to be able to specify that, rather than capture a single data type for a piece of given text, we wish to extract a **list** of some defined entity.

Using Pydantic, along with Python's `typing.List`, this is rather straightforward: we create a new Pydantic class, with a helpful docstring, that is comprised of a `List` of a another Pydantic class.

from typing import List

class Fruits(BaseModel):

"""The names of fruits"""

fruits: List[Fruit]

With the list-bearing `Fruits` class now at our disposal, we can bind the new schema and construct the chain as usual.

structured_llm = llm.with_structured_output(Fruits)

Fruits.model_json_schema()

chain = template | structured_llm

chain

But now when we pass a longer piece of text containing multiple pieces of fruit, we can see we are able to extract and tag them all.

chain.invoke({"input": "An apple fell from the tree. It hit the ground right next to a banana peel."})

---

## Exercise: Do Document Tagging for Apollo Story[](http://54.173.133.152/lab/lab/tree/4-Structured-Output/43-Document-Tagging.ipynb#Exercise:-Do-Document-Tagging-for-Apollo-Story)

Below is an account of the Apollo 11 landing. Your goal for this exercise is to extract and tag several entities from within the account.

Specifically, you should extract and tag the following:

- Details about the entire landing which will include
    - A list of any crew members mentioned in the account. For each crew member you should capture their:
        - name
        - role during the mission
    - A list of parts and modules belonging to any spacecraft mentioned in the account. For each part of a spacecraft extracted you should capture its:
        - name
        - the specific part or module of the spacecraft that it is
    - A list of any significant quotes made during the account. For each significant quote you should extract and tag:
        - the quote itself
        - The name of the speaker of the quote

Feel free to jump right in if you'd like. If you prefer, you can also expand the _Walkthrough_ section below for step by step guidance on this exercise.

apollo_story = """

On July 20, 1969, Apollo 11, the first manned mission to land on the Moon, successfully touched down in the Sea of Tranquility. \

The crew consisted of Neil Armstrong, who served as the mission commander, \

Edwin 'Buzz' Aldrin, the lunar module pilot, and Michael Collins, the command module pilot.

  

The spacecraft consisted of two main parts: the command module Columbia and the lunar module Eagle. \

As Armstrong stepped onto the lunar surface, he famously declared, "That's one small step for man, one giant leap for mankind."

  

Buzz Aldrin also descended onto the Moon's surface, where he and Armstrong conducted experiments and collected samples. \

Michael Collins remained in lunar orbit aboard Columbia, ensuring the successful return of his fellow astronauts.

  

The mission was a pivotal moment in space exploration and remains a significant achievement in human history.

"""

### Your Work Here[](http://54.173.133.152/lab/lab/tree/4-Structured-Output/43-Document-Tagging.ipynb#Your-Work-Here)

  

---

## Walkthrough[](http://54.173.133.152/lab/lab/tree/4-Structured-Output/43-Document-Tagging.ipynb#Walkthrough)

### Define Crew Member Details[](http://54.173.133.152/lab/lab/tree/4-Structured-Output/43-Document-Tagging.ipynb#Define-Crew-Member-Details)

Following the guidelines above, create a class that represents the details of a given crew member.

Feel free to check out the Solution below if you get stuck.

### Your Work Here[](http://54.173.133.152/lab/lab/tree/4-Structured-Output/43-Document-Tagging.ipynb#Your-Work-Here)

  

### Solution[](http://54.173.133.152/lab/lab/tree/4-Structured-Output/43-Document-Tagging.ipynb#Solution)

1 cell hidden

### Define Spacecraft Details[](http://54.173.133.152/lab/lab/tree/4-Structured-Output/43-Document-Tagging.ipynb#Define-Spacecraft-Details)

Following the guidelines above, create a class that represents the details of the spacecraft mentioned in the account.

Feel free to check out the Solution below if you get stuck.

### Your Work Here[](http://54.173.133.152/lab/lab/tree/4-Structured-Output/43-Document-Tagging.ipynb#Your-Work-Here)

  

### Solution[](http://54.173.133.152/lab/lab/tree/4-Structured-Output/43-Document-Tagging.ipynb#Solution)

1 cell hidden

### Define Significant Quotes[](http://54.173.133.152/lab/lab/tree/4-Structured-Output/43-Document-Tagging.ipynb#Define-Significant-Quotes)

Following the guidelines above, create a class that represents the details any significant quote made in the account.

Feel free to check out the Solution below if you get stuck.

### Your Work Here[](http://54.173.133.152/lab/lab/tree/4-Structured-Output/43-Document-Tagging.ipynb#Your-Work-Here)

  

### Solution[](http://54.173.133.152/lab/lab/tree/4-Structured-Output/43-Document-Tagging.ipynb#Solution)

1 cell hidden

### Define Combined Details About the Entire Landing[](http://54.173.133.152/lab/lab/tree/4-Structured-Output/43-Document-Tagging.ipynb#Define-Combined-Details-About-the-Entire-Landing)

Create a class for the combined details of the Apollo 11 mission. It should contains lists of the other 3 classes you created above.

Feel free to check out the Solution below if you get stuck.

### Your Work Here[](http://54.173.133.152/lab/lab/tree/4-Structured-Output/43-Document-Tagging.ipynb#Your-Work-Here)

  

### Solution[](http://54.173.133.152/lab/lab/tree/4-Structured-Output/43-Document-Tagging.ipynb#Solution)

1 cell hidden

### Create the Extraction Chain[](http://54.173.133.152/lab/lab/tree/4-Structured-Output/43-Document-Tagging.ipynb#Create-the-Extraction-Chain)

With all the data classes well defined, now it's time to bind `Apollo11Details` with `with_structured_output` and create the extraction chain.

Feel free to check out the Solution below if you get stuck.

### Your Work Here[](http://54.173.133.152/lab/lab/tree/4-Structured-Output/43-Document-Tagging.ipynb#Your-Work-Here)

  

### Solution[](http://54.173.133.152/lab/lab/tree/4-Structured-Output/43-Document-Tagging.ipynb#Solution)

1 cell hidden

### Invoke the Extraction Chain[](http://54.173.133.152/lab/lab/tree/4-Structured-Output/43-Document-Tagging.ipynb#Invoke-the-Extraction-Chain)

All that's left to do now is invoke your chain with the apollo_story account above.

Feel free to check out the Solution below if you get stuck.

### Your Work Here[](http://54.173.133.152/lab/lab/tree/4-Structured-Output/43-Document-Tagging.ipynb#Your-Work-Here)

  

### Solution[](http://54.173.133.152/lab/lab/tree/4-Structured-Output/43-Document-Tagging.ipynb#Solution)

3 cells hidden

## Summary[](http://54.173.133.152/lab/lab/tree/4-Structured-Output/43-Document-Tagging.ipynb#Summary)

This notebook concludes this section on structured data generation, which we hope you'll agree is a powerful tool with a great number of applications.

Related to their ability to generate structured data, LLMs can generate structured data intended to indicate when and how an application ought to invoke (potentially) non-LLM-related functionality. We call this technique tool use, and in the next section you'll learn how to create tools, and integrate their use with LLM interactions via agents.

---

Continue the unified course path

**Next step:** Open `5-Tools/50-Section-Introduction.ipynb` next: **Section 5: Tool Use and Agents**.

**Before moving on:** Keep one structured field that could trigger an action, since the next section shows how model output can call tools instead of only producing text.

Click to add a cell.