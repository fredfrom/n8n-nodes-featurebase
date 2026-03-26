# n8n-nodes-featurebase

[Featurebase](https://featurebase.app) is a product feedback and changelog platform that helps teams collect, organize, and act on user feedback.

This is an n8n community node that lets you use Featurebase in your n8n workflows.

[n8n community nodes docs](https://docs.n8n.io/integrations/community-nodes/installation/)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

1. Go to **Settings > Community Nodes**
2. Select **Install**
3. Enter `n8n-nodes-featurebase`
4. Agree to the risks and click **Install**

## Credentials

You need a Featurebase API key:

1. Go to **Settings > API** in your Featurebase workspace
2. Create a new API key
3. In n8n, create a new **Featurebase API** credential and paste the key

For webhook signature verification (optional), paste your webhook signing secret into the **Webhook Signing Secret** field in the same credential.

## Supported Resources & Operations

| Resource    | Operations                                  |
| ----------- | ------------------------------------------- |
| Board       | Get, Get Many                               |
| Changelog   | Create, Get, Get Many, Update, Delete       |
| Comment     | Create, Get Many, Delete                    |
| Contact     | Create or Update (Upsert), Get, Get Many    |
| Post        | Create, Get, Get Many, Update, Delete       |

### Trigger Node

The **Featurebase Trigger** node starts workflows when events happen in Featurebase:

- Post Created
- Post Updated
- Post Status Changed
- Comment Created
- Changelog Published

Webhooks are automatically registered and deregistered by n8n when you activate/deactivate your workflow.

## Example Workflows

- **New post → Create Linear issue** -- Automatically create a tracking issue when users submit feedback
- **Post status changed → Notify Slack** -- Keep your team updated when feedback moves through your pipeline
- **Changelog published → Tweet** -- Auto-announce product updates on social media

## Compatibility

- Requires n8n version 1.0.0 or later
- Tested with Featurebase API version `2026-01-01.nova`

## Resources

- [Featurebase REST API Docs](https://docs.featurebase.app/rest-api)
- [n8n Community Nodes Documentation](https://docs.n8n.io/integrations/community-nodes/)

## License

[MIT](LICENSE)
