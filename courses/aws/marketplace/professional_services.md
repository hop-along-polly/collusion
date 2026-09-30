# Professional Services Listing Details

A Professional Services listing is how a Seller sells people's time and expertise rather than software. The deliverable is human work — an assessment, a migration, a training course, an ongoing managed service — and the reason to sell it through AWS Marketplace is that the fee lands on the Buyer's existing AWS bill instead of arriving as a separate invoice.

This is the only listing type where nothing is delivered by a machine. There is no artifact to download, no endpoint to call, and no account to log into. AWS Marketplace handles discovery, contracting, and billing; the Seller does the work.

Two rules constrain what can be listed. The service must relate to an AWS service or to at least one public AWS Marketplace product, either by supporting those products directly or by driving more subscriptions to them. The listing must also fall under at least one of five service categories, and may carry up to three categories in total.

 - `Assessment`: Evaluation of the Buyer's current operating environment to find the right solutions for their organization.
 - `Implementation`: Help with configuration, setup, and deployment of third-party software.
 - `Premium support`: Access to guidance and assistance from experts, designed for the Buyer's needs.
 - `Managed services`: End-to-end environment management on the Buyer's behalf.
 - `Training`: Tailored workshops, programs, and educational tools provided by experts to help the Buyer's employees learn best practices.

> [!IMPORTANT]
> **Extra listing requirements when the service touches the Buyer's AWS Account.** Some engagements need resources to exist in the Buyer's account, such as an IAM role or a deployed agent. Two requirements then apply, and both are satisfied on the listing rather than on the offer.
>
> **1. Document what gets deployed.** The Seller must provide a description of every provisioned AWS service, the IAM policy statements involved, and how an IAM role or user is deployed and used in the Buyer's account. AWS doesn't name a field for this, but it has to be reachable from the listing, because AWS Marketplace reviews the Product against these requirements at submission — before any private offer exists. The `Additional resources` field, which accepts up to three named links to hosted documents, is the natural home. Deal-specific detail can go in the statement of work attached to an offer, but that cannot substitute for the listing-level requirement.
>
> **2. Disclaim the infrastructure costs.** This requirement names its field explicitly: include a notification *"in the product description"* explaining that any additional AWS infrastructure costs the Buyer incurs are separate from the AWS Marketplace transaction and are the Buyer's responsibility. It belongs in the listing rather than the private offer, since the Buyer needs it before deciding to engage and the offer is only seen after negotiation.

## Fulfillment (Professional Services)

Professional Services has a single Fulfillment option, also called `Professional Services`, and it is delivered manually. There is no `FulfillmentURL`, no `EndpointURL`, no Quick Launch, and no metering or entitlement API to integrate with.

What replaces all of that is a conversation. The listing is a brochure rather than a store. A Buyer finds it in the catalog, reads what the Seller offers, and contacts the Seller to discuss scope and price. The Seller then negotiates the engagement and issues a [private offer](./private_offers.md), which is the only way this listing type can be purchased. There is no self-service purchase path for Professional Services.

**Response Time Enforcement**: Since fulfillment of a Professional Services listing is a manual process, AWS enforces it with response time obligations rather than technical requirements. There requirements are
 - The Seller **must** contact the Buyer within two business days of being contacted through the listing
 - The Seller **must** contact the Buyer OR provide next steps within two days of a private offer being accepted unless the offer says otherwise.
 - Support contact options have to be published on the fulfillment landing page, along with a description of the level of support the Buyer can expect.

