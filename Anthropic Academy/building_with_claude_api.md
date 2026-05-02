# Building with Claude API


## Table of Contents




## Claude Models

|  Model  | Intelligence | Reasoning |   Cost   |   Speed  |                      Use Case                |
| ------- | ------------ | --------- | -------- | -------- | -------------------------------------------- |
| Opus    | Highest      | yes       | high     | slow     | complex tasks that need a lot of reasoning   |
| Sonnet  | High         | yes       | moderate | moderate | tasks balancing cost, speed and intelligence |
| Haiku   | Moderate     | no        | low      | fast     | real-time processing                         |

When deciding on a model understand the trade-off between speed/cost vs. inteliigence and reasoning.

**NOTE: Most agentic applications will use different models for different tasks depending on the need of the task.**


## Accessing the API

You can generate an API Key from The [Anthropic Console](https://console.anthropic.com). This key is provided to an Anthropic SDK in the client constructor or as the `x-api-key` in an HTTP Request.

**NOTE: The Anthropic API does not store any messages so you must maintain a list of messages per session and sunmit those to the API each time. This allows the Anthropic Models to retain message history.**


### API Best Practices

 - **DO NOT** make requests to the Claude API from a client side application.
 - Limit the `Max Tokens` on requests to prevent excess token usage.
 - Use one of the pre-built SDKs instead of raw HTTP requests.


### How Requests are Handled

 1. `Tokenization`: Words are broken down into smalled substrings called tokens.
 2. `Embedding`: Tokens are converted into vector embeddings which are numerical representations of the meaning of that token.
 3. `Contextualization`: The numerical values in each Embedding are adjusted based on the Embeddings around it narrowing down the embedding to a precise definition of the token it represents in relationship to all the other tokens in the input.
 4. `Generation`: 

**Contextualizatin Example**: The word "set" can have multiple meanings depending on the context
 - "Please set the plates on the table". In this example "set" means to place.
 - "He has a nice tool set". In this example "set" refers to a group of things
 - "Game, set and match". In this example "set" refers to a unit of scoring in Tennis


### System Prompts

 - are pre-defined prompts written by the application developer, not the end user or anthropic team.
 - provided to the Model only once at the beginning of the chat session
 - give the Model guidance on how it should respond for that specific session.

**NOTE: When sending system prompts to the Anthropic API the System Prompt can be omitted, but it CANNOT be a null or empty value.**

### Temperature

Temperature is a parameter that can be specified when creating a new chat session that alters how creative and dynamic the responses will be.

 - `Higher temperatire`: More dynamic and creative.
 - `Lower Temperature`: More deterministic and less creative.

### Response Streaming

Since response time can vary widely depending on the length of a prompt and complexity of the task Response Streaming should be implemented so as the Model thinks and generates events these intermidate response can be displayed to the end user.

**Anthropic Stream Events**
 - `MessageStart`: An event indicating a new message is being sent from the Model to the client.
 - `ContentBlockStart`: An event indicating new block of text, tool use, or other content has started
 - `ContentBlockDelta`: An event containing a chunk of the Content being generated
 - `ContentBlockStop`: An event indicating there is no more content being generated for that block
 - `MessageDelta`: An event indicating the current message has completed
 - `MessageStop`: An event containing information about the current message.

#### Response Streaming Example

```python
messages = []
add_user_message(messages, "Write a 1 sentence description of a fake database")

stream = client.messages.create(
    model=model,
    max_tokens=1000,
    messages=messages,
    stream=True
)

for event in stream:
    print(event)
```

### Structured Data

When generating structured data (i.e. JSON, code blocks or bulleted list etc.) "Assistant Messages" and "Stop Sequences" can be used to prevent the Model from being to verbose and including formatting characters (i.e. ```, \n. etc.)

 - `Assistant Message`: a.k.a. "Prefilled Messages" are messages defined by the application developer that trick the Model into thinking it has already generated that text in the response so the model only generates what it would have after the text in the assistane message. The final response will only include what the model generated NOT the assistant message. 
 - `Stop Sequence`: A special sequence of characters that tell the Model when to stop generation.

#### Structured Data Example

```
messages = []

add_user_message(messages, "Create a sample JSON payload for an HTTP request")
add_assistant_message(messages, "```json") # Tricks the model into thinking it has already started generating the JSON

text = chat(messages, stop_sequences=["```"]) # Ensures the Model stops generating when it tries to close the 3 backticks from the assistant message.
```

 ---

## Prompt Engineering and Evaluation

Prompt Engineering and Prompt Evaluation are techniques to help you get the most out LLMs with your prompts.

 - `Prompt Engineering`: A set of best practices and guidance to improve your prompts
 - `Prompt Evaluation`: Automated testing of your prompts used to measure how effective your prompt is at producing the desired output.

### Prompt Evaluation Workflow

 1. `Draft a Prompt`: Prompt in this context means a system prompt that will be prepended to a users prompt
 2. `Create an evaluation data set`: The set of "test" user prompts that the draft prompt will be prepended to.
 3. `Feed prompt to claude`: Send each prompt from the evaluation data set with the draft prompt to Claude
 4. `Feed response through a Grader`: Take the output and feed it through a grading tool (Ths could also be a Human grader)
 5. `Refine Prompt and repeat`


### Model Based Grading

A grader takes in output from the evaluation test (see previous section) and gives an objective grade for the quality of the output.

There are 3 types of graders
 - `Code`: Similar to unit tests where a function asserts/checks for things like output length, precense or absence of words, readablity and valid syntax.
 - `Model`: Output is submitted to another model, usually one with strong reasoning capabilities, asking the reasoning model to score for the output or compare 2 outputs.
 - `Human`: A human is in the loop and reviews the outputs for quality, comprehensiveness, depth etc. Similar to Reinforced Learning from Human Feedback techniques.

**NOTE: It is a common practices to score outputs on a range from 1-10 where 10 is the hightest quality, but that is not required.**

**NOTE: Often times more than 1 type of grader are used during evaluation since each type of grader has their own strengths and weaknesses.**


### Prompt Engineering

#### Prompt Engineering Best Practices

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

#### Structured Prompt Example

```markdown
<task>Summarize the input text</task>

<context>
The user is reading a long technical document and wants a quick overview.
</context>

<input>
Kubernetes is an open-source container orchestration platform designed to automate deployment, scaling, and management of containerized applications...
</input>

<output_format>
Provide 3 bullet points with the key ideas.
</output_format>
```

 ---

## Tool Use

Tools allow Models to access info that the model wasn't trained on. A tool is literally just a function with a JSON Schema describing how the function should be called.

The tool function can be as simple as generating a timestamp or as complex as fetching data from multiple APIs and creating an aggregated response.

**Best Practice**: Use **kwargs and/or default values to make calling the tool function easier. Reference the full [Tool Use Example](#tool-use-example) below.

### Handling ToolUseBlock

When the model wants to use a Tool it returns a `ToolUseBlock` that looks like this

```
ToolUseBlock(
  id='toolu_d3db33fc4f3',
  input={'length': 128},
  name='random_password',
  type='tool_use
)
```

The `name` field is the name of the tool function that should be called and the `input` field is the inputs that should be passed in when calling the tool function.

The `id` field is a randomly genereated identifier used to tie ToolUseBlocks to the ToolResults when there are multiple ToolUseBlocks in a models response. More on this in the [Handle Tool Results](#handle-tool-results) section.

**NOTE: Since the ToolUseBlock always returns inputs as an object you should always use kwargs for the inputs to your functions.**


### Handling Tool Results

When a tool has been called a follow up message needs to be sent back to the model as a ToolResult Block. That block will look something like

```json
{
  "tool_use_id": "toolu_d3db33fc4f3",
  "type": "tool_result",
  "content": "hLP@KLE89d09a01w",
  "is_error": false
}
```

The `tool_use_id` will be the same id as seen in the `ToolUseBlock`. This ties the results back to the tool use request ensuring if multiple tools have been used each tool use gets it's results and not another tools results. The `content` field is the actual results of the tool call.


### Tool Use Example

```python
import string
import secrets

client = None # TODO figure out what this should be.

# Given this function for generating a random password of varying length
def random_password(length:int = 32):
  letters = string.ascii_letters
  digits = string.digits
  special_chars = "!@#$%^&*()-_=+[]{}" 

  allowed_chars = letters + digits + special_chars
  return ''.join(secrets.choice(allowed_chars) for _ in range(length))


# It can be defined as a tool function using the ToolParam type from Anthropics SDK
# This defines how the tool is used but, the Model is still not aware it exists yet.
from anthropic.types import ToolParam, ToolUseBlock, ToolResultBlockParam, Message

gen_secure_password_schema = ToolParam({
  "name": "generate_secure_password",
  "description": "Generate a cryptographically secure random password using letters, digits, and special characters.",
  "input_schema": {
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


# The User prompt. Since this is an example it's hardcoded.
messages = [
  {
    'role': 'user', # Indicates this message came from the end user
    'content': 'Generate a new password for me. Make it long and secure.'
  }
]

# When creating the initial message include the ToolParam object in the `tools` list.
# This lets the Model know what tools are available to it.
model_res = client.messages.create(
  model='claude-haiku-4-5-20251001',
  max_tokens=1000,
  messages=messages,
  tools=[gen_secure_password_schema]
)

# If the Models response includes a ToolUseBlock that tool use needs to be recorded in the message history.
# Assuming we recevied a response that looked like this
Message(id='msg_13471337', content=[
  ToolUseBlock(
    id='toolu_d34db33fc4f3',
    input={'length': 128},
    name='random_password',
    type='tool_use'
  )
]

# The content can be recorded as an assistant message.
messages.append({
  'role': 'assistant', # indicates this message came from the agent we are building
  'content': model_res.content
  }
)

# The tool function still needs to be called though and the ToolResult added to the message history.

# Calling a tool function is as simple as calling it with the endpoints.
#password = random_password(**model_res.content[0].input)

# However since you don't always know which tool(s) the model will want to use you need to have something like this that dynamically looks up the tool function and calls it.
tool_func = globals()[model_res.content[0].name]
tool_res = tool_func(**model_res.content[0].input)

# A ToolResult block then needs to be added to the message history to tie the ToolResult to the ToolUseBlock.
# Tool results are sent with role 'user' because only the user/client can execute tools and report results
# back to the model — the model itself cannot run code.
messages.append({
  'role': 'user',
  'content': [
    {
      'type': 'tool_result',
      'tool_use_id': model_res.content[0].id, # Should be the id from the ToolUseBlock
      'content': tool_res, # In this case it's just a random password
      'is_error': False # Set to true if there was an error when generating the password.
    }
  ]
})


# The final step is to pass this all back to the Model so it can use the tool response in it's final answer.
client.messages.create(
  model=model,
  max_tokens=1000,
  messages=messages,
  tools=[gen_secure_password_schema] # Since we reference the tool in the message history we need to provide the tool schema again. 
)
```

### Implementing Multiple Turns

In reality even mildly complex prompts will trigger multiple ToolUseBlocks so our agent will need to handle multiple turns of calling the Model, calling tools, and then calling the Model again before sending the final result.

The general implementation uses a `while` loop that runs until the Model stops asking to use tools.

Possible values for `stop_reason` are 
 - `tool_use`: The model wants to use a tool. 
 - `end_turn`: The model is done and wants to send a message to the end user
 - `max_tokens`: The max allowed number of tokens has been generated
 - `stop_sequence` A customer stop sequence was encountered.

 ---

## Retrieval Augmented Generation (RAG)

RAG is a technique for working with large documents that can't fit in a single prompt so that document needs to be broken down into smaller chunks and stored in a format that the Model can retrieve when it is relevant.

When searching the smaller chunks of data to find which are relevant a technique called semantic search will be used. Semantic search relies on the data being formatted as an `embedding` which means the data needs to be stored as an `embedding`. To store an `embedding` you will use a Vector Database (a special database for storing and querying embeddings)

**NOTE: An `embedding` is a numerical representation of text that captures the semantic meaning of the text.**

### RAG Pipeline Overview

 1. Break document into chunks of text (a.k.a chunking)
 2. Generate embeddings using an Embedding Model
 3. Store embeddings in a vector database
 4. Find relevant chunks (semantic search)

**NOTE: An `Embedding Model` is an algorithm that converts raw data into embeddings.**

#### Chunking Data

There are an infintie number of ways for breaking a large documents into chunks of text for a RAG pipeline. Here are 3 common ones.
 - `Size Based`: divides the document into strings of equal length
  - This strings should includes overlap on each side to retain context
  - easiest and simplest to implement, but loses the most context.
 - `Structure Based`: divides the document by structure (i.e. headers, paragraph breaks etc.)
  - requires preprocessing to understand the structure.
 - `Semantic Based`: divides the document into groups of related sentences or sections
  - requires a lot of preprocessing and is computationally expensive
  - leads to the best results.

#### Storing & Searching Embeddings

Once the chunks of data have been created they need to be converted into `embeddings` using an `Embedding Model` and stored in a vector database so they can be search for when processing a users prompt.

[Voyage AI](https://www.voyageai.com/) by MongoDB is an Embedding Model provider.

When handling a users prompt the prompt is converted into embeddings using the same embedding model and then used as a query in the vector DB. The most related chunks are returned and those can be passed to the Model to generate and augmented response.

#### The math behind Semantic Search

Semantic search uses `cosine similarity` and `cosine distance` to determine how semantically related 2 embeddings are.

 - `cosine similarity`: A score between -1 and 1 where -1 represents not semantic relation at all and 1 means the embeddings have identical meanings semantically.
 - `cosine distance`: Defined as 1 - `cosine similarity`. This is a metric on how dissimilar the embeddings are. A cosine distance of 0 means the embeddings are essentially the same while a distance of 2 means they are complete opposites.

#### BM25 Lexical Search

BM25 (Best Match 25) is a lexical search algorithm that can be used win addition to semantic search to improve the the quality of chunks retrieved.

**NOTE: Lexical search rather than focusing on semantic meaning of text matches exact words or phrases from the user query to the data being searched.**

#### Merging Results in a Multi-Index RAG Pipeline

When building a RAG pipeline that uses multiple search algorithms (i.e. semantic search and BM25 lexical search) the results of those need to be merged together before being passed on the the Model.

**Reciprocal Rank Fusion** is an algorithm for ranking a search result based on the individual search ranks given to a record by each search index.

 ---

### Claude Features

#### Extended Thinking

When Exteneded Thinking increases how long the Model will work on the task and will include how the Model reasoned about the prompt. This results in more accurate responses and transparency into the Models thought proces.

The Model's reasoning is returned as a ThinkingBlock which will look like this.
```json
{
  "type": "thinking",
  "thinking": "",
  "signature": ""
}
```

In the ThinkingBlock the `thinking` field is text generated by the Model that describes what the Model is doing/thinking currently to process the prompt. The `signature` field is used to ensure developers cannot change the thinking blocks and steer claude in a different direction.

Occassionally a RedactedThinking block is returned which is a thinking block where the content was flagged by the Models safety systems. The content is provided but in an encrypted form. This allows the message to be appended to the message history without violating the Models guadrails. (i.e. generating dangerous or offensive content)

**NOTE: Your code SHOULD be able to handle RedactedThinking blocks when Extended Thinking is enabled.**

#### Image Support

Anthropic Models can parse images but there are limitations
 - No more than 100 images can be included across all messages in the message history
 - Images must be < 5MB
 - Max height/width is 8k px, when sending multiple images the max height/width of each is 2000px

**NOTE: Images still count as tokens. You can roughly estimate how many tokens an image will use with the equation (width px * height px) / 750.**

Images are sent with ImageBlock that contain the base64 encoded image bytes or a URL to the image.

**NOTE: In the ImageBlock specify the media type used MIME types (i.e. image.png).**


#### PDF Support

PDFs are added to the message history using a DocumentBlock very similar to the ImageBlock. For PDF's use the `application/pdf` media type.

#### Citations

Citations allow the Model to respond with references to a page location for where is got its answer.

Citations can be enabled in code like so
```python
messages.append({
  "type": "document",
  "source": {
    "type": "base64",
    "media_type": "application/pdf",
    "data": <base64-encoded-bytes>
  },
  "title": "README.md", # Sets name of the document which will be used in the page location
  "citations": { "enabled": True } # Turns on citation feature
})
```

#### Prompt Caching

Prompt Caching speeds up the Models response time and reduces the tokens used.

**How it works**: The final embeddings after tokenizing the users prompt, generating the embeddings for the prompt and contextualizing those embeddings are stored in a cache.

When messages are received by the Model it will check it's cache to see if it has already processed the message before. This saves a ton of computation.

Prompt Caching can be enabled by adding the `cache_control` field to any kind of message block (i.e. TextBlock, Image/Document Blocks and/or System Prompts and tools). This is referred to as creating a `Cache Breakpoint`.
```json
{
  ...
  "cache_control": {
    "type": "ephemeral"
  }
}
```

**NOTE: When a `Cache Breakpoint` is created all of the messages in the message history and the message including the `Cache Breakpoint` will be cached.**

Constraints
 - There can be a total of 4 cache break points in the message history
 - A minimum of 1024 tokens must exist in the message history before anything will be cached.
