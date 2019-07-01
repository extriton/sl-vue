<template>
    <div class="header">
        <div class="container">
            <a href="#play" class="site-logo">
                <img src="/img/brand/logo.png" alt="Logo" title="SmartLotto" />
            </a>
            <div class="language-wrapper">
                <TheLanguage />
            </div>
            <div class="menu-wrapper">
                <ul class="menu">
                    <li><a class="link_play" href="#game-play">{{ dict.menu_play }}</a></li>
                    <li><a class="link_rules" href="#game-rules">{{ dict.menu_rules }}</a></li>
                    <li><a class="link_history" href="#game-history">{{ dict.menu_history }}</a></li>
                    <li><a class="link_statistics" href="#game-statistics">{{ dict.menu_statistics }}</a></li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script>
/* eslint-disable */
/* eslint linebreak-style: ["error", "windows"] */
import TheLanguage from './TheLanguage.vue';

export default {
    name: 'TheHeader',
    components: {
        TheLanguage,
    },
    props: {},
    data () {
        return {
        }
    },
    computed: {
        dict () {
            return this.$store.state.dict
        }
    },
}
</script>

<style lang="scss">
.header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    min-height: 114px;
    margin: 0;
    padding: 0;
    background-color: #000;
    z-index: 5;
    -webkit-transition: all ease 0.4s;
    -moz-transition: all ease 0.4s;
    -o-transition: all ease 0.4s;
    transition: all ease 0.4s;
    .site-logo {
        padding: 15px;
        height: 50px;
        width: 200px;
        float: left;
    }
    .language-wrapper {
        display: block;
        margin-top: 40px;
        position: relative;
        float: left;
    }
    .menu-wrapper {
        float: right;
        .menu {
            padding-top: 20px;
            > li {
                display: inline-block;
                > a {
                    display: block;
                    position: relative;
                    padding: 15px;
                    text-transform: uppercase;
                    font-weight: 800;
                    color: #fff;
                    margin: 10px 3px;
                    border: 1px solid #000;
                    font-size: 15px;
                    text-shadow: none;
                    transition: border-color 1s ease;
                    &:hover,
                    &:focus {
                        border: 1px solid #FECE1A;
                        color: #fff;
                        background-color: #181A1C;
                        text-decoration: none;
                    }
                }
            }
        }
    }
}

@media (max-width: 1000px) {
    .header {
        .menu-wrapper {
            display: none;
        }
    }
}
</style>
