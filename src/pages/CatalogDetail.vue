<script setup>
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { ElLoading } from 'element-plus';
import { useGlobalStore } from '../store/global.js';
import { createMsg, downliadLink, getQueryVariable, thousands, zipFiles } from '../util/ADS.js';
import { index, baseURL, downloadURL } from '../util/api';
import VolumeListModule from '../components/VolumeListModule.vue';
import TaskAssign from '../components/catalogDetail/TaskAssign.vue';
import BatchTaskAssign from '../components/catalogDetail/BatchTaskAssign.vue';
import EditCatalog from '../components/EditCatalog.vue';
/** 路由 */
const router = useRouter();
/** 全局变量 */
const global = useGlobalStore();
/** 全局变量引用 */
const { userInfo, orgMemberInfo, langData } = storeToRefs(global);
/** 全局变量函数 */
const { } = global;
/** 
 * 检索模块变量 
 * @param {string} genealogyName - 谱目
 * @param {string} gcKey - 谱ID
 * @param {string} volumeKey - 卷ID
 * @param {string} orgKey - 机构ID
 * @param {Array} orgKeyList - 分配机构列表，下拉框使用
 * @param {string} allocation - 分配进度
 * @param {Array} allocationList - 分配进度列表
 * @param {string} allocationBatch - 分配批次
 * @param {Array} allocationBatchList - 分配批次列表
 * @param {string} deliver - 交付进度
 * @param {Array} deliverList - 交付进度列表
 * @param {string} deliverBatch - 交付批次
 * @param {Array} deliverBatchList - 交付批次列表
 */
const genealogyName = ref('');
const gcKey = ref('');
const volumeKey = ref('');
const orgKey = ref('');
const orgKeyList = ref([]);
const allocation = ref('');
const allocationList = ref([
    {'label': langData.value['分配进度'], 'value': ''},
    {'label': langData.value['待分配'], 'value': '0'},
    {'label': langData.value['已分配'], 'value': '1'},
]);
const allocationBatch = ref('');
const allocationBatchList = ref([]);
const deliver = ref([]);
const deliverList = ref([
    // {'label': langData.value['交付进度'], 'value': ''},
    {'label': langData.value['未下载'], 'value': '0'},
    {'label': langData.value['未递交'], 'value': '1'},
    {'label': langData.value['待审核'], 'value': '2'},
    {'label': langData.value['已打回'], 'value': '4'},
    {'label': langData.value['已审核'], 'value': '3'},
    {'label': langData.value['已完工'], 'value': '6'},
]);
const deliverBatch = ref('');
const deliverBatchList = ref([]);
const gcHasZip = ref('');
const gcHasZipList = ref([
    {'label': langData.value['压缩进度'], 'value': ''},
    {'label': langData.value['未压缩'], 'value': '0'},
    {'label': langData.value['已压缩'], 'value': '1'},
]);
const Dupbookid = ref('');
const DupbookidList = ref([
    {'label': langData.value['重复谱ID'], 'value': ''},
    {'label': langData.value['重复谱ID 无'], 'value': '0'},
    {'label': langData.value['重复谱ID 有'], 'value': '1'},
]);
const startImages = ref('');
const endImages = ref('');
const lostVolume = ref('');
const lostVolumeList = ref([
    {'label': langData.value['缺卷说明'], 'value': ''},
    {'label': langData.value['缺卷说明 是'], 'value': '1'},
    {'label': langData.value['缺卷说明 否'], 'value': '0'},
]);
/** 
 * 分页模块变量 
 * @param {Number} page - 分页页码
 * @param {Number} pages - 分页pages
 * @param {Number} limit - 分页limit
 * @param {Number} total - 谱目详情总条数
 * @param {Number} currentPages - 谱目详情当前条数
 * @param {Number} currentImages - 谱目详情当前影像数
 * @param {Number} totalImages - 谱目详情总影像数
 */
const page = ref(1);
const pages = ref(0);
const limit = ref(20);
const total = ref(0);
const currentPages = ref(0);
const currentImages = ref(0);
const currentADJImages = ref(0);
const totalImages = ref(0);
const ADJImageCount = ref(0);
const loading = ref(false);
/** 
 * 分页页码切换 
 * @param {Number} data - 页码
 */
