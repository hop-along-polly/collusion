# Building with Claude API

[Anthropic Course Link](https://anthropic.skilljar.com/claude-with-the-anthropic-api)

## Table of Contents

- [Claude Models](#claude-models)
- [Accessing the API](#accessing-the-api)
  - [API Best Practices](#api-best-practices)
  - [How Requests are Handled](#how-requests-are-handled)
  - [System Prompts](#system-prompts)
  - [Temperature](#temperature)
  - [Response Streaming](#response-streaming)
    - [Example](#response-streaming-example)
  - [Structured Data](#structured-data)
    - [Example](#structured-data-example)
- [Prompt Engineering & Evaluation](#prompt-engineering-and-evaluation)
  - [Prompt Evaluation Workflow](#prompt-evaluation-workflow)
  - [Model Based Grading](#model-based-grading)
  - [Prompt Engineering](#prompt-engineering)
   - [Best Practices](#prompt-engineering-best-practices)
   - [Structured Prompt Example](#structured-prompt-example)
- [Tool Use](#tool-use)
  - [Handling Toll Use Blocks](#handling-tooluseblock)
  - [Handling Tool Results](#handling-tool-results)
  - [Tool Use Example](#tool-use-example)
  - [Implementing Multiple Turns](#implementing-multiple-turns)
- [Retrieval Augmented Generation](#retrieval-augmented-generation-rag)
  - [RAG Pipeline Overview](#rag-pipeline-overview)
  - [Chunking Data](#chunking-data)
  - [Storing Chunks](#storing-chunks)
  - [Semantically Searching Chunks](#semantically-searching-chunks)
  - [BM25 Lexical Search](#bm25-lexical-search)
  - [Merging Results in a Multi-Index RAG Pipeline](#merging-results-in-a-multi-index-rag-pipeline)
- [Claude Features](#claude-features)
  - [Extended Thinking](#extended-thinking)
  - [Image Support](#image-support)
  - [PDF Support](#pdf-support)
  - [Prompt Caching](#prompt-caching)
  - [Code Execution & Files API](#code-execution-and-files-api)
- [Model Context Protocol](#model-context-protocol)
- [Anthropic Apps](#anthropic-apps)
  - [Using Claude Code](#using-claude-code)
- [Agents & Workflows](#agents-and-workflows)

 ---

## Terminology

 - `User Message`: Content the user is providing to the Model.
 - `Assistant Message`: Content the Model has produced (i.e. response, tool blocks etc.)
 - `System Prompt`: A prompt defined by an application developer containing a foundational set of instructions the Model should follow.
 - `Conversation History`: An ordered list of all the User Messages, Assistant Messages, Tool Call Blocks, etc. sent/received in the current session.
 - `Temperature`: An integer between 0-1 that controls the randomness of a Models output.
 - `Turn`: A turn is a single round trip in the ReAct loop meaning the Model receives input, produces an output including a `ToolUseBlock`, the Tool is called, and the Tool results are returned to the Model.
 - `Request`: A single stateless HTTP call to the Claude API (e.g. one `client.messages.create()` call) containing everything the Model needs to generate the next Assistant Message; the Model, Max Tokens, System Prompt, the entire Conversation History (User Messages, Assistant Messages, ToolUseBlocks, ToolResultBlocks etc.), the Tool schemas, and sampling parameters like Temperature. Nothing is persisted between requests so the full history and tool set must be resent every time. A single Turn is made up of at least one Request.
 - `Embedding`: A numerical representation of the meaning contained in text. In the context of RAG embedding refers to the vector of numbers (embedding) for a chunk of text not just a token.
 - `Embedding Model`: An algorithm that converts raw data into embeddings (e.g. AWS Titan Text Embeddings)

 ---

## Claude Models

|  Model  | Intelligence | Reasoning |   Cost   |   Speed  |                      Use Case                |
| ------- | ------------ | --------- | -------- | -------- | -------------------------------------------- |
| Opus    | Highest      | yes       | high     | slow     | complex tasks that need a lot of reasoning   |
| Sonnet  | High         | yes       | moderate | moderate | tasks balancing cost, speed and intelligence |
| Haiku   | Moderate     | no        | low      | fast     | real-time processing                         |

When deciding on a model understand the trade-off between speed/cost vs. inteliigence and reasoning.

>! [NOTE]
> Most agentic applications will use different models for different tasks depending on the need of the task.

 ---

## Accessing the Claude API

The `Claude API` refers to an API layer that wraps Anthropic Models. Regardless of where the Model is running (Anthropic's cloud infrastructure, Bedrock, or Google Vertex) it is packaged with the Claude API which handles application level concerns like preprocessing, authentication etc. while the Model only does the reasoning and text generation.

You can generate an API Key from The [Anthropic Console](https://console.anthropic.com). This key is provided to an Anthropic SDK in the client constructor or as the `x-api-key` in a raw HTTP Request (not recommended).

### API Best Practices

 - **DO NOT** make requests to the Claude API from a client side application.
 - Use one of the pre-built SDKs instead of raw HTTP requests.
 - Limit the `Max Tokens` on requests to prevent excess token usage.

### How the Claude API Handles Requests 

When a request is received by the Claude API the following steps are taken to process it.

 1. `Tokenization`: Words are broken down into smalled substrings called tokens.
 2. `Embedding`: Tokens are converted into vector embeddings which are numerical representations of the meaning of that token.
 3. `Contextualization`: The numerical values in each Embedding are adjusted based on the Embeddings around it narrowing down the embedding to a precise definition of the token it represents in relationship to all the other tokens in the input.
 4. `Generation`: An output layer generates a set of the next most likely token that should be included in the output. The next token is chosen based on probability and randomness to ensure a more natural and varied sounding response is generated.

**Contextualizatin Example**: The word "set" can have multiple meanings depending on the context
 - "Please set the plates on the table". In this example "set" means to place.
 - "He has a nice tool set". In this example "set" refers to a group of things
 - "Game, set and match". In this example "set" refers to a unit of scoring in Tennis

 ---

## Using Anthropic's Client SDK

### Initializing a Client

When making a request you need to SDK package installed on the server that will be handling client requests.

```bash
pip install "anthropic" # Installs the official Anthropic SDK.
```

A client can be initialized like this.
```python
from anthropic import Anthropic

client = Anthropic()
```

### Making a Request

The simplest form of a request is a pure text prompt. The code for creating and sending a single User Message looks like this.

```python
# NOTE: the message is sent to the Model on create.
response = client.messages.create(
 model='claude-sonnet-4@20250514', # The id of the Model you want to process this message
 max_tokens=8, # The max number of tokens the model can generate in response to this message. * is a ridiculously low number FYI.
 messages=[
  {
    'role': 'user', # indicates this is a User Message
    'content': 'How much wood would a wood chuck chuck?' # The prompt provided by the user.
  }
 ]
)
```

After the `client.messages.create()` function call returns the `response` variable contains a `Message` object that looks like
```python
Message(
  id='msg_randomId',
  content=[
    TextBlock(
      citations=None,
      text='A wood chuck would chuck all the wood' # The Models response as a text string
    )
  ],
  model='claude-sonnet-4@20250514', # The model that generated the response
  role='assistant', # indicates this is an Assistant Message rather than a User Message
  ... # Some fields have been redacted in this example because they are not relevent.
)
```

The response context can then be extracted with
```python
response.content[0].text
```

### Multi-turn Conversations

In order for your application to support back and forth interactions between the User and the Model you need to maintain a conversation history. The Anthropic API and Models **DO NOT** do this for you. 

Below is an example maintaining a conversataion history enabling your app to support multi-turn conversations.

```python
# Defines a function for appending a new user message to the conversation history.
def add_user_msg(chat_history, text):
  chat_history.append({
    'role': 'user',
    'content': text
  })

# Defines a function for appending a new assistant message to the conversation history.
def add_assistant_msg(chat_history, text):
  chat_history.append({
    'role': 'assistant',
    'content': text
  })

# Defines a function that will send the conversation history to the Model
def chat(chat_history):
  response = client.messages.create(
    model='claude-sonnet-4@20250514',
    max_tokens=1000,
    messages=chat_history
  )

  return response.content[0].text # Returns the Text content of the response

# The following series of function calls uses the 3 function defined above to demonstrate an interactive chat loop.
chat_history = []
add_user_message(chat_history, 'How much wood would a wood chuck chuck?')

# record the Models answer in the chat_history.
answer = chat(chat_history)
add_assistant_message(chat_history, answer)

# Ask a follow up question
add_user_message(chat_history, 'Can a wood chuck chuck wood though?')

# Record the next answer
answer = chat(chat_history)
add_assistant_message(chat_history, answer)

# Rinse and Repeat in a loop
```

### System Prompts

System Prompts are often used to set the persona, tone, and response format for a Model.

Below is an example of how to pass a system prompt to the Model when creating a message.

```python
response = client.messages.create(
  model='claude-sonnet-4@20250514',
  max_tokens=1000,
  messages={
    'role': 'user',
    'content': 'How much wood would a wood chuck chuck?'
  },
  # The `system` keyword argument for client.messages.create accepts a string containing the system prompt.
  system='You are an expert on wood chucks and wrote a doctoral thesis on their wood chucking capabilities. You also enjoy poetry and word play so responses should be playful, rythmic, tongue twisters.'
)
```

>! [NOTE]
> When sending system prompts to the Anthropic API the System Prompt can be omitted, but it **CANNOT** be a null or empty value.

### Temperature

Temperature is a parameter that can be specified when creating a new chat session that alters how creative and dynamic the responses will be.

When temperature sets to 0 the Model should always select the most likely token essentially creating deterministic output. If temperature is set to 1 the Model will choose randomly from the set of likely next tokens leading to more creative and dynamic outputs.

Different temperature ranges should be used for different use cases.
| temperature | use cases |
| ----------- | --------- |
| 0.0 - 0.3 | <ul> <li>factual responses</li> <li>coding assistant</li> <li>data extraction</li> <li>content moderation</li> </ul>|
| 0.4 - 0.7 | <ul> <li>summarization</li> <li>educationl content</li> <li>problem solving</li> <li>some creative writing</li> </ul>|
| 0.8 - 1.0 | <ul> <li>brainstorming</li> <li>creative writing</li> <li>marketing content</li> <li>writing jokes</li> </ul>|


Temperature can be specified when creating a message by specifying the `temperature` keyword argument.

```python
response = client.messages.create(
  model='claude-sonnet-4@20250514',
  max_tokens=1000,
  messages={
    'role': 'user',
    'content': 'How much wood would a wood chuck chuck?'
  },
  temperature=0.4
)
```

### Response Streaming

Depending on the length of a prompt and complexity of the task a Models response time can vary widely.

To improve the user experience text can be streamed back as the Model thinks and generates text instead of all at once when the `MessageStop` message is received.
Response Streaming can be enabled by setting the `stream` keyword argument to True when creating a message.

**Anthropic Stream Events**
▎ These events are emitted by the Claude API as the response is generated and arrive in order over the open stream. They are inbound only: your code consumes them to render or accumulate the response. They are never request objects — you don't construct one or append one to messages. To send the assistant's turn back on a later request, append the assembled Message (stream.get_final_message() / stream.finalMessage()), not the events.


| Wire name | SDK name | Description |
| --------- | -------- | ----------- |
| message_start | RawMessageStartEvent | A new assistant message has begun. Carries the message metadata: id, model, role, and initial usage. |
| content_block_start | RawContentBlockStartEvent | A new content block (text, thinking, tool use) has begun. |
| content_block_delta | RawContentBlockDeltaEvent | An incremental chunk for the current block. |
| content_block_stop | RawContentBlockStopEvent | The current block is complete; no further chunks for it. |
| message_delta | RawMessageDeltaEvent | Top-level updates to the message: stop_reason, stop_sequence, and cumulative output token usage. |
| message_stop | RawMessageStopEvent | The stream is finished. |

**Response Streaming Example**
```python
stream = client.messages.create(
  model='claude-sonnet-4@20250514',
  max_tokens=1000,
  messages={
    'role': 'user',
    'content': 'How much wood would a wood chuck chuck?'
  },
  stream=True
)
```

Individual events received in the stream can be handled by looping over the events.
```python
for event in stream:
  print(event)
  # or do something else with it
```

The entire message can be retrieved after the stream has been completed by calling `get_final_message`.
```python
stream.get_final_message() 
```

### Prefilled Assistant Messages

Prefilling an assistant message is when you (as the programmer) append an Assistant Message to a User Message. The appended message clues Claude in on what it's starting thought should be.

```python
messages = [
  {
    'role': 'user',
    'content': 'How much wood would a wood chuck chuck?'
  },
  {
    'role': 'assistant',
    'content': 'If a wood chuck could chuck wood' # Should clue Claude into completing the tongue-twister with "A wood chuck would chuck all the wood."
  }
]
response = client.messages.create(
  model='claude-sonnet-4@20250514',
  max_tokens=1000,
  messages=messages
)
```

> [!IMPORTANT]
> Claude's response will pick-up where your assistant message left off so you need to stitch the content from the Prefilled Assistant Message and Claudes response together before sending it to the user.

### Stop Sequences

Stop Sequences force Claude to stop generation when as soon as it generates a sequence of characters(tokens) you specify. The stop sequences can be passed in as a list to the `client.messaages.create()` function.
```python
response = client.messages.create(
  model='claude-sonnet-4@20250514',
  max_tokens=1000,
  messages={
    'role': 'user',
    'content': 'How much wood would a wood chuck chuck?
  },
  stop_sequences=['all the wood.']
)
```

The following use cases are appropriate times to use Stop Sequences
 - Limiting the length of lists
 - Stopping at specific markers or delimiters (e.g. )
 - Creating consistent output formats
 - Preventing long responses (The example above demonstrates this because it stops Claude from generating any justification after completing the tongue twister.)

### Structured Data

Prefilled Assistant Messages and Stop Sequences can be used together to ensure structured data (code, json, etc.) is generated correctly while omitting the helper/explanation text.

For example generating a JSON or code block can be achieved with the following Prefilled Assistant Message and Stop Sequence
```python
messages = [
  {
    'role': 'user',
    'content': 'Generate python code for calculating how much wood a wood chuck can chuck based on the size and age of the wood chuck.'
  },
  {
    'role': 'assistant',
    'content': '```python' # Tells claude just started writing the code so preceding explanatory text is skipped
  }
]
response = client.messages.create(
  model='claude-sonnet-4@20250514',
  max_tokens=1000,
  messages=messages
  stop_sequences=['```'] # Forces claude to stop after completing the code block so the following explanation will also be skipped.
)
```

 ---

## Tool Use

Every Tool is essentially just a function that will be called by your system when requested by the Model. A Tool can be defined as a function with a JSON schema describing the purpose and usage of the tool. Tools can be as simple as generating the current datetime (see example) or fetching data from multiple APIs and creating an aggregated response.

### Defining a Tool
```python
import string
import secrets

from anthropic.types import (
  ToolParam,
  ToolUseBlock,
  ToolResultBlockParam,
  Message
)

# Given this function for generating a random password of varying length
def random_password(length:int = 32):
  letters = string.ascii_letters
  digits = string.digits
  special_chars = "!@#$%^&*()-_=+[]{}" 

  allowed_chars = letters + digits + special_chars
  return ''.join(secrets.choice(allowed_chars) for _ in range(length))

# It can be defined as a tool function using the ToolParam type from Anthropics SDK
# This defines how the tool is used but, the Model is still not aware it exists yet.
random_password_schema = ToolParam({
  "name": "random_password",  # Must match the name of the function that will be called.
  "description": "Generate a cryptographically secure random password using letters, digits, and special characters.",  # Description of the tool, when it should be used, what parameters it needs, and what it returns.
  "input_schema": {  # The actual JSON Schema spec.
    "type": "object",
    "properties": {
      "length": {
        "type": "integer",
        "description": "Length of the generated password.",
        "minimum": 1,
        "maximum": 128,
        "default": 32
      }
    },
    "required": [],
    "additionalProperties": False
  }
})
```

Before a Model can make use of the tool we just defined it needs to be passed to the `client.message.create()` function using the `tools` keyword argument.
```python
client.message.create(
  model='claude-sonnet-4@20250514',
  max_tokens=1000,
  messages = [
    {
      'role': 'user',
      'content': 'What is a good secure password for a wood chuck?'
    }
  ]
  tools=[random_password_schema]  # Now Claude is aware of the tool and can request to use it
)
```

> !IMPORTANT
> Tool Schema(s) must be provided with every message since available tools are not persisted by the Model.

**TODO Probably need to reword this or remove it**
**Best Practice**: Use **kwargs and/or default values to make calling the tool function easier. Reference the full [Tool Use Example](#tool-use-example) below.

### Handling ToolUseBlock

When the model wants to use a Tool it returns a `ToolUseBlock` that looks like this
```python
tool_use_req = ToolUseBlock(
  id='toolu_d3db33fc4f3',  # A randomly generated ID used to tie ToolUseBlocks to the ToolResults message sent back to the Model. 
  name='random_password',  # The tool function the Model would like to call 
  input={'length': 128},  # The input parameters the Model wants to call the tool function with.
  type='tool_use'
)
```

> !IMPORTANT
> When a response includes multi blocks (e.g. a TextBlock and a ToolUseBlock) both blocks need to be appended to the message history.


### Returning ToolResults to the Model

After receiveing a `ToolUseBlock` the system calls the tool requested with the parameters specifed and passes the results back to the Model as a `ToolResults` block.

**Calling Tools Example**
```python
from anthropic.types import ToolResultBlock

history = []

tool = globals()[tool_use_req['name']] # Looks up the fn pointer to the tool function in the global namespace based on the tool name returned by the Model.

res = tool(**tool_use_req['input']) # Calls the tool with the specified inputs.

# The results are then added to the conversation history as a ToolResult block.
history.append(ToolResultBlock(
  tool_use_id=tool_use_req['id'],
  type='tool_result',
  content=res,
  is_error=False
))
```

>!IMPORTANT
> It is a best practices to define tool function with kwargs so it is easier to pass the inputs from the ToolUseBlock when calling the tool function.

### Multi-turn Conversations & Multiple Tools

Even mildly complex prompts will likely trigger multiple ToolUseBlocks. To support this the system needs to manage a loop of calling the Model, calling tools, and then calling the Model again before sending the final response.

The general implementation uses a `while` loop that runs until the Model stops asking to use tools.

Possible values for `stop_reason` are 
 - `tool_use`: The model wants to use a tool. 
 - `end_turn`: The model is done and wants to send a message to the end user
 - `max_tokens`: The max allowed number of tokens has been generated
 - `stop_sequence` A customer stop sequence was encountered.

Reference the [ai_react_loop.py](./ai_react_loop.py) script for an example of a generic solution for handling multi-turn conversations that include multiple tools being called.

### Tools for Structured Data

Tools albeit it more complicated can provide more reliable generation of structured data that the previous technique of using Prefilled Assistant Messages and Stop Sequences.

When using tools to generate structured data they will be realtively specialized for specific tasks like creating a report, or financial summary.

The `tool_choice` keyword argument can be used for force the Model to call a tool. The 3 types of tool choice are
 - `auto`: The model decides if it needs a tool and which tool it needs. This is claudes default setting.
  ```python
  client.message.create(
    model='claude-sonnet-4@20250514',
    max_tokens=1000,
    messages = chat_history,
    tools=[random_password_schema],
    tool_choice={ 'type': 'auto' }
  )
  ```
 - `any`: The Model **must** use a tool but can decide which tool to use.
  ```python
  client.message.create(
    model='claude-sonnet-4@20250514',
    max_tokens=1000,
    messages = chat_history,
    tools=[random_password_schema],
    tool_choice={ 'type': 'any' }
  )
  ```
 - `named`: The Model **must** use the named tool.
  ```python
  client.message.create(
    model='claude-sonnet-4@20250514',
    max_tokens=1000,
    messages = chat_history,
    tools=[random_password_schema],
    tool_choice={
      'type': 'tool',
      'name': 'random_password' # force the Model to use the random_password tool.
    }
  )
  ```

### Batch Tool

Claude natively will request Tools one at a time which wastes tokens on useless rounds of sending `ToolUseBlock`s and `ToolResultBlock`s back and forth between the Model and the system(agent). Claude can be tricked into calling multiple tools at once by providing it with a `batch_tool` tool function similar to this.
```python

def batch_tool(invocations: List):
  batch_output = []

  for i in invocations:
    tool_to_call = globals()[i['name']]
    output = tool_to_call(json.loads(i['arguments']))

    batch_output.append({
      'tool_name': i['name'],
      'output': output
    })


# The schema for this tool would look like this.
batch_tool_schema = {
  "name": "batch_tool",
  "description": "Invoke multiple tools simultaneously",
  "input_schema": {
    "type": "object",
    "properties": {
      "invocations": {
        "type": "array",
        "description": "A list of tools that need to be called",
        "items": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string",
              "description": "The name of the tool function to be called"
            },
            "arguments": {
              "type": "string",
              "description": "A dictionary of the arguments that should be provided to the tool encoded as a JSON string."
            }
          }
        }
      }
    }
  }
}
```

### Text Editor Tool

A JSON Schema for the Text Editor Tool is built in to Claude, but you as the developer are responsible for 2 things to enable the Text Editor Tool

 1. The actual implementation of the tool
 2. A small stub of a schema that specifies the version of the Text Editor schema to be used based on the version of Claude you are using.

For example the stub for Claude Sonnet 3.7's str_replace_editor looks like this
```json
{
  "type": "text_editor_20250124",
  "name": "str_replace_editor"
}
```

> !IMPORTANT
> This Text Editor Tool is meant for when you application is running on a system that does not have a full featured text-editor available to it.

### Web Search Tool

The Web Search Tool is also built in to Claude, but it is fully implemented unlike the Text Editor tool. You as the developer still have to provide a small stub of a schema to specify the correct Web Search Schema based on the version of Claude you are using.

**Web Search Schema Example**
```json
{
  "type": "web_search_20250305",  # based on the version of Claude you are using
  "name": "web_search",
  "max_uses": 5,  # Limits the number of times this tool can be invoked.
  "allowed_domains": [] # A list of domains the Web Search Tool can query
}
```

The Web Search Tool response can contain several different types of content blocks.
 - `TextBlock`: Claudes explanation of what it was searching for
 - `ServerToolUseBlock`: The exact search query claude used
 - `WebSearchToolResultsBlock`: A list of the results from the web search
 - `WebSearchResultBlock`: The individual search results containing titles and URLs
 - `CitationsWebSearchResultLOcation`: Specific text citations supporting Claudes generated output

 ---

## Prompt Engineering and Evaluation

Prompt Engineering and Prompt Evaluation are techniques to help you get the most out LLMs with your prompts.

 - `Prompt Engineering`: A set of best practices and guidance to improve your prompts
 - `Prompt Evaluation`: Automated testing of your prompts used to measure how effective your prompt is at producing the desired output.

### Prompt Engineering

Prompt engineering is the discipline of developing, using and evaluating techniques for writing System Prompts that improve the quality of outputs from an LLM using the System Prompt.

When crafting a system prompt you should be `Clear and Direct`, `Provide Guidelines for the output`, `Provide Examples`, `Structure the Prompt with XML` and `Include Steps to Follow` when the task has well defined steps.

**Prompt Engineering Techniques in Detail**
 - `Be Clear & Direct`: Use simple language and state explicitly what you want while avoiding fluff words and phrases like "Hi Claude", "I Think", "Please", and "Thank You".
    - When giving instructions use an action verb followed by a simple statement of the task (i.e. Create a list of the highest grossing movies of all time)
    - When asking a question start with an Interoggative Pronoun/Adverb (Who, What, Why, Where, When & How) followed by a clear question. (why was Shawshank Redemption a critical success but financial failure?)
 - `Provide Guidelines and/or Steps to follow`
    - Guidelines are qualities the output should have (i.e. respond in 2-3 paragraphs and less than 500 words)
    - Steps to follow are literally steps the model should take while reasoning about the response.
 - `Structure Prompts with XML`: Use XML Tags to separate distinct portions of the prompt. see structured prompt exampel below.
 - `Provide Examples`: 
    - `Positive Examples`: Examples of what the response should look like or include
    - `Negative Examples`: Examples of what the response shouldn't look like or include
    - `One-Shot`: Including a single example to establish a pattern
    - `Multi-shot`: Providing multiple examples to cover different scenarios.

**Structured XML Prompt Example**
```markdown
<task>Write the abstract for an academic paper on wood chucks and their ability to chuck wood.</task>
<role>A zoology gradute student working on their doctoral thesis.</role>

<context>You are conducting a research study on wood chucks and their impact on beaver dams in the Pacific Northwest. The purpose is to understand if wood chucks are destryoing beavers dams while engaging in the social activity of wood chucking.</context>

<output>
1 paragraph summary of the research studies findings and 3 bullet points capturing the most important follow up actions that should be taken.
<output>
```

### Prompt Evaluation 

Prompt Evaluation is the automated testing of a System Prompt to see how well it works. These techniques can also be used for everyday user prompts, but are usually reserved for System Prompts.

A prompt can be evaluated by. An automated evaluation pipeline allows you to
 - Test the prompts output against expected responses.
 - Compare the outputs from different versions of a prompt.
 - Review outputs for errors and biases.

**Evaluation Pipeline** Draft Prompt -> Create Evaluation Dataset[1] -> Submit prompt to Claude -> Pass outputs to a Grader -> Rinse & Repeat

[1] The evaluation set can also be referred to as Benchmark Prompts. Benchmark Prompts and pairs of example user prompts and the expected output.

### Grading Prompts

Prompts are commonly graded on a scale of 1-10 where 10 means the prompt generated the highest quality outputs and 1 represents the lowest quality output.

There are 3 types of graders; Code, Model, and Human. It is common to use multiple types of graders in an evaluation pipeline.

 - `Code`: Similar to unit tests where a function performs any kind of programmatic assertion (e.g. output length, precense or absence of words, readablity and valid syntax).
 - `Model`: Output is submitted to another model, usually one with strong reasoning capabilities, asking the reasoning model to score for the output or compare 2 outputs.
 - `Human`: A human is in the loop and reviews the outputs for quality, comprehensiveness, depth etc. Similar to Reinforced Learning from Human Feedback techniques.


**Model Grader Example**
```python
tests = [
  {
    'user_prompt': 'Can wood chucks chuck wood?',
    'expected': 'Yes wood chucks can chuck wood, but it is not very common for a wood chuck because they burrow rather than chuck wood.'
  },
  {
    'user_prompt': 'How much wood would a wood chuck chuck?',
    'expected': 'A wood chuck would chuck all of the wood.'
  }
]

# This is the prompt that is being tested.
system_prompt = """You are an expert on wood chucks and wrote a doctoral thesis on their wood chucking capabilities. You also enjoy poetry and word play so responses should be playful, rythmic, tongue twisters.
"""

for test in tests:
  # Feed each test user prompt to an LLM that uses the system prompt you are testing
  actual = client.messages.create(
    model='claude-sonnet-4@20250514',
    max_tokens=1000,
    messages=[
      {
        'role': 'user',
        'content': test['user_prompt']
      }
    ],
    system=system_prompt
  )

  grader_prompt = f"""
  You are an expert on wood chucks. Your task is to evaluate an AI-generated answer about wood chucks.

  The user prompt was
  <user_prompt>
  {test['user_prompt']}
  </user_prompt>

  The expected answer is
  <expected>
  {test['expected']}
  </expected>

  The actual AI-generated answer was
  <actual>
  {actual}
  </actual>

  Provide your evaluation as a JSON object with the following fields.
  - strengths: a list of 1-3 strengths
  - weaknesses: a list of 1-3 areas where the response could have been improved
  - reasoning: a concise justification for your evaluation
  - score: a integer between 1-10 where 10 is the highest quality response.

  The evaluation report should be provided as a JSON object adhereing to this JSON schema.
  {
    "strengths": string[],
    "weaknesses: string[],
    "reasoning: string,
    "score": number
  }
  """

  evaluation = client.messages.create(
    model='claude-sonnet-4@20250514',
    max_tokens=1000,
    messages=[
      {
        'role': 'user',
        'content': grader_prompt
      },
      {
        'role': 'assistant',
        'content': '```'
      }
    ],
    stop_sequences=['```']
  )

  # The evaluation can then be printed out, added to a global report object. Whatever is most useful for your use case.
```

 ---

## Structured Outputs

Structured Outputs is the technique of combining 2 feature of the Anthropic SDK's that
 1. enforces schema validation on tool names and inputs
 2. restricts a Models output to a specific JSON Schema or programming language specific schema definition tool (e.g. Pydantic for Python or Zod for Typescript)

The first feature is **Strict Tool Use** which can be enabled by setting `strict: true` in a Tool Definition JSON Schema. This setting causes the Model to perform additional checks when reasoning about Tool use to ensure a real tool will be called and the inputs the Model wants to call it with will match the inputs specified in the Tool Description.

The second feature is **Output Config Formats** which allows specifying a JSON Schema that describes the exact shape of the Models final response.

### Strict Tool Use

When a Tool Definition schema sets `strict: true` on a Tool definition it guarantees that any `ToolUseBlock`s the Model emits for that Tool has a `name` that is valid (i.e. is an actual tool) and an `input` field that conforms to that Tool's `input_schema`.


### Defining an Output Format

The `output_config.format` argument in `client.messages.create` accepts a JSON Schema that dictates the exact response format the Model must respond with.

**example**
```python
client = anthropic.Anthropic()

client.messages.create(
  model='claude-sonnet-4@20250514',
  max_tokens=1000,
  messages=[
    {
      'role': 'user',
      'content': 'How much wood would a wood chuck chuck?'
    }
  ],
  output_config={
    'format': {
      'type': 'json_schema',
      'schema': {
        'type': 'object',
        'properties': {
          'chucked_wood': { 'type': 'number' },
          'reason': { 'type': 'string' }
        },
        'required': [ 'chucked_wood' ], # Indicates the `chucked_wood` field is the only-required field so `reason` can be omitted in the response.
      }
    }
  }
)
```

>! [NOTE]
> Anthopic's SDKs also support Native schema definitions tools such as Pydantic for Python, Zod for Typescript, and Classes for Java, C# etc.

>! [NOTE]
> Structured Outputs don't guarantee capitalization of `const` and `enum` string values.

### Structured Output Considerations

Be aware of the following gotcha's when working with Structured Ouputs.
 - `Grammar Compilation`: Structured Outputs require extra processing so it increases latency on the first request
 - `Grammar Caching`: The grammar artifacts used to support Structured Outputs are cahed for 24-hours from last use but will be invalidated by changes in the set of tools in the request, or changes to the JSON Schema except for changes where only the `name` and/or `description` fields changed.
 - `Prompt Modification`: Structured Outputs increase token usage because an additional System Prompt is provided that explains the expected output format.
 - `JSON Schema limitations`: Not all JSON Schema concepts are supported. Ref [Anthropic's JSON Schema Limitations](https://platform.claude.com/docs/en/build-with-claude/structured-outputs#json-schema-limitations) page for a full list of what is supported and what isn't
 - `Property Ordering`: properties defined in the `output_config.format.schema` appear in order as they appear except for required fields which always appear first.
 - `Invalid Outputs`: Occassionally the Model will refuse the request or reach it's max tokens causing the Model to stop generating text before the response matches the defined output format.
 - `Complexity limits`: There following limits apply to Structured Outputs
  - 20 or less strict tools per request
  - 24 or less optional parameters
  - 16 or less parameters with `union` types

 ---

**TODO Pick back up with RAG**

## Retrieval Augmented Generation (RAG)

RAG is a technique for working with large documents that cannot fit into the constraints of Claude context window (currently 1M tokens). RAG breaks the document down into chunks, stores those chunks in a vector database as `embeddings` and uses semantic search algorithms to retrieve only the chunks that are relevant to the User Prompt.

>! [NOTE]
> It is recommended to review the `Embedding` and `Embedding Model` from the [Terminology](#terminology) section before continuing 

### RAG Pipeline Overview

 1. Break document into chunks of text (a.k.a chunking)
 2. Generate `embeddings` using an `embedding model`
 3. Store `embeddings` in a vector database
 4. Find relevant chunks using semantic search algorithms.

### Data Chunking Strategies

There are an infintie number of ways for chunking a large documents for a RAG pipeline. Here are 3 common ones.
 - `Size Based`: divides the document into strings of equal length
  - This strings should includes overlap on each side to retain context
  - easiest and simplest to implement, but loses the most context.
 - `Structure Based`: divides the document by structure (i.e. headers, paragraph breaks etc.)
  - requires preprocessing to understand the structure.
 - `Semantic Based`: divides the document into groups of related sentences or sections using Natural Language Processing (NLP)
  - requires a lot of preprocessing and is computationally expensive
  - Most versatile and leads to the best results.

### Generating Embeddings

Google Vertex provides an Embedding Model named `text-embedding-005`. This Model can be used to convert text to `embeddings`

**Generating Embeddings Example**
```python
#pip install google-genai
from google import genai

client = genai.Client(
  project="<your-project-id>",
  location="global",
  vertexai=True
)

# Generate the embeddings using text-embed-005
res = client.models.embed_content(
  model='text-embeddings-005',
  content="<Some chunk of text>"
)
```

### Storing & Searching Embeddings

Once the chunks of data have been created they need to be converted into `embeddings` using an `Embedding Model` and stored in a vector database so they can be search for when processing a users prompt.

[Voyage AI](https://www.voyageai.com/) by MongoDB is an Embedding Model provider.

When handling a users prompt the prompt is converted into embeddings using the same embedding model and then used as a query in the vector DB. The most related chunks are returned and those can be passed to the Model to generate and augmented response.

**The Math Behind Semantic Search**: Semantic search uses `cosine similarity` and `cosine distance` to determine how semantically related 2 embeddings are.

 - `cosine similarity`: A score between -1 and 1 where -1 represents not semantic relation at all and 1 means the embeddings have identical meanings semantically.
 - `cosine distance`: Defined as 1 - `cosine similarity`. This is a metric on how dissimilar the embeddings are. A cosine distance of 0 means the embeddings are essentially the same while a distance of 2 means they are complete opposites.

#### BM25 Lexical Search

BM25 (Best Match 25) is a lexical search algorithm that can be used in addition to semantic search to improve the the quality of chunks retrieved.

>! IMPORTANT
> Lexical search is useful when semantic search is unable to find chunks with a specific term because lexical search algorithms like BM25 use exact term matching.

BM25 creates it's ranking in 4 steps
 1. User query is split up into terms (Like chunking there is an infinite number of ways to split search terms but a very simple implementation is splitting by white space)
 2. The number of times each term appears in a chunk of data is counted.
 3. An importance is assigned to the terms based on how often they appeared. (Once again there's a lot of methods for assigning importance but one technique is assigning the hightest importance to the term that appears least)
 4. Chunks are returned based on which use the higher importance terms more often.

#### Merging Results in a Multi-Index RAG Pipeline

When building a RAG pipeline that uses multiple search algorithms (e.g. semantic search and BM25 lexical search) the results of those need to be merged together before being passed on the the Model.

**Reciprocal Rank Fusion (RRF)** is an algorithm for ranking a search result based on the individual search ranks given to a record by each search index.

The equation used to calculate a chunks Reciprocal Rank Fusion score is 

sum((1.0 / k + R1) + (1.0 / (k + R2)) + (1.0 / (k + Rn)))

- `k`: is some constant (usually 1)
- `R1` is the search ranking from the 1st search algorithm (e.g. semantic search)
- `R2`: is the search ranking from the 2nd search algorithm (e.g. BM25)
- `Rn`: is the search ranking from the nth search algorithm

Chunks are then ordered by their RRF score and the most relevant are returned.

#### Re-Ranking Results

Re-ranking is a post-processing step after the RRF score has been calculated that uses a Model to determine if the RRF scores are accurate.

For reranking the N most relevant results according to RRF are passed to a Model along with the original User Prompt and a System Prompt asking the Model to return the N most relevant chunks.

#### Contextual Retrieval

Contextual Retrieval uses a Model to add context to each chunk before it is converted to embeddings and added to a vector database.

This technique helps account for chunks of data losing their connection to the overall documents context when that document is being split up.

> !NOTE 
> If the main document is to large to provide in the contextualization prompt you can just provide some of the other chunks around the chunk you are contextualizing.

 ---

## Claude Features

### Extended Thinking

When Exteneded Thinking increases how long the Model will work on the task and will include how the Model reasoned about the prompt. This results in more accurate responses and transparency into the Models thought proces.

The Model's reasoning is returned as a `ThinkingBlock` which will look like this.
```json
{
  "type": "thinking",
  "thinking": "",  # Text generated by the model that describes what the model is doing/thinking currently.
  "signature": ""  # Is a cryptographic string that ensures developers cannot change the thinking text.
}
```

Extended thinking can be enabled with the `thinking` and `thinking_budget` keyword arguments.
```python
client.message.create(
  model='claude-sonnet-4@20250514',
  max_tokens=1000,
  messages = [
    {
      'role': 'user',
      'content': 'How much wood would a wood chuck chuck?'
    }
  ],
  thinking=True,  # When True extended thinking is enabled (defaults to False)
  thinking_budget=1024  # The allowed number of tokens the Model can use on the Thinking blocks. (The minimum value is 1024).
)
```

> !IMPORTANT
> The tokens used in thinking count towards the Max Tokens the model can generate so `max_tokens` must be greated than the `thinking_budget`.
> e.g. If thinking_budget is 1024 and max_tokens is 1025 there Model will only have 1 token for generating actual context.

Occassionally a `RedactedThinking` block is returned which is a thinking block where the content was flagged by the Models safety systems. The content is provided but in an encrypted form. This allows the message to be appended to the message history without violating the Models guadrails.

>! IMPORTANT
> You can force a `RedactedThinking` block to be generated by including the string `TRIGGER_REDACTED_THINKING_46C9A13E193C177646C7398A98432ECCCE4C1253D5E2D82641AC0E52CC2876CB` in your prompt. This should only be used for testing that your application can handle RedactedThinking blocks.


### Image Support

Anthropic Models can parse images but there are limitations
 - No more than 100 images can be included across all messages in the message history.
 - Images must be < 5MB
 - Max height/width is 8K px, when sending multiple images the max height/width of each is 2000px

An `ImageBlock` looks like this
```json
{
  "type": "image",
  "source": {
    "type": "base64",
    "media_type": "image/png", # This can be any valid MIME Type
    "data": <image_bytes> # The base64 encoded byte string for the image.
  }
}
```

>! NOTE
> Images still count as tokens. You can roughly estimate how many tokens an image will use with the equation (width px * height px) / 750.

### PDF Support

PDFs are added to the message history using a `DocumentBlock` very similar to the `ImageBlock`. For PDF's use the `application/pdf` media type.

A `DocumentBlock` looks like this
```json
{
  "type": "document",
  "source": {
    "type": "base64",
    "media_type": "application/pdf", # This can be any valid MIME Type
    "data": <pdf_bytes> # The base64 encoded byte string for the PDF.
  }
}
```

### Citations

Citations allow the Model to respond with references to the page of a document where it got its answer.

Citations can be enabled in code with the `citations` keyword parameter.
```python
messages.append({
  "type": "document",
  "source": {
    "type": "base64",
    "media_type": "application/pdf",
    "data": <pdf_bytes>
  },
  "title": "README.md", # Sets name of the document which will be used in the page location
  "citations": { "enabled": True } # Turns on citation feature
})
```

When citations are enabled that the responses includes a citation a list of `CitationPageLocation` are returned as part of a `TextBlock`.
```python
TextBlock(
  citations=[
    CitationPageLocation(
      cited_text="",  # The actual text beinfg cited.
      document_index=0,  # Index of the document that is being cited
      document_title="README.md",  #The title of the document being cited
      start_page_number="",  # The page # where the cited text starts 
      end_page_number=""  # The page # where the cited text ends
    )
  ]
)
```

### Prompt Caching

Prompt Caching speeds up the Models response time and reduces the tokens used.

**How it works**: The final embeddings after tokenizing the Users Prompt, generating the embeddings and contextualizing those embeddings are stored in a cache. When messages are received by the Model it will check it's cache to see if it has already processed the message before. This saves a ton of computation.

Prompt Caching can be enabled by adding the `cache_control` field to any kind of message block (e.g.. `TextBlock`, `ImageBlock`, `DocumentBlock` and/or System Prompts and tools). Any message that uses `cache_control` creates a `Cache Breakpoint`.

Here is an example of a `TextBlock` that enabled caching
```json
{
  "type": "text",
  "content": [
    {
      "type": "text",
      "text": "",  # The user prompt
      "cache_control": {
        "type": "ephemeral"
      }
    }
  ]
}
```

>! When a `Cache Breakpoint` is created all of the messages in the message history up to and including the message with the `cache_control` field will be cached. Any future message will not be cached until another `Cache Breakpoint` is created.**

**Constraints**
 - There can be a total of 4 cache break points in the message history
 - A minimum of 1024 tokens must exist in the message history before anything will be cached.

 ---

## Model Context Protocol

See notes in [Intro to MCP](./intro_to_mcp.md).

 ---

## Anthropic Apps

At the time of writing this cheat sheet the training videos only covered 2 of Anthropics apps, Claude Code and Computer Use. Co-Work is also now available but there will be no notes on that.

`Claude code`: is an agentic coding assistant. It can write code, design, architect and test anything software development related.
`Computer Use`: is a set of tools that allow Anthropics models to work with you local desktop/laptop environment.


### Using Claude Code
When using Claude in a new or existing code repository for the first time start with `/init` command. This command scans the code base and creates a CLAUDE.md file documenting architecture, coding styles etc. The CLAUDE.md file is referenced anytime you give claude code a prompt.

To append individual lines to the CLAUDE.md file start a prompt with `#`. Claude code will then ask you where that line should be stored in memory.

MCP servers can be connected to claude code using the `claude mcp add` command.

**NOTE: Look for the official MCP server for 3rd party service before trying to write your own.**

 ---

## Agents and Workflows

Agents and Workflows are 2 techniques for handling user requests that cannot be handled with a single User Prompt.

 - `Workflows`: Are best suited when the steps for completing a task are well defined.
 - `Agents`: Best suited when the goals of a task are well defined but the steps to get there are not.

### Workflow Patterns

A workflow is any series of calls to Claude that follow a predetermined sequence of steps. Workflows often follow well known patterns. There are 4 common workflow patterns
 - Evalutator-Optimizer
 - Parallelization
 - Chaining
 - Routing

#### Evaluator-Optimizer Pattern

The Evaluator-Optimizer pattern is made up of 2 components; a `Producer` and a `Grader`. The `Producer` (Claude in this case) recieved inputs and produces and output. The output is sent to the `Grader` which checks if the output meets some criteria. If the `Grader` determines the output doesn't meet the criteria then the `Grader` sends feedback to the `Producer` to try again. This cycle continues until the `Grader` determines the output meets the criteria and is provided as the final output.

#### Parallelization Pattern

The Parallelization Pattern involves sending multiple messages to Claude in parallel and then aggregating the results from each response.

Parallelizing workflows works well for
  - Complex tasks that require multiple independent sub-tasks
  - Sub tasks benefit from specialized prompting

**Parallel Workflow Pattern Example**
```python
import asyncio
from anthropic import AsyncAnthropic

client = AsyncAnthropic() # Defines an async Client

async def run_subtask(prompt: str) -> str:
  response = await client.message.create(
    model='claude-sonnet-4@20250514',
    max_tokens=1000,
    messages=[
      {
        'role': 'user',
        'content': prompt
      }
    ]
  )

  return next(block.test for block in response.content if block.type == 'text')

async def main() -> None:
  subtasks = [
    "Determine if a wood chuck can chuck wood",
    "Calculate the amount of wood a wood chuck would chuck"
  ]

  results = await asyncio.gather(*(run_subtask(t) for t in subtasks)) # Processes the results asyncronously (simulates parallel execution)
  
  # Send the subtasks and results to Claude with a special prompt instructing Claude to aggregrate the results.
  reponse = await client.message.create(
    model='claude-sonnet-4@20250514',
    max_tokens=1000,
    messages={
      'role': 'user',
      'content': f'''Aggregate the results from the following subtasks into a concise and thorough answer.

      <subtasks>{subtasks}</subtasks>
      <results>{results}</results>
      '''
    } 
  )

  print(response.content) # Prints the final aggregated response returned by Claude
```

#### Chaining Pattern

Chaining workflows together involves taking a single task and breaking it up into distinct steps that can be processed in sequence. This lets the Model focus on tasks in a specialized way.

Chaining Workflows works well when
 - The task is complex with many constraints
 - Claude is not consistently following all of the requirements
 - Outputs need to be processed or validated between steps.
 - The larger task include sub-tasks that need extra or specialized focus.

Chaining workflows in code is as simple as calling claude in sequence with the steps needed to complete a task. The only difference between this and a regular loop is each step is well-defined and might involve multiple substeps (i.e. calls to Claude) before moving on to the next step.

### Routing Workflows

A Routing workflow involves using Claude to analyze the User Prompt to determine which workflow is best for handling the prompt. 

Routing Workflows work best when
 - The Agent handles distinctly different User Prompts
 - Different types of User Prompts require different processing steps
 - You are optimizing for quality over simplicity
 - There are 3+ meaningful categories User Prompts can be categorized as.

**Routing Workflow Example**
```python
from anthropic import AsyncAnthropic

client = AsyncAnthropic()
user_input = input()

# Define a specific workflow for answering questions about wood chucks.
def answer_woodchuck_question(prompt):
  return client.messages.create(
    model='claude-sonnet-4@20250514',
    max_tokens=1024,
    messages=[
      {
        'role': 'user',
        'content': prompt
      }
    ],
    system='You are an expert on wood chucks and wrote a doctoral thesis on their wood chucking capabilities. You also enjoy poetry and word play so responses should be playful, rythmic, tongue twisters.'
  )

# Define a second workflow for answering questions about anything other than wood chucks.
def answer_non_woodchuck_question():
  return client.messages.create(
    model='claude-sonnet-4@20250514',
    max_tokens=1024,
    messages=[
      {
        'role': 'user',
        'content': prompt
      }
    ],
    system='You are an expert on everything except wood chucks. They completely baffle you.'
  )

# Call Claude specifying a User Prompt requesting Claude categorize the user input as about wood chuck or not about wood chucks
response = client.messages.create(
  model='claude-sonnet-4@20250514',
  max_tokens=1024,
  messages=[
    {
      'role': 'user',
      'content': f'''Categorize the user input as a question about wood chucks or not about wood chucks.

      <user_input>
      {user_input}
      </user_input>
      '''
    }
  ] 
)

final_response = None
if 'is about wood chucks' in response.content:
  final_response = answer_woodchuck_question(user_input)
else:
  final_response = answer_non_woodchuck_question(user_input)

print(final_response)
```

### Agents and Tools

An `Agent`'s power comes from the `tools` available to it. Given a set of abstract tools, like the built-in tools listed below, an Agent can locate, read, and update source code file.

**Built-in Tools**
  - `bash`: Run bash commands
  - `glob`: Find files
  - `grep`: Search file contents
  - `read`: Read a file
  - `write`: Create a file
  - `edit`: Edit a file
  - `webfetch`: Fetch content at a URL.
