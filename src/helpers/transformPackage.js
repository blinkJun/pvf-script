const { glob } = require("glob");
const fs = require("fs");

let packageStartId = 123201000
let packageIndex = 5671
const lst = []
const packageList = []

async function processLineByLine(file) {
  const text = fs.readFileSync(file, { encoding: "utf-8" });
  const filename = file.split("\\").reverse()[0];
  // 最终结果对象
  const result = {
    name: "",
    jobList:[],
    usableJobContent:'',
    boosterCategories: [],
  };

  // 1. 提取两个标记之间的内容
  const match = text.match(/`请选择职业`([\s\S]*?)\[\/booster category name\]/);

  // 2. 处理匹配结果
  if (match) {
    // 分割为行数组，过滤空行和标记行
    result.jobList = match[1]
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && line.startsWith('`') && line.endsWith('`'))
      .map(line => line.slice(1, -1)); // 移除反引号
  }

  console.log(result.jobList)

  // 提取 [usable job] 内的内容
  const usableJobMatch = text.match(/\[usable job\][\s\S]*?\[\/usable job\]/);

  if (usableJobMatch) {
      // 移除首尾的标签和空白字符
      result.usableJobContent = usableJobMatch[0]
          .replace(/\[usable job\]/g, '')
          .replace(/\[\/usable job\]/g, '')
          .trim();
  }

  // 1. 提取 [name] 下一行内容
  const nameMatch = text.match(/\[name\]\s*\n([^\n]+)/);
  if (nameMatch) {
    result.name = nameMatch[1].trim();
  }

  // 2. 提取所有 [booster select category] 块
  const categoryBlocks = text.match(
    /\[booster select category\][\s\S]*?\[\/booster select category\]/g
  );

  if (categoryBlocks) {
    categoryBlocks.forEach((block) => {
      // 提取数字对
      const numbersMatch = block.match(
        /\[booster select category\][\s\t]+(\d+)[\s\t]+(\d+)/
      );

      // 1. 提取 avatar 块内容
      const avatarMatch = block.match(/\[avatar\]([\s\S]*?)\[\/avatar\]/);

      // 2. 处理数据
      let avatarData = [];
      if (avatarMatch) {
        const content = avatarMatch[1];
        const allValues = content.split('\t'); // 分割所有值
        
        // 每4个值一组，取前2个
        for (let i = 0; i < allValues.length; i += 4) {
          const group = allValues.slice(i, i + 4);
          if (group.length >= 2) { // 确保至少有2个值
            avatarData.push(group.slice(0, 2));
          }
        }
      }
      avatarData = avatarData.map(item=>({id:item[0].trim(),count:item[1]}))
      console.log(`ad:`,avatarData)
      result.boosterCategories.push({
        numbers: numbersMatch ? [numbersMatch[1], numbersMatch[2]] : [],
        avatarItems: avatarData,
      });
    });
  }

  let typeArr = []
  result.boosterCategories.forEach(({numbers,avatarItems})=>{
    const [type,index] = numbers
    if(!typeArr[type]){
      typeArr[type] = []
    }
    const job = result.jobList[type]
    const jobMap = [
      ['魔法师','[mage]','[at mage]'],
      ['格斗家','[fighter]','[at fighter]'],
      ['神枪手','[at gunner]','[gunner]'],
      ['鬼剑士','[swordman]'],
      ['暗夜','[thief]'],
      ['圣职','[priest]'],
    ]
    const matchJobInfo = jobMap.find(item=>{
      const [name,jobKey,jobKey1] = item;
      if(job.includes(name)){
        return true
      }
    })
    let jobKey = '[all]'
    const [name,jobKey1,jobKey2] = matchJobInfo;
    if(job.includes('男')){
      jobKey =  jobKey2
    }else if(job.includes('女')){
      jobKey = jobKey1
    }else{
      jobKey = jobKey1
    }
    const packageName = `${result.name.replaceAll('`','')} - ${job}`
    const id = packageStartId++
    typeArr[type].push(id)
    const newFilePath = `./${id}.stk`
    lst.push(`${id}\t\`blink/addition/${id}.stk\``)
    packageList.push(`${packageIndex++}	${id}	0	0	3600	\`${packageName}\`	0	0	-1	-1`)
    fs.writeFileSync(newFilePath,
      `#PVF_File

[name]
	\`${packageName}\`

[grade]
	1

[rarity]
	2

[usable job]
	\`${jobKey}\`
[/usable job]

[attach type]
	\`[trade]\`

[minimum level]
	1

[icon mark]
	\`Item/IconMark_cn.img\`	163

[icon]
	\`Item/stackable/cash_cn.img\`	1123

[stackable type]
	\`[usable cera package]\`	0

[move wav]
	\`BONE_TOUCH\`

[npc gift disallowance]
	1

[package data]
  ${avatarItems.map(item=>{
    let newId = item.id
    if(newId.length === 9&&newId.startsWith('40')){
      newId = `60${newId.slice(2)}`
    }
    if(newId == 605570096){
      newId = 605570099
    }
    if(newId == 609550179){
      newId = 609550181
    }
    if(newId == 609560137){
      newId = 609560138
    }
    return `${newId}\t${item.count}`
  }).join('\n\t')}
[/package data]

[suitable job]
	\`${jobKey}\`
[/suitable job]

[stack limit]
	1

      `
    )
  })
  const typeGiftContent = `#PVF_File

[name]
	${result.name}

[explain]
	\`开启后， 可以选择获得一套一觉燃魂装扮套装。\`

[flavor text]
	\`<2019新春礼包>\`

[grade]
	1

[rarity]
	1

[usable job]
	${result.usableJobContent}
[/usable job]

[attach type]
	\`[account]\`

[minimum level]
	1

[icon]
	\`Item/stackable/cash.img\`	608

[stackable type]
	\`[booster selection]\`	0

[move wav]
	\`BONE_TOUCH\`

[booster category num]
	1	4

[booster selection num]
	1

${result.jobList.map((item,index)=>{
  return `[booster select category]
	${index}	0	
	[stackable]
		${typeArr[index].map(item=>{
      return `${item}\t1`
    }).join('\n\t\t')}
	[/stackable]
[/booster select category]`
}).join('\n\n')}

[booster category name]
	\`请选择职业\`
	${result.jobList.map(item=>`\`${item}\``).join('\n\t')}
[/booster category name]
`
// fs.writeFileSync(`./${filename}`,typeGiftContent)
}

glob(`../../天空礼包/苍穹之翼-异色/stackable/**/*.stk`).then((files) => {
  files.forEach(processLineByLine);
  fs.writeFileSync('./list.lst',lst.join('\n'))
  fs.writeFileSync('./package.lst',packageList.join('\n'))
});
