import { WebhooksListItem } from './webhooks-list-item'

export function WebhooksList() {
  return (
    <div className="flex-1 overflow-auto">
      <div className="space-y-1 p-2">
        <WebhooksListItem />
        <WebhooksListItem />
        <WebhooksListItem />
        <WebhooksListItem />
        <WebhooksListItem />
        <WebhooksListItem />
        <WebhooksListItem />
        <WebhooksListItem />
      </div>
    </div>
  )
}
