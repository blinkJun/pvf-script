export function matchTagContent(input: string, tagName: string) {
  // 转义标签名中的特殊字符
  const escapedTag = tagName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  // 构建动态正则表达式
  const regex = new RegExp(`\\[${escapedTag}\\]([\\s\\S]*?)\\[\\/${escapedTag}\\]`, 'i')

  const match = input.match(regex)
  return match ? match[1].trim() : ''
}

export function formatTagLine(content: string) {
  return content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((item) => item.split('\t'))
}

export function reverseFormatTagLine(result: string[][]) {
  // 逆向操作：将每个子数组用 \t 连接，然后用 \n 连接所有行
  return result
    .map(subArray => subArray.join('\t'))  // 逆向：将每个子数组用制表符连接
    .join('\n');  // 逆向：将所有行用换行符连接
}

/**
 * 将内容插入到指定标签内的最后位置
 * @param {string} input - 原始文本
 * @param {string} tagName - 目标标签名（不带方括号）
 * @param {string} content - 要插入的内容
 * @param {boolean} insert - 是否插入
 * @returns {string} 处理后的文本
 */
export function insertToTagEnd(input: string, tagName: string, content: string,insert:boolean = true) {
  // 转义标签名中的特殊字符
  const escapedTag = tagName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  // 构建匹配标签内容的正则
  const regex = new RegExp(`(\\[${escapedTag}\\])([\\s\\S]*?)(\\[\\/${escapedTag}\\])`, 'i')

  // 检查标签是否存在
  if (!regex.test(input)) {
    return `${input}\n[${tagName}]\n${content}\n[/${tagName}]`
  }

  // 执行替换（在闭合标签前插入内容）
  return input.replace(regex, (match, openTag, innerContent, closeTag) => {
    if(insert){
      return `${openTag}${innerContent}\n${content}\n${closeTag}`
    }else{
      return `${openTag}${content}\n${closeTag}`
    }
  })
}
