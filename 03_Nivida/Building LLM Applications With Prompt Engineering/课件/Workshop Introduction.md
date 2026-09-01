This workshop uses two model roles so the model choice matches the prompt-engineering task:

- `meta/llama-3.2-11b-vision-instruct` for ordinary prompt iteration and chat examples.
- `nvidia/nemotron-3-nano-30b-a3b` for structured output, tools, agents, assessment, and the notebook that explicitly studies reasoning metadata.

The reasoning notebook requests reasoning explicitly with `/think`; the other Nemotron paths use direct responses or structured tool interfaces.

Welcome.

In this workshop you will learn a powerful assortment of techniques for working programmatically with LLMs via prompt engineering. By the time you complete this workshop you will be ready to write application code using LLMs for a wide variety of language related tasks.

---

## Workshop Outline[](http://54.173.133.152/lab/lab#Workshop-Outline)

This workshop is comprised of 5 sections, accessible via the file viewer on the left-hand side of your JupyterLab window. To help orient you to the work you'll be performing today in the workshop, here is a brief description of each section.

---

### Section 1: Introduction to Prompting[](http://54.173.133.152/lab/lab#Section-1:-Introduction-to-Prompting)

In this section you'll orient to the workshop environment and the Llama 3.2 11B model used for ordinary prompt iteration. You'll begin with the "hello world" of programmatically prompting an LLM and viewing its response and will progress into some of the core prompting techiques, using LangChain, that will support your work for the remainder of the workshop.

This section concludes with a mini project where you will perform a combination of analysis and generative tasks on a batch of inputs.

---

### Section 2: LangChain Expression Language (LCEL), Runnables, and Chains[](http://54.173.133.152/lab/lab#Section-2:-LangChain-Expression-Language-\(LCEL\),-Runnables,-and-Chains)

In this section you'll learn how to create modular, reusable, and composable units of LLM-based work called chains using LangChain expression language, or LCEL. In the service of creating and working with LCEL chains you'll learn how to create custom chain components and compose chains, including in parallel.

This section concludes with a mini project where you'll revisit the section 1 mini-project, but this time will simplify your code by utilizing LCEL chains and also perform some of the project's subtasks in parallel.

---

### Section 3: Prompting With Messages[](http://54.173.133.152/lab/lab#Section-3:-Prompting-With-Messages)

In this section you'll learn how to explicitly control the kinds of messages we send to and receive from chat models, and leverage them to perform a variety of powerful prompt engineering techniques including few-shot prompting, system message updating, and chain-of-thought prompting. You'll also request a reasoning mode and inspect how the endpoint separates reasoning metadata from the final answer.

This section concludes by your managing messages to create a chatbot capable of retaining conversation history and assuming a variety of personas that you can specify.

---

### Section 4: Structured Output[](http://54.173.133.152/lab/lab#Section-4:-Structured-Output)

In this section you'll learn how to define precise data structure definitions and provide them to LLMs in order to get the LLM to generate structured data capable of being used directly in code.

This section concludes with a mini-project where you use structured data generation techniques to perform data extraction and document tagging on an unstructured text document.

---

### Section 5: Tool Use and Agents[](http://54.173.133.152/lab/lab#Section-5:-Tool-Use-and-Agents)

In this section you'll learn how to create units of functionality external to the LLM called tools, and augment LLMs to be able to utilize tools and include the results of their work in the responses they generate.

In this section you'll conduct a mini-project where you create an LLM agent capable of utilizing external API calls to augment its responses with real-time data.

---

### Section 6: Assessment[](http://54.173.133.152/lab/lab#Section-6:-Assessment)

In this section you'll put what you've learned to the test and earn a certificate of competency in the course by completing an assessment project where you build a LangChain application capable of identifying the main sources of customer complaints out of a collection of customer emails.

This section concludes with a workshop summary and an opportunity to provide feedback to us about the workshop.

Continue the unified course path

**Next step:** Open `1-Intro-to-Prompting/10-Section-Introduction.ipynb` next: **Section 1: Introduction to Prompting**.

**Before moving on:** Pick one real workflow you want prompt engineering to improve, so the first section stays tied to a concrete outcome instead of abstract examples.