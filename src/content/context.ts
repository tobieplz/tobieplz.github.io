import { inject, provide, type InjectionKey } from 'vue'

import type { Content } from './schema'

const contentKey: InjectionKey<Content> = Symbol('content')

/** Called once by each locale root, so only that language's copy is loaded. */
export function provideContent(content: Content): void {
  provide(contentKey, content)
}

export function useContent(): Content {
  const content = inject(contentKey)
  if (!content) throw new Error('useContent() must be called below a locale root')
  return content
}
