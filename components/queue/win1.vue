<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useElementSize, useWindowSize } from '@vueuse/core'
import { throttle } from 'lodash-es'

const containerRef = useTemplateRef<HTMLElement>('containerRef')
const dragHandleRef = useTemplateRef<HTMLElement>('dragHandleRef')
const resizeHandleRef = useTemplateRef<HTMLElement>('resizeHandleRef')

const { width: elementWidth, height: elementHeight } = useElementSize(containerRef)
const { width: windowWidth, height: windowHeight } = useWindowSize()

const GAP = 8
const MIN_WIDTH = 200
const MIN_HEIGHT = 100
const THROTTLE_WAIT = 16

const right = ref(GAP)
const bottom = ref(GAP)

const width = ref<number>()
const height = ref<number>()

let mode: 'drag' | 'resize' | null = null

let startClientX = 0
let startClientY = 0

let startRight = 0
let startBottom = 0

let startWidth = 0
let startHeight = 0
let startLeft = 0
let startTop = 0

function clampValue(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function getCurrentWidth() {
  return width.value ?? elementWidth.value
}

function getCurrentHeight() {
  return height.value ?? elementHeight.value
}

function clampPosition() {
  const currentWidth = getCurrentWidth()
  const currentHeight = getCurrentHeight()

  const maxRight = Math.max(0, windowWidth.value - currentWidth)
  const maxBottom = Math.max(0, windowHeight.value - currentHeight)

  right.value = clampValue(right.value, 0, maxRight)
  bottom.value = clampValue(bottom.value, 0, maxBottom)
}

function clampSize() {
  const maxWidth = Math.max(MIN_WIDTH, windowWidth.value - right.value)
  const maxHeight = Math.max(MIN_HEIGHT, windowHeight.value - bottom.value)

  width.value = clampValue(getCurrentWidth(), MIN_WIDTH, maxWidth)
  height.value = clampValue(getCurrentHeight(), MIN_HEIGHT, maxHeight)
}

function fix() {
  clampSize()
  clampPosition()
}

async function init() {
  await nextTick()

  if (!elementWidth.value || !elementHeight.value) return

  width.value = elementWidth.value
  height.value = elementHeight.value

  right.value = GAP
  bottom.value = GAP

  fix()
}

const onPointerMove = throttle((e: PointerEvent) => {
  if (mode === 'drag') {
    right.value = startRight - (e.clientX - startClientX)
    bottom.value = startBottom - (e.clientY - startClientY)

    clampPosition()
    return
  }

  if (mode === 'resize') {
    const nextWidth = startWidth + (e.clientX - startClientX)
    const nextHeight = startHeight + (e.clientY - startClientY)

    width.value = clampValue(nextWidth, MIN_WIDTH, windowWidth.value - startLeft)
    height.value = clampValue(nextHeight, MIN_HEIGHT, windowHeight.value - startTop)

    right.value = windowWidth.value - startLeft - width.value
    bottom.value = windowHeight.value - startTop - height.value

    fix()
  }
}, THROTTLE_WAIT, {
  leading: true,
  trailing: true,
})

function onDragPointerDown(e: PointerEvent) {
  mode = 'drag'

  startClientX = e.clientX
  startClientY = e.clientY
  startRight = right.value
  startBottom = bottom.value

  dragHandleRef.value?.setPointerCapture(e.pointerId)

  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
}

function onResizePointerDown(e: PointerEvent) {
  mode = 'resize'

  const rect = containerRef.value?.getBoundingClientRect()
  if (!rect) return

  startClientX = e.clientX
  startClientY = e.clientY

  startWidth = getCurrentWidth()
  startHeight = getCurrentHeight()

  startLeft = rect.left
  startTop = rect.top

  resizeHandleRef.value?.setPointerCapture(e.pointerId)

  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
}

function onPointerUp() {
  mode = null

  onPointerMove.flush()
  fix()

  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
}

onMounted(() => {
  init()
})

watch([elementWidth, elementHeight], () => {
  if (width.value === undefined && height.value === undefined) {
    init()
  }
})

watch([windowWidth, windowHeight], () => {
  fix()
})

onBeforeUnmount(() => {
  mode = null
  onPointerMove.cancel()

  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
})

const style = computed(() => ({
  right: `${right.value}px`,
  bottom: `${bottom.value}px`,
  width: width.value === undefined ? undefined : `${width.value}px`,
  height: height.value === undefined ? undefined : `${height.value}px`,
}))
</script>

<template>
  <div ref="containerRef" :style="style"
    class="fixed h-[200px] w-[100px] rounded-lg border border-gray-100 bg-white shadow-lg overflow-hidden">
    <div class="flex justify-center pt-2">
      <div ref="dragHandleRef"
        class="h-1 w-16 rounded-full bg-gray-400/80 cursor-move select-none touch-none hover:bg-gray-500 transition-colors"
        @pointerdown.prevent="onDragPointerDown" />
      <slot />
    </div>

    <div ref="resizeHandleRef"
      class="absolute right-0 bottom-0 h-6 w-6 cursor-se-resize select-none touch-none text-gray-400 hover:text-gray-600 transition-colors"
      @pointerdown.prevent.stop="onResizePointerDown">
      <svg class="absolute right-1.5 bottom-1.5 h-3.5 w-3.5" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
        <circle cx="12" cy="12" r="1" />
        <circle cx="8" cy="12" r="1" />
        <circle cx="12" cy="8" r="1" />
        <circle cx="4" cy="12" r="1" />
        <circle cx="8" cy="8" r="1" />
        <circle cx="12" cy="4" r="1" />
      </svg>
    </div>
  </div>
</template>