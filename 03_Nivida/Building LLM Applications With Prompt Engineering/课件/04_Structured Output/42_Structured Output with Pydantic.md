In this notebook you will use Pydantic and LangChain's `JsonOutputParser` to upgrade from "the model returned JSON" to "the output satisfies a typed contract."

![[Pasted image 20260901113149.png]]

---

## Objectives[](http://54.173.133.152/lab/lab/tree/4-Structured-Output/42-Pydantic.ipynb#Objectives)

By the time you complete this notebook you will:

- Understand the limitations of our current approach to generating structured data.
- Learn to create class-driven schemas for structured data generation using Pydantic.

---

## Imports[](http://54.173.133.152/lab/lab/tree/4-Structured-Output/42-Pydantic.ipynb#Imports)

import os

from langchain_nvidia_ai_endpoints import ChatNVIDIA

from langchain_core.prompts import ChatPromptTemplate

from langchain_core.output_parsers import StrOutputParser, JsonOutputParser

from langchain_core.runnables import RunnableLambda

from pydantic import BaseModel, Field

---

## Create a Model Instance[](http://54.173.133.152/lab/lab/tree/4-Structured-Output/42-Pydantic.ipynb#Create-a-Model-Instance)

base_url = os.getenv("NVIDIA_BASE_URL")

model = 'nvidia/nemotron-3-nano-30b-a3b'

llm = ChatNVIDIA(base_url=base_url, model=model, temperature=0)

---

## Limitations of JSON-Only Structured Output[](http://54.173.133.152/lab/lab/tree/4-Structured-Output/42-Pydantic.ipynb#Limitations-of-JSON-Only-Structured-Output)

You likely found some success in the previous exercise, but let us offer our outputs to demonstrate how successful the JSON generation was. Needless to say, it was pretty successful in at least making the outputs valid for our parser (probably because of copious amounts of training examples and strong interest from the model developers). The useful limitation to focus on is that plain JSON instructions do not create a stable interface by themselves: a field can be missing, renamed, loosely typed, or semantically too vague for the next component.

Start from the same book prompt, then replace informal field requests with an explicit schema.

book_template = ChatPromptTemplate.from_template('''\

Make a JSON object representing the details of the following book: {book_title}. \

It should have fields for:

- The title of the book.

- The author of the book.

- The year the book was originally published.

- The aggregate score for the book.

  

Only return the JSON. Never return non-JSON text, including backtick wrappers around the JSON.''')

Using this template, our solution implementation generated the following list of book details:

```python
[{'title': 'Dune', 'author': 'Frank Herbert', 'yearPublished': 1965, 'aggregateScore': 8.2},
 {'title': 'Neuromancer', 'author': 'William Gibson', 'year': 1984, 'aggregate_score': 8.5},
 {'title': 'Snow Crash', 'author': 'Neal Stephenson', 'year': 1992, 'aggregate_score': 8.5},
 {'title': 'The Left Hand of Darkness', 'author': 'Ursula K. Le Guin', 'year': 1969, 'aggregate_score': 8.5},
 {'title': 'Foundation', 'author': 'Isaac Asimov', 'yearPublished': 1951, 'aggregateScore': 4.2}]
```

The result was well-formatted, but looking more carefully at it, we can see it has some issues:

- The key names are not consistent for all values, for example, `'year'`, and `'yearPublished'`.
- The score doesn't seem to be properly normalized, and we're not even sure where it came from.

At this point in the workshop, knowing what you already do, you're probably already full of ideas about how to address each of these. Perhaps the following ideas come to mind:

- Be more specific in our prompt about the names of the keys, the types of the values, and what to do when the LLM can't generate data for a field.
- Try including a system message to more strongly reinforce how we want the LLM to generate responses.
- Provide few-shot examples to help the model understand all the specifics of what it should and shouldn't do.

**If you're thinking along these lines, that's really fantastic, and you're correct about approaching the problem this way.**

But let's consider some of the ways that our task might get even more complicated:

- What if we wanted to templatize more of the prompt, for example, which fields to include?
- What if our data structure gets far more complicated?
- Since we are generating data, what if we wanted to capture a definition of our data type for use elsewhere?

Again, knowing what you already know, you can likely think of viable ways to accomplish each of these despite the likely complexity of the implementation. Luckily for us, LangChain ships with a variety of tools to help us accomplish generating structured data, and using them will greatly simplify our application code and allow us to perform more complicated structured data generation tasks more easily.

---

## Structured Data as a Class[](http://54.173.133.152/lab/lab/tree/4-Structured-Output/42-Pydantic.ipynb#Structured-Data-as-a-Class)

Even before we get to LangChain-specific tools to help us generate structured data, let's take a step back and think about how we might articulate a data structure in Python if we weren't working in the context of LLMs. One very sensible approach would be to create a Python class.

Here we define a `Book` class that captures what we hoped to describe in our prompt template above.

class Book:

"""Information about a book."""

def __init__(self, title, author, year_of_publication, review_scores):

