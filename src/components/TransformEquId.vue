<template>
  <el-card shadow="always" :body-style="{ padding: '20px' }">
    <template #header>
      <div>
        <span>转换装备ID</span>
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
      <el-form-item>
        <el-button type="primary" @click="onSubmit" :loading="loading" >转换</el-button>
        <p class="tips" >如报错请重载lst后使用</p>
      </el-form-item>
    </el-form>
  </el-card>
</template>
<script setup lang="ts">
import { reactive, ref } from 'vue'
import { getSelectedFiles, getItemsInfo, getFileContent, updateItemContent,itemCodesToFileInfos,getLstFileInfo } from '@/api'
import { matchTagContent, formatTagLine, insertToTagEnd,reverseFormatTagLine } from '@/helpers/utils'
import { transformPackageAndEquId } from '@/hooks/transform-equ-id'
import { ElNotification } from 'element-plus'
const loading = ref(false)
const form = reactive({
  port: 27001,
})
const formRules = reactive({})
const formRef = ref(null)
const onSubmit = async () => {
  loading.value = true
  try {
    // 获取当前勾选的文件
    const files = await getSelectedFiles()
    await transformPackageAndEquId(form.port,files)
    ElNotification({
      title: '提示',
      message: '转换成功',
      duration: 0,
      type:'success'
    })
  } catch (error) {
    ElNotification({
      title: '提示',
      message: '转换成功',
      duration: 0,
      type:'error'
    })
    console.log(error)
  }
  loading.value = false
}
</script>
