// useBottomRightResizableDrag.ts
import { computed, nextTick, onBeforeUnmount, ref, type Ref } from "vue";
import { useWindowSize } from "@vueuse/core";

export function useBottomRightResizableDrag(
  containerRef: Ref<HTMLElement | null>,
  handleRef: Ref<HTMLElement | null>,
  gap = 8,
) {
  const { width: windowWidth, height: windowHeight } = useWindowSize();

  const width = ref(100);
  const height = ref(200);

  let resizing = false;
  let startX = 0;
  let startY = 0;
  let startWidth = 0;
  let startHeight = 0;

  const clampSize = () => {
    width.value = Math.min(Math.max(width.value, 50), windowWidth.value - gap);
    height.value = Math.min(
      Math.max(height.value, 50),
      windowHeight.value - gap,
    );
  };

  async function init() {
    await nextTick();
    const rect = containerRef.value?.getBoundingClientRect();
    if (rect) {
      width.value = rect.width;
      height.value = rect.height;
    }
    clampSize();
  }

  function onPointerDown(e: PointerEvent) {
    resizing = true;
    startX = e.clientX;
    startY = e.clientY;
    startWidth = width.value;
    startHeight = height.value;

    handleRef.value?.setPointerCapture(e.pointerId);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  }

  function onPointerMove(e: PointerEvent) {
    if (!resizing) return;
    width.value = startWidth + (e.clientX - startX);
    height.value = startHeight + (e.clientY - startY);
    clampSize();
  }

  function onPointerUp() {
    resizing = false;
    clampSize();
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
  }

  onBeforeUnmount(() => {
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
  });

  const style = computed(() => ({
    width: `${width.value}px`,
    height: `${height.value}px`,
  }));

  return { width, height, style, init, onPointerDown };
}
