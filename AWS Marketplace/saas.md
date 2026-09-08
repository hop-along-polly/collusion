# SaaS Listing Details

A SaaS (software as a service) listing is how a Seller sells software that they host and operate. The Buyer never receives a copy of the Seller's software and usually they don't install anything in their AWS Account. Buyers subscribe through AWS Marketplace, AWS bills the Buyer through their AWS account, and the Buyer uses the Product, which runs on the Seller's infrastructure.

This is what separates SaaS from the other Marketplace listing types. With a server, machine learning, or data listing, the Buyer receives something that runs in their own environment. With SaaS, they receive access to something running in the Seller's.

## Fulfillment

When a Buyer subscribes, AWS Marketplace has processed a purchase but has not actually given the Buyer anything, because the Seller's software is not AWS's to hand over. Something has to connect "I subscribed" to "I can now use this." Fulfillment options are that connection. They answer a single question: **how does the Buyer get access to the Product they just paid for**?

A SaaS listing can be delivered by 1 of the following 2 Fulfillment options; `Classic SaaS` or the `Agents API`. Both Fulfillment options require a `FulfillmentURL`, which serves the same purpose for both, and both support `Quick Launch`, which serves a different purpose in each.

The `FulfillmentURL` is the registration landing page for the Product. After the Buyer clicks "Buy" or "Accept Offer" in the Marketplace they are taken to an AWS Page with a button to "Set up your account". It is only after the Buyer clicks that button that a POST request is sent to the `FulfillmentURL` carrying an `x-amzn-marketplace-token` form parameter. That POST *is* how the Buyer arrives on the Seller's page. The Seller exchanges the token for the `CustomerAWSAccountId`, `LicenseArn`, and `ProductCode` using the `ResolveCustomer` API. Note the `x-amzn-marketplace-token` is only valid for about 1 hour, so it should be resolved immediately.

> [!IMPORTANT]
> The POST originates from the Buyer's browser, not from AWS. A Buyer who subscribes but never clicks "Set up your account" never reaches the `FulfillmentURL` at all, leaving the Seller with a paying customer they cannot identify. Subscription events are the Seller's independent signal that a purchase happened, which is why they must be handled separately from fulfillment.

> [!NOTE]
> When deciding between the `Classic SaaS`, and the `Agents API` Fulfillment options agentic-ness is the determining factor. If the Product uses AI to reason, plan, or complete tasks on behalf of humans/systems then use the `Agents API` otherwise use `Classic SaaS`.

#### Classic SaaS

> [!NOTE]
> The AWS Marketplace refers to the Classic SaaS Fulfillment Option as just SaaS. To distinguish the SaaS Fulfillment Type from a SaaS Listing this document uses Classic SaaS for the Fulfillment Option.

**Use Case**: When the Buyer accesses a Web UI and/or integrates the Product's API into their product.

**Quick Launch**: For the `Classic SaaS` Fulfillment option; Quick Launch is **optional**, can be added/modified after the listing has been created, and used to provide a `CloudFormation` template for installing any infrastructure (e.g. IAM Role) needed in the Buyer's AWS Account.

| Field | Required? | Description |
| ----- | --------- | ----------- |
| `FulfillmentURL` | Required | The registration landing page the Buyer is POSTed to after subscribing. |
| Quick Launch | Optional | Configured on the **Fulfillment options** tab after the listing exists. Has its own visibility lifecycle, so it can be tested while Limited and published separately. |
| Account login details | Required *if* Quick Launch | A URL where the Buyer can log in or create an account. Opens in a new tab from the Quick Launch page, separate from the `FulfillmentURL`. |
| `CloudFormation` template | Required *if* Quick Launch | Title, description, stack name, and an S3 URL to the template. AWS reviews it. One template is preferred over several. |
| Required IAM permissions | Required *if* Quick Launch | The permissions the Buyer must grant for the template to deploy. Must include the `secretsManager` actions if the Seller shares deployment parameters as secrets. |
| `LaunchURL` | Required *if* Quick Launch | Where the Buyer accesses the Product once the stack has finished deploying. |
| Manual configuration instructions | Optional | Written steps for Buyers who would rather configure the Product by hand. |
| Allowlisted accounts for Quick Launch | Optional | AWS accounts that can see the Quick Launch experience while it is still Limited. |

