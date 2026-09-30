# AWS Certified AI Practitioner (AIF-C01)

## Core Concepts

### Terminology

 - `Labels`: The target values included in training data that an algorithm is trying to predict.
 - `Inferencing`: Making a prediction based on the training data. There are 2 sub-types of inferencing
    - `Real-time Inferencing`: New data is analyzed in real-time producing results quickly (chatbots, self-driving cars). Real-Time inferencing is fast, but results can be inaccurate b/c the algorithm doesn't have time to analyze the full data set.
    - `Batch Inferencing`: Analyzing large amounts of data all at once. Batch Inferencing is slower than Real-Time Inferencing, but results are usually more accurate.
 - `Confusion Matrix`: A four-quadrant grid that maps a classification model's predictions against what was actually true. It is the source the classification metrics (accuracy, precision, recall, F1) are calculated from. The 4 quadrants are
    - `True Positive (TP)`: predicted positive, and it was positive.
    - `True Negative (TN)`: predicted negative, and it was negative.
    - `False Positive (FP)`: predicted positive, but it was negative.
    - `False Negative (FN)`: predicted negative, but it was positive.
 - `N-Gram`: A continuous sequence of N words extracted from text or speech. See [Example](#n-gram-example) below.
 - `Feature`: A single piece of input information the model uses to make its prediction. Predicting a house price from its square footage, its number of bedrooms, and its postal code means the model has three features. In a spreadsheet of training data, each column is a feature and each row is one example.
    - `Feature Engineering`: The work of turning raw data into useful features, such as combining a start date and an end date into a single "duration" column, or converting a postal code into a distance from the city center. Better features usually improve a model more than a better algorithm does.
 - `Hyperparameter`: A setting chosen **before** training begins that controls how the training itself runs. Hyperparameters are set by a person whereas the model's `weights`, the numbers it actually learns from the data, are produced by training. Common examples;
    - `Learning Rate`: how large an adjustment to make each time the model corrects itself. Too large and it overshoots the right answer, too small and training takes forever.
    - `Epochs`: how many times the model works through the entire training dataset. Too few and it has not learned enough (`Underfitting`), too many and it starts memorizing (`Overfitting`).
    - `Batch Size`: how many training examples the model looks at before making one adjustment.
    - `Number of Layers` / `Number of Neurons`: how large a neural network to build.
    - `Max Depth`: for a Decision Tree, how many questions deep the tree is allowed to go.
    - `K`: for K-Means Clustering, how many clusters to sort the data into. For K-Nearest Neighbors, how many neighbors to consult.
 - `Training Job`: A single run in which compute resources are started up, an algorithm is applied to a training dataset, and a finished model is produced and saved. The compute resources shuts down when the run finishes.
 - `Endpoint`: A trained model that has been deployed and is running behind an HTTPS web address. It works exactly like a REST API endpoint you would call from any application: you send an HTTP request containing the input data and get a response containing the model's prediction. The difference is only in what sits behind the address, a model rather than ordinary application code, so any client that can call a REST API can call a model endpoint.
 - `Overfitting`: When a model has effectively memorized its training data rather than learning a general pattern. It scores extremely well on data it has already seen and poorly on anything new.
 - `Underfitting`: The opposite problem of overfitting. The model is too simple to capture the relationship in the data, so it predicts poorly even on the data it was trained on.
 - `Drift`: When the real world changes after a model is deployed, so the live data stops resembling the training data and the model's predictions get worse over time. A model trained on shopping habits drifts as those habits change over time.
 - `MLOps`: The combination of people, processes, and tooling used to run machine learning in production reliably, covering version control, automation, continuous training, monitoring, and governance.

### Foundation vs. Frontier Models

These two terms get used interchangeably, but one is a category and the other is a ranking within that category. The relationship is the same as squares and rectangles: **every square is a rectangle, but not every rectangle is a square.**

 - `Foundation Model (FM)`: the rectangle. Any large model pre-trained on an enormous amount of general data, built to be adapted to many different tasks rather than one. Size and capability are not part of the definition. A small, cheap, two-year-old model is still a foundation model.
 - `Frontier Model`: the square. A foundation model that also sits at the leading edge of what models can currently do, which in practice means the largest and most capable models available at that moment. Every frontier model is a foundation model. Most foundation models are not frontier models.

Where the metaphor breaks down is time. A square is a square permanently, but frontier status expires: today's frontier model becomes an ordinary foundation model once the next generation arrives, without the model itself changing at all. The label describes where a model sits relative to everything else, not what it is.

This is also why the two terms carry different weight outside of engineering. Because frontier models are the most capable ones in existence, they attract the most attention from regulators and the most scrutiny around safety testing before release.

> [!NOTE]
> **The exam almost always says "foundation model".** `Frontier model` is worth recognizing if it appears, but AWS documentation and the exam objectives are written around foundation models, and every Amazon model in this guide is described as an FM.

### N-Gram Example

Given the sequence of text "How much wood would a wood chuck chuck" if broken down into a `2-Gram` (Bi-Gram) you would get the following 2-Grams;
 - "How much"
 - "much wood"
 - "wood would"
 - "would a"
 - "a wood"
 - "wood chuck"
 - "chuck chuck"

If broken down into a `3-Gram` (Tri-Gram) you would get the following 3-Grams;
 - "how much wood",
 - "much wood would",
 - "wood would a",
 - "would a wood",
 - "a wood chuck",
 - "wood chuck chuck"

## Types of Data

 - `Labeled`: data accompanied by a `label` representing the desired output/classification.
 - `Unlabeled`: data where there is no `label` representing the desired outcome/classification.
 - `Strucutred Data`: data that is organized and formatted in a pre-defined manner (i.e. CSV, JSON, or DB records)
    - `Tabular Data`: data that can be represented in CSV files or DB Records
    - `Time Series Data`: data that consists of sequences of values measured at successive points in time. (i.e. Stock prices, sensor readings)
 - `Unstructured Data`: data that lacks predefined structure or format (i.e. resumes, images, videos etc.)

## Machine Learning Algorithms

There are 3 board types of Machine Learning algorithms.

| ML Paradigm | Description | Analogy | Use Cases | Common Algorithms |
| ----------- | ----------- | ------- | --------- | ----------------- |
| `Supervised Learning` | Trained on labeled data, where every training example includes the target value the model is trying to predict. The goal is to learn a mapping function that correctly labels new, previously unseen input. | A student working through a study guide with an answer key. Every practice question comes with the correct answer, so the student can check each attempt and adjust before the real exam. | <ul><li>Classification (spam detection, image recognition)</li><li>Regression (price, demand, or sales forecasting)</li><li>Time series forecasting</li><li>Sentiment analysis</li><li>Fraud detection</li></ul> | <ul><li>Linear Regression</li><li>Logistic Regression</li><li>Decision Trees</li><li>Random Forest</li><li>Support Vector Machines (SVM)</li><li>K-Nearest Neighbors (KNN)</li><li>Neural Networks</li></ul> |
| `Unsupervised Learning` | Learns from unlabeled data with no target values supplied. The goal is to discover inherent patterns, structures, and relationships in the data itself. | Sorting a shoebox of unlabeled photos into piles. Nobody says what the piles should be, you group them by what looks similar and the categories emerge as you go. | <ul><li>Clustering (customer segmentation)</li><li>Anomaly / outlier detection</li><li>Dimensionality reduction</li><li>Pattern and association discovery (market basket analysis)</li><li>Recommendation engines</li></ul> | <ul><li>K-Means Clustering</li><li>Hierarchical Clustering</li><li>Principal Component Analysis (PCA)</li><li>Association Rules (Apriori)</li></ul> |
| `Reinforcement Learning` | An agent learns by acting in an environment and receiving a performance score as its only guidance. Feedback arrives as rewards and penalties rather than labeled answers, so the agent improves by trial and error toward the highest cumulative reward. | Training a dog with treats. You never explain the trick, you reward the behavior you want and withhold the treat otherwise, and the dog works out which actions pay off. | <ul><li>Robotics and autonomous control</li><li>Game playing</li><li>Self-driving vehicles</li><li>Real-time decision making (bidding, resource allocation)</li><li>Aligning foundation models to human preference (RLHF)</li></ul> | <ul><li>Q-Learning</li><li>Deep Q-Networks (DQN)</li><li>Policy Gradient methods</li><li>Reinforcement Learning from Human Feedback (RLHF)</li></ul> |

> [!NOTE]
> **Reinforcement Learning from Human Feedback (RLHF)** puts a person in the reward loop. Instead of an automated score, human reviewers rank or rate the model's responses, those preferences train a **reward model**, and the reward model then supplies the reward signal that tunes the foundation model.
>
> It is how a raw pretrained model is aligned to be helpful, honest, and harmless, and it is the usual exam answer for *"how do you make a model's output match human preferences and values?"*
>
> On AWS, **SageMaker Ground Truth** is the service that collects the human-labeled preference data RLHF depends on.

## Evaluation Metrics
 
Evaluating a model means running it over a set of examples where the true answers are already known, then comparing what the model predicted against those known answers. Which metric you use depends on what kind of answer the model produces.

 - `Classification` models choose between a fixed set of answers (`cake` or `not cake`, fraud or legitimate), so they are scored on how often they picked the right one and on which kind of mistake they made when they were wrong.
 - `Regression` models produce a number on a sliding scale (a price, a temperature) and scored on how far their predicted numbers were from the true ones.
 - `Generative` models produce text, which has no single correct answer, so they are scored on how closely their output resembles a reference text written by a human for the same task.

### Classification Metrics

Classification results are first mapped into a `Confusion Matrix`, a four-quadrant grid comparing what the model predicted against what was actually true. Every classification metric below is calculated from these four counts.

As an example the `Confusion Matrix` below shows what each quadarant means when classifying images as **cake** or **not cake**.

|  | **Actually Positive** | **Actually Negative** |
| --- | --- | --- |
| **Predicted Positive** | `True Positive (TP)` predicted `cake`, and it was `cake` | `False Positive (FP)` predicted `cake`, but it was `not cake` |
| **Predicted Negative** | `False Negative (FN)` predicted `not cake`, but it was `cake` | `True Negative (TN)` predicted `not cake`, and it was `not cake` |


Once an evaluation set has been processed by a model or algorithm the following metrics can be calculated based on the number of `True Positives (TP)`, `False Positives (FP)`, `False Negatives (FN)`, and `True Negatives (TN)` produced during that evaluation run.

| Metric | Formula | What it measures | Use it when | Usage Example |
| ------ | ------- | ---------------- | ----------- | ------------- |
| `Accuracy` | `(TP + TN) / (TP + FP + TN + FN)` | Out of all the predictions the model made, how many did it get right? Both True Postives (`TP`) and True Negatives (`TN`) count towards the models accuracy. | Both answers appear often in the data, and a mistake in either direction does about the same amount of harm. <br /> <br />If one of the two answers is rare, accuracy will make a useless model look good. In those cases use `F1` instead. | Classifying photos of things as `cake` and `not cake` for a game. Roughly half the images are cake, and a mislabel in either direction is equally harmless.<br /><br > Compare that to fraud detection, where only 1 transaction in 100 is fraud: a model that labels every single transaction as legitimate gets 99 out of every 100 predictions right, so its accuracy is 99% even though it never catches any fraud at all. |
| `Precision` | `TP / (TP + FP)` | Of the cases the model flagged as positive, how many really were positive? Precision looks only at the flagged cases and ignores everything the model passed over, which means the only mistake that can lower it is a false positive (a false alarm). | **A false alarm is expensive.** | A fraud detection system that automatically freezes a credit card. Every false positive freezes a legitimate customers card and leaves them stranded at checkout, so the bank wants the model to be nearly certain before it flags a transaction. |
| `Recall` (Sensitivity) | `TP / (TP + FN)` | Of all the cases that really were positive, how many did the model catch? Recall looks only at the cases that were truly positive and ignores the false alarms, which means the only mistake that can lower it is a false negative (a real case the model missed). | **Missing a real case is expensive.** It is worth putting up with extra false alarms if that is what it takes to catch nearly every real case. | A screen that checks whether a cookie recipe contains peanuts. A false alarm means someone skips a cookie they could safely have eaten. A miss means someone with a severe allergy eats peanuts, so the model must catch every real case even if that means flagging some recipes that are actually safe. |
| `F1 Score` | `2 × (Precision × Recall) / (Precision + Recall)` | Precision and recall combined into a single score. The formula is a harmonic mean rather than a plain average, and the practical effect is that the result gets dragged down toward whichever of the two is worse. A model with precision of `1.0` and recall of `0.0` would have a plain average of `0.5`, but its F1 is `0`. A model therefore cannot earn a good F1 by doing well on one and badly on the other. | **Both kinds of mistake matter and you need one number to rank models by.** It is also the standard stand-in for accuracy when one of the two answers is rare. | Filtering spam out of an inbox. A False Negative lets spam reach the inbox which is annoying, but a False Positive flagging a real invoice as spam is worse, so neither mistake can be ignored. |
| `AUC-ROC` | Area under the Receiver Operating Characteristic (ROC) curve, which plots the true positive rate against the false positive rate | A classifier does not really answer "yes" or "no". It produces a score, such as `0.82`, and a **threshold** decides how high that score has to be before the answer counts as "yes". Lowering the threshold catches more real cases but increases false alarms. Raising the threshold does the opposite.<br /><br /> AUC-ROC tries every possible threshold, records the trade-off at each one, and boils the whole picture down to one number describing how well the model tells the two answers apart. | **You are comparing models against each other before anyone has decided where to set the threshold.** A score of `1.0` means the model separates the two answers perfectly, and `0.5` means it does no better than flipping a coin. | Choosing between three candidate models for predicting loan defaults. Nobody has yet decided how high a risk score must be before an application is declined, so each model is scored across every possible cutoff. The model that separates defaulters from non-defaulters best wins, and the threshold is chosen afterwards. |

> [!IMPORTANT]
> **Precision and recall pull against each other.** Tuning a model to raise one of them almost always lowers the other, so you have to decide which mistake you would rather make. Exam questions test whether you can spot which one a scenario calls for, and the giveaway is always which mistake the scenario describes as worse.
>
>  - If the harm comes from an alarm that should never have fired, the answer is `Precision`.
>  - If the harm comes from a real case slipping through unnoticed, the answer is `Recall`.
>  - If the scenario treats both mistakes as serious, or mentions that one of the two answers is rare in the data (an **imbalanced dataset**), the answer is `F1`.

### Regression Metrics

Regression models predict a number on a sliding scale (a price, a temperature, tomorrow's demand) rather than sorting things into buckets. There is no right-or-wrong answer to tally up, so these metrics measure how far the predicted numbers landed from the true ones. The gap between a single prediction and its true value is called the **error**.

In the formulas below, `actual` is the true value, `predicted` is the number the model produced, `n` is how many predictions were made, and `Σ` means "add this up across every prediction".

| Metric | Formula | What it measures | Use it when | Usage Example |
| ------ | ------- | ---------------- | ----------- | ------------- |
| `Mean Squared Error (MSE)` | `Σ(actual - predicted)² / n`<br /><br />For each prediction, take the gap between it and the true value, multiply that gap by itself (square it), then average those squared numbers across every prediction. | The average size of the model's errors, with large errors counting for much more than small ones. Squaring does two things. It turns every gap into a positive number, so predictions that were too high cannot cancel out predictions that were too low. It also makes large gaps count for much more than small ones: a gap of 10 contributes 100 to the total while a gap of 2 contributes only 4.<br /><br /> **A Lower MSE is better.** | One large miss does more damage than a handful of small ones | Forecasting how much electricity a data center will draw. Being off by a small amount is absorbed by the spare capacity built into the system, but one badly wrong forecast can overload a circuit. |
| `Root Mean Squared Error (RMSE)` | `√( Σ(actual - predicted)² / n )`<br /><br />Calculate the MSE, then take its square root. | The typical size of the model's error, expressed in the same units as the thing being predicted. Squaring the gaps also squares the units they were measured in, so an MSE calculated on house prices in dollars comes out in "dollars squared", which means nothing to anyone. The square root converts the score back into the original units. A square root never changes which number is larger, so RMSE ranks models in exactly the same order MSE does, the only thing that changes is that the number is now readable. **A Lower RMSE is better.** | **You need to judge the error against a real-world limit**, which is only possible when the error is expressed in the same units as the thing being predicted. This is the usual default for reporting regression error. | A delivery time estimate where customers are promised their order within a 10-minute window. An RMSE of 6 minutes can be held straight up against that 10-minute promise and judged good enough. The same model's MSE would be 36 "minutes squared", a number that cannot be compared to a 10-minute window at all. |
| `Mean Absolute Error (MAE)` | `Σ\|actual - predicted\| / n`<br /><br />Sum the absolute value for the difference (gap) between the actual and predicted values, then average those gaps. | The average size of the model's errors, with every error counting in direct proportion to how big it was. Because nothing is squared here, a gap of 10 counts five times as much as a gap of 2, not twenty-five times as much. **Lower is better.** | **A few unusual data points sit far away from the rest** (these are called **outliers**) and you do not want them to dominate the score. Also fits when every unit of error costs the same in practice. | Forecasting daily ride-share demand. One freak New Year's Eve spike produces an enormous gap, and under MSE that single squared gap would be so large it dominates the whole score — meaning the model could improve its score more by fixing that one night than by predicting the other 364 days well. MAE counts each day's gap at its actual size, so ordinary days still determine the result. |
| `R Squared (R²)` | `1 - ( Σ(actual - predicted)² / Σ(actual - average)² )`<br /><br />Divide the model's total squared error by the total squared error of a baseline that always guesses the average value, then subtract the result from 1. | How much of the variation in the thing being predicted the model manages to explain, on a scale of `0` to `1`. Real-world values move around: houses do not all cost the same, and sales rise and fall week to week. R² asks how much of that movement the model's inputs actually account for. An R² of `0.80` means the model explains 80% of why the values differ, and the remaining 20% is down to something the model does not know about. **Higher is better.** | **You want to know whether the model has explained anything about what drives the outcome**, rather than how large its errors are. Be careful with an R² close to `1` measured on the training data, because it often means the model memorized that specific data instead of learning a general pattern (**overfitting**). | Checking whether square footage and location really explain house prices. An R² of `0.15` says those two inputs account for only 15% of why prices differ from one another, so the model needs better inputs rather than more tuning. An error score like RMSE would tell you the predictions are off, but not that the inputs themselves are the problem. |

### Generative AI Metrics

There is no single correct way to write a summary or a translation, so there is no one right answer to check the model against. Instead, a person writes a good answer for the same task, called the `Reference`, and the model's output is scored on how closely it resembles that reference. Three of the four metrics below work this way, and several of them do their comparison by counting matching [N-Grams](#n-gram-example).

| Metric | What it measures | Primary use |
| ------ | ---------------- | ----------- |
| `Recall-Oriented Understudy for Gisting Evaluation (ROUGE)` | How much of the human-written reference text shows up in the model's output. It counts the individual words and the N-Grams that appear in both texts. ROUGE asks about **coverage**, which is what makes it *recall-oriented*: a summary that leaves out half of the points the reference made scores poorly even if every word it did write was accurate. | **Summarization**, and machine translation. |
| `Bilingual Evaluation Understudy (BLEU)` | How much of the model's output shows up in the reference text, which is the reverse of the question ROUGE asks. Checking the output against the reference rather than the other way around makes BLEU *precision-oriented*: it asks whether the words the model produced were words it should have produced, not whether it covered everything. Left at that, a model could score well by producing only the two or three words it was most sure about, so BLEU adds a **brevity penalty** that lowers the score when the output is much shorter than the reference. | **Machine translation.** |
| `BERTScore` | How close the **meaning** of the output is to the meaning of the reference, rather than how many words they share. Both texts are converted into embeddings, which are long lists of numbers representing meaning, built so that two texts that mean the same thing produce similar lists. The two lists are then compared using cosine similarity, a measurement of how closely they point in the same direction. Since matching words are never required, an output of "the film was outstanding" scores well against a reference of "the movie was excellent". | Text where **paraphrasing or synonyms** are acceptable. A correct answer that happens to be worded differently scores well here and badly under ROUGE or BLEU. |
| `Perplexity` | How surprised the model is by the text it is reading. At every word, the model predicts what should come next, and perplexity measures how far off those predictions were across the whole passage. A low perplexity means the text was close to what the model expected, which is taken as a sign that the model has a solid grasp of the language. This is the one metric here that needs no reference text at all, because it compares the model against its own predictions. | Judging how fluent a language model is in general. **Lower is better.** |

`ROUGE` has two variants worth knowing:
 - `ROUGE-N`: counts the [N-Grams](#n-gram-example) that appear in both the output and the reference. Because it looks for runs of words that match exactly, it captures both whether the output picked up the reference's key ideas and whether it phrased them naturally.
 - `ROUGE-L`: finds the longest run of words that appears in both texts in the same order, allowing other words in between. Scoring the order of the words rather than the raw count of matches means a high `ROUGE-L` indicates the output told the story in the same sequence the reference did, which is a reasonable stand-in for whether the output is coherent.

> [!NOTE]
> **The distinguishing question is whether the metric compares words or meaning.** `ROUGE` and `BLEU` count matching words, so they mark down a correct answer that happens to be worded differently. `BERTScore` compares meaning, so it is the answer whenever the scenario mentions paraphrasing, synonyms, or "different wording, same meaning."

### Approaches to Evaluating a Foundation Model

Metrics are only part of the picture. There are three ways to evaluate a `Foundation Model (FM)`, and in practice they are usually combined.

 - `Human Evaluation`: People read the model's output and judge it on the qualities a formula cannot check, such as whether the response holds together as a piece of writing (coherence), whether it actually answers what was asked (relevance), whether the facts in it are correct, and whether it suits the situation it was written for. This is the most trustworthy method, which is why it is called the **gold standard**, but it is slow and expensive because it needs people to do the reading.
 - `Benchmark Datasets`: Ready-made collections of questions paired with correct answers, built specifically for testing models. Because every model is asked the same questions, benchmarks make it possible to compare one model against another on accuracy, on speed, and on how well it holds up as the workload grows. The following are common Benchmark Datasets;
    - `GLUE` (General Language Understanding Evaluation): a set of general language-understanding tasks, including sorting text into categories, answering questions, and deciding whether one sentence logically follows from another.
    - `SuperGLUE`: a harder version of GLUE. Its tasks require the model to combine several pieces of information to reach an answer rather than reacting to a single sentence.
    - `SQuAD` (Stanford Question Answering Dataset): tests how well a model answers questions about a passage of text it has been given.
    - `WMT` (Workshop on Machine Translation): tests translation between languages.
 - `Automated Metrics`: The scores described above (`ROUGE`, `BLEU`, `BERTScore`) calculated against reference answers by software. No person is involved at the moment of scoring, which is what makes this the cheap option that can be run repeatedly.

A benchmark evaluation runs in three steps.
 1. Subject matter experts write a set of difficult questions along with the answers they consider correct.
 2. Those questions are fed to the model being tested.
 3. A separate model, called a **judge model**, compares the answers the model gave against the answers the experts wrote. The closer the model's answers are to the experts' answers, the better it scores.

> [!NOTE]
> **Amazon Bedrock Model Evaluation** is the AWS service for this. It offers *automatic* evaluation against built-in or custom datasets using metrics like the ones above, and *human* evaluation using either your own work team or an AWS-managed team.

## AWS Foundational Models

Amazon builds its own family of foundation models and offers them through `Bedrock` alongside models from other providers such as Anthropic, Meta, Mistral, and Stability AI. The Amazon-built models come in two families: **Nova**, the current generation, and **Titan**, the earlier generation that is still widely used for embeddings.

Two terms are needed to read the table:
 - `Multimodal`: the model accepts more than one kind of input. A multimodal model can be given text, images, and video together, rather than text alone.
 - `Embedding`: a long list of numbers representing the meaning of a piece of content, built so that two things with similar meaning produce similar lists. Embeddings are what make semantic search and `RAG` possible, because finding relevant material becomes a matter of finding the closest lists of numbers.

| Model | What it is | Multimodal Support | Capabilities | Common Use Cases |
| ----- | ---------- | ------------------ | ------------ | ---------------- |
| `Nova Micro` | The smallest and fastest Nova model. | **No**<br />In: text<br />Out: text | <ul><li>Text generation</li><li>Summarization</li><li>Classification</li><li>Lowest latency and cost of the family</li></ul> | <ul><li>High-volume, simple text tasks</li><li>Chat responses where speed matters most</li><li>Routing or classifying incoming requests</li></ul> |
| `Nova Lite` | A low-cost multimodal model that reads several kinds of input and answers in text. | **Yes**<br />In: text, image, video<br />Out: text | <ul><li>Everything Micro does</li><li>Image and video understanding</li><li>Fast responses at low cost</li></ul> | <ul><li>Processing documents that mix text and images</li><li>Describing or summarizing video content</li><li>Interactive applications on a budget</li></ul> |
| `Nova Pro` | The general-purpose multimodal model, more capable than Lite at correspondingly higher cost. | **Yes**<br />In: text, image, video<br />Out: text | <ul><li>Stronger reasoning and instruction following</li><li>Image and video understanding</li><li>Handles longer, more involved tasks</li></ul> | <ul><li>Document and video analysis</li><li>Agents and workflows that call tools</li><li>Tasks where accuracy matters more than cost</li></ul> |
| `Nova Premier` | The most capable model in the Nova family, built for the hardest tasks. | **Yes**<br />In: text, image, video<br />Out: text | <ul><li>Complex, multi-step reasoning</li><li>Acts as a teacher model for distillation, meaning its answers can be used to train a smaller, cheaper model</li></ul> | <ul><li>Difficult reasoning and planning problems</li><li>Producing training data for smaller models</li></ul> |
| `Nova Canvas` | An image generation model. | **Yes**<br />In: text, image<br />Out: image | <ul><li>Generates images from a text description</li><li>Edits existing images (inpainting, background removal)</li><li>Built-in watermarking and content filters</li></ul> | <ul><li>Marketing and product imagery</li><li>Design concepts and mockups</li></ul> |
| `Nova Reel` | A video generation model. | **Yes**<br />In: text, image<br />Out: video | <ul><li>Generates short video clips from a text description or a starting image</li><li>Camera motion control</li></ul> | <ul><li>Short promotional clips</li><li>Animated product or concept previews</li></ul> |
| `Nova Sonic` | A speech-to-speech model that handles listening and speaking in one model. | **Yes**<br />In: speech, text<br />Out: speech, text | <ul><li>Understands spoken input and replies in speech</li><li>Preserves tone and conversational timing</li></ul> | <ul><li>Voice assistants</li><li>Natural-sounding phone and support agents</li></ul> |
| `Titan Text Embeddings` | Converts text into embeddings. It generates no text of its own. | **No**<br />In: text<br />Out: embedding | <ul><li>Turns passages of text into vectors</li><li>Supports semantic search, where results are matched on meaning rather than keywords</li></ul> | <ul><li>`RAG`, retrieving relevant documents to feed a model as context</li><li>Search over a company's own documents</li><li>Clustering or deduplicating text</li></ul> |
| `Titan Multimodal Embeddings` | Converts text **and** images into embeddings that share one number space, so text can be matched against images. | **Yes**<br />In: text, image<br />Out: embedding | <ul><li>Places images and text into the same space for comparison</li></ul> | <ul><li>Searching an image library with a text description</li><li>"More like this" visual recommendations</li></ul> |
| `Titan Text` | The earlier generation of Amazon text models, available in Lite and Express sizes. | **No**<br />In: text<br />Out: text | <ul><li>Text generation</li><li>Summarization</li><li>Question answering</li></ul> | <ul><li>General text tasks, though Nova is the current recommendation for new work</li></ul> |
| `Titan Image Generator` | The earlier generation image model. | **Yes**<br />In: text, image<br />Out: image | <ul><li>Generates and edits images from text</li><li>Invisible watermarking</li></ul> | <ul><li>Image creation, now largely superseded by Nova Canvas</li></ul> |

> [!NOTE]
> **Know the split between generation models and embedding models.** A generation model produces new content for a person to read or look at. An embedding model produces numbers for a computer to compare, and is the piece that makes search and `RAG` work. Exam questions describing a search-over-your-own-documents scenario are pointing at an embeddings model, not a text generation model.

## AWS Fully-Managed Agentic Services

These services are pre-trained and fully managed, meaning AWS has already built and trained the model and exposes it through an API. There is no training data to gather, no model to tune, and no infrastructure to run. This makes them the fastest route to adding AI to an application, at the cost of being fixed to what AWS built them to do.

| Service | What it does | Capabilities | Common Use Cases |
| ------- | ------------ | ------------ | ---------------- |
| `Comprehend` | Reads text and pulls meaning out of it. | <ul><li>Sentiment analysis (positive, negative, neutral)</li><li>Entity extraction (names, places, dates)</li><li>Key phrase and language detection</li><li>Topic modeling across a document set</li><li>Detecting personally identifiable information</li></ul> | <ul><li>Scoring customer reviews and support tickets</li><li>Tagging and routing incoming documents</li><li>Finding sensitive data before storing text</li></ul> |
| `Translate` | Translates text between languages. | <ul><li>Real-time and batch translation</li><li>Custom terminology so brand and product names translate the way you want</li></ul> | <ul><li>Localizing an application or website</li><li>Translating support conversations live</li></ul> |
| `Textract` | Extracts text and structure out of scanned documents. | <ul><li>Reads printed and handwritten text</li><li>Preserves tables and form field pairs rather than returning a flat wall of text</li></ul> | <ul><li>Processing invoices, receipts, and claims</li><li>Digitizing paper records and loan applications</li></ul> |
| `Rekognition` | Analyzes images and video. | <ul><li>Object, scene, and activity detection</li><li>Facial detection, comparison, and analysis</li><li>Text extraction from images</li><li>Unsafe content moderation</li></ul> | <ul><li>Moderating user-uploaded photos</li><li>Tagging a media library automatically</li><li>Identity verification against a reference photo</li></ul> |
| `Polly` | Turns text into speech. | <ul><li>Lifelike speech in many languages and voices</li><li>Control over pronunciation, emphasis, and speed</li></ul> | <ul><li>Voice responses in an application</li><li>Audio versions of articles</li><li>Accessibility features for reading content aloud</li></ul> |
| `Transcribe` | Turns speech into text. | <ul><li>Real-time and batch transcription</li><li>Speaker identification</li><li>Custom vocabulary for industry terms</li><li>Automatic redaction of sensitive information</li></ul> | <ul><li>Call center recordings and analytics</li><li>Meeting notes and subtitles</li><li>Medical dictation (via Transcribe Medical)</li></ul> |
| `Lex` | Builds conversational chatbots, using the same technology behind Alexa. | <ul><li>Understands what a user is asking for (intent) and pulls the details out of the request (slots)</li><li>Handles both text and voice</li><li>Manages the back-and-forth of a conversation</li></ul> | <ul><li>Customer service bots</li><li>Automated phone systems</li><li>Booking and order-status assistants</li></ul> |
| `Kendra` | Intelligent search across a company's own content. | <ul><li>Search by meaning rather than keyword matching</li><li>Returns a direct answer, not just a list of links</li><li>Connectors to SharePoint, S3, Salesforce, and similar sources</li></ul> | <ul><li>Internal knowledge base and help desk search</li><li>Letting employees ask questions of company documentation</li></ul> |
| `Personalize` | Generates recommendations, built on the same technology Amazon.com uses. | <ul><li>Real-time personalized recommendations</li><li>Similar-item suggestions</li><li>Personalized ranking of a list</li></ul> | <ul><li>"Recommended for you" product sections</li><li>Content and media suggestions</li><li>Personalized marketing email</li></ul> |
| `Fraud Detector` | Identifies likely fraudulent activity in online transactions. | <ul><li>Scores events for fraud risk</li><li>Trained on your historical fraud data plus Amazon's own experience</li></ul> | <ul><li>Detecting fraudulent payments</li><li>Catching fake account signups</li></ul> |
| `Amazon Q` | A generative AI assistant for business users, grounded in a company's own data. | <ul><li>Answers questions from connected company sources</li><li>Summarizes documents and drafts content</li></ul> | <ul><li>Employee self-service questions</li><li>Summarizing internal reports</li></ul> |
| `Amazon Q Developer` | A generative AI assistant for software development. Being retired in favor of `Kiro` (see the note below). | <ul><li>Code generation and completion</li><li>Explains and refactors existing code</li><li>Security scanning and AWS troubleshooting</li></ul> | <ul><li>Writing and reviewing code</li><li>Diagnosing problems in AWS resources</li></ul> |
| `Kiro` | The replacement for Amazon Q Developer. An agentic development environment (IDE and CLI) built around spec-driven development, where a written specification is agreed on before any code is generated. | <ul><li>Specs, which capture intent before code is written</li><li>Hooks that run automatically on project events</li><li>Steering files that set project-wide rules</li><li>Custom subagents</li></ul> | <ul><li>Building features from a written specification</li><li>Multi-step coding work rather than line-by-line autocomplete</li></ul> |
| `DeepRacer` | A learning tool rather than a production service: a scale model race car trained with reinforcement learning. | <ul><li>Hands-on reinforcement learning in a simulator</li><li>Competitive racing leagues</li></ul> | <ul><li>Teaching reinforcement learning concepts</li></ul> |

> [!NOTE]
> **These services sit at the top of a three-layer stack, and exam questions are usually really asking which layer you need.**
>
>  - **AI Services** (this table): pre-trained and ready to call. Choose these when the task is a standard one and you want no ML work at all.
>  - **Bedrock**: access to foundation models through an API, with customization through prompting, `RAG`, and fine-tuning. Choose it for generative AI work.
>  - **SageMaker AI**: build, train, and deploy your own models. Choose it only when the task genuinely requires a custom model.
>
> The giveaway phrase is usually about effort and expertise. "No machine learning experience required" or "fastest to implement" points to an AI Service, while "we need a model trained on our own data" points down the stack.

> [!WARNING]
> **Amazon Q Developer is being retired, but it is still what the exam tests.** AWS announced an end-of-support timeline in May 2026: new signups closed on **May 15, 2026**, and the IDE plugins and paid subscriptions reach end of support on **April 30, 2027**. AWS points users to `Kiro` instead.
>
> Two things this does not cover: Amazon Q Developer inside the AWS Management Console is unaffected and continues, and `Amazon Q Business` is a separate product that is not part of this retirement.
>
> Exam content lags product changes by a long way, so answer questions about AI-assisted coding with **Amazon Q Developer** until the exam guide says otherwise. `Kiro` is here so the notes match reality, not because the exam asks about it.

## Bedrock

`Amazon Bedrock` is a fully managed service that gives you access to foundation models through a single API. It offers Amazon's own models (the Nova and Titan families covered under [AWS Foundational Models](#aws-foundational-models)) alongside models from other companies such as Anthropic, Meta, Mistral, AI21 Labs, Cohere, and Stability AI.

Two words in that description carry most of the meaning:

 - `Fully managed` means AWS runs the model for you. You never choose a server, install anything, or keep a machine running.
 - `Serverless` means there is nothing to start up or shut down and nothing sitting idle between requests. You send a request, you get an answer, and you pay for what you used.

The problem Bedrock solves is that using a foundation model normally means picking one provider, signing up with them, learning their API, and rewriting your application if you later want to switch. Bedrock puts one API in front of many models, so swapping one model for another is a change of model name rather than a rewrite. It also keeps the whole exchange inside your AWS account, which matters when the data in your prompts is confidential.

**What Bedrock is for:** building generative AI applications on top of an existing model. Chat assistants, summarization, content generation, question answering over company documents, and agents that carry out multi-step tasks.

**What Bedrock is not for:** training a model from scratch, or building a traditional machine learning model such as a fraud classifier or a demand forecast. Those belong to `SageMaker AI`, covered at the end of this section.

### Model Access and Inference

The core of Bedrock is a single API call: you send a prompt to a named model and it sends back a response. This act of sending input to a trained model and getting a prediction back is [Inferencing](#terminology).

Bedrock offers two ways to pay for that:

 - `On-Demand`: you pay per token processed, counting both the tokens you send and the tokens the model generates. Nothing is reserved in advance, and you pay nothing when you are not making requests. This is the normal choice for development and for workloads whose volume moves around.
 - `Provisioned Throughput`: you reserve a fixed amount of model capacity for a committed period and pay for that period whether you use it or not. In exchange you get guaranteed, predictable performance rather than sharing capacity with everyone else. This is the choice for production workloads with steady, high volume, and it is **required** to run a model you have customized through fine-tuning.

> [!NOTE]
> **Watch for the phrase "unpredictable" or "variable" traffic in an exam question.** It points to `On-Demand`. Phrases about guaranteed capacity, consistent performance, or high steady volume point to `Provisioned Throughput`.

### Playgrounds

The `Playground` is a console screen where you type a prompt, choose a model, and see the response, without writing any code. You can change the model and re-send the same prompt to compare answers side by side.

Its purpose is model selection. Before committing an application to a particular model, you try your real prompts against several models and see which handles them best, which is far cheaper than discovering the answer after building.

### Model Evaluation

Bedrock can score models for you using the ideas covered in [Evaluation Metrics](#evaluation-metrics). It offers both of the approaches described in [Approaches to Evaluating a Foundation Model](#approaches-to-evaluating-a-foundation-model):

 - `Automatic evaluation`: Bedrock runs a model against either a built-in benchmark dataset or a dataset of your own and scores it on measures such as accuracy, robustness (whether small changes to the input produce wildly different answers), and toxicity (whether it produces harmful content).
 - `Human evaluation`: people read the model's answers and rate them. The reviewers can be your own employees or a team managed by AWS.

This exists because the right model depends on your specific task. Published benchmark results tell you how models compare in general, not how they compare on your work.

> [!IMPORTANT]
> **Distinct from SageMaker.** SageMaker AI also evaluates models, but it evaluates models *you built*, using the [Classification Metrics](#classification-metrics) and [Regression Metrics](#regression-metrics) covered earlier (accuracy, precision, recall, F1, RMSE). Bedrock evaluates *pre-built foundation models* on generative tasks, using generative measures and human review. If the question is "which existing model should I choose", that is Bedrock. If you are asking "is the model I trained good enough", that is SageMaker.

### Knowledge Bases (RAG)

`Retrieval Augmented Generation (RAG)` is a technique for giving a model information it was never trained on, by finding relevant information and adding it into the prompt before the model answers.

It works in four steps:

1. The searchable documents are split into chunks and run through an embeddings model, which converts each chunk into embeddings.
2. Th embeddings are stored in a `vector database`, a storage system built to store embeddings and search by similarity rather than by keyword.
3. When a prompt is received it is converted into embeddings the same way the documents were. The `vector database` then returns the chunks whose embeddings have the closest similar meaning to the original prompt.
4. Those chunks are added to the prompt, and the model answers using them.

`Bedrock Knowledge Bases` performs all four steps for you. You point it at documents in Amazon S3 and it handles the chunking, the embedding, the storage, and the retrieval at question time. The vector database underneath can be 
 - `OpenSearch Serverless`
 - `Aurora PostgreSQL`
 - `RDS PostgreSQL` using the `pgvector` extension
 - A third-party option.

The reason RAG matters so much is that it addresses three problems at once. Supplying the actual source material addresses all three.
 1. A model only knows about the data it was trained on which probably doesn't include your internal documents
 2. The training data has a cutoff date and the model knows nothing after that date
 3. When a model lacks information it tends to invent a confident-sounding answer (a `hallucination`).

> [!IMPORTANT]
> **RAG does not change the model.** The model's weights are untouched; you are only changing what you put in the prompt. This is what makes RAG cheap, immediate, and easy to reverse, and it is why RAG is the correct answer to "how do we give the model access to our company data" far more often than fine-tuning is.

### Fine-Tuning and Customization

Fine-tuning takes a pre-trained foundation model and trains it further on a smaller dataset of your own, which adjusts the model's internal weights. Bedrock supports two forms:
 - `Fine-tuning`: you supply `labeled data`, meaning pairs of prompts and the responses you want. The model learns to respond in that style or format. This is the approach for teaching a model your company's tone of voice, or a specific output structure.
 - `Continued Pre-training`: you supply `unlabeled data`, meaning raw text with no example answers attached. The model absorbs the vocabulary and patterns of a specialized domain such as medicine or law.

The result is a private copy of the model that belongs to you. Your training data is not used to improve the original model and is not shared with the model provider.

> [!WARNING]
> **Fine-tuning is the expensive option, and exam questions often bait you toward it.** It requires a prepared dataset, a training run that costs money, and `Provisioned Throughput` to serve the result. If the scenario is really about giving the model access to facts it does not have, the answer is `Knowledge Bases` and `RAG`. Choose fine-tuning only when the scenario is about changing the model's *behavior*, such as its tone, format, or grasp of specialist vocabulary.

Bedrock also supports `Model Distillation`, where a large, expensive, highly capable model is used to generate training data that teaches a smaller, cheaper model to handle a specific task well. You get something close to the large model's quality on that narrow task at the smaller model's cost.

### Bedrock Agents

A foundation model can only generate content (e.g. text, images, speech etc.) but it cannot look up an order, book an appointment, or update a record. `Bedrock Agents` closes that gap by letting the model use existing APIs, tools and systems.

You give an agent a set of `Action Groups`, each of which describes an API it is allowed to call, plus instructions describing its job. When a user makes a request, the agent works out which steps are needed, calls the appropriate APIs in order, feeds the results back into its own reasoning, and continues until the task is complete.

For example, a request to "cancel my order and refund the payment" requires looking up the order, calling the cancellation API, calling the refund API, and confirming back to the user. The agent plans that sequence itself rather than following a flow you hard-coded.

Agents also connect to `Knowledge Bases`, so a single agent can both look facts up and take actions.

### Guardrails

`Bedrock Guardrails` are safety rules applied to what goes into a model and what comes out of it. They can:
 - Block topics you define as off-limits, such as a banking assistant refusing to give investment advice.
 - Filter harmful content across categories including hate, insults, violence, and sexual content, each with an adjustable strength.
 - Redact or block personally identifiable information (`PII`) such as names, phone numbers, and account numbers, in either the user's input or the model's response.
 - Block specific words and phrases outright, such as competitor names.
 - Check responses against source material to catch hallucinations (`contextual grounding`).

Two properties make Guardrails worth understanding:

 - A guardrail is configured **independently of the model**, so the same guardrail works across any model on Bedrock. Switching models does not mean rebuilding your safety rules.
 - You can define **multiple guardrails** with different settings and apply different ones to different applications. A children's education app and an internal engineering assistant can have very different limits while sharing the same underlying model.

> [!NOTE]
> Guardrails are the standard exam answer for any scenario about blocking harmful content, enforcing topic limits, or protecting personal information in a generative AI application.

### Security and Privacy

Everything you send to Bedrock stays within your AWS account. Prompts and responses are not used to train the underlying models and are not shared with the model providers. Traffic can be kept off the public internet using `AWS PrivateLink`, data is encrypted using `AWS KMS`, and access is controlled with normal `IAM` permissions.

This is a large part of why organizations use Bedrock rather than calling a model provider's public API directly.

## Sagemaker AI

`Amazon SageMaker AI` is AWS's platform for building machine learning models of your own. Where the AI Services give you a finished model to call and Bedrock gives you a foundation model somebody else trained, SageMaker AI is where you start with your own data and produce a model that did not exist before.

It covers every stage of the work: preparing data, labeling it, training the model, testing different settings, deploying the finished model so applications can use it, and watching it afterwards to catch it going stale. Each of those stages has its own feature, which is why the service looks so large.

The sequence of stages is called the **machine learning lifecycle**, and the whole section below follows it:

`Data Preparation` → `Model Building & Training` → `Evaluation & Tuning` → `Deployment` → `Monitoring & Governance`

**What SageMaker AI is for** any model that has to be built rather than borrowed. Fraud detection trained on your transaction history, demand forecasting for your specific products, predicting which customers are about to cancel, medical image classification, or a recommendation model tuned to your catalog.

**What SageMaker AI is not for:** tasks an existing service already performs. Transcribing audio, translating text, or generating a summary are already solved by the AI Services and Bedrock, and rebuilding them in SageMaker would be slower, more expensive, and worse.

> [!NOTE]
> **Two names that cause confusion.** AWS renamed the service from "Amazon SageMaker" to "Amazon SageMaker AI" when it introduced a broader data and analytics platform called "Amazon SageMaker". Older material, including most exam preparation, uses the older name. Treat `SageMaker` and `SageMaker AI` as the same machine learning service.

The next few sections follow the ML Lifecycle and introduce the AWS Services and SageMaker features built for that stage of the lifecycle.

### 0. The Working Environment

**TOOD Add a brief description about why The Working Environment is step 0.**

#### SageMaker Studio

`SageMaker Studio` is the single web interface where all of the features below are used. It is the workbench: you write code, run experiments, inspect data, launch training, and manage deployments from one browser window rather than from a dozen separate consoles.

### 1. Data Preparation

Models are built from data, and data almost never arrives ready to use. It has missing values, inconsistent formats, and columns that mean nothing to an algorithm in their raw state. This stage is usually the largest part of a machine learning project. SageMaker provides a separate feature for each job this stage involves: cleaning and reshaping raw data ([Data Wrangler](#sagemaker-data-wrangler)), storing and reusing the [Features](#terminology) you build from it ([Feature Store](#sagemaker-feature-store)), attaching labels to unlabeled data ([Ground Truth](#sagemaker-ground-truth)), and running any of this at a scale too large for one machine ([Processing](#sagemaker-processing)).

#### SageMaker Data Wrangler

`Data Wrangler` is a visual tool for preparing data without writing much code. You connect it to a data source, inspect what is there, and apply transformations by choosing them from a menu: filling in missing values, converting text categories into numbers, removing duplicates, and combining columns into new `features`.

It also helps with **imbalanced data**, the situation described back in [Classification Metrics](#classification-metrics) under `Accuracy`, where one answer appears far more often than the other. Data Wrangler can balance a dataset by removing examples of the common answer (undersampling) or by generating additional examples of the rare one (oversampling), which stops the model from simply learning to always guess the common answer.

#### SageMaker Feature Store

A `feature` that took real effort to build, such as "average order value over the last 90 days", is usually useful to more than one model. `Feature Store` is a central library for storing, sharing, and reusing those features across teams and models.

Its more important job is preventing a specific and expensive bug. A model must be given features calculated the same way during training and during live predictions. If the training pipeline and the live application each calculate "average order value" slightly differently, the model receives one thing in testing and another in production, and its accuracy quietly collapses. Feature Store serves both from the same definition so they cannot diverge.

#### SageMaker Ground Truth

[Supervised Learning](#machine-learning-algorithms) requires labeled data, and labels have to come from somewhere. `Ground Truth` is the service for producing them. It manages the workflow of having people label raw data: drawing boxes around objects in images, marking which words in a document are product names, or rating which of two model responses is better.

The labeling workforce can be your own employees, a vendor company, or Amazon Mechanical Turk. Ground Truth can also label the easy cases automatically with a model and route only the uncertain ones to people, which lowers the cost.

> [!NOTE]
> Ground Truth is also how the human preference data behind `RLHF` gets collected, which connects back to the note under [Machine Learning Algorithms](#machine-learning-algorithms).

#### SageMaker Processing

`Processing` runs data preparation code on AWS compute rather than on your own machine. You supply a script, SageMaker starts the machines, runs the script over your data, writes the results to storage, and shuts the machines down. It is used for transforming large datasets, engineering features at scale, and running evaluation code after training.

### 2. Model Building and Training

#### Where Models Come From

SageMaker AI gives you three starting points, in increasing order of effort:

1. **Pre-trained models** from [JumpStart](#sagemaker-jumpstart), which are ready to deploy or to fine-tune. Fastest.
2. **Built-in algorithms** provided by SageMaker, where you supply data and it supplies a proven, optimized implementation of a common algorithm. No algorithm code to write.
3. **Your own model**, written using a deep learning framework such as `PyTorch`, `TensorFlow`, or `MXNet`. Most effort, most control, and necessary only when nothing above fits.

The recommended order is to work down that list rather than starting at the bottom.

#### SageMaker JumpStart

`JumpStart` is a catalog of pre-trained models and ready-made solutions for common problems, deployable in a few clicks. The catalog includes open-source models and foundation models.

> [!IMPORTANT]
> **JumpStart overlaps with Bedrock and the exam uses that overlap.** Both offer pre-trained foundation models. The difference is what happens underneath. JumpStart deploys the model onto **compute instances that you choose, control, and pay for by the hour**, which keeps running until you shut it down. Bedrock is serverless with **no infrastructure at all** and charges per token processed.
>
> A question emphasizing control, customization, or a specific open-source model points to JumpStart. A question emphasizing "no infrastructure to manage", speed, or paying only for what you use points to Bedrock.

#### Training Jobs

A `Training Job` is the act of producing a model. You specify the algorithm, the location of the training data, and the type and number of machines to use. SageMaker starts that compute, runs the training, saves the finished model to storage, and shuts the compute down. You are billed only for the time it ran.

This matters for a cost question: training compute is temporary and stops on its own, while a deployed `Endpoint` keeps running, and billing, until you remove it.

#### SageMaker Experiments

Building a model means trying many versions of it: different data, different algorithms, different settings. Without a system, it becomes impossible to remember which combination produced the best result.

`Experiments` records every training run automatically, along with the inputs used and the scores achieved, and lets you compare runs side by side. This gives you `reproducibility`, meaning the ability to return to a previous result and recreate it exactly.

#### SageMaker Automatic Model Tuning

[Hyperparameters](#terminology) are the settings chosen before training starts, and their values noticeably affect how good the resulting model is. Finding good values by hand means running training repeatedly and comparing results, which is slow.

`Automatic Model Tuning`, also called **hyperparameter tuning**, does this search for you. You give it the range to search within and the metric to optimize for, and it runs multiple training jobs with different combinations, using the results of earlier runs to choose smarter values for later ones. It returns the best combination it found.

#### SageMaker Autopilot

`Autopilot` automates the entire model-building process. You point it at a tabular dataset, tell it which column you want to predict, and it explores the data, engineers features, tries multiple algorithms, tunes their hyperparameters, and produces a ranked list of trained models.

Its distinguishing feature is that it is **not a black box**: it generates the notebooks containing the code it used, so a data scientist can inspect exactly what it did and take over from there.

#### SageMaker Canvas

`Canvas` is a no-code tool aimed at business analysts rather than data scientists. Through a visual interface, you import data, pick the column to predict, and generate predictions without writing a line of code or knowing which algorithm was used.

The distinction between the two automation tools is who they are for. **Autopilot** automates the work for people who could do it themselves and want the code. **Canvas** hides the work entirely from people who could not.

### 3. Evaluation and Tuning

Evaluation uses the metrics covered in [Evaluation Metrics](#evaluation-metrics): accuracy, precision, recall, F1, and AUC-ROC from [Classification Metrics](#classification-metrics), and MSE, RMSE, MAE, and R² from [Regression Metrics](#regression-metrics). SageMaker calculates these automatically after training and displays them in `Experiments`, where they can be compared across runs.

The purpose of this stage is deciding whether the model is good enough for its business goal. If it is not, the lifecycle loops back to feature engineering or training rather than moving forward to deployment.

### 4. Deployment

Training produces a model file, which on its own does nothing. Deployment puts that model somewhere applications can send data and receive predictions. SageMaker offers four ways to do this, and choosing between them is a common exam question.

| Option | How it works | Use it when | Usage Example |
| ------ | ------------ | ----------- | ------------- |
| `Real-Time` | The model runs on dedicated compute behind a permanent `Endpoint` that is always available. | **You need an answer in milliseconds, continuously.** The compute runs, and bills, around the clock. | A fraud check that has to complete while the customer is still waiting at the payment screen. |
| `Serverless` | The model runs only when a request arrives. No compute sits idle between requests. | **Traffic is occasional or unpredictable**, and you do not want to pay for idle time. Accept that a request arriving after a quiet period waits longer while capacity starts up (a **cold start**). | An internal tool used a few times a day by the finance team. |
| `Batch Transform` | The model runs over a whole stored dataset at once, writes the results to storage, and shuts down. There is no endpoint. | **You have a large pile of data and nobody is waiting on an individual answer.** This is [Batch Inferencing](#terminology). | Scoring every customer in the database overnight for likelihood to cancel. |
| `Asynchronous` | Requests are placed in a queue and processed as capacity allows, with the result delivered when ready. | **Each request is large or slow to process**, but you still want results reasonably soon. Handles payloads too big for a real-time endpoint. | Analyzing a long video file, where processing takes several minutes per request. |

> [!IMPORTANT]
> **The deciding factors are how quickly the answer is needed and how steady the traffic is.** "While the customer waits" means Real-Time. "Overnight" or "all the records at once" means Batch Transform. "Unpredictable traffic" or "idle much of the time" means Serverless. "Large files" or "long processing time" means Asynchronous.

SageMaker also supports **auto scaling**, which adds and removes compute behind a real-time endpoint as traffic rises and falls, and hosting **multiple models behind a single endpoint** to save cost when you have many small models.

### 5. Monitoring and Governance

A deployed model is not finished. The world it was trained on keeps changing, and someone has to be able to answer what the model is, who approved it, and whether it is still working.

#### SageMaker Model Monitor

`Model Monitor` watches models running in production and raises an alert when their behavior degrades. This is the defense against [Drift](#terminology), where live data gradually stops resembling the training data and accuracy falls without any code having changed.

It can monitor on a schedule or continuously, and it watches for changes in the incoming data, drops in prediction quality, and the appearance of `bias` in predictions.

#### SageMaker Clarify

`Clarify` addresses two questions that regulators, auditors, and customers ask about models.

 - **Bias detection.** Here `bias` means unfair treatment of a group of people, not the statistical sense of the word. Clarify inspects both the training data and the model's predictions to detect whether one group is being treated systematically differently from another, which can happen even when nobody intended it, because the model learned the pattern from historical data.
 - **Explainability.** Complex models do not show their reasoning, which is a problem when a person has been denied a loan and is entitled to know why. Clarify produces **feature importance** scores showing which inputs contributed most to a given prediction, turning an opaque answer into an explainable one.

#### SageMaker Model Registry

`Model Registry` is a catalog of trained models and their versions. Each model is recorded along with which version it is, what data and settings produced it, and its approval status.

The approval status is the useful part: a model can be marked pending, approved, or rejected, and deployment pipelines can be set to deploy only approved versions. This stops an untested model from reaching production.

#### SageMaker Model Cards

A `Model Card` is a documentation record that travels with a model, capturing its intended use, its risk rating, how it was trained, its evaluation results, and any observations or caveats. It is the artifact you hand to an auditor asking what a model is for and what its limitations are.

#### SageMaker Model Dashboard

The `Model Dashboard` is a single screen showing every model in your account and how each is behaving in production, including which ones have monitoring configured and which have raised alerts. It answers "what is currently deployed and is any of it in trouble" without visiting each model individually.

#### SageMaker Role Manager

`Role Manager` helps administrators grant people the minimum permissions their job requires, which is the security principle of **least privilege**: give each person exactly the access they need to do their work and nothing beyond it.

It does not replace `AWS Identity and Access Management (IAM)`, the service that controls who can do what across all of AWS. Role Manager is a guided builder that **produces ordinary IAM roles**, and understanding that relationship is the point of this feature.

 - An `IAM Role` is a named bundle of permissions that a person or a service can take on. Attached to the role are `IAM Policies`, documents listing which actions are allowed against which resources.
 - Writing those policies by hand for machine learning work is difficult, because a single task touches many services at once. A data scientist training a model needs permissions across SageMaker, S3 for the data, CloudWatch for the logs, and `KMS` for encryption keys. Miss one and the job fails; grant too much and you have handed out more access than intended.
 - Role Manager solves this with **persona-based templates**. You choose a persona describing the job, such as data scientist or MLOps engineer, answer a few questions about what that person needs to do, and it generates an IAM role with policies scoped to those activities.

The output is a normal IAM role. It appears in the IAM console, it can be edited there afterwards, and it is assigned to users through IAM exactly like any other role. Role Manager only removes the difficulty of authoring the policy in the first place.

#### SageMaker Pipelines

`Pipelines` connects the stages above into one automated, repeatable workflow: prepare the data, train, evaluate, register the model, deploy if approved. Running the pipeline runs every step in order without manual intervention.

This is the practical implementation of `MLOps`. The benefits it provides are the standard ones: productivity, reliability, repeatability, auditability, and consistent data and model quality. Its principles are version control over data, code, and models; automation of the lifecycle stages; continuous integration and delivery extended with **continuous training** (automatically retraining models as new data arrives) and **continuous monitoring**; and model governance.

## Bedrock vs. SageMaker AI

Both services run machine learning models on AWS, and both appear as answer options for the same questions, so the distinction matters.

`SageMaker AI` is the full machine learning platform. It is where you prepare data, train a model from scratch or from a starting point, tune it, deploy it, and monitor it. It assumes you have data scientists, and it gives you control over every step.

`Amazon Bedrock` is a way to consume foundation models that already exist. There is no training loop, no infrastructure, and no data science team required.

| | `Amazon Bedrock` | `SageMaker AI` |
| --- | --- | --- |
| **What you start with** | A foundation model somebody else trained | Your own data |
| **Main activity** | Prompting, RAG, and light customization | Building, training, and deploying models |
| **Model types** | Generative foundation models only | Any model: classification, regression, forecasting, deep learning, generative |
| **Infrastructure** | None; fully managed and serverless | You choose and manage instance types, though some options automate this |
| **Skill required** | Developer skills; no ML background needed | Data science and ML engineering |
| **Customization** | Prompt engineering, RAG, fine-tuning, distillation | Complete control, including training from scratch |
| **Pricing** | Per token, or reserved capacity | Per hour of compute used for training and hosting |
| **Time to first result** | Minutes | Days to weeks |

**Choose Bedrock when** the task is generative (writing, summarizing, answering, conversing), an existing model can already do it, and you want to ship quickly without managing infrastructure.

**Choose SageMaker AI when** you need a traditional machine learning model such as fraud detection, demand forecasting, or churn prediction, when your problem is specific enough that no existing model fits, or when you need control over training and deployment.

> [!IMPORTANT]
> **Where the two overlap, and how to tell them apart.** Several capabilities appear in both services under similar names, which is exactly what exam questions exploit.
>
>  - **Model evaluation.** Bedrock evaluates *existing foundation models* so you can choose between them. SageMaker evaluates *the model you trained* using the [Classification Metrics](#classification-metrics) and [Regression Metrics](#regression-metrics) covered earlier.
>  - **Ready-made models.** `SageMaker JumpStart` also offers pre-trained models, including foundation models. The difference is what you get: JumpStart deploys a model **onto infrastructure you own and pay for by the hour**, giving you deeper control. Bedrock keeps it serverless and charges per token. "No infrastructure to manage" points to Bedrock.
>  - **Fine-tuning.** Both can fine-tune. Bedrock's version is a managed process with few decisions to make. SageMaker's version exposes the full training process, including the settings that control how training runs.
>  - **RAG.** Bedrock Knowledge Bases assembles the whole retrieval pipeline for you. In SageMaker you would build that pipeline yourself from its parts.
>
> The reliable tiebreaker is how much control the scenario asks for. Wanting speed, simplicity, and no servers points to Bedrock. Wanting control over training, infrastructure, or a non-generative model points to SageMaker AI.

## Responsible AI

`Responsible AI` is the set of principles and practices for building AI systems that are transparent and trustworthy, and for limiting the harm they can cause. It applies across the whole life of a model, from design through development, deployment, monitoring, and evaluation, rather than being a review done once before launch.

### The Eight Core Dimensions

AWS defines eight dimensions of Responsible AI. These are the heart of this topic on the exam, and questions usually describe a situation and ask which dimension it concerns.

| Dimension | What it means |
| --------- | ------------- |
| `Fairness` | The system treats all groups of people equitably and does not discriminate against any of them. |
| `Explainability` | The reasoning behind an output can be understood and justified. |
| `Privacy & Security` | People and organizations control whether their data is used, and that data is protected. |
| `Transparency` | The people who build the system disclose how it was developed, what it can do, and where its limits are. |
| `Veracity & Robustness` | The system stays accurate and reliable even when it meets unexpected or unusual input. |
| `Governance` | Defined processes exist to put responsible practices in place and enforce them. |
| `Safety` | The system avoids harmful outcomes and is a net benefit to the people it affects. |
| `Controllability` | The system's behavior can be directed and corrected so it stays aligned with human intent. |

> [!IMPORTANT]
> **Transparency and Explainability sound alike and are tested against each other.** Transparency answers **how** the system was built: what data, what architecture, what known limitations, disclosed up front. Explainability answers **why** a specific output happened: which inputs drove this particular prediction. Transparency is about the system, explainability is about the individual decision.

**Why it matters commercially**, beyond doing the right thing: it builds trust, keeps you compliant with regulation, reduces legal exposure, and produces more objective outputs to make decisions from.

### Bias and Fairness

`Bias` in this context means the system systematically disadvantages a group of people. It usually enters through the training data rather than through anyone's intent. A dataset with three times as many middle-aged people as any other age group produces a model that predicts less accurately for the young and the old, because it saw fewer of them.

The fixes are applied to the data, not the algorithm:

 - **Balance the dataset** by removing examples of the over-represented group (undersampling), duplicating examples of the under-represented group (oversampling), or generating synthetic examples of it (`SMOTE`, Synthetic Minority Oversampling Technique).
 - **Preprocess the data** through cleaning, normalization, and deliberate feature selection.
 - **Audit regularly**, because a dataset that was balanced when collected can drift out of balance as new data arrives.

### AWS Tools for Responsible AI

Most of these were covered under [Bedrock](#bedrock) and [Sagemaker AI](#sagemaker-ai). The table maps each to the dimension it serves.

| Tool | What it does | Primary Dimension |
| ---- | ------------ | ----------------- |
| [Bedrock Guardrails](#guardrails) | Blocks unwanted topics, filters harmful content, and redacts personal information. | Safety, Controllability |
| [SageMaker Clarify](#sagemaker-clarify) | Detects bias in data and predictions, and reports which inputs drove a prediction. | Fairness, Explainability |
| [SageMaker Data Wrangler](#sagemaker-data-wrangler) | Balances datasets through undersampling, oversampling, and SMOTE. | Fairness |
| [SageMaker Model Monitor](#sagemaker-model-monitor) | Alerts when a deployed model's quality or fairness degrades. | Veracity & Robustness |
| [SageMaker Model Cards](#sagemaker-model-cards) | Documents a model's intended use, risk rating, and limitations. | Transparency, Governance |
| [SageMaker Model Dashboard](#sagemaker-model-dashboard) | Shows every deployed model and its behavior in one place. | Governance |
| [SageMaker Role Manager](#sagemaker-role-manager) | Grants least-privilege access through generated IAM roles. | Governance, Privacy & Security |
| `AWS AI Service Cards` | AWS's own documentation for each AI Service, covering basic concepts, intended use cases and limitations, responsible design choices, and deployment best practices. | Transparency |
| `Amazon Augmented AI (A2I)` | Routes low-confidence predictions to people for review before they are acted on. | Safety, Controllability |

> [!NOTE]
> **Two reliable exam patterns.** Anything about detecting bias or explaining a prediction is `SageMaker Clarify`. Anything about blocking harmful content in a generative application is `Bedrock Guardrails`. A scenario asking for a person to check uncertain results is `Amazon Augmented AI (A2I)`.

### Explainability Techniques

When a model is too complex to inspect directly, these tools infer the relationship between inputs and outputs from the outside:

 - `SHAP` (SHapley Additive exPlanations) and `LIME` (Local Interpretable Model-agnostic Explanations) score how much each input contributed to a prediction. SHAP is what SageMaker Clarify uses.
 - `Counterfactual explanations` show what would have had to differ in the input for the output to change, such as the income level at which a declined loan would have been approved.

There is a genuine tension here worth knowing: full transparency adds development cost, and publishing too much detail about a model can help bad actors attack it or extract its training data. More disclosure is not automatically better.
