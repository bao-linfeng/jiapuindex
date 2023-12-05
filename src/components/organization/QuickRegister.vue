<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { ElLoading } from 'element-plus';
import { useGlobalStore } from '../../store/global.js';
import { createMsg } from '../../util/ADS.js';
import { index } from '../../util/api';

const router = useRouter();

const global = useGlobalStore();
const { userInfo, orgMemberInfo, langData } = storeToRefs(global);
const { saveProperyValue } = global;

const emit = defineEmits(['close', 'save']);
const close = () => {
    emit('close');
}
const isFirst = ref(true);
const save = () => {
    if(!form.value.mobile && !form.value.email){
        return createMsg(langData.value['手机或邮箱必填一项']);
    }
    if(!form.value.password){
        return createMsg(langData.value['密码必填']);
    }
    console.log(form);
    addIndexUser();
}

const mobileAreaList = ref([
    {'label': '中国', 'value': '+86'},
    {'label': '香港', 'value': '+852'},
    {'label': '澳门', 'value': '+853'},
    {'label': '台湾', 'value': '+886'},
    {'label': '英国', 'value': '+44'},
    {'label': '美国/加拿大', 'value': '+1'},
]);

const form = ref({
    'mobileArea': '+86',
    'mobile': '', 
    'email': '', 
    'password': '', 
    'gender': 0, 
    'nickName': '',
});

const addIndexUser = async () => {
    if(isFirst.value){
        isFirst.value = false;
    }else{
        return;
    }
    const loading = ElLoading.service({
        lock: true,
        text: 'Loading',
        background: 'rgba(0, 0, 0, 0.7)',
    });
    const result = await index.addIndexUser({
        'userKey': userInfo.value.userKey,
        'orgKey': orgMemberInfo.value.orgKey,
        'mobileArea': form.value.mobileArea,
        'mobile': form.value.mobile,
        'email': form.value.email,
        'password': form.value.password,
        'gender': form.value.gender,
        'nickName': form.value.nickName,
    });
    loading.close();
    if(result.status == 200){
        createMsg(langData.value['注册成功！'], true);
        emit('save', '');
    }else{
        createMsg(result.msg);
    }
}

onMounted(() => {

});

</script>

<template>
    <section class="quick-register-wrap">
        <header class="header">
            <h3>{{langData['一键注册']}}</h3>
        </header>
        <main class="main">
            <el-form :model="form" label-width="80px">
                <el-form-item :label="langData['手机']"
                    prop="mobile"
                >
                    <el-select class="w80" v-model="form.mobileArea" :placeholder="langData['请选择区号']">
                        <el-option
                            v-for="item in mobileAreaList"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                        </el-option>
                    </el-select>
                    <el-input class="w150" v-model="form.mobile" clearable />
                </el-form-item>
                <el-form-item :label="langData['邮箱']"
                    prop="email"
                >
                    <el-input v-model="form.email" clearable />
                </el-form-item>
                <el-form-item :label="langData['密码']"
                    prop="password"
                    :rules="[
                        {
                            required: true,
                            message: 'Please input password',
                            trigger: 'blur',
                        },
                    ]"
                >
                    <el-input v-model="form.password" clearable />
                </el-form-item>
                <el-form-item :label="langData['昵称']">
                    <el-input v-model="form.nickName" clearable />
                </el-form-item>
                <el-form-item :label="langData['性别']">
                    <el-radio-group v-model="form.gender">
                        <el-radio :label="0">{{langData['男']}}</el-radio>
                        <el-radio :label="1">{{langData['女']}}</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item>
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
.quick-register-wrap{
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
.w80{
    width: 80px;
}
.w150{
    width: 150px;
}
.el-form-item__content{
    flex-wrap: nowrap !important;
}
</style>