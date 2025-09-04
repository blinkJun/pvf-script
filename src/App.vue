<script setup>
import { defineAsyncComponent } from 'vue'

const components = {}
const modules = import.meta.glob('./components/*.vue')
for (const path in modules) {
  const componentName = path.replace(/^\.\/components\/(.*)\.vue$/, '$1')
  components[componentName] = defineAsyncComponent(modules[path])
}
</script>

<template>
  <component v-for="item in components" :is="item"></component>
</template>

<style>
.el-card {
  width: 400px;
  margin-bottom: 20px;
}
.tips{
  width:100%;
  color:gray;
  font-size:12px;
  display:block;
  margin:5px 0 0 0;
}
</style>
