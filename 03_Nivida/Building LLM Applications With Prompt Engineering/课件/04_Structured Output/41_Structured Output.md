In this notebook you will use the model's strong JSON generation as a starting point, then inspect the more useful question: whether the JSON is dependable enough for downstream code.

![[Pasted image 20260901113048.png]]

---

## Objectives[](http://54.173.133.152/lab/lab/tree/4-Structured-Output/41-Structured-Output.ipynb#Objectives)

By the time you complete this notebook you will:

- Prompt the model to generate structured JSON.
- Parse model output into Python objects.
- Check whether valid JSON also satisfies a minimal application contract.
- Use the chat model to batch process inputs into structured data.

---

## Imports[](http://54.173.133.152/lab/lab/tree/4-Structured-Output/41-Structured-Output.ipynb#Imports)

import os

from langchain_nvidia_ai_endpoints import ChatNVIDIA

from langchain_core.prompts import ChatPromptTemplate

from langchain_core.output_parsers import StrOutputParser, SimpleJsonOutputParser

from langchain_core.runnables import RunnableLambda

from IPython.display import display, JSON

import json

---

## Create a Model Instance[](http://54.173.133.152/lab/lab/tree/4-Structured-Output/41-Structured-Output.ipynb#Create-a-Model-Instance)

base_url = os.getenv("NVIDIA_BASE_URL")

model = 'nvidia/nemotron-3-nano-30b-a3b'

llm = ChatNVIDIA(base_url=base_url, model=model, temperature=0)

---

## LLMs and Highly Structured Data Formats[](http://54.173.133.152/lab/lab/tree/4-Structured-Output/41-Structured-Output.ipynb#LLMs-and-Highly-Structured-Data-Formats)

A very common task we would like LLMs to perform is to generate outputs in a highly structured format. These formats could be as common as JSON, or a Python list, or some custom structure unique to our needs like a custom report or document structure, just to name a few examples.

Modern models are often quite good at this. In fact, the model used here can usually produce valid JSON from a simple instruction. That changes the lesson a bit: the limitation is less often _can the model write braces correctly?_ and more often _did it create the exact object your application needs?_

Let's start with JSON, then add small checks that separate syntactic success from a reliable contract.

---

## A Simple JSON Object[](http://54.173.133.152/lab/lab/tree/4-Structured-Output/41-Structured-Output.ipynb#A-Simple-JSON-Object)

In the spirit of iterative prompt development, let's start simply by engineering a prompt instructing the model to construct a JSON object. For our example we'll ask the model to create a simple JSON object representing details about the city of Santa Clara.

prompt = "Make a JSON object representing the city Santa Clara."

result = llm.invoke(prompt).content

print(result)

Based on our primpting, this is probably pretty good! However, the systems we want to interface with may have specific assumptions:

def check_contract(result: str | dict, required_fields: set):

## Let's first see if it even properly generated a JSON output

parsed_json = result

if isinstance(result, str):

try:

parsed_json = json.loads(result)

except Exception as e:

print(f"[CONTRACT FAILURE] Error parsing results via json.loads: {e}")

parsed_json = {}

  

## Then, let's see if it has the required fields

observed_fields = set(parsed_json)

contract_check = {

"valid_json": bool(parsed_json),

"missing_fields": sorted(required_fields - observed_fields),

"extra_fields": sorted(observed_fields - required_fields),

}

return contract_check

  

## Let's first see if it even properly worked.

check_contract(result, {"name", "country", "fun_facts"})

You may get back clean JSON immediately. That is good news, but it is not the finish line.

Look at the contract check above. The object can parse successfully and still be awkward for downstream code: the model may choose a field like `city` instead of `name`, add useful-but-unrequested fields, or omit a field the next component expects. The next prompt narrows the request so the model has less freedom to invent the record shape. However, it still could fail in theory...

prompt = '''\

Make a JSON object representing the city Santa Clara. \

It should have fields for:

- The name of the city.

- The country the city is located in.

- Short fun facts about the city.

Only return the JSON block. Never return non-JSON text.'''

result = llm.invoke(prompt).content

print(result)

check_contract(result, {"name", "country", "fun_facts"})

This is getting closer. One more instruction makes the output safer for parsers if a model decides to wrap the JSON in Markdown backticks.

prompt = '''\

Make a JSON object representing the city Santa Clara. \

It should have fields for:

- The name of the city

- The country the city is located in.

- Short fun facts about the city.

Only return the JSON. Never return non-JSON text, including backtick wrappers around the JSON.'''

result = llm.invoke(prompt).content

print(result)

check_contract(result, {"name", "country", "fun_facts"})

And hopefully, there you go (and if not, there is probably a small amount of extra code or prompt notes you could bring in to make it work)

---

## Make a Template Out of the Prompt[](http://54.173.133.152/lab/lab/tree/4-Structured-Output/41-Structured-Output.ipynb#Make-a-Template-Out-of-the-Prompt)

Next let's convert our prompt to be a prompt template so we can parameterize the city name.

