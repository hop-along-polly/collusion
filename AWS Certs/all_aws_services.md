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

 - `Cognito`
 - `IAM`
 - `Identity Center`


## Compute

 - `Lambda`: Fully managed serverless compute functions 
 - `Step Functions`: Fully managed service for orchestrating workflows with sequential and/or parallel tasks.


## Distributed Systems Messaging

 - `SNS`: Fully managed pub/sub message service enabling push based many-to-many messaging between applications
 - `SQS`: Fully Managed queueing service
  - `Standard`: maximum throughput with best effort ordering
  - `FIFO`: Guarantees first message in is the first message out.
 - `MQ`: Fully managed message broker service for open-source protocols such as AMQP or MQTT
 - `EventBridge`
 - `Kinesis`: A platform of fully managed services for collecting, processing and analyzing real-time data.
  - `Video Streams`: Fully managed service enabling secure streaming of live video or time encoded data from devices to the AWS cloud.

## Data Storage

### Object Storage

- `S3`: Fully managed object storage service capable of storing 5Tb of data per object.
  - `S3 Vectors`: A feature of S3 enabling vector embeddings to be stored and queried in S3.
- `S3 Glacier`: Fully managed object storage designed for low cost, long term offline storage (i.e. it takes a while after requesting the data before it is available).

### File System Storage

 - `Elastic Block Storage (EBS)`: Block level storage used to extend storage capacity of EC2 instances and EKS nodes. (anything else though???)
  - `EBS Snapshots Archive`:
 - `Elastic File Store (EFS)`: Fully managed serverless auto-scaling file storage used with EC2, ECS, EKS, and AWS Lambda
 - `FSx`: Fully managed file storage service providing Windows, Net App and OpenZFS file systems.
 - `Storage Gateway`: Fully managed service that makes cloud storage (S3, FSx etc.) look and act like a standard network drive. Very similar to DropBox or OneDrive.

### Databases & Data Lakes

 - `RDS`: A fully managed service for creating, operating, and scaling relational databases
  - `RDS Postgres`: One of the DBMS able to be deployed with RDS. Also supports storing and querying vector embeddings for RAG when pgvector is enabled/installed.
 - `Neptune`: Fully managed graph database for handling highly connected datasets.
 - `Aurora`: Fully Managed relational database compatible with MySQL and Postgres
  - `Aurora Global database`: 
 - `DynamoDB`: Fully managed serverless document storage.
 - `Redshift`: Fully managed petabyte scale data warehouse. Enables SQL Queries to run against large data sets stored in the Redshift cluster.
  - `Redshift Spectrum`: A feature of Redshift allowing SQL queries to be run against data stored in S3 without loading it into Redshift cluster.
 - `Athena`: Fully managed serverless SQL queries of data stored in S3.

### Caching

 - `ElastiCache`: Fully managed in-memory caching service offering sub-millisecond latency


### Search Engines

 - `OpenSearch Service`: Fully managed service for deploying, operating open-source OpenSearch and Legacy Elasticsearch clusters. Also supports storing and querying vector embeddings for RAG.


## Networking

 - `VPC`: Logically isolated private network within the AWS cloud.
  - `VPC Endpoint`: A virtual device enabling private and secure connection between VPC and other supported AWS Services without needing an Internet Gateway, NAT device or VPN (Which services are supported?)
 - `Site-to-Site VPN`:
 - `Cloudfront`: Fully managed Content Delivery network (CDN) with 750+ global edge locations
 - `API Gateway`: Fully managed service that allows developers to create, publish maintain and monitor APIs. Acts as the entryway for public traffic to reach applications.
 - `Security Groups` Stateful firewall rules evaluated at the EC2 instance level. Only supports allow rules.
 - `Network ACLs`: Stateless subnet-level firewall rules. Supports allow/deny rules.
 - `NAT Gateway`: Managed services that allows EC2 instances in a private subnet to connect to another VPC or the public internet without allowing inbound connections initiated by the public internet of VPCs. (essentially a one way street)
 - `Direct Connect`: A dedicated private connection between on-premises network and VPC
 - `Transit Gateway`: A fully managed service acting as a central hub for connecting on-premises networks and VPCs
 - `PrivateLink`: Fully Managed service providing private and secure connection between VPCs, AWS services, and on-premise networks without exposing traffic to the public internet.


## Security

 - `Macie`: Fully managed service for discovering, classifying and protectect sensitive data in S3 buckets.
 - `GuardDuty`: Fully managed threat detection service that continuously monitors S3, EC2, ECS, EKS, Fargate, Lambda, RDS and Bedrock.
 - `Detective`: Fully managed service that helps identify the root cause of a security incident by analyzing log files from other AWS services like CloudTrail Logs, VPC Flow Logs, and GuardDuty findings.
 - `Inspector`: Fully managed vulnerability management service for detecting software vulnerabilities, and unintended network exposure in EC2 instances, ECR, and Lambda Functions.
 - `Backup`: Fully Managed policy based service that centralizes and automates backup management for AWS services like EBS, RDS, DynamoDB, EFS, and S3 (Does it work with any others though?)
 - `Shield`: Managed DDoS protection service
 - `KMS`: Fully managed key management service for creating, managing, and rotating cryptographic keys.

## Governance & Management

 - `Config`: Managed service for assessing, auditing and evaluating the configuration of all AWS resources provisioned in an AWS account.
 - `Systems Manager`: A centralized hub and operations management service providing unified visibility, and control of AWS resources (What all resources does this work for though?)
 - `Control Tower`:


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
  - `Contact Lens`: Feature of AWS connect using ML to analyze customer-agent interactions in real-time or post-call.
 - `Forecast`: Fully Managed using ML to deliver accurate time-series forecasts without requiring the user to have ML experience. (Think sales forecasts and things)
 - `Pinpoint`: Managed service enabling targeted multi-channel email, SMS, push notifications etc. designed for marketing campaigns
 - `Personalize`: Fully managed ML service enabling real-time customized recommendations for customers.


## Misc (Media Processing maybe???)

 - `Elastic Transcoder`: Fully managed service for converting media files (video and audio) into formats compatible with tablets, PCs, smartphones etc.
 - `CloudTrail Lake`: Fully managed immutable ausit and security data lake supporting SQL based queries on User and API activity logs.

