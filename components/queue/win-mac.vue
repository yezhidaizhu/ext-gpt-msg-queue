<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, StyleValue, watch } from 'vue'
import { useElementSize, useWindowSize } from '@vueuse/core'
import { debounce, throttle } from 'lodash-es'

const props = withDefaults(defineProps<{
  maxWinStyle?: StyleValue,
  initPos?: {
    right: number,
    bottom: number,
    width: number,
    height: number,
  }
}>(), {
})

const emits = defineEmits(['chg-pos', 'close-win', 'mini-win', 'max-win']);

const isMaxWin = defineModel('isMaxWin', { default: false });

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

const width = ref<number>(420)
const height = ref<number>(240)

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

  right.value = right.value ?? GAP
  bottom.value = bottom.value ?? GAP

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
  if (props.initPos) {
    right.value = props.initPos.right;
    bottom.value = props.initPos.bottom;
    width.value = props.initPos.width;
    height.value = props.initPos.height;
  };
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

const onToggleMaxWin = () => {
  isMaxWin.value = !isMaxWin.value;
  emits('max-win', isMaxWin);
}

const style = computed(() => {
  if (isMaxWin.value && props.maxWinStyle) {
    return props.maxWinStyle
  };

  return ({
    right: `${right.value}px`,
    bottom: `${bottom.value}px`,
    width: width.value === undefined ? undefined : `${width.value}px`,
    height: height.value === undefined ? undefined : `${height.value}px`,
  })
});

const afterChgWinPos = debounce(() => {
  emits('chg-pos', {
    right: right.value,
    bottom: bottom.value,
    width: width.value,
    height: height.value,
  });
}, 200);

watch([width, height, right, bottom], () => {
  afterChgWinPos()
})
</script>

<template>
  <div ref="containerRef" :style="style"
    class="fixed flex flex-col rounded-xl border border-gray-100 bg-white shadow-lg ">
    <!-- mac 风格头部，可拖拽 -->
    <div ref="dragHandleRef"
      class="group/bar relative shrink-0 flex items-center justify-center h-6 px-2 border-b border-gray-100 select-none touch-none"
      :class="isMaxWin ? '' : 'cursor-move'" @pointerdown.prevent="onDragPointerDown">
      <!-- 左上角按钮 -->
      <div class=" absolute left-2 flex group items-center gap-1.5 cursor-auto " style="--btn-size:15px"
        @pointerdown.stop>
        <!-- close -->
        <span class="relative flex size-[var(--btn-size)] items-center justify-center rounded-full bg-red-400"
          @click="$emit('close-win')">
          <svg t="1780761005040" class="hidden size-2.5  group-hover:block" viewBox="0 0 1024 1024" version="1.1"
            xmlns="http://www.w3.org/2000/svg" p-id="18787" width="256" height="256">
            <path
              d="M602.5 512L941 173.4c25-25 25-65.5 0-90.5s-65.5-25-90.5 0L512 421.5 173.4 83c-25-25-65.5-25-90.5 0s-25 65.5 0 90.5L421.5 512 83 850.6c-25 25-25 65.5 0 90.5 12.5 12.5 28.9 18.7 45.2 18.7s32.7-6.2 45.2-18.7L512 602.5 850.6 941c25 25 65.5 25 90.5 0 12.5-12.5 18.7-28.9 18.7-45.2s-6.2-32.7-18.7-45.2L602.5 512z"
              p-id="18788"></path>
          </svg>
        </span>

        <!-- minimize -->
        <span class="relative flex size-[var(--btn-size)] items-center justify-center rounded-full bg-yellow-400"
          @click="$emit('mini-win')">
          <svg class="hidden size-3  group-hover:block" viewBox="0 0 8 8" fill="none" aria-hidden="true">
            <path d="M1.5 4H6.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
          </svg>
        </span>

        <!-- maximize -->
        <span class="relative flex size-[var(--btn-size)] items-center justify-center rounded-full bg-green-400"
          @click="onToggleMaxWin">
          <svg v-if="!isMaxWin" t="1780746235425" class=" hidden rotate-90 size-4 group-hover:block"
            viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="12576" width="256"
            height="256">
            <path
              d="M749.056 230.4l-343.552 1.536c-24.576 0-30.208 14.336-12.8 31.232l368.128 368.128c17.408 17.408 31.232 11.264 31.232-12.8l1.024-343.552c0-24.576-19.968-44.544-44.032-44.544zM263.168 392.192c-17.408-17.408-31.232-11.264-31.232 12.8l-1.024 343.552c0 24.576 19.968 44.032 44.032 44.032l343.552-1.536c24.576 0 30.208-14.336 12.8-31.232L263.168 392.192z"
              p-id="12577" fill="currentColor"></path>
          </svg>

          <svg v-else t="1780756429128" class=" hidden rotate-90 size-3 group-hover:block " viewBox="0 0 1024 1024"
            version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8380" width="256" height="256">
            <path
              d="M447.914667 533.546667a42.666667 42.666667 0 0 1 42.368 37.674666l0.298666 4.992v320.170667a42.666667 42.666667 0 0 1-85.034666 4.949333l-0.298667-4.949333v-217.344l-247.04 247.125333a42.666667 42.666667 0 0 1-56.32 3.541334l-4.053333-3.541334a42.666667 42.666667 0 0 1-3.541334-56.32l3.541334-4.010666 246.954666-246.997334H127.872a42.666667 42.666667 0 0 1-4.992-85.034666l4.992-0.256h320.042667zM576 85.290667a42.666667 42.666667 0 0 1 42.368 37.717333l0.298667 4.949333v217.045334l247.210666-247.168a42.666667 42.666667 0 0 1 56.32-3.541334l4.010667 3.541334a42.666667 42.666667 0 0 1 3.541333 56.32l-3.541333 4.010666-247.296 247.253334 217.173333 0.042666a42.666667 42.666667 0 0 1 4.949334 85.077334l-4.949334 0.256h-320.085333a42.666667 42.666667 0 0 1-42.368-37.674667l-0.298667-4.992V128a42.666667 42.666667 0 0 1 42.666667-42.666667z"
              fill="currentColor"></path>
          </svg>
        </span>
      </div>

      <!-- 中间拖拽提示条 -->
      <div v-show="!isMaxWin" class="h-1 w-10 rounded-full bg-gray-300/80 group-hover/bar:bg-gray-400/80 " />
    </div>

    <!-- 内容 -->
    <div class=" flex-1 min-h-0 ">
      <slot />
    </div>

    <!-- 右下角 resize -->
    <div ref="resizeHandleRef" v-show="!isMaxWin"
      class="absolute right-0 bottom-0 h-6 w-6 cursor-se-resize select-none touch-none text-gray-400 hover:text-gray-600 transition-colors"
      @pointerdown.prevent.stop="onResizePointerDown">
      <svg class="absolute right-1 bottom-1 h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M6 14L14 6M10 14L14 10M14 14H14.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      </svg>
    </div>
  </div>
</template>
