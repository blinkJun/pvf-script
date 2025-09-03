<template>
  <el-card shadow="always" :body-style="{ padding: '20px' }">
    <template #header>
      <div>
        <span>同步勾选的文件 A 到 B</span>
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
      <el-row :gutter="20">
        <el-col :span="12" :offset="0">
          <el-form-item label="pvf">A</el-form-item>
          <el-form-item label="端口">
            <el-input-number v-model="form.aPort" :min="1" :step="1" :controls="true">
            </el-input-number>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="pvf">B</el-form-item>
          <el-form-item label="端口">
            <el-input-number v-model="form.bPort" :min="1" :step="1" :controls="true">
            </el-input-number>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="其他选项">
        <el-checkbox
          v-model="form.includeEqu"
          label="同步礼包内的物品（暂时只支持装备）"
        ></el-checkbox>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">同步</el-button>
        <el-button type="primary" @click="onSubmit">同步并上架（请确认是礼包）</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>
<script setup lang="ts">
import { reactive, ref, defineOptions } from 'vue'
import { getSelectedFiles, filListToLstRows, getFileContent, updateItemContent } from '@/api'
import { matchTagContent, formatTagLine, insertToTagEnd } from '@/helpers/utils'
import { ElMessage } from 'element-plus'
defineOptions({
  name: '同步道具',
})
const form = reactive({
  aPort: 27000,
  bPort: 27001,
  includeEqu: true,
})
const formRules = reactive({})
const formRef = ref(null)
const onSubmit = async () => {
  // 获取当前勾选的文件
  const files = await getSelectedFiles(form.aPort)
  console.log(files)
  // 获取对应lst
  const listRows = await filListToLstRows(files, form.aPort)
  try {
    await Promise.all(
      files.map(async (fileItem) => {
        const content = await getFileContent(fileItem)
        const success = await updateItemContent(fileItem, content, form.bPort)
      }),
    )

    // listRows
    ElMessage.success('同步成功！')
  } catch (error) {
    console.log(error)
    ElMessage.error('同步失败！')
  }
}
</script>
<style scoped>
.el-card {
  width: 600px;
}
</style>
