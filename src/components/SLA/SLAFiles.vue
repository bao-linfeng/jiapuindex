<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useGlobalStore } from '../../store/global.js';
import { createMsg, formattedDate, downliadLink } from '../../util/ADS.js';
import { index, baseURL } from '../../util/api';
import DistributeFile from './DistributeFile.vue';

const router = useRouter();

const global = useGlobalStore();
const { userInfo, langData, orgMemberInfo, orgList } = storeToRefs(global);
const {  } = global;

const props = defineProps({
    dataKey: String,
})

const emit = defineEmits(['close']);
const close = () => {
    emit('close');
}

const orgListArr = ref([]);
const orgKey = ref('');
const fileName = ref('');
const userName = ref('');
const page = ref(1);
const limit = ref(30);
const total = ref(0);
const tableData = ref([]);

const handleCurrentChange = (data) => {
    console.log(data);
    page.value = data;
    getDataList();
}

/** 
 * 获取索引上传文件列表api 
 * @param {string} fileName - 文件名
 * @param {string} userName - 用户名称
 * @param {Number} page - 页码
 * @param {Number} limit - limit
 * @returns {Object} {msg: 提示信息，status: 状态，result: {list: 数据, pageNum: 分页, total: 总条数}}
 */
 const getDataList = async () => {
    const result = await index.getIndexUploadFileList({
        'userKey': userInfo.value.userKey,
        'orgKey': orgKey.value,
        'fileName': fileName.value,
        'userName': userName.value,
        'page': page.value,
        'limit': limit.value,
    });
    if(result.status == 200){
        tableData.value = result.result.list.map((ele) => {
            ele.createTime = ele.createTime ? formattedDate(ele.createTime) : '';
            ele.updateTime = ele.updateTime ? formattedDate(ele.updateTime) : '';
            ele.distributeOrgNameO = ele.distributeOrgName.join(',');

            return ele;
        });
        total.value = result.result.total;
    }else{
        createMsg(result.msg);
    }
}

/** 
 * 记录索引上传文件api 
 * @param {string} userKey - 用户key
 * @param {string} simplePath - 上传的excel文件路径
 * @param {string} originalName - 原始文件名
 * @returns {Object} {msg: 提示信息，status: 状态，data: 数据}
 */
 const addIndexUploadFile = async (originalName, simplePath) => {
    const result = await index.addIndexUploadFile({
        'userKey': userInfo.value.userKey,
        'originalName': originalName,
        'simplePath': simplePath,
    });

    if(result.status == 200){
        createMsg('上传文件成功!', true);
        handleSearch();
    }else if(result.status == 301){
        downliadLink(result.result, baseURL+'/');
    }else{
        createMsg(result.msg);
    }
}

const handleDistribute = () => {
    if(selectList.value && selectList.value.length){
        show.value = 'Distribute';
    }else{
        createMsg('请勾选需要分发的文件!');
    }
}

const selectList = ref([]);
const handleSelectionChange = (data) => {
    console.log(data);
    let arr = [];
    data.forEach((e) => {
        arr.push(e._key);
    });
    selectList.value = arr;
}

const handleClose = (d) => {
    if(d){
        selectList.value = [];
        handleSearch();
    }
    show.value = '';
}

const show = ref('');
// 回调
const handleClickAction = (row, t) => {
    console.log(row, t);
    show.value = t;
    if(t === 'download'){
        downliadLink(row.simplePath, baseURL);
    }
    if(t === 'lookview'){
        open(baseURL+row.simplePath);
    }
}

// 上传成功回调
const handleBatchUpdate = (response, uploadFile, uploadFiles) => {
    if(response.statusCode == 200){
        console.log(response);
        if(show.value == 'uploadFile'){
            addIndexUploadFile(response.originalName, response.simplePath);
        }
    }else{
        createMsg(response.msg);
    }
}

onMounted(() => {
    if(orgMemberInfo.value.englishName == 'FS'){
        
    }else{
        orgKey.value = orgMemberInfo.value.orgKey;
    }
    orgListArr.value = orgList.value.filter((ele) => {
        return ele;
        // return ele.label != 'FS';
    });
    orgListArr.value.unshift({'label': langData.value['全部机构'], 'value': ''});

    handleSearch();
});

const handleSearch = () => {
    page.value = 1;
    getDataList();
}

</script>

<template>
    <section class="file-wrap">
        <header class="header">
            <h3>{{langData['文件']}}</h3>
            <img class="close" @click="close" src="../../assets/close.svg" alt="">
        </header>
        <div class="search-wrap">
            <div class="search-box">
                <el-select v-if="orgMemberInfo.englishName == 'FS'" v-model="orgKey" class="w150" :placeholder="langData['机构列表']">
                    <el-option v-for="item in orgListArr" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <el-input v-model="fileName" class="w200" :placeholder="langData['文件名']" clearable />
                <el-input v-model="userName" class="w150" :placeholder="langData['上传人']" clearable />
                <el-button type="primary" @click="handleSearch">{{langData['检索']}}</el-button>
            </div>
            <div class="search-box">
                <el-upload
                    class="inline-block"
                    :action="baseURL+'/upload'"
                    :show-file-list="false"
                    :on-success="handleBatchUpdate"
                >
                    <template #trigger>
                        <el-button type="primary" @click="handleClickAction('', 'uploadFile')">{{langData['上传文件']}}</el-button>
                    </template>
                </el-upload>
                <el-button class="marginL10" v-if="orgMemberInfo.englishName == 'FS'" type="primary" @click="handleDistribute">{{langData['分发']}}</el-button>
            </div>
        </div>
        <main class="main">
            <el-table 
                :data="tableData" 
                border 
                height="300"
                style="width: 100%"
                @selection-change="handleSelectionChange">
                <el-table-column type="selection" width="55" align="center" />
                <el-table-column prop="originalName" :label="langData['文件名']" align="center" min-width="300" />
                <el-table-column prop="indexOrgName" :label="langData['上传机构']" align="center" width="100" />
                <el-table-column prop="userName" :label="langData['上传人']" align="center" width="100" />
                <el-table-column prop="distributeOrgNameO" :label="langData['分发机构']" align="center" width="150" />
                <!-- <el-table-column prop="createTime" :label="langData['创建时间']" align="center" width="120" /> -->
                <el-table-column prop="updateTime" :label="langData['更新时间']" align="center" width="120" />
                <el-table-column :label="langData['操作']" fixed="right" width="80" align="center">
                    <template #default="scope">
                        <a :href="baseURL+scope.row.simplePath" download target="_blank">{{langData['下载']}}</a>
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
    <DistributeFile v-if="show == 'Distribute'" :list="selectList" v-on:close="handleClose" />
</template>
<style scoped lang="scss">
.file-wrap{
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 0 3rem 3rem 3rem;
    background: #fff;
    z-index: 1000;
    border-radius: 5px;
    box-shadow: 0 0 1px 2px #ddd;
    // width: 900px;
    .header{
        position: relative;
        height: 5rem;
        display: flex;
        justify-content: center;
        align-items: center;
        .close{
            position: absolute;
            top: 50%;
            right: 0;
            transform: translateY(-50%);
            cursor: pointer;
        }
    }
    .search-wrap{
        height: 4rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        .search-box{
            display: flex;
            align-items: center;
        }
    }
    .main{
        
    }
    .footer{
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
.w200{
    width: 200px;
}
.marginL10{
    margin-left: 10px;
}
</style>