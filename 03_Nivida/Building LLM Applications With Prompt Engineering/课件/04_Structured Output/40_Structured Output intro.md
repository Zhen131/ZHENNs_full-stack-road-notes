In this section, you'll learn the difference between getting JSON and getting a dependable application contract. The model used in this course is already strong at producing clean JSON, so the interesting work shifts to sharper questions: did the output use the right fields, did it preserve the intended meaning, can a downstream parser trust it, and what happens when the document is long or ambiguous? You'll use Pydantic and LangChain parsers to turn strong model behavior into validation you can actually depend on.

---

## Section Table of Contents[](http://54.173.133.152/lab/lab/tree/4-Structured-Output/40-Section-Introduction.ipynb#Section-Table-of-Contents)

1. **Structured Output:** In this notebook we introduce using LLMs to generate structured output, and explore some basic methods for using LLMs to generate data in batch for downstream use.
2. **Structured Output With Pydantic:** In this notebook you will drastically upgrade your ability to generate structured output through a combination of Pydantic classes and LangChain's `JsonOutputParser`.
3. **Document Tagging:** In this notebook you'll extend your skill set of generating structured data by learning how to efficiently extract data and and synthesize tags from long-form text documents.

---

Continue the unified course path

**Next step:** Open `4-Structured-Output/41-Structured-Output.ipynb` next: **Structured Output**.

**Before moving on:** Choose one downstream task that needs predictable fields instead of prose, because the next notebook makes that contract explicit.