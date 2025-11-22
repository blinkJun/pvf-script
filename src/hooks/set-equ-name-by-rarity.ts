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
  getEquTypeName,
  getEquRarityName
} from '@/helpers/utils'
import { ElNotification } from 'element-plus'

export async function setEquNameByRarity(port: number, files: string[]) {
  const updateEquData = await Promise.all(
    files.map(async (fileItem) => {
      let content = await getFileContent(fileItem, port)
      const rarityLabel = getEquRarityName(content)
      const typeLabel = getEquTypeName(content)
      const newName = `${rarityLabel}${typeLabel}时装`
      const newContent = replaceOneTagContent(content,'name',newName)
      return {
        FilePath: fileItem,
        FileContent: newContent
      }
    }),
  )
  await updateItemContentBatch(updateEquData, port)
}
