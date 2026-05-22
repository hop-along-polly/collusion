# AWS Services Cheatsheet

  The complete list of every AWS service with a brief description of the service and detailed notes on each service and its features.


## Table of Contents

  - [Core Services](#core-services)
    - []

## Core Services

 - `Cloudwatch`: Fully managed monitoring and observability service tracking logs, metrics, and events for ALL other AWS services
 - `X-Ray`: Fully managed tracing service to help analyze, debug, and optimize applications
 - `CloudTrail`: Fully managed governance and auditing service the records every API call and user ativity across AWS infrastructure.


## Identity and Access Management

 - `Cognito`: Fully Managed for user management Authz and Authn
 - `IAM`: Free centralized control of Authz and Authn to AWS Resources
  - `Resource-Based Policy`: An IAM Policy attached to a resource instead of a user or role that defines which principals (AWS services) can access the resource and what actions they can take. Commonly used for cross-account access.
 - `Identity Center`: Fully Managed service used to enable Single Sign-On (SSO) for multiple AWS Accounts. 


## Compute

 - `EC2`: Provides scalable computing capacity in the AWS cloud. You can launch virtual servers in minutes.
  - `Auto-Scaling Groups`: Policy based adding/removing of compute instances to match application traffice. **limitation** Does not support Memory Utilization by default.
 - `Lambda`: Fully managed serverless compute functions 
 - `Step Functions`: Fully managed service for orchestrating workflows with sequential and/or parallel tasks.


### Containerization

 - `Elastic Container Service (ECS)`: Fully managed container orchestration for easily deploying, scaling and managing docker containers
  - `ECS Anywhere`: A feature of ECS allowing the centralized ECS control plane to run and manage docker container workloads on-prem, in VMs and/or edge devices.
 - `Elastic Kubernetes Service (EKS)`: Fully managed kubernetes control-plane and worker nodes
  - `EKS Anywhere`: Open Source deployment option of EKS allowing users to operate kubernetes on-prem in vSphere, on bare-metal and in edge devices while providing a consistent AWS managed experience.
 - `Fargate`: Fully managed serverless compute engine for containers that works with ECS, and EKS


## Distributed Systems Messaging

 - `SNS`: Fully managed pub/sub message service enabling push based many-to-many messaging between applications
 - `SQS`: Fully Managed queueing service
  - `Standard`: maximum throughput with best effort ordering
  - `FIFO`: Guarantees first message in is the first message out.
 - `MQ`: Fully managed message broker service for open-source protocols such as AMQP or MQTT
 - `EventBridge`: Fully managed serverless event bus used for building event driven architectures
  - `EventBridge Pipes`: point-to-point event bus between 1 source and 1 targer.
 - `Kinesis`: A platform of fully managed services for collecting, processing and analyzing real-time data.
  - `Data Streams`: Fully managed service enabling secure streaming of text, logs, and telemetry data to the AWS cloud.
  - `Video Streams`: Fully managed service enabling secure streaming of live video or time encoded data from devices to the AWS cloud.


## Data Storage

### Object Storage

- `S3`: Fully managed object storage service capable of storing 5Tb of data per object.
  - `S3 Vectors`: A feature of S3 enabling vector embeddings to be stored and queried in S3.
  - `One zone IA
  - Standard IA
  - Intelligent Tiering
  - Storage Class analytics???
- `S3 Glacier`: Fully managed object storage designed for low cost, long term offline storage (i.e. it takes a while after requesting the data before it is available).
  - `S3 Glacier Instant Retreival`: Allows retreiving archive data within milliseconds.
  - `S3 Glacier Flexible Retreival`: Allows retreiving 10GB/mo of data for free. Data is available in 3-5 hours standard or 1-5min if expedited, and 5-12 hours if bulk.

### File System Storage

 - `Elastic Block Storage (EBS)`: Block level storage used to extend storage capacity of EC2 instances including those used for ECS and EKS nodes.
  - **limitation**: Cannot be used with AWS Lambdas
  - `EBS Snapshots Archive`: low cost storage teir for long term retention of rarely accessed backups.
 - `Elastic File Store (EFS)`: Fully managed serverless auto-scaling file storage used with EC2, ECS, EKS, and AWS Lambda
 - `FSx`: Fully managed file storage service providing Windows, Net App and OpenZFS file systems. Works with EC2, ECS, EKS, and AWS Lambda
 - `Storage Gateway`: Fully managed service that makes cloud storage (S3, FSx etc.) look and act like a standard network drive. Very similar to DropBox or OneDrive.

### Databases & Data Lakes

 - `RDS`: A fully managed service for creating, operating, and scaling relational databases
  - `RDS Postgres`: One of the DBMS able to be deployed with RDS. Also supports storing and querying vector embeddings for RAG when pgvector is enabled/installed.
 - `Neptune`: Fully managed graph database for handling highly connected datasets.
 - `Aurora`: Fully Managed relational database compatible with MySQL and Postgres
  - `Aurora Global database`: A feature of Aurora allowing a single DB to span multiple regions.
 - `DynamoDB`: Fully managed serverless document storage.
  - `Global Tables`: Fully managed multi-active (allows read/writes in any region) and serverless DB feature automatically replicating table data across AWS regions.
 - `Redshift`: Fully managed petabyte scale data warehouse. Enables SQL Queries to run against large data sets stored in the Redshift cluster.
  - `Redshift Spectrum`: A feature of Redshift allowing SQL queries to be run against data stored in S3 without loading it into Redshift cluster.
 - `Athena`: Fully managed serverless SQL queries of data stored in S3.
 - `SimpleDB`: (Legacy) Fully managed NoSQL datastore using API requests instead of SQL queries for getting, and setting data.

### Caching

 - `ElastiCache`: Fully managed in-memory caching service offering sub-millisecond latency


### Search Engines

 - `OpenSearch Service`: Fully managed service for deploying, operating open-source OpenSearch and Legacy Elasticsearch clusters. Also supports storing and querying vector embeddings for RAG.


## Networking

 - `VPC`: Logically isolated private network within the AWS cloud.
  - `VPC Flow Logs`: Logs that capture metadata (IPs, Ports, Protocols and byte count) about IP traffic in and out from netowrk interfaces in your VPCs.
  - `VPC Peering`: A direct networking connection allowing traffic between 2 VPCs using private IPs.
  - `VPC Endpoint`: A virtual device enabling private and secure connection between VPC and other supported AWS Services without needing an Internet Gateway, NAT device or VPN
    - `VPC Gateway Endpoint`: A specific type of VPC endpoint for routing traffic privately (i.e. w/o accessing public internet) to S3 and DynamoDB.
 - `Cloudfront`: Fully managed Content Delivery network (CDN) with 750+ global edge locations.
  - **Limitation**: Can only access certs in the us-east-1 region
 - `API Gateway`: Fully managed service that allows developers to create, publish maintain and monitor APIs. Acts as the entryway for public traffic to reach applications.
 - `Security Groups` Stateful firewall rules evaluated at the EC2 instance level. Only supports allow rules. By default allows nothing
 - `Network ACLs`: Stateless subnet-level firewall rules. Supports allow/deny rules. By default allows all inbound and outbound traffic.
 - `Internet Gateway (IGW)`: Fully managed component enabling 2-way traffic between VPCs and the public internet.
 - `NAT Gateway`: Managed service that allows EC2 instances in a private subnet to connect to another VPC or the public internet without allowing inbound connections initiated by the public internet of VPCs. (essentially a one way street)
 - `VPC Gateway`: The connection between VPCs and external networks like the public internet and on-prem datacenters
 - `Transit Gateway`: A fully managed centralized cloud router connecting VPCs, on-prem networks and remote VPNs. Replaces point-to-point VPC peering with single managed gateway.
 - `Direct Connect`: A dedicated private connection between on-premises network and VPC
 - `PrivateLink`: Fully Managed service providing private and secure connection between VPCs, AWS services, and on-premise networks without exposing traffic to the public internet.
 - `Site-to-Site VPN`: Fully managed VPN service creating secure IPsec tunnels between on-premises networks and AWS VPC or Transit Gateways.
 - `Application Load Balancer (ALB)`: Layer 7 routing (host/path based routing) to direct traffic to different applications
 - `Network Load Balancer (NLB)`: Layer 4 (i.e. TCP/UDP, IP and Port based routing) and Load Balancing
 - `Elastic Fabric Adapter (EFA)`: A network interface for EC2 enabling high inter-node communication for EC2 instances. MEant for High-Performance Computing (HPC), AI/ML Model training, and computational fluid dynamics (CFD).

## Security

 - `Macie`: Fully managed service for discovering, classifying and protectect sensitive data in S3 buckets.
 - `GuardDuty`: Fully managed threat detection service that analyzes logs to detect compromised creds and Malware. DOES NOT scan for instance configurations (i.e. open ports) in S3, EC2, ECS, EKS, Fargate, Lambda, RDS and Bedrock.
 - `Detective`: Fully managed service that helps identify the root cause of a security incident by analyzing log files from other AWS services like CloudTrail Logs, VPC Flow Logs, and GuardDuty findings.
 - `Inspector`: Fully managed vulnerability management service for detecting software vulnerabilities, and unintended network exposure in EC2 instances, ECR, and Lambda Functions.
 - `Backup`: Fully Managed policy based service that centralizes and automates backup management for AWS services like EBS, RDS, DynamoDB, EFS, and S3 (Does it work with any others though?)
 - `Shield`: Managed DDoS protection service
 - `KMS`: Fully managed key management service for creating, managing, and rotating cryptographic keys.
 - `Web Application Firewall (WAF)`: Managed security service that helps prevent common cyber exploits, ,alicious bots and unauthorized traffice.


## Governance & Management

 - `Config`: Managed service for assessing, auditing and evaluating the configuration of all AWS resources provisioned in an AWS account.
 - `Systems Manager`: A centralized hub and operations management service providing unified visibility, and control of AWS resources (What all resources does this work for though?)
 - `Control Tower`: Fully managed service that automates the setup and governance of secure multi-account environments.


## AI/ML

 - `Amazon Lex`: Fully managed service for building conversational chatbots using voice and text.
 - `Amazon Rekognition`: Fully managed computer vision service enabling developers to add image and video analysis to an application without machine learning experience.
  - `Segment Detection`: A feature of Rekognition that automatially detect scene changes (shots) when processing videos
  - `Custom Labels`: A feature of Rekognition that helps train computer vision models on detecting specific objects, scence or concepts unqiue to the business use case.
 - `Amazon Comprehend`: Fully managed Natural Language Processing (NLP) used for discovering insights, sentiment and relationships in unstructured text (Word Docs, PDFs etc.)
 - `Amazon Polly`: Fully managed AI text to speech service using Speech Synthesis Markup Language (SSML) tags
 - `Transcribe`: Fully managed speech to text conversion. a.k.a automatic speech recognition (ASR)
 - `SageMaker`: Fully managed AWS service providing tooling for building, training, and deploying Machine Learning (ML) Models.
  - `Ground Truth`: A managed data labeling service used to create high quality training data sets.
 - `Textract`: Fully managed service for automatically extracting text from documents, images, handwriting etc.
 - `QuickSight`: Fully managed serverless service for AI-powered business intelligence.
 - `Kendra`: Fully managed AI-powered enterprise search for dispersed, and unstructured data repositories.
 - `Connect`: Fully managed AI-powered contact center as a service.
  - `Wisdom`: An agent assistant feature of AWS Connect providing real-time info to contact center agents.
  - `Q in Connect`: Generative AI assistant feature of AWS Connect providing real-time personalized recommendations to customer service agents.
  - `Contact Lens`: Feature of AWS Connect using ML to analyze customer-agent interactions in real-time or post-call.
 - `Forecast`: Fully Managed using ML to deliver accurate time-series forecasts without requiring the user to have ML experience. (Think sales forecasts and things)
 - `Pinpoint`: Managed service enabling targeted multi-channel email, SMS, push notifications etc. designed for marketing campaigns
 - `Personalize`: Fully managed ML service enabling real-time customized recommendations for customers.


## Misc (Media Processing maybe???)

 - `Elastic Transcoder`: Fully managed service for converting media files (video and audio) into formats compatible with tablets, PCs, smartphones etc.
 - `CloudTrail Lake`: Fully managed immutable audit and security data lake supporting SQL based queries on User and API activity logs.
 - `AWS AppSync`: Fully managed serverless GraphQL service supporting real-time data subscription.
 - `AWS Savings Plans`:
  - `Compute Savings Plan`: Flexible pricing model where customer commits to spending a certain amount per hour (i.e. $10/hour) for 3+ years to receive discounts.
  - `EC2 Savings Plan`: Flexible pricing model where customer commits to specific instance type in a region to receive discounts.
 - `AWS Pilot Light`: Cost effective Disaster Recovery strategy that always keeps minimal core components of infrastructure running is second region.
 - `AWS Data Firehose`: Fully managed service for capturing, transforming and loading real-time stream data into data lakes, data stores, and analytics services
 - `Elastic Beanstalk`: Fully managed PaaS for deploying and scaling web applications.
