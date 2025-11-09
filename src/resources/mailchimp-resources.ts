import type { Resource } from '@modelcontextprotocol/sdk/types.js';
import { MailchimpClient } from '../lib/mailchimp-client.js';

export async function listResources(client: MailchimpClient): Promise<Resource[]> {
  try {
    // Fetch audiences to expose as resources
    const audiences = await client.get<any>('/lists?count=100');
    
    const resources: Resource[] = [];
    
    // Add each audience as a resource
    for (const list of audiences.lists || []) {
      resources.push({
        uri: `mailchimp://audience/${list.id}`,
        name: `Audience: ${list.name}`,
        description: `${list.stats.member_count} members`,
        mimeType: 'application/json',
      });
    }
    
    return resources;
  } catch (error) {
    console.error('Error listing resources:', error);
    return [];
  }
}

export async function readResource(uri: string, client: MailchimpClient): Promise<string> {
  const match = uri.match(/^mailchimp:\/\/audience\/(.+)$/);
  if (!match) {
    throw new Error(`Unknown resource URI: ${uri}`);
  }
  
  const audienceId = match[1];
  const audience = await client.get(`/lists/${audienceId}`);
  
  return JSON.stringify(audience, null, 2);
}

