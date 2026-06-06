<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useElementSize, useWindowSize } from '@vueuse/core'
import { throttle } from 'lodash-es'
import { useBottomRightResizableDrag } from '@/hooks/useFixedDragResize'

const containerRef = useTemplateRef<HTMLElement>('containerRef')
const handleRef = useTemplateRef<HTMLElement>('handleRef')

const { width, height } = useElementSize(containerRef)
const { width: windowWidth, height: windowHeight } = useWindowSize()

const GAP = 8
const THROTTLE_WAIT = 16

const right = ref(GAP)
const bottom = ref(GAP)
const initialized = ref(false)

let dragging = false
let startClientX = 0
let startClientY = 0
let startRight = 0
let startBottom = 0

function clampValue(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function clamp() {
  const maxRight = Math.max(0, windowWidth.value - width.value)
  const maxBottom = Math.max(0, windowHeight.value - height.value)

  right.value = clampValue(right.value, 0, maxRight)
  bottom.value = clampValue(bottom.value, 0, maxBottom)
}

async function initPosition() {
  await nextTick()

  if (!containerRef.value) return
  if (!windowWidth.value || !windowHeight.value) return
  if (!width.value || !height.value) return

  right.value = GAP
  bottom.value = GAP
  initialized.value = true

  clamp()
}

const onPointerMove = throttle((e: PointerEvent) => {
  if (!dragging) return

  right.value = startRight - (e.clientX - startClientX)
  bottom.value = startBottom - (e.clientY - startClientY)

  clamp()
}, THROTTLE_WAIT, {
  leading: true,
  trailing: true,
})

function onPointerDown(e: PointerEvent) {
  dragging = true

  startClientX = e.clientX
  startClientY = e.clientY
  startRight = right.value
  startBottom = bottom.value

  handleRef.value?.setPointerCapture(e.pointerId)

  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
}

function onPointerUp() {
  dragging = false

  onPointerMove.flush()
  clamp()

  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
}

onMounted(() => {
  initPosition()
})

watch([width, height, windowWidth, windowHeight], () => {
  if (!initialized.value) {
    initPosition()
    return
  }

  clamp()
})

const style = computed(() => ({
  right: `${right.value}px`,
  bottom: `${bottom.value}px`,
}))

const { style: stylex, init, onPointerDown: onResizePointerDown } = useBottomRightResizableDrag(containerRef, handleRef)

onMounted(() => {
  init()
})

</script>

<template>
  <div ref="containerRef" :style="{ ...style, ...stylex }"
    class="fixed rounded-lg bg-green-100 shadow-light-800 w-[100px] h-[200px]">
    <div ref="handleRef" class="h-10 w-10 bg-red-500 cursor-move select-none touch-none"
      @pointerdown.prevent="onPointerDown" />

    {{ style }}

    <div ref="handleRef" class="absolute right-0 bottom-0 h-6 w-6 bg-blue-500 cursor-se-resize"
      @pointerdown.prevent.stop="onResizePointerDown" />
  </div>
</template>