const handleCurrentChange = (data) => {
    console.log(data);
    page.value = data;
    getDataList();
}
/** 
 * 谱目详情列表数据 
 * @param {Array} tableData - 列表
 */
const tableData = ref([]);
/** 
 * 谱目详情列表api 
 * @param {string} userKey - 用户ID
 * @param {string} genealogyName - 谱名
 * @param {string} gcKey - 谱ID
 * @param {string} volumeKey - 卷ID
 * @param {string} orgKey - 机构ID
 * @param {string} assignProgress - 分配进度
 * @param {string} assignBatchKey - 分配批次
 * @param {string} deliveryProgress - 交付进度
 * @param {string} deliveryBatchKey - 交付批次
 * @param {string} gcHasZip - 压缩进度（下载压缩影像）
 * @param {Number} page - 页码
 * @param {Number} limit - limit
 * @returns {Object} {msg: 提示信息，status: 状态，result: {list: 列表, pageNum: 分页数, total: 总条数}}
 */
const getDataList = async () => {
    loading.value = true;
    const result = await index.gcList({
        'userKey': userInfo.value.userKey,
        'genealogyName': genealogyName.value,
        'gcKey': gcKey.value,
        'volumeKey': volumeKey.value,
        'orgKey': orgKey.value,
        'assignProgress': allocation.value,
        'assignBatchKey': allocationBatch.value,
        'deliveryProgress': deliver.value.join(','),
        'deliveryBatchKey': deliverBatch.value,
        'gcHasZip': gcHasZip.value,
        'Dupbookid': Dupbookid.value,
        'startImages': startImages.value,
        'endImages': endImages.value,
        'lostVolume': lostVolume.value,
        'page': page.value,
        'limit': limit.value,
    });
    
    loading.value = false;
    if(result.status == 200){
        let c1 = 0, c2 = 0, c3 = 0;
        tableData.value = result.result.list.map((ele) => {
            // ele.lostVolume = ele.lostVolume === 0 || ele.lostVolume === '0' ? '否' : '是';
            ele.assignProgressO = ele.assignProgress ? langData.value['已分配'] : langData.value['待分配'];
            ele.deliveryProgressO = ele.deliveryProgress === 6 ? langData.value['已完工'] : ele.deliveryProgress === 5 ? langData.value['有条件通过'] : ele.deliveryProgress === 4 ? langData.value['已打回'] : ele.deliveryProgress === 3 ? langData.value['已审核'] : ele.deliveryProgress === 2 ? langData.value['待审核'] : ele.deliveryProgress === 1 ? langData.value['未递交'] : !ele.deliveryProgress ? langData.value['未下载'] : '';
            c1 = c1 + (ele.imageCount || 0);
            c2 = c2 + 1;
            c3 = c3 +(ele.ADJImageCount || 0);

            ele.imageCountO = thousands(ele.imageCount);
            ele.ADJImageCount = thousands(ele.ADJImageCount);
            return ele;
        });
        pages.value = result.result.pageNum;
        total.value = result.result.total;
        currentImages.value = thousands(c1);
        currentPages.value = thousands(c2);
        currentADJImages.value = thousands(c3);
    }else{
        createMsg(result.msg);
    }
}
/** 
 * 谱目详情统计数据api 
 * @param {string} userKey - 用户ID
 * @param {string} genealogyName - 谱名
 * @param {string} gcKey - 谱ID
 * @param {string} volumeKey - 卷ID
 * @param {string} orgKey - 机构ID
 * @param {string} assignProgress - 分配进度
 * @param {string} assignBatchKey - 分配批次
 * @param {string} deliveryProgress - 交付进度
 * @param {string} deliveryBatchKey - 交付批次
 * @param {string} gcHasZip - 压缩进度（下载压缩影像）
 * @returns {Object} {msg:提示信息，status:状态，result: {gcCount: 谱目统计数, imageCount: 影像统计数}}
 */
