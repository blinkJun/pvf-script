import {
  getSelectedFiles,
  getItemsInfo,
  getFileContent,
  updateItemContent,
  updateItemContentBatch,
  itemCodesToFileInfos,
  getLstFileInfo,
} from '@/api'
import {
  matchTagContent,
  formatTagLine,
  insertToTagEnd,
  reverseFormatTagLine,
  extractSecondLineValues,
  replaceOneTagContent,
  getEquTypeName
} from '@/helpers/utils'
import { ElNotification } from 'element-plus'

export async function setEquNameByPackage(port: number, files: string[]) {
  let isPackage = false
  const itemIds: number[] = []
  // 获取当前勾选的文件
  const itemFiles: { filePath: string; packageName: string }[] = []
  await Promise.all(
    files.map(async (fileItem) => {
      let content = await getFileContent(fileItem, port)
      const packageContent = matchTagContent(content, 'package data')
      if (packageContent) {
        isPackage = true
        const itemList = formatTagLine(packageContent)
        itemIds.push(
          ...itemList.map((item) => {
            return Number(item[0])
          }),
        )
        const equFileRes = await itemCodesToFileInfos(
          {
            lstNames: itemIds.map((item) => 'equipment'),
            ItemCodes: itemIds,
          },
          port,
        )
        if (equFileRes.Infos) {
          itemFiles.push(
            ...Object.values(equFileRes.Infos).map((item: any) => {
              return {
                filePath: item.FilePath as string,
                packageName: extractSecondLineValues(content, '[name]') as string,
              }
            }),
          )
        }
      }
    }),
  )
  const updateEquData = await Promise.all(
    itemFiles.map(async (fileItem) => {
      const content = await getFileContent(fileItem.filePath, port)
      let packageName = fileItem.packageName.trim().slice(1,-1)
      if(packageName.endsWith('礼包')){
        packageName = packageName.slice(0,-2)
      }
      if(packageName.endsWith('套装')){
        packageName = packageName.slice(0,-2)
      }
      const newName = `${packageName}${getEquTypeName(content) || ''}`
      const newContent = replaceOneTagContent(content,'name',newName)
      return {
        FilePath: fileItem.filePath,
        FileContent: newContent
      }
    }),
  )
  await updateItemContentBatch(updateEquData, port)
}
