import { z } from 'zod'

export const addressSchema = z.object({
  cep: z.string().min(8, 'CEP inválido').max(9, 'CEP inválido'),
  street: z.string().min(1, 'Logradouro é obrigatório'),
  number: z.string().min(1, 'Número é obrigatório'),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, 'Bairro é obrigatório'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  state: z.string().length(2, 'Estado deve ter 2 caracteres'),
})

export const addressWithRawSchema = addressSchema.extend({
  rawAddress: z.string().min(1, 'Endereço completo é obrigatório'),
})

export type Address = z.infer<typeof addressSchema>
export type AddressWithRaw = z.infer<typeof addressWithRawSchema>
