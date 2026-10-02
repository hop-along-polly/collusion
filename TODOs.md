# TODOs 
 - [x] AWS MArketplace Notes should all be prefixed with "Marketplace -"
 - [x] Finish the Full Service Catalog Cheatsheet
 - [] Carried over from notes.md, which was folded into the cheatsheet. These are AI/ML concepts rather than services, so they belong in ai_practitioner.md: Top K / Top P / Temperature, pruning + distillation + quantization, forward and reverse diffusion, transformer architecture, A/B testing a deployed model, consistent hashing. Everything else notes.md asked about is now answered (fully managed vs managed, database vs data lake, Redshift Spectrum vs Athena, EBS vs S3 vs EFS, NACLs vs route tables, S3 bucket policies in the cheatsheet; responsible AI, SageMaker hosting options, AWS model families, N-grams and the ML algorithms already in ai_practitioner.md)
 - [x] Regenerate the Service Selection cards against the finished cheatsheet
 - [x] Add a Cloud Practitioner (CLF-C02) course over the service catalogue
 - [x] Clear the npm vulnerabilities (vitest 2 -> 4, vite 6.0 -> 6.4.3, react-router-dom 6 -> 7; audit is clean)
 - [] The Flashcards column in every course study guide links set paths like /aws/services, and there is no route for a set, so all of those links 404. Either add a set route or point the column at the course quiz. Affects all 6 courses, and the generate-flashcards skill instructs writing these links, so fix the skill too
 - [] Node is 20.9.0, which pins vite to the 6.x line and vitest to 4.x. vite 7+ and vitest 5 need Node 20.19 or 22.12. Also worth it for type safety: `@types/node` is pinned to ^20 but the published 20.x types track the newest 20 minor (20.19), so tsc still accepts anything added in 20.10 through 20.19. `styleText` from `node:util` is the proof - it type checks here and crashed at runtime during the vitest upgrade. No version of @types/node models 20.9, so only moving the runtime forward closes that gap
 - [x] Deployment choices (Vanity URL vs. Subdomain). Live at flashcards.codescribes.io, GitHub Pages behind Cloudflare, not Heroku: the app is static, so a dyno would cost more to serve it worse
 - [] Every route except / returns HTTP 404. Pages has no rewrite rules, so the SPA fallback serves the right page with the wrong status code, and search engines will not index a URL that 404s. Today only the homepage is indexable, which caps organic traffic for exactly the searches this product should win ("AIF-C01 flashcards"). Cloudflare is already in front, so a Transform Rule or a small Worker can rewrite the status to 200; CloudFront solves it natively with a custom error response if hosting moves there
 - [] Register and Login functionality (Can wait until after initial launch)
 - [] Where/how to store and gamify users answers. Does this mean I have to spin up a DB in Heroku or should I consider moving to AWS and using Serverless resources. Optimizing for costs at this point.