json_city_template = ChatPromptTemplate.from_template('''\

Make a JSON object representing the city {city_name}. \

It should have fields for:

- The name of the city

- The country the city is located in.

- Short fun facts about the city.

Only return the JSON. Never return non-JSON text, including backtick wrappers around the JSON.''')

Next we'll compose a simple chain.

parser = StrOutputParser()

chain = json_city_template | llm | parser

print(chain.invoke({'city_name': 'Santa Clara'}))

This also looks good.

---

## Simple JSON Parsing[](http://54.173.133.152/lab/lab/tree/4-Structured-Output/41-Structured-Output.ipynb#Simple-JSON-Parsing)

To confirm that we can load the JSON object as a Python dict, we can use a custom runnable to parse the model response directly to a Python dict.

parse_to_dict = RunnableLambda(lambda response: json.loads(response.content))

We'll re-compose our chain to use this custom parser.

# chain = json_city_template | llm | parser | json.loads ## Equivalent

chain = json_city_template | llm | parse_to_dict

chain.invoke({'city_name': 'Santa Clara'})

This appears to work great because the response is valid JSON. Before trusting it in an application, though, remember what the parser has and has not checked: it checked syntax, but it did not check whether the object contains the right fields, whether the field names are stable, or whether the generated facts are acceptable for your use case.

As a small improvement, rather than creating our own parser, LangChain provides `SimpleJsonOutputParser` for just this use case. Let's reconstruct our chain using it.

from langchain_core.output_parsers import SimpleJsonOutputParser

json_parser = SimpleJsonOutputParser()

chain = json_city_template | llm | json_parser

chain.invoke({'city_name': 'Santa Clara'})

---

## Batch on Multiple Inputs[](http://54.173.133.152/lab/lab/tree/4-Structured-Output/41-Structured-Output.ipynb#Batch-on-Multiple-Inputs)

So far so good, but continuing in the spirit of iterative prompt development, now let's try our chain on several different inputs.

city_names = [

{'city_name': 'Santa Clara'},

{'city_name': 'New Orleans'},

{'city_name': 'Busan'},

{'city_name': 'Cairo'},

{'city_name': 'Perth'}

]

city_details = chain.batch(city_names)

Now check the outputs as application records, not just JSON blobs. This tiny report asks whether every row has the fields the next step expects.

required_city_fields = {"name", "country", "fun_facts"}

city_contract_report = []

  

for city_name, row in zip(city_names, city_details):

city_contract_report.append(check_contract(row, required_city_fields))

  

city_contract_report

city_details

for city in city_details:

print("\nCity:", city['name'])

print("Country:", city['country'])

print("Fun Facts:")

fun_vals = [val for key, val in city.items() if "fun" in key.lower()]

if fun_vals:

for fact in fun_vals[0]:

print(f" - {fact}")

---

## Structure and Generation[](http://54.173.133.152/lab/lab/tree/4-Structured-Output/41-Structured-Output.ipynb#Structure-and-Generation)

This may be obvious based on our prior use of LLMs, but it's worth highlighting: not only are we using the LLM as a means to structure data that we provide it, but we are combining this with its generative capabilities to pull from its training distribution and infer general transferable properties.

In the example we just worked through our input data was the name of a city, which we wanted structured into JSON. But more than just structuring the information we provided (the name of the city) we used the generative capabilities of the model to extend the structured data with the country that the city is located in, which we did not provide ourselves.

Generating structured output/data that has been augmented with the generative capacity of an LLM is tremendously powerful.

---

## Exercise: Generate a List of Book Details[](http://54.173.133.152/lab/lab/tree/4-Structured-Output/41-Structured-Output.ipynb#Exercise:-Generate-a-List-of-Book-Details)

Using the techniques you've learned thus far, generate a python list containing dictionaries that each contain details about the following books.

Each dict should have the book's title, author, and year of original publication.

Feel free to check out the _Solution_ below if you get stuck.

sci_fi_books = [

{"book_title": "Dune"},

{"book_title": "Neuromancer"},

{"book_title": "Snow Crash"},

{"book_title": "The Left Hand of Darkness"},

{"book_title": "Foundation"}

]

### Your Work Here[](http://54.173.133.152/lab/lab/tree/4-Structured-Output/41-Structured-Output.ipynb#Your-Work-Here)

  

### Solution[](http://54.173.133.152/lab/lab/tree/4-Structured-Output/41-Structured-Output.ipynb#Solution)

4 cells hidden

## Summary[](http://54.173.133.152/lab/lab/tree/4-Structured-Output/41-Structured-Output.ipynb#Summary)

In this notebook you began approaching the technique of LLMs generating structured output. In the next notebook you're going to drastically increase your capabilities in this arena by using Pydantic classes and LangChain's JsonOutputParser.

---

Continue the unified course path

**Next step:** Open `4-Structured-Output/42-Pydantic.ipynb` next: **Structured Output with Pydantic**.

**Before moving on:** Keep one output schema you care about, so the next notebook can show how typed validation tightens the contract around it.