const gcListTotal = async () => {
    const result = await index.gcListTotal({
        'userKey': userInfo.value.userKey,
        'genealogyName': genealogyName.value,
        'gcKey': gcKey.value,
        'volumeKey': volumeKey.value,
        'orgKey': orgKey.value,
        'assignProgress': allocation.value,
        'assignBatchKey': allocationBatch.value,
        'deliveryProgress': deliver.value.join(','),
        'deliveryBatchKey': deliverBatch.value,
        'gcHasZip': gcHasZip.value,
        'Dupbookid': Dupbookid.value,
        'startImages': startImages.value,
        'endImages': endImages.value,
        'lostVolume': lostVolume.value,
    });
    if(result.status == 200){
        totalImages.value = thousands(result.result.imageCount);
        ADJImageCount.value = thousands(result.result.ADJImageCount);
    }else{
        createMsg(result.msg);
    }
}
/** 
 * 谱目详情检索结果下载api 
 * @param {string} userKey - 用户ID
 * @param {string} genealogyName - 谱名
 * @param {string} gcKey - 谱ID
 * @param {string} volumeKey - 卷ID
 * @param {string} orgKey - 机构ID
 * @param {string} assignProgress - 分配进度
 * @param {string} assignBatchKey - 分配批次
 * @param {string} deliveryProgress - 交付进度
 * @param {string} deliveryBatchKey - 交付批次
 * @param {string} gcHasZip - 压缩进度（下载压缩影像）
 * @returns {Object} {msg:提示信息，status:状态，result:excel链接}
 */
const gcListDownload = async () => {
    const loading = ElLoading.service({
        lock: true,
        text: 'Loading',
        background: 'rgba(0, 0, 0, 0.7)',
    });
    const result = await index.gcListDownload({
        'userKey': userInfo.value.userKey,
        'genealogyName': genealogyName.value,
        'gcKey': gcKey.value,
        'volumeKey': volumeKey.value,
        'orgKey': orgKey.value,
        'assignProgress': allocation.value,
        'assignBatchKey': allocationBatch.value,
        'deliveryProgress': deliver.value.join(','),
        'deliveryBatchKey': deliverBatch.value,
        'gcHasZip': gcHasZip.value,
        'Dupbookid': Dupbookid.value,
        'lostVolume': lostVolume.value,
    });
    loading.close();
    if(result.status == 200){
        downliadLink(result.result, baseURL+'/');
    }else{
        createMsg(result.msg);
    }
}

/** 
 * gik下载api 
 * @param {Array} gcKeyArray - 谱ID数组
 * @returns {Object} {msg:提示信息，status:状态，result:excel链接}
 */
 const GIKDownload = async (gcKeyArray) => {
    const loading = ElLoading.service({
        lock: true,
        text: 'Loading',
        background: 'rgba(0, 0, 0, 0.7)',
    });
    const result = await index.GIKDownload({
        'gcKeyArray': gcKeyArray,
        'userKey': userInfo.value.userKey,
        'genealogyName': genealogyName.value,
        'gcKey': gcKey.value,
        'volumeKey': volumeKey.value,
        'assignProgress': allocation.value,
        'assignBatchKey': allocationBatch.value,
        'deliveryProgress': deliver.value.join(','),
        'deliveryBatchKey': deliverBatch.value,
        'gcHasZip': gcHasZip.value,
        'Dupbookid': Dupbookid.value,
        'startImages': startImages.value,
        'endImages': endImages.value,
        'lostVolume': lostVolume.value,
    });
    loading.close();
    if(result.status == 200){
        downliadLink(result.result, baseURL+'/');
    }else{
        createMsg(result.msg);
    }
}
/** 
 * 取消任务分配api 
 * @param {String} userKey - 用户ID
 * @param {Array} gcKeyArray - 谱ID数组
 * @returns {Object} {msg:提示信息，status:状态，result:}
 */
 const taskAssignCancel = async (gcKeyArray) => {
    const loading = ElLoading.service({
        lock: true,
        text: 'Loading',
        background: 'rgba(0, 0, 0, 0.7)',
    });
    const result = await index.taskAssignCancel({
        'userKey': userInfo.value.userKey,
        'gcKeyArray': gcKeyArray,
    });
    loading.close();
    if(result.status == 200){
        selectList.value = [];
        assignBatchList();
        getDataList();
    }else{
        createMsg(result.msg);
    }
}

