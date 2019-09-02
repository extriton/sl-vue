<template>
    <div class="header">
        <div class="container">
            <router-link to="/" class="site-logo">
                <img src="/img/brand/logo.png" alt="Logo" title="SmartLotto" />
            </router-link>
            <div class="language-wrapper">
                <TheLanguage />
            </div>
        </div>
    </div>
</template>

<script>
// eslint-disable-next-line
/* eslint-disable */
import TheLanguage from './TheLanguage.vue';

export default {
    name: 'TheHeader',
    components: {
        TheLanguage,
    },
    data () {
        return {}
    },
}
</script>

<style lang="scss">
.header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 90px;
    background-color: #000;
    z-index: 5;
    font-size: 1em;
    .site-logo {
        position: absolute;
        top: 0;
        left: 20px;
        height: 50px;
        width: 200px;
    }
    .language-wrapper {
        display: block;
        position: absolute;
        top: 30px;
        right: 70px;
    }
}
</style>
