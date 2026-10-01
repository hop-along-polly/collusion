# Anthropic AI Fluency

[Anthropic Course Link](https://anthropic-partners.skilljar.com/ai-fluency-framework-foundations).

**What is AI Fluency?** AI Fluency is about developing practical skills, knowledge and values to help you use AI effectively, efficiently, ethically and safely.
**What is generative AI?** Ai Sytems that can create new content instead of just analyzing existing data.

## 3 Ways of Collaborating with AI

The 3 fundamentals ways people interact and collaborate with AI are
 - `Automation`: AI performs some unit of work based on your instructions. (Best for when the solution/outcome can be clearly stated and the steps to reaching the end-state are well-defined.)
 - `Augmentation`: The AI system doesn't do work for you, rather it helps you do your work better. (Best for creative work where the outcome is not clear yet)
 - `Agency`: AI works independently for you. (Best when AI needs to reason rather than execute steps)


## AI Fluency Framework 

The AI Fluency Framework is a model for Human to AI interactions. It is built on 4 core competencies that improve the users experience and efficiency when using AI. 
These 4 core competencies are Delegation, Description, Discernment, Diligence.

### Delegation

Deciding what work should be done by AI vs a human and how to distribute tasks between them. When delegating tasks you should consider
 - `Problem Awareness`: Do you understand your goal/problem well. "A problem well stated is a problem half solved" - John Dewey
 - `Platform Awareness`: What are the strength and limitations of the AI system you are using.
 - `Task Delegation`: Decide what work is the AI better suited to handle and what work is better suited for a human to handle.


### Description

Articulating your needs/vision in a way that sets up the AI to provide te best results. Once again the quote, "A problem well stated is a problem half solved" by John Dewey applies here.

`Project Description`: Clearly define the problem, goals and format of the outputs.
`Process Description`: Describe the process you want the AI to follow to get to an answer.
`Performance Description`: Describe the behavior of the AI system. Should it be verbose and detailed or keep things high-level and simple. Should it challenge your assumptions or follow your lead?

Most prompt engineering techniques fall under the `Description` competency because the describe the final output, behaviour or approach of AI system. The following are common prompt engineering techniques that would be considered part of the Description competency.

 - `Few-Shot Prompting`: Providing examples of inputs and desired outputs in the system-prompt. (i.e describing the final output)
 - `Role/Persona Prompting`: Assigning an identity to control vocabulary, depth, and nuance. (i.e. describing behaviour and approach)
 - `Chain-of-Thought Prompting`: Having the model explain its reasoning and asking/prompting the AI in response to it's internal reasoning (i.e. describing behavior)

**Effective Prompting Techniques**

These are the 6 foundational prompting tips (according to Anthropic)
 - `Provide Context`: Be specific about what you want, why you want it and what your level of knowledge on this topic is.
 - `Offer Examples`: a.k.a Few-shot prompting
 - `Specify Output Constraints`: Describe the output with specific things that should/should not be included in the output.
 - `Breakdown complex tasks`: a.k.a Chain-of-Thought (CoT) prompting.
 - `Give the AI space to think`: Allow the model to reason or specifically prompt it to explain it's reasoning so you can see how the AI got to it's answer.
 - `Define roles`: a.k.a Role/Persona Prompting


### Discernment

Discernment is the flip-side of Description. Where `Description` focuses on clearly describing what you want, `Discernment` focuses on making sure the response fills the needs you described in your prompt. A part of Discernment is also providing feedback and correction in follow-up prompts. 

When evaluating an AI's responses you should look at
 1. `Product Discernment`: The quality of the output
 2. `Process Discernment`: The quality of the AI's problem solving/reasoning
 3. `Performance Discernment`: How well the AI is interacting with the user.

Questions to ask when evaluating **Product Discernment**
Some questions you can ask when evaluating an AI's response
 - Is the response factually accurate?
 - Is the response appropriate for my audience and purpose?
 - Is the response coherent and well-structured?
 - Did the response meet my Acceptance Criteria/requirements from the prompt?
 - Does this response add value?

Questions to ask when evaluating **Process Discernment**
 - Was the process logically inconsistent?
 - Were there lapses in judgement?
 - Were inappropriate or wrong steps taken?
 - Did it get stuck on a minor detail?
 - Did it get trapped in circular reasoning?

Questions to ask when evaluating **Performance Discernment**
 - Is the communication style appropriate
 - Is the information presented at the right level for my audience
 - Does the AI respond well to the users feedback and direction?
 - Are the responses efficient? (i.e. is it being overly verbose when you need/want concise answers?)

### Diligence

Understanding how to interact with AI responsibly, ethically and safely. The principles of Responsible AI include

 - `Fairness and Inclusiveness`: Working to limit biases learned by an AI from it's training data.
 - `Transparency`: Making the use, design and training data source available
 - `Explainability`: The ability to explain/reverse engineer how an AI system came up with its output
 - `Accountability`: Are you willing to take ownership and accountability for AI assisted work and decisions.

**Creation Diligence**: Being thoughtful about Which AI systems you use and how you use them.
**Transparency Diligence**: Being open and honest about your AI system to build trust in relationships.
**Deployment Diligence**: Taking ownership and informed responsibility of AI outputs and how they are used.

To properly exercise Diligence in your AI usage you should
  - Verify facts
  - Check for biases
  - Ensure accuracy
  - Check for usage rights

## Generative AI Fundamentals

There are 3 pillars of technical developments that had to happen for Generative AI to be possible.
1. `Algorithms`: Advancements in Neural-Networks and the invention of the Transformer architecure made it possible for AI's to process large sequences of text while maintianing relationships between words.
2. `Data`: Web2 lead to vast amounts of diverse and specialized data being available in digital format on the open web.
3. `Computation`: Increase in computational power for Grpahics Processing Units (GPU's) and Tensor Processing Units (TPU's) allows processing large amounts of data quickly

### Scaling Laws

The scaling laws state

> "As models grow larger, train on more data and run on more computing power their performance improve in predictable ways and new capabilities emerge"

### Fine-Tuning

Fine-tuning is a technique for creating a more specialized model using domain specific training data so the models are better suited for specific use cases like generating code.

Anthropics goals for fine-tuning are to make their models
  - Helpful
  - Honest
  - Harmless

### Capabilities and Limitations

When working with AI's it is important to understand an AI systems provides, speed, scale, pattern recognition, and processing but humans provide the critical thinking, judgement, creativity and ethical oversight.

**Capabilites**
 - `Summarization`: Creating a summary of a long and detailed report
 - `Translation`: Translating text from one language to another which retaining the original meaning
 - `Retrieval Augmented Generation (RAG)`: Fetching data from external sources 
 - `Tool use`: Models can call external tools for access data or taking actions on the users behalf

**Limitations**
 - `Knowledge cut-off Date`: Every model is bound by it's training data and posesses some date in which the model has no inherent knowledge after that date.
 - `Hallucinations`: Models can reproduce inaccuracies that were present in training data.
 - `Limited Context Window`: The size of the Context Window, conversation history, is always finite.
 - `Non-deterministic`: The same prompt will get different responses every time.
