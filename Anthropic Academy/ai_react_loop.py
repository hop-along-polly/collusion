import secrets
import string
from collections import namedtuple

# Since this is for demonstration purposes only I am not importing the actual
# ToolUseBlock type from anthropic.type
ToolUseBlock = namedtuple('ToolUseBlock', ['id', 'input', 'name', 'type'])
ToolResultBlock = namedtuple('ToolResult', ['tool_use_id', 'type', 'content', 'is_error'])


def random_password(length:int = 32):
  letters = string.ascii_letters
  digits = string.digits
  special_chars = "!@#$%^&*()-_=+[]{}" 

  allowed_chars = letters + digits + special_chars
  return ''.join(secrets.choice(allowed_chars) for _ in range(length))


def call_tool(tool_use_block) -> ToolResultBlock:
  # look up the tool function pointer in Python globals
  tool_to_call = globals()[tool_use_block.name]

  # Call the tool w/ inputs.
  res = tool_to_call(
    **tool_use_block.input
  )

  return ToolResultBlock(
    tool_use_id=tool_use_block.id,
    type='tool_use',
    content=res,
    is_error=False # Default to false but if an error is encountered set to true.
  )


if __name__ == '__main__':

  response = [
    ToolUseBlock(
      id='toolu_d3db33fc4f3',
      input={'length': 16},
      name='random_password',
      type='tool_use'
    )
  ]

  res = call_tool(response[0])
  print(res)
