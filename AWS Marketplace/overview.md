# AWS Marketplace

The AWS Marketplace is a catalog where one company sells software to another and AWS handles the transaction. Two things make it worth a Seller's effort:
1. Buyers pay through their existing AWS bill instead of opening a new vendor relationship.
2. The Marketplace spend usually counts toward the Buyer's committed AWS spend. which turns a new purchase into budget the Buyer has already allocated. This is often why Buyers pressure their vendors to list on the AWS Marketplace.

The complexity is in what gets sold. A hosted service, a virtual machine, a container, a trained model, a dataset, and a team of consultants have almost nothing in common operationally, so AWS Marketplace models each as a separate **Listing Type**. Picking the wrong one is expensive to undo, because it constrains how the Buyer receives the Product, which Pricing Models are available, what the customer has to build to get paid, and whether terms can be renegotiated later.

The table below can be used as a quick reference for each Listing Type. Each row links to the document that covers it in full.

| Listing Type | Hosted by | Delivered As | Fulfillment Options | Pricing Models |
| ------------ | --------- | ------------ | ------------------- | -------------- |
| [SaaS](./saas.md) | Seller | API | <ul><li>SaaS</li><li>Agents API</li>*[Read More](./saas.md#fulfillment)*</ul> | <ul><li>Free</li><li>Contract-based</li><li>Usage-based</li><li>Contract + Usage</li>*[Read More](./saas.md#pricing-models)*</ul> |
| [AI Agents & Tools](./agents_and_tools.md) <sup>1</sup> | Seller *or* Buyer | API *or* Container | <ul><li>Agents API deployment</li><li>Container deployment</li>*[Read More](./agents_and_tools.md#fulfillment-ai-agents--tools)*</ul> | Inherited from SaaS or Server Product (Container) |
| [Server Product (AMI)](./server_ami.md) | Buyer | Machine Image | <ul><li>Amazon Machine Image (single AMI)</li><li>AWS CloudFormation template</li>*[Read More](./server_ami.md#fulfillment-ami)*</ul> | <ul><li>Free</li><li>BYOL</li><li>Hourly</li><li>Hourly + Annual</li><li>Monthly</li><li>Usage-based</li><li>Contract-based</li>*[Read More](./server_ami.md#pricing-models-ami)*</ul> |
| [Server Product (Container)](./server_container.md) | Buyer | Container Image | <ul><li>Container image</li><li>Helm chart</li>*[Read More](./server_container.md#fulfillment)*</ul> | <ul><li>BYOL</li><li>Monthly</li><li>Usage-based</li><li>Per task / per pod hourly</li><li>Contract-based</li>*[Read More](./server_container.md#pricing-models)*</ul> |
| [ML Product](./machine_learning.md) | Buyer | SageMaker AI model or algorithm | <ul><li>Model package</li><li>Algorithm</li>*[Read More](./machine_learning.md#fulfillment-ml)*</ul> | <ul><li>Free</li><li>Hourly</li><li>Per inference</li><li>Free trial</li>*[Read More](./machine_learning.md#pricing-models-ml)*</ul> |
| [Data Product](./data_product.md) | AWS Data Exchange | Data set | <ul><li>Files data set</li><li>API data set</li><li>Amazon Redshift data set</li><li>Amazon S3 data access</li><li>AWS Lake Formation data permission</li>*[Read More](./data_product.md#fulfillment-data)*</ul> | <ul><li>Public offer</li><li>Free</li><li>Private offer</li><li>Bring Your Own Subscription (BYOS)</li><li>Data grant</li>*[Read More](./data_product.md#pricing-models-data)*</ul> |
| [Professional Services](./professional_services.md) | n/a human delivery | Manual | <ul><li>Professional Services</li>*[Read More](./professional_services.md#fulfillment-professional-services)*</ul> | <ul><li>Contract with upfront payment</li><li>Installment plan</li><li>Variable payments</li>*[Read More](./professional_services.md#pricing-models-professional-services)*</ul> |

<sup>1</sup> `AI Agents & Tools` is a *category* layered over the existing product types rather than a product type of its own. Both of its paths land on an existing listing: API deployment produces a SaaS Product using the `Agents API` Fulfillment option, and Container deployment produces a Server Product using the `Container image` Fulfillment option.

**TODO make sure this has been added to the Data Product section. It doesn't belong here**
> [!NOTE]
> Pricing on a Data Product attaches to the **offer**, not to the data set type, so every Data Product Fulfillment option shares the same pricing models. Professional Services always transact through a Private Offer.

## Terminology

 - `Seller`: The company listing the Product on AWS Marketplace.
 - `Buyer`: The company subscribing to that Product and paying for it through their AWS bill.
 - `Product`: What is being sold on the AWS Marketplace.
 - `Listing Type`: The top-level category of a Product. The available categories are; `SaaS`, `Server (AMI or Container)`, `Machine Learning (ML)`, `Data`, or `Professional Services`. There is an additional listing type `AI Agents & Tools` which becomes either a `SaaS` listing or a `Server (Container)` listing. AWS introduced the `AI Agents & Tools` category so it was easier to search for AI related products.
 - `Delivery Method`: The *kind* of artifact the Buyer receives, as defined by AWS; an AMI, a container image/Helm chart, a dataset, or API credentials. The Seller chooses from a fixed list.
 - `Fulfillment Option`: One specific way a Buyer can deploy the Product, built by the Seller on top of a single delivery method. Also called a *delivery option*. A Product can support multiple Fulfillment options allowing Buyers to pick how they deploy the Product (e.g. The same Product might be offered as a container image or as a Helm chart).
 - `Pricing Model`: How the Buyer is charged. Every listing type allows for different Pricing Models but the ones most common are; free, upfront contract, pay-per-use, monthly, hourly, or bring-your-own-licence (BYOL).
 - `Pricing Dimension`: The unit of value the Buyer bought (i.e. a seat, a license, a scanned host, throughput in GB, etc.). Think of a Pricing Dimmensions as a line item on an itemized receipt. For Contract-based pricing a dimension carries a quantity, a price, and a duration. For Usage-based pricing it carries only a price per unit, because the quantity isn't known until the Buyer consumes it.
 - `Entitlement`: What the Buyer is *allowed* to use, agreed to and paid for upfront. Entitlements are known before any usage happens, which is why Contract-based Products bill at purchase time.
 - `Metering`: The process of collecting and reporting what the Buyer *actually* used. Metering is how Usage-based Products get billed. Metering is usually handled by the Product, but a few listing types (i.e. `ML` and `Server (AMI)`) handle metering automatically. Reference the specific details for each listing type below to determine who is responsible for the metering.
 - `Offer`: The commercial terms a Buyer accepts (i.e. Pricing Model, actual price per unit, contract duration, payment schedule, EULA, etc.). A **public offer** has the same terms for every Buyer and appears on the listing page. A [**private offer**](./private_offers.md) is negotiated with one Buyer and can carry custom pricing, duration, and payment schedule.
 - `Agreement`: An offer a Buyer has accepted. The distinction matters because amendments target agreements, never offers.
 - `SCMP`: The **Standard Contract for AWS Marketplace**, a EULA template AWS wrote that a Seller can use in place of their own. Buyers' legal teams have often reviewed it already, so it takes a legal review out of the sales cycle.
 - `Change Request`: The request sent to AWS for approval any time a listing changes (i.e. new versions, price changes, visibility changes, etc.). Requests are queued and reviewed, so changes are not instant.
 - `Product ID`: Identifies the **listing**; in the AWS Marketplace catalog, on the Buyer's bill, and in Seller reports. This is the value quoted in a support case or an invoice query.
 - `Product Code`: Identifies the **software** to AWS at runtime, so usage is billed against the right Product. Where it lives depends on the Listing Type; it is stamped into an AMI, and returned by `ResolveCustomer` for a SaaS Product. Issued at the same time as the Product ID and paired with it, but the two are not interchangeable. The ID is what appears on paperwork, the Code is what the running software presents to AWS.

> [!NOTE]
> **`Entitlement` and `Metering` are the two ways AWS Marketplace decides what to charge, and most of this document is downstream of that choice.** An Entitlement is a promise made in advance; Metering is a measurement taken afterwards. A Contract-based Product uses only the first, a Usage-based Product only the second, and a Contract + Usage Product uses both Entitlements up to the committed amount, and Metering for anything beyond it.


## Listing Visibility

The visibility of any Marketplace listing can be set to
 - `Restricted`: The listing is **only** visible to current customers.
 - `Limted`: The listing is only visible to Sellers AWS Account and AWS accounts specified in the `allowListed`.
 - `Public`: The listing is publicly visible on the AWS Marketplace.
