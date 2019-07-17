<template>
    <div id="footer">
        <div class="left-block">
            <span class="color-blue">Copyright © 2019 –</span> SmartLotto.org
        </div>
        <div class="right-block">
            <span class="color-blue">All rights are reserved by the owner</span>
        </div>
    </div>
</template>

<script>
export default {
    name: 'TheFooter',
    components: {
    },
    data () {
        return {
        }
    },
}
</script>

<style lang="scss">
#footer {
    padding: 40px 0;
    background-color: #0E1014;
    color: #FFF;
    .left-block {
        width: 35%;
        float: left;
    }
    .right-block {
        width: 35%;
        float: right;
    }
    .color-blue {
        color: #34BBFF;
    }
}
</style>
