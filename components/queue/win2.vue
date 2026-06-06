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
    class="fixed h-[200px] w-[100px] rounded-xl border border-gray-100 bg-white shadow-lg overflow-hidden">
    <!-- mac 风格头部，可拖拽 -->
    <div ref="dragHandleRef"
      class="group/bar flex items-center justify-between h-6 px-2 bg-gray-50 border-b border-gray-100 cursor-move select-none touch-none"
      @pointerdown.prevent="onDragPointerDown">
      <!-- 左上角按钮 -->
      <div class="flex group items-center gap-1.5 cursor-auto " @pointerdown.stop>
        <!-- close -->
        <span class="relative flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-400">
          <svg class="hidden size-2.5  group-hover:block" viewBox="0 0 8 8" fill="none" aria-hidden="true">
            <path d="M1.5 1.5L6.5 6.5M6.5 1.5L1.5 6.5" stroke="currentColor" stroke-width="1.2"
              stroke-linecap="round" />
          </svg>
        </span>

        <!-- minimize -->
        <span class="relative flex h-3.5 w-3.5 items-center justify-center rounded-full bg-yellow-400">
          <svg class="hidden size-2.5  group-hover:block" viewBox="0 0 8 8" fill="none" aria-hidden="true">
            <path d="M1.5 4H6.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
          </svg>
        </span>

        <!-- maximize -->
        <span class="relative flex h-3.5 w-3.5 items-center justify-center rounded-full bg-green-400">
          <svg t="1780746235425" class=" hidden rotate-90 size-3 group-hover:block" viewBox="0 0 1024 1024"
            version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="12576" width="256" height="256">
            <path
              d="M749.056 230.4l-343.552 1.536c-24.576 0-30.208 14.336-12.8 31.232l368.128 368.128c17.408 17.408 31.232 11.264 31.232-12.8l1.024-343.552c0-24.576-19.968-44.544-44.032-44.544zM263.168 392.192c-17.408-17.408-31.232-11.264-31.232 12.8l-1.024 343.552c0 24.576 19.968 44.032 44.032 44.032l343.552-1.536c24.576 0 30.208-14.336 12.8-31.232L263.168 392.192z"
              p-id="12577" fill="currentColor"></path>
          </svg>
        </span>
      </div>

      <!-- 中间拖拽提示条 -->
      <div class="h-1 w-10 rounded-full bg-gray-300/80 group-hover/bar:bg-gray-400/80 " />

      <!-- 占位，保持中间条居中 -->
      <div class="w-[48px]" />
    </div>

    <!-- 内容 -->
    <div class="h-[calc(100%-32px)] overflow-auto">
      <slot />
    </div>

    <!-- 右下角 resize -->
    <div ref="resizeHandleRef"
      class="absolute right-0 bottom-0 h-6 w-6 cursor-se-resize select-none touch-none text-gray-400 hover:text-gray-600 transition-colors"
      @pointerdown.prevent.stop="onResizePointerDown">
      <svg class="absolute right-1 bottom-1 h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M6 14L14 6M10 14L14 10M14 14H14.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      </svg>
    </div>
  </div>
</template>