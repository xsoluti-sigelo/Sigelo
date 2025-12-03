import { ContactType } from '@/shared/config/enums'
import { UserIcon, PhoneIcon } from '@heroicons/react/24/outline'

interface PartyContact {
  id: string
  contact_type: string
  contact_value: string
}

interface Producer {
  id: string
  is_primary: boolean
  parties?: {
    display_name: string | null
    party_contacts?: PartyContact[]
  } | null
}

interface OperationProducersProps {
  producers: Producer[]
}

export function OperationProducers({ producers }: OperationProducersProps) {
  if (!producers || producers.length === 0) {
    return null
  }

  return (
    <div className="rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Produtores</h3>
      </div>
      <div className="p-4 space-y-3">
        {producers.map((producer) => (
          <div key={producer.id} className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                <UserIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {producer.parties?.display_name}
                </p>
                {producer.is_primary && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 inline-block mt-0.5">
                    Principal
                  </span>
                )}
              </div>
            </div>
            {producer.parties?.party_contacts && producer.parties.party_contacts.length > 0 && (
              <div className="space-y-1 pl-10">
                {producer.parties.party_contacts.map((contact) => (
                  <a
                    key={contact.id}
                    href={
                      contact.contact_type === ContactType.MOBILE ||
                      contact.contact_type === ContactType.WHATSAPP
                        ? `tel:${contact.contact_value}`
                        : `mailto:${contact.contact_value}`
                    }
                    className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                  >
                    <PhoneIcon className="w-3.5 h-3.5" />
                    {contact.contact_value}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
