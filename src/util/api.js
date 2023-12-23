/**
 * @author baolf <baolf@qingtime.com>
 */

import axios from 'axios';
// import { createMsg } from './ADS';
import { useRoute, useRouter } from 'vue-router';

let baseURL = 'https://genealogydatatest.qingtime.cn';
let uploadFileURL = 'https://genealogyimagestest.qingtime.cn';
let downloadURL = 'https://indeximagedownloadtest.qingtime.cn';
let imageHref = 'https://indextest.qingtime.cn/index';

if(window.location.origin == 'https://index.1jiapu.com'){
  baseURL = 'https://genealogydata.1jiapu.com';
  uploadFileURL = 'https://photo.1jiapu.com';
  downloadURL = 'https://indexserver.1jiapu.com';
  imageHref = 'https://indexserver.1jiapu.com/index';
}

// baseURL = 'https://genealogydata.1jiapu.com';
// uploadFileURL = 'https://photo.1jiapu.com';
// downloadURL = 'https://indexserver.1jiapu.com';

axios.interceptors.response.use(
  (response) => {
    switch (response.data.statusCode || response.data.status) {
      case '701':
        localStorage.clear();
        // createMsg('登录失效');
        break;
      case '201':
        // createMsg(response.data.msg)
        break;
      default:
    }

    return response;
  },
  (err) => {
    console.log(err);
  }
);

