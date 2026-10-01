# Claude on Google Cloud

[Anthropic Course Link](https://anthropic-partners.skilljar.com/claude-with-google-vertex)

## Terminology

 - `Vertex`: Google Clouds AI/ML Platform. Used for accessing managed foundational models like Anthropics. It can also be used to host custom models.
 - `User Message`: Content the user is providing to the Model.
 - `Assistant Message`: Content the Model has produced (i.e. response, tool blocks etc.)
 - `System Prompt`: A prompt defined by an application developer containing a foundational set of instructions the Model should follow.
 - `Conversation History`: An ordered list of all the User Messages, Assistant Messages, Tool Call Blocks, etc. sent/received in the current session.
 - `Temperature`: An integer between 0-1 that controls the randomness of a Models output.

## Claude API Basics

### Enabling up Claude Models on Vertex

1. Navigate to the Google Cloud Console
2. Locate and click on `Model Garden`
3. Search for "Anthropic"
4. Locate and enable to Anthropic model you would like to use.
5. (optional) install the Google Cloud CLI

### Request Lifecycle

The standard Request Lifecycle for an interaction with Claude running on Vertex is 

**1. Request sent to Server**: A request is sent from the client app the user interacts with to a web server running in Google Cloud.
**2. Request sent to Vertex**: The web server runs the Anthropic or Vertex SDK for making requests to Claude models.
  **Required Fields** when making a request to the Claude API.
  - `API Key`: Authenticates and identifies your request
  - `Model`: name of the model you want to use
  - `Message`: The conversation history as a list of messages
  - `Max Tokens`: A number indicating the max number of tokens the model can generate.
**3. Model Processing (Inference)**: The Model processes the list of messages in 4 steps
  1. `Tokenization`: The entire message is broken down into smaller chunks called tokens. 
  2. `Embedding`: Tokens are converted into embeddings. Embeddings are a numerical representation of all the tokens possible meaning.
  3. `Contextualization`: each embedding is compared to its neighbor embeddings to determine the exact meaning of the token in the surrounding context.
  4. `Generation`: An output layer generates a set of the next most likely token that should be included in the output. The next token is chosen based on probability and randomness to ensure a more natural and varied sounding response is generated.

  **NOTE: The Model stops generating text when it has hit the Max Tokens limit or a End of Sequence. (EOS) token is received. The EOS token indicates the model thinks this is a natural end to the generation.**
**4. Response sent to Server**: The generated response is sent back to the web server.
**5. Response to Client**: The webserver forwards the generated response to the client app to be shown to the user.


## Using the SDK on Vertex

The Vertext specific Client SDK largely doesn't change from the base Client SDK. This section will call out the small differences of using the SDK on Vertex. For more details see the [Using Anthropic's Client SDK](./building_with_claude_api.md#using-anthropics-client-sdk) section in the "Building with Claude API" file.

### Initializing the Client
When making a request you need the Vertex specific SDK package installed on the server that will be handling client requests.

```bash
pip install "anthropic[vertex]" # Installs the official Anthropic SDK for Vertex.
```

A client can be initialized like this.
```python
from anthropic import AnthropicVertex

client = AnthropicVertex(
  region='global',
  project_id='my-project-id' #  available in Google Cloud console.
)
```
