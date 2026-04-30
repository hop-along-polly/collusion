# Building with Claude API

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

### Best Practices

 - **DO NOT** make requests to the Claude API from a client side application.
 - Limit the `Max Tokens` on requests to prevent excess token usage.
 - Use one of the pre-built SDKs instead of raw HTTP requests.


## How Anthropic API Handles requests

 1. `Tokenization`: Words are broken down into smalled substrings called tokens.
 2. `Embedding`: Tokens are converted into vector embeddings which are numerical representations of the meaning of that token.
 3. `Contextualization`: The numerical values in each Embedding are adjusted based on the Embeddings around it narrowing down the embedding to a precise definition of the token it represents in relationship to all the other tokens in the input.
 4. `Generation`: 

**Contextualizatin Example**: The word "set" can have multiple meanings depending on the context
 - "Please set the plates on the table". In this example "set" means to place.
 - "He has a nice tool set". In this example "set" refers to a group of things
 - "Game, set and match". In this example "set" refers to a unit of scoring in Tennis


## System Prompts

 - are pre-defined prompts written by the application developer, not the end user or anthropic team.
 - provided to the Model only once at the beginning of the chat session
 - give the Model guidance on how it should respond for that specific session.

**NOTE: When sending system prompts to the Anthropic API the System Prompt can be omitted, but it CANNOT be a null or empty value.**

### System Prompt Example
**TODO**: Write an example System Prompt and then call out how each sentence or section helps guide Claude. This will be way more tangible.


## Temperature

Temperature is a parameter that can be specified when creating a new chat session that alters how creative and dynamic the responses will be.

 - `Higher temperatire`: More dynamic and creative.
 - `Lower Temperature`: More deterministic and less creative.


## Response Streaming

Since response time can vary widely depending on the length of a prompt and complexity of the task Response Streaming should be implemented so as the Model thinks and generates events these intermidate response can be displayed to the end user.

**Anthropic Stream Events**
 - `MessageStart`: An event indicating a new message is being sent from the Model to the client.
 - `ContentBlockStart`: An event indicating new block of text, tool use, or other content has started
 - `ContentBlockDelta`: An event containing a chunk of the Content being generated
 - `ContentBlockStop`: An event indicating there is no more content being generated for that block
 - `MessageDelta`: An event indicating the current message has completed
 - `MessageStop`: An event containing information about the current message.

### Response Streaming Example

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

## Structured Data

When generating structured data (i.e. JSON, code blocks or bulleted list etc.) "Assistant Messages" and "Stop Sequences" can be used to prevent the Model from being to verbose and including formatting characters (i.e. ```, \n. etc.)

 - `Assistant Message`: a.k.a. "Prefilled Messages" are messages defined by the application developer that trick the Model into thinking it has already generated that text in the response so the model only generates what it would have after the text in the assistane message. The final response will only include what the model generated NOT the assistant message. 
 - `Stop Sequence`: A special sequence of characters that tell the Model when to stop generation.

### Structured Data Example

```
messages = []

add_user_message(messages, "Create a sample JSON payload for an HTTP request")
add_assistant_message(messages, "```json") # Tricks the model into thinking it has already started generating the JSON

text = chat(messages, stop_sequences=["```"]) # Ensures the Model stops generating when it tries to close the 3 backticks from the assistant message.
```


## Prompt Engineering & Evaluation

Prompt Engineering and Prompt Evaluation are techniques to help you get the most out LLMs with your prompts.

 - `Prompt Engineering`: A set of best practices and guidance to improve your prompts
 - `Prompt Evaluation`: Automated testing of your prompts used to measure how effective your prompt is at producing the desired output.

### Prompt Evaluation Workflow

 1. `Draft a Prompt`: Prompt in this context means a system prompt that will be prepended to a users prompt
 2. `Create an evaluation data set`: The set of "test" user prompts that the draft prompt will be prepended to.
 3. `Feed prompt to claude`: Send each prompt from the evaluation data set with the draft prompt to Claude
 4. `Feed response through a Grader`: Take the output and feed it through a grading tool (Ths could also be a Human grader)
 5. `Refine Prompt and repeat`


## Model Based Grading

Restart Here.

