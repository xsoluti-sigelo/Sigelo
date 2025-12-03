export enum UserRole {
  ADMIN = 'ADMIN',
  OPERATOR = 'OPERATOR',
  VIEWER = 'VIEWER',
}

export const UserRoleLabels: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Administrador',
  [UserRole.OPERATOR]: 'Operador',
  [UserRole.VIEWER]: 'Visualizador',
}

export enum PartyType {
  PERSON = 'PERSON',
  ORGANIZATION = 'ORGANIZATION',
}

export const PartyTypeLabels: Record<PartyType, string> = {
  [PartyType.PERSON]: 'Pessoa Física (PF)',
  [PartyType.ORGANIZATION]: 'Pessoa Jurídica (PJ)',
}

export enum PartyRoleType {
  CLIENT = 'CLIENT',
  SUPPLIER = 'SUPPLIER',
  PARTNER = 'PARTNER',
  COORDINATOR = 'COORDINATOR',
  PRODUCER = 'PRODUCER',
  EMPLOYEE = 'EMPLOYEE',
  CONTACT = 'CONTACT',
}

export const PartyRoleTypeLabels: Record<PartyRoleType, string> = {
  [PartyRoleType.CLIENT]: 'Cliente',
  [PartyRoleType.SUPPLIER]: 'Fornecedor',
  [PartyRoleType.PARTNER]: 'Parceiro',
  [PartyRoleType.COORDINATOR]: 'Coordenador',
  [PartyRoleType.PRODUCER]: 'Produtor',
  [PartyRoleType.EMPLOYEE]: 'Funcionário',
  [PartyRoleType.CONTACT]: 'Contato',
}

export enum ContactType {
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
  MOBILE = 'MOBILE',
  FAX = 'FAX',
  WHATSAPP = 'WHATSAPP',
  WEBSITE = 'WEBSITE',
  LINKEDIN = 'LINKEDIN',
  INSTAGRAM = 'INSTAGRAM',
}

export const ContactTypeLabels: Record<ContactType, string> = {
  [ContactType.EMAIL]: 'E-mail',
  [ContactType.PHONE]: 'Telefone',
  [ContactType.MOBILE]: 'Celular',
  [ContactType.FAX]: 'Fax',
  [ContactType.WHATSAPP]: 'WhatsApp',
  [ContactType.WEBSITE]: 'Website',
  [ContactType.LINKEDIN]: 'LinkedIn',
  [ContactType.INSTAGRAM]: 'Instagram',
}

export const ContactTypeIcons: Record<ContactType, string> = {
  [ContactType.EMAIL]: 'email',
  [ContactType.PHONE]: 'phone',
  [ContactType.MOBILE]: 'mobile',
  [ContactType.FAX]: 'fax',
  [ContactType.WHATSAPP]: 'whatsapp',
  [ContactType.WEBSITE]: 'website',
  [ContactType.LINKEDIN]: 'linkedin',
  [ContactType.INSTAGRAM]: 'instagram',
}

export enum EventStatus {
  RECEIVED = 'RECEIVED',
  VERIFIED = 'VERIFIED',
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  BILLED = 'BILLED',
  CANCELLED = 'CANCELLED',
  INCOMPLETE = 'INCOMPLETE',
  DRAFT = 'DRAFT',
  CONFIRMED = 'CONFIRMED',
  ACTIVE = 'ACTIVE',
}

export const EventStatusLabels: Record<EventStatus, string> = {
  [EventStatus.RECEIVED]: 'Recebido',
  [EventStatus.VERIFIED]: 'Verificado',
  [EventStatus.SCHEDULED]: 'Agendado',
  [EventStatus.IN_PROGRESS]: 'Em Andamento',
  [EventStatus.COMPLETED]: 'Concluído',
  [EventStatus.BILLED]: 'Faturado',
  [EventStatus.CANCELLED]: 'Cancelado',
  [EventStatus.INCOMPLETE]: 'Incompleto',
  [EventStatus.DRAFT]: 'Rascunho',
  [EventStatus.CONFIRMED]: 'Confirmado',
  [EventStatus.ACTIVE]: 'Ativo',
}

