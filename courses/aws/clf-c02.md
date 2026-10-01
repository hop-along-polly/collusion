# AWS Certified Cloud Practitioner (CLF-C02)

AWS's foundational certification. It assumes no engineering experience and tests whether you can
use the vocabulary correctly and say what each service is for: which service solves which
problem, where the line between AWS's responsibility and yours falls, and how AWS charges for
things.

That makes it a breadth exam rather than a depth one. Nearly every question is answerable by
recognising a service from a one-sentence description of what it does, so the preparation that
pays is knowing many services shallowly and the handful of commonly confused pairs precisely.

## Topics covered

| # | Topic | Notes | Flashcards |
|---|-------|-------|------------|
| 1 | What fully managed means, and regional against global scope | [all_aws_services.md](../../notes/aws/all_aws_services.md) | [Core Services](/aws/services) |
| 2 | Compute: EC2, Auto Scaling, Lambda, Batch and the managed runtimes | [all_aws_services.md](../../notes/aws/all_aws_services.md) | [Core Services](/aws/services) |
| 3 | Containers: ECS, EKS, Fargate and ECR | [all_aws_services.md](../../notes/aws/all_aws_services.md) | [Core Services](/aws/services) |
| 4 | Messaging and application integration: SNS, SQS, EventBridge, Step Functions, API Gateway | [all_aws_services.md](../../notes/aws/all_aws_services.md) | [Core Services](/aws/services) |
| 5 | Storage: S3 and its classes, EBS, EFS, FSx, and backup | [all_aws_services.md](../../notes/aws/all_aws_services.md) | [Core Services](/aws/services) |
| 6 | Databases: RDS and Aurora, DynamoDB, and the purpose-built engines | [all_aws_services.md](../../notes/aws/all_aws_services.md) | [Core Services](/aws/services) |
| 7 | Networking: VPC building blocks, security groups against network ACLs | [all_aws_services.md](../../notes/aws/all_aws_services.md) | [Networking](/aws/networking) |
| 8 | Connectivity, load balancing, Route 53 and the edge services | [all_aws_services.md](../../notes/aws/all_aws_services.md) | [Networking](/aws/networking) |
| 9 | Observability and auditing: CloudWatch, CloudTrail, Config and X-Ray | [all_aws_services.md](../../notes/aws/all_aws_services.md) | [Security and Governance](/aws/security-and-governance) |
| 10 | Identity: IAM, Identity Center, Cognito and Organizations | [all_aws_services.md](../../notes/aws/all_aws_services.md) | [Security and Governance](/aws/security-and-governance) |
| 11 | The security suite, encryption and secrets | [all_aws_services.md](../../notes/aws/all_aws_services.md) | [Security and Governance](/aws/security-and-governance) |
| 12 | Governance, billing and the pricing models | [all_aws_services.md](../../notes/aws/all_aws_services.md) | [Security and Governance](/aws/security-and-governance) |
| 13 | Analytics, streaming and the applied AI services | [all_aws_services.md](../../notes/aws/all_aws_services.md) | [Analytics and AI Services](/aws/analytics-and-ai) |
| 14 | The shared responsibility model, Well-Architected, and disaster recovery strategies | [all_aws_services.md](../../notes/aws/all_aws_services.md) | [Security and Governance](/aws/security-and-governance) |

> One note covers this whole certification, split into four card sets because the service
> catalogue is four study units rather than one. Read the Conventions at the top of the note
> first: the vocabulary it defines, fully managed against managed, and regional against zonal
> and global, is what several exam questions turn on.

## What the exam weights

Questions rarely ask how something works. They describe a need in one or two sentences and ask
which service meets it, so the highest-value preparation is the boundaries between services that
sound alike:

- **CloudWatch, CloudTrail and Config** are the three most confused services on the exam.
  CloudWatch is what is happening to a resource, CloudTrail is who did what, Config is what a
  resource's configuration was and whether it is compliant.
- **GuardDuty against Inspector** is threat detection from logs against vulnerability and
  exposure scanning. GuardDuty does not find an open port.
- **WAF against Shield** is request content against traffic volume. Only WAF can stop SQL
  injection, because an injection attack is valid traffic by volume.
- **Security groups against network ACLs** is stateful and allow-only against stateless with
  deny rules. Blocking one address can only be an ACL.
- **Multi-AZ against read replicas** is availability against scale. The standby serves no
  traffic.
- **Scope**: most things are regional, IAM and Route 53 and CloudFront are global, and subnets,
  EBS volumes and NAT Gateways are zonal. The zonal three are where a design quietly depends on
  a single Availability Zone.

Billing and pricing is a scored domain in its own right, which surprises people. Know the four
cost tools by tense, the difference between a Compute and an EC2 Instance Savings Plan, and when
Spot is and is not acceptable.

## What this course does not cover

Hands-on configuration, CLI syntax, and anything requiring you to write a policy document or a
CloudFormation template. The exam does not ask for them, and the material here is pitched at
recognising and reasoning about services rather than operating them.
