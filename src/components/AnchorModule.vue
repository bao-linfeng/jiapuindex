<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useGlobalStore } from '../store/global.js';
import { setValue } from '../util/ADS.js';
import overview from '../assets/icon/概览.svg';
import organization from '../assets/icon/组织机构.svg';
import catalogDetail from '../assets/icon/谱目详情.svg';
import report from '../assets/icon/统计报表.svg';
import deliveryReport from '../assets/icon/交付报告.svg';
import systemLog from '../assets/icon/操作日志.svg';
import target from '../assets/icon/目标.svg';

const router = useRouter();

const global = useGlobalStore();
const { userInfo, pathActive, orgMemberInfo, langData, lanType, indexStatisticsData, indexLogCount } = storeToRefs(global);
const { saveProperyValue } = global;
console.log(orgMemberInfo.value.englishName);
const asideList = ref([]);

let routeList = [
    {'title': '概览', 'route': '/overview', 'icon': overview, 'level': '0', 'show': true},
    {'title': '组织机构', 'route': '/organization', 'icon': organization, 'level': '0', 'show': true},
    {'title': '谱目详情', 'route': '/catalogDetail', 'icon': catalogDetail, 'level': '0', 'show': true},
    {'title': '统计报表', 'route': '/statisticalReport', 'icon': report, 'level': '0', 'child': ['/imageStorageReport', '/indexAllocationAndCompletionReport', '/indexDeliveryReport'], 'show': true},
    {'title': '影像入库报表', 'route': '/imageStorageReport', 'icon': '', 'level': '1', 'show': true},
    {'title': '索引分配与完成度表', 'route': '/indexAllocationAndCompletionReport', 'icon': '', 'level': '1', 'show': true},
    {'title': '年度报告', 'route': '/indexDeliveryReport', 'icon': '', 'level': '1', 'show': true},
    {'title': '交付报告', 'route': '/deliveryReport', 'icon': deliveryReport, 'level': '0', 'show': true},
    {'title': '目标设置', 'route': '/AnnualTarget', 'icon': target, 'level': '0', 'show': true},
    {'title': '操作日志', 'route': '/systemLog', 'icon': systemLog, 'level': '0', 'show': true},
];

const logout = () => {
    saveProperyValue({'label': 'token', 'value': ''});
    saveProperyValue({'label': 'userInfo', 'value': ''});
    localStorage.clear();
    router.push('/');
}

const goHome = () => {
    router.push('/');
}

const goRouter = (data) => {
    if(data.child){
        asideList.value.forEach((ele) => {
            if(data.child.indexOf(ele.route) > -1){
                if(orgMemberInfo.value.englishName == 'FS'){
                    ele.show = !ele.show;
                }else{
                    if(['/imageStorageReport'].indexOf(ele.route) > -1){

                    }else{
                        ele.show = !ele.show;
                    }
                }
            }
        });
    }else{
        router.push(data.route);
    }
}

const initRoute = () => {
    if(orgMemberInfo.value.englishName == 'FS'){
        if(orgMemberInfo.value.role == 2){
            asideList.value = [
                {'title': '交付报告', 'route': '/SLA', 'icon': deliveryReport, 'level': '0', 'show': true},
                {'title': '操作日志', 'route': '/systemLog', 'icon': systemLog, 'level': '0', 'show': true},
            ];
        }else if(orgMemberInfo.value.role == 3){
            asideList.value = [
                {'title': '概览', 'route': '/overview', 'icon': overview, 'level': '0', 'show': true},
                {'title': '谱目详情', 'route': '/catalogDetail', 'icon': catalogDetail, 'level': '0', 'show': true},
                {'title': '统计报表', 'route': '/statisticalReport', 'icon': report, 'level': '0', 'child': ['/imageStorageReport', '/indexAllocationAndCompletionReport', '/indexDeliveryReport'], 'show': true},
                {'title': '影像入库报表', 'route': '/imageStorageReport', 'icon': '', 'level': '1', 'show': true},
                {'title': '操作日志', 'route': '/systemLog', 'icon': systemLog, 'level': '0', 'show': true},
            ];
        }else{
            asideList.value = [
                {'title': '概览', 'route': '/overview', 'icon': overview, 'level': '0', 'show': true},
                {'title': '组织机构', 'route': '/organization', 'icon': organization, 'level': '0', 'show': true},
                {'title': '谱目详情', 'route': '/catalogDetail', 'icon': catalogDetail, 'level': '0', 'show': true},
                {'title': '统计报表', 'route': '/statisticalReport', 'icon': report, 'level': '0', 'child': ['/imageStorageReport', '/indexAllocationAndCompletionReport', '/indexDeliveryReport'], 'show': true},
                {'title': '影像入库报表', 'route': '/imageStorageReport', 'icon': '', 'level': '1', 'show': true},
                {'title': '索引分配与完成度表', 'route': '/indexAllocationAndCompletionReport', 'icon': '', 'level': '1', 'show': true},
                {'title': '年度报告', 'route': '/indexDeliveryReport', 'icon': '', 'level': '1', 'show': true},
                {'title': '交付报告', 'route': '/deliveryReport', 'icon': deliveryReport, 'level': '0', 'show': true},
                {'title': '目标设置', 'route': '/AnnualTarget', 'icon': target, 'level': '0', 'show': true},
                {'title': '操作日志', 'route': '/systemLog', 'icon': systemLog, 'level': '0', 'show': true},
                {'title': '谱目状态记录', 'route': '/UpdateLog', 'icon': systemLog, 'level': '0', 'show': true},
            ];
        }
    }else{
        asideList.value = [
            {'title': '概览', 'route': '/overview', 'icon': overview, 'level': '0', 'show': true},
            {'title': '组织机构', 'route': '/organization', 'icon': organization, 'level': '0', 'show': true},
            {'title': '谱目详情', 'route': '/catalogDetail', 'icon': catalogDetail, 'level': '0', 'show': true},
            {'title': '统计报表', 'route': '/statisticalReport', 'icon': report, 'level': '0', 'child': ['/imageStorageReport', '/indexAllocationAndCompletionReport', '/indexDeliveryReport'], 'show': true},
            {'title': '索引分配与完成度表', 'route': '/indexAllocationAndCompletionReport', 'icon': '', 'level': '1', 'show': true},
            {'title': '年度报告', 'route': '/indexDeliveryReport', 'icon': '', 'level': '1', 'show': true},
            {'title': '交付报告', 'route': '/deliveryReport', 'icon': deliveryReport, 'level': '0', 'show': true},
            {'title': '目标设置', 'route': '/AnnualTarget', 'icon': target, 'level': '0', 'show': true},
            {'title': '操作日志', 'route': '/systemLog', 'icon': systemLog, 'level': '0', 'show': true},
        ];
    }
}

