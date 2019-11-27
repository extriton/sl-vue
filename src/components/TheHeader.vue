<template>
    <div class="header">
        <div class="container">
            <router-link to="/" class="site-logo">
                <img src="/img/brand/logo.png" alt="Logo" title="SmartLotto" />
            </router-link>
            <!-- Title -->
            <h3 class="header-title-text">
                {{ dict.play_title1 }} <strong class="blue-color">{{ dict.play_title2 }}</strong> 
                {{ dict.play_title3 }} {{ dict.play_title4 }}
            </h3>
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
    computed: {
        dict () {
            return this.$store.state.dict
        },
    }
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
    .header-title-text {
        position: absolute;
        width: 60%;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        .blue-color {
            color: #3BB9FB;
        }
    }
    .language-wrapper {
        display: block;
        position: absolute;
        top: 30px;
        right: 70px;
    }
}

@media all and (max-width: 870px) {
    .header {
        .header-title-text {
            display: none;
        }
    }
}
</style>
