import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import VanillaSelecto, { SelectoOptions, SelectoMethods } from 'selecto'

interface ReactSelectoProps extends Partial<SelectoOptions> {
  [key: string]: any
}

export interface ReactSelectoRef {
  clickTarget: (event: any, target: any) => void
}

const ReactSelecto = forwardRef<ReactSelectoRef, ReactSelectoProps>((props, ref) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const selectoRef = useRef<VanillaSelecto | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const options: Partial<SelectoOptions> = {}
    const optionKeys = [
      'dragContainer',
      'selectableTargets',
      'selectByClick',
      'selectFromInside',
      'toggleContinueSelect',
      'hitRate',
      'ratio',
      'keyContainer',
      'continueSelect',
      'continueSelectWithoutDeselect'
    ]

    optionKeys.forEach((key) => {
      const propValue = (props as Record<string, any>)[key]
      if (propValue !== undefined) {
        ;(options as any)[key] = propValue
      }
    })

    const selecto = new VanillaSelecto({
      ...options,
      portalContainer: containerRef.current
    })

    selectoRef.current = selecto

    if (props.onDragStart) {
      selecto.on('dragStart', props.onDragStart)
    }
    if (props.onSelectEnd) {
      selecto.on('selectEnd', props.onSelectEnd)
    }
    if (props.onSelect) {
      selecto.on('select', props.onSelect)
    }

    return () => {
      selecto.destroy()
      selectoRef.current = null
    }
  }, [])

  useImperativeHandle(ref, () => ({
    clickTarget: (event: any, target: any) => {
      selectoRef.current?.clickTarget(event, target)
    }
  }))

  return <div ref={containerRef} style={{ display: 'none' }} />
})

ReactSelecto.displayName = 'ReactSelecto'

export default ReactSelecto
