<template>
  <el-card shadow="always" :body-style="{ padding: '20px', width: '450px' }">
    <template #header>
      <div>
        <span>上架选中礼包</span>
        <p class="tips">
          将选中的礼包按此价格上架到商城，如果这些礼包是通过同步的方式过来的，请记得刷新并保存对应lst，不然可能识别不到正确的ID
        </p>
      </div>
    </template>
    <el-form
      ref="formRef"
      :model="form"
      :rules="formRules"
      label-width="80px"
      :inline="false"
      size="default"
    >
      <el-form-item label="端口">
        <el-input-number v-model="form.port" :min="1" :step="1" :controls="true"> </el-input-number>
      </el-form-item>
      <el-form-item label="价格">
        <el-input-number v-model="form.price" :min="1" :step="1" :controls="true">
        </el-input-number>
      </el-form-item>
      <el-form-item>
        <el-button type="default" @click="sortStorePackage" :loading="loading">
          排序商城礼包
        </el-button>
        <el-button type="primary" @click="onSubmit" :loading="loading">上架选中礼包</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>
<script setup lang="ts">
import { reactive, ref } from 'vue'
import { getSelectedFiles, getItemsInfo, getFileContent, updateItemContent } from '@/api'
import { matchTagContent, formatTagLine, insertToTagEnd } from '@/helpers/utils'
import { putPackages, sortStorePackages } from '@/hooks/put-package'
const loading = ref(false)
const form = reactive({
  price: 3600,
  port: 27001,
})
const formRules = reactive({})
const formRef = ref(null)
const onSubmit = async () => {
  loading.value = true
  try {
    // 获取当前勾选的文件
    const files = await getSelectedFiles(form.port)
    // 获取对应文件名
    await putPackages(files, form.price, form.port)
  } catch (error) {
    console.log(error)
  }
  loading.value = false
}
const sortStorePackage = async () => {
  loading.value = true
  try {
    await sortStorePackages(form.port)
  } catch (error) {
    console.log(error)
  }
  loading.value = false
}
</script>
