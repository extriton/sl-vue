<template>
    <div class="box-chat" :class="{ opened: isOpened }">
        <h3
            class="box-chat__caption"
            @click.stop="isOpened = !isOpened"
        >
            {{ dict.chat }}
        </h3>
        <div class="box-chat__body">

        </div>
        <div class="box-chat__input">
        </div>
    </div>
</template>

<script>
/* eslint-disable */
/* eslint linebreak-style: ["error", "windows"] */
export default {
    name: 'BoxChat',
    computed: {
        dict () {
            return this.$store.state.dict
        }
    },
    data () {
        return {
            isOpened: false
        }
    }
}
</script>

<style lang="scss">
.box-chat {
    position: absolute;
    width: 100%;
    height: 100%;
    border: 1px solid #000;
    border-top: none;
    background-color: #0A1A22;
    font-size: 14px;
    text-align: left;
    transition: top .5s linear;
    top: calc(100% - 35px);
    &.opened {
        top: 0;
    }
    &__caption {
        padding: 10px;
        background: linear-gradient(to left, rgba(0,0,0,.3), rgba(0,0,0,.0) 50%, rgba(0,0,0,.3)), linear-gradient(#d77d31, #fe8417, #d77d31);
        box-shadow: inset #6e5a24 0 -1px 1px, #663c12 0 0 0 1px, #000 0 10px 15px -10px;
        color: #000;
        margin-bottom: 3px;
        &:hover {
            cursor: pointer;
        }
    }
    &__body {
        height: calc(100% - 35px - 120px);
        overflow-y: auto;
    }
    &__input {
        width: 100%;
        height: 120px;
        border-top: 1px solid #000;
    }
}
</style>