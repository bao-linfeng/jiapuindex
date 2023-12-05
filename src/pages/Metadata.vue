<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useGlobalStore } from '../store/global.js';
import { setValue, createMsg } from '../util/ADS.js';
import { baseURL } from '../util/api';
import ExamineModule from '../components/deliveryreport/examineModule.vue';
import ReturnReasonModule from '../components/deliveryreport/ReturnReasonModule.vue';
import EditBatchName from '../components/deliveryreport/EditBatchName.vue';
import LogModule from '../components/deliveryreport/LogModule.vue';

const router = useRouter();

const global = useGlobalStore();
const { userInfo } = storeToRefs(global);
const { } = global;

const orgKeyO = ref('');
const orgKeyList = ref([
    {'label': '全部机构', 'value': ''},
    {'label': '时光科技', 'value': '123456'},
]);
const deliver = ref('');
const deliverList = ref([
    {'label': '交付进度', 'value': ''},
    {'label': '未索引', 'value': '0'},
    {'label': '待递交', 'value': '1'},
    {'label': '待审核', 'value': '2'},
    {'label': '已审核', 'value': '3'},
]);
const deliverBatch = ref('');

const page = ref(1);
const pages = ref(0);
const limit = ref(30);
const total = ref(120);
const handleCurrentChange = (data) => {
    console.log(data);
    page.value = data;
}

const tableData = ref([
    {},
]);

const h = ref(window.innerHeight - 140);
onMounted(() => {
    
});

const selectList = ref([]);
const handleSelectionChange = (data) => {
    console.log(data);
    selectList.value = data;
}
</script>

<template>
    <section class="metadata-wrap">
        <header class="header">
            <div class="left">
                <h3>Metadata</h3>
            </div>
            <div class="right">
                
            </div>
        </header>
        <main class="main">
            <div class="search-wrap">
                <el-select v-model="orgKeyO" class="w150" placeholder="机构列表" size="small">
                    <el-option v-for="item in orgKeyList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <el-select v-model="deliver" class="w150" placeholder="交付进度" size="small">
                    <el-option v-for="item in deliverList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <el-input v-model="deliverBatch" class="w150" placeholder="交付批次" size="small" clearable />
                <el-button type="primary" size="small">检索</el-button>
            </div>
            <el-table 
                :data="tableData" 
                border 
                :height="h"
                style="width: 100%"
                @selection-change="handleSelectionChange">
                <el-table-column type="selection" width="55" align="center" />
                <el-table-column prop="gcKey" label="谱ID" width="100" align="center" />
                <el-table-column prop="volumeKey" label="卷ID" min-width="100" align="center" />
                <el-table-column prop="surname" label="姓氏" width="120" align="center" />
                <el-table-column prop="genealogyName" label="谱名" width="100" align="center" />
                <el-table-column prop="publish" label="出版年" width="100" align="center" />
                <el-table-column prop="firstAncestor" label="一世祖" width="100" align="center" />
                <el-table-column prop="migrationAncestor" label="始迁祖" width="100" align="center" />
                <el-table-column prop="volume" label="总卷数" width="100" align="center" />
                <el-table-column prop="lostVolume" label="缺卷说明" width="100" align="center" />
                <el-table-column prop="Volume" label="序号" width="100" align="center" />
                <el-table-column prop="version" label="版本类型" width="100" align="center" />
                <el-table-column prop="startYear" label="起始年" width="100" align="center" />
                <el-table-column prop="LocalityModern" label="谱籍地(原籍)" width="100" align="center" />
                <el-table-column prop="place" label="谱籍地(现代)" width="100" align="center" />
                <el-table-column prop="authors" label="作者姓名" width="100" align="center" />
                <el-table-column prop="authorJob" label="作者职务" width="100" align="center" />
                <el-table-column prop="hall" label="堂号" width="100" align="center" />
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
                    :hide-on-single-page="true"
                    @current-change="handleCurrentChange"
                />
            </div>
        </footer>
    </section>
</template>

<style scoped lang="scss">
.metadata-wrap{
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