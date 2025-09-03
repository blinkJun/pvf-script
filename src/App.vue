<script setup lang="ts">
import { reactive, ref } from 'vue'
import { getSelectedFiles, getItemsInfo, getFileContent, updateItemContent } from '@/api'
import { matchTagContent, formatTagLine, insertToTagEnd } from '@/helpers/utils'
import { ElMessage } from 'element-plus'

const form = reactive({
  price: 3600,
})
const formRules = reactive({})
const formRef = ref(null)
const onSubmit = async () => {
  // 获取当前勾选的文件
  const files = await getSelectedFiles()
  // 获取对应文件名
  const parsedFiles = await getItemsInfo(files)
  const storeContent = await getFileContent('etc/newcashshop.etc')
  const packageList = formatTagLine(matchTagContent(storeContent, 'package'))
  const appendPackageList: any[] = []
  let latestIndex = Number(packageList[packageList.length - 1][0])
  Object.values(parsedFiles).forEach((fileItem) => {
    const exist = packageList.find(([index, id]) => {
      return Number(id) === fileItem.ItemCode
    })
    if (exist) {
      ElMessage.info(`${fileItem.ItemName} 已存在`)
    } else {
      latestIndex++
      appendPackageList.push([
        String(latestIndex),
        fileItem.ItemCode,
        0,
        0,
        form.price,
        `\`${fileItem.ItemName}\``,
        0,
        0,
        -1,
        -1,
      ])
    }
  })
  if (appendPackageList.length > 0) {
    const newPackageTagContent = insertToTagEnd(
      storeContent,
      'package',
      `\t${appendPackageList
        .map((item) => {
          return item.join('\t')
        })
        .join('\r\n\t')}`,
    )
    const success = await updateItemContent('etc/newcashshop.etc', newPackageTagContent)
    if (success) {
      ElMessage.success('上架成功！')
    } else {
      ElMessage.error('上架失败！')
    }
  } else {
    ElMessage.warning('无匹配到的新礼包')
  }
}
</script>

<template>
  <el-form
    ref="formRef"
    :model="form"
    :rules="formRules"
    label-width="80px"
    :inline="false"
    size="default"
  >
    <el-form-item label="价格">
      <el-input-number v-model="form.price" :min="1" :step="1" :controls="true"> </el-input-number>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="onSubmit">上架选中礼包</el-button>
    </el-form-item>
  </el-form>
</template>

<style scoped></style>
