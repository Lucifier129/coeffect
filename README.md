# Coeffect

An effect-management library for React

`Coeffect` 让我们在 React 组件外部管理 `Effect`，尽情使用 `side-effect` 和 `mutable-state`，不受 `React` 组件的 `immutable` 和 `pure` 的限制。

`Coeffect` 里的副作用遵循 `useEffect(effectFunction)` 的规则，是渲染安全的，但能够很好地和 `React` 组件协同工作。

## Usage

```typescript
import { createEffect } from 'coeffect'

/**
 * 定义你的 Effect 类型
 * options 描述数据参数
 * consumer 描述回调方法
 * handler 描述控制方法
 */
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

/**
 * 根据 Effect 类型，创建 Effect 对象
 */
export const Timeout = createEffect<TimeoutEffect>((consumer, options) => {
  let tid: number | null = null
  let duration = options.duration // 消费 options 参数

  // 实现 handler 方法
  return {
    start() {
      if (tid !== null) return
      tid = setTimeout(() => {
        tid = null
        consumer.onEnd?.() // 调用 consumer 方法
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

// 在 React 组件中使用

const CopyButton: FC<Props> = ({ text, children }) => {
  const [noticing, setNoticing] = useState(false)

  /**
   * 使用时，传递 consumer 回调方法，传递 options 参数
   */
  const notifier = Timeout.useEffects(
    {
      onStart: () => {
        // 在 consumer 方法中，将数据同步到 state
        setNoticing(true)
      },
      onEnd: () => {
        setNoticing(false)
      },
      onStop: () => {
        setNoticing(false)
      }
    },
    {
      duration: 1500
    }
  )

  const handleCopy = (text: string) => {
    // 可以按需调用，而非被动 re-render
    if (!text.includes('*')) {
      notifier.start() // 调用 handler 控制方法
    }
  }

  return (
    <Tooltip visible={noticing} title="已复制至剪贴板">
      <CopyToClipboard text={text} onCopy={handleCopy}>
        {children}
      </CopyToClipboard>
    </Tooltip>
  )
}
```
