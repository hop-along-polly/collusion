import secrets
import string
from collections import namedtuple
from datetime import datetime

from anthropic import AnthropicVertex
from anthropic.types import (
  ToolParam,
  ToolUseBlock,
  ToolResultBlock
)

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

get_current_timestamp_schema = ToolParam({
  "name": "get_current_timestamp",  # Must match the name of the function that will be called.
  "description": "Returns the current datetime in the format '%H-%m-%d %H:%M:%S'",
  "input_schema": {  # The actual JSON Schema spec.
    "type": "object",
    "properties": {},
    "required": [],
    "additionalProperties": False
  }
})


def random_password(length:int = 32):
  letters = string.ascii_letters
  digits = string.digits
  special_chars = "!@#$%^&*()-_=+[]{}" 

  allowed_chars = letters + digits + special_chars
  return ''.join(secrets.choice(allowed_chars) for _ in range(length))


def get_current_timestamp():
  return datetime.now().strftime('%H-%m-%d %H:%M:%S')


def call_tool(tool_use_block: ToolUseBlock) -> ToolResultBlock:
  # look up the tool function pointer in Python globals
  tool_to_call = globals()[tool_use_block.name]

  # Call the tool w/ inputs.
  res = tool_to_call(
    **tool_use_block.input
  )

  return ToolResultBlock(
    tool_use_id=tool_use_block.id,
    type='tool_result',
    content=res,
    is_error=False # Default to false but if an error is encountered set to true.
  )


if __name__ == '__main__':

  client = AnthropicVertex(
    region='global',
    project_id='my-project-id' #  available in Google Cloud console.
  )
  conversation_history = []
  conversation_history.append(
    {
      'role': 'user',
      'content': 'Reset the password for my wood chucks account and print out the new password and date and time it was reset.'
    }
  )


  response = client.message.create(
    model='claude-sonnet-4@20250514',
    max_tokens=1000,
    messages=conversation_history,
    tools=[random_password_schema, get_current_timestamp_schema]  
  )

  # Assuming the following response was received.
  # {
  #   "id": "msg_randomId",
  #   "content": [
  #     ToolUseBlock(
  #       id='toolu_d3db33fc4f3',
  #       input={'length': 16},
  #       name='random_password',
  #       type='tool_use'
  #     ),
  #     ToolUseBlock(
  #       id='toolu_13471337',
  #       input={},
  #       name='get_current_timestamp',
  #       type='tool_use'
  #     )
  #   ]
  # }

  for block in response['content']:
    if block['type'] == 'tool_use':
      tool_res = call_tool(block)
      conversation_history.append({
        'role': 'user',
        'content': [tool_res]
      })

    # Calls the model again after getting all of the tool results.
    final_res = client.messages.create(
      model='claude-sonnet-4@20250514',
      max_tokens=1000,
      messages = conversation_history,
      tools=[random_password_schema, get_current_timestamp_schema] 
    )

  print(final_res)
  print(conversation_history)
