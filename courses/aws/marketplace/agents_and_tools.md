# AI Agents & Tools Listing Details

AWS defines an AI agent as software that uses artificial intelligence to reason, plan, and complete tasks on behalf of humans or systems. The distinction it draws is autonomy.

The category also covers **agentic tools** (i.e. components that make somebody else's agent more capable rather than acting on their own). AWS lists
 - Knowledge Bases
 - Guardrails
 - MCP servers
 - Specialised APIs

Yes, a knowledge base is not an agent, but it belongs in this category because agents are what consume it.

> [!NOTE]
> `AI Agents & Tools` is a category rather than a product type. Both paths resolve to a listing documented elsewhere in this document, so Pricing Models and Pricing Dimensions are inherited rather than defined here.

### Fulfillment (AI Agents & Tools)

One question decides the path: **whose infrastructure does the agent run on?** If the Seller hosts it, the listing is SaaS. If the Buyer hosts it, the listing is a Container Product.

| | `API deployment` | `Container deployment` |
| --- | ---------------- | ---------------------- |
| Becomes | A SaaS listing using the `Agents API` Fulfillment option | A Server Product (Container) listing |
| Runs on | The Seller's infrastructure | The Buyer's AWS account |
| The Buyer's data | Leaves their account and is processed on the Seller's servers | Never leaves their environment |
| Who operates it | The Seller. Updates reach every Buyer automatically | The Buyer. They choose when to upgrade |
| Choose it when | The agent needs specialised hardware or a proprietary model the Seller will not hand over | Buyers work with data that cannot leave their environment, or need to meet regulatory requirements the Seller's platform doesn't cover |
| Detailed Docs | [Agents API](./saas.md#agents-api) | [Fulfillment (Container)](./server_container.md#fulfillment) |

AWS frames the decision around three considerations. Each one asks a different question, and the answer pushes toward one option or the other.
 - **Is the Buyer allowed to send this data to the Seller at all?** API deployment processes the Buyer's data on the Seller's servers, which some Buyers cannot permit due to data sovereignty laws.
 - **Could the Buyer realistically run this themselves?** Some agents depend on specialised hardware or on a model the Seller has no intention of shipping to anyone. *"For large or complex models that require specialized hardware, API deployment might be more practical."* The more exotic the requirements, the more container deployment turns into a support problem, because every Buyer has to reproduce an environment the Seller no longer controls.
 - **Which party absorbs the cost of keeping it running, and where does the Seller's own effort go?** This is the only one of the three that genuinely cuts both ways. With API deployment the Seller pays to run infrastructure for every Buyer, but ships a fix once and everyone has it. With container deployment the Buyer pays for the infrastructure, but the Seller ends up supporting many versions running in environments they cannot see or upgrade.

#### Container deployment

An Agent or Tool deployed as a Container Product supports the same features and has the same constraints as a standard Container Product. The only difference specfic to Agents is the runtime.

**Amazon Bedrock AgentCore Runtime** is AWS's managed hosting environment for agents. The Buyer does not manage servers; they point AgentCore at the Seller's image and invoke it. The Seller declares which of three types the container is, and each speaks a different protocol.

| Type | What it is |
| ---- | ---------- |
| `AI Agent` | An agent the Buyer's applications call directly to have work done. |
| `MCP Server` | A tool an agent consumes, exposed over the Model Context Protocol, which is the standard way an agent discovers what a tool can do and then calls it. |
| `A2A Server` | An agent that other agents talk to, over the Agent-to-Agent protocol. It publishes an "agent card" describing its own capabilities so other agents can discover it. |

Choosing `AI Agent` or `A2A Server` requires the Seller to confirm that the Product uses reasoning LLMs and demonstrates autonomous capabilities. This ensures Agents get listed as Agents and Tools get listed as Tools.

Two practical constraints on the container itself
 1. it **must be built for ARM64**
 2. it must ship free of known vulnerabilities and hardcoded credentials like any other Container Product.

The Seller can also declare **environment variables** the Buyer must supply (e.g. API keys, endpoints, feature flags, etc.). These are pre-populated on the launch screen with any defaults the Seller set, which is how a container Agent gets configured without the Seller ever touching the Buyer's account. Credentials should have no default value.

> [!IMPORTANT]
> **AgentCore Runtime blocks two Pricing Models.** If the container image uses AgentCore, the **Hourly** and **Usage with long-term contract** pricing models are not supported. That leaves `Free`, `Bring Your Own License`, `Monthly`, `Usage-based`, and `Contract-based` from the [Container Pricing Models](./server_container.md#pricing-models). A Seller who wanted per-hour billing for an agent has to choose a different model or host it themselves as an API deployment.

> [!WARNING]
> **A new container agent does not appear on the AI Agents and Tools page until it has an AgentCore version.** Only products with versions that support Amazon Bedrock AgentCore Runtime will be visible in the AI agents and tools product page. Until the Seller adds that first version, the Product is only findable under **Server products** in the Management Portal. This looks like the listing failed to create; it hasn't.
