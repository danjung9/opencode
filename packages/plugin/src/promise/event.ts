import type { WarcodeEvent } from "@warcode/client"
import type { SelectedEvent, SubscribeOptions } from "@warcode/client/promise/api"

type EventType = Exclude<WarcodeEvent["type"], "server.connected">

export interface EventDomain {
  readonly subscribe: <Type extends EventType = EventType>(
    options?: SubscribeOptions<Type>,
  ) => AsyncIterable<SelectedEvent<WarcodeEvent, Type>>
}
