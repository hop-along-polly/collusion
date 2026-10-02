# AWS Certified AI Practitioner (AIF-C01)

AWS's foundational certification for artificial intelligence and machine learning. It assumes
no hands-on ML engineering, and tests whether you can describe what the technologies are, pick
the right AWS service for a scenario, and recognize responsible-AI obligations.

## Topics covered

| # | Topic | Notes | Flashcards |
|---|-------|-------|------------|
| 1 | Core concepts, data types and ML paradigms | [ai_practitioner.md](../../notes/aws/ai_practitioner.md) | Concepts & Metrics |
| 2 | Evaluation metrics - classification, regression, generative | [ai_practitioner.md](../../notes/aws/ai_practitioner.md) | Concepts & Metrics |
| 3 | Amazon foundation models and the managed AI services | [ai_practitioner.md](../../notes/aws/ai_practitioner.md) | AWS Services |
| 4 | Bedrock and SageMaker AI | [ai_practitioner.md](../../notes/aws/ai_practitioner.md) | AWS Services |
| 5 | Responsible AI | [ai_practitioner.md](../../notes/aws/ai_practitioner.md) | AWS Services |
| 6 | AWS service selection | [all_aws_services.md](../../notes/aws/all_aws_services.md) | Core Services |
| 7 | The analytics and applied AI services, and where embeddings are stored | [all_aws_services.md](../../notes/aws/all_aws_services.md) | Analytics and AI Services |

> The AI Practitioner notes are covered by two card sets rather than one. At 76 cards the
> material is two study units: the vendor-neutral concepts and metrics, and the AWS service
> catalogue built on top of them.
>
> Topics 6 and 7 draw on the service catalogue instead, which this certification shares with the
> Cloud Practitioner. Topic 7 is worth the time even though it reaches past the exam guide: the
> applied AI services and the vector storage options are where scenario questions about picking a
> service, rather than describing a technique, tend to land.

## What the exam weights

The exam is scenario-driven rather than recall-driven. Most questions describe a situation and
ask which service or technique fits, so the highest-value preparation is knowing the boundaries
between services that look similar:

- **Bedrock vs. SageMaker AI** - consuming an existing foundation model versus building your
  own model. The tiebreaker is how much control the scenario asks for.
- **Bedrock vs. SageMaker JumpStart** - both offer pre-trained foundation models, but JumpStart
  deploys onto hourly infrastructure you manage while Bedrock is serverless and per-token.
- **RAG vs. fine-tuning** - giving the model access to facts versus changing its behavior.
  Scenarios about company data that changes are almost always RAG.
- **Precision vs. recall** - which mistake the scenario says is worse.
- **The managed AI services** - when a pre-trained service already solves the problem, building
  anything is the wrong answer.
