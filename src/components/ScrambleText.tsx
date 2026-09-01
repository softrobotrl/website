import { useLayoutEffect, useRef, type CSSProperties } from 'react'
import gsap from 'gsap'

const ASCII_CHARS = ` .'\`^",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$`

type ScrambleTextProps = {
  children: string
  trigger?: 'load' | 'inView' | 'hover'
  duration?: number
  delay?: number
  hoverTarget?: 'self' | 'parent'
  className?: string
  noiseColor?: string
}

type ScrambleStyles = CSSProperties & {
  '--scramble-noise'?: string
}

function randomCharacter() {
  return ASCII_CHARS[Math.floor(Math.random() * ASCII_CHARS.length)]
}

function renderFrame(characters: string[], glyphs: HTMLElement[], progress: number) {
  const characterCount = characters.filter((character) => !/\s/.test(character)).length
  const transitionCount = Math.round(progress * characterCount)
  let characterIndex = 0

  characters.forEach((character, index) => {
    const glyph = glyphs[index]
    if (!glyph) return

    if (/\s/.test(character)) {
      glyph.textContent = character
      delete glyph.dataset.noise
      return
    }

    const shouldScramble = characterIndex >= transitionCount
    characterIndex += 1
    glyph.textContent = shouldScramble ? randomCharacter() : character
    if (shouldScramble) glyph.dataset.noise = 'true'
    else delete glyph.dataset.noise
  })
}

export function ScrambleText({
  children,
  trigger = 'hover',
  duration = trigger === 'hover' ? 0.4 : 0.46,
  delay = 0,
  hoverTarget = 'self',
  className = '',
  noiseColor,
}: ScrambleTextProps) {
  const wrapperRef = useRef<HTMLSpanElement>(null)
  const layerRef = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current
    const layer = layerRef.current
    if (!wrapper || !layer) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const characters = Array.from(children)
    const glyphs = Array.from(layer.querySelectorAll<HTMLElement>('[data-scramble-glyph]'))
    let timeline: gsap.core.Timeline | undefined
    let delayedStart: gsap.core.Tween | undefined
    let observer: IntersectionObserver | undefined

    const finish = () => {
      glyphs.forEach((glyph, index) => {
        glyph.textContent = characters[index] ?? ''
        delete glyph.dataset.noise
      })
      delete layer.dataset.scrambling
    }

    const reset = () => {
      timeline?.kill()
      delayedStart?.kill()
      gsap.killTweensOf(layer)
      finish()
    }

    const run = () => {
      reset()
      if (reducedMotion.matches) return

      const state = { resolve: 0 }

      timeline = gsap.timeline({
        delay,
        onStart: () => {
          layer.dataset.scrambling = 'true'
          renderFrame(characters, glyphs, 0)
        },
        onComplete: finish,
      })
      timeline.to(state, {
        resolve: 1,
        duration: duration * 2,
        ease: 'none',
        onUpdate: () => {
          renderFrame(characters, glyphs, state.resolve)
        },
      })
    }

    finish()

    if (trigger === 'load') {
      delayedStart = gsap.delayedCall(0, run)
    } else if (trigger === 'inView') {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry?.isIntersecting) return
          observer?.disconnect()
          run()
        },
        { rootMargin: '0px 0px -12% 0px', threshold: 0.25 },
      )
      observer.observe(wrapper)
    } else {
      const target = hoverTarget === 'parent' ? wrapper.parentElement : wrapper
      target?.addEventListener('pointerenter', run)
      target?.addEventListener('focusin', run)
      target?.addEventListener('click', reset)

      return () => {
        target?.removeEventListener('pointerenter', run)
        target?.removeEventListener('focusin', run)
        target?.removeEventListener('click', reset)
        observer?.disconnect()
        reset()
      }
    }

    return () => {
      observer?.disconnect()
      reset()
    }
  }, [children, delay, duration, hoverTarget, trigger])

  const style: ScrambleStyles | undefined = noiseColor ? { '--scramble-noise': noiseColor } : undefined

  return (
    <span ref={wrapperRef} className={`scramble-text ${className}`.trim()} style={style}>
      <span className="scramble-text__sr-only">{children}</span>
      <span className="scramble-text__spacer" aria-hidden="true">
        {children}
      </span>
      <span ref={layerRef} className="scramble-text__layer" aria-hidden="true">
        {Array.from(children, (character, index) => (
          <span key={`${character}-${index}`} className="scramble-text__glyph">
            <span className="scramble-text__glyph-spacer">{character}</span>
            <span className="scramble-text__glyph-value" data-scramble-glyph>
              {character}
            </span>
          </span>
        ))}
      </span>
    </span>
  )
}
