# Data Product Listing Details

A Data Product listing is how a Seller sells data rather than software. Files and APIs still appear as delivery mechanisms, but they are transport for the data rather than the thing being sold. A Seller does not need to build delivery, subscription management, entitlement, and billing inegrations because all of that is handled by AWS Data Exchange. The Seller's only obligation is to keep the data current.

Data Products are listed and fulfilled through **AWS Data Exchange**, which is a distinct service from the rest of AWS Marketplace. That has two practical consequences worth knowing before starting.
 1. **The work is split across two consoles.** Products, offers, and subscription requests are managed in the **AWS Marketplace Management Portal** or through the Catalog API. Data sets themselves are created and managed in the **AWS Data Exchange console**. A Seller cannot complete a listing from either console alone.
 2. AWS Data Exchange uses its own vocabulary. The Seller is a **provider**, the Buyer is a **subscriber**, and what the rest of this document calls a Fulfillment option is a **data set type**. Becoming a provider has its own eligibility process, separate from ordinary AWS Marketplace seller registration.

Data in AWS Data Exchange is organized in three layers, and understanding them is a prerequisite to understanding fulfillment.
 - `Asset`: a single piece of data; a file, a REST API in Amazon API Gateway, a Redshift datashare, a Lake Formation permission, or an S3 data access grant.
 - `Revision`: a container for one or more Assets. Revisions are how a Seller publishes updates over time.
 - `Data set`: a series of one or more Revisions. A Product contains one or more data sets.

All data sets in a single Product must be in the same AWS Region, though that Region can be any AWS Data Exchange supports.

## Fulfillment (Data)

Fulfillment for a Data Product is determined by the **data set type**, which controls how the Buyer reaches the data. The choice is not primarily about convenience — it determines whether the Buyer receives a copy of the data or queries it in place, which is usually the deciding factor.

| Data Set Type | Buyer gets | Copies made | Use Case | How it works |
| ------------- | ---------- | :---------: | -------- | ------------ |
| Files | An entitled data set they export locally or to their own S3 bucket | Yes | Point-in-time snapshots and periodic file drops. | The Seller imports flat files of any type permitted by Amazon S3 from their own bucket into a Revision, with asset type `S3_SNAPSHOT`. This is the only type where the Buyer ends up holding an independent copy, which makes revoking meaningful access after the fact effectively impossible. |
| API | Calls to AWS Data Exchange-managed endpoints, proxied to the Seller's | No | Live query access where the Seller wants to keep serving logic. | The Seller adds an existing Amazon API Gateway REST API to the data set, and Buyers can view it and download its specification. AWS Data Exchange will not front an arbitrary endpoint, so a Seller without an API Gateway API must build one first. |
| Amazon Redshift | Read-only consumer access to a datashare | No | Warehouse-resident data the Buyer queries live. | Subscribing adds the Buyer as a consumer of the datashare, giving read-only access to the schemas, tables, views, and user-defined functions the Seller added, with no extract, transform, or load step. Access is granted automatically when the subscription activates and removed when it expires. |
| Amazon S3 data access | Read-only access to objects in the Seller's own buckets | No | Large or frequently updated data where copying is impractical. | On subscription AWS Data Exchange automatically provisions an **S3 Access Point** and updates its resource policy to grant the Buyer read-only access. The Seller can share an entire bucket, or restrict sharing to specific prefixes and objects. |
| AWS Lake Formation *(Preview)* | Access to databases, tables, and columns carrying specified LF-tags | No | Governed lakehouse data where access is already expressed as tags. | The Seller tags data in AWS Lake Formation using LF-tags and imports those tags as Assets. Buyers create resource links in their own Lake Formation and query through services such as Amazon Athena. Because access follows the tags rather than a fixed list of resources, newly tagged data becomes visible to existing subscribers automatically — either the main benefit or the main hazard, depending on tagging discipline. |


> [!NOTE]
> Pricing on a Data Product attaches to the **offer**, not to the data set type, so every Data Product Fulfillment option shares the same pricing models. Professional Services always transact through a Private Offer.

### Data Publishing Lifecycle
Publishing a Product creates a **second copy of the data set record**. The Seller carries on working with the original while the Buyer receives a separate, read-only view of it. AWS Data Exchange tells the two apart with an `origin` field — the Seller's original is `OWNED`, the Buyer's view is `ENTITLED` — and the console's left navigation uses the same wording, listing the Seller's data sets under **Owned data sets**. These are genuinely separate resources with different IDs rather than two names for one thing. Renaming an owned data set does not rename the entitled copy the Buyer sees. Tags on an owned data set are not propagated to the entitled version, and entitled data sets can't be tagged at all. A Seller can, however, view the entitled copy exactly as the Buyer sees it, which is the only reliable way to check what was actually published.

**This structure applies to all five data set types, not just Files.** Publishing an API data set follows the same sequence; create the data set -> create a revision -> add the asset -> finalize. Revisions remain live in the request path, with each proxied call carrying an `x-amzn-dataexchange-revision-id` header.

