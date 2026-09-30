# Renewals

An agreement ends on its end date unless something continues it. Three different mechanisms do that, and two of them are both called *automatic renewal*, which is where most of the confusion comes from.

| Mechanism | Who sets it up | Applies to |
| --------- | -------------- | ---------- |
| Renewal terms on a private offer | The **Seller**, when creating the offer | Private offers using contract pricing |
| Auto-renewal on a public offer | The **Buyer**, from their own subscription | Public contract offers |
| A renewal offer | The **Seller**, as a new offer that replaces the agreement | SaaS contract and SaaS contract with consumption only. See [Amendments and Renewals (SaaS)](./saas.md#amendments-and-renewals) |

Only the first two are automatic. The third is a fresh offer the Buyer has to accept.

### Renewal terms on a private offer

A Seller can build renewal terms into a private offer so the agreement renews at its end date without anyone doing anything. The Buyer opts in when first accepting the offer and can change that preference any time before the **renewal decision deadline**; the Seller can disable it before the same deadline.

This is available only for offers using contract pricing — SaaS contracts, server contracts, AMI and Container contracts, and Professional Services.

The Seller chooses how the price behaves between cycles.

| Renewal pricing | What happens |
| --------------- | ------------ |
| No price uplift | The agreement renews at the same price every cycle. |
| Fixed percentage uplift | One percentage applied evenly across all dimensions every cycle. **It compounds** — a 10% uplift takes $100 to $110 to $121. |
| Percentage range | The Seller sets a minimum and maximum and finalises the actual figure before each cycle's **adjustment deadline**. They can apply one flat percentage or a different uplift per dimension, as long as each stays inside the range. If they miss the deadline, a **default uplift** applies. |
| No renewal | The offer carries no renewal terms and the agreement simply ends. |

A **renewal maximum** caps how many times the agreement can renew, or it can be unlimited.

> [!TIP]
> The percentage range exists for deals where the uplift shouldn't be decided years in advance — AWS gives indexing to the consumer price index as the example. It costs the Seller an annual obligation, since missing the adjustment deadline silently applies the default. A fixed percentage is less work and more predictable for both sides.

### Auto-renewal on a public offer

A Buyer who subscribed to a **public** contract offer can switch on automatic renewal themselves. The Seller does not configure this and cannot see it as an offer setting — it belongs to the Buyer's subscription.

> [!WARNING]
> **An amendment destroys it.** *"If you amend an accepted public offer, it becomes a private offer and no longer auto-renews. To maintain automatic renewal, a buyer must subscribe to a public offer."* Converting the agreement to a private offer removes the Buyer's setting, and the resulting private offer carries only whatever renewal terms the Seller authored into it — which, for an amendment, is usually none. A single amendment can therefore turn a self-renewing customer into one who has to be re-sold. See [Amendments and Renewals (SaaS)](./saas.md#amendments-and-renewals).
