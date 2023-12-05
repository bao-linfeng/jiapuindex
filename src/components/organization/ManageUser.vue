<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useGlobalStore } from '../../store/global.js';
import { createMsg } from '../../util/ADS.js';
import { org, index } from '../../util/api';

const router = useRouter();

const global = useGlobalStore();
const { userInfo, orgMemberInfo, langData } = storeToRefs(global);
const {  } = global;

const props = defineProps({
    originData: Object,
})

const tableData = ref([]);

const handleClickAction = (row, t) => {
    console.log(row, t);
    if(t === 'addUser'){
        addOrgMember(row.userKey);
    }
    if(t === 'removeUser'){
        deleteOrgMember(row.userKey);
    }
}

const userSearch = async () => {
    const result = await index.userSearch({'keyWord': keyword.value});
    if(result.status == 200){
        tableData.value = result.data.map((ele) => {
            ele.userName = ele.userName || '';
            return ele;
        });
    }else{
        createMsg(result.msg);
    }
}

const orgMemberList = ref([]);
const getOrgMemberList = async () => {
    const result = await index.getOrgMemberList({'userKey': userInfo.value.userKey, 'orgKey': props.originData.orgKey});
    if(result.status == 200){
        orgMemberList.value = result.data.map((ele) => {
            ele.userName = ele.userName || '';
            ele.moblie = ele.mobileArea+ele.moblie;
            return ele;
        });
    }else{
        createMsg(result.msg);
    }
}

const addOrgMember = async (targetUKey) => {
    const result = await index.addOrgMember({
        'userKey': userInfo.value.userKey,
        'orgKey': props.originData.orgKey,
        'targetUKey': targetUKey,
        'role': 3,
    });
    if(result.status == 200){
        createMsg(langData.value['添加机构成员成功！'], true);
        getOrgMemberList();
        emit('save', true);
    }else{
        createMsg(result.msg);
    }
}

const deleteOrgMember = async (targetUKey) => {
    const result = await index.deleteOrgMember({
        'userKey': userInfo.value.userKey,
        'orgKey': props.originData.orgKey,
        'targetUKey': targetUKey,
    });
    if(result.status == 200){
        createMsg(langData.value['移除机构成员成功！'], true);
        userSearch();
        getOrgMemberList();
        emit('save', true);
    }else{
        createMsg(result.msg);
    }
}

const updateOrgMember = async (targetUKey, role) => {
    const result = await index.updateOrgMember({
        'userKey': userInfo.value.userKey,
        'orgKey': props.originData.orgKey,
        'targetUKey': targetUKey,
        'role': role,
    });
    if(result.status == 200){
        createMsg(langData.value['编辑机构成员角色成功！'], true);
        // getOrgMemberList();
    }else{
        createMsg(result.msg);
    }
}

const emit = defineEmits(['close', 'save']);
const close = () => {
    emit('close');
}

const roleList = ref([
    {'label': langData.value['管理员'], 'value': 1},
    {'label': langData.value['编辑'], 'value': 2},
    {'label': langData.value['成员'], 'value': 3},
]);

const handleChangeRole = (row) => {
    console.log(row);
    updateOrgMember(row.userKey, row.role);
}

const keyword = ref('');
onMounted(() => {
    getOrgMemberList();
});

</script>

<template>
    <section class="manage-user-wrap">
        <header class="header">
            <h3>{{langData['组员管理']}}</h3>
            <img class="close" @click="close" src="../../assets/close.svg" alt="">
        </header>
        <main class="main">
            <div class="search-wrap">
                <label class="label">{{langData['添加机构成员']}}</label>
                <el-input v-model="keyword" @keyup.enter="userSearch" :placeholder="langData['手机或邮箱']" clearable />
            </div>
            <el-table 
                :data="tableData" 
                border 
                height="200"
                style="width: 100%">
                <el-table-column prop="userName" :label="langData['昵称']" align="center" />
                <el-table-column prop="mobile" :label="langData['手机']" width="120" align="center" />
                <el-table-column prop="email" :label="langData['邮箱']" width="200" align="center" />
                <el-table-column :label="langData['操作']" width="120" align="center">
                    <template #default="scope">
                        <el-button v-if="!scope.row.hasAdd && orgMemberInfo.role == 1" size="small" type="primary" @click="handleClickAction(scope.row, 'addUser')">{{langData['添加']}}</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </main>
        <main class="main">
            <div class="search-wrap">
                <label class="label">{{langData['机构成员列表']}}</label>
            </div>
            <el-table 
                :data="orgMemberList" 
                border 
                height="200"
                style="width: 100%">
                <el-table-column prop="userName" :label="langData['昵称']" align="center" width="120" />
                <el-table-column prop="mobile" :label="langData['手机']" width="120" align="center" />
                <el-table-column prop="email" :label="langData['邮箱']" width="220" align="center" />
                <el-table-column :label="langData['角色']" width="130" align="center">
                    <template #default="scope">
                        <el-select v-model="scope.row.role" @change="handleChangeRole(scope.row)" :placeholder="langData['角色列表']" :disabled="orgMemberInfo.role != 1">
                            <el-option v-for="item in roleList" :key="item.value" :label="item.label" :value="item.value" />
                        </el-select>
                    </template>
                </el-table-column>
                <el-table-column :label="langData['操作']" width="120" align="center">
                    <template #default="scope">
                        <el-button v-if="orgMemberInfo.role == 1" size="small" type="primary" @click="handleClickAction(scope.row, 'removeUser')">{{langData['移除']}}</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </main>
    </section>
</template>

<style scoped lang="scss">
.manage-user-wrap{
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 2rem 5rem;
    background: #fff;
    z-index: 1000;
    border-radius: 5px;
    box-shadow: 0 0 1px 2px #ddd;
    .header{
        position: relative;
        height: 4rem;
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
    .main{
        .search-wrap{
            height: 4rem;
            display: flex;
            align-items: center;
            .label{
                width: 120px;
            }
        }
    }
    .footer{
        height: 4rem;
        display: flex;
        justify-content: center;
        align-items: center;
    }
}
.marginB10{
    margin-bottom: 10px;
}
</style>