<template>
    <div id="footer">
        <div>
            <span class="color-blue">Copyright © 2019 –</span> SmartLotto.org
        </div>
    </div>
</template>

<script>
export default {
    name: 'TheFooter',
    components: {
    },
    data () {
        return {}
    },
}
</script>

<style lang="scss">
#footer {
    position: fixed;
    bottom: 0;
    padding: 20px 30px;
    width: 100%;
    background-color: #0E1014;
    color: #FFF;
    .color-blue {
        color: #34BBFF;
    }
}
@media all and (max-width: 760px) {
    #footer {
      font-size: 0.8em;
      padding: 10px 20px;
    }
}
</style>