export const EventStatusColors: Record<EventStatus, string> = {
  [EventStatus.RECEIVED]:
    'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
  [EventStatus.VERIFIED]: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
  [EventStatus.SCHEDULED]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  [EventStatus.IN_PROGRESS]:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  [EventStatus.COMPLETED]: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
  [EventStatus.BILLED]: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  [EventStatus.CANCELLED]: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  [EventStatus.INCOMPLETE]:
    'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  [EventStatus.DRAFT]: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  [EventStatus.CONFIRMED]: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  [EventStatus.ACTIVE]:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
}

export enum OrderFulfillmentStatus {
  ACTIVE = 'ACTIVE',
  CANCELLED = 'CANCELLED',
  MERGED = 'MERGED',
  COMPLETED = 'COMPLETED',
}

export const OrderFulfillmentStatusLabels: Record<OrderFulfillmentStatus, string> = {
  [OrderFulfillmentStatus.ACTIVE]: 'Ativa',
  [OrderFulfillmentStatus.CANCELLED]: 'Cancelada',
  [OrderFulfillmentStatus.MERGED]: 'Mesclada',
  [OrderFulfillmentStatus.COMPLETED]: 'Concluída',
}

export const OrderFulfillmentStatusColors: Record<OrderFulfillmentStatus, string> = {
  [OrderFulfillmentStatus.ACTIVE]:
    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  [OrderFulfillmentStatus.CANCELLED]:
    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  [OrderFulfillmentStatus.MERGED]:
    'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  [OrderFulfillmentStatus.COMPLETED]:
    'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
}

export enum CleaningSubtype {
  PRE_EVENT = 'PRE_EVENT',
  POST_USE = 'POST_USE',
  INTERMITTENT = 'INTERMITTENT',
}

export const CleaningSubtypeLabels: Record<CleaningSubtype, string> = {
  [CleaningSubtype.PRE_EVENT]: 'Pré-evento',
  [CleaningSubtype.POST_USE]: 'Pós-uso',
  [CleaningSubtype.INTERMITTENT]: 'Intermitente',
}

export enum AssignmentRole {
  DRIVER = 'DRIVER',
  HELPER = 'HELPER',
  COORDINATOR = 'COORDINATOR',
}

export const AssignmentRoleLabels: Record<AssignmentRole, string> = {
  [AssignmentRole.DRIVER]: 'Motorista',
  [AssignmentRole.HELPER]: 'Ajudante',
  [AssignmentRole.COORDINATOR]: 'Coordenador',
}

export enum VehicleType {
  CARGA = 'CARGA',
  TANQUE = 'TANQUE',
}

export const VehicleTypeLabels: Record<VehicleType, string> = {
  [VehicleType.CARGA]: 'Caminhão (Carga)',
  [VehicleType.TANQUE]: 'Caminhão-tanque',
}

export enum VehicleStatus {
  AVAILABLE = 'AVAILABLE',
  IN_USE = 'IN_USE',
  MAINTENANCE = 'MAINTENANCE',
  INACTIVE = 'INACTIVE',
}

export const VehicleStatusLabels: Record<VehicleStatus, string> = {
  [VehicleStatus.AVAILABLE]: 'Disponível',
  [VehicleStatus.IN_USE]: 'Em Uso',
  [VehicleStatus.MAINTENANCE]: 'Manutenção',
  [VehicleStatus.INACTIVE]: 'Inativo',
}

export enum EquipmentCategory {
  BANHEIRO_PADRAO = 'BANHEIRO_PADRAO',
  BANHEIRO_PCD = 'BANHEIRO_PCD',
  BANHEIRO_VIP = 'BANHEIRO_VIP',
  LAVATORIO = 'LAVATORIO',
  VESTIARIO = 'VESTIARIO',
  OUTROS = 'OUTROS',
}

export const EquipmentCategoryLabels: Record<EquipmentCategory, string> = {
  [EquipmentCategory.BANHEIRO_PADRAO]: 'Banheiro Padrão',
  [EquipmentCategory.BANHEIRO_PCD]: 'Banheiro PCD',
  [EquipmentCategory.BANHEIRO_VIP]: 'Banheiro VIP',
  [EquipmentCategory.LAVATORIO]: 'Lavatório',
  [EquipmentCategory.VESTIARIO]: 'Vestiário',
  [EquipmentCategory.OUTROS]: 'Outros',
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system',
}