What a Revision *means* differs between what Data set type it is.
 - For **Files**, a Revision is the update mechanism. Each one is a distinct point-in-time snapshot, and the Buyer accesses a specific Revision.
 - For the other four types, the Asset is a pointer to a live resource — an API, a datashare, an access grant, a set of tags. There is typically one Revision holding one Asset, and the data changes underneath it without a new Revision being published. As the docs put it for S3 data access, *"You don't need to create a new revision when updating the shared Amazon S3 objects unless the Amazon S3 locations have been altered."*

> [!WARNING]
> **Finalizing behaves differently before and after a Product exists.** A Revision must contain at least one Asset to be finalized. While the data set has not yet been added to a Product, a finalized Revision can be reverted with **De-finalize** and edited freely.
>
> Once the data set belongs to a Product or data grant, that changes. Finalizing then publishes to subscribers *"immediately and automatically"*, and a Revision in that state *"can't be unfinalized or changed in any way"* except through the revoke process — which requires a comment of at least 10 characters explaining to subscribers why their access was withdrawn. Verify Assets before finalizing an update to a live Product.

## Pricing Models (Data)

Pricing on a Data Product attaches to the **offer**, not to the data set type. All five Fulfillment options share identical pricing mechanics, so the choice of data set type has no bearing on how the Product can be sold.

 - `Public offer`: required for any Product with Public visibility. Available to all subscribers.
 - `Private offer`: custom terms and pricing extended to selected AWS accounts.
 - `Bring Your Own Subscription (BYOS)`: migrates an existing commercial relationship onto AWS Data Exchange at no additional cost. The billing relationship between Seller and Buyer continues outside AWS, and BYOS offers are not subject to fulfillment fees.
 - `Free`: no charge to the subscriber.
 - `Data grant`: direct sharing of data with a recipient rather than a sale.

An offer defines the data subscription agreement, the available price and duration combinations, whether US sales tax is collected, the refund policy, whether subscription verification applies, and whether auto-renewal is available.

**Durations** run from 1 to 36 months, and a public offer may carry up to **five** different duration and price combinations. The only supported currency is **USD**. The Buyer chooses a single duration at subscription time and pays the full charge upfront.

> [!IMPORTANT]
> **Auto-renewal cannot be changed after the offer is created.** The Seller decides at creation whether subscribers may opt into automatic renewal, and that decision is permanent for the life of the offer. A private offer configured with a flexible payment schedule cannot use auto-renewal at all. Discontinuing a duration later cancels renewals for every subscriber who had opted in on that duration, so durations should be chosen for the long term.

Two mechanisms have no equivalent in the other listing types:

 - **Data Subscription Agreement (DSA)** — the standard contract template AWS Data Exchange provides as the default EULA. A Seller can use it as-is, download and amend it, or upload entirely custom terms. It fills the role that the Standard Contract for AWS Marketplace plays elsewhere.
 - **Subscription verification** — optionally requires a prospective Buyer to complete a questionnaire and be approved before the subscription is granted, rather than subscribing instantly.

Refunds are the Seller's decision. AWS Data Exchange doesn't require a refund policy, but the offer must state one clearly, and AWS will only process a refund the Seller has authorized.

## Pricing Dimensions (Data)

For four of the five data set types, **there are no pricing dimensions**. Nothing is metered, no units of value are defined, and there is nothing equivalent to the six unit categories that apply to SaaS. What stands in their place is the **price and duration pair on the offer**: the Buyer purchases access to the Product as a whole for a fixed term at a fixed price, and the Seller varies pricing by offering up to five different terms rather than by defining dimensions.

> [!NOTE]
> A subscription grants access to **all data sets in the Product**. Scope is controlled by deciding which data sets go into which Product, not by dimensions within a single Product. Selling two tiers of the same data therefore means publishing two Products.

The one variable a Seller controls per offer is **revision access**: how many historical Revisions the Buyer receives, from none up to all of them, and whether they receive future Revisions published during the subscription term.

### Metered costs (API data sets only)

**API data sets are the exception.** Because the Buyer makes discrete calls, they can be metered, and an API Product can be priced as contract-only, metered-only (with contract pricing set to $0), or a combination of both. Three standard metered costs are available, plus custom ones.

| Metered Cost | Charged per |
| ------------ | ----------- |
| Per API request | Every request the Buyer makes, successful or not. |
| Per successful API request | Only requests that succeed. |
| Per unit of data transferred in bytes | Volume returned rather than call count. |
| Custom metered cost | Anything the Seller defines, identified by a `Key` of at most 15 characters. |

A custom metered cost is the closest thing in AWS Data Exchange to a SaaS pricing dimension, and it is reported the same way in spirit but through a different channel. Rather than calling a metering API, the Seller returns the count in the `x-amz-dataexchange-metering` response header of the proxied API call — for example `x-amz-dataexchange-metering: VertexCount=3,EdgeCount=10`, or as separate header lines. Standard metered costs generate their `Key` automatically and need not be returned at all.

> [!IMPORTANT]
> **Metered costs apply to every API data set in the Product.** A Seller who needs different prices for the same dimension across different API data sets must split them into separate Products. After the offer is created the price and description of a metered cost can be edited, but the `Key` cannot.