> [!IMPORTANT]
> **Bootstrapping the Seller's access to the Buyer's AWS Account.** AWS requires that resources be provisioned *"in a secure way, such as by using the AWS STS or IAM"*. That describes how the Seller should hold access once it exists, not how access is established. Because this listing type has no Quick Launch and no deployment mechanism of any kind, **the Buyer always takes the first action.**
>
> The standard pattern is cross-account role assumption:
> 1. The Buyer creates an IAM role in their own AWS Account.
> 2. That role's trust policy names the Seller's AWS Account as the principal and requires an `ExternalId`.
> 3. The Seller calls `sts:AssumeRole` to obtain temporary credentials scoped to that role.
>
> The `ExternalId` is what prevents another of the Seller's customers from inducing the Seller to act against this Buyer's account, the [Confused Deputy Problem](https://docs.aws.amazon.com/IAM/latest/UserGuide/confused-deputy.html). Note the Seller must convey the external ID to the Buyer using a tool such as [1ty.me](https://1ty.me/).
>
> What the guideline is steering Sellers away from is the alternative: asking the Buyer to create an IAM user and send long-lived access keys. Temporary credentials through an assumed role satisfy the requirement.
>
> **Hosting the CloudFormation template.** AWS Marketplace will not host a template for a Professional Services listing. If the Seller wants to spare the Buyer from building the role by hand, the Seller hosts the template themselves — typically a public Amazon S3 URL, or a launch-stack link in their own documentation — and points at it from the listing's `Additional resources`. The same applies to agents, where the requirement is only to *"provide instructions to the customer that describe how to deploy the agent in their AWS account."*

## Pricing Models (Professional Services)

A Professional Services listing carries no prices at all. The listing publishes the services/packages a Seller offers and nothing more. The Pricing Configuration is handled when the Seller extends a [Private Offers](./private_offers.md).

> [!IMPORTANT]
> The engagement must be billed entirely through the dimensions listed on AWS Marketplace. A Seller is never permitted to collect the Buyer's payment information — credit card or bank account details — through a Professional Services listing, and side-invoicing part of the work defeats the purpose of listing it at all.

## Pricing Dimensions (Professional Services)

Professional Services dimensions are **packages, not units of usage**. Nothing is metered and nothing is counted, so the six unit categories that apply to SaaS are irrelevant here.

The form is deliberately minimal. A dimension consists of **a name and a description**, and that is the entire definition. There is no unit, no unit category, no price, and no quantity on the listing. The Seller defines at least one dimension and up to 24; prices are attached later, per deal, on the [Private Offer](./private_offers.md).

> [!IMPORTANT]
> AWS does not define any structure for how a Seller packages their services. A dimension is free-form text, so a package is whatever the Seller writes into the name and description. The examples below are illustrations of how Sellers commonly structure engagements, not a set of options to choose between.

| Pattern | Example Dimensions | Where it fits | Real World Example |
| ------- | ------------------ | ------------- | ------------------ |
| Tiered service levels | `Silver`, `Gold`, `Platinum` | Ongoing engagements where the tiers differ by response time, coverage hours, or scope of management. | A managed security practice sells `Silver` as business-hours monitoring, `Gold` as 24/5 with incident response, and `Platinum` as 24/7 with a named engineer. The work is the same shape at every tier; only the coverage changes. |
| Blocks of time | `10 Hours`, `20 Hours`, `50 Hours` | Consulting and advisory work where the Buyer is buying availability rather than a defined outcome. | A partner sells a Well-Architected advisory retainer. The Buyer draws the hours down as architecture questions come up over the quarter, with no agreed deliverable at the outset. |
| Fixed-scope deliverables | `Landing Zone Build`, `Migration Assessment` | Projects with a defined start, end, and artifact, where the price shouldn't move with hours spent. | A partner builds a Control Tower landing zone for a fixed fee. The Buyer pays the same whether it takes four weeks or eight, because they are buying the finished environment rather than the effort. |
| Per-unit-of-scope | `Per Workload Migrated`, `Per Site Onboarded` | Engagements that scale with something countable, letting one dimension cover deals of very different sizes. | A migration practice charges per application moved to AWS. The same dimension covers a 5-application pilot and a 200-application program, with only the quantity changing on the offer. |

Nothing prevents mixing these, and most Sellers will. Because the name and description are free-form, one listing can carry a tier, a block of hours, and a fixed-scope deliverable side by side.

> [!NOTE]
> A Seller can add new pricing dimensions themselves, but modifying or removing an existing one requires contacting the AWS Marketplace Seller Operations team with the product ID and the details of the change. Because prices live on the offer rather than the listing, it's worth defining dimensions broadly enough that the offer can absorb variation between deals, rather than creating a dimension per engagement shape.
