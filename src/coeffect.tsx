import { useEffect, useState } from 'react'

export type Codata = {
  [key: string]: ((...args: any[]) => any) | undefined
}

export type Effect = {
  options?: object
  consumer: Codata
  handler: Codata
}

export type EffectProducer<E extends Effect> = (
  consumers: E['consumer'],
  options: E['options']
) => E['handler']

export const createEffect = <E extends Effect>(create: EffectProducer<E>) => {
  let factory = (consumer: E['consumer'], options: E['options']) => {
    let currentConsumer = { ...consumer }

    let result = create(currentConsumer, options)
    let handler = { ...result }
    let isCallable = false

    for (let key in handler) {
      let method = handler[key]

      if (typeof method === 'function') {
        let fn = (...args: any[]) => {
          if (!isCallable) {
            throw new Error(`Handler is not callable.`)
          }
          return method!(...args)
        }
        handler[key] = fn as typeof method
      }
    }

    let enable = () => {
      isCallable = true
    }

    let disable = () => {
      isCallable = false
    }

    let update = (consumer: E['consumer']) => {
      Object.assign(currentConsumer, consumer)
    }

    return {
      handler: handler,
      enable,
      disable,
      update
    }
  }

  let useEffects = (consumer: E['consumer'], options: E['options']) => {
    let [{ handler, enable, update }] = useState(() => factory(consumer, options))

    useEffect(() => {
      update(consumer)
    }, [update, consumer])

    useEffect(() => {
      enable()
    }, [enable])

    return handler
  }

  return {
    useEffects,
    create
  }
}
