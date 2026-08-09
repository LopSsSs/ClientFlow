'use client'

import { useEffect, useState } from 'react'
import { getMessageTemplates, saveMessageTemplate } from '@/lib/api'
import { useTranslation } from '@/hooks/useTranslation'
import { TEMPLATE_VARIABLES } from '@/types/messageTemplate'
import type { MessageTemplate, MessageTemplateType } from '@/types/messageTemplate'

const TYPES: MessageTemplateType[] = ['job_reminder', 'invoice_reminder', 'satisfaction_survey']

export default function MessageTemplatesForm() {
  const { t } = useTranslation()
  const [bodies, setBodies] = useState<Record<MessageTemplateType, string>>({
    job_reminder: '',
    invoice_reminder: '',
    satisfaction_survey: '',
  })
  const [loading, setLoading] = useState(true)
  const [savingType, setSavingType] = useState<MessageTemplateType | null>(null)
  const [savedType, setSavedType] = useState<MessageTemplateType | null>(null)

  useEffect(() => {
    getMessageTemplates()
      .then(({ data }: { data: MessageTemplate[] }) => {
        setBodies((prev) => {
          const next = { ...prev }
          for (const template of data) {
            next[template.type] = template.body
          }
          return next
        })
      })
      .finally(() => setLoading(false))
  }, [])

  const labelKey: Record<
    MessageTemplateType,
    'messageTemplates.jobReminderLabel' | 'messageTemplates.invoiceReminderLabel' | 'messageTemplates.satisfactionSurveyLabel'
  > = {
    job_reminder: 'messageTemplates.jobReminderLabel',
    invoice_reminder: 'messageTemplates.invoiceReminderLabel',
    satisfaction_survey: 'messageTemplates.satisfactionSurveyLabel',
  }

  const defaultKey: Record<
    MessageTemplateType,
    'messageTemplates.jobReminderDefault' | 'messageTemplates.invoiceReminderDefault' | 'messageTemplates.satisfactionSurveyDefault'
  > = {
    job_reminder: 'messageTemplates.jobReminderDefault',
    invoice_reminder: 'messageTemplates.invoiceReminderDefault',
    satisfaction_survey: 'messageTemplates.satisfactionSurveyDefault',
  }

  const handleSave = async (type: MessageTemplateType) => {
    setSavingType(type)
    setSavedType(null)
    try {
      await saveMessageTemplate(type, bodies[type] || t(defaultKey[type]))
      setSavedType(type)
    } finally {
      setSavingType(null)
    }
  }

  if (loading) return null

  return (
    <div className="card space-y-6">
      <h2 className="text-xl font-bold text-primary">{t('messageTemplates.title')}</h2>

      {TYPES.map((type) => (
        <div key={type}>
          <label className="block text-sm font-medium mb-2">{t(labelKey[type])}</label>
          <textarea
            value={bodies[type]}
            placeholder={t(defaultKey[type])}
            onChange={(e) => setBodies((prev) => ({ ...prev, [type]: e.target.value }))}
            className="input-field h-24"
          />
          <p className="text-xs text-gray-500 mt-1">
            {t('messageTemplates.hint', { variables: TEMPLATE_VARIABLES[type].join(', ') })}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <button
              type="button"
              onClick={() => handleSave(type)}
              disabled={savingType === type}
              className="btn-secondary text-sm"
            >
              {t('settings.save')}
            </button>
            {savedType === type && (
              <span className="text-sm text-green-700">{t('settings.saved')}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
