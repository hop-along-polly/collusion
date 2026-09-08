# Server Product (AMI) Listing Details

An AMI listing is a specific type of Server product. An **Amazon Machine Image (AMI)** is a snapshot of an entire server — an operating system with whatever software the Seller installed on top of it — that Amazon EC2 uses as a template when it creates a virtual machine. The Seller builds the AMI, AWS Marketplace distributes it and handles billing, and the Buyer runs and pays for the EC2 instances launched from it.

Nothing is handed over as a file. AWS is explicit that AMI software *"is only available to run on Amazon Elastic Compute Cloud (Amazon EC2). It's not available for download."*

Like Container Products, AMI Products are versioned, and a Seller ships a new release by submitting a **change request** that adds a new `version`.

The Product's `Product Code` is stamped into the AMI itself, and it survives being copied. If a Buyer launches the Seller's image, customises it, and saves the result as their own new AMI, *"The new AMI still contains the original product code, so correct usage tracking and permissions remain in place."* Instances launched from that derived image are still billed as the Seller's Product. This is the mechanism that makes hourly AMI billing work without the Seller writing any code.

> [!IMPORTANT]
> **An AMI Product contains exactly one AMI.** *"You can only use one AMI in an AMI product, but you can add versions of that AMI to the product."* A Seller whose software needs two genuinely different machine images — a controller and a worker, say — cannot put both in one Product. Their options are to bake both roles into a single image, publish two separate Products, or ship a CloudFormation template that launches the same AMI into more than one role.
>
> The Seller submits that AMI from the **US East (N. Virginia)** Region only. AWS Marketplace clones it into every Region the Product is offered in, so *"An AWS Marketplace product contains one AMI for each AWS Region in which the product is available. These AMIs are identical except for their location."*

> [!IMPORTANT]
> **Every new version of an AMI Product is scanned before it can be published.** *"AMI scanning checks for unpatched common vulnerabilities and exposures (CVEs) and verifies that your AMI follows security best practices."* An image containing critical or high-severity unpatched vulnerabilities, or malware, is rejected. Scanning is not a one-time gate either — AWS Marketplace *"continuously scans products to verify that existing listings continue to meet any changes to these requirements"*, and a Product that falls out of compliance can be pulled from new subscribers until it is fixed.
>
> BEST PRACTICE: Use **Test 'Add version'** in the Management Portal before submitting. It runs the full scan against an AMI without adding a version to the Product, so a failure costs nothing.

## Fulfillment (AMI)

Fulfillment of an AMI Product means pairing a **delivery method** — how the Buyer turns the image into running infrastructure — with the AMI itself. As with Container Products, each pairing the Seller authors is a **delivery option**. There are two delivery methods.

| Delivery Method | Seller Provides | Buyer Gets | What gets created | How it works |
| --------------- | --------------- | ---------- | ----------------- | ------------ |
| `Amazon Machine Image (single AMI)` | <ul><li>The AMI</li><li>A recommended instance type</li><li>Usage instructions</li><li>Security group recommendations</li></ul> | <ul><li>The AMI ID for their Region</li><li>An AMI alias for automation</li><li>Usage instructions</li><li>The Seller's recommended instance type and security group settings, pre-filled at launch</li></ul> | One EC2 instance | The Buyer subscribes, then either uses **1-Click launch**, which *"helps you launch quickly with recommended default options such as security groups and instance types"*, or takes the AMI ID into the Amazon EC2 console, the AWS CLI, or their own automation. |
| `AWS CloudFormation template` | <ul><li>Up to three templates, each describing a deployment topology built from the same AMI</li><li>A title, description, and usage instructions per template</li><li>An architecture diagram per template</li></ul> | <ul><li>Each template listed as a deployment option on the Product's listing page</li><li>A **Launch with CloudFormation Console** path that opens the template ready to deploy</li></ul> | A CloudFormation **stack** — as many EC2 instances as the template defines, plus the supporting AWS resources it declares, such as databases, load balancers, or storage | The Buyer picks a template and deploys it. AWS Marketplace has already rewritten it so the AMI reference resolves to the correct image for the Buyer's Region. |

> [!NOTE]
> **A delivery method is a type; a delivery option is an instance.** The two methods above are the types AWS defines. A delivery option is one concrete offering the Seller authors, and the Management Portal asks the Seller to *"select how the buyer can deploy the solution, either AMI (standalone), AMI with CloudFormation, or both."*
>
> The standalone AMI is one delivery option. CloudFormation is up to three, because *"you can choose up to three AMI with CloudFormation delivery options."* A Seller offering both has a ceiling of four delivery options — the same ceiling a Container Product has, reached a different way.

