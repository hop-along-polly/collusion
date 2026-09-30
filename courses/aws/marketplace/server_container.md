# Server Product (Container) Listing Details

A Container listing is a specific type of Server product. The Seller lists software packaged as Docker containers. The AWS Marketplace hosts the images and handles entitlement and billing; The Buyer supplies and pays for the infrastructure the containers run on.

Container Products are versioned where each version is the set of container images that make up one release of the software. A Seller ships a new release of the Product by submitting a **change request** that adds the new `version`.

Buyers can deploy on
 - ECS
 - EKS
 - Fargate
 - on-premises with Amazon EKS Anywhere
 - on self-managed Kubernetes clusters either on-premises OR on Amazon EC2.

Free and BYOL products go further still, they *can run on any Docker-compatible (OCI) runtime.*

> [!IMPORTANT]
> **Every new version of a Container Product is scanned before it can be published.** AWS Marketplace performs a layer-by-layer scan of each new version of a Container Product and returns a list of any critical vulnerabilities that carry remotely exploitable risk vectors. Since this is a layer-by-layer scan vulnerabilities in the base image will bubble up to the final report even if the Seller's own application layers are clean.
>
> BEST PRACTICE: When building a Container Product it is recommened to start from a base image free of vulnerabilities, and scanning locally with a tool such as Clair, Twistlock, Aqua Security, or Trend Micro before submitting to avoids delays in ingestion and publishing.

## Fulfillment

Fulfillment of a Container Product consists of pairing a **delivery method** (i.e how the image is deployed) with a set of container images (i.e. the application). These pairings are referred to in documentation as a Fulfillment Option or a Deployment Option. Each Container Product can have between 1 and 4 of Fulfillment Option(s). The table below details the different delivery methods.

| Delivery Method | Seller Provides | Buyer Gets | Where the images are hosted | Installs on | How it works |
| --------------- | --------------- | ---------- | --------------------------- | ----------- | ------------ |
| `Container image` | <ul><li>The container images</li><li>Usage instructions</li><li>Links to deployment templates</li></ul> | <ul><li>Container image URLs</li><li>Links to the available deployment templates</li><li>Instructions for pulling each image</li></ul> | The AWS Marketplace registry on Amazon ECR | <ul><li>Amazon ECS</li><li>AWS Fargate</li><li>Amazon EKS, using the Buyer's own manifests</li></ul> | The Buyer authenticates their Docker client against Amazon ECR, then pulls each image using the ECR ARN the Seller supplied. They reference those images from their own task definition or manifest. |
| `Helm chart` | <ul><li>The container images</li><li>A Helm chart</li><li>Usage instructions and deployment templates</li></ul> | <ul><li>Step-by-step instructions for launching using Helm</li><li>The deployment template</li></ul> | The AWS Marketplace registry on Amazon ECR | <ul><li>Amazon EKS</li><li>Self-managed Kubernetes on EKS Anywhere, Amazon EC2, or on-premises</li></ul> | The Buyer installs the chart with the Helm CLI. Suited to Products whose deployment is more than a single task definition. |
| `Add on for Amazon EKS` | <ul><li>Paths to Helm charts in an Amazon ECR repository created through the AWS Marketplace console</li></ul> | <ul><li>The Product listed in the Amazon EKS console's add-on catalog</li></ul> | An Amazon ECR repository the Seller creates through the AWS Marketplace console | <ul><li>Amazon EKS only</li></ul> | The Buyer installs the software from the Amazon EKS console or through the native Amazon EKS add-on APIs, rather than running Helm themselves. |
| `Quick Launch for Helm` **(Discontinued)** | <ul><li>The container images</li><li>A Helm chart</li><li>Quick Launch enabled on the delivery option</li></ul> | <ul><li>A **Launch** button on the Product's launch page</li></ul> | The AWS Marketplace registry on Amazon ECR | <ul><li>A **new** Amazon EKS cluster, created as part of the launch</li></ul> | The Buyer chose **Launch** and was redirected to an AWS CloudFormation template **owned and managed by AWS Marketplace**, not the Seller. Executing it created a new Amazon EKS cluster and installed the Product into it using the Seller's Helm charts. Deployment averaged around 60 minutes. |

The Buyer picks their preferred option after subscribing. Access ends with the subscription. If a Buyer cancels, they lose access to the Amazon ECR repository where AWS Marketplace stores the images. They may still hold images they already pulled, but they can no longer pull new container image versions the Seller publishes.

