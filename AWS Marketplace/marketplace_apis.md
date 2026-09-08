# AWS Marketplace APIs

Which APIs a Seller integrates with is determined by the Listing Type and the Pricing Model together. A Free or BYOL Product may need none at all; a SaaS Contract with Consumption needs three.

| Service | SaaS | AI Agents & Tools <sup>1</sup> | AMI | Container | ML | Data | Professional Services |
| ------- | :--: | :----------------------------: | :-: | :-------: | :-: | :--: | :-------------------: |
| Metering Service | Yes | Yes | Yes | Yes | — | — | — |
| Entitlement Service | Yes | Yes | — | — | — | — | — |
| Deployment Service | Quick Launch | Quick Launch | — | — | — | — | — |
| AWS License Manager | — | — | Contracts | Contracts | — | — | — |
| Catalog API | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| AWS Data Exchange API | — | — | — | — | — | Yes | — |

<sup>1</sup> `AI Agents & Tools` inherits from whichever Listing Type it resolves to — SaaS for API deployment, Container for Container deployment. It appears separately here only because `MeterUsage` additionally supports Amazon Bedrock AgentCore Runtime deployments.

> [!NOTE]
> **Professional Services has no API surface at all.** Nothing is metered and no entitlement is checked programmatically, which is consistent with a Listing Type where delivery is a human process.

### AWS Marketplace Metering Service

The Metering Service handles both *"who is this Buyer"* and *"what did they consume"*. Which operation a Seller calls depends on where the software runs.

| Operation | Purpose | Listing Types |
| --------- | ------- | ------------- |
| `ResolveCustomer` | Exchanges the `x-amzn-marketplace-token` from the fulfillment POST for the `CustomerAWSAccountId`, `LicenseArn`, and `ProductCode`. | SaaS (both Fulfillment options) |
| `BatchMeterUsage` | Reports usage for software the **Seller** hosts. Called from the Seller's own environment. | SaaS with Usage or Contract + Usage |
| `MeterUsage` | Emits metering records from software running in the **Buyer's** account. | AMI, Container, AgentCore Runtime |
| `RegisterUsage` | Verifies entitlement at container startup and starts hourly metering. | Container (paid per task or per pod) |

The split between `BatchMeterUsage` and `MeterUsage` is about **who owns the compute**. `BatchMeterUsage` is called by the Seller's own service using the Seller's credentials. `MeterUsage` is called by software sitting in the Buyer's account, so it must be signed with the Buyer's credentials — and AWS is specific about which ones:

| Runtime | Required credential |
| ------- | ------------------- |
| Amazon EC2 | IAM role for Amazon EC2 |
| Amazon EKS | IAM roles for service accounts (IRSA). EKS Pod Identity, the node role, and long-term access keys are **not supported**. |
| Amazon ECS | Amazon ECS task IAM role. Node role and long-term access keys are not supported. |
| Amazon Bedrock AgentCore Runtime | AgentCore Runtime execution role. Long-term access keys are not supported. |

> [!IMPORTANT]
> **`MeterUsage` accepts one record per hour per dimension** — per EC2 instance for AMI Products, per ECS task or EKS pod for Container Products — and recorded values can't be modified afterward. Reporting early in an hour blocks any further reporting until the next hour begins. Records submitted more than **six hours** after the event are rejected outright.
>
> AgentCore Runtime is the exception: it accepts multiple records per hour for the same dimension, provided each carries a unique `ClientToken` idempotency token.

`RegisterUsage` behaves differently from the other three because AWS does the metering. The Seller calls it once at container launch and the AWS Marketplace metering control plane takes over from there.

 - Entitlement is only enforced **at startup**. `CustomerNotSubscribedException` is thrown on the initial call only, so a Buyer who unsubscribes mid-run keeps working until the task ends.
 - AWS bills for running tasks and pods *"regardless of the customer's subscription state, which removes the need for your software to run entitlement checks at runtime."*
 - It must be called within the first 6 hours of launch, or AWS provides no metering guarantees for previous months.
 - It must be called in the same Region the task was launched in.
 - Free and BYOL container Products aren't required to call it, but may do so to receive usage data in seller reports.

### AWS Marketplace Entitlement Service

`GetEntitlements` returns what a Buyer has purchased. It is **read-only** — there is no drawdown, no decrement, and no enforcement. AWS records the entitlement; the Seller's application is responsible for tracking consumption against it and for refusing service once it is exhausted.

