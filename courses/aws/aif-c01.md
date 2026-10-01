# AWS Certified AI Practitioner (AIF-C01)

AWS's foundational certification for artificial intelligence and machine learning. It assumes
no hands-on ML engineering, and tests whether you can describe what the technologies are, pick
the right AWS service for a scenario, and recognize responsible-AI obligations.

## Topics covered

| # | Topic | Notes | Flashcards |
|---|-------|-------|------------|
| 1 | Core concepts, data types and ML paradigms | [ai_practitioner.md](../../notes/aws/ai_practitioner.md) | [Concepts & Metrics](/aws/ai-practitioner-foundations) |
| 2 | Evaluation metrics - classification, regression, generative | [ai_practitioner.md](../../notes/aws/ai_practitioner.md) | [Concepts & Metrics](/aws/ai-practitioner-foundations) |
| 3 | Amazon foundation models and the managed AI services | [ai_practitioner.md](../../notes/aws/ai_practitioner.md) | [AWS Services](/aws/ai-practitioner-aws) |
| 4 | Bedrock and SageMaker AI | [ai_practitioner.md](../../notes/aws/ai_practitioner.md) | [AWS Services](/aws/ai-practitioner-aws) |
| 5 | Responsible AI | [ai_practitioner.md](../../notes/aws/ai_practitioner.md) | [AWS Services](/aws/ai-practitioner-aws) |
| 6 | AWS service selection | [all_aws_services.md](../../notes/aws/all_aws_services.md), [notes.md](../../notes/aws/notes.md) | [Service Selection](/aws/services) |

> The AI Practitioner notes are covered by two card sets rather than one. At 76 cards the
> material is two study units: the vendor-neutral concepts and metrics, and the AWS service
> catalogue built on top of them.

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
