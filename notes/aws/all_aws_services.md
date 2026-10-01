# AWS Services Cheatsheet

The services that show up on AWS certification exams, grouped by category, with one or two
sentences on what each one does. The point is service *selection*: enough of a definition to
recognise which service a scenario is describing, and enough of a boundary to rule out the
three that look similar. It is not a substitute for the documentation on any single service.

## Conventions

Every entry says how much AWS operates for you and how far it reaches, because exam questions
are usually won on exactly those two axes.

**How much AWS operates:**

- **Fully managed**: AWS runs the infrastructure, patching, scaling and availability. You
  interact through an API or console and never see a server. If a question stresses "no
  operational overhead", it is pointing at one of these.
- **Managed**: AWS provisions and operates the underlying resources, but you still choose sizes
  and versions and you still own the configuration. RDS picks the instance class you ask for and
  patches it on your schedule; EKS runs the control plane but the node groups are yours.
- **Self-managed**: AWS supplies the hardware and the hypervisor, and everything above the
  virtual machine is yours. EC2 is the archetype.

**How far it reaches:**

- **Regional**: you create it in one Region and it lives there. Most services are regional.
- **Zonal**: it lives in a single Availability Zone, which makes it a single point of failure
  unless you design around it. EBS volumes and NAT Gateways are the ones that catch people.
- **Global**: one instance covers the whole account, across every Region. There is no Region
  picker, and a change applies everywhere at once.

**How entries are nested:**

- A top-level entry is a **service** you can select in a scenario.
- An indented entry is a **feature** of its parent, not a service of its own, and it inherits
  the parent's managed and regional status unless the entry says otherwise.
- A few entries are **platforms**: a family of related services under one brand. Kinesis and
  SageMaker AI are the two that matter, and naming the family when a question wants a specific
  member of it is a common way to get a question wrong.

A **limitation** in bold marks a boundary that exam questions are built on.

## Contents

