const apiHost = 'http://localhost:27000/Api/PvfUtiltiy'
interface BaseResponse<Data = any> {
  IsError: boolean
  Data: Data
}
// 批量获取选中文件
export const getSelectedFiles = async () => {
  const res = await fetch(`${apiHost}/GetTreeSelectedFiles`)
  const parseRes: BaseResponse<string[]> = await res.json()
  if (!parseRes.IsError) {
    return parseRes.Data
  } else {
    return []
  }
}

// 批量获取物品信息
export const getItemsInfo = async (paths: string[]) => {
  const res = await fetch(`${apiHost}/GetItemInfos`, {
    method: 'POST',
    body: JSON.stringify(paths),
  })
  const parseRes: BaseResponse<any[]> = await res.json()
  if (!parseRes.IsError) {
    return parseRes.Data
  } else {
    return []
  }
}

// 获取文件内容
export const getFileContent = async (path: string) => {
  const res = await fetch(`${apiHost}/GetFileContent?filepath=${path}`)
  const parseRes: BaseResponse<string> = await res.json()
  if (!parseRes.IsError) {
    return parseRes.Data
  } else {
    return ''
  }
}

// 获取文件内容-JSON
export const getFileContentData = async (path: string) => {
  const res = await fetch(`${apiHost}/getFileData?filepath=${path}`)
  const parseRes: BaseResponse<any[]> = await res.json()
  if (!parseRes.IsError) {
    return parseRes.Data
  } else {
    return null
  }
}

// 上传文件
export const updateItemContent = async (path: string, content: string) => {
  const res = await fetch(`${apiHost}/ImportFile?filePath=${path}`, {
    method: 'POST',
    body: content,
  })
  const parseRes: BaseResponse = await res.json()
  if (!parseRes.IsError) {
    return true
  } else {
    return null
  }
}
