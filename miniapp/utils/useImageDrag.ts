import { ref, computed } from 'vue'

export function useImageDrag() {
	const imageX = ref(0)
	const imageY = ref(0)

	let startX = 0
	let startY = 0
	let lastX = 0
	let lastY = 0

	const imageStyle = computed(() => {
		return `transform: translate(${imageX.value}px, ${imageY.value}px) scale(1);`
	})

	function onTouchStart(e : TouchEvent | any) {
		const touch = e.touches[0]
		startX = touch.clientX
		startY = touch.clientY
	}

	function onTouchMove(e : TouchEvent | any) {
		const touch = e.touches[0]
		const deltaX = touch.clientX - startX
		const deltaY = touch.clientY - startY

		imageX.value = lastX + deltaX
		imageY.value = lastY + deltaY
	}

	function onTouchEnd() {
		lastX = imageX.value
		lastY = imageY.value
	}

	return {
		imageX,
		imageY,
		imageStyle,
		onTouchStart,
		onTouchMove,
		onTouchEnd
	}
}