- [Observability and Auditing](#observability-and-auditing)
- [Identity and Access](#identity-and-access)
- [Compute](#compute)
- [Containers](#containers)
- [Messaging and Application Integration](#messaging-and-application-integration)
- [Storage](#storage)
- [Databases](#databases)
- [Analytics](#analytics)
- [Networking and Content Delivery](#networking-and-content-delivery)
- [Security and Compliance](#security-and-compliance)
- [Governance and Management](#governance-and-management)
- [Cost Management](#cost-management)
- [Migration and Transfer](#migration-and-transfer)
- [Developer Tools](#developer-tools)
- [AI and Machine Learning](#ai-and-machine-learning)
- [Media](#media)
- [End User Computing and Business Applications](#end-user-computing-and-business-applications)
- [IoT and Edge](#iot-and-edge)
- [Patterns, not services](#patterns-not-services)

## Observability and Auditing

- `CloudWatch` *(fully managed, regional)*: Monitoring and observability for every other AWS
  service and for your own applications, collecting metrics, logs, events and alarms in one
  place.
  - `CloudWatch Logs`: Log ingestion and retention, with `Logs Insights` for querying them.
  - `CloudWatch Alarms`: Thresholds on a metric that trigger an SNS notification, an Auto
    Scaling action or an EC2 action.
  - `CloudWatch Agent`: Installed on an instance to push the metrics EC2 does not emit on its
    own, memory and disk utilisation being the two that matter.
  - **limitation**: EC2 publishes CPU, network and disk I/O for free, but **not memory**. Memory
    utilisation requires the agent.
- `X-Ray` *(fully managed, regional)*: Distributed tracing that follows a single request across
  services, used to find which hop in a call chain is slow or failing.
- `CloudTrail` *(fully managed, regional)*: Governance and auditing service that records every
  API call and user activity across the account. The last 90 days of management events are
  available for free; keeping them longer means creating a trail that delivers to S3.
  - `CloudTrail Lake` *(fully managed)*: An immutable audit and security data lake that supports
    SQL queries over user and API activity, instead of parsing JSON out of S3 yourself.
- `AWS Health Dashboard` *(fully managed, global)*: AWS-side events that affect you, both
  service-wide outages and scheduled maintenance on your own resources.
- `Trusted Advisor` *(fully managed, global)*: Automated checks of an account against AWS
  recommendations across cost, performance, security, fault tolerance and service limits.

> [!TIP]
> CloudWatch and CloudTrail answer different questions. CloudWatch is *what is happening to my
> resources*; CloudTrail is *who did what, and when*. A scenario about an auditor, a change
> nobody can account for, or a compliance record is CloudTrail.

## Identity and Access

- `IAM` *(fully managed, global, free)*: Centralised authentication and authorisation for AWS
  resources. Identities and policies are global, so a role created once works in every Region.
  - `Role`: An identity with permissions that is *assumed* temporarily rather than logged into.
    The right answer whenever a scenario involves an application, an EC2 instance, a Lambda
    function or another account needing access, because no long-lived key is created.
  - `Identity-Based Policy`: Attached to a user, group or role, describing what that identity
    may do.
  - `Resource-Based Policy`: Attached to a resource instead of an identity, defining which
    principals can access the resource and what actions they can take. Commonly used for
    cross-account access, since the resource itself grants the permission.
  - `Permissions Boundary`: A ceiling on what an identity's policies can grant, used to delegate
    permission management without letting a delegate escalate.
  - `Access Analyzer`: Reports which resources are shared outside the account or organisation.
- `IAM Identity Center` *(fully managed, regional instance)*: Single sign-on across multiple AWS
  accounts and into business applications, with users coming from its own directory or from an
  external identity provider. Replaces AWS Single Sign-On, which was the old name for it.
- `Cognito` *(fully managed, regional)*: Authentication and user management for *your*
  application's end users rather than for AWS operators.
  - `User Pool`: The user directory itself, handling sign-up, sign-in, MFA and tokens.
  - `Identity Pool`: Exchanges a verified identity for temporary AWS credentials, so an app user
    can reach S3 or DynamoDB directly.
- `STS` *(fully managed, global with regional endpoints)*: Issues the short-lived credentials
  behind every assumed role and federated session.
- `Organizations` *(fully managed, global)*: Groups accounts under one management account for
  consolidated billing and central policy.
  - `Service Control Policy (SCP)`: An organisation-wide ceiling on what an account may do. An
    SCP never grants permission; it only takes away, including from the account's root user.
  - `Organizational Unit (OU)`: A grouping of accounts that an SCP can target.
- `Directory Service` *(managed, regional)*: Microsoft Active Directory in AWS, either as a
  managed directory of its own or as a connector to one you already run on-premises.
- `Resource Access Manager (RAM)` *(fully managed, regional)*: Shares specific resources, such as
  a subnet or a Transit Gateway, with other accounts instead of duplicating them per account.

## Compute

- `EC2` *(self-managed, regional with zonal instances)*: Virtual servers launched in minutes from
  an image, where AWS owns the hardware and hypervisor and you own the operating system and
  everything above it.
  - `AMI (Amazon Machine Image)`: The template an instance launches from, an operating system
    plus whatever software was installed when the image was made.
  - `Instance Store`: Disk physically attached to the host. Fast, free with the instance, and
    **erased when the instance stops**, so it suits caches and scratch space only.
  - `Placement Group`: Control over how instances are positioned relative to each other, whether
    packed together for low latency, spread apart for fault isolation, or partitioned.
  - `Auto Scaling Group`: Policy-based adding and removing of instances to match application
    traffic, across Availability Zones.
  - **limitation**: An Auto Scaling Group does not scale on memory utilisation by default,
    because EC2 does not publish a memory metric. That needs the CloudWatch agent first.

#### Auto Scaling policies

How an Auto Scaling Group decides to change capacity. The distinction between the first two is a
standard exam question.

- `target tracking`: Scales to hold a metric at a target value, for example 60% average CPU
  utilisation. Pick this when the scenario names a level to maintain.
- `step`: Scales by an amount that depends on how far a threshold was breached, for example add
  one instance above 70% CPU and two above 80%. Pick this when the scenario names graduated
  responses.
- `simple`: Scales once when a CloudWatch alarm fires, then waits for a cooldown. It does not
  keep evaluating the metric while it waits, which is why AWS recommends step scaling instead.
- `scheduled`: Scales on a clock rather than a metric, for a load you can predict, such as
  business hours or an overnight batch window.
- `predictive`: Uses machine learning on historical load to scale ahead of a recurring pattern.

Back to the rest of compute:

- `Lambda` *(fully managed, regional)*: Serverless functions that run on demand in response to an
  event, billed per request and per millisecond of execution with no idle cost.
  - `Layer`: Shared dependencies packaged separately from the function code.
  - **limitation**: A single invocation is capped at **15 minutes**. Anything longer belongs on
    Fargate, ECS, Batch or Step Functions.
- `Batch` *(fully managed, regional)*: Queues and runs batch computing jobs, provisioning the
  compute for them and shutting it down afterwards. Built for long-running or heavily parallel
  work that Lambda's time limit rules out.
- `Elastic Beanstalk` *(managed, regional)*: Platform as a service that takes application code
  and provisions the EC2 instances, load balancer and scaling around it. You keep access to the
  underlying resources, which is what distinguishes it from a fully managed runtime.
- `App Runner` *(fully managed, regional)*: Runs a container or a source repository as a scaled
  web service without exposing any infrastructure at all.
- `Lightsail` *(managed, regional)*: Pre-sized virtual servers, databases and load balancers at a
  flat monthly price, aimed at simple workloads that do not need the EC2 console's options.
- `Outposts` *(managed, on-premises, anchored to a Region)*: AWS-owned racks installed in your own
  data centre, running EC2, EBS and other services locally for latency or data-residency reasons.
- `Wavelength` and `Local Zones` *(regional extensions)*: Region extensions placed inside telecom
  networks or metropolitan areas, for single-digit millisecond latency to nearby users.

## Containers

- `Elastic Container Service (ECS)` *(fully managed, regional)*: AWS's own container
  orchestrator for deploying, scaling and managing Docker containers, with no control plane to
  operate.
  - `ECS Anywhere`: Lets the AWS-hosted ECS control plane run container workloads on-premises,
    in your own VMs or on edge devices.
  - `Task Definition`: The specification of a container, its image, resources and IAM role.
- `Elastic Kubernetes Service (EKS)` *(managed, regional)*: Managed Kubernetes control plane,
  with worker nodes you run on EC2 or on Fargate. Pick it when the scenario says Kubernetes or
  implies portability to another Kubernetes cluster.
  - `EKS Anywhere`: An open-source deployment option for running Kubernetes on-premises on
    vSphere, bare metal or edge devices with a consistent AWS-managed experience.
- `Fargate` *(fully managed, regional)*: Serverless compute engine for containers that works
  behind both ECS and EKS, so there is no instance to size, patch or scale.
- `Elastic Container Registry (ECR)` *(fully managed, regional)*: Private Docker image registry,
  integrated with IAM for access and with Inspector for vulnerability scanning.

## Messaging and Application Integration

- `SNS` *(fully managed, regional)*: Publish and subscribe messaging that pushes each message to
  every subscriber of a topic, giving one-to-many fan-out.
- `SQS` *(fully managed, regional)*: Queueing that decouples a producer from a consumer by
  holding messages until something polls for them.
  - `Standard`: Maximum throughput with best-effort ordering and at-least-once delivery.
  - `FIFO`: Guarantees that the first message in is the first message out, and that each message
    is delivered exactly once. Pick it whenever a scenario says order matters.
  - `Dead-Letter Queue`: Where messages land after a consumer has failed to process them a set
    number of times, so one bad message cannot block a queue forever.
  - `Visibility Timeout`: How long a message stays hidden from other consumers after being
    received, giving one consumer time to finish and delete it.
- `EventBridge` *(fully managed, regional)*: Serverless event bus for event-driven
  architectures, routing events from AWS services, your own applications and third-party SaaS by
  rules rather than by address.
  - `EventBridge Pipes`: A point-to-point connection from one source to one target, with optional
    filtering and enrichment in between.
  - `EventBridge Scheduler`: Cron and one-off schedules that invoke a target, which is the
    serverless replacement for a cron box.
- `MQ` *(managed, regional)*: A managed broker for the open protocols, AMQP, MQTT, STOMP and
  JMS. The reason to choose it over SQS or SNS is a migration that must keep speaking an
  existing protocol.
- `Step Functions` *(fully managed, regional)*: Orchestrates workflows of sequential and parallel
  tasks as a state machine, handling retries, branching and waits that would otherwise be code.
  - `Standard Workflow`: Exactly-once execution, up to a year of runtime, full execution history.
  - `Express Workflow`: At-least-once execution for high-volume, short-lived workflows.
- `API Gateway` *(fully managed, regional)*: Creates, publishes, monitors and secures APIs, and
  acts as the front door through which public traffic reaches an application. Handles
  throttling, authorisation, caching and request validation before any of your code runs.
- `AppSync` *(fully managed, regional)*: Serverless GraphQL that resolves a single query across
  several data sources, with subscriptions for real-time updates.

## Storage

### Object Storage

- `S3` *(fully managed, regional with a global namespace)*: Object storage for any volume of
  unstructured data, with eleven nines of durability. Buckets live in one Region but bucket
  names are globally unique, which is why a name can be taken by another account.
  - **limitation**: A single object is capped at **5 TB**, and anything over 5 GB must use
    multipart upload.
  - `Bucket Policy`: A resource-based policy on the bucket that grants or denies access by
    principal, action and condition. The usual way to grant another account access, or to
    require encryption or HTTPS on every request.
  - `Versioning`: Keeps every version of an object, so an overwrite or delete is recoverable.
  - `Lifecycle Policy`: Rules that transition objects to cheaper storage classes or expire them
    on an age schedule.
  - `Replication`: Copies objects automatically to another bucket, either cross-Region (CRR) for
    resilience or same-Region (SRR) for log aggregation and account separation.
  - `Object Lock`: Write-once-read-many retention that prevents deletion for a fixed period,
    used for compliance requirements.
  - `Transfer Acceleration`: Routes uploads through a CloudFront edge location to speed up
    long-distance transfers.
  - `Storage Lens`: Account-wide usage and activity analytics across buckets.
  - `S3 Vectors`: Storage and querying of vector embeddings natively in S3, for retrieval
    augmented generation without a separate vector database.
- **S3 storage classes**, cheapest first on storage and most expensive first on retrieval:
  - `Standard`: Frequent access, no retrieval fee, multi-AZ.
  - `Intelligent-Tiering`: Moves objects between tiers automatically based on observed access.
    The right answer when the access pattern is unknown or changing.
  - `Standard-IA`: Infrequent access, multi-AZ, cheaper storage with a retrieval fee.
  - `One Zone-IA`: Infrequent access held in a single Availability Zone, cheaper again and lost
    if that zone is lost. Suitable only for reproducible data.
  - `Express One Zone`: Single-digit millisecond access in one zone, for request-heavy workloads.
- `S3 Glacier` *(fully managed, regional)*: Archive storage designed for long-term retention at
  the lowest cost, where retrieval is a request that takes time rather than a read.
  - `Glacier Instant Retrieval`: Archive pricing with millisecond retrieval.
  - `Glacier Flexible Retrieval`: Minutes to hours. Standard retrieval is 3 to 5 hours,
    expedited 1 to 5 minutes, bulk 5 to 12 hours, with 10 GB per month of retrieval free.
  - `Glacier Deep Archive`: The cheapest storage AWS offers, with retrieval in 12 to 48 hours.

### Block Storage

- `Elastic Block Storage (EBS)` *(managed, zonal)*: Network-attached block volumes that extend
  the storage of a single EC2 instance, including instances acting as ECS or EKS nodes. A volume
  exists in one Availability Zone and attaches to one instance at a time, Multi-Attach aside.
  - **limitation**: EBS cannot be used with Lambda. Lambda's durable option is EFS.
  - `Snapshot`: An incremental backup of a volume, stored in S3 and usable to create a volume in
    another Availability Zone or Region.
  - `Snapshot Archive`: A low-cost tier for snapshots kept for long-term retention and rarely
    restored.
  - Volume types worth recognising: `gp3` general purpose SSD, `io1` and `io2` provisioned IOPS
    SSD for the highest performance, `st1` throughput-optimised HDD for sequential workloads,
    and `sc1` cold HDD for the cheapest capacity.

### File System Storage

- `Elastic File System (EFS)` *(fully managed, regional)*: Serverless, auto-scaling NFS file
  storage that many compute resources mount at once, usable from EC2, ECS, EKS and Lambda.
- `FSx` *(fully managed, zonal or multi-AZ by deployment type)*: Managed third-party file
  systems, for cases where the workload needs a specific one: `FSx for Windows File Server` for
  SMB and Active Directory, `FSx for Lustre` for high-performance computing and machine learning
  training, `FSx for NetApp ONTAP` and `FSx for OpenZFS` for existing NetApp and ZFS estates.
- `Storage Gateway` *(fully managed, regional)*: Presents cloud storage to on-premises systems as
  something they already understand, so existing applications and backup software keep working
  while the data lands in AWS.
  - `S3 File Gateway`: An NFS or SMB share backed by S3.
  - `Volume Gateway`: iSCSI block volumes backed by S3 snapshots.
  - `Tape Gateway`: A virtual tape library backed by S3 and Glacier, for backup software that
    expects tapes.

### Data Protection

- `AWS Backup` *(fully managed, regional with cross-Region copy)*: Policy-based service that
  centralises and automates backup across services including EBS, RDS, Aurora, DynamoDB, EFS,
  FSx, S3 and Storage Gateway, instead of each service's own schedule.
- `Elastic Disaster Recovery (DRS)` *(fully managed, regional)*: Continuously replicates servers
  into AWS so they can be launched as EC2 instances during a failover, giving recovery measured
  in minutes.

> [!TIP]
> The three storage families answer different questions. **S3** stores whole objects addressed
> by key, with no file system and no partial writes, reached over HTTPS from anywhere. **EBS** is
> a raw block device for one instance in one Availability Zone, which the operating system
> formats and treats as a disk. **EFS** is a shared file system many instances mount at the same
> time. A scenario about many writers needs EFS; a scenario about a boot volume or a database's
> disk needs EBS; a scenario about serving or archiving files needs S3.

## Databases

A **database** stores data in a defined schema for a known set of queries. A **data lake** stores
raw data of any shape, usually in S3, and applies structure when something reads it. The trade is
query speed against the freedom to not decide the schema up front, which is why analytics
pipelines land data in a lake and then load the parts worth indexing into a warehouse.

### Relational

- `RDS` *(managed, regional)*: Creating, operating and scaling relational databases without
  administering the host, available for PostgreSQL, MySQL, MariaDB, Oracle, SQL Server and IBM
  Db2. You still choose the instance class, the version and the maintenance window.
  - `RDS for PostgreSQL`: One of the engines, and the one that stores and queries vector
    embeddings for retrieval augmented generation once `pgvector` is enabled.
  - `Multi-AZ`: A synchronous standby in a second Availability Zone that takes over
    automatically. This is for **availability** and the standby serves no traffic.
  - `Read Replica`: An asynchronous copy that serves read queries. This is for **scale**, and it
    can be promoted or placed in another Region.
- `Aurora` *(fully managed, regional)*: AWS's own relational engine, wire-compatible with MySQL
  and PostgreSQL, with storage that grows on its own and six copies of the data across three
  Availability Zones.
  - `Aurora Serverless v2`: Scales capacity up and down with load, including down to very little,
    for intermittent or unpredictable workloads.
  - `Aurora Global Database`: One database spanning multiple Regions, with a secondary Region
    typically under a second behind and promotable for disaster recovery.

### NoSQL and purpose built

- `DynamoDB` *(fully managed, regional)*: Serverless key-value and document database with
  single-digit millisecond latency at any scale, and no instance to size. On-demand capacity
  bills per request; provisioned capacity bills for reserved throughput.
  - `Global Tables`: Multi-active replication across Regions, meaning reads **and writes** are
    served locally in each Region. The answer whenever a scenario needs writes in more than one
    Region against the same table.
  - `DAX`: An in-memory cache in front of DynamoDB that cuts read latency to microseconds without
    application changes.
  - `Streams`: An ordered change log of a table, usually consumed by Lambda.
- `DocumentDB` *(managed, regional)*: MongoDB-compatible document database, for migrating an
  existing MongoDB application rather than starting fresh.
- `Neptune` *(fully managed, regional)*: Graph database for highly connected data, where the
  queries are about relationships: fraud rings, social graphs, recommendations, knowledge graphs.
- `Keyspaces` *(fully managed, regional)*: Apache Cassandra-compatible wide-column database.
- `Timestream` *(fully managed, regional)*: Time-series database for metrics, telemetry and IoT
  readings, with retention tiers that move old data to cheaper storage automatically.
- `SimpleDB` *(fully managed, regional, legacy)*: An early NoSQL datastore reached by API rather
  than SQL. Superseded by DynamoDB and not a right answer for anything new.

### In-memory and caching

- `ElastiCache` *(managed, regional)*: In-memory caching with sub-millisecond latency, offered
  for Valkey, Redis OSS and Memcached. Memcached is a simple cache with no persistence;
  Valkey and Redis add replication, persistence and data structures.
- `MemoryDB` *(fully managed, regional)*: A Valkey and Redis-compatible database that is durable
  rather than a cache, holding the data as the primary store with multi-AZ transaction logging.

## Analytics

- `Athena` *(fully managed, regional, serverless)*: Runs SQL directly against data in S3, billed
  per terabyte scanned, with nothing to provision. The default answer for occasional queries over
  data already sitting in a lake.
- `Redshift` *(managed, regional)*: Petabyte-scale data warehouse that runs SQL against large
  datasets loaded into its own cluster, with columnar storage tuned for aggregation across
  billions of rows. `Redshift Serverless` removes the cluster sizing decision.
  - `Redshift Spectrum`: Queries data in S3 from a Redshift cluster, without loading it in first.
- `Glue` *(fully managed, regional, serverless)*: Extract, transform and load service for
  preparing data for analytics.
  - `Data Catalog`: The central metadata store, a table definition over data in S3 that Athena,
    Redshift Spectrum and EMR all read.
  - `Crawler`: Infers schema from data in a store and writes it into the Data Catalog.
  - `DataBrew`: Visual data preparation for cleaning and normalising without writing code.
- `EMR` *(managed, regional)*: Managed Hadoop and Spark clusters for large-scale processing, for
  teams that want the open-source frameworks and their tuning knobs.
- `Lake Formation` *(fully managed, regional)*: Builds and governs a data lake on S3, adding
  table, column and row-level permissions over the Glue Data Catalog.
- `Kinesis` *(platform)*: A family of services for collecting, processing and analysing real-time
  streaming data. Name the member, not the family.
  - `Kinesis Data Streams` *(managed, regional)*: Ingests a continuous stream of records and
    retains them so multiple consumers can read the same data independently, with ordering per
    shard. Use it when you need custom processing or replay.
  - `Kinesis Video Streams` *(fully managed, regional)*: The same idea for live video and other
    time-encoded media from devices, feeding playback or machine vision.
  - `Data Firehose` *(fully managed, regional, serverless)*: Captures, transforms and delivers
    streaming data into S3, Redshift, OpenSearch or a third party with no consumer code. Choose
    it over Data Streams when the goal is simply to land the data.
  - `Managed Service for Apache Flink` *(fully managed, regional)*: SQL and Flink applications
    that aggregate, window and analyse a stream in flight.
- `Managed Streaming for Apache Kafka (MSK)` *(managed, regional)*: Managed Apache Kafka, chosen
  over Kinesis when an existing Kafka application or ecosystem has to keep working.
- `OpenSearch Service` *(managed, regional)*: Deploys and operates OpenSearch and legacy
  Elasticsearch clusters for search, log analytics and observability dashboards. Also stores and
  queries vector embeddings for retrieval augmented generation, including a serverless vector
  collection option.
- `QuickSight` *(fully managed, regional, serverless)*: Business intelligence dashboards with
  per-session pricing, and natural-language question answering over your data.
- `Data Exchange` *(fully managed, regional)*: Find, subscribe to and use third-party data sets
  through AWS Marketplace, with delivery, entitlement and billing handled for the provider.

> [!TIP]
> Athena and Redshift Spectrum both run SQL over S3, and the difference is where the engine
> lives. **Athena** is serverless and standalone: no cluster, billed per terabyte scanned, right
> for ad hoc queries. **Redshift Spectrum** is a feature of a Redshift cluster, so it needs one
> running, and it earns its place when a query joins S3 data to tables already in the warehouse.

## Networking and Content Delivery

### VPC building blocks

- `VPC` *(regional)*: A logically isolated private network in AWS, spanning the Availability
  Zones of one Region.
  - `Subnet` *(zonal)*: A range of the VPC's addresses inside one Availability Zone. It is
    *public* if its route table sends internet-bound traffic to an Internet Gateway, and
    *private* if it does not. Nothing else makes a subnet public.
  - `Route Table`: The rules that decide where traffic leaving a subnet goes, matched by
    destination address. This is routing, not filtering: a route table cannot deny anything, it
    can only say where a packet is sent.
  - `VPC Flow Logs`: Metadata about IP traffic to and from network interfaces, capturing source
    and destination addresses, ports, protocol, packet and byte counts, and whether traffic was
    accepted or rejected. It records **no payload**.
  - `Elastic Network Interface (ENI)`: A virtual network card, carrying the private address and
    security groups that move with it.
  - `Elastic IP`: A static public IPv4 address owned by the account rather than by an instance.
- `Internet Gateway (IGW)` *(regional)*: Attaches to a VPC and allows two-way traffic between it
  and the public internet.
- `NAT Gateway` *(fully managed, zonal)*: Lets instances in a private subnet reach the internet
  or another VPC for outbound traffic while blocking connections initiated from outside. A one
  way street. It lives in one Availability Zone, so a resilient design puts one in each.
- `Security Group` *(zonal in effect, instance level)*: A **stateful** firewall evaluated at the
  instance's network interface. Allow rules only, return traffic is automatic, and it denies
  everything not explicitly allowed.
- `Network ACL` *(subnet level)*: A **stateless** firewall evaluated at the subnet boundary.
  Supports both allow and deny rules, evaluates them in number order, and needs matching
  outbound rules because nothing is remembered. The default one allows all traffic in and out.
- `Elastic Fabric Adapter (EFA)` *(instance level)*: A network interface for EC2 that gives very
  low latency between nodes, for high-performance computing, distributed model training and
  computational fluid dynamics.

> [!TIP]
> Three different things filter or direct traffic and exam questions mix them deliberately. A
> **route table** decides *where* a packet goes and cannot deny anything. A **Network ACL**
> allows or denies at the subnet edge and is stateless, so a reply needs its own rule. A
> **Security Group** allows at the instance and is stateful, so a reply is implicit. If a
> scenario needs to block one specific IP address, only a Network ACL can do it, because
> security groups have no deny.

### Private connectivity

- `VPC Peering` *(regional or inter-Region)*: A direct connection letting two VPCs exchange
  traffic over private addresses. Peering is not transitive, so connecting many VPCs this way
  grows into a mesh.
- `Transit Gateway` *(managed, regional)*: A central cloud router connecting VPCs, on-premises
  networks and VPNs through one hub, which is what replaces a point-to-point peering mesh at
  scale.
- `VPC Endpoint` *(regional)*: A virtual device giving a VPC private access to supported AWS
  services without an Internet Gateway, NAT device or VPN.
  - `Gateway Endpoint`: A route-table entry that privately reaches **S3 and DynamoDB** only, at
    no cost.
  - `Interface Endpoint`: An ENI with a private address in your subnet, used for most other
    services, billed hourly and by data processed. Built on PrivateLink.
- `PrivateLink` *(regional)*: Private connectivity to a service, whether an AWS service, another
  account's service or a SaaS product, without the traffic ever crossing the public internet.
- `Direct Connect` *(regional links, global gateway)*: A dedicated physical connection between an
  on-premises network and AWS, for consistent bandwidth and latency rather than best effort.
  - **limitation**: Provisioning takes weeks to months, so a scenario needing connectivity
    *today* is a VPN answer, sometimes a VPN as a stopgap and Direct Connect later.
- `Site-to-Site VPN` *(fully managed, regional)*: Encrypted IPsec tunnels over the public
  internet between an on-premises network and a VPC or Transit Gateway. Fast to set up, and the
  usual backup path for Direct Connect.
- `Client VPN` *(fully managed, regional)*: OpenVPN-based remote access for individual users into
  a VPC.

### Load balancing and DNS

- `Application Load Balancer (ALB)` *(fully managed, regional)*: Layer 7 load balancing that can
  route on host, path, header or query string, which is what makes it the answer when traffic
  must reach different applications by URL.
- `Network Load Balancer (NLB)` *(fully managed, regional)*: Layer 4 load balancing on TCP, UDP
  and TLS, for extreme throughput, static IP addresses per zone, or protocols an ALB cannot
  parse.
- `Gateway Load Balancer (GWLB)` *(fully managed, regional)*: Routes traffic through a fleet of
  third-party network appliances, such as intrusion detection or firewalls, transparently.
- `Route 53` *(fully managed, global)*: DNS, domain registration and health checking, with
  routing policies that decide which answer a query receives.

#### Route 53 routing policies

- `Simple`: One record, one answer, no conditions.
- `Weighted`: Splits traffic between endpoints by assigned weights, which is how canary releases
  and blue/green cutovers are done.
- `Latency`: Sends the client to the Region with the lowest measured latency for them.
- `Failover`: Sends traffic to a primary endpoint and to a secondary only when a health check
  fails.
- `Geolocation`: Answers based on where the user is, for content, language or compliance rules.
- `Geoproximity`: Answers based on distance between user and resource, with a bias that can
  deliberately shift traffic toward or away from a Region.
- `Multivalue Answer`: Returns several healthy records and lets the client choose, which spreads
  load without being a load balancer.
- `IP-based`: Answers based on the client's address block, for known networks such as an ISP's.

### Edge

- `CloudFront` *(fully managed, global)*: Content delivery network with 750 or more global edge
  locations, caching content near users and terminating connections there.
  - **limitation**: A certificate used by CloudFront must be in the **us-east-1** Region, no
    matter where the origin is.
  - `Origin Access Control (OAC)`: Lets CloudFront read a private S3 bucket so the bucket itself
    never has to be public.
  - `Signed URL` and `Signed Cookie`: Time-limited access to private content.
  - `CloudFront Functions` and `Lambda@Edge`: Code run at the edge to rewrite requests,
    personalise responses or handle authentication.
- `Global Accelerator` *(fully managed, global)*: Two static anycast IP addresses that pull
  traffic onto the AWS backbone at the nearest edge and carry it to healthy regional endpoints.
  For TCP and UDP applications rather than cached content, which is the line between it and
  CloudFront.

## Security and Compliance

- `KMS` *(fully managed, regional)*: Creating, managing and rotating the cryptographic keys that
  every other service uses for encryption at rest, with every use recorded in CloudTrail. Keys
  are regional, and a multi-Region key is an explicit choice.
- `CloudHSM` *(managed, regional)*: Single-tenant hardware security modules under your exclusive
  control, for requirements that will not accept a shared service. AWS cannot recover your keys.
- `Secrets Manager` *(fully managed, regional)*: Stores credentials and other secrets and
  **rotates them automatically**, including native rotation for RDS and other databases.
- `Certificate Manager (ACM)` *(fully managed, regional)*: Provisions and renews TLS certificates
  for AWS services at no charge, removing manual expiry as a failure mode.
- `Macie` *(fully managed, regional)*: Discovers, classifies and protects sensitive data in S3,
  identifying personal data and credentials by inspecting the objects themselves.
- `GuardDuty` *(fully managed, regional)*: Threat detection that analyses CloudTrail, VPC Flow
  Logs and DNS logs for compromised credentials, cryptomining and malware across S3, EC2, ECS,
  EKS, Fargate, Lambda, RDS and Aurora. It **does not** scan for misconfiguration such as an open
  port; that is Inspector and Config.
- `Inspector` *(fully managed, regional)*: Continuous vulnerability management, scanning EC2
  instances, ECR images and Lambda functions for known software vulnerabilities and unintended
  network exposure.
- `Detective` *(fully managed, regional)*: Investigates the root cause of a finding by linking
  CloudTrail, VPC Flow Logs and GuardDuty findings into a graph of behaviour over time. It
  explains an incident rather than detecting one.
- `Security Hub` *(fully managed, regional with cross-Region aggregation)*: Single place for
  findings from GuardDuty, Inspector, Macie and partners, scored against standards such as CIS
  and AWS Foundational Security Best Practices.
- `Web Application Firewall (WAF)` *(fully managed, regional or global by what it protects)*:
  Filters HTTP and HTTPS requests at layer 7, blocking SQL injection, cross-site scripting,
  malicious bots and request floods on CloudFront, ALB, API Gateway and AppSync.
- `Shield` *(fully managed, global)*: DDoS protection. `Shield Standard` is on for every account
  at no cost and covers common network and transport layer attacks; `Shield Advanced` adds
  detection, 24/7 response and cost protection for a monthly fee.
- `Network Firewall` *(fully managed, regional)*: Stateful inspection and intrusion prevention
  at the VPC boundary, where security groups and ACLs are too coarse.
- `Firewall Manager` *(fully managed, global)*: Applies WAF, Shield Advanced and Network Firewall
  rules across every account in an organisation, including accounts created later.
- `Audit Manager` *(fully managed, regional)*: Continuously collects evidence against a
  compliance framework, turning an audit into a report rather than a scramble.
- `Artifact` *(global, free)*: Self-service portal for AWS's own compliance reports and
  agreements, such as SOC and ISO certifications.

> [!TIP]
> WAF and Shield both sit in front of an application and do different jobs. **Shield** defends
> against volumetric DDoS at the network and transport layers and is always on. **WAF** inspects
> the content of layer 7 requests, which is the only way to stop SQL injection, cross-site
> scripting or a bad bot, because those are valid traffic by volume.
>
> **Secrets Manager** and **Parameter Store** overlap too. Parameter Store is free and stores
> configuration, with secure strings as an option. Secrets Manager costs per secret and rotates
> credentials automatically. A scenario mentioning rotation is Secrets Manager.

## Governance and Management

- `Config` *(fully managed, regional)*: Records the configuration of resources over time and
  evaluates them against rules, answering what changed, when, and whether it is still compliant.
- `Systems Manager` *(fully managed, regional)*: Operations hub for managing instances and
  resources at scale, both AWS and on-premises.
  - `Parameter Store`: Hierarchical configuration and secret storage, free for standard
    parameters.
  - `Session Manager`: Shell access to an instance without SSH, an open port or a bastion host,
    with the session logged.
  - `Patch Manager`: Scheduled operating system and application patching across a fleet.
  - `Run Command`: Executes a command across many instances without logging into any of them.
- `Control Tower` *(fully managed, global with a home Region)*: Sets up and governs a secure
  multi-account environment, building the landing zone, the organisational units and the
  guardrails rather than leaving them to be assembled by hand.
- `Service Catalog` *(fully managed, regional)*: Lets a platform team publish approved
  CloudFormation products that users can launch themselves, within set constraints.
- `CloudFormation` *(fully managed, regional)*: Infrastructure as code in JSON or YAML, creating
  and updating a stack of resources as one unit, with rollback when a change fails.
  - `StackSets`: Deploys the same stack across many accounts and Regions in one operation.
- `CDK` *(regional)*: Defines the same infrastructure in a general-purpose programming language
  and synthesises CloudFormation from it.
- `Well-Architected Tool` *(global, free)*: Reviews a workload against the six pillars and
  produces an improvement plan.
- `Compute Optimizer` *(fully managed, regional)*: Recommends instance types and sizes from
  observed utilisation, identifying both over-provisioning and bottlenecks.
- `License Manager` *(fully managed, regional)*: Tracks and enforces software licence usage,
  including the bring-your-own-licence terms behind many Marketplace listings.
- `Service Quotas` *(fully managed, regional)*: Views and requests increases to account limits.

## Cost Management

- `Cost Explorer` *(fully managed, global)*: Visualises and filters spend over time with
  forecasting, and is where rightsizing and Savings Plans recommendations appear.
- `Budgets` *(fully managed, global)*: Thresholds on cost or usage that alert, or act, before the
  bill arrives rather than after.
- `Cost and Usage Report (CUR)` *(fully managed, global)*: The most granular billing data
  available, delivered to S3 for querying with Athena or QuickSight.
- `Pricing Calculator` *(global, free)*: Models the cost of an architecture before building it.
- **Pricing models for compute**, which are a question in themselves:
  - `On-Demand`: Pay per second or hour with no commitment. The baseline.
  - `Savings Plans`: A commitment to a steady amount of spend per hour for one or three years, in
    exchange for a discount.
    - `Compute Savings Plan`: The flexible one. The commitment follows usage across instance
      family, size, Region, and across EC2, Fargate and Lambda.
    - `EC2 Instance Savings Plan`: A deeper discount in exchange for committing to an instance
      family in one Region.
  - `Reserved Instances`: A commitment to specific instance attributes for one or three years.
    Largely superseded by Savings Plans, but still examinable, and still how capacity is reserved
    in a specific zone.
  - `Spot Instances`: Spare capacity at up to 90% off, reclaimable with two minutes of notice.
    Right for fault-tolerant, interruptible work, wrong for anything that must finish.
  - `Dedicated Host`: A physical server reserved for your use, for licensing that is bound to
    hardware or for compliance isolation.

## Migration and Transfer

- `Migration Hub` *(fully managed, global view from one home Region)*: Single view of migration
  progress across the other migration services.
- `Application Discovery Service` *(fully managed, regional)*: Inventories an on-premises estate
  and its dependencies so a migration can be planned from evidence.
- `Application Migration Service (MGN)` *(fully managed, regional)*: Lift-and-shift replication of
  physical, virtual and cloud servers into EC2, with a short cutover.
- `Database Migration Service (DMS)` *(fully managed, regional)*: Migrates databases with the
  source staying online, either like-for-like or between different engines.
  - `Schema Conversion Tool (SCT)`: Converts schema and procedural code when the engine changes,
    which is the part DMS alone does not do.
- `DataSync` *(fully managed, regional)*: Automated, accelerated transfer of files between
  on-premises storage and S3, EFS or FSx, over the network and on a schedule.
- `Transfer Family` *(fully managed, regional)*: SFTP, FTPS, FTP and AS2 endpoints in front of S3
  or EFS, so existing partners keep their protocol while the data lands in AWS.
- `Snow Family` *(managed, shipped per Region)*: Physical devices for moving data when the
  network cannot, or for compute at the edge.
  - `Snowcone`: The smallest, portable, for constrained or mobile sites.
  - `Snowball Edge`: Tens of terabytes per device, with storage-optimised and compute-optimised
    variants that can run EC2 and Lambda locally while disconnected.

## Developer Tools

- `CodePipeline` *(fully managed, regional)*: Models a release as stages and transitions, so a
  commit moves through build, test and deploy automatically.
- `CodeBuild` *(fully managed, regional)*: Compiles, tests and packages code on demand, with no
  build server to keep.
- `CodeDeploy` *(fully managed, regional)*: Deploys to EC2, on-premises servers, Lambda or ECS
  with blue/green and canary strategies and automatic rollback.
- `CodeArtifact` *(fully managed, regional)*: Private package repository for npm, pip, Maven and
  NuGet, including upstream caching of public registries.
- `CodeCatalyst` *(fully managed, regional)*: Unified project service combining repositories,
  workflows, environments and issues.
- `CloudShell` *(fully managed, regional, free)*: Browser-based shell with credentials and the
  CLI already configured.
- `Amplify` *(fully managed, regional)*: Hosting and backend wiring for web and mobile front
  ends, including CI from a Git branch.
- `SAM` *(regional)*: A CloudFormation dialect for serverless applications, with a local
  emulator for testing functions before deploying.

## AI and Machine Learning

### Foundation models and custom models

- `Bedrock` *(fully managed, regional, serverless)*: Access to foundation models from Amazon and
  several third parties through one API, with nothing to provision and per-token pricing. The
  right answer when a scenario wants to *use* a model rather than build one.
  - `Knowledge Bases`: Managed retrieval augmented generation, handling ingestion, chunking,
    embedding and retrieval so a model can answer from your own documents.
  - `Agents`: Multi-step task execution, where the model plans and calls APIs you expose to it.
  - `Guardrails`: Configurable filters on prompts and responses for denied topics, harmful
    content, profanity and personal data, applied independently of the model.
  - `Model Evaluation`: Automatic and human evaluation jobs for comparing candidate models on
    your own data.
  - `AgentCore Runtime`: Managed runtime for hosting agents, including agents bought through AWS
    Marketplace.
- `SageMaker AI` *(platform, managed, regional)*: The full machine learning lifecycle, building,
  training, tuning, deploying and monitoring your own models. Choose it over Bedrock when the
  scenario needs control over the model, the data or the training itself.
  - `Studio`: The browser-based development environment for the whole lifecycle.
  - `Ground Truth`: Managed data labelling, with human workforces, to create training sets.
  - `Data Wrangler`: Visual data preparation and feature engineering.
  - `Feature Store`: A shared repository of features so training and inference use the same
    definitions.
  - `JumpStart`: Pre-trained models and solution templates deployed onto infrastructure you own
    and pay for by the hour, which is the pricing difference from Bedrock.
  - `Autopilot`: Trains and tunes candidate models automatically from a tabular dataset.
  - `Canvas`: Builds models through a visual interface, for analysts rather than engineers.
  - `Clarify`: Detects bias in data and models and explains feature importance.
  - `Model Monitor`: Watches a deployed endpoint for data and model quality drift.
  - `Pipelines`: Orchestration for repeatable training and deployment workflows.

### Applied AI services

Pre-trained services that solve one problem through an API. When one of them already covers the
task, building a model is the wrong answer.

- `Comprehend` *(fully managed, regional)*: Natural language processing for entities, key
  phrases, sentiment, language and topics in unstructured text.
- `Translate` *(fully managed, regional)*: Neural machine translation between languages.
- `Transcribe` *(fully managed, regional)*: Speech to text, also called automatic speech
  recognition, with speaker identification and custom vocabulary.
- `Polly` *(fully managed, regional)*: Text to speech, with pronunciation and delivery controlled
  by Speech Synthesis Markup Language tags.
- `Rekognition` *(fully managed, regional)*: Image and video analysis without machine learning
  experience, covering objects, scenes, faces, text and moderation.
  - `Segment Detection`: Detects shot and scene changes when processing video.
  - `Custom Labels`: Trains the service to recognise objects, scenes or concepts specific to a
    business, from a small labelled set.
- `Textract` *(fully managed, regional)*: Extracts text, handwriting, forms and tables from
  scanned documents, preserving the structure rather than returning a flat string.
- `Kendra` *(fully managed, regional)*: Enterprise search across dispersed, unstructured
  repositories, answering natural-language questions with passages from them.
- `Lex` *(fully managed, regional)*: Conversational interfaces, voice and text, built on intents
  and slots. The chatbot building block.
- `Personalize` *(fully managed, regional)*: Real-time recommendations built from your own
  interaction data, using the technology behind Amazon's own recommendations.
- `Forecast` *(fully managed, regional)*: Time-series forecasting from historical data without
  machine learning expertise, for demand, sales and capacity planning.
- `Fraud Detector` *(fully managed, regional)*: Detects likely fraudulent online activity, such
  as fake accounts and payment fraud, from your historical outcomes.
- `Augmented AI (A2I)` *(fully managed, regional)*: Routes low-confidence predictions to human
  reviewers, which is how a human-in-the-loop requirement is satisfied.
- `Amazon Q` *(fully managed, regional)*: Generative AI assistant in two forms, `Q Developer`
  for code, debugging and AWS questions, and `Q Business` for answering from company data.

## Media

- `Elemental MediaConvert` *(fully managed, regional)*: File-based video transcoding into the
  formats and bitrates that different devices and players need.
- `Elemental MediaLive` and `MediaPackage` *(fully managed, regional)*: Live video encoding and
  packaging for broadcast-grade streaming.
- `Elastic Transcoder` *(fully managed, regional, legacy)*: The original media transcoding
  service, converting video and audio for tablets, PCs and smartphones. MediaConvert is its
  replacement for anything new.
- `Kinesis Video Streams`: Covered under [Analytics](#analytics), and the ingestion path for live
  video from devices.

## End User Computing and Business Applications

- `WorkSpaces` *(fully managed, regional)*: Managed virtual desktops, Windows or Linux, delivered
  to any client device.
- `AppStream 2.0` *(fully managed, regional)*: Streams a single application rather than a whole
  desktop.
- `Connect` *(fully managed, regional)*: Contact centre as a service, with telephony, routing and
  reporting, and AI features on top.
  - `Contact Lens`: Analyses customer and agent interactions, live or after the call, for
    sentiment, compliance and talk patterns.
  - `Wisdom`: Surfaces relevant knowledge to an agent in real time during a call.
  - `Q in Connect`: Generative AI assistance giving agents recommended responses and next steps.
- `Simple Email Service (SES)` *(fully managed, regional)*: High-volume transactional and
  marketing email, inbound and outbound, with deliverability and reputation tracking.
- `End User Messaging` *(fully managed, regional)*: Targeted multi-channel messaging over SMS,
  push, email and voice for campaigns and notifications. This is the service that absorbed
  `Pinpoint`.

## IoT and Edge

- `IoT Core` *(fully managed, regional)*: Connects devices to AWS over MQTT and HTTPS, with
  per-device identity, a rules engine for routing messages, and device shadows holding last
  known state.
- `IoT Greengrass` *(managed, on-device)*: Runs Lambda functions, machine learning inference and
  message routing on the device itself, so it keeps working while disconnected.
- `Outposts`, `Local Zones` and `Wavelength`: Covered under [Compute](#compute), and the answer
  whenever latency or data residency rules out a Region.

## Patterns, not services

Exam answers that name a strategy rather than a product.

**Disaster recovery**, cheapest and slowest first. The trade is always cost against recovery time
objective and recovery point objective:

- `Backup and Restore`: Data is backed up and restored into a rebuilt environment on demand.
  Cheapest, recovery in hours.
- `Pilot Light`: A minimal core of the infrastructure is always running in a second Region, data
  replicating into it, with the rest launched on failover. Cost-effective, recovery in tens of
  minutes.
- `Warm Standby`: A scaled-down but fully functional copy runs continuously and is scaled up on
  failover. Recovery in minutes.
- `Multi-Site Active-Active`: Full capacity runs in more than one Region serving live traffic.
  Most expensive, near-zero recovery time.

**The shared responsibility model**: AWS is responsible for security *of* the cloud, meaning the
hardware, the hypervisor and the managed service itself. The customer is responsible for security
*in* the cloud, meaning data, identity, patching whatever they own, and configuration. The line
moves with the service: on EC2 the customer patches the operating system, while on Lambda there
is no operating system to patch.

**The six pillars of the Well-Architected Framework**: operational excellence, security,
reliability, performance efficiency, cost optimisation and sustainability.
