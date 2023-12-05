<script setup>
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useGlobalStore } from '../store/global.js';
import { 
    createMsg, 
    getCurrentMonthZero,
    getDays, 
    thousands,
    initDownloadExcel, 
} from '../util/ADS.js';
import { baseURL, index, org } from '../util/api';

const router = useRouter();

const global = useGlobalStore();
const { userInfo, orgMemberInfo, langData, lanType } = storeToRefs(global);
const { } = global;

const orgKey = ref('');
const createTime = ref('');
const tableData = ref([]);
const h = ref(window.innerHeight - 140);
const loading = ref(false);
const orgList = ref([]);
const orgObj = ref({});
/** 
 * 影像入库报表api 
 * @param {string} orgKey - 机构ID
 * @param {string} startTime - 开始时间
 * @param {string} endTime - 结束时间
 * @returns {Object} {msg: 提示信息，status: 状态，data: 统计数据}
 */
 const getDataList = async () => {
    console.time('get image store report');
    loading.value = true;
    const result = await index.imageInStoreReport({
        'orgKey': orgKey.value,
        'startTime': createTime.value ? new Date(createTime.value[0]).getTime() : '',
        'endTime': createTime.value ? new Date(createTime.value[1]).getTime()+getDays(new Date(createTime.value[1]).getTime())-1 : '', 
    });
    loading.value = false;
    console.timeEnd('get image store report');
    if(result.status == 200){
        tableData.value = result.data.map((ele) => {
            if(ele.year){
                ele.time = ele.year+''+(ele.month >= 10 ? ele.month : '0'+ele.month);
                ele.orgName = orgKey.value ? orgObj.value[orgKey.value] : langData.value['全部机构'];
            }else{
                ele.time = langData.value['合计'];
            }

            ele.waitCompleteGCCount = thousands(ele.waitCompleteGCCount);
            ele.waitCompleteImageCount = thousands(ele.waitCompleteImageCount);
            ele.finishGCCount = thousands(ele.finishGCCount);
            ele.finishImageCount = thousands(ele.finishImageCount);
            ele.indexGCCount = thousands(ele.indexGCCount);
            ele.indexImageCount = thousands(ele.indexImageCount);
            ele.indexADJImageCount = thousands(ele.indexADJImageCount);
            
            return ele;
        });
        console.table(tableData.value);
    }else{
        createMsg(result.msg);
    }
}
/** 
 * 认领机构api 
 * @param {string} orgKey - 机构ID
 * @param {string} startTime - 开始时间
 * @param {string} endTime - 结束时间
 * @returns {Object} {msg: 提示信息，status: 状态，data: 统计数据}
 */
 const getOrgList = async () => {
    loading.value = true;
    const result = await org.getOrgList({
        'siteKey': '1528234980',
        'orgKey': '',
        'name': '',
    });
    loading.value = false;
    if(result.status == 200){
        let O = {};
        orgList.value = result.data.map((ele) => {
            ele.label = lanType.value == 'en' ? ele.englishName : ele.name;
            ele.value = ele._key;
            O[ele._key] = lanType.value == 'en' ? ele.englishName : ele.name;
            return ele;
        });
        orgObj.value = O;
        orgList.value.unshift({'label': langData.value['机构列表'], 'value': ''});
    }else{
        createMsg(result.msg);
    }
}

onMounted(() => {
    if(orgMemberInfo.value.englishName == 'FS'){
        
    }else{
        orgKey.value = orgMemberInfo.value.orgKey;
    }
    createTime.value = [Date.parse('2022-9'), getCurrentMonthZero(0)];
    getOrgList();
    getDataList();
});

// 下载excel
const handleDownload = () => {
    let aoa = [], t = [], name = langData.value['影像入库报表'];
    ['月份', '机构名称', '编目待完结谱目数', '编目待完结影像数', '编目完结谱目数', '编目完结影像数', '可索引谱目数', '可索引影像数', '可索引adj影像数'].forEach((ele) => {
        t.push(langData.value[ele]);
    });
    aoa.push(t);
    tableData.value.forEach((ele) => {
        aoa.push([ele.time, ele.orgName, ele.waitCompleteGCCount, ele.waitCompleteImageCount, ele.finishGCCount, ele.finishImageCount, ele.indexGCCount, ele.indexImageCount, ele.indexADJImageCount]);
    });

    initDownloadExcel(aoa, name);
}

</script>

<template>
    <section class="ImageStorageReport-wrap">
        <header class="header">
            <div class="left">
                <h3>{{langData['影像入库报表']}}</h3>
            </div>
            <div class="right">
                <el-button v-if="tableData.length" type="primary" @click="handleDownload">{{langData['下载Excel']}}</el-button>
            </div>
        </header>
        <main class="main">
            <div class="search-wrap">
                <!-- <el-select v-if="orgMemberInfo.englishName == 'FS'" v-model="orgKey" class="w150" :placeholder="langData['机构列表']" clearable>
                    <el-option v-for="item in orgList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select> -->
                <el-date-picker
                    class="w240"
                    v-model="createTime"
                    type="monthrange"
                    range-separator="-"
                    :start-placeholder="langData['开始时间']"
                    :end-placeholder="langData['结束时间']"
                />
                <el-button type="primary" @click="getDataList">{{langData['检索']}}</el-button>
            </div>
            <el-table 
                v-loading="loading"
                :data="tableData" 
                border 
                :height="h"
                style="width: 100%">
                <el-table-column prop="time" :label="langData['月份']" align="center" />
                <!-- <el-table-column prop="orgName" :label="langData['机构名称']" align="center" /> -->
                <el-table-column :label="langData['编目待完结']" :align="'center'">
                    <el-table-column prop="waitCompleteGCCount" :label="langData['谱目数']" align="center" />
                    <el-table-column prop="waitCompleteImageCount" :label="langData['影像数']" align="center" />
                </el-table-column>
                <el-table-column :label="langData['编目完结']" :align="'center'">
                    <el-table-column prop="finishGCCount" :label="langData['谱目数']" align="center" />
                    <el-table-column prop="finishImageCount" :label="langData['影像数']" align="center" />
                </el-table-column>
                <el-table-column :label="langData['可索引']" :align="'center'">
                    <el-table-column prop="indexGCCount" :label="langData['谱目数']" align="center" />
                    <el-table-column prop="indexImageCount" :label="langData['影像数']" align="center" />
                    <el-table-column prop="indexADJImageCount" :label="langData['adj影像数']" align="center" />
                </el-table-column>
            </el-table>
        </main>
        <footer class="footer">
            <div class="left"></div>
            <div class="rigth">
                
            </div>
        </footer>
    </section>
</template>

<style scoped lang="scss">
.ImageStorageReport-wrap{
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
            // display: flex;
            justify-content: flex-start;
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
            display: flex;
            align-items: center;
        }
        .right{
            display: flex;
            align-items: center;
        }
    }
}
.w150{
    width: 150px;
}
.marginL10{
    margin-left: 10px;
}
.inline-block{
    display: inline-block;
}
</style>