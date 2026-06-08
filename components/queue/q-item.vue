<script setup lang="ts">

const props = withDefaults(defineProps<{
  data: QueueListItem
  showSteer?: boolean
}>(), {
  showSteer: true,
})

const emits = defineEmits<{
  guide: [data: QueueListItem]
  del: [data: QueueListItem]
  edit: [data: QueueListItem]
}>()


</script>
<template>
  <div class="flex items-center gap-0.5 h-6">
    <!-- 拖拽手柄 -->
    <div class="drag-handle cursor-move h-full aspect-square flex justify-center items-center">
      <svg t="1780747699040" class="text-[var(--text-tertiary)] shrink-0 size-4" viewBox="0 0 1024 1024" version="1.1"
        xmlns="http://www.w3.org/2000/svg" p-id="26426" width="256" height="256">
        <path
          d="M640 768h64a106.666667 106.666667 0 1 0 0-213.333333H170.666667a42.666667 42.666667 0 0 1 0-85.333334h533.333333a192 192 0 1 1 0 384H640v42.666667a21.333333 21.333333 0 0 1-34.133333 17.066667l-91.008-68.266667a42.666667 42.666667 0 0 1 0-68.266667l91.008-68.266666a21.333333 21.333333 0 0 1 34.133333 17.066666v42.666667zM170.666667 170.666667h682.666666a42.666667 42.666667 0 0 1 0 85.333333H170.666667a42.666667 42.666667 0 1 1 0-85.333333z m213.333333 640a42.666667 42.666667 0 0 1-42.666667 42.666666H170.666667a42.666667 42.666667 0 0 1 0-85.333333h170.666666a42.666667 42.666667 0 0 1 42.666667 42.666667z"
          fill="currentColor" transform="scale(-1,1) translate(-1024,0)" />
      </svg>
    </div>

    <!-- 文本内容 -->
    <p class="truncate flex-1 text-[var(--text-primary)]" :title="data?.content">
      {{ data?.content }}
    </p>

    <!-- 操作按钮组 -->
    <div class="text-[var(--text-tertiary)] flex items-center gap-1 h-full shrink-0 ml-1" @pointerdown.stop>
      <!-- 引导按钮 -->
      <button v-if="showSteer"
        class="h-full aspect-square px-1 hover:bg-[var(--bg-hover)] rounded-md flex justify-center gap-0.5 items-center transition-colors"
        @click="$emit('guide', data)">
        <svg t="1780749895055" class=" size-3.5 " viewBox="0 0 1024 1024" version="1.1"
          xmlns="http://www.w3.org/2000/svg" p-id="29256" width="256" height="256">
          <path
            d="M810.667 213.333a42.667 42.667 0 0 1 42.368 37.675l0.298 4.992v274.304c0 79.275-50.944 147.499-120.49 152.107l-7.51 0.256H273.707l97.792 97.834a42.667 42.667 0 0 1-56.32 63.872l-4.011-3.541-170.667-170.667a42.667 42.667 0 0 1 0-60.33l170.667-170.667a42.667 42.667 0 0 1 63.872 56.32l-3.541 4.01-97.792 97.835h451.626c19.584 0 39.936-24.618 42.411-59.861l0.256-7.168V256a42.667 42.667 0 0 1 42.667-42.667z"
            fill="currentColor" transform="scale(-1,1) translate(-1024,0)" />
        </svg>
        <p class="shrink-0 text-[12px]">Steer</p>
      </button>

      <!-- 删除按钮 -->
      <button
        class="h-full aspect-square hover:bg-[var(--bg-hover)] rounded-md flex justify-center items-center transition-colors"
        @click="$emit('del', data)">
        <svg t="1780749543250" class="size-3.5" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
          p-id="27412" width="256" height="256">
          <path
            d="M160 256h-64a31.168 31.168 0 0 1-23.04-8.96A31.168 31.168 0 0 1 64 224c0-9.344 3.008-17.024 8.96-23.04A31.168 31.168 0 0 1 96 192h256V96c0-9.344 3.008-17.024 8.96-23.04A31.168 31.168 0 0 1 384 64h256c9.344 0 17.024 3.008 23.04 8.96 5.952 6.016 8.96 13.696 8.96 23.04V192h256c9.344 0 17.024 3.008 23.04 8.96 5.952 6.016 8.96 13.696 8.96 23.04a31.168 31.168 0 0 1-8.96 23.04 31.168 31.168 0 0 1-23.04 8.96h-64v672a31.168 31.168 0 0 1-8.96 23.04 31.168 31.168 0 0 1-23.04 8.96H192a31.168 31.168 0 0 1-23.04-8.96 31.168 31.168 0 0 1-8.96-23.04V256z m448-64V128h-192v64h192z m-384 704h576V256h-576v640z m192-128a31.168 31.168 0 0 1-23.04-8.96 31.168 31.168 0 0 1-8.96-23.04v-320c0-9.344 3.008-17.024 8.96-23.04A31.168 31.168 0 0 1 416 384c9.344 0 17.024 3.008 23.04 8.96 5.952 6.016 8.96 13.696 8.96 23.04v320a31.168 31.168 0 0 1-8.96 23.04 31.168 31.168 0 0 1-23.04 8.96z m192 0a31.168 31.168 0 0 1-23.04-8.96 31.168 31.168 0 0 1-8.96-23.04v-320c0-9.344 3.008-17.024 8.96-23.04A31.168 31.168 0 0 1 608 384c9.344 0 17.024 3.008 23.04 8.96 5.952 6.016 8.96 13.696 8.96 23.04v320a31.168 31.168 0 0 1-8.96 23.04 31.168 31.168 0 0 1-23.04 8.96z"
            fill="currentColor" p-id="27413"></path>
        </svg>
      </button>

      <!-- 编辑按钮 -->
      <button
        class="h-full aspect-square hover:bg-[var(--bg-hover)] rounded-md flex justify-center items-center transition-colors"
        @click="$emit('edit', data)">
        <svg t="1780750700013" class="size-3.5" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
          p-id="30254" width="256" height="256">
          <path
            d="M257.728 752a40.448 40.448 0 0 0 5.952-0.512l168.192-29.44a9.792 9.792 0 0 0 5.312-2.816l423.936-423.936c3.84-3.84 3.84-10.24 0-14.08l-166.208-166.336a9.92 9.92 0 0 0-7.104-2.88 9.92 9.92 0 0 0-7.104 2.88L256.832 538.88a10.176 10.176 0 0 0-2.816 5.312l-29.504 168.192a33.92 33.92 0 0 0 33.216 39.68zM325.12 577.6l362.688-362.624 73.28 73.344-362.688 362.56-88.96 15.744 15.68-89.024z m554.88 258.368H144a32 32 0 0 0-32 32v36.032c0 4.416 3.584 8 8 8h784a8 8 0 0 0 8-8v-36.032a32 32 0 0 0-32-32z"
            fill="currentColor" p-id="30255"></path>
        </svg>
      </button>
    </div>
  </div>
</template>
