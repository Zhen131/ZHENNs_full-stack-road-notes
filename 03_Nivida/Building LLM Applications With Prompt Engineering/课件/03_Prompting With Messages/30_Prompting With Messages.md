Thus far our interactions with our chat model have been text in text out. In this section we'll begin by exposing that behind the text are indications of the role of who is providing the text (human or AI) and will learn how to author prompts that explicitly use these and other available roles to great effect.

By the time you complete this section you will be able to employ few-shot prompting, utilize the system message to define the overarching role or persona of a chatbot, and be able to get your chat model to tackle tasks that may have otherwise been too complex for it by using a technique called chain-of-thought prompting.

---

## Section Table of Contents[](http://54.173.133.152/lab/lab/tree/3-Prompting-With-Messages/30-Section-Introduction-Copy1.ipynb#Section-Table-of-Contents)

1. **Human and AI Messages:** In this notebook you'll learn about two of the core chat message types, human and AI messages, and how to use them explictly in application code.
2. **Few-Shot Prompting:** In this notebook you'll learn how to provide chat models with instructive examples by way of a technique called few-shot prompting.
3. **System Message:** In this notebook you'll learn about the system message, which will allow you to define an overarching persona and role for your chat models.
4. **Chain-of-Thought Prompting:** In this notebook, you will learn about one of the most famous prompting techniques called Chain-of-Thought prompting.
5. **Reasoning Models:** In this notebook, you will request a reasoning mode and inspect how the endpoint separates reasoning metadata from the final answer.
6. **Chatbots:** In this notebook, you will learn how to manage messages to retain conversation history and enable chatbot functionality.

---

Continue the unified course path

**Next step:** Open `3-Prompting-With-Messages/31-Human-and-AI-Messages.ipynb` next: **Human and AI Messages**.

**Before moving on:** Pick one place where role separation should make the prompt easier to steer, because the next notebook turns that idea into explicit message objects.