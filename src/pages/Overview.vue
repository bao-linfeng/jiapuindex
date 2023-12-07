<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { ElLoading } from 'element-plus';
import { useGlobalStore } from '../store/global.js';
import { thousands, createMsg } from '../util/ADS.js';
import { index } from '../util/api';
import undistributed from '../assets/overview/未分配.svg';
import underway from '../assets/overview/进行中.svg';
import completed from '../assets/overview/已完工.svg';
import RMScompleted from '../assets/overview/RMS完工.svg';
import {lang} from '../language/lang.js';
// import { common } from '../composables/common.js';

const router = useRouter();

const global = useGlobalStore();
const { userInfo, orgMemberInfo, langData, lanType } = storeToRefs(global);
const { saveProperyValue } = global;

const list = ref([
    {'icon': undistributed, 'name': orgMemberInfo.value.englishName == 'FS' ? '未分配' : '待递交', 'catalogCount': '', 'imageCount': '', 'c': 'noAssignGCCount', 'i': 'noAssignImageCount'},
    {'icon': underway, 'name': orgMemberInfo.value.englishName == 'FS' ? '进行中' : '交付中', 'catalogCount': '', 'imageCount': '', 'c': 'inProgressGCCount', 'i': 'inProgressImageCount'},
    {'icon': completed, 'name': '已完工', 'catalogCount': '', 'imageCount': '', 'c': 'finishGCCount', 'i': 'finishNodeCount'},
    {'icon': RMScompleted, 'name': 'RMS已完工', 'catalogCount': '', 'imageCount': '', 'c': 'finishGCCount', 'i': 'finishNodeCount'}
]);

const goRoute = (e, i) => {
    if(i <= 2){
        if(orgMemberInfo.value.englishName == 'FS'){
            router.push('/catalogDetail?allocation='+(i === 0 ? '0' : i === 1 ? '1' : i === 2 ? '1' :  '')+'&deliver='+(i === 0 ? '' : i === 1 ? '0,1,2,3,4' : i === 2 ? '6' :  ''));
        }else{
            router.push('/catalogDetail?allocation=1&deliver='+(i === 0 ? '0,1' : i === 1 ? '2,3,4' : i === 2 ? '6' :  ''));
        }
    }
}

const O = ref({});
/** 
 * 索引概览api 
 * @param {string} userKey - 用户ID
 * @returns {Object} {msg: 提示信息，status: 状态，data: {finishGCCount: 已完工谱目数, finishNodeCount: 已完工节点数, inProgressGCCount: 进行中谱目数, inProgressImageCount: 进行中影像数, noAssignGCCount: 未分配谱目数, noAssignImageCount: 未分配影像数}}
 */
 const getDataList = async () => {
    const loading = ElLoading.service({
        lock: true,
        text: 'Loading',
        background: 'rgba(0, 0, 0, 0.7)',
    });
    const result = await index.overview({
        'userKey': userInfo.value.userKey,
    });
    loading.close();
    if(result.status == 200){
        O.value = result.data;
        O.value['assignGCCount'] = thousands(O.value['assignGCCount']);
        O.value['assignImageCount'] = thousands(O.value['assignImageCount']);
        O.value['assignADJImageCount'] = thousands(O.value['assignADJImageCount']);
        list.value.forEach((ele, i) => {
            ele.catalogCount = thousands(result.data[ele.c]);
            ele.imageCount = thousands(result.data[ele.i]);
            ele.RMSFinishGCCount = thousands(result.data.RMSFinishGCCount);
            ele.RMSFinishNodeCount = thousands(result.data.RMSFinishNodeCount);
        });
    }else{
        createMsg(result.msg);
    }
}

const language = ref('zh');
watch(language, () => {
    saveProperyValue({'value': language.value, 'label': 'lanType'}, true);
    saveProperyValue({'value': lang[lanType.value], 'label': 'langData'});
    document.title = langData.value['家谱索引'];
    getOrgList();
});

const getOrgList = async () => {
    const result = await index.getOrgList({'userKey': userInfo.value.userKey});
    if(result.status == 200){
        let O = {};
        result.data.map((ele) => {
            ele.label = lanType.value == 'en' ? ele.englishName : ele.orgName;
            ele.value = ele.orgKey;
            O[ele.orgKey] = lanType.value == 'en' ? ele.englishName : ele.orgName;
            return ele;
        });
        saveProperyValue({'value': result.data, 'label': 'orgList'}, 'dep');
        saveProperyValue({'value': O, 'label': 'orgObj'}, 'dep');
    }else{
        createMsg(result.msg);
    }
}

onMounted(() => {
    language.value = lanType.value;
    getDataList();
});

</script>

