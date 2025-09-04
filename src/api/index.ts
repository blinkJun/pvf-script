import { ElMessage } from 'element-plus'

const getApiHost = (port: number = 27000) => {
  return `http://localhost:${port}/Api/PvfUtiltiy`
}

interface BaseResponse<Data = any> {
  IsError: boolean
  Data: Data
  Msg: string
}
// 批量获取选中文件
export const getSelectedFiles = async (port?: number) => {
  const res = await fetch(`${getApiHost(port)}/GetTreeSelectedFiles`)
  const parseRes: BaseResponse<string[]> = await res.json()
  if (!parseRes.IsError) {
    return parseRes.Data
  } else {
    console.log(parseRes.Msg)
    ElMessage.error(parseRes.Msg)
    return []
  }
}

// 批量获取物品信息
export const getItemsInfo = async (paths: string[], port?: number) => {
  const res = await fetch(`${getApiHost(port)}/GetItemInfos`, {
    method: 'POST',
    body: JSON.stringify(paths),
  })
  const parseRes: BaseResponse<any[]> = await res.json()
  if (!parseRes.IsError) {
    return parseRes.Data
  } else {
    console.log(parseRes.Msg)
    ElMessage.error(parseRes.Msg)
    return []
  }
}

// 获取文件内容
export const getFileContent = async (path: string, port?: number) => {
  const res = await fetch(`${getApiHost(port)}/GetFileContent?filepath=${path}`)
  const parseRes: BaseResponse<string> = await res.json()
  if (!parseRes.IsError) {
    return parseRes.Data
  } else {
    console.log(parseRes.Msg)
    ElMessage.error(parseRes.Msg)
    return ''
  }
}

// 获取文件内容-JSON
export const getFileContentData = async (path: string, port?: number) => {
  const res = await fetch(`${getApiHost(port)}/getFileData?filepath=${path}`)
  const parseRes: BaseResponse<any[]> = await res.json()
  if (!parseRes.IsError) {
    return parseRes.Data
  } else {
    console.log(parseRes.Msg)
    ElMessage.error(parseRes.Msg)
    return null
  }
}

// 上传文件
export const updateItemContent = async (path: string, content: string, port?: number) => {
  const res = await fetch(`${getApiHost(port)}/ImportFile?filePath=${path}`, {
    method: 'POST',
    body: content,
  })
  const parseRes: BaseResponse = await res.json()
  if (!parseRes.IsError) {
    return true
  } else {
    console.log(parseRes.Msg)
    ElMessage.error(parseRes.Msg)
    return null
  }
}

// 文件列表转为lst
export const filListToLstRows = async (pathList: string[], port?: number) => {
  const res = await fetch(`${getApiHost(port)}/FileListToLstRows`, {
    method: 'POST',
    body: JSON.stringify(pathList),
  })
  const parseRes: BaseResponse = await res.json()
  if (!parseRes.IsError) {
    return parseRes.Data
  } else {
    console.log(parseRes.Msg)
    ElMessage.error(parseRes.Msg)
    return null
  }
}

// 文件列表转为lst
interface LstTypeId {
  lstNames:string[]
  ItemCodes:number[]
}
export const itemCodesToFileInfos = async (pathList: LstTypeId[], port?: number) => {
  const res = await fetch(`${getApiHost(port)}/ItemCodesToFileInfos`, {
    method: 'POST',
    body: JSON.stringify(pathList),
  })
  const parseRes: BaseResponse = await res.json()
  if (!parseRes.IsError) {
    return parseRes.Data
  } else {
    console.log(parseRes.Msg)
    ElMessage.error(parseRes.Msg)
    return null
  }
}
