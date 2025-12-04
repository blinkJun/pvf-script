<template>
  <el-card shadow="always" :body-style="{ padding: '20px' }">
    <template #header>
      <div>
        <span>删除 A pvf 中在 Bpvf 中有的文件夹</span>
        <p class="tips">
          根据选中的文件判断哪些文件夹是多余的
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
        <el-button type="primary" :loading="loading" @click="onSubmit">删除</el-button>
        <!-- <el-button type="primary" :loading="loading" @click="onSubmit(true)">同步并上架（请确认是礼包）</el-button> -->
      </el-form-item>
    </el-form>
  </el-card>
</template>
<script setup lang="ts">
import { reactive, ref, defineOptions } from 'vue'
import {
  deleteFiles,
  getFolderFiles,
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
  name: '删除文件',
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
    const deleteFileList:string[] = []
    const map:{[propName:string]:number} = {}
    async function checkFile(data:any[]):Promise<any[]>{
      const current = data.slice(0,1)
      const nextData = data.slice(1)
      const res = await Promise.all(
        current.map(async (fileItem) => {
          const folder = fileItem.split('/').slice(0,-1).join('/')
          if(typeof map[folder] === 'undefined'){
            const files = await getFolderFiles(folder, '.ani' , form.bPort)
            map[folder] = files?.length || 0
          }
          if(map[folder] !== 0){
            deleteFileList.push(fileItem)
          }
          return
        }),
      )
      if(nextData.length === 0){
        return []
      }
      return checkFile(nextData)
    }
    async function toDeleteFiles(list:any[]):Promise<void>{
      const current = list.slice(0,50)
      const nextData = list.slice(50)
      await deleteFiles(current, form.aPort)
      if(nextData.length === 0){
        return
      }
      return toDeleteFiles(nextData)
    }

    await checkFile(files)
    await toDeleteFiles(deleteFileList)

    ElNotification({
      title: '提示',
      message: '删除成功',
      duration: 0,
      type: 'success',
    })
    loading.value = false
  } catch (error) {
    console.log(error)
    ElNotification({
      title: '提示',
      message: '删除失败',
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