export const ThemeLabels: Record<Theme, string> = {
  [Theme.LIGHT]: 'Claro',
  [Theme.DARK]: 'Escuro',
  [Theme.SYSTEM]: 'Sistema',
}

export enum ActionType {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  CREATE_EVENT = 'CREATE_EVENT',
  UPDATE_EVENT = 'UPDATE_EVENT',
  DELETE_EVENT = 'DELETE_EVENT',
  CREATE_CLIENT = 'CREATE_CLIENT',
  UPDATE_CLIENT = 'UPDATE_CLIENT',
  DELETE_CLIENT = 'DELETE_CLIENT',
  CREATE_EMPLOYEE = 'CREATE_EMPLOYEE',
  UPDATE_EMPLOYEE = 'UPDATE_EMPLOYEE',
  DELETE_EMPLOYEE = 'DELETE_EMPLOYEE',
  CREATE_USER = 'CREATE_USER',
  UPDATE_USER = 'UPDATE_USER',
  DELETE_USER = 'DELETE_USER',
  CREATE_OPERATION = 'CREATE_OPERATION',
  UPDATE_OPERATION = 'UPDATE_OPERATION',
  DELETE_OPERATION = 'DELETE_OPERATION',
  ASSIGN_DRIVER = 'ASSIGN_DRIVER',
  ASSIGN_VEHICLE = 'ASSIGN_VEHICLE',
  EXPORT_DATA = 'EXPORT_DATA',
  IMPORT_DATA = 'IMPORT_DATA',
  SYNC_CONTAAZUL_PESSOAS = 'SYNC_CONTAAZUL_PESSOAS',
  SYNC_CONTAAZUL_SERVICOS = 'SYNC_CONTAAZUL_SERVICOS',
}

export const ActionTypeLabels: Record<ActionType, string> = {
  [ActionType.LOGIN]: 'Login',
  [ActionType.LOGOUT]: 'Logout',
  [ActionType.CREATE_EVENT]: 'Criar Evento',
  [ActionType.UPDATE_EVENT]: 'Atualizar Evento',
  [ActionType.DELETE_EVENT]: 'Excluir Evento',
  [ActionType.CREATE_CLIENT]: 'Criar Cliente',
  [ActionType.UPDATE_CLIENT]: 'Atualizar Cliente',
  [ActionType.DELETE_CLIENT]: 'Excluir Cliente',
  [ActionType.CREATE_EMPLOYEE]: 'Criar Funcionário',
  [ActionType.UPDATE_EMPLOYEE]: 'Atualizar Funcionário',
  [ActionType.DELETE_EMPLOYEE]: 'Excluir Funcionário',
  [ActionType.CREATE_USER]: 'Criar Usuário',
  [ActionType.UPDATE_USER]: 'Atualizar Usuário',
  [ActionType.DELETE_USER]: 'Excluir Usuário',
  [ActionType.CREATE_OPERATION]: 'Criar Operação',
  [ActionType.UPDATE_OPERATION]: 'Atualizar Operação',
  [ActionType.DELETE_OPERATION]: 'Excluir Operação',
  [ActionType.ASSIGN_DRIVER]: 'Atribuir Motorista',
  [ActionType.ASSIGN_VEHICLE]: 'Atribuir Veículo',
  [ActionType.EXPORT_DATA]: 'Exportar Dados',
  [ActionType.IMPORT_DATA]: 'Importar Dados',
  [ActionType.SYNC_CONTAAZUL_PESSOAS]: 'Sincronizar Pessoas Conta Azul',
  [ActionType.SYNC_CONTAAZUL_SERVICOS]: 'Sincronizar Servicos Conta Azul',
}

export function getEnumValues<T extends Record<string, string>>(enumObj: T): T[keyof T][] {
  return Object.values(enumObj) as T[keyof T][]
}

export function getEnumKeys<T extends Record<string, string>>(enumObj: T): (keyof T)[] {
  return Object.keys(enumObj) as (keyof T)[]
}

export function enumToSelectOptions<T extends Record<string, string>>(
  enumObj: T,
  labels: Record<T[keyof T], string>,
): Array<{ value: T[keyof T]; label: string }> {
  return getEnumValues(enumObj).map((value) => ({
    value,
    label: labels[value],
  }))
}
