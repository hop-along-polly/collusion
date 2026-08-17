# Structured Output

Structured Outputs is the technique of combining 2 feature of the Anthropic SDK's that
 1. enforces schema validation on tool names and inputs
 2. restricts a Models output to a specific JSON Schema or programming language specific schema definition tool (e.g. Pydantic for Python or Zod for Typescript)

The first feature is **Strict Tool Use** which can be enabled by setting `strict: true` in a Tool Definition JSON Schema. This setting causes the Model to perform additional checks when reasoning about Tool use to ensure a real tool will be called and the inputs the Model wants to call it with will match the inputs specified in the Tool Description.

The second feature is **Output Config Formats** which allows specifying a JSON Schema that describes the exact shape of the Models final response.

## Strict Tool Use

When a Tool Definition schema sets `strict: true` on a Tool definition it guarantees that any `ToolUseBlock`s the Model emits for that Tool has a `name` that is valid (i.e. is an actual tool) and an `input` field that conforms to that Tool's `input_schema`.


## Defining an Output Format

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

## Considerations

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