**Example**
If a Seller wants to fill every available fulfillment slot they will reuse at least 1 delivery method twice. Consider a vulnerability scanning software with the following Fulfillment Options

| Slot | Delivery Method | What it packages | Why the Seller published it |
| ---- | --------------- | ---------------- | --------------------------- |
| 1 | `Container image` | The scanner and worker images, plus an Amazon ECS task definition | Serves Buyers standardized on Amazon ECS and AWS Fargate, who have no Kubernetes cluster to install into. |
| 2 | `Helm chart` | Production topology including three scanner replicas spread across Availability Zones, a connection to an external Amazon RDS instance, node affinity rules, and PodDisruptionBudgets | The deployment most paying Buyers run. It assumes a multi-AZ cluster and a dedicated node group. |
| 3 | `Helm chart` | Evaluation topology including one replica, an in-cluster database, no high availability (HA), no affinity rules | The production chart **will not install** on the small single-AZ cluster an evaluator spins up for a proof of concept: its prerequisites go unmet and the pods stay unschedulable. The two charts differ in their chart dependencies and topology, not merely in values, so one chart with different `values.yaml` defaults cannot serve both. |
| 4 | `Add on for Amazon EKS` | The same Helm charts, registered as an Amazon EKS add-on | Serves platform teams that manage every cluster component through the Amazon EKS console and add-on APIs, and want this Product's lifecycle handled the same way as their CNI or CSI drivers. |

> [!WARNING]
> **Quick Launch for Helm chart deployments on Amazon EKS was discontinued on March 1, 2026.** Deployments already running are unaffected, but new buyers must deploy using standard Helm commands, or use container images on Amazon ECS instead.

## Pricing Models

A Seller picks **one** Pricing Model per Container Product, and the price set applies to **every AWS Region**. These are the six choices presented in the AWS Marketplace Management Portal.

