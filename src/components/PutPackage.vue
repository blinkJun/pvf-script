<template>
  <el-card shadow="always" :body-style="{ padding: '20px' }">
    <template #header>
      <div>
        <span>上架选中礼包</span>
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
        <el-button type="primary" @click="onSubmit">上架选中礼包</el-button>
        <p class="tips" >请重载lst后使用</p>
      </el-form-item>
    </el-form>
  </el-card>
</template>
<script setup lang="ts">
import { reactive, ref } from 'vue'
import { getSelectedFiles, getItemsInfo, getFileContent, updateItemContent } from '@/api'
import { matchTagContent, formatTagLine, insertToTagEnd } from '@/helpers/utils'
import { putPackages } from '@/hooks/put-package'
const loading = ref(false)
const form = reactive({
  price: 3600,
  port: 27000,
})
const formRules = reactive({})
const formRef = ref(null)
const onSubmit = async () => {
  loading.value = true
  try {
    // 获取当前勾选的文件
    const files = await getSelectedFiles()
    // 获取对应文件名
    await putPackages(files, form.price, form.port)
    ElNotification({
      title: '提示',
      message: '上架成功',
      duration: 0,
      type:'success'
    })
  } catch (error) {
    console.log(error)
    ElNotification({
      title: '提示',
      message: '上架成功',
      duration: 0,
      type:'error'
    })
  }
  loading.value = false
}
</script>
