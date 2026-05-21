import { useState, useCallback, useMemo, useRef } from 'react'
import type { GuideLine } from '@sketch-ruler/core'
import { importLines, exportLines, generateLineId } from '@sketch-ruler/core'
import type { LineType } from '../index-types'

// 创建本地别名供 hook 内部使用
const lineTypeToGuideLines = importLines
const guideLinesToLineType = exportLines
export { lineTypeToGuideLines, guideLinesToLineType }

export interface GuideLineCallbacks {
  onLineCreate?: (line: GuideLine) => void
  onLineDelete?: (line: GuideLine) => void
  onLineMove?: (line: GuideLine, from: number, to: number) => void
}

export function useGuideLines(
  externalGuideLines?: GuideLine[],
  externalLines?: LineType,
  onGuideLineChange?: (lines: GuideLine[]) => void,
  handleLine?: (props: LineType) => void,
  callbacks?: GuideLineCallbacks
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
      const newLine: GuideLine = { ...line, id: generateLineId() }
      const next = [...currentLines, newLine]
      if (!isControlled) setDerivedLines(next)
      notify(next)
      callbacks?.onLineCreate?.(newLine)
      return newLine
    },
    [currentLines, isControlled, notify, callbacks]
  )

  const removeLine = useCallback(
    (id: string) => {
      const line = currentLines.find((l: GuideLine) => l.id === id)
      const next = currentLines.filter((l) => l.id !== id)
      if (!isControlled) setDerivedLines(next)
      notify(next)
      if (line) callbacks?.onLineDelete?.(line)
    },
    [currentLines, isControlled, notify, callbacks]
  )

  const updateLine = useCallback(
    (id: string, position: number) => {
      const line = currentLines.find((l) => l.id === id)
      const from = line?.position
      const next = currentLines.map((l: GuideLine) =>
        l.id === id ? { ...l, position } : l
      )
      if (!isControlled) setDerivedLines(next)
      notify(next)
      if (line && from !== undefined) {
        callbacks?.onLineMove?.(line, from, position)
      }
    },
    [currentLines, isControlled, notify, callbacks]
  )

  return {
    guideLines: currentLines,
    addLine,
    removeLine,
    updateLine
  }
}
