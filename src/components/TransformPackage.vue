<template>
  <el-card shadow="always" :body-style="{ padding: '20px' }">
    <template #header>
      <div>
        <span>将多选礼包转换为单个礼包（A pvf 到 B pvf）</span>
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
      <el-form-item label="起始文件名（递增）" label-width="150" prop="fileNameIndex">
        <el-input-number
          v-model="form.fileNameIndex"
          :min="1"
          :step="1"
          :controls="true"
          style="width: 200px"
        >
        </el-input-number>
      </el-form-item>
      <el-form-item label="指定路径" prop="newFilePath">
        <el-input
          v-model="form.newFilePath"
          placeholder="输入指定路径，无则使用选中礼包路径，如：cash"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item>
        <p class="tips">只支持时装</p>
        <el-button type="primary" @click="onSubmit" :loading="loading">转换勾选礼包</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>
<script setup lang="ts">
import { ElNotification } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { reactive, ref } from 'vue'
import { getSelectedFiles, getItemsInfo, getFileContent, updateItemContent } from '@/api'
import { matchTagContent, formatTagLine, insertToTagEnd } from '@/helpers/utils'
import { transformPackage } from '@/hooks/transform-package'
const loading = ref(false)
const form = reactive({
  port: 27000,
  fileNameIndex: null,
  newFilePath: '',
})
const formRules = reactive({
  fileNameIndex: [{ required: true, message: '请输入起始文件名' }],
})
const formRef = ref<FormInstance>()
const onSubmit = async () => {
  loading.value = true
  try {
    await formRef.value?.validate()
    // 获取当前勾选的文件
    const files = await getSelectedFiles(form.port)
    const allNewFile: any[] = []
    await Promise.all(
      files.map(async (item) => {
        const parseFiles = await transformPackage(item, form.port)
        const basePath = item.split('/').slice(1, -1).join('/')
        console.log(parseFiles)
        parseFiles.forEach((fileContent, index) => {
          const fileId = (form.fileNameIndex || 0) + allNewFile.length
          const newPath = `${form.newFilePath || basePath}/${fileId}.stk`
          updateItemContent(`stackable/${newPath}`, fileContent, form.port)
          allNewFile.push({
            id: fileId,
            newPath,
          })
        })
      }),
    )
    const lstPath = 'stackable/stackable.lst'
    let lstContent = await getFileContent(lstPath, form.port)
    let fileLstContent = ''

    for (let fileItem of allNewFile) {
      fileLstContent += `${fileItem.id}\t\`${fileItem.newPath}\`\r\n`
    }
    const newContent = lstContent + fileLstContent
    await updateItemContent(lstPath, newContent, form.port)
    ElNotification({
      title: '提示',
      message: '同步成功',
      duration: 0,
      type: 'success',
    })
    loading.value = false
  } catch (error) {
    console.log(error)
    ElNotification({
      title: '提示',
      message: '同步失败',
      duration: 0,
      type: 'error',
    })
    loading.value = false
  }
  loading.value = false
}
</script>
<style scoped>
.el-card {
  width: 600px;
}
</style>
