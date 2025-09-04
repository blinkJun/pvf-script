import { getItemsInfo, getFileContent, updateItemContent } from '@/api'
import { formatTagLine, matchTagContent, insertToTagEnd } from '@/helpers/utils'
import { ElNotification } from 'element-plus'
export async function putPackages(files: string[], price: number, port: number) {
  // 获取对应文件名
  const parsedFiles = await getItemsInfo(files,port)
  const storeContent = await getFileContent('etc/newcashshop.etc',port)
  const packageList = formatTagLine(matchTagContent(storeContent, 'package'))
  const appendPackageList: any[] = []
  let latestIndex = Number(packageList[packageList.length - 1][0])

  Object.values(parsedFiles).forEach((fileItem) => {
    const exist = packageList.find(([index, id]) => {
      return Number(id) === fileItem.ItemCode
    })
    if (exist) {
      console.log(`${fileItem.ItemName} 已存在`)
    } else {
      latestIndex++
      appendPackageList.push([
        String(latestIndex),
        fileItem.ItemCode,
        0,
        0,
        price,
        `\`${fileItem.ItemName}\``,
        0,
        0,
        -1,
        -1,
      ])
    }
  })
  console.log(appendPackageList)
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
    const success = await updateItemContent('etc/newcashshop.etc', newPackageTagContent, port)
    if (success) {
      ElNotification({
        title: '提示',
        message: '上架成功',
        duration: 0,
        type:'success'
      })
    } else {
      ElNotification({
        title: '提示',
        message: '上架失败',
        duration: 0,
        type:'error'
      })
    }
  } else {
    ElNotification({
      title: '提示',
      message: '无匹配到的新礼包',
      duration: 0,
      type:'warning'
    })
  }
}
