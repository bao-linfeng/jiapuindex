<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useGlobalStore } from '../../store/global.js';
import { createMsg } from '../../util/ADS.js';
import { index } from '../../util/api';

const router = useRouter();

const global = useGlobalStore();
const { userInfo, langData } = storeToRefs(global);
const {  } = global;

const props = defineProps({
    originData: Object,
})

const emit = defineEmits(['close', 'save']);
const close = () => {
    emit('close');
}

const save = () => {
    if(!form.value.orgName){
        return createMsg(langData.value['中文名必填']);
    }
    if(!form.value.englishName){
        return createMsg(langData.value['英文名必填']);
    }
    if(form.value.orgKey){
        updateOrg();
    }else{
        createOrg();
    }
}

const form = ref({
    'orgKey': '',
    'orgName': '',
    'englishName': ''
});

const createOrg = async () => {
    const result = await index.createOrg({
        'userKey': userInfo.value.userKey,
        'orgName': form.value.orgName,
        'englishName': form.value.englishName,
    });
    if(result.status == 200){
        createMsg(langData.value['创建机构成功！'], true);
        emit('save', '');
    }else{
        createMsg(result.msg);
    }
}

const updateOrg = async () => {
    const result = await index.updateOrg({
        'userKey': userInfo.value.userKey,
        'orgKey': form.value.orgKey,
        'orgName': form.value.orgName,
        'englishName': form.value.englishName,
    });
    if(result.status == 200){
        createMsg(langData.value['编辑机构成功！'], true);
        emit('save', '');
    }else{
        createMsg(result.msg);
    }
}

onMounted(() => {
    if(props.originData.orgKey){
        form.value = {
            'orgKey': props.originData.orgKey,
            'orgName': props.originData.orgName,
            'englishName': props.originData.englishName
        };
    }
});

</script>

<template>
    <section class="add-organization-wrap">
        <header class="header">
            <h3>{{form.orgKey ? langData['编辑'] : langData['新增']}}{{langData['机构']}}</h3>
        </header>
        <main class="main">
            <!-- label-width="120px" -->
            <el-form :model="form">
                <el-form-item :label="langData['中文名']"
                    prop="orgName"
                    :rules="[
                        {
                            required: true,
                            message: 'Please input orgName',
                            trigger: 'blur',
                        },
                    ]"
                >
                    <el-input v-model="form.orgName" />
                </el-form-item>
                <el-form-item :label="langData['英文名']"
                    prop="englishName"
                    :rules="[
                        {
                            required: true,
                            message: 'Please input englishName',
                            trigger: 'blur',
                        },
                    ]"
                >
                    <el-input v-model="form.englishName" />
                </el-form-item>
                <el-form-item class="center">
                    <el-button type="primary" @click="save">{{langData['确定']}}</el-button>
                    <el-button @click="close">{{langData['取消']}}</el-button>
                </el-form-item>
            </el-form>
        </main>
        <footer class="footer">
            
        </footer>
    </section>
</template>

<style scoped lang="scss">
.add-organization-wrap{
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 0 5rem;
    background: #fff;
    z-index: 1000;
    border-radius: 5px;
    box-shadow: 0 0 1px 2px #ddd;
    .header{
        height: 6rem;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .main{

    }
    .footer{
        height: 4rem;
        display: flex;
        justify-content: center;
        align-items: center;
    }
}
</style>