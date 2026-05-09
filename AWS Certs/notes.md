Scaling Policies
  - `target tracking`: scales resources in the auto-scaling group to maintain a specific target metric (i.e. 60% CPU utilization)
  - `step`: scales resources in the auto-scaling group based on thresholds (i.e. add 1 instance if CPU > 70%, add 2 instances if CPU > 80%).
  - `simple`: scales resources in the auto-scaling group when a specific CloudWatch alarm is triggered. These types of policies only trigger on CloudWatch events and do not continuously evaluate a metric to determine if a scaling action is needed.
  - `scheduled`: scales resources in the auto-scaling group based on a pre-defined schedule. (i.e. scale up during peak hours and scale down over night)


Policy Routing for Network traffic.
  - Weighted
  - Geoproximity
  - Geolocation
  - Multivalue Answer

VPC Endpoint
Site-to-Site VPN




## Questions to Answer
 - What does fully managed mean?
 - What is the difference between a database and a datalake?
 - What is the difference between Redshift Spectrum and Athena?
 - How does Network ACLs and Route Tables for a subnet work?
 - What is the difference between EBS blocks, S3 Objects and other file storange units in AWS
 - What is the difference between a managed service and fully managed service in AWS?
 - What are the different ways to host models with SageMaker
 - What is forward diffusion and reverse (backward) diffusion
 - What are the different family of models and models within those families published by AWS.
 - What are the 5 principles of Responsible AI.
 - What are pruning, distillation, quantization, and fine-tuning used for in AI/ML?

## Notes

 - Clearly call out AWS platforms like Kinesis and SageMaker from services S3 and Features.



## Terms to include from notes
 - Top K, Top P, Temperature
 - S3 Bucket Policy
 - Linear Regression, K-Means Clustering, Decision tree, Support Vector Machine, PCA
 - N-grams
 - transformer-based model
 - Multi-Model hosting, A/B Testing, Consistent Hashing, Amazon OpenSearch Serverless