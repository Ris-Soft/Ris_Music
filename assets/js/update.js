// 检查更新
let myHeaders = new Headers({
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'text/plain'
});
const url2 = 'https://ser.3r60.top/Soft/VER/getData.php';
fetch(url2,{
    method: 'GET',
    headers: myHeaders,
    mode: 'no-cors'
})
  .then(response => response.json())
  .then(softwareData => {
    const project = 'Ris_Music_Lite';
    if (softwareData[project]) {
      const version = softwareData[project]['version'];
      const support = softwareData[project]['Support'];
      const update = softwareData[project]['update'] ? softwareData[project]['update'].replace(/\n/g, '  \n') : '暂无更新信息';

      console.log(`软件标识:  ${project}  \n`);
      console.log(`软件版本: ${version}  \n`);
      console.log(`支持状态: ${support ? '支持' : '停止支持'}  \n`);
      console.log(`更新日志: ${update}  \n`);
      if(version !== localVerson){
          alert(`瑞思音乐Lite有新版本(${version})了，更新日志如下：${update}`);
      }
    } else {
      console.log(`项目不存在:${project}  \n`);
    }
  })
  .catch(error => {
    console.error('请求数据时出错:', error);
  });