#### Agents API

**Use Case**: When the Product is built for Agents rather than humans (i.e. is an MCP Server, Agent, Guardrail etc.)

**Quick Launch**: For the `Agents API` Fulfillment option; Quick Launch is **recommended** but **optional**, cannot be added/modified after the listing has been created, and uses the `Deployment API` to provision API keys directly in the Buyer's AWS Account.

> [!NOTE]
> If Quick Launch is not used for the `Agents API` listing type the `FulfillmentURL` should Redirect the Buyer to the Product portal where they can generate API Keys.

The `Agents API` Fulfillment Option additionally requires an `EndpointURL` to be specified. This URL is where the Buyer's Agents call the Product.

| Field | Required? | Description |
| ----- | --------- | ----------- |
| Fulfillment method | Required | Either **Quick Launch** or **Redirect to your website**. Chosen in the listing wizard and permanent once the Product is published. |
| `FulfillmentURL` | Required | The registration landing page the Buyer is POSTed to after subscribing. |
| Tool type | Required | AI Agent, MCP Server, Knowledge base, Guardrail, or Other. Choosing AI Agent requires confirming the Product uses reasoning LLMs and acts autonomously. |
| `EndpointURL` | Required | Where the Buyer's code or Agent calls the Product. Either static, or dynamic using `{paramName}` placeholders. |
| Endpoint parameters | Required *if* the endpoint is dynamic | Up to 5 per endpoint, each with a name and optional description and default value. Delivered per-Buyer via `PutDeploymentParameter`. **A dynamic endpoint forces the Quick Launch fulfillment method.** |
| Authorization method | Required | Either API Keys or OAuth 2.0. |
| Usage instructions | Required | Prerequisites, authentication setup, supported endpoints, request/response schema, rate limits, and error codes. Reviewed by AWS. |
| Bedrock AgentCore integration | Optional | Exposes the Product as an AgentCore Gateway target. Requires an OpenAPI spec unless it is an MCP server using two-legged OAuth. |
| API integration protocols | Optional | Declares MCP and/or A2A support. |


### Pricing Models

SaaS listings can follow 4 different Pricing Models; `Free`, `Contract-Based`, `Usage-Based`, or `Contract + Usage`. More details on the specific pricing models below.
 - `Free`: the Buyer can use the Product at no cost. AWS Marketplace does not collect fees.
 - `Contract-based`: the Buyer agrees to specified quantity of use of the Product (i.e Entitlements) for a set amount of time (1mo, 12mo, 24mo, or 36mo). Contract-based Products are billed at purchase time.
 - `Usage-based`: the buyer pays for what they consumed/used (i.e. Metering). Usage-based Products are billed after the fact.
 - `Contract + Usage`: the buyer agrees to a specific quantity of use, but will pay variable usage costs if they exceed the set amount. Contract + Usage Product bill the Entitlements at purchase time and overages after the fact, usually at the end of the month.


#### Pricing Dimensions

You can think of Pricing Dimensions as the line items on an itemized receipt. For a Contract-based Pricing Model each line item consists of a quantity, price, and a duration specifying how long the Buyer can use the unit(s) they bought. For Contract-based pricing the Buyer either runs out of units or the contract duration elapses. For a Usage-based Pricing Model each line item consists of a price per unit and that's it. The table below details the pricing dimensions and which Pricing Models they apply to.

