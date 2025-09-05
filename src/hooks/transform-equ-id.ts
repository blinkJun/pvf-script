import { getSelectedFiles, getItemsInfo, getFileContent, updateItemContent,itemCodesToFileInfos,getLstFileInfo } from '@/api'
import { matchTagContent, formatTagLine, insertToTagEnd,reverseFormatTagLine } from '@/helpers/utils'
import { ElNotification } from 'element-plus'
export function transformEquId(id:string){
  let newId = id
  if(id.length === 9&&id.startsWith('40')){
    newId = `60${id.slice(2)}`
  }
  return Number(newId)
}

export async function transformPackageAndEquId(port:number,paths:string[]){
  let isPackage = false
  const itemIds:number[] = []
  // 获取当前勾选的文件
  const files = await getSelectedFiles()
  const updateRes = await Promise.all(
    files.map(async (fileItem) => {
      let content = await getFileContent(fileItem)
      const packageContent = matchTagContent(content,'package data')
      if(packageContent){
        isPackage = true
        const itemList = formatTagLine(packageContent)
        itemIds.push(...itemList.map(item=>{
          return Number(item[0])
        }))
        const transformIdItemList = itemList.map(([id,count])=>{
          return ['\t',String(transformEquId(id)),count]
        })
        const newContent = reverseFormatTagLine(transformIdItemList)
        content = insertToTagEnd(content,'package data',`\r\n${newContent}`,false)
        return updateItemContent(fileItem, content, port)
      }else{
        const parsedFiles = await getItemsInfo(files,port)
        itemIds.push(...parsedFiles.map(fileItem=>fileItem.ItemCode))
      }
    }),
  )

  let equLstContent = await getFileContent('equipment/equipment.lst')
  const equLstList = formatTagLine(equLstContent)
  itemIds.forEach(id=>{
    const newId = String(transformEquId(String(id)))
    const index = equLstList.findIndex(lstLine=>{
      return lstLine[0] === String(id)
    })
    if(index!==-1){
      equLstList[index][0] = newId
    }else{
      console.log(`找不到装备：${id}`)
    }
  })
  equLstContent = reverseFormatTagLine(equLstList)
  const success = await updateItemContent('equipment/equipment.lst', equLstContent, port)
}
