import { Input } from '@/shared/ui'

interface EventInfoFieldsProps {
  eventNumber: string
  eventDescription: string
  onEventNumberChange: (value: string) => void
  onEventDescriptionChange: (value: string) => void
}

export function EventInfoFields({
  eventNumber,
  eventDescription,
  onEventNumberChange,
  onEventDescriptionChange,
}: EventInfoFieldsProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        Informações do evento
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Número do evento
          </label>
          <Input
            type="text"
            value={eventNumber}
            onChange={(e) => onEventNumberChange(e.target.value)}
            placeholder="Deixe vazio para gerar automaticamente"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Descrição do evento <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            value={eventDescription}
            onChange={(e) => onEventDescriptionChange(e.target.value)}
            placeholder="Ex: Festival de Música"
            required
          />
        </div>
      </div>
    </div>
  )
}
