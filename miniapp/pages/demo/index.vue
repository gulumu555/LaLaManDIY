<template>
  <view class="" style="margin-top: 12vh">
    <button @click="handleOpen">开启</button>
  </view>
  <LoadingOverlay ref="loadingOverlay" v-model:visible="loading" />
</template>

<script lang="ts">
import LoadingOverlay from "@/components/LoadingOverlay.vue";
export default {
  components: {
    LoadingOverlay,
  },
  data() {
    return {
      loading: false,
    };
  },
  onLoad() {},
  methods: {
    handleOpen() {
      this.loading = true;
      // 等待5秒
      setTimeout(async () => {
        const res = await this.$refs.loadingOverlay.complete();
        console.log("this.$refs.loadingOverlay+++", res);
      }, 3000);
    },
  },
};
</script>

<style lang="less" scoped></style>
