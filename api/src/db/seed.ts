import { faker } from '@faker-js/faker'
import { db } from '.'
import { webhooks } from './schema'

const stripeEventTypes = [
  'payment_intent.succeeded',
  'payment_intent.payment_failed',
  'payment_intent.created',
  'payment_intent.canceled',
  'charge.succeeded',
  'charge.failed',
  'charge.refunded',
  'charge.dispute.created',
  'charge.dispute.closed',
  'invoice.created',
  'invoice.finalized',
  'invoice.paid',
  'invoice.payment_failed',
  'invoice.payment_action_required',
  'invoice.upcoming',
  'invoice.voided',
  'customer.created',
  'customer.updated',
  'customer.deleted',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'customer.subscription.paused',
  'customer.subscription.resumed',
  'checkout.session.completed',
  'checkout.session.expired',
  'payment_method.attached',
  'payment_method.detached',
  'payout.paid',
  'payout.failed',
]

function generateStripeWebhook() {
  const eventType = faker.helpers.arrayElement(stripeEventTypes)
  const [resource] = eventType.split('.')
  const eventId = `evt_${faker.string.alphanumeric(24)}`
  const objectId = `${resource === 'customer' ? 'cus' : resource === 'payment_intent' ? 'pi' : resource === 'charge' ? 'ch' : resource === 'invoice' ? 'in' : resource === 'checkout' ? 'cs' : resource === 'payment_method' ? 'pm' : resource === 'payout' ? 'po' : resource}_${faker.string.alphanumeric(24)}`

  const body = JSON.stringify(
    {
      id: eventId,
      object: 'event',
      api_version: '2024-06-20',
      created: Math.floor(faker.date.recent({ days: 30 }).getTime() / 1000),
      type: eventType,
      livemode: false,
      pending_webhooks: faker.number.int({ min: 1, max: 3 }),
      data: {
        object: {
          id: objectId,
          object: resource,
          amount: faker.number.int({ min: 500, max: 500000 }),
          currency: faker.helpers.arrayElement(['usd', 'brl', 'eur']),
          status: faker.helpers.arrayElement([
            'succeeded',
            'pending',
            'failed',
          ]),
          customer: `cus_${faker.string.alphanumeric(14)}`,
          description: faker.commerce.productName(),
          metadata: {},
        },
      },
    },
    null,
    2,
  )

  const stripeSignature = `t=${Date.now()},v1=${faker.string.hexadecimal({ length: 64, prefix: '' })}`

  return {
    method: 'POST',
    pathname: `/webhooks/stripe`,
    ip: faker.internet.ipv4(),
    statusCode: 200,
    contentType: 'application/json',
    contentLength: Buffer.byteLength(body),
    queryParams: {},
    headers: {
      'content-type': 'application/json',
      'stripe-signature': stripeSignature,
      'user-agent': 'Stripe/1.0 (+https://stripe.com/docs/webhooks)',
      accept: '*/*',
      host: 'localhost:3333',
      connection: 'keep-alive',
    },
    body,
    createdAt: faker.date.recent({ days: 30 }),
  }
}

async function seed() {
  const records = Array.from({ length: 60 }, generateStripeWebhook)

  await db.insert(webhooks).values(records)

  console.log(`Seeded ${records.length} Stripe webhook events.`)
  process.exit(0)
}

seed()
