<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useGlobalStore } from '../store/global.js';
import { createMsg } from '../util/ADS.js';
import { volume, index } from '../util/api';
import AddOrganizationModule from '../components/organization/AddOrganizationModule.vue';
import ManageUser from '../components/organization/ManageUser.vue';
import QuickRegister from '../components/organization/QuickRegister.vue';

const router = useRouter();

const global = useGlobalStore();
const { userInfo, orgMemberInfo, langData } = storeToRefs(global);
const { saveProperyValue } = global;

const tableData = ref([]);
const loading = ref(false);
const getDataList = async () => {
    loading.value = true;
    const result = await index.getOrgList({'userKey': userInfo.value.userKey});
    loading.value = false;
    if(result.status == 200){
        tableData.value = result.data.map((ele) => {
            
            return ele;
        });
    }else{
        createMsg(result.msg);
    }
}

const h = ref(window.innerHeight - 120);
onMounted(() => {
    getDataList();
});

const originData = ref({'orgKey': ''});
const show = ref(0);
const handleClickAction = (row, t) => {
    console.log(row, t);
    originData.value = row;
    if(t === 'addOrganization' || t === 'edit'){
        show.value = 1;
    }
    if(t === 'manageUser'){
        show.value = 2;
    }
    if(t === 'register'){
        show.value = 3;
    }
    if(t === 'delete'){
        deleteOrg(row.orgKey);
    }
}

const deleteOrg = async (key) => {
    const result = await index.deleteOrg({
        'userKey': userInfo.value.userKey,
        'orgKey': key,
    });
    if(result.status == 200){
        createMsg(langData.value['删除机构成功！'], true);
        getDataList();
    }else{
        createMsg(result.msg);
    }
}

const handleSave = (data) => {
    console.log(data);
    data ? null : show.value = 0;
    getDataList();
}

</script>

<template>
    <section class="organization-wrap">
        <header class="header">
            <div class="left">
                <h3>{{langData['组织机构']}}</h3>
            </div>
            <div class="right">
                <el-button v-if="(orgMemberInfo.englishName == 'FS' && orgMemberInfo.role == 1) || userInfo.userKey == '657446338'" type="primary" size="small" @click="handleClickAction({}, 'addOrganization')">{{langData['新增机构']}}</el-button>
                <el-button v-if="orgMemberInfo.role == 1" type="primary" size="small" @click="handleClickAction({}, 'register')">{{langData['一键注册']}}</el-button>
            </div>
        </header>
        <main class="main marginT20">
            <el-table 
                :data="tableData" 
                border 
                :height="h"
                v-loading="loading"
                style="width: 100%">
                <el-table-column prop="orgKey" :label="langData['机构ID']" align="center" />
                <el-table-column prop="orgName" :label="langData['机构名称']" align="center" />
                <el-table-column prop="englishName" :label="langData['机构英文名']" align="center" />
                <el-table-column prop="orgMemberCount" :label="langData['机构人数']" align="center" />
                <el-table-column :label="langData['操作']" fixed="right" width="250" align="center">
                    <template #default="scope">
                        <el-button v-if="scope.row.englishName !== 'FS' && orgMemberInfo.role == 1" size="small" type="primary" @click="handleClickAction(scope.row, 'edit')">{{langData['编辑']}}</el-button>
                        <el-button size="small" type="primary" @click="handleClickAction(scope.row, 'manageUser')">{{langData['组员管理']}}</el-button>
                        <el-popconfirm
                            v-if="scope.row.englishName !== 'FS' && orgMemberInfo.englishName == 'FS' && orgMemberInfo.role == 1"
                            width="220"
                            :confirm-button-text="langData['确定']"
                            :cancel-button-text="langData['取消']"
                            :title="langData['您确认删除该机构吗?']"
                            @confirm="handleClickAction(scope.row, 'delete')"
                        >
                            <template #reference>
                                <el-button size="small" type="primary">{{langData['删除机构']}}</el-button>
                            </template>
                        </el-popconfirm>
                    </template>
                </el-table-column>
            </el-table>
        </main>
        <footer class="footer">
            <div class="left"></div>
            <div class="rigth">
                
            </div>
        </footer>
    </section>
    <!-- 新增机构 -->
    <AddOrganizationModule v-if="show === 1" :originData="originData" v-on:close="show = 0" v-on:save="handleSave" />
    <!-- 添加成员 -->
    <ManageUser v-if="show === 2" :originData="originData" v-on:close="show = 0" v-on:save="handleSave" />
    <!-- 一键注册 -->
    <QuickRegister v-if="show === 3" v-on:close="show = 0" v-on:save="handleSave" />
</template>

<style scoped lang="scss">
.organization-wrap{
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
        height: calc(100% - 12rem);
        padding: 0 2rem;
        font-size: 2.5rem;
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
.marginT20{
    margin-top: 2rem;
}
</style>