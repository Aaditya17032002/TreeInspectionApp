import { useCallback, useRef } from 'react'

interface Options<T> {
  threshold?: number
  onStart?: (item: T) => void
  onEnd?: () => void
}

export function useLongPress<T>(
  callback: (item: T) => void,
  { threshold = 500, onStart, onEnd }: Options<T> = {}
) {
  const timeoutRef = useRef<NodeJS.Timeout>()
  const targetRef = useRef<T>()
  const touchStartTimeRef = useRef<number>(0)
  const isLongPressActiveRef = useRef(false)

  const start = useCallback((item: T, event?: React.TouchEvent | React.MouseEvent) => {
    targetRef.current = item
    touchStartTimeRef.current = Date.now()
    isLongPressActiveRef.current = true

    // Prevent default behavior only for touch events
    if (event?.type.includes('touch')) {
      event.preventDefault()
    }

    timeoutRef.current = setTimeout(() => {
      if (targetRef.current === item && isLongPressActiveRef.current) {
        callback(item)
      }
    }, threshold)
    onStart?.(item)
  }, [callback, threshold, onStart])

  const stop = useCallback((event?: React.TouchEvent | React.MouseEvent) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // If it was a long press, prevent the click event
    if (touchStartTimeRef.current && Date.now() - touchStartTimeRef.current >= threshold) {
      event?.preventDefault()
      event?.stopPropagation()
    }

    isLongPressActiveRef.current = false
    touchStartTimeRef.current = 0
    targetRef.current = undefined
    onEnd?.()
  }, [threshold, onEnd])

  const cancel = useCallback((event?: React.TouchEvent | React.MouseEvent) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    isLongPressActiveRef.current = false
    touchStartTimeRef.current = 0
    targetRef.current = undefined
    onEnd?.()
  }, [onEnd])

  return useCallback((item: T) => ({
    onMouseDown: (e: React.MouseEvent) => start(item, e),
    onMouseUp: (e: React.MouseEvent) => stop(e),
    onMouseLeave: (e: React.MouseEvent) => cancel(e),
    onTouchStart: (e: React.TouchEvent) => {
      e.preventDefault() // Prevent mouse events from firing
      start(item, e)
    },
    onTouchEnd: (e: React.TouchEvent) => {
      e.preventDefault()
      stop(e)
    },
    onTouchCancel: (e: React.TouchEvent) => {
      e.preventDefault()
      cancel(e)
    },
    style: {
      WebkitUserSelect: 'none',
      WebkitTouchCallout: 'none',
      userSelect: 'none',
      touchAction: 'none',
    } as React.CSSProperties,
  }), [start, stop, cancel])
}