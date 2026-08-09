import { sql } from '@/lib/neon'
import type { MessageTemplate, MessageTemplateType } from '@/types/messageTemplate'

export async function getMessageTemplates(businessId: string): Promise<MessageTemplate[]> {
  return sql<MessageTemplate[]>`
    SELECT * FROM message_templates WHERE business_id = ${businessId}
  `
}

export async function getMessageTemplate(
  businessId: string,
  type: MessageTemplateType
): Promise<MessageTemplate | undefined> {
  const result = await sql<MessageTemplate[]>`
    SELECT * FROM message_templates WHERE business_id = ${businessId} AND type = ${type}
  `
  return result[0]
}

export async function upsertMessageTemplate(
  businessId: string,
  type: MessageTemplateType,
  body: string
): Promise<MessageTemplate> {
  const result = await sql<MessageTemplate[]>`
    INSERT INTO message_templates (business_id, type, body, created_at, updated_at)
    VALUES (${businessId}, ${type}, ${body}, NOW(), NOW())
    ON CONFLICT (business_id, type)
    DO UPDATE SET body = ${body}, updated_at = NOW()
    RETURNING *
  `
  return result[0]!
}
