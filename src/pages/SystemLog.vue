<script setup>
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useGlobalStore } from '../store/global.js';
import { setValue, createMsg, formattedDate } from '../util/ADS.js';
import { baseURL, index } from '../util/api';

const router = useRouter();

const global = useGlobalStore();
const { userInfo, orgMemberInfo, langData, lanType } = storeToRefs(global);
const { orgList } = global;

const orgKey = ref('');
const logType = ref('');
const logTypeList = ref([]);
const userName = ref('');
const createTime = ref('');
const status = ref('2');
const statusList = ref([
    {'label': langData.value['全部'], 'value': ''},
    {'label': langData.value['已读'], 'value': '1'},
    {'label': langData.value['未读'], 'value': '2'},
]);

const page = ref(1);
const limit = ref(30);
const total = ref(0);
const handleCurrentChange = (data) => {
    console.log(data);
    page.value = data;
    getDataList();
}

const tableData = ref([]);
const h = ref(window.innerHeight - 140);

/** 
 * 日志列表api 
 * @param {string} userName - 操作人员名称
 * @param {string} orgKey - 机构key
 * @param {string} logType - 日志类型
 * @param {Number} startTime - 开始时间
 * @param {Number} endTime - 结束时间
 * @param {Number} page - page
 * @param {Number} limit - limit
 * @returns {Object} {msg: 提示信息，status: 状态，data: {list: 日志列表, pageNum: 分页数, total: 总条数}}
 */
 const getDataList = async () => {
    const result = await index.getLog({
        'userKey': userInfo.value.userKey,
        'status': status.value,
        'userName': userName.value,
        'orgKey': orgKey.value,
        'logType': logType.value,
        'startTime': createTime.value ? new Date(createTime.value[0]).getTime() : '',
        'endTime': createTime.value ? new Date(createTime.value[1]).getTime()+24*60*60*1000-1 : '',
        'page': page.value,
        'limit': limit.value,
    });
    if(result.status == 200){
        tableData.value = result.result.list.map((ele) => {
            ele.createTime = formattedDate(ele.time);
            ele.type = lanType.value == 'en' ? ele.logTypeEnglish : ele.logType;
            return ele;
        });
        total.value = result.result.total;
    }else{
        createMsg(result.msg);
    }
}

/** 
 * 操作日志类型api 
 * @returns {Object} {msg: 提示信息，status: 状态，data: {list: 日志列表, pageNum: 分页数, total: 总条数}}
 */
 const getLogType = async () => {
    const result = await index.logType({});
    if(result.status == 200){
        let arr = [{'label': langData.value['日志类型'], 'value': ''},];
        result.data.forEach((ele) => {
            arr.push({'label': lanType.value == 'en' ? ele.en : ele.zh, 'value': ele.zh});
        });
        logTypeList.value = arr;
    }else{
        createMsg(result.msg);
    }
}

/** 
 * 日志消息一键已读 api 
 * @returns {Object} {msg: 提示信息，status: 状态，data: {list: 日志列表, pageNum: 分页数, total: 总条数}}
 */
 const logOneKeyRead = async () => {
    const result = await index.logOneKeyRead({'userKey': userInfo.value.userKey});
    if(result.status == 200){
        handleSearch();
    }else{
        createMsg(result.msg);
    }
}

/** 
 * 日志消息单条已读 api 
 * @returns {Object} {msg: 提示信息，status: 状态，data: {list: 日志列表, pageNum: 分页数, total: 总条数}}
 */
 const logSingleRead = async (indexLogKey) => {
    const result = await index.logSingleRead({'userKey': userInfo.value.userKey, 'indexLogKey': indexLogKey});
    if(result.status == 200){
        createMsg('该条日志标记已读成功!', true);
        handleSearch();
    }else{
        createMsg(result.msg);
    }
}

const handleClickAction = (row, t) => {
    if(t === 'read'){
        logSingleRead(row._key);
    }
}

const handleSearch = () => {
    getDataList();
}

onMounted(() => {
    if(orgMemberInfo.value.englishName == 'FS'){
        
    }else{
        orgKey.value = orgMemberInfo.value.orgKey;
    }
    getLogType();
    getDataList();
});

</script>

<template>
    <section class="system-log-wrap">
        <header class="header">
            <div class="left">
                <h3>{{langData['操作日志']}}</h3>
            </div>
            <div class="right">
                <el-button type="primary" @click="logOneKeyRead">{{langData['一键已读']}}</el-button>
            </div>
        </header>
        <main class="main">
            <div class="search-wrap">
                <el-select v-model="status" class="w150">
                    <el-option v-for="item in statusList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <el-select v-if="orgMemberInfo.englishName == 'FS' && orgMemberInfo.role <= 1" v-model="orgKey" class="w150" :placeholder="langData['机构列表']">
                    <el-option v-for="item in orgList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <el-select v-if="!(orgMemberInfo.englishName == 'FS' && orgMemberInfo.role == 3)" v-model="logType" class="w150" :placeholder="langData['日志类型']">
                    <el-option v-for="item in logTypeList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <el-input v-if="!(orgMemberInfo.englishName == 'FS' && orgMemberInfo.role == 3)"  v-model="userName" class="w150" :placeholder="langData['操作人员']" clearable />
                <el-date-picker
                    class="w240"
                    v-model="createTime"
                    type="daterange"
                    range-separator="-"
                    :start-placeholder="langData['开始时间']"
                    :end-placeholder="langData['结束时间']"
                />
                <el-button type="primary" @click="handleSearch">{{langData['检索']}}</el-button>
            </div>
            <el-table 
                :data="tableData" 
                border 
                :height="h"
                style="width: 100%">
                <el-table-column prop="type" :label="langData['日志类型']" align="center" width="200" />
                <el-table-column prop="orgName" :label="langData['相关机构']" align="center" width="120" />
                <el-table-column prop="userName" :label="langData['操作人员']" align="center" width="120" />
                <el-table-column prop="createTime" :label="langData['操作时间']" align="center" width="110" />
                <el-table-column prop="log" :label="langData['日志内容']" align="center" />
                <el-table-column v-if="status == 2" :label="langData['操作']" width="120" align="center">
                    <template #default="scope">
                        <el-button size="small" type="primary" @click="handleClickAction(scope.row, 'read')">{{langData['已读']}}</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </main>
        <footer class="footer">
            <div class="left"></div>
            <div class="rigth">
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
</template>

<style scoped lang="scss">
.system-log-wrap{
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