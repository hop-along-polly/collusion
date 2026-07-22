# Claude 101

[Anthropic Course Link](https://anthropic-partners.skilljar.com/claude-101)

**What is Claude?**: Claude is the API for interacting with Anthropics LLMs (Haiku, Sonnet, Opus etc.) Claude can be accessed directly from the API, through tools like Claude Code or Claude CoWork, and 3rd party integrations like `@Claude` in Slack.
**What is AI Fluency?**: AI Fluency is developing practical skills, knowledge and values to help you use AI effectively, efficiently, ethically and safely.

## Claudes Guiding Design Principles

Claude's guiding principles are to be
 - `Helpful`:  
 - `Harmless`: 
 - `Honest`: 

## Prompting Basics

The best way to communicate with Claude is naturally, concisely, and conversationally. When crafting a prompt it is helpful frame your prompt by
1. `Setting the Stage`: What is your role and objectives. Is there any context Claude should know about your work?
2. `Defining the Task`: What action(s) do you want Claude to take
3. `Specify Rules`: What style/tone should Claude use? Are there examples you can include?

**Iteration Mindset** Treat your 1st prompt as a starting point and provide specific feedback on responses to better refine the output. Also know when it's time to start over.

### Common AI Challenges

| Problem | Resolution |
| ------- | ---------- |
| Generic Responses | Use prompt engineering techniques like including audience, role, and goals. | 
| Response is too long/short | Use prompt engineering techniques like specifying word/paragraph count or asking for in-depth/comprehensive explainations in the goals. |
| Claude didn't follow the output format | include examples of the output format you want |
| Claude confidently provided information that was wrong (Hallucination) | Enable fetures like web-search and specify confidence levels claude should have before presenting "facts" (Always verify key facts independently) |
| Tone isn't right | Specify the output tone you would like in the prompt and ensure provided examples match that tone. |


## Claude Tools

 - `Web-search`: Allows Claude to perform web-searches to get current data that may not have been present in it's trainig data.
 - `Connectors`: Connects Claude to your account and information in a 3rd party data sources such as Google Drive, OneNote etc. 
 - `Research Mode`: Forces Claude to examine multiple data sources and include citations in its responses. Takes 5-45min.
 - `Extended Thinking`: Sometimes referred to as `Reasoning` this tells Claude to think deeper and longer before responding. 
 - `Model Selection`: Switch the Anthropic model used for a conversation to balance results, and cost efficiency.


## Claude Desktop App

The Claude desktop app has 3 modes to interact with it, `Chat`, `Cowork`, and `Code`.

### Chat

Use for brainstorming, creating draft messages/docs, or collaboratively working through problems. Also available in a web-browser at [claude.ai](https://claude.ai) but the following features are only available on the desktop app.

**Chat Features**
 - `Quick Entry`: On a Mac Press the `Option ⌥` key twice to open a compact Claude Desktop window over whatever you are currently working on
 - `Screenshots and window sharing`: Capture screenshots or share your screen so 
 - `Dictation`: Speak your prompts instead of typing them. Claude can also respond by voice instead of text alone.
 - `Desktop Connectors`: Connect tools and services on your computer so Claude can use them.

### Cowork

Use for work that uses multiple information sources, needs multi-tasking, and produces a final output such as a presentation or report.

**Multitasking**: Cowork can multitask by breaking a complex problem into smalled problems and creating sub-agents for each of the sub-tasks that are executed in parallel.

**Cowork Features**
 - `Folder Access`: Point Claude to files/folders on your computer so it can read and write to your file system.
 - `Scheduled Tasks`: Schedule actions for Cowork to take on your behalf.
 - `Dispatch`: Allows you to access conversation from your phone while still granting Claude access to the computer the Cowork session is running on.
 - `Subagents`: Background agents spun up by Claude to perform subtasks in parallel.
 - `Projects`: Groups related tasks into a dedicated workspace with their own files, context, instructions and memory. _NOTE: Projects can only be shared if you have a Claude for Work plan._
 - `Browser use`: Allows Claude to access and interact with websites.
 - `Computer use`: Allows Claude to access and interact with your computer. Best used when a data connector is not available. (Currently in preview mode and only available with Pro and Max plans.)
 - `Plugins`: Enables Claude to use 3rd party tools, services, and skills to perform specific actions.
 - `Protected Environments`: Cowork runs in a contained sandbox and only has access to things explicitly shared with it.

### Code

A full Integrated development Environment (IDE) running directly in the Claude Desktop App.

**Code Features**
 - `Work Location`: Claude Code supports both `local` and `remote` work locations. When using `local` the changes to a code base happen on your computer. When using `remote` Claude Code is connected to a Github repository and all changes are made to the remote repository.
 - `Modes`: There are 3 modes for interacting with Claude Code; `Ask` (Claude proposes changes and ask permissions), `Code` (changes applied automatically), and `Plan` (Claude outlines its full approach before changing anything).


## Claude Projects Artifacts and Skills

Claude **FINISH THIS THOUGHT**

**Projects**: Projects are self contained local environments with customized settings, knowledge bases and chat history.
**Artifacts**: 
**Skills**: 

### Projects

**Key Features**
 - `Knowledge`: A Projects internal knowledge base (KB) that allows you to upload docs to the Project that will be referenced across all chats within the project. This improves Claudes understanding of the project.
 - `Project Instructions`: Specific instructions that Claude will references with every chat. This is an excellent place to define, role, tone and audience.
 - `Auto Enabled RAG`: When a Project's Knowledge Base approaches it's context window limit Retreival Augmented Generation (RAG) is enabled automatically to expand capacity by 10x.

Projects can be shared with 3 different permission sets.
 - `View`: Members can see contents, access KB and chat, but cannot change Project settings.
 - `Edit`: Members can modify KB, instructions, and manage members.
 - `Owner`: Full ownership of the project including visibility of the Project within an organization.

### Artifacts

Artifacts are interactive outputs generated by Claude. Images, long blocks of code etc. are created as Artifacts so they don't fill up the context window.

Claude will automatically creates an artifact when any of the following criteria are met.
 - It is significant and self-contained, typically over 15 lines
 - It is something you will likely want to edit, iterate on or reuse
 - It represents stand-alone complex content.
 - It is something you may want to reference later.

**Artifact Types**
 - Documents
 - Code Snippets
 - HTML
 - SVG images
 - Mermaid diagrams
 - React Components: Which are different from code snippets because these can be rendered and interacted with in Claude.

### Skills

Skills are instructions describing how to complete a repeatable tasks by following well defined steps for accomplishing the task.

Each skill lives in a self-contained folder containing
 - A markdown file providing the instructions/steps the skill should perform to complete the task.
 - Any scripts (bash, python etc.) needed to accoomplish the task
 - Any resources (Documents, images etc.) needed to accomplish the task

### 2 Types of Skills

 - `Anthropic`: Any skill that is created, maintained and published by Anthropic. These are the skills built into the Claude Desktop App.
 - `Custom`: Any skill created by your organizationn for completing a specialized task.


## Connecting Tools

Connectors are the component of Claude that connects Claude to 3rd party tools and services. 

### Types of Connectors
 - `Web`: A connection to a cloud service (i.e. Gmail, Notion, etc.)
 - `Desktop Extension`: A connection to a tool that exists on your computer (i.e. file access, browser control etc.)

**NOTE: A Connector can only access the things you granted it permission to when configuring the connector.**


## Enterprise Search

Enterprise search adds a dedicated "Ask <Your Org Name>" to the Claude Desktop App sidebar. Enterprise search is essentially a pre-built `Project` for your entire organization.

**NOTE: An admin has to enable enterprise search first and then anyone that wants to use it has to authenticate with their personal account.**


## Research Mode

Research mode switches how Claude finds and analyzes information.
 - Multiple searches are performed instead of one
 - Searches build upon each other and Claude automatically determines what to investigate next while researching
 - Claude will reesearch the topic from multiple angles/view points so you get a complete overview of the topic.
 - Claude will include citations in it's response so you can reference the original source.