const assignBatchList = async () => {
    const result = await index.assignBatchList({'orgKey': orgKey.value});
    if(result.status == 200){
        allocationBatchList.value = result.data.map((ele) => {
            ele.label = ele.assignBatch;
            ele.value = ele._key;
            return ele;
        });
        allocationBatchList.value.unshift({'label': langData.value['分配批次'], 'value': ''});
    }else{
        createMsg(result.msg);
    }
}

const deliveryBatchList = async () => {
    const result = await index.deliveryBatchList({'orgKey': orgKey.value});
    if(result.status == 200){
        deliverBatchList.value = result.data.map((ele) => {
            ele.label = ele.deliveryBatch;
            ele.value = ele._key;
            return ele;
        });
        deliverBatchList.value.unshift({'label': langData.value['交付批次'], 'value': ''});
    }else{
        createMsg(result.msg);
    }
}

const getOrgList = async () => {
    const result = await index.getOrgList({'userKey': userInfo.value.userKey});
    if(result.status == 200){
        let arr = [];
        result.data.map((ele) => {
            ele.label = ele.orgName;
            ele.value = ele.orgKey;
            if(ele.orgName != 'FS'){
                arr.push(ele);
            }
            return ele;
        });
        orgKeyList.value = arr;
        orgKeyList.value.unshift({'label': langData.value['全部机构'], 'value': ''},);
    }else{
        createMsg(result.msg);
    }
}

const h = ref(window.innerHeight - 140);
const jiapu = ref('');
onMounted(() => {
    if(orgMemberInfo.value.englishName == 'FS'){
        // allocation.value = '0';
    }else{
        orgKey.value = orgMemberInfo.value.orgKey;
    }
    if(getQueryVariable('allocation')){
        allocation.value = getQueryVariable('allocation');
    }
    if(getQueryVariable('deliver')){
        deliver.value = getQueryVariable('deliver').split(',');
    }
    jiapu.value = ref('jiapu');
    getOrgList();
    assignBatchList();
    deliveryBatchList();
    getDataList();
    gcListTotal();
});

const parameter = ref({
    'userKey': userInfo.value.userKey,
    'genealogyName': '',
    'gcKey': '',
    'volumeKey': '',
    'orgKey': '',
    'assignProgress': '',
    'assignBatchKey': '',
    'deliveryProgress': '',
    'deliveryBatchKey': '',
    'gcHasZip': '',
    'Dupbookid': '',
    'startImages': '',
    'endImages': '',
    'lostVolume': ''
});
const handleSearch = () => {
    page.value = 1;
    parameter.value = {
        'userKey': userInfo.value.userKey,
        'genealogyName': genealogyName.value,
        'gcKey': gcKey.value,
        'volumeKey': volumeKey.value,
        'orgKey': orgKey.value,
        'assignProgress': allocation.value,
        'assignBatchKey': allocationBatch.value,
        'deliveryProgress': deliver.value.join(','),
        'deliveryBatchKey': deliverBatch.value,
        'gcHasZip': gcHasZip.value,
        'Dupbookid': Dupbookid.value,
        'startImages': startImages.value,
        'endImages': endImages.value,
        'lostVolume': lostVolume.value
    };
    getDataList();
    gcListTotal();
}

const selectList = ref([]);
const handleSelectionChange = (data) => {
    console.log(data);
    selectList.value = data;
}

// 标记单元格
const cellClassName = ({ row, column, rowIndex, columnIndex }) => {
    if(row.DIFrequency && column.property == 'gcKey'){
        return 'cell-blue';
    }
}

