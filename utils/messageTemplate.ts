// Sustituye {{variable}} en el cuerpo de una plantilla guardada por el negocio.
// Deliberadamente separado de utils/i18n.ts: aquí el texto plantilla es dato de
// usuario (persistido en message_templates), no parte del diccionario compilado.
export function renderMessageTemplate(body: string, vars: Record<string, string>): string {
  return body.replace(/\{\{(\w+)\}\}/g, (match, name: string) => vars[name] ?? match)
}
