import { createContext, useContext, type RefObject } from 'react'
import type { MotionValue } from 'framer-motion'

type TendonFieldContextValue = {
  fieldRef: RefObject<HTMLDivElement | null>
  progress: MotionValue<number>
  geometryKey: string
  getProgressAtElement: (element: Element) => number
}

export const TendonFieldContext = createContext<TendonFieldContextValue | null>(null)

export function useTendonField() {
  return useContext(TendonFieldContext)
}