const request = {
  get: (url, params, base = '') => {
    return new Promise((resolve, reject) => {
      axios
        .get((base ? base : baseURL) + url, { params })
        .then((response) => {
          resolve(response.data);
          if (response.data.status == 301) {
            // 验证码失效 => 跳转 验证码校验UI 2022.07.02 -> baolf
            // createMsg(response.data.msg);
            // router.push('/authentication');
          }
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  },
  post: (url, params, base) => {
    return new Promise((resolve, reject) => {
      axios
        .post((base ? base : baseURL) + url, params)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  },
  patch: (url, params) => {
    return new Promise(function (resolve, reject) {
      axios
        .patch(baseURL + url, params)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  },
  delete: (url, params) => {
    return new Promise(function (resolve, reject) {
      axios
        .delete(baseURL + url, {
          data: params,
        })
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  },
};

const user = {
  getUserInfo(token){
    let param = {
        token: token
    }
    return request.get('/sgbh/account/userinfo', param, 'https://baokudata.qingtime.cn');
  },
  userAndStarInfoAndRole(param){
    return request.post('/sgbh/star/userAndStarInfoAndRole', param, 'https://kintime.qingtime.cn');
  },
  saveUser(param){
    return request.post('/user', param);
  },
}

const org = {
  getOrgList(param){
      return request.get('/org', param);
  },
  patchOrg(orgKey, patchData){
      let param = {
          orgKey: orgKey,
          patchData: patchData
      }
      return request.patch('/org', param);
  },
  getOrgMemberInfo(siteKey, userKey){
    let param = {
        siteKey: siteKey,
        userKey: userKey
    }
    return request.get('/org/member/info', param);
  },
  getOrgUser(param){
    return request.get('/org/user/search', param);
  },
}

const catalog = {

}

const volume = {
  getVolumeList(param){
    return request.get('/catalog/volumeList', param);
  },
}

const index = {
  // 概览
  overview(param){// 索引概览
    return request.get('/index/overview', param);
  },
  // 组织机构
  createOrg(param){// 创建机构（FS管理员有权限）
    return request.post('/index/createOrg', param);
  },
  deleteOrg(param){// 删除机构（FS管理员有权限）
    return request.delete('/index/deleteOrg', param);
  },
  updateOrg(param){// 修改机构（FS管理员有权限）
    return request.patch('/index/updateOrg', param);
  },
  getOrgList(param){// 机构列表（FS管理员有权限）
    return request.get('/index/orgList', param);
  },
  addIndexUser(param){// 注册索引用户
    return request.post('/index/addIndexUser', param);
  },
  addOrgMember(param){// 添加机构成员
    return request.post('/index/addOrgMember', param);
  },
  deleteOrgMember(param){// 删除机构成员
    return request.delete('/index/deleteOrgMember', param);
  },
  updateOrgMember(param){// 编辑机构成员角色
    return request.patch('/index/updateOrgMember', param);
  },
  getOrgMemberList(param){// 获取机构成员列表
    return request.get('/index/orgMemberList', param);
  },
  userSearch(param){// 搜索用户信息（是否已加入某个机构）
    return request.get('/index/userSearch', param);
  },
  orgMemberInfo(param){// 获取机构成员信息（没有空对象）
    return request.get('/index/orgMemberInfo', param);
  },
  // 谱目详情
  gcList(param){// 谱目详情列表
    return request.get('/index/gcList', param);
  },
  assignBatchList(param){// 分配批次列表
    return request.get('/index/assignBatchList', param);
  },
  deliveryBatchList(param){// 交付批次列表
    return request.get('/index/deliveryBatchList', param);
  },
  taskAssign(param){// 任务分配
    return request.post('/index/taskAssign', param);
  },
  taskAssignCancel(param){// 取消任务分配
    return request.patch('/index/taskAssignCancel', param);
  },
  taskAssignJudgeGC(param){// 任务分配判断谱目是否已分配过
    return request.post('/index/taskAssignJudgeGC', param);
  },
  taskAssignBatch(param){// 批量任务分配判断
    return request.post('/index/taskAssignBatch', param);
  },
  taskAssignBatchConfirm(param){// 批量任务分配确认
    return request.post('/index/taskAssignBatchConfirm', param);
  },
  gcListTotal(param){// 谱目统计
    return request.get('/index/gcListTotal', param);
  },
  gcListDownload(param){// 下载谱目列表
    return request.get('/index/gcListDownload', param);
  },
  GIKDownload(param){// gik下载
    return request.post('/index/GIKDownload', param);
  },
  GIKDownloadVolume(param){// gik下载（卷册）
    return request.post('/index/GIKDownloadVolume', param);
  },
  downloadImageFrequency(param){// 记录机构下载影像的次数
    return request.post('/index/downloadImageFrequency', param);
  },
  addDownloadImageFrequency(param){//增加机构下载影像的次数（新接口下载成功后小鲍调用）
    return request.post('/index/addDownloadImageFrequency', param);
  },
  // 统计报表
  imageInStoreReport(param){// 影像入库报表
    return request.get('/index/imageInStoreReport', param);
  },
  // 索引分配与完成度表
  assignDeliverReport(param){// 索引分配与完成度表
    return request.get('/index/assignDeliverReport', param);
  },
  assignGCDetail(param){// 分配谱目明细
    return request.get('/index/assignGCDetail', param);
  },
  assignGCDeliverDetail(param){// 分配谱目交付明细
    return request.get('/index/assignGCDeliveryDetail', param);
  },
  deliverReport(param){// 索引交付报表
    return request.get('/index/deliverReport', param);
  },
  deliverDetail(param){// 索引交付明细表
    return request.get('/index/deliverDetail', param);
  },
  // 年度报告完成情况汇总表
  targetStatistics(param){// 获取年度/月度目标统计
    return request.get('/index/targetStatistics', param);
  },
  // 交付报告
  orgDeliveryReport(param){// 机构交付报告
    return request.get('/index/orgDeliveryReport', param);
  },
  importDeliverBatchData(param){// 导入交付报告
    return request.post('/index/importDeliverBatchData', param);
  },
  deliverBatchName(param){// 批次名修改
    return request.patch('/index/deliverBatchName', param);
  },
  orgDataUpdate(param){// 机构数据更新
    return request.patch('/index/orgDataUpdate', param);
  },
  orgBatchDataUpdate(param){// 机构批量数据更新
    return request.patch('/index/orgBatchDataUpdate', param);
  },
  FSCheck(param){// FS审核
    return request.patch('/index/FSCheck', param);
  },
  deliveryBatchLog(param){// 交付批次的日志列表
    return request.get('/index/deliveryBatchLog', param);
  },
  deliveryBatchReturnReason(param){// 交付批次的打回原因列表
    return request.get('/index/deliveryBatchReturnReason', param);
  },
  deliveryBatchFinish(param){// 交付批次完工
    return request.patch('/index/deliveryBatchFinish', param);
  },
  deleteDeliveryBatchData(param){// 删除交付批次
    return request.delete('/index/deleteDeliveryBatchData', param);
  },
  // Production
  production(param){// production
    return request.get('/index/production', param);
  },
  updateProduction(param){// 修改production（同时修改批次数据）
    return request.patch('/index/updateProduction', param);
  },
  productionYearOrgList(param){// production（年/机构 不分页）
    return request.get('/index/productionYearOrgList', param);
  },
  // SLA
  getSLAList(param){// 获取SLA列表
    return request.get('/index/SLAList', param);
  },
  importSLA(param){// 导入SLA（注意改日志的域名前缀）
    return request.post('/index/importSLA', param);
  },
  updateSLA(param){// 修改SLA
    return request.patch('/index/updateSLA', param);
  },
  SLACheck(param){// SLA审核
    return request.patch('/index/SLACheck', param);
  },
  getSLADeliveryMemoList(param){// 获取SLA备注列表（从交付批次对应的谱中获取）
    return request.get('/index/SLADeliveryMemoList', param);
  },
  slaAttachmentList(param){// SLA附件列表
    return request.get('/index/slaAttachmentList', param);
  },
  deleteSLA(param){// 删除SLA
    return request.delete('/index/deleteSLA', param);
  },
  // 错误清单
  getSLAErrorList(param){// 获取错误清单列表
    return request.get('/index/SLAErrorList', param);
  },
  addSLAErrorList(param){// 生成SLA错误清单
    return request.post('/index/addSLAErrorList', param);
  },
  addSLAErrorAttachment(param){// 错误清单-附件上传（累加）
    return request.patch('/index/addSLAErrorAttachment', param);
  },
  SLAErrorListFinish(param){// 错误清单完结
    return request.patch('/index/SLAErrorListFinish', param);
  },
  deleteSLAErrorList(param){// 删除SLA错误清单
    return request.delete('/index/deleteSLAErrorList', param);
  },
  // 上传文件
  getIndexUploadFileList(param){// 获取索引上传文件列表
    return request.get('/index/indexUploadFileList', param);
  },
  addIndexUploadFile(param){// 记录索引上传文件
    return request.post('/index/addIndexUploadFile', param);
  },
  indexFileDistribute(param){// 文件-分发（FS发给供应商、只能分发FS的文件）
    return request.post('/index/indexFileDistribute', param);
  },
  // 影像列表 
  shuiyinImageList(param){// 获取卷册水印文件列表
    return request.get('/index/shuiyinImageList', param);
  },
  getVolumeList(param, url){// 卷册列表
    return request.get('/catalog/volumeList', param, url);
  },
  // 年度目标
  getTargetList(param){// 获取年度/月度目标列表
    return request.get('/index/getTargetList', param);
  },
  addTarget(param){// 增加年度/月度目标
    return request.post('/index/addTarget', param);
  },
  updateTarget(param){// 修改年度/月度目标
    return request.patch('/index/updateTarget', param);
  },
  deleteTarget(param){// 删除年度/月度目标
    return request.delete('/index/deleteTarget', param);
  },
  batchUpdateMonthTarget(param){// 批量修改月度目标
    return request.patch('/index/batchUpdateMonthTarget', param);
  },
  // 系统日志
  getLog(param){// 操作日志列表
    return request.get('/index/log', param);
  },
  logType(param){// 操作日志类型
    return request.get('/index/logType', param);
  },
  logOneKeyRead(param){// 日志消息一键已读
    return request.post('/index/logOneKeyRead', param);
  },
  // 谱目详情
  getGenealogyDetail(param){
    return request.get('/catalog/detail', param);
  },
  // 编辑谱目
  dataEdit(param){
    return request.patch('/data/edit', param);
  },
  // Production下载
  productionDownload(param){
    return request.get('/index/productionDownload', param);
  },
  productionYearOrgDownload(param){
    return request.get('/index/productionYearOrgDownload', param);
  },
  // 单条已读
  logSingleRead(param){
    return request.post('/index/logSingleRead', param);
  },
  getIndexGCConditionChangeList(param){// 家谱索引入库谱目状态修改记录列表
    return request.get('/index/indexGCConditionChangeList', param);
  },
}

export {
  user,
  org,
  catalog, 
  volume, 
  uploadFileURL,
  baseURL,
  index,
  downloadURL,
  imageHref,
};