**The three CloudFormation slots are three topologies, not three AMIs.** The Product still contains exactly one image. Each template describes a different *arrangement* of that same image and the AWS resources around it, so the three slots buy the Seller three supported ways to deploy one piece of software.

Take a Seller shipping a fraud-detection engine as a single AMI. They might publish:

| Slot | Template | What it builds | Why the Seller published it |
| ---- | -------- | -------------- | --------------------------- |
| 1 | Evaluation | One instance of the AMI with a small embedded database and no load balancer | Lets a prospect stand the Product up in an afternoon without provisioning a database or reading a network diagram. |
| 2 | Production | Three instances of **the same AMI** across Availability Zones, behind a load balancer, with a new managed database created alongside them | The deployment most paying Buyers run. The Seller would rather ship a correct multi-AZ topology than write documentation asking the Buyer to build one. |
| 3 | Bring your own database | The same three instances, wired to a database the Buyer already operates | Serves regulated Buyers whose data has to stay in a database their own team manages. The software is identical; only the wiring changes. |

None of that is possible with the standalone AMI option alone, which hands the Buyer one image and leaves the surrounding architecture to them. A Seller can offer both — the standalone AMI for Buyers with their own deployment tooling, and templates for everyone else.

> [!WARNING]
> **All delivery options for a version must be submitted together.** *"New delivery options can't be added to an existing version. All delivery options for a single version must be submitted in the same request."* A Seller who publishes a version with only the standalone AMI and later wants to add a CloudFormation template has to publish a new version to do it.

### Amazon Machine Image (single AMI)

The Buyer receives an AMI ID, which identifies one image in one Region and changes with every version. That is awkward to automate against, so AWS Marketplace also publishes an **AMI alias** — a stable name of the form `aws/service/marketplace/prod-1234example5678/12.2` that *"you can use in any Region, and AWS automatically maps it to the correct Regional AMI ID."*

Substituting `latest` for the version number always resolves to the newest release. AWS flags this as risky: if a Product has both a 1.x and a 2.x line, `latest` may hand the Buyer 2.x when the genuinely newest release was a bug fix on 1.x.