| Dimension (units) | Pricing Models | Use Cases | Everyday Example | Description |
| ----------------- | -------------- | --------- | ---------------- | ----------- |
| Bandwidth (GBps, MBps) | <ul><li>Contract</li><li>Usage</li><li>Contract + Usage</li></ul> | Throughput provisioned or consumed. A CDN, VPN concentrator, or streaming service priced on the size of the pipe rather than what flows through it. | **Home internet service.** The Buyer pays for a 500 Mbps line whether they download anything or not, the price is the size of the pipe, not what flows through it. | The only category measured as a *rate*. The Buyer reads the price as a speed, so use it when they buy capacity per second rather than a total. |
| Data (MB, GB, TB) | <ul><li>Contract</li><li>Usage</li><li>Contract + Usage</li></ul> | Volume ingested, stored, scanned, or transferred. Log ingestion, backup storage, document processing, data enrichment. | **A municipal water bill.** The same pipe, except now the meter counts the gallons that actually flowed. Nothing is owed for capacity left unused. | Measures a *volume* rather than a rate. Use it when the Buyer's question is "how much data", not "how fast". |
| Hosts (hours) | <ul><li>Contract</li><li>Usage</li><li>Contract + Usage</li></ul> | Per-machine coverage. Endpoint agents, vulnerability scanners, backup agents, and monitoring Products that attach to a server. | **Vehicle insurance.** Priced per car on the policy, for as long as it stays on the policy, no matter how far any of them is driven. | Billed as quantity × hours. Arithmetically identical to `Users`, the only difference is that the listing page says "hosts". |
| Requests | <ul><li>Contract</li><li>Usage</li><li>Contract + Usage</li></ul> | Per-call pricing. APIs, MCP servers, inference endpoints, webhook processors, anything where one invocation is one unit of value. | **A toll road.** One crossing, one charge. There is no monthly fee and no clock — only the number of times the barrier lifts. | A plain count with no time component. Choose it over `Units` when the Buyer already thinks of consumption as "per call". |
| Units | <ul><li>Contract</li><li>Usage</li><li>Contract + Usage</li></ul> | Anything the other five don't describe. Documents processed, credits, tokens, transactions, jobs run, devices enrolled. | **Arcade tokens.** The token itself doesn't say what it buys; the arcade decides what each machine costs. AWS likewise bills a count of `Units` without knowing what a Unit is. | The documented fallback category: *"If none of the predefined categories fit your needs, you can choose the more generic **Units** category."* |
| Users (hours) | <ul><li>Contract</li><li>Usage</li><li>Contract + Usage</li></ul> | Per-seat licensing. Named users, administrators, analysts, or an Agent acting on one person's behalf. | **A gym membership.** Priced per member per month, whether or not that member ever shows up. | Billed as quantity × hours. Arithmetically identical to `Hosts`. |

> [!IMPORTANT]
> **`Hosts`, `Requests`, `Units`, and `Users` are labels, not mechanisms.** Every category bills the same way — `quantity × price per unit` — and AWS never validates or interprets which one was chosen. The documentation states its only function plainly: *"The pricing category appears to customers on the AWS Marketplace website."* So the Seller should pick whichever word makes the listing page clearest to the Buyer.
>
> Two real distinctions survive the label, and both matter when setting up a listing:
>  - **`Hosts` and `Users` are time-denominated (hours); `Requests` and `Units` are not.** This changes how the Buyer reads the rate ($5 per user per hour versus $5 per request), not how AWS calculates the bill.
>  - **The category is chosen once for the whole Product, not per dimension.** The Seller selects one category on the **Pricing** tab and every Pricing Dimension on the Product then lives under it. A Product priced on `Users` cannot also expose a `Requests` dimension, so `Units` is the right choice for anything that needs to mix. Each dimension picks its own unit from within the category, and that unit is permanent once the dimension is created.


### Express Private Offers

Every [Private Offer](./private_offers.md) is negotiated by hand. *Express private offers* automate that negotiation for standard deals, so a Buyer can receive a discounted private offer without a Seller's sales team touching it, while unusual or high-value requests are still routed to a human.

This capability exists **only for SaaS Listing with a Contract or Contract + Usage Pricing Model**. It is not available for Usage-based SaaS Products, and not for any other listing type. The Seller must also have completed onboarding for the **Request Private Offer** button before it can be configured.

The mechanism is a **rate card** — a set of predefined discounts and qualification criteria the Seller configures once, which the system then applies per Buyer. The workflow has three phases.

 1. **Rate card setup.** The Seller defines base pricing, dimension descriptions (each a minimum of 250 characters, since Buyers read them while self-selecting), contract duration limits, EULA requirements, and offer expiration timeframes.
 2. **Buyer request.** The Buyer chooses **Get Express Private Offer** on the listing. An AI agent then qualifies them against the Seller's criteria, asking questions where the Seller has configured profile-based qualification.
 3. **Offer generation.** Qualifying Buyers get an offer generated instantly with all applicable discounts applied. Buyers who fall outside the criteria are redirected to a sales-assisted workflow instead.