/** 
 * 记录机构下载影像的次数api 
 * @param {Array} gcKeyArray - 谱ID数组
 * @param {Array} orgKey - 机构ID
 * @returns {Object} {msg:提示信息，status:状态，result:可下载谱目ID数组}
 */
 const downloadImageFrequency = async (gcKeyArray) => {
    const loading = ElLoading.service({
        lock: true,
        text: 'Loading',
        background: 'rgba(0, 0, 0, 0.7)',
    });
    const result = await index.downloadImageFrequency({
        'gcKeyArray': gcKeyArray,
        'orgKey': orgMemberInfo.value.orgKey,
    });
    loading.close();
    if(result.status == 200){
        if(result.data && result.data.length){
            let arr = [], downloadList = [];
            selectList.value.forEach((ele) => {
                if(ele.tarPath && result.data.indexOf(ele.gcKey) > -1){
                    arr = arr.concat(ele.tarPath);
                }
            });
            // console.log(arr);
            // zipFiles('家谱索引影响资源-'+Date.now()+'.zip', this.downloadList)
            // arr.length ? arr.forEach((ele, i) => {
            //     let timer = setTimeout(() => {
            //         downliadLink(ele, downloadURL+'/index');
            //         clearTimeout(timer);
            //         timer = null;
            //     }, i*300);
            // }) : null;
            arr.forEach((e, i) => {
                downloadList.push({'name': e.substr(e.lastIndexOf('/')+1), 'url': downloadURL+'/index'+e});
            });
            console.log(downloadList);
            // zipFiles('家谱索引影像资源-'+Date.now()+'.zip', downloadList, () => {});
            downloadImageZip(downloadList);

            arr = null;
            downloadList = null;
            selectList.value = [];
            jiapu.value.clearSelection();
            // getDataList();
        }else{
            createMsg(langData.value['你下载影像次数已超限制!']);
        }
    }else{
        createMsg(result.msg);
    }
}

function downloadImageZip(arr){
    let i = 0, l = arr.length, gcKey = '';

    function fn(){
        try{
            if(arr[i].name.lastIndexOf('_') > -1){
                gcKey = arr[i].name.replace('.tar.gz', '').substr(0, arr[i].name.lastIndexOf('_'));
            }else{
                gcKey = arr[i].name.replace('.tar.gz', '');
            }
            console.log(gcKey);
            zipFiles(arr[i].name.replace('.tar.gz', '')+'.zip', [arr[i]], (d) => {
                if(d == 'error'){
                    
                }else{
                    addDownloadImageFrequency(gcKey);
                }

                i++;
                if(i < l){
                    fn();
                }else{
                    console.log(i);
                    i = null;
                    l = null;
                    gcKey = null;
                    // jiapu.value.toggleRowSelection(row, false);
                }
            });
        }catch(e){
            console.log(e);
            i++;
            if(i < l){
                fn();
            }else{
                console.log(i);
                i = null;
                l = null;
                gcKey = null;
            }
        };
    }

    fn();
}

const addDownloadImageFrequency = async (gcKey) => {
    const loading = ElLoading.service({
        lock: true,
        text: 'Loading',
        background: 'rgba(0, 0, 0, 0.7)',
    });
    const result = await index.addDownloadImageFrequency({
        'gcKeyArray': [gcKey],
        'orgKey': orgMemberInfo.value.orgKey,
        'userKey': userInfo.value.userKey,
    });
    loading.close();
    if(result.status == 200){
        
    }else{
        createMsg(result.msg);
    }
}

const catalogKey = ref('');
const handleClickAction = (row, t) => {
    console.log(row, t);
    if(t === 'lookVolume'){
        catalogKey.value = row.gcKey;
    }
    if(t === 'lookImage'){
        window.open('/imageView?gcKey='+row.gcKey+'&genealogyName='+row.genealogyName);
        // window.open('http://genealogy.1jiapu.com/fs/viewImage?gid='+row.gcKey+'&genealogyName='+row.genealogyName);
    }
    if(t === 'downloadGIK'){
        GIKDownload([row.gcKey]);
    }
    if(t === 'downloadSomeGIK'){
        let arr = [];
        selectList.value.forEach((ele) => {
            arr.push(ele.gcKey);
        });
        GIKDownload(arr);
        arr = null;
        selectList.value = [];
        // if(selectList.value.length){
        //     let arr = [];
        //     selectList.value.forEach((ele) => {
        //         arr.push(ele.gcKey);
        //     });
        //     GIKDownload(arr);
        //     arr = null;
        //     selectList.value = [];
        // }else{
        //     createMsg(langData.value['请勾选需要下载GIK的谱目！']);
        // }
    }
    if(t === 'downloadSomeImage'){
        if(selectList.value.length){
            let arr = [];
            selectList.value.forEach((ele) => {
                arr.push(ele.gcKey);
            });
            downloadImageFrequency(arr);
        }else{
            createMsg(langData.value['请勾选需要下载影像的谱目！']);
        }
    }
    if(t === 'downloadImage'){
        if(row.tarPath){
            selectList.value = [row];
            downloadImageFrequency([row.gcKey]);
        }
    }
    if(t === 'taskAssignCancel'){
        if(selectList.value.length){
            let arr = [];
            selectList.value.forEach((ele) => {
                arr.push(ele.gcKey);
            });
            taskAssignCancel(arr);
        }else{
            createMsg(langData.value['请勾选需要取消分配的谱目！']);
        }
    }
    if(t === 'allocationTask'){
        if(selectList.value.length){
            
        }else{
            return createMsg(langData.value['请勾选需要分配的任务！']);
        }
    }
    if(t === 'edit'){
        catalogKey.value = row.gcKey;
    }
    show.value = t;
}

