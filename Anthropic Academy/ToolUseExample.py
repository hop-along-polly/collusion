### Tool Use Example

import string
import secrets
from anthropic import Anthropic

client = Anthropic()

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
