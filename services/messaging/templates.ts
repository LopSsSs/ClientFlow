import { getMessageTemplate } from '@/lib/db/messageTemplates'
import { translate } from '@/utils/i18n'
import { renderMessageTemplate } from '@/utils/messageTemplate'
import type { MessageTemplateType } from '@/types/messageTemplate'
import type { Locale } from '@/types/i18n'
import { DEFAULT_LOCALE } from '@/types/i18n'

const DEFAULT_KEY_BY_TYPE: Record<
  MessageTemplateType,
  'messageTemplates.jobReminderDefault' | 'messageTemplates.invoiceReminderDefault' | 'messageTemplates.satisfactionSurveyDefault'
> = {
  job_reminder: 'messageTemplates.jobReminderDefault',
  invoice_reminder: 'messageTemplates.invoiceReminderDefault',
  satisfaction_survey: 'messageTemplates.satisfactionSurveyDefault',
}

// El negocio puede haber personalizado la plantilla; si no, se usa el texto
// por defecto del idioma (ver locales/*.json → messageTemplates).
export async function getEffectiveTemplateBody(
  businessId: string,
  type: MessageTemplateType,
  locale: Locale = DEFAULT_LOCALE
): Promise<string> {
  const custom = await getMessageTemplate(businessId, type)
  if (custom) return custom.body
  return translate(locale, DEFAULT_KEY_BY_TYPE[type])
}

export async function renderTemplateFor(
  businessId: string,
  type: MessageTemplateType,
  vars: Record<string, string>,
  locale: Locale = DEFAULT_LOCALE
): Promise<string> {
  const body = await getEffectiveTemplateBody(businessId, type, locale)
  return renderMessageTemplate(body, vars)
}
