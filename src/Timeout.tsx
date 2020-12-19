import { createEffect } from './coeffect'

export type TimeoutEffect = {
  options: {
    duration: number
  }
  consumer: {
    onStart?: () => any
    onStop?: () => any
    onEnd?: () => any
    onUpdate?: (currDuration: number, prevDuration: number) => any
  }
  handler: {
    start: (duration?: number) => void
    stop: () => void
    update: (duration: number) => void
    isStart: () => boolean
  }
}

export const Timeout = createEffect<TimeoutEffect>((consumer, options) => {
  let tid: ReturnType<typeof setTimeout> | null = null
  let duration = options.duration

  return {
    start() {
      if (tid !== null) return
      tid = setTimeout(() => {
        tid = null
        consumer.onEnd?.()
      }, duration)
      consumer.onStart?.()
    },
    stop() {
      if (tid === null) return
      clearTimeout(tid)
      tid = null
      consumer.onStop?.()
    },
    update(newDuration) {
      duration = newDuration
      this.stop()
    },
    isStart() {
      return tid !== null
    }
  }
})
