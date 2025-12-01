<template>
  <el-card shadow="always" :body-style="{ padding: '20px' }">
    <template #header>
      <div>
        <span>同步勾选的文件 A 到 B</span>
        <p class="tips">
          纯粹的同步文件，不会有其他操作。
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
      <el-form-item label="资源管理器" label-width="120px" >
        <el-radio-group v-model="form.resType" @change="">
          <el-radio v-for="item in resTypeList" :key="item.value" :label="item.value">
            {{item.label}}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="onSubmit">同步</el-button>
        <!-- <el-button type="primary" :loading="loading" @click="onSubmit(true)">同步并上架（请确认是礼包）</el-button> -->
      </el-form-item>
    </el-form>
  </el-card>
</template>
<script setup lang="ts">
import { reactive, ref, defineOptions } from 'vue'
import {
  getSelectedFiles,
  filListToLstRows,
  getFileContent,
  itemCodesToFileInfos,
  updateItemContent,
  updateItemContentBatch,
  getSelectedFilesBySearchResult
} from '@/api'
import { matchTagContent, formatTagLine, insertToTagEnd } from '@/helpers/utils'
import { ElNotification } from 'element-plus'
import { putPackages } from '@/hooks/put-package'
import { transformPackageAndEquId } from '@/hooks/transform-equ-id'
defineOptions({
  name: '同步文件',
})
const resTypeList = [
  {
    label:'左侧资源管理器',
    value:'default'
  },
  {
    label:'右侧搜索资源管理器',
    value:'search'
  },
]
const loading = ref(false)
const form = reactive({
  aPort: 27000,
  bPort: 27001,
  resType:'default'
})
const formRules = reactive({})
const formRef = ref(null)
const onSubmit = async (putPackage: boolean) => {
  loading.value = true
  // 获取当前勾选的文件
  // 获取当前勾选的文件
  let files:string[] = []
  if(form.resType === 'default'){
    files = await getSelectedFiles()
  }else if(form.resType === 'search'){
    files = await getSelectedFilesBySearchResult()
  }

  try {
    const updateData:any[] = []

    async function getData(data:any[]):Promise<any[]>{
      const current = data.slice(0,50)
      const nextData = data.slice(50)
      const res = await Promise.all(
        current.map(async (fileItem) => {
          let content = await getFileContent(fileItem, form.aPort)
          return {
            FilePath: fileItem,
            FileContent: content,
          }
        }),
      )
      updateData.push(...res.filter(item=>item.FileContent))
      if(nextData.length === 0){
        return []
      }
      return getData(nextData)
    }
    async function update(list:any[]):Promise<void>{
      const current = list.slice(0,50)
      const nextData = list.slice(50)
      await updateItemContentBatch(current, form.bPort)
      if(nextData.length === 0){
        return
      }
      return update(nextData)
    }

    await getData(files)
    await update(updateData)

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
}
</script>
<style scoped>
.el-card {
  width: 600px;
}
</style>