The image itself has to clear a fixed set of rules before AWS Marketplace will accept it. The full list is in the [AMI-based product requirements](https://docs.aws.amazon.com/marketplace/latest/userguide/product-and-ami-policies.html), but the ones that most often force a rebuild are:

 - **Built in US East (N. Virginia)**, on a supported operating system, and **no more than two years old**.
 - **No passwords and no baked-in secrets.** Password authentication is prohibited *"even if the password is generated, reset, or defined by the user at launch"*, and the image must contain no credentials, private keys, or pre-authorised SSH keys.
 - **No requesting AWS credentials.** *"AMIs must not request AWS credentials to access AWS services."* Software needing AWS access gets an IAM role attached to the instance instead — the same rule Container Products follow, for the same reason.
 - **No Seller access to Buyer instances.** *"A seller must not have access to instances run by a customer."* If support genuinely needs it, the Buyer has to enable it explicitly.
 - **Reachable by AWS Marketplace's scanner**, on a port the Seller declares. An image locked down against AWS's own vetting cannot be published.

### AWS CloudFormation template

A CloudFormation template is how a Seller ships a deployment topology rather than a single machine. *"You can use a CloudFormation template to deploy multiple instances of an AMI that act as a cluster—along with AWS resources such as Amazon RDS, Amazon Simple Storage Service service—as a single solution."*

The Seller writes the template against a placeholder rather than a fixed image ID, and names that placeholder when submitting the delivery option. AWS Marketplace then copies the template into its own storage and rewrites the placeholder, so that when the Buyer deploys, *"that parameter resolves to the AWS Region-specific AMI ID of your published product."* The Seller never has to maintain a list of AMI IDs per Region.

Beyond that, the requirements are mostly about being deployable by a stranger:

 - Only the Seller's own AMI or an AWS-managed one may appear in it. *"Don't include any community AMI or AMI owned and shared by you or any other third-party."*
 - It must launch *"in all AWS Regions enabled for your product"* and must not depend on a specific Availability Zone, because AZ names map differently in different AWS accounts.
 - Every template needs an **architecture diagram** showing what it builds.
 - It must not ask the Buyer for AWS credentials, must not default any password, and must not leave remote-access ports open to the internet.

### Versions and archival (AMI)

A Seller adds a version, and later **restricts** it so no new Buyer can select it. Restriction is not deletion — *"All subscribers can use the current version regardless of the restriction status"* — and it carries an obligation: *"AWS Marketplace guidelines require that you continue to offer support to existing buyers for 90 days after restricting the version."* A Seller cannot restrict the last remaining public version of a Product.

After that, AWS Marketplace ages versions out on its own.

| Stage | Trigger | Effect |
| ----- | ------- | ------ |
| Restricted | The Seller submits a **Restrict version** change request | New Buyers can't select the version. Existing Buyers keep using it. |
| Archived | The version has been restricted for **two years** | New Buyers can't launch it at all. Existing Buyers can still launch it by AMI ID through launch templates and Auto Scaling groups. |
| Deleted | An archived version has launched no new instance in **13 months** | *"Once deleted, the version is no longer available to launch for new or existing users. This action cannot be undone."* |

Two smaller rules worth knowing. A Seller can update a version's release notes and usage instructions after publishing, but not its title or its AMI — replacing the image means publishing a new version. And unlike a first listing, *"new versions are published to full public availability"*, so there is no private staging step for a new version unless the whole Product is still Limited.

## Pricing Models (AMI)

A Seller picks one Pricing Model when the Product is created. These are the six licensing types the Management Portal offers.

| Pricing Model | What the Buyer pays | Real World Example | Long-Term Commitment | Integration |
| ------------- | ------------------- | ------------------ | -------------------- | ----------- |
| `Free` | Nothing for the software. *"Customers can run as many instances as Amazon Elastic Compute Cloud (Amazon EC2) supports with no additional software charges incurred."* They still pay AWS for the EC2 instances. | A vendor's free community edition, published to get their tooling in front of teams who will later buy the paid edition. | No | None |
| `Bring your own license (BYOL)` | Nothing through AWS Marketplace. *"customers must supply a license key to activate the product. This key is purchased outside of AWS Marketplace."* The Seller owns entitlement, enforcement, pricing, and billing. | A network firewall appliance the Buyer already licenses under a global agreement, deployed from AWS Marketplace because it beats building the image themselves. | No | None |
| `Paid hourly or hourly-annual` | An hourly software charge per instance, on top of EC2 costs. *"Each instance type can be priced differently (but it isn't required to be), and usage is rounded up to the nearest whole hour."* | A commercial database priced at $0.85/hour on a mid-size instance and $3.40/hour on a large one, because the larger instance serves more of the Buyer's workload. | **Yes** — annual on public offers, and multi-annual up to 12 years through a Private Offer | None. *"AWS does the metering based on the product code on the AMI."* |
| `Paid monthly` | A fixed monthly fee *"regardless of the number of instances the customer runs"*, prorated at sign-up and at cancellation. | A self-hosted build server at $250/month, where the Seller would rather not police how many instances the Buyer runs. | No — *"Free Trial and Annual pricing can't be combined with Monthly pricing."* | None |
| `Paid usage` | A per-unit price against dimensions the Seller defines, calculated from usage the Seller's software reports every hour. | A security scanner billing per monitored host, so a Buyer running one scanner across 500 hosts pays for 500 hosts and not for one instance. | No — *"Metering Service products don't support free trials and annual subscriptions."* | `MeterUsage` |
| `AMI with contract pricing` | An upfront fee for a stated quantity of entitlement over a stated term. | A 12-month licence for the "Standard" tier of a log monitoring product — 20 hosts and 10 containers — paid at the start of the term. | N/A — the upfront fee *is* the commitment. 1, 12, 24, or 36 months publicly, up to 144 months through a Private Offer | AWS License Manager |

> [!IMPORTANT]
> **Hourly AMI charges round up to the whole hour.** This is the sharpest billing difference between the two Server Product types. A Container Product billed per pod hourly is charged *per second with a one-minute minimum*, so 20 minutes and 30 seconds of runtime costs 20m30s of money. An AMI instance running for 20 minutes and 30 seconds is billed a full hour. Software whose value comes in short bursts is priced badly as an hourly AMI. See [Pricing Models (Container)](./server_container.md#pricing-models).

> [!NOTE]
> **AMI charges reach the Buyer as two separate line items.** *"Infrastructure Pricing Details"* are the EC2 and related AWS costs, *"defined and controlled by AWS, and can vary between AWS Regions."* *"Software Pricing Details"* are what the Seller charges. The listing page shows them separately, so a Buyer comparing an AMI Product against a SaaS Product is weighing a software price plus infrastructure they operate against a single all-in price.

> [!WARNING]
> **`Paid usage` is the least reversible choice on this list.** *"Products with the AWS Marketplace Metering Service can't be converted to other pricing models such as hourly, monthly, or Bring Your Own License (BYOL)."* Adding metering to an existing Product isn't an edit either — *"you must submit a new AMI and create a new product to enable this feature."* Choose it deliberately.

### Hourly variants (AMI)

`Paid hourly or hourly-annual` is one choice in the portal but several named configurations in the documentation. All of them are an hourly rate combined with a commitment, a trial, or a monthly fee.

| Variant | What it adds | Availability |
| ------- | ------------ | ------------ |
| `Hourly` | Nothing. A rate per instance-hour, priced per instance type. | Public offer |
| `Hourly with Free Trial` | One free instance for a Seller-defined number of days. *"The free trial applies to the most expensive instance type that is running, and any concurrent usage outside the 1 instance is billed at the hourly rate."* | Public offer |
| `Hourly and Monthly` | A fixed monthly fee alongside the hourly rate. *"The monthly fee is charged every month regardless of usage, and the hourly fee is applied based on hourly usage only."* | Public offer |
| `Hourly with Annual` | A year of usage bought upfront *"for one Amazon EC2 instance of one instance type"*, usually below the hourly equivalent. Usage beyond the number of annual subscriptions held bills hourly. | Public offer |
| `Hourly with Annual (includes Free Trial)` | Both of the above. *"Annual subscriptions can be purchased at any time, and they are combined with the Free Trial subscription."* | Public offer |
| `Hourly with Multi-Annual and Custom Duration` | A custom term *"up to 12 years"*, paid upfront or on a schedule the Seller sets. Instances launched beyond the committed count bill at the Private Offer's hourly rate. | **Private Offer only** |

> [!NOTE]
> An annual subscription is an entitlement for a **specific instance type**, not an account-level discount — the same shape as a Container [long-term contract](./server_container.md#long-term-contracts), and the same shape as a Reserved Instance. A Buyer holding two annual subscriptions for a given instance type who runs five of them is covered for two and billed hourly for three. If they run a different instance type instead, they are covered for none of it.

### Free trials (AMI)

Free trials exist only for hourly Products. A Buyer *"can subscribe to the product and use a single instance for up to 31 days without paying software charges on the product"*, AWS infrastructure charges still apply, and the trial *"will automatically convert to a paid subscription upon expiration."* Buyers get a welcome email stating the term and expiration date, and a reminder three days out.

Two things make this less self-service than it looks. Enabling a trial requires the Seller to *"define the duration of the trial period and notify the AWS Marketplace Seller Operations team"*, and offering one commits the Seller to AWS Marketplace's stated refund policy. AWS also quotes two different maximum lengths — 30 days in the pricing model table, 31 days in the free trial section — so confirm the ceiling with Seller Operations before promising a Buyer a specific number.

Trials are unavailable on `Paid monthly`, on `Paid usage`, and on `AMI with contract pricing`, where AWS states it plainly: *"Free trials are not available for AMI products with contract pricing."*

### Annual agreement amendments (AMI)

Buyers on an `Hourly with Annual` plan can change that plan themselves, without the Seller issuing a new offer. They can switch between instance type families, switch between sizes, add a new instance type, or increase the quantity of one already in the agreement.

The constraint is directional: *"Buyers can make a change as long as the prorated cost of the change is greater than zero (they can't lower the value of the subscription)."* Nothing is required of the Seller to turn this on, and it works on public offers and on private offers that don't use installment plans.

> [!IMPORTANT]
> This is the one amendment mechanism outside SaaS, and it is not the one described in [Amendments and Renewals (SaaS)](./saas.md#amendments-and-renewals). A SaaS amendment is an offer the **Seller** creates and the Buyer accepts or declines. An AMI annual amendment is a change the **Buyer** makes on their own. AMI Products still cannot be amended in the SaaS sense.

## Pricing Dimensions (AMI)

AMI Products have **two unrelated dimension systems**, and which one applies depends on the Pricing Model. This catches people out, because both are called dimensions and both cap at 24.

| | `Paid usage` (custom metering) | `AMI with contract pricing` |
| --- | ------------------------------ | --------------------------- |
| Categories available | `Users`, `Data`, `Bandwidth`, `Hosts` — four | `Bandwidth`, `Data`, `Hosts`, `Requests`, `Tiers`, `Users`, and the generic `Units` — seven |
| Categories per Product | One. *"You can select a usage category and define up to 24 dimensions for that one category."* | One |
| Maximum dimensions | 24 | 24 |
| Changeable after publishing? | New dimensions can be added up to 24. Existing dimensions and the category cannot change. | New dimensions can be added up to 24. Existing dimensions cannot change. |
| What the Buyer is billed for | Consumption the Seller's software reported for each hour | The entitlement quantity they bought upfront |

The metering categories are narrower than the SaaS set, which offers six including `Requests` and `Units`. A Seller who wants to bill per API call from an AMI has no `Requests` category to select under metering. Contract pricing, confusingly, does offer it.

### Custom metering (`Paid usage`)

The Seller commits to one way of counting and cannot mix them:

 - **Provisioned** — the Buyer configured a capacity and pays for it whether or not they use it.
 - **Concurrent** — the Buyer pays for however many distinct users or hosts actually connected that hour.
 - **Accumulated** — the Buyer pays for the total volume added up over the hour.

Multiple dimensions within one category let the price vary along an axis: different rates for small, medium, and large monitored hosts, for example. The Seller's software decides which dimension each unit falls into and reports each one separately.

Mechanically, the software calls `MeterUsage` once an hour with the dimension and the quantity consumed, using credentials from an IAM role on the instance. That last part needs the Buyer's cooperation, whether they realise it or not — they have to attach a role with metering permissions when they launch, and the instance needs outbound internet access. *"Your software can't connect to the Metering Service if these two conditions aren't met."*

> [!IMPORTANT]
> **The Seller must choose a failure mode and live with it.** A Buyer can change network settings in a way that stops metering records from being delivered, deliberately or not, so the software has to decide what to do when it cannot report. Failing **open** keeps working and loses the revenue. Failing **closed** disables the software and risks breaking a paying Buyer's production system over a network blip. AWS *"strongly recommend[s] that you refrain from failing closed after less than two hours of metering failures"* and suggests partial degradation as a middle path — keep serving requests, but block configuration changes or new user creation. Whatever is chosen ships inside the AMI and *"can't be changed later."*

### Contract dimensions (`AMI with contract pricing`)

Each dimension carries a rate per duration, and *"The durations must be the same across each dimension"* — offering a 12-month price for one dimension obliges the Seller to offer one for all of them.

The setting that decides the shape of the offer is whether a dimension allows multiple purchases.

 - **Tiered.** The Buyer picks exactly one dimension and quantity is meaningless — choosing the dimension *is* choosing the feature set. This is the `Basic` / `Standard` / `Pro` pattern.
 - **Non-tiered.** The Buyer can buy several dimensions at once and multiple units of each. This is the à la carte pattern: 40 GB of encrypted storage plus 100 GB of unencrypted plus 5 admin seats.

Entitlements are enforced through AWS License Manager rather than by the Seller's own bookkeeping. Buyers can opt into automatic renewal at purchase and *"can modify their renewal settings at any time"*. See [Auto-Renewal](./renewals.md#auto-renewal-on-a-public-offer).

### Integrations by Pricing Model (AMI)

| Pricing Model | Integration | Purpose |
| ------------- | ----------- | ------- |
| `Free` and `BYOL` | None | No AWS Marketplace billing integration. A BYOL Seller enforces their own licence. |
| `Paid hourly or hourly-annual`, and `Paid monthly` | None | AWS bills from the `Product Code` stamped into the AMI. The Seller writes no metering code. |
| `Paid usage` | `MeterUsage` | Reports consumption against the Seller's dimensions, once per hour, using an IAM role on the instance. |
| `AMI with contract pricing` | AWS License Manager | `CheckoutLicense` consumes entitlement, `CheckinLicense` returns it. |

> [!NOTE]
> **An hourly AMI needs no integration code; an hourly Container does.** A Container Product priced per task or per pod has to call `RegisterUsage` to verify the subscription and start metering. An AMI Product priced hourly has nothing to call, because the `Product Code` is part of the image and Amazon EC2 reports it without the Seller's involvement. See [AWS Marketplace APIs](./marketplace_apis.md).