Three rate card types are available.

| Rate Card Type | Discounts based on | Behaviour |
| -------------- | ------------------ | --------- |
| `Dimension-based` | Quantity of a specific Pricing Dimension | The Seller sets quantity tiers, each with a minimum threshold and a discount percentage. Quantities below the lowest tier or above the highest receive 0% without needing explicit configuration. |
| `TCV-based` | Total Contract Value of the deal | Graduated tiers on the overall monetary value. Only the highest qualified tier applies. |
| `Buyer profile based` | Self-reported Buyer attributes | The Seller describes their qualification strategy in natural language and the system turns it into a Buyer questionnaire. Up to five qualifiers, usable both to grant extra discount and to exclude Buyers entirely. AWS does not verify the Buyer's answers. |

Dimension-based and TCV-based rate cards **cannot be combined with each other**, since they represent conflicting pricing approaches. Either one may be combined with buyer-profile based qualification. When two discounts apply, they compound **multiplicatively** rather than additively — a 10% TCV discount plus a 5% profile discount yields 14.5% off, not 15%.

Two global guardrails sit above every rate card: a **maximum TCV** that determines overall eligibility, and a **maximum discount** that caps whatever any combination of rate cards can produce. A Seller who wants automated offers without any discounting can set the maximum discount to 0%.

> [!IMPORTANT]
> The global TCV maximum behaves differently from a rate card threshold. Exceeding a rate card's highest tier simply yields a 0% discount, but exceeding the **global** TCV maximum routes the Buyer to a sales-assisted workflow instead of generating an offer. That distinction is what keeps large deals in front of a human.

> [!NOTE]
> Current limitations worth knowing before configuring rate cards:
>  - The usage component of a Contract + Usage Pricing Model **cannot be discounted** through a rate card and stays at public offer pricing.
>  - Duration-based discounting is not supported.
>  - Buyer-profile qualifications must not discriminate on protected characteristics.
>  - Because a natural language description drives the questionnaire, complex dimension rules need extremely specific wording to be interpreted correctly.

### Amendments and Renewals

Upgrading, renewing, and amending are the same mechanism under three names. In each case a new offer is created that **replaces an active agreement**, and the distinction is only what the Seller changed — new entitlements, a discount, a revised payment schedule, a different EULA, or simply a later end date.

The vocabulary matters here. An **offer** is a set of terms for the use of a Product and may be public or private. An **agreement** is an offer a Buyer has accepted. Amendments always target agreements, never offers.

> [!IMPORTANT]
> **Amendments are limited to SaaS Contract and SaaS Contract with Consumption Products.** This is why the topic lives in this file rather than under [Private Offers](./private_offers.md). Usage-based SaaS, AMI, container, server contract, and Professional Services Products all appear on the **Agreements** tab but cannot be amended — for those listing types, changing terms means issuing an entirely new offer.
>
> One narrow exception sits outside this mechanism entirely. A Buyer on an AMI `Hourly with Annual` plan can change their own agreement — switching instance types or adding quantity — without the Seller creating an offer at all. See [Annual agreement amendments (AMI)](./server_ami.md#annual-agreement-amendments-ami).

A Seller can change service dates, product dimensions, offer currency, payment schedule, usage dimensions, renewal status, the EULA, and the offer expiration date. The seller of record cannot be changed from the original agreement.

Once created, an amended offer appears on the **Private offers** page within roughly 45 minutes, and the Buyer chooses between accepting it and continuing the original agreement.

 - If the Buyer **accepts**, the new agreement takes effect immediately and any remaining scheduled payments from the previous agreement are cancelled. Existing invoices are unaffected, but the amended payment schedule replaces pending ones.
 - If the Buyer **does not accept** before the offer expires, the original agreement continues unchanged.

Amended offers cannot carry a future start date, because they target active agreements and become active the moment they are accepted.

> [!WARNING]
> Amending an accepted **public** offer converts it into a private offer, and it will no longer auto-renew. Automatic renewal requires the Buyer to be subscribed to a public offer, so amending one trades away that behaviour permanently. See [Auto-Renewal](./renewals.md#auto-renewal-on-a-public-offer).