self.title = title

self.author = author

self.year_of_publication = year_of_publication

self.review_scores = review_scores

However, there are some details we discussed above about our structured data that this class does not yet capture, like the type of the value for each field. Also, unlike our actual prompt template, there is no description, aside from its name, about what each field ought to contain.

Let's improve on this slightly by rewriting the class to include Python type hints, and some comments articulating the intended value of each field.

class Book:

"""Information about a book."""

  

def __init__(self, title: str, author: str, year_of_publication: int):

self.title: str = title # The title of the book

self.author: str = author # The author of the book

self.year_of_publication: int = year_of_publication # The year the book was published

self.review_scores: float = review_scores # Review scores

It's still missing aspects like default values and data validation, but for the most part, if we had a way to convey the infomation contained in the above class, including its comments, in a prompt, we might be in pretty good shape.

---

## Pydantic[](http://54.173.133.152/lab/lab/tree/4-Structured-Output/42-Pydantic.ipynb#Pydantic)

LangChain provides us with exactly what we need to convey the information contained in classes to prompts. In doing so we have a powerful tool that enables us to articulate the structure of the data we want generated in a class, and then let LangChain do some of the more tedious work of conveying the information we capture in the class to a prompt.

The point is not that the model needs help writing JSON. The point is that the application needs a durable contract that explains what each field means and gives the parser a place to fail loudly when the response drifts.

In order to do this however, we need to use Pydantic classes instead of vanilla Python classes.

If you're unfamiliar, [Pydantic](https://docs.pydantic.dev/latest/) is "the most widely used data validation library for Python." If you're not using Pydantic in your object-oriented Python code, there's a good chance you'll enjoy learning how to use it.

For our purposes, we are only going to be using Pydantic to construct straightforward classes so that LangChain can then work with our class definitions to create prompts that will assist us in generating structured data.

The relevant Pydantic functionality has been integrated into LangChain, so to begin working with Pydantic classes, we need to import the following.

from pydantic import BaseModel, Field

Having imported `BaseModel` and `Field` we are now able to rewrite our `Book` class using Pydantic as follows.

class Book(BaseModel):

"""Information about a book."""

  

title: str = Field(description="The title of the book")

author: str = Field(description="The author of the book")

year_of_publication: int = Field(description="The year the book was published")

review_scores: float = Field(description="The average review score of the book, out of 10")

As you can see, when we want to construct a Pydantic class, we create a class that inherits from `BaseModel` as we're doing above.

Rather than creating an `__init__` function, we can supply the class's fields at the top level of the class definition by defining them with `Field`, which, as a convenience, allows us to provide a `description` argument about the intended use of the field.

---

## From Class to Formatting Instructions[](http://54.173.133.152/lab/lab/tree/4-Structured-Output/42-Pydantic.ipynb#From-Class-to-Formatting-Instructions)

In order to take the structure defined in our Pydantic `Book` class and generate a JSON object, we need a prompt to provide the model. LangChain's `JsonOutputParser` will provide us with just that.

First we'll import the `JsonOutputParser` class.

from langchain_core.output_parsers import JsonOutputParser

Just like with the `StrOutputParser` and `SimpleJsonOutputParser` parsers that we've used previously, we need to create an instance of the parser to use in our chain.

Different from the parsers we've worked with earlier, however, we can provide `JsonOutputParser` with an argument `pydantic_object` and provide a Pydantic object expressing how we want the JSON to be parsed. Here we'll pass in our Pydantic `Book`.

parser = JsonOutputParser(pydantic_object=Book)

Instances of `JsonOutputParser` contain a `get_format_instructions` method which create explicit instructions for formatting the JSON based on the provided Pydantic object.

format_instructions = parser.get_format_instructions()

print(format_instructions)

This is a really fantastic convenience to have the parser generate these detailed formatting instructions for us.

---

## The Importance of Docstrings and Field Descriptions[](http://54.173.133.152/lab/lab/tree/4-Structured-Output/42-Pydantic.ipynb#The-Importance-of-Docstrings-and-Field-Descriptions)

In the `format_instructions` above you'll notice several `"description"` fields. The top level `"description"` field states `""Information about a book.""`, the `"title"` `"description"` field states `"The title of the book"`. If we look again at our Pydantic class definition...

class Book(BaseModel):

"""Information about a book."""

  

title: str = Field(description="The title of the book")

author: str = Field(description="The author of the book")

year_of_publication: int = Field(description="The year the book was published")

review_scores: float = Field(description="The average review score of the book, out of 10")

...you'll see that these descriptions were created from the class's docstring (for the top level description) and for each of the passed in `description` values (for each of the fields).

These texts are critical for conveying our intent to the LLM. When creating Pydantic classes to be used as formatting tools with LLMs, always take care to provide a meaningful docstring for the entire class, as well as good descriptions for each of its fields.

---

## Using Formatting Instructions in Prompts[](http://54.173.133.152/lab/lab/tree/4-Structured-Output/42-Pydantic.ipynb#Using-Formatting-Instructions-in-Prompts)

