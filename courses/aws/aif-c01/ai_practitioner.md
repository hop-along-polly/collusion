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

## Sagemaker AI

## Responsible AI