watch(orgMemberInfo, (nv ,ov) => {
    initRoute();
});

onMounted(() => {
    initRoute();
});

</script>

<template>
    <aside class="aside">
        <header class="header">
            <img class="logo" @click="goHome" src="/128.png" alt="">
            <span class="name">{{userInfo.userName}}({{lanType == 'en' ? orgMemberInfo.englishName : orgMemberInfo.orgName}})</span>
            <p class="role">{{orgMemberInfo.role == 1 ? langData['管理员'] : orgMemberInfo.role == 2 ? langData['编辑'] : orgMemberInfo.role == 3 ? langData['成员'] : ''}}</p>
        </header>
        <nav class="nav">
            <a :class="'router level'+(item.level)+(pathActive.indexOf(item.route) > -1 ? ' active' : '')" v-show="item.show" v-for="(item, index) in asideList" :key="index" @click="goRouter(item)">
                <img class="icon" v-if="item.icon" :src="item.icon" />
                <i class="title">{{langData[item.title]}}<p v-if="(item.route == '/deliveryReport' || item.route == '/SLA') && indexStatisticsData" class="indexStatisticsData">{{indexStatisticsData}}</p><p v-if="(item.route == '/systemLog' && indexLogCount)" class="indexStatisticsData">{{indexLogCount}}</p></i>
            </a>
        </nav>
        <footer class="footer" @click="logout">
            <img src="../assets/logout.svg" alt="">
        </footer>
    </aside>
</template>

<style scoped lang="scss">
.aside{
    position: relative;
    width: 22rem;
    height: 100%;
    background: #353D51;
    .header{
        height: 6rem;
        text-align: center;
        color: #fff;
        font-size: 1.2rem;
        .logo{
            height: 4rem;
            margin-bottom: 1rem;
            display: block;
            margin: 0 auto;
            cursor: pointer;
        }
        .role{
            position: absolute;
            top: 10px;
            left: calc(50% + 30px);
        }
    }
    .nav{
        height: calc(100% - 10rem);
        .router{
            height: 4rem;
            display: flex;
            align-items: center;
            color: #9B9B9B;
            cursor: pointer;
            &.level1{
                padding-left: 3rem;
            }
            .icon{
                margin-left: 1rem;
            }
            .title{
                position: relative;
                margin-left: 0.5rem;
            }
            &.active{
                color: #fff;
                border-left: 0.5rem solid #4C95FF;
                background: #414455;
                &.level1{
                    padding-left: 2.5rem;
                }
                .icon{
                    margin-left: 0.5rem;
                }
            }
            &:hover{
                color: #4C95FF;
            }
        }
    }
    .footer{
        height: 4rem;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        .logout{
            
        }
    }
}
.indexStatisticsData{
    position: absolute;
    top: -5px;
    left: calc(100% + 3px);
    background: #f00;
    border-radius: 2px;
    text-indent: 0;
    font-size: 10px;
    padding: 0 2px;
    color: #fff;
}
</style>