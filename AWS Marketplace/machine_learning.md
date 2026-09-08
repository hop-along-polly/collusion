# Machine Learning Product Listing Details

An ML listing is how a Seller sells a machine learning model. The Buyer subscribes, and the model runs on **Amazon SageMaker AI**, AWS's managed service for training and running models, inside the Buyer's own AWS account. SageMaker AI is the only place these Products run; there is no other delivery target.

The arrangement is deliberately blind in both directions. The Seller cannot see the Buyer's data and the Buyer cannot see the Seller's model. That is what makes it safe for a Seller to hand a model to a stranger, and safe for a Buyer to feed it confidential data.

As with the other listing types that run in the Buyer's account, the Buyer pays two bills — AWS for the SageMaker AI infrastructure, and the Seller for the software. Both are shown on the listing page before they subscribe.

> [!IMPORTANT]
> **An ML Product runs with the internet unplugged.** *"SageMaker AI deploys images in an environment with no access to the network or AWS service endpoints."* The model cannot call an API, fetch a file, phone home for a licence check, or reach any AWS service. Everything it needs has to be packaged inside it up front.
>
> This is the constraint that most often surprises a Seller, and it rules out several common designs:
>  - No calling an external service mid-inference, so a model that enriches its predictions from a third-party API will not work as an ML Product.
>  - No runtime licence check, which is why ML Products have no metering integration to write — AWS handles billing entirely.
>  - **Serverless Inference is unavailable.** SageMaker AI's serverless option *"require[s] models to have network connectivity. All AWS Marketplace models operate in network isolation."*

## Fulfillment (ML)

There are two ML product types. The difference is simply whether the Buyer brings their own training data.

| Product Type | What the Seller ships | What the Buyer supplies | Use it when |
| ------------ | --------------------- | ----------------------- | ----------- |
| `Model package` | A model that is already trained and ready to make predictions — *"A pre-trained model for making predictions that does not require any further training by the buyer."* | Nothing but the data they want predictions about. | The Seller's own training data is the product's value, and every Buyer should get the same model. A document classifier trained on millions of contracts, sold to firms that have no comparable corpus of their own. |
| `Algorithm` | The training method plus the inference component — *"A model that requires the buyer to supply training data before it makes predictions. The training algorithm is included."* | Their own dataset, which they train against to produce a model of their own. | The Seller's expertise is in *how* to build the model rather than in the data. A demand-forecasting algorithm where every retailer's sales history is different, so a single shared model would be useless. |

Whichever type it is, the Buyer ends up with a deployable model and can run it two ways:

 - **Real-time inference** — SageMaker AI hosts the model behind an API endpoint that the Buyer's own application(s) call.
 - **Batch transform** — the Buyer points the model at a stored dataset, SageMaker AI runs the whole thing through, writes the results back to storage, and shuts down. Nothing keeps running afterwards.

### Model package

The Seller packages a trained model and its inference code.

One restriction catches Sellers building on other people's work (i.e. a model trained using a SageMaker AI built-in algorithm, or using an algorithm the Seller subscribed to on AWS Marketplace) *"can't be published."* The resulting model artifacts can still be used, but your own inference image is required for publishing model packages.

> [!NOTE]
> The Seller can package a model trained anywhere, it does not have to be trained in SageMaker AI.

### Algorithm

An algorithm has two halves, a training component and an inference component. The Buyer runs a **training job** against their own dataset using the Seller's training component, and SageMaker AI writes the resulting model artifacts into the Buyer's own storage. The Buyer then deploys those artifacts with the Seller's inference component to start making predictions.

> [!WARNING]
> **Training output lands in the Buyer's account, where the Seller cannot reach it.** If those model artifacts contain anything the Seller considers proprietary, AWS advises encrypting them before they are written out. The catch is that network isolation applies here too — *"The keys to encrypt and decrypt artifacts can't be accessed over the internet at runtime. They must be packaged with your image."*

Both product types must ship with a **sample Jupyter notebook** hosted on GitHub containing a runnable walkthrough of the whole product. AWS requires that it work *"without asking the buyer to upload or find any data"*, which in practice means the Seller supplies working sample data too.

## Pricing Models (ML)

| Pricing Model | What the Buyer pays | Real World Example | Applies to |
| ------------- | ------------------- | ------------------ | ---------- |
| `Free` | Nothing for the software. They still pay AWS for the SageMaker AI infrastructure it runs on. | A model published to build a reputation, or as the on-ramp to a Seller's paid catalogue. | Both product types |
| `Hourly` | A price per hour per running instance, priced separately per instance type. *"Usage is prorated to the minute."* | An image-recognition endpoint at $1.20/hour on a small instance and $4.00/hour on a GPU instance, because the GPU serves far more requests per hour. | Both product types. For an `Algorithm`, the Seller sets a separate hourly price for training jobs. |
| `Inference` | A price per prediction rather than per hour of uptime. | A credit-risk model at $0.02 per scored application, so a Buyer scoring 500 applications a month pays for 500 predictions instead of a month of uptime. | Real-time endpoints only |
| `Free trial` | Nothing for a fixed number of days. *"During the free trial, buyers can run your software as much as they want and aren't charged for your software."* Infrastructure is still billed. | A 30-day trial on a paid model, so a Buyer can measure its accuracy against their own data before committing. | Any paid Product |

> [!IMPORTANT]
> **`Inference` pricing does not apply everywhere.** AWS is explicit that three things *"always use hourly pricing"* regardless of what the Seller set: batch transform jobs, asynchronous inference endpoints, and training jobs on algorithm products. A Seller pricing per inference still has to set an hourly price for those, and a Buyer who runs the Product in batch is billed by the hour whether they expected it or not.

Free trials run **5–31 days**, with AWS recommending 14–30 for paid Products. Buyers get a welcome email stating the expiry date and a reminder three days out, and offering a trial commits the Seller to AWS Marketplace's stated refund policy.

## Pricing Dimensions (ML)

ML Products have **no Seller-defined dimensions.** Unlike a SaaS or Container Product, where the Seller decides what a unit of value is, the unit here is fixed by how the Buyer ran the model — an instance-hour, or a single inference. There is nothing to name and nothing to configure.

There is also no metering code to write. *"While a buyer runs your software, AWS Marketplace tracks usage and then bills the buyer accordingly."* SageMaker AI reports the usage; the Seller's software plays no part, which is just as well given it cannot reach the network to report anything.

Two details change what a Seller earns under `Inference` pricing.

 - **Only successful responses are billed.** *"AWS Marketplace only charges the buyer for requests where the HTTP response code is `2XX`."* A model that errors is a model that works for free.
 - **One call can be worth more than one inference.** By default each call to the endpoint bills as a single prediction. A Product that scores a whole batch in one call would be badly undercharged, so the Seller can declare the real count in the response using the `X-Amzn-Inference-Metering` header. See [Mechanisms that aren't APIs](./marketplace_apis.md#mechanisms-that-arent-apis).

> [!NOTE]
> **SageMaker AI imposes hard limits that shape what can be sold as an ML Product.** A real-time endpoint accepts at most 25 MB of input per call and must answer within 60 seconds. Batch transform allows 100 MB per call and 60 minutes. None of these *"can be adjusted"*. A model that needs three minutes to think, or that expects a 200 MB input file, cannot be served from a real-time endpoint at all and has to be sold as a batch-only Product.