<template>
    <section class="overview-wrap">
        <header class="header">
            <div class="left">
                <h3>{{langData['概览']}}</h3>
            </div>
            <div class="right">
                <el-select v-model="language">
                    <el-option v-for="item in [{'label': '中文', 'value': 'zh'}, {'label': 'English', 'value': 'en'}]" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </div>
        </header>
        <main class="main">
            <div class="main-box">
                <p v-if="orgMemberInfo.englishName == 'FS'" class="desc">{{langData['总谱目数']}} {{O.assignGCCount}} {{langData['套，总影像数']}}{{O.assignImageCount}} {{langData['页, 总adj影像数']}} {{O.assignADJImageCount}}</p>
                <p v-if="orgMemberInfo.englishName != 'FS'" class="desc">{{langData['已分配']}} {{O.assignGCCount}} {{langData['本谱目，']}}{{O.assignImageCount}} {{langData['页影像, 总adj影像数']}} {{O.assignADJImageCount}}</p>
            </div>
            <div class="main-box">
                <div class="box-top">
                    <h3>{{langData['交付汇总']}}</h3>
                </div>
                <div class="box-bottom">
                    <div class="box" v-for="(ele, i) in list" :key="i">
                        <div class="overview-box" :class="{active: !i}"  @click="goRoute(ele, i)">
                            <div class="overview-left">
                                <img :src="ele.icon" alt="">
                                <p>{{langData[ele.name]}}</p>
                            </div>
                            <div class="overview-right">
                                <p v-if="i <= 2" class="marginB20">{{langData['谱目数']}}  <i>{{ele.catalogCount}}</i></p>
                                <p v-if="i <= 2">{{i == 2 ? langData['节点数'] : langData['影像页']}}  <i>{{ele.imageCount}}</i></p>
                                <p v-if="i == 3" class="marginB20">RMS {{langData['谱目数']}}  <i>{{ele.RMSFinishGCCount}}</i></p>
                                <p v-if="i == 3">RMS {{langData['节点数']}}  <i>{{ele.RMSFinishNodeCount}}</i></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
        <footer class="footer"></footer>
    </section>
</template>

<style scoped lang="scss">
.overview-wrap{
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
            .desc{
                margin-left: 10px;
                font-size: 1.4rem;
            }
        }
        .right{
            display: flex;
            align-items: center;
        }
    }
    .main{
        width: calc(100% - 4rem);
        height: calc(100% - 7rem);
        padding: 0 2rem 0 2rem;
        font-size: 2rem;
        overflow-y: auto;
        .main-box{
            padding: 10px 20px;
            border-radius: 10px;
            border: 1px solid #ddd;
            background-color: #fff;
            margin-top: 20px;
            .box-top{
                border-bottom: 1px solid #ddd;
                padding-bottom: 10px;
                margin-bottom: 10px;
                h3{
                    color: #358acd;
                }
            }
        }
        .overview-box{
            width: 38rem;
            padding: 2rem 0;
            // background-color: #f1f1f1;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            // margin: 0 2rem 1rem 0;
            margin: 10px 0;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 16px;
            &.active{
                // background: linear-gradient(135deg,#7e88a2, #5c657c 39%, #353d51);
                // color: #fff;
            }
            .overview-left{
                margin-right: 1rem;
                text-align: center;
                img{
                    display: inline-block;
                    height: 4rem;
                }
            }
            .overview-right{
                p{
                    i{
                        font-size: 20px;
                    }
                }
                .marginB20{
                    margin-bottom: 1rem;
                }
            }
        }
    }
    .footer{
        
    }
}
.marginT10{
    margin-top: 10px;
}
.box-bottom{
    position: relative;
    width: 100%;
    // display: flex;
    // align-content: space-between;
    // flex-wrap: wrap;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr; 
    grid-template-rows: 135px 135px;
    justify-content: space-between;
    .box{
        display: flex;
        justify-content: center;
        align-items: center;
    }
}
@media screen and (min-width: 1820px){
    .box-bottom{
        grid-template-columns: 1fr 1fr 1fr 1fr; 
        grid-template-rows: 135px;
    }
}
@media screen and (min-width: 1440px) and (max-width: 1819px){
    .box-bottom{
        grid-template-columns: 1fr 1fr 1fr; 
        grid-template-rows: 135px 135px;
    }
}
@media screen and (min-width: 1060px) and (max-width: 1439px){
    .box-bottom{
        grid-template-columns: 1fr 1fr; 
        grid-template-rows: 135px 135px;
    }
}
@media screen and (max-width: 1059px){
    .box-bottom{
        grid-template-columns: 1fr; 
        grid-template-rows: 135px 135px 135px 135px;
    }
}
</style>