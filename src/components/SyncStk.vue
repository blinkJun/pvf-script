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
      <el-form-item label="上架价格">
        <el-input-number v-model="form.price" :min="1" :step="1" :controls="true">
        </el-input-number>
      </el-form-item>
      <el-form-item label="其他选项">
        <el-checkbox
          v-model="form.includeEqu"
          label="同步礼包内的物品（暂时只支持装备）"
        ></el-checkbox>
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
import { getSelectedFiles, filListToLstRows, getFileContent,itemCodesToFileInfos,updateItemContent } from '@/api'
import { matchTagContent, formatTagLine, insertToTagEnd } from '@/helpers/utils'
import { ElNotification } from 'element-plus'
import { putPackages } from '@/hooks/put-package'
defineOptions({
  name: '同步道具',
})
const loading = ref(false)
const form = reactive({
  aPort: 27000,
  bPort: 27001,
  includeEqu: true,
  price:3600
})
const formRules = reactive({})
const formRef = ref(null)
const onSubmit = async (putPackage) => {
  loading.value = true
  // 获取当前勾选的文件
  const files = await getSelectedFiles(form.aPort)
  let isPackage = false
  const itemIds = []
  const itemFiles = []

  try {
    const updateRes = await Promise.all(
      files.map(async (fileItem) => {
        const content = await getFileContent(fileItem)
        if(form.includeEqu){
          const packageContent = matchTagContent(content,'package data')
          if(packageContent){
            isPackage = true
            const itemList = formatTagLine(packageContent)
            itemIds.push(...itemList.map(item=>item[0]))
          }
        }
        return updateItemContent(fileItem, content, form.bPort)
      }),
    )

    if(isPackage){
      const equFileRes = await itemCodesToFileInfos({
        lstNames:itemIds.map(item=>'equipment'),
        ItemCodes:itemIds
      },form.aPort)


      if(equFileRes.Infos){
        console.log(Object.keys(equFileRes.Infos).map(itemCode=>{
          return `${itemCode}\t${equFileRes.Infos[itemCode].FilePath}`
        }).join('\n'))
        itemFiles.push(...Object.values(equFileRes.Infos).map(item=>item.FilePath))
      }

      const updateEquRes = await Promise.all(itemFiles.map(async fileItem=>{
        const content = await getFileContent(fileItem)
        return updateItemContent(fileItem, content, form.bPort)
      }))
    }


    // 获取对应lst
    const listRows = await filListToLstRows([...files,...itemFiles], form.aPort)
    const updateLstRes = await Promise.all(Object.keys(listRows).map(async lstPath=>{
      let lstContent = await getFileContent(lstPath,form.bPort)
      let fileLstContent = ''

      for(let id in listRows[lstPath]){
        const filePath = listRows[lstPath][id]
        fileLstContent += `${id}\t\`${filePath}\`\r\n`
      }
      const newContent = lstContent + fileLstContent
      return updateItemContent(lstPath, newContent, form.bPort)
    }))

    ElNotification({
      title: '提示',
      message: '同步成功',
      duration: 0,
      type:'success'
    })
    setTimeout(async () => {
      if(putPackage&&isPackage){
        await putPackages(files,form.price,form.bPort)
      }
      loading.value = false
    }, 3000);
  } catch (error) {
    console.log(error)
    ElNotification({
      title: '提示',
      message: '同步失败',
      duration: 0,
      type:'error'
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