const show = ref('');

const handleTaskAssignSave = () => {
    show.value = '';
    selectList.value = [];
    assignBatchList();
    getDataList();
}

// 重置检索条件
const handleReset = () => {
    if(orgMemberInfo.value.englishName == 'FS'){
        genealogyName.value = '';
        gcKey.value = '';
        volumeKey.value = '';
        orgKey.value = '';
        allocation.value = '';
        allocationBatch.value = '';
        deliver.value = [];
        deliverBatch.value = '';
        gcHasZip.value = '';
        Dupbookid.value = '';
        startImages.value = '';
        endImages.value = '';
        lostVolume.value = '';
    }else{
        genealogyName.value = '';
        gcKey.value = '';
        volumeKey.value = '';
        allocationBatch.value = '';
        deliver.value = [];
        deliverBatch.value = '';

        gcHasZip.value = '';
        Dupbookid.value = '';
        startImages.value = '';
        endImages.value = '';
        lostVolume.value = '';
    }

    // downloadImageZip([
    //     {'name': '3014984930_1.tar.gz', 'url': 'https://indexserver.1jiapu.com/index/CN3065570/3014984930/3014984930_1.tar.gz'},
    //     {'name': '3014984930_2.tar.gz', 'url': 'https://indexserver.1jiapu.com/index/CN3065570/3014984930/3014984930_2.tar.gz'},
    // ]);
}

watch(deliverBatch, (nv ,ov) => {
    if(nv){
        allocation.value = '1';
    }else{

    }
});

watch(deliver, (nv ,ov) => {
    if(nv.length){
        allocation.value = '1';
    }else{

    }
});

watch(allocationBatch, (nv ,ov) => {
    if(nv){
        allocation.value = '1';
    }else{

    }
});

watch(gcHasZip, (nv ,ov) => {
    if(nv){
        allocation.value = '';
    }else{

    }
});

// 展开、收起
const searchMore = ref(false);
watch(searchMore, (nv ,ov) => {
    if(nv){
        h.value = h.value - 40;
    }else{
        h.value = h.value + 40;
    }
});
// adj影像=双页+单页/2 双页影像总数
</script>