| Operation | Purpose | Listing Types |
| --------- | ------- | ------------- |
| `GetEntitlements` | Retrieves the dimensions and quantities a Buyer is entitled to. | SaaS with Contract or Contract + Usage |

> [!IMPORTANT]
> Entitlements are not created for every SaaS listing. Usage-based (pay-as-you-go) Products *"do not use entitlement SNS topics or the GetEntitlements API"* — for those, `BatchMeterUsage` is the whole integration.

For a tiered contract, `GetEntitlements` returns only the tier's dimension name. If `Standard` means 100 encrypts and 1000 decrypts, that mapping exists solely in the Seller's application. See [Pricing Dimensions (SaaS)](./saas.md#pricing-dimensions).

### AWS Marketplace Deployment Service

| Operation | Purpose | Listing Types |
| --------- | ------- | ------------- |
| `PutDeploymentParameter` | Places a secret — an API key, OAuth credentials, an external ID, or dynamic endpoint parameters — into the Buyer's AWS Secrets Manager. | SaaS and Agents API, Quick Launch only |

This is the only API a Seller calls to *give* something to a Buyer rather than to read or report. It serves both meanings of Quick Launch: delivering CloudFormation deployment parameters for Classic SaaS, and delivering API credentials and endpoint parameters for Agents API.

Credentials and endpoint parameters must be delivered in **separate calls**, and `ResolveCustomer` must succeed first since the call needs the Buyer's account ID and product code. See [Fulfillment (SaaS)](./saas.md#fulfillment).

### AWS Marketplace Catalog API

The Catalog API is the programmatic equivalent of the AWS Marketplace Management Portal, and it applies to every Listing Type. Rather than metering or entitlement, it manages the listing itself.

| Operation | Purpose |
| --------- | ------- |
| `StartChangeSet` | Submits a change — new product, updated pricing, new delivery option, visibility change. Every console change request is a change set underneath. |
| `DescribeChangeSet` / `ListChangeSets` | Reads the status of submitted changes, including validation errors. |
| `DescribeEntity` / `ListEntities` | Reads products, offers, and their current configuration. |

Change types are named per operation — `AddDeliveryOptions`, `UpdateDeliveryOptions`, `UpdateDeliveryOptionsVisibility`, `CreateExpressPrivateOfferConfiguration` — and IAM policies can be scoped to individual change types with the `catalog:ChangeType` condition key.

### AWS License Manager

AWS License Manager provides **managed entitlements**, and unlike the Entitlement Service it supports real drawdown. Licenses are checked out and checked in, with counts enforced by AWS rather than by the Seller.

| Operation | Purpose | Listing Types |
| --------- | ------- | ------------- |
| `CheckoutLicense` | Consumes entitlement from the Buyer's license pool. | AMI and Container with Contract pricing |
| `CheckinLicense` | Returns entitlement to the pool. | AMI and Container with Contract pricing |

Licenses carry a `MaxCount`, an `Overage` allowance, and an `AllowCheckIn` flag. A checked-out license auto-checks-in after one hour if not explicitly returned.

> [!NOTE]
> This is the sharpest distinction in the API surface. **SaaS contracts use the Entitlement Service, which only reports.** AMI and Container contracts use License Manager, which actually decrements. A Seller moving between Listing Types cannot reuse the enforcement logic, because in one case they own enforcement entirely and in the other AWS does.

### Mechanisms that aren't APIs

Two Listing Types report consumption through an HTTP response header rather than an API call, which is easy to miss when planning an integration.

| Mechanism | Listing Type | How it works |
| --------- | ------------ | ------------ |
| `x-amz-dataexchange-metering` | Data (API data sets) | The Seller returns counts in the response header of the proxied API call, for example `VertexCount=3,EdgeCount=10`. |
| `X-Amzn-Inference-Metering` | ML (inference pricing) | The Seller returns a JSON payload such as `{"Dimension": "inference.count", "ConsumedUnits": 3}` to charge for a mini-batch of inferences in a single invocation. |

ML Products otherwise need no integration at all: *"While a buyer runs your software, AWS Marketplace tracks usage and then bills the buyer accordingly."* SageMaker AI reports the usage, and only `2XX` responses are billed under inference pricing.
