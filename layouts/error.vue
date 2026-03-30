<template>
  <div class="container">
    <h1 v-if="error.statusCode === 500">服务器错误</h1>
    <h1 v-else>发生错误</h1>
    <NuxtLink to="/">返回首页</NuxtLink>
  </div>
</template>

<script>
export default {
  props: ["error"],
  layout: "empty", // 使用一个简单的布局
};
</script>
