import { getItemsInfo, getFileContent, updateItemContent } from '@/api'
import { extractSecondLineValues, getUsableJob, matchTagContent } from '@/helpers/utils'

function createPackageItem(fileConfig: any) {
  return `#PVF_File

[name]
	${fileConfig.name}

[grade]
	1

[rarity]
	2

[usable job]
	${fileConfig.usableJob}
[/usable job]

[attach type]
	\`[account]\`

[minimum level]
	1

[icon mark]
	${fileConfig.iconMark || '\`Item/IconMark_cn.img\`	163'}

[icon]
	${fileConfig.icon}

[stackable type]
	\`[usable cera package]\`	0

[move wav]
	\`BONE_TOUCH\`

[npc gift disallowance]
	1

[package data]
${fileConfig.avatarItems
  .map((item: any) => {
    return `${item.id}\t${item.count}`
  })
  .join('\n\t')}
[/package data]

[suitable job]
	${fileConfig.usableJob}
[/suitable job]

[stack limit]
	1

`
}

export async function transformPackage(fileItem: string, port: number) {
  const content = await getFileContent(fileItem, port)

  const newFileList: any[] = []

  // 获取分类
  const typeSettingString = extractSecondLineValues(content, '[booster category num]')
  const numbers = typeSettingString?.match(/\d+/g)
  const typeSetting = numbers ? numbers.map(Number) : []

  // 获取分类选项
  const typeOptionsString = matchTagContent(content, 'booster category name')
  const typeOptions = typeOptionsString.split('\n').map((item) => item.trim().slice(1, -1))
  // console.log(typeOptions)

  const categoryBlocks = content.match(
    /\[booster select category\][\s\S]*?\[\/booster select category\]/g,
  )

  if (categoryBlocks) {
    categoryBlocks.forEach((block) => {
      // 提取数字对
      const numbersMatch = block.match(/\[booster select category\][\s\t]+(\d+)[\s\t]+(\d+)/)

      // 1. 提取 avatar 块内容
      const avatarMatch = block.match(/\[avatar\]([\s\S]*?)\[\/avatar\]/)

      // 2. 处理数据
      let avatarData = []
      if (avatarMatch) {
        const content = avatarMatch[1]
        const allValues = content.split('\t').filter((item) => item.trim()) // 分割所有值

        // 每4个值一组，取前2个
        for (let i = 0; i < allValues.length; i += 4) {
          const group = allValues.slice(i, i + 4)
          if (group.length >= 2) {
            // 确保至少有2个值
            avatarData.push(group.slice(0, 2))
          }
        }
      }
      avatarData = avatarData.map((item) => ({ id: item[0].trim(), count: item[1] }))
      const typeIndex = (numbersMatch ? [numbersMatch[1], numbersMatch[2]] : []).map(Number)
      const fileName = extractSecondLineValues(content, '[name]')
      const typeName = typeOptions[typeIndex[0] + 1]
      const subTypeName =
        typeOptions[typeSetting[1] + typeIndex[0] * typeSetting[2] + typeIndex[1] + 2]

      const usableJob = getUsableJob(typeName) || extractSecondLineValues(content, '[usable job]')
      const icon = extractSecondLineValues(content, '[icon]')
      const iconMark = extractSecondLineValues(content, '[icon mark]')
      const fileData = {
        name: `\`${fileName?.trim()?.slice(1, -1)}-${typeName}-${subTypeName}\``,
        usableJob,
        typeIndex,
        icon,
        iconMark,
        avatarItems: avatarData,
      }
      // console.log(fileData)

      newFileList.push(createPackageItem(fileData))
    })
  }

  return newFileList
}
