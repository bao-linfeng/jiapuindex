<script setup>
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useGlobalStore } from '../store/global.js';
import { setValue, createMsg, formattedDate } from '../util/ADS.js';
import { baseURL, index } from '../util/api';
import { useTable } from '../composables/useTable.js';

const router = useRouter();

const global = useGlobalStore();
const { userInfo, orgMemberInfo, langData, lanType } = storeToRefs(global);
const { orgList } = global;

const allocationList = ref([
    {'label': langData.value['分配进度'], 'value': ''},
    {'label': langData.value['待分配'], 'value': 1},
    {'label': langData.value['已分配'], 'value': 2},
]);
const isInDetailList = ref([
    {'label': langData.value['谱目详情'], 'value': ''},
    {'label': langData.value['是'], 'value': 1},
    {'label': langData.value['否'], 'value': 2},
]);

const h = ref(window.innerHeight - 140);

const orgKeyList = ref([]);

const params = ref({
    'gcKey': '',
    'genealogyName': '',
    'isGCList': '',
    'assignProgress': '',
    'indexOrgKey': '',
}); 

// 检索
const handleSearch = () => {
    pagination.reset();
    refresh(params.value);
}

const [tableData, refresh, loading, pagination] = useTable(index.getIndexGCConditionChangeList, params.value,
    {
        path: {
            data: 'data',
            total: 'total',
            page: 'page',
            size: 'limit'
        },
        immediate: true
    });

onMounted(() => {
    orgKeyList.value = [{'label': langData.value['全部机构'], 'value': ''}].concat(orgList);
});

</script>

<template>
    <section class="update-log-wrap">
        <header class="header">
            <div class="left">
                <h3>{{langData['家谱索引入库谱目状态修改记录']}}</h3>
            </div>
            <div class="right">
                
            </div>
        </header>
        <main class="main">
            <div class="search-wrap">
                <el-input v-model="params.gcKey" class="w150" :placeholder="langData['谱ID']" clearable />
                <el-input v-model="params.genealogyName" class="w150" :placeholder="langData['谱名']" clearable />
                <el-select v-model="params.isGCList" class="w150" :placeholder="langData['谱目详情']">
                    <el-option v-for="item in isInDetailList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <el-select v-model="params.assignProgress" class="w150" :placeholder="langData['分配进度']">
                    <el-option v-for="item in allocationList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <el-select v-model="params.indexOrgKey" class="w150" :placeholder="langData['机构列表']" clearable>
                    <el-option v-for="item in orgKeyList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <el-button type="primary" @click="handleSearch">{{langData['检索']}}</el-button>
            </div>
            <el-table 
                :data="tableData" 
                border 
                :height="h"
                style="width: 100%">
                <el-table-column prop="gcKey" :label="langData['谱ID']" align="center" width="120" />
                <el-table-column prop="genealogyName" :label="langData['谱名']" align="center" />
                <el-table-column prop="indexOrgName" :label="langData['分配机构']" align="center" width="120" />
                <el-table-column prop="isInGCList" :label="langData['谱目详情']" align="center" width="120" />
                <el-table-column prop="condition" :label="langData['谱状态']" align="center" width="110" />
                <el-table-column prop="platform" :label="langData['操作平台']" align="center" />
                <el-table-column prop="userName" :label="langData['操作人员']" align="center" />
                <el-table-column prop="createTime" :label="langData['操作时间']" align="center" />
                <el-table-column prop="log" :label="langData['操作日志']" align="center" />
                <el-table-column prop="explain" :label="langData['说明']" align="center" />
            </el-table>
        </main>
        <footer class="footer">
            <div class="left"></div>
            <div class="rigth">
                <el-pagination
                    small
                    background
                    layout="prev, pager, next, jumper, total"
                    :current-page="pagination.current"
                    :page-size="pagination.size"
                    :total="pagination.total"
                    @current-change="pagination.onPageChange"
                />
            </div>
        </footer>
    </section>
</template>

<style scoped lang="scss">
.update-log-wrap{
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