import { Input } from '@/shared/ui'
import { formatCEP } from '@/shared/lib/masks'

interface Address {
  cep: string
  street: string
  number: string
  complement: string
  neighborhood: string
  city: string
  state: string
}

interface AddressFormProps {
  address: Address
  onAddressChange: (field: keyof Address, value: string) => void
  onCepBlur: (cep: string) => void
  isCepLoading?: boolean
}

export function AddressForm({ address, onAddressChange, onCepBlur, isCepLoading }: AddressFormProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        Endereço
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            CEP <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            value={address.cep}
            onChange={(e) => onAddressChange('cep', formatCEP(e.target.value))}
            onBlur={() => onCepBlur(address.cep)}
            placeholder="00000-000"
            maxLength={9}
            required
            disabled={isCepLoading}
          />
          {isCepLoading && <span className="text-xs text-gray-500 mt-1">Buscando...</span>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Logradouro <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            value={address.street}
            onChange={(e) => onAddressChange('street', e.target.value)}
            placeholder="Rua, Avenida..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Número <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            value={address.number}
            onChange={(e) => onAddressChange('number', e.target.value)}
            placeholder="123"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Complemento
          </label>
          <Input
            type="text"
            value={address.complement}
            onChange={(e) => onAddressChange('complement', e.target.value)}
            placeholder="Apto, Sala..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Bairro <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            value={address.neighborhood}
            onChange={(e) => onAddressChange('neighborhood', e.target.value)}
            placeholder="Centro..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Cidade <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            value={address.city}
            onChange={(e) => onAddressChange('city', e.target.value)}
            placeholder="São Paulo..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Estado <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            value={address.state}
            onChange={(e) => onAddressChange('state', e.target.value)}
            placeholder="SP"
            maxLength={2}
            required
          />
        </div>
      </div>
    </div>
  )
}
