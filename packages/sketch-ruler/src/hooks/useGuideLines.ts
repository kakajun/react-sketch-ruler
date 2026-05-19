import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import type { GuideLine } from '@sketch-ruler/core'
import type { LineType } from '../index-types'

let idCounter = 0
function generateId() {
  return `line-${++idCounter}-${Date.now()}`
}

export function lineTypeToGuideLines(lines: LineType): GuideLine[] {
  const result: GuideLine[] = []
  lines.h.forEach((pos) =>
    result.push({ id: generateId(), orientation: 'h', position: pos })
  )
  lines.v.forEach((pos) =>
    result.push({ id: generateId(), orientation: 'v', position: pos })
  )
  return result
}

export function guideLinesToLineType(lines: GuideLine[]): LineType {
  return {
    h: lines.filter((l) => l.orientation === 'h').map((l) => l.position),
    v: lines.filter((l) => l.orientation === 'v').map((l) => l.position)
  }
}

export function useGuideLines(
  externalGuideLines?: GuideLine[],
  externalLines?: LineType,
  onGuideLineChange?: (lines: GuideLine[]) => void,
  handleLine?: (props: LineType) => void
) {
  const isControlled = externalGuideLines !== undefined

  // 用 ref 缓存 lines 的字符串表示，避免无限循环
  const linesKeyRef = useRef('')
  const [derivedLines, setDerivedLines] = useState<GuideLine[]>(() => {
    if (externalGuideLines) return externalGuideLines
    if (externalLines) return lineTypeToGuideLines(externalLines)
    return []
  })

  const currentLines = useMemo(() => {
    if (externalGuideLines !== undefined) return externalGuideLines
    if (externalLines !== undefined) {
      const key = JSON.stringify(externalLines)
      if (key !== linesKeyRef.current) {
        linesKeyRef.current = key
        return lineTypeToGuideLines(externalLines)
      }
    }
    return derivedLines
  }, [externalGuideLines, externalLines, derivedLines])

  const notify = useCallback(
    (next: GuideLine[]) => {
      onGuideLineChange?.(next)
      handleLine?.(guideLinesToLineType(next))
    },
    [onGuideLineChange, handleLine]
  )

  const addLine = useCallback(
    (line: Omit<GuideLine, 'id'>) => {
      const newLine: GuideLine = { ...line, id: generateId() }
      const next = [...currentLines, newLine]
      if (!isControlled) setDerivedLines(next)
      notify(next)
    },
    [currentLines, isControlled, notify]
  )

  const removeLine = useCallback(
    (id: string) => {
      const next = currentLines.filter((l) => l.id !== id)
      if (!isControlled) setDerivedLines(next)
      notify(next)
    },
    [currentLines, isControlled, notify]
  )

  const updateLine = useCallback(
    (id: string, position: number) => {
      const next = currentLines.map((l) =>
        l.id === id ? { ...l, position } : l
      )
      if (!isControlled) setDerivedLines(next)
      notify(next)
    },
    [currentLines, isControlled, notify]
  )

  return {
    guideLines: currentLines,
    addLine,
    removeLine,
    updateLine
  }
}
