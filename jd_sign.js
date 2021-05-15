// version v0.0.1
// create by zhihua
// detail url: https://github.com/ruicky/jd_sign_bot

const exec = require('child_process').execSync
const fs = require('fs')
const rp = require('request-promise')
const download = require('download')

// 京东Cookie
const cookie ='wxa_level=1; retina=0; webp=1; __jdv=122270672%7Cdocs.qq.com%7C-%7Creferral%7C-%7C1620899565455; mba_muid=1620899565454963598166; visitkey=23346039083464981; shshshfpb=f85IPKMmAi4iYvoiZ8czgQg%3D%3D; shshshfpa=e85b613d-adff-c46e-7de9-e1721e86b0c0-1611164025; 3AB9D23F7A4B3C9B=NPIHKJWP5MAPBFLJ76PAF6TBEGUC2PIMAIC2BEKGAQ7GLCL4LZH7JYQ42DMOZCR24ZZXIU6VKI3YSCWM4TQOXWL5BQ; jcap_dvzw_fp=Np404ZgZ9ZORcDNDmlWAbfmaQYwtqTW-H_HPFJ4SsE3YLRn1KfTwfUbmj4dDQyNJ8XkicQ==; TrackerID=kgWr4BQf1V5QYhIzLJYntgiVkVb2bsexJx61xNOfPCcD_cFZng7grkWlr05raGvng_XMsZBt3TW-RTZxQJzHILXImkW9i_NOjvJggPST2Zs; pt_key=AAJgnPcYADD47Q5PSrGepkYHYtGwdXybQ9UjcsttS3kWNqeY4nRZ1eo0p1T6aodkjzf6F9CCsuk; pt_pin=37036670; pt_token=n30pk3b9; pwdt_id=37036670; sfstoken=tk01mee671d94a8sM3gzKzIrMngzRxDoL8Uf8sOajtkx2J90kGlCeVtwi8aOhzbAvre4vUrTcCiG1f4feANgNar2sEQs; PPRD_P=UUID.1620899565454963598166; sc_width=1440; jxsid_s_u=https%3A//home.m.jd.com/myJd/home.action; autoOpenApp_downCloseDate_auto=1620923739754_10800000; cid=9; shshshfp=2333907fe3fdb07a445f56852011465e; jxsid=16210584308209468897; __jda=122270672.1620899565454963598166.1620899565.1620981543.1621058431.6; wqmnx1=MDEyNjM4MnRtYy90MzNvLm8uNEFLM0xHaC4ycjZmYS1LUk9GKQ%3D%3D; __wga=1621060047983.1621058431053.1620981542865.1620899604456.2.5; jxsid_s_t=1621060048136; __jdb=122270672.2.1620899565454963598166|6.1621058431; __jdc=122270672; mba_sid=16210584310185569955486449900.2; shshshsID=5bf0396fbc2ac08bedb73d67bcd35312_2_1621060048363;'
const dual_cookie = process.env.JD_DUAL_COOKIE
// Server酱SCKEY
const push_key = 'SCU150410T537d3b72d755830d676ed0323a9b6bc560001c2f8fb20'

// 京东脚本文件
const js_url = 'https://raw.githubusercontent.com/NobyDa/Script/master/JD-DailyBonus/JD_DailyBonus.js'
// 下载脚本路劲
const js_path = './JD_DailyBonus.js'
// 脚本执行输出路劲
const result_path = './result.txt'
// 错误信息输出路劲
const error_path = './error.txt'

Date.prototype.Format = function (fmt) {
  var o = {
    'M+': this.getMonth() + 1,
    'd+': this.getDate(),
    'H+': this.getHours(),
    'm+': this.getMinutes(),
    's+': this.getSeconds(),
    'S+': this.getMilliseconds()
  };
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
  }
  for (var k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(String(o[k]).length)));
    }
  }
  return fmt;
};

function dateFormat() {
  var timezone = 8;
  var GMT_offset = new Date().getTimezoneOffset();
  var n_Date = new Date().getTime();
  var t_Date = new Date(n_Date + GMT_offset * 60 * 1000 + timezone * 60 * 60 * 1000);
  console.log(t_Date)
  return t_Date.Format('yyyy.MM.dd')
}

function setupCookie() {
  var js_content = fs.readFileSync(js_path, 'utf8')
  js_content = js_content.replace(/var Key = ''/, `var Key = '${cookie}'`)
  if (dual_cookie) {
    js_content = js_content.replace(/var DualKey = ''/, `var DualKey = '${dual_cookie}'`)
  }
  fs.writeFileSync(js_path, js_content, 'utf8')
}

function sendNotificationIfNeed() {

  if (!push_key) {
    console.log('执行任务结束!'); return;
  }

  if (!fs.existsSync(result_path)) {
    console.log('没有执行结果，任务中断!'); return;
  }

  let text = "京东签到_" + dateFormat();
  let desp = fs.readFileSync(result_path, "utf8")

  // 去除末尾的换行
  let SCKEY = push_key.replace(/[\r\n]/g,"")

  const options ={
    uri:  `https://sc.ftqq.com/${SCKEY}.send`,
    form: { text, desp },
    json: true,
    method: 'POST'
  }

  rp.post(options).then(res=>{
    const code = res['errno'];
    if (code == 0) {
      console.log("通知发送成功，任务结束！")
    }
    else {
      console.log(res);
      console.log("通知发送失败，任务中断！")
      fs.writeFileSync(error_path, JSON.stringify(res), 'utf8')
    }
  }).catch((err)=>{
    console.log("通知发送失败，任务中断！")
    fs.writeFileSync(error_path, err, 'utf8')
  })
}

function main() {

  if (!cookie) {
    console.log('请配置京东cookie!'); return;
  }

  // 1、下载脚本
  download(js_url, './').then(res=>{
    // 2、替换cookie
    setupCookie()
    // 3、执行脚本
    exec(`node '${js_path}' >> '${result_path}'`);
    // 4、发送推送
    sendNotificationIfNeed() 
  }).catch((err)=>{
    console.log('脚本文件下载失败，任务中断！');
    fs.writeFileSync(error_path, err, 'utf8')
  })

}

main()
