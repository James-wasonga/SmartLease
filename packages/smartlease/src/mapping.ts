import { BigInt } from "@graphprotocol/graph-ts"
import {
  RoleAssigned as RoleAssignedEvent
} from "../generated/IdentityRegistry/IdentityRegistry"
import {
  PropertyTokenMinted as MintEvent,
  PropertyTokenTransferred as TransferEvent
} from "../generated/PropertyToken/PropertyToken"
// import { Withdrawn as WithdrawnEvent } from "../generated/RentPaymaster/RentPaymaster"
import {
  PropertyCreated as CreatedEvent,
  RentPaid as RentPaidEvent,
  EquityUpdated as EquityUpdatedEvent,
  PropertyOccupied as OccupiedEvent,
  LandlordWithdrawal as WithdrawalEvent,
  TokensTransferred as TokensEvent
} from "../generated/RentToOwn/RentToOwn"

import {
  RoleAssignment,
  PropertyTokenMint,
  PropertyTokenTransfer,
  // PaymentSponsored,
  PropertyCreated,
  RentPaidEvent as RentPaidEntity,
  EquityUpdated,
  PropertyOccupied,
  LandlordWithdrawal,
  TokensTransferred
} from "../generated/schema"

export function handleRoleAssigned(event: RoleAssignedEvent): void {
  let entity = new RoleAssignment(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
  entity.user = event.params.user
  entity.role = event.params.role
  entity.blockNumber = event.block.number
  entity.timestamp = event.block.timestamp
  entity.save()
}

export function handlePropertyMinted(event: MintEvent): void {
  let entity = new PropertyTokenMint(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
  entity.tokenId = event.params.tokenId
  entity.landlord = event.params.landlord
  entity.amount = event.params.amount
  entity.uri = event.params.uri
  entity.save()
}

export function handlePropertyTransferred(event: TransferEvent): void {
  let entity = new PropertyTokenTransfer(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
  entity.tokenId = event.params.tokenId
  entity.from = event.params.from
  entity.to = event.params.to
  entity.amount = event.params.amount
  entity.save()
}

export function handlePropertyCreated(event: CreatedEvent): void {
  let entity = new PropertyCreated(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
  entity.propertyId = event.params.propertyId
  entity.landlord = event.params.landlord
  entity.value = event.params.value
  entity.duration = event.params.duration
  entity.name = event.params.name
  entity.image = event.params.image
  entity.propertyAddress = event.params.propertyAddress
  entity.city = event.params.city
  entity.state = event.params.state
  entity.zipCode = event.params.zipCode
  entity.currency = event.params.currency
  entity.save()
}

export function handleRentPaid(event: RentPaidEvent): void {
  let entity = new RentPaidEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
  entity.propertyId = event.params.propertyId
  entity.tenant = event.params.tenant
  entity.amount = event.params.amount
  entity.save()
}

export function handleEquityUpdated(event: EquityUpdatedEvent): void {
  let entity = new EquityUpdated(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
  entity.propertyId = event.params.propertyId
  entity.tenant = event.params.tenant
  entity.newEquity = event.params.newEquity
  entity.save()
}

export function handlePropertyOccupied(event: OccupiedEvent): void {
  let entity = new PropertyOccupied(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
  entity.propertyId = event.params.propertyId
  entity.tenant = event.params.tenant
  entity.save()
}

export function handleLandlordWithdrawal(event: WithdrawalEvent): void {
  let entity = new LandlordWithdrawal(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
  entity.landlord = event.params.landlord
  entity.propertyId = event.params.propertyId
  entity.amount = event.params.amount
  entity.save()
}

export function handleTokensTransferred(event: TokensEvent): void {
  let entity = new TokensTransferred(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
  entity.propertyId = event.params.propertyId
  entity.from = event.params.from
  entity.to = event.params.to
  entity.tokenId = event.params.tokenId
  entity.amount = event.params.amount
  entity.save()
}