Let's leverage the formatting instructions created by `JsonOutputParser` based on the Pydantic `Book` class in a prompt. While we are at it, we might as well also supply a system message to support our intended goal.

template = ChatPromptTemplate.from_messages([

("system", "You are an AI that generates JSON and only JSON according to the instructions provided to you."),

("human", (

"Generate JSON about the user input according to the provided format instructions.\n" +

"Input: {input}\n" +

"Format instructions {format_instructions}")

)

])

Next we'll create our chain.

chain = template | llm | parser

# Parser created above with `parser = JsonOutputParser(pydantic_object=Book)`

When we invoke this template, we'll need to provide an `input`, which in this case should be a book title, as well as `format_instructions`, which we have already obtained from `parser.format_instructions()`.

chain.invoke({

"input": "East of Eden",

"format_instructions": format_instructions

})

Since we are going to want to provide different `input` values, but retain the same `format_instructions`, we can partially apply our existing `format_instructions` to the prompt template using the template's `.partial` method.

chain = template.partial(format_instructions=format_instructions) | llm | parser # Created above with `parser = JsonOutputParser(pydantic_object=Book)`

Let's try our new chain with a batch of books.

book_titles = ["Dune", "Neuromancer", "Snow Crash", "The Left Hand of Darkness", "Foundation"]

chain.batch(book_titles)

Comparing this to the output from the previous notebook (see immediately below), you can see our results are more consistent and better.

```python
[{'title': 'Dune', 'author': 'Frank Herbert', 'yearPublished': 1965, 'aggregateScore': 8.2},
 {'title': 'Neuromancer', 'author': 'William Gibson', 'year': 1984, 'aggregate_score': 8.5},
 {'title': 'Snow Crash', 'author': 'Neal Stephenson', 'year': 1992, 'aggregate_score': 8.5},
 {'title': 'The Left Hand of Darkness', 'author': 'Ursula K. Le Guin', 'year': 1969, 'aggregate_score': 8.5},
 {'title': 'Foundation', 'author': 'Isaac Asimov', 'yearPublished': 1951, 'aggregateScore': 4.2}]
```

---

## Using with_structured_output[](http://54.173.133.152/lab/lab/tree/4-Structured-Output/42-Pydantic.ipynb#Using-with_structured_output)

As an alternative, and improved way to generate structured output, many LLMs now support the `with_structured_output` method, which allows us to replace the following...

```python
template = ChatPromptTemplate.from_messages([
    ("system", (
        "You are an AI that generates JSON and only JSON"
        " according to the instructions provided to you."
    )),
    ("human", (
        "Generate JSON about the user input according to the format instructions.\n" +
        "Input: {input}\n" +
        "Format instructions {format_instructions}"
    ))
])

chain = (
    template.partial(format_instructions=format_instructions)
    | llm
    | JsonOutputParser(pydantic_object=Book)
)
```

... with:

```python
llm_structured = llm.with_structured_output(Book)
```

`llm_structured` can be invoked, batched, or streamed just like `chain`, but the syntax is much more concise.

In this lab, `nvidia/nemotron-3-nano-30b-a3b` produces structured results through this interface. Keep Pydantic validation in the loop so schema drift fails at the application boundary.

---

## Exercise: Leverage Pydantic for Structured Data Generation[](http://54.173.133.152/lab/lab/tree/4-Structured-Output/42-Pydantic.ipynb#Exercise:-Leverage-Pydantic-for-Structured-Data-Generation)

For this exercise you are going to generate a batch of structured data for the following cities.

city_names = ['Tokyo', 'New Orleans', 'Busan', 'Cairo', 'Perth']

For each of these cities you should create a JSON blob that contains information about the city, including:

- The name of the city.
- The country that the city is located within.
- Whether or not the city is the capital city of the country it is located in.
- The population of the city.
- Great restaurants in the area.
- Food quality concensus rating.

Feel free to check out the Solution below if you get stuck.

### Your Work Here[](http://54.173.133.152/lab/lab/tree/4-Structured-Output/42-Pydantic.ipynb#Your-Work-Here)

  

### Solution[](http://54.173.133.152/lab/lab/tree/4-Structured-Output/42-Pydantic.ipynb#Solution)

7 cells hidden

## Summary[](http://54.173.133.152/lab/lab/tree/4-Structured-Output/42-Pydantic.ipynb#Summary)

In this notebook you took a tremendous leap in your ability to generate structured data. In the next notebook, you are going to extend this skill set even further. Rather than providing individual data samples to drive data generation, you'll pipe long-form text into the model which you will equip to extract and tag data as you specify.

---

Continue the unified course path

**Next step:** Open `4-Structured-Output/43-Document-Tagging.ipynb` next: **Document Tagging**.

**Before moving on:** Remember one field that became easier to trust with validation, because the next notebook applies that same discipline to long-form documents.

Click to add a cell.