| Pricing Model | What the Buyer pays | Real World Example | [Long-Term Contract](#long-term-contracts) | Integration |
| ------------- | ------------------- | ------------------ | ---------------------------------------------------- | ----------- |
| `Free` | Nothing for the software. The Buyer still pays for the infrastructure the containers run on. | An open-source observability agent published to drive adoption of a paid control plane sold separately. | No | None |
| `Bring Your Own License` | Nothing through AWS Marketplace. Billing is handled entirely outside it, through a relationship the Seller maintains with the Buyer, and the Buyer supplies a valid license key to activate the software. | An enterprise database the Buyer already licenses under an existing enterprise agreement, now deployed from AWS Marketplace for convenience. | No | None |
| `Monthly` | A fixed monthly price for unlimited use of the Product during the following month, charged immediately on subscription and repeating until cancelled. A Buyer who cancels mid-month is refunded the unused portion. | A self-hosted CI/CD runner at $99/month, with no cap on how many builds the Buyer runs. | No | `RegisterUsage` |
| `Hourly pricing` | A price per Amazon ECS task or Amazon EKS pod per hour. Five pods at $6/hour bill $30/hour. | A log analytics platform that charges only for its controller pod, because the Product is useless without one. | **Yes** | `RegisterUsage` |
| `Usage-based pricing` | A per-unit price against dimensions the Seller defines, calculated from the metering records the Seller reports. | A vulnerability scanner billing per node scanned, rather than per pod it happens to run in. | **Yes** | `MeterUsage` |
| `Contract-based pricing` | An upfront fee entitling them to a specified quantity of use over an agreed length of time. | A 12-month license for 50 nodes of an API gateway, paid upfront at the start of the term. | N/A — the upfront fee *is* the commitment | AWS License Manager |

> [!NOTE]
> **Two Pricing Models are unavailable for AI agents and tools hosted on Amazon Bedrock AgentCore Runtime.** *"If the container image uses AgentCore, the **Hourly** and **Usage with long-term contract** pricing models are not supported."* The Management Portal blocks both and requires a different Pricing Model to continue. See [AI Agents & Tools Listing Details](./agents_and_tools.md).

For `Hourly pricing`, billing is **per-second with a one-minute minimum**. A container run for 20 minutes and 30 seconds at $6/hour bills `20 x ($6/60) + 30 x ($6/60/60) = $2.05`.

> [!IMPORTANT]
> **Price changes are asymmetric.** A price decrease reaches existing Buyers immediately. A price increase requires 90 days' notice and takes effect on the first day of the month *following* that 90-day window (e.g a notice sent on March 16 takes effect on July 1). New Buyers pay the new price immediately in both cases.

### Long-term contracts

A **long-term contract** lets a Buyer commit upfront, at a reduced rate, to a Product that is otherwise billed by consumption just like AWS's reserved EC2 instances. It is available only on the two metered Pricing Models — `Hourly pricing` and `Usage-based pricing`.

It is not a Pricing Model a Seller selects. AWS documents it as a seventh row in their pricing table, *"Hourly pricing or custom metering pricing with long-term contract"*, but it does not appear as its own choice in the Management Portal because it is **layered on top of** a Product that already has metered pricing. The Seller sets the metered price first, then adds a contract price against it.

A long-term contract works by **entitlement rather than by discount code**. Each contract the Buyer holds covers a fixed rate of consumption for the length of the term.

 - One contract at $13,140 for 365 days entitles the Buyer to one pod per hour across the year. Buying two entitles them to two.
 - If they run ten pods in an hour while holding two contracts, two pods are covered and the remaining eight bill at the standard hourly price.
 - The same applies to custom dimensions. A Seller charging $1 per unit might offer 1 unit per hour for 365 days at $4,380 instead of the $8,760 that metered consumption would cost, effectively halving the rate to $0.50 per unit.

The Buyer is billed upfront, either as a single payment or on a schedule of future payments, and billed separately at the metered rate for anything they consume above the commitment.

> [!NOTE]
> This is distinct from `Contract-based pricing`. A long-term contract is a prepaid discount against metered consumption, so the Seller keeps their `MeterUsage` or `RegisterUsage` integration and overage still bills through it. `Contract-based pricing` replaces metering altogether and is enforced through AWS License Manager. See [AWS Marketplace APIs](./marketplace_apis.md).

### Running on other OCI runtimes

No delivery method makes a Container Product portable to an arbitrary OCI-compatible runtime. **The Pricing Model decides this, not the delivery method.**

 - **`Free` and `BYOL` products run on any Docker-compatible runtime.** Neither calls AWS Marketplace at runtime, so there is nothing to fail.
 - **Metered products do not.** `MeterUsage` and `RegisterUsage` return `PlatformNotSupportedException` anywhere other than Amazon ECS, Amazon EKS, and AWS Fargate — including on a Seller's own workstation, which is why local development of a metered container surfaces the exception. The calls depend on Buyer credentials that these services inject at runtime, and a Seller must never bake credentials into the image to work around it.

This has a consequence worth noting: the `Helm chart` delivery method lets a Buyer install onto a self-managed cluster on EKS Anywhere, Amazon EC2, or on-premises, but a **metered** Product installed there cannot meter. Those targets are viable for `Free` and `BYOL` Products.

> [!NOTE]
> `Contract-based pricing` may be the exception, because AWS License Manager licenses are not bound to a node — *"Any software running on any container on any node can checkout the license as long as it has the assigned AWS credentials."* AWS does not state outright that this extends to non-AWS runtimes, so confirm it with AWS Marketplace Seller Operations before designing around it.

## Pricing Dimensions

Container dimensions are **defined entirely by the Seller**. There is no fixed list of unit categories like there is for SaaS Proucts. The documented examples are `users`, `nodes`, `repositories`, and `GB`. Each Product may carry **up to 24 dimensions**.

A Seller might define `admin users` at $2 and `regular users` at $1 as separate dimensions on the same Product, metering the count logged in each day.

> [!NOTE]
> Per task and per pod pricing is the exception: it needs no dimensions at all, because *"usage is metered automatically by AWS."*

Which integration a Seller writes depends on the pricing model, and the API surface differs from SaaS.

| Pricing Model | Integration | Purpose |
| ------------- | ----------- | ------- |
| Per task or per pod hourly, and fixed `Monthly` | `RegisterUsage` | Verifies the Buyer has an active subscription before the container runs, and meters how long it runs. |
| Custom metering | `MeterUsage` | Reports consumption against the Seller's own dimensions. |
| Contract pricing | AWS License Manager | Associates licenses with the Product and checks entitlement. |
| Free and BYOL | None | No AWS Marketplace billing integration. |
