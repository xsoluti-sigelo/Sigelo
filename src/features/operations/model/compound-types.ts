import type { Operation, OperationComment } from './operation-types'
import type { EventWithRelations, EventDetails } from './event-types'
import type { ServiceAssignment, VehicleAssignment } from './assignment-types'
import type { OperationDb } from './operation-types'

export interface operationFull extends Operation {
  events: EventWithRelations
  service_assignments?: ServiceAssignment[]
  vehicle_assignment?: VehicleAssignment | null
}

export interface OperationDetails extends OperationDb {
  events: EventDetails
  comments?: OperationComment[]
}
