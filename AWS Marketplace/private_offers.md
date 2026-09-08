# Private Offers

A Private Offer is a negotiated alternative to a Product's public offer. Where the public offer is a fixed set of terms anyone can accept, a private offer is built for named Buyers and can carry its own pricing, payment schedule, and legal terms. AWS describes them as *"negotiated terms used to purchase a product from AWS Marketplace"*, which may involve *"a custom pricing plan, end user license agreement (EULA), or custom solutions."*

Most listing types treat Private Offers as an option layered over a public offer. For [Professional Services](./professional_services.md) they are the only purchase path, because that listing type has no self-service flow at all.

A Buyer receiving a private offer can choose between it and the public offer, but can only be subscribed to **one** at a time. The offer is visible only to the AWS accounts it was extended to, and the Buyer must be signed into one of those accounts to see it. Once accepted, an offer becomes an [Agreement](./overview.md#terminology).

## Payment Structures

A Private Offer's payments can be structured in one of 3 ways. Each Private Offer can only use 1 of the following payment structures even if that offer is extended to multiple Buyer's.

 - `Variable payments`: Invoices submitted to customer up to the total contract value (TCV)
 - `Installment plan`: An agreed fee is split across a payment schedule, with invoice dates and amounts the Seller defines.
 - `Upfront payment`: the Buyer pays the agreed cost at the start of the term.

## Offer Configuration

When creating an offer the Seller specifies the Product, which generates a unique offer ID and URL, then sets the following.

| Setting | Description |
| ------- | ----------- |
| Pricing model | One of the payment structures above. |
| Contract duration | The length of the term. Professional Services and other contract Products can use a custom duration in months. |
| Offer currency | The Buyer must have an AWS account in a Region where the chosen currency is supported. |
| Product dimension | Which of the Product's dimensions the offer covers, where relevant. |
| Offer expiration date | How long the Buyer has to accept. After 23:59:59 UTC on this date the offer is no longer accessible. |
| Buyers | Up to 24 AWS account IDs per offer. |
| Legal terms and documents | Custom EULA plus up to five files (e.g. legal terms, statement of work, bill of materials, pricing sheet, addendums, etc.). All files will be merged into a single document. |
| Auto-renewal | Optional renewal terms at the same price or with an uplift. Available only for offers using contract pricing. See [Auto-Renewal](./renewals.md#renewal-terms-on-a-private-offer). |

Once published, the Seller can copy the offer URL from the **Manage private offers** page and send it to the Buyer. An offer that hasn't yet been accepted can still be edited.

> [!NOTE]
> *Express Private Offers* automate offer creation using predefined pricing and qualification criteria configured as **rate cards**. Standard deals generate an offer automatically, while requests that fall outside the criteria are routed to the Seller's sales team. This capability is limited to **SaaS Contract and SaaS Contract with Consumption Pricing** Products, see [Express Private Offers](./saas.md#express-private-offers). Express Private Offers is not available for Professional Services or any other listing type.

## Constraints

 - A private offer cannot limit how much of the Product a Buyer consumes. There are no service limits in an offer, so the Buyer can use as much as they want at the negotiated price unless the Product itself imposes a limit.
 - Private offers don't support the `BYOL` pricing model.
 - They can't be created for second party Products, AMI monthly Products, or multi-AMI delivery using AWS CloudFormation.
 - If the Buyer's account is managed through a private marketplace, the offer must include both the Buyer's account and the account holding their private marketplace administrator.
 - Offers above $250,000 may require additional approval.
 - Adding support for a new instance type or Region does not extend to Buyers already on a private offer. A new offer is required.