<template>
    <section class="catalog-detail-wrap">
        <header class="header">
            <div class="left">
                <h3>{{langData['谱目详情']}}</h3>
            </div>
            <div class="right">
                <el-button type="primary" size="small" @click="gcListDownload">{{langData['下载谱目列表']}}</el-button>
                <el-button v-if="orgMemberInfo.englishName == 'FS' && orgMemberInfo.role == 1" type="primary" size="small" @click="handleClickAction('', 'batchAllocation')">{{langData['批量分配']}}</el-button>
                <el-button v-if="orgMemberInfo.englishName == 'FS' && orgMemberInfo.role == 1" type="primary" size="small" @click="handleClickAction('', 'allocationTask')">{{langData['任务分配']}}</el-button>
                <el-popconfirm
                    v-if="orgMemberInfo.englishName == 'FS' && orgMemberInfo.role == 1 && selectList.length && allocation == 1 && !(deliver.indexOf('2') > -1 || deliver.indexOf('3') > -1 || deliver.indexOf('4') > -1 || deliver.indexOf('5') > -1 || deliver.indexOf('6') > -1) && deliver.length"
                    width="220"
                    :confirm-button-text="langData['确定']"
                    :cancel-button-text="langData['取消']"
                    :title="langData['您确认取消已分配的谱目吗?']"
                    @confirm="handleClickAction({}, 'taskAssignCancel')"
                >
                    <template #reference>
                        <el-button type="primary" size="small">{{langData['取消任务分配']}}</el-button>
                    </template>
                </el-popconfirm>
                <el-button v-if="orgMemberInfo.englishName !== 'FS' && orgMemberInfo.role <= 2" type="primary" size="small" @click="handleClickAction({}, 'downloadSomeImage')">{{langData['批量下载影像']}}</el-button>
                <el-button v-if="orgMemberInfo.englishName !== 'FS' && orgMemberInfo.role <= 2" type="primary" size="small" @click="handleClickAction({}, 'downloadSomeGIK')">{{langData['批量下载GIK']}}</el-button>
            </div>
        </header>
        <main class="main">
            <div class="search-wrap">
                <el-input v-model="genealogyName" class="w150" :placeholder="langData['谱名']" clearable />
                <el-input v-model="gcKey" class="w150" :placeholder="langData['谱ID']" clearable />
                <el-input v-model="volumeKey" class="w150" :placeholder="langData['卷ID']" clearable />
                <el-select v-if="orgMemberInfo.englishName == 'FS'" v-model="orgKey" class="w150" :placeholder="langData['机构列表']">
                    <el-option v-for="item in orgKeyList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <el-select v-if="orgMemberInfo.englishName == 'FS'" v-model="allocation" class="w150" :placeholder="langData['分配进度']">
                    <el-option v-for="item in allocationList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <el-select v-model="allocationBatch" class="w150" :placeholder="langData['分配批次']">
                    <el-option v-for="item in allocationBatchList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <el-select v-model="deliver" class="w150" :placeholder="langData['交付进度']" multiple>
                    <el-option v-for="item in deliverList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <el-select v-model="deliverBatch" class="w150" :placeholder="langData['交付批次']">
                    <el-option v-for="item in deliverBatchList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <el-button type="primary" @click="handleSearch">{{langData['检索']}}</el-button>
                <el-button class="marginL10" type="primary" @click="handleReset">{{langData['重置']}}</el-button>
                <el-checkbox class="marginL10" v-model="searchMore" :label="!searchMore ? langData['展开'] : langData['收起']" />
            </div>
            <div class="search-wrap" v-if="searchMore">
                <el-select v-model="gcHasZip" class="w150">
                    <el-option v-for="item in gcHasZipList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <el-select v-model="Dupbookid" class="w150">
                    <el-option v-for="item in DupbookidList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <el-input v-model="startImages" class="w100" :placeholder="langData['开始页数']" clearable />
                <el-input v-model="endImages" class="w100" :placeholder="langData['结束页数']" clearable />
                <el-select v-model="lostVolume" class="w150">
                    <el-option v-for="item in lostVolumeList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </div>
            <el-table 
                ref="jiapu"
                :data="tableData" 
                border 
                :height="h"
                style="width: 100%"
                v-loading="loading"
                :cell-class-name="cellClassName"
                @selection-change="handleSelectionChange">
                <el-table-column type="selection" width="55" align="center" fixed="left" />
                <el-table-column prop="gcKey" :label="langData['谱ID']" width="120" align="center" fixed="left" />
                <el-table-column prop="surname" :label="langData['姓氏']" width="100" align="center" fixed="left" />
                <el-table-column prop="genealogyName" :label="langData['谱名']" min-width="150" align="center" fixed="left" />
                <el-table-column prop="publish" :label="langData['出版年']" width="100" align="center" />
                <el-table-column prop="place" :label="langData['谱籍地(现代)']" min-width="150" align="center" />
                <el-table-column prop="volume" :label="langData['总卷数']" width="100" align="center" />
                <el-table-column prop="volumeNumber" :label="langData['实拍卷册']" width="150" align="center" />
                <el-table-column prop="lostVolume" :label="langData['缺卷说明']" width="150" align="center" />
                <el-table-column prop="imageCountO" :label="langData['影像页数']" width="150" align="center" />
                <el-table-column prop="ADJImageCount" :label="langData['adj影像']" width="150" align="center" />
                <el-table-column prop="assignProgressO" :label="langData['分配进度']" width="150" align="center" />
                <el-table-column prop="assignBatch" :label="langData['分配批次']" width="150" align="center" />
                <el-table-column prop="assignOrgName" :label="langData['分配机构']" width="100" align="center" />
                <el-table-column prop="deliveryProgressO" :label="langData['交付进度']" width="150" align="center" />
                <el-table-column prop="deliveryBatch" :label="langData['交付批次']" width="150" align="center" />
                <el-table-column prop="Dupbookid" :label="langData['重复谱ID']" width="150" align="center" />
                <el-table-column :label="langData['操作']" fixed="right" width="200" align="left">
                    <template #default="scope">
                        <el-button size="small" type="primary" v-if="['1545060463', '15908066', '657446338'].indexOf(userInfo.userKey) > -1" @click="handleClickAction(scope.row, 'edit')">{{langData['编辑']}}</el-button>
                        <el-button size="small" type="primary" @click="handleClickAction(scope.row, 'lookVolume')">{{langData['查看卷册']}}</el-button>
                        <el-button v-if="scope.row.gcHasZip == 1" size="small" type="primary" @click="handleClickAction(scope.row, 'lookImage')">{{langData['查看影像']}}</el-button>
                        <el-button class="noMargin" v-if="orgMemberInfo.englishName !== 'FS' && orgMemberInfo.role <= 2 && scope.row.tarPath && scope.row.tarPath.length" size="small" type="primary" @click="handleClickAction(scope.row, 'downloadImage')">{{langData['下载影像']}}</el-button>
                        <el-button v-if="orgMemberInfo.englishName !== 'FS' && orgMemberInfo.role == 1" size="small" type="primary" @click="handleClickAction(scope.row, 'downloadGIK')">{{langData['下载 GIK']}}</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </main>
        <footer class="footer">
            <div class="left">
                <p class="statistics">{{langData['当前']}} {{currentPages}} {{langData['条谱目']}}, {{currentImages}} {{langData['影像页']}}, {{currentADJImages}} {{langData['adj影像页']}}</p>
                <p class="statistics">{{langData['合计']}} {{total}} {{langData['条谱目']}}, {{totalImages}} {{langData['影像页']}}, {{ADJImageCount}} {{langData['adj影像页']}}</p>
            </div>
            <div class="right">
                <el-pagination
                    small
                    background
                    layout="prev, pager, next, jumper, total"
                    :current-page="page"
                    :page-size="limit"
                    :total="total"
                    @current-change="handleCurrentChange"
                />
            </div>
        </footer>
    </section>
    <!-- 卷册列表 -->
    <VolumeListModule v-if="show === 'lookVolume'" :catalogKey="catalogKey" :volumeKey="volumeKey" v-on:close="show = ''" />
    <!-- 任务分配 -->
    <TaskAssign v-if="show === 'allocationTask'" :list="selectList" v-on:close="show = ''" v-on:save="handleTaskAssignSave" />
    <!-- 批量任务分配 -->
    <BatchTaskAssign v-if="show === 'batchAllocation'" :parameter="parameter" v-on:close="show = ''" v-on:save="handleTaskAssignSave" />
    <!-- 编辑谱目 -->
    <EditCatalog v-if="show === 'edit'" :catalogKey="catalogKey" v-on:close="show = ''" v-on:save="handleTaskAssignSave" />
</template>

<style scoped lang="scss">
.catalog-detail-wrap{
    position: relative;
    width: 100%;
    height: 100%;
    .header{
        height: 5rem;
        width: calc(100% - 4rem);
        padding: 0 2rem;
        background: #fff;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 1.8rem;
        .left{
            display: flex;
            align-items: center;
        }
        .right{
            display: flex;
            align-items: center;
        }
    }
    .main{
        width: calc(100% - 4rem);
        height: calc(100% - 10rem);
        padding: 0 2rem;
        font-size: 2.5rem;
        .search-wrap{
            display: flex;
            align-items: center;
            height: 4rem;
        }
    }
    .footer{
        width: calc(100% - 4rem);
        padding: 0 2rem;
        height: 5rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        .left{
            // display: flex;
            // align-items: center;
            font-size: 1.2rem;
            .statistics{
                height: 50%;
            }
        }
        .right{
            display: flex;
            align-items: center;
        }
    }
}
.w150{
    width: 150px;
    z-index: 1000;
}
.w200{
    width: 200px;
    z-index: 1000;
}
.w100{
    width: 100px;
}
.marginL10{
    margin-left: 10px;
}
.noMargin{
    margin: 0 !important;
}
</style>