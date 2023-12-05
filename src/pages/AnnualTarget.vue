<script setup>
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useGlobalStore } from '../store/global.js';
import { setValue, createMsg, formattedDate, thousands } from '../util/ADS.js';
import { baseURL, index } from '../util/api';
import { ElLoading } from 'element-plus';
import AddModule from '../components/AnnualTarget/AddModule.vue';
import MonthTarget from '../components/AnnualTarget/MonthTarget.vue';

const router = useRouter();

const global = useGlobalStore();
const { userInfo, orgMemberInfo, langData, lanType, orgList } = storeToRefs(global);

const orgKey = ref('');
const orgListArr = ref([]);
const startYear = ref('');
const endYear = ref('');
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
 * 年度目标api 
 * @param {string} type - type 1 年度目标 FS管理员 2 月度目标 机构管理员
 * @param {string} orgKey - 机构key
 * @param {Number} startYear - 开始时间
 * @param {Number} endYear - 结束时间
 * @param {Number} page - page
 * @param {Number} limit - limit
 * @returns {Object} {msg: 提示信息，status: 状态，data: {list: 日志列表, pageNum: 分页数, total: 总条数}}
 */
 const getDataList = async () => {
    console.time('get target report');
    const loading = ElLoading.service({
        lock: true,
        text: 'Loading',
        background: 'rgba(0, 0, 0, 0.7)',
    });
    const result = await index.getTargetList({
        'type': '1',
        'orgKey': orgKey.value,
        'startYear': startYear.value,
        'endYear': endYear.value,
        'sortField': sortField.value,
        'sortType': sortType.value,
        'page': page.value,
        'limit': limit.value,
    });
    loading.close();
    console.timeEnd('get target report');
    if(result.status == 200){
        tableData.value = result.result.list.map((ele) => {
            ele.targetNumberO = thousands(ele.targetNumber);
            
            return ele;
        });
        total.value = result.result.total;
    }else{
        createMsg(result.msg);
    }
}

/** 
 * 删除年度/月度目标 api 
 * @param {string} type - type 1 年度目标 FS管理员 2 月度目标 机构管理员
 * @param {string} orgKey - 机构key
 * @param {Number} startYear - 开始时间
 * @param {Number} endYear - 结束时间
 * @param {Number} page - page
 * @param {Number} limit - limit
 * @returns {Object} {msg: 提示信息，status: 状态，data: {list: 日志列表, pageNum: 分页数, total: 总条数}}
 */
 const deleteTarget = async (row) => {
    const loading = ElLoading.service({
        lock: true,
        text: 'Loading',
        background: 'rgba(0, 0, 0, 0.7)',
    });
    const result = await index.deleteTarget({
        'userKey': userInfo.value.userKey,
        'targetKey': row._key,
    });
    loading.close();
    if(result.status == 200){
        createMsg('删除成功!', true);
        handleSearch();
    }else{
        createMsg(result.msg);
    }
}

const handleSearch = () => {
    page.value = 1;
    getDataList();
}

const show  = ref('');
const dataRow = ref({});
const handleClickAction = (row, t) => {
    console.log(row);
    dataRow.value = row;
    if(t === 'delete'){
        deleteTarget(row);
    }
    show.value = t;
}

const handleSave = () => {
    show.value = '';
    handleSearch();
}

onMounted(() => {
    if(orgMemberInfo.value.englishName == 'FS'){
        
    }else{
        orgKey.value = orgMemberInfo.value.orgKey;
    }
    orgListArr.value = orgList.value.filter((ele) => {
        return ele.label != 'FS';
    });
    getDataList();
});

const sortField = ref('');
const sortType = ref('');
const sortChangeEvent = ({column, prop, order}) => {
    console.log(column, prop, order);
    sortField.value = prop;
    sortType.value = order === 'ascending' ? 'asc' : order === 'descending' ? 'desc' : 'auto';

    getDataList();
}

</script>

<template>
    <section class="wrap">
        <header class="header">
            <div class="left">
                <h3>{{langData['目标设置']}}</h3>
            </div>
            <div class="right">
                <el-button v-if="orgMemberInfo.englishName == 'FS' && orgMemberInfo.role == 1" type="primary" @click="handleClickAction({}, 'add')">{{langData['新增']}}</el-button>
            </div>
        </header>
        <main class="main">
            <div class="search-wrap">
                <el-select v-if="orgMemberInfo.englishName == 'FS'" v-model="orgKey" class="w150" :placeholder="langData['机构列表']" clearable>
                    <el-option v-for="item in orgListArr" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <el-date-picker
                    class="w150"
                    v-model="startYear"
                    value-format="YYYY"
                    type="year"
                    :placeholder="langData['开始时间']"
                />
                <el-date-picker
                    class="w150"
                    v-model="endYear"
                    value-format="YYYY"
                    type="year"
                    :placeholder="langData['结束时间']"
                />
                <el-button type="primary" @click="handleSearch">{{langData['检索']}}</el-button>
            </div>
            <el-table 
                :data="tableData" 
                border 
                :height="h"
                style="width: 100%"
                @sort-change="sortChangeEvent">
                <el-table-column prop="year" :label="langData['年份']" align="center" sortable="custom" />
                <el-table-column prop="orgName" :label="langData['机构名称']" align="center" />
                <el-table-column prop="targetNumberO" :label="langData['目标节点数']" align="center" />
                <el-table-column :label="langData['操作']" width="200" align="center">
                    <template #default="scope">
                        <el-button v-if="orgMemberInfo.englishName == 'FS' && orgMemberInfo.role == 1" size="small" type="primary" @click="handleClickAction(scope.row, 'edit')">{{langData['编辑']}}</el-button>
                        <el-button v-if="orgMemberInfo.englishName != 'FS' && orgMemberInfo.role == 1" size="small" type="primary" @click="handleClickAction(scope.row, 'look')">{{langData['查看']}}</el-button>
                        <el-popconfirm
                            v-if="orgMemberInfo.englishName == 'FS' && orgMemberInfo.role == 1"
                            width="220"
                            :confirm-button-text="langData['确定']"
                            :cancel-button-text="langData['取消']"
                            :title="langData['您确认要删除吗?']"
                            @confirm="handleClickAction(scope.row, 'delete')"
                        >
                            <template #reference>
                                <el-button type="primary" size="small">{{langData['删除']}}</el-button>
                            </template>
                        </el-popconfirm>
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
    <!-- FS 新增、编辑 -->
    <AddModule v-if="show === 'edit' || show === 'add'" :originData="dataRow" v-on:close="show = ''" v-on:save="handleSave" />
    <!-- 供应商 新增、编辑、预览 -->
    <MonthTarget v-if="show === 'look'" :originData="dataRow" v-on:close="show = ''" v-on:save="handleSave" />
</template>

<style scoped lang="scss">
.wrap{
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
.marginL10{
    margin-left: 10px;
}
</style>