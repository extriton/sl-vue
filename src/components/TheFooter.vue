<template>
    <div id="footer">
        <div>
            <span class="color-blue">Copyright © 2019 –</span> SmartLotto.org
        </div>
        <div class="visits-box-wrap">
            <TheVisits />
        </div>
    </div>
</template>

<script>
import TheVisits from '@/components/TheVisits.vue'
export default {
    name: 'TheFooter',
    components: {
        TheVisits
    }
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
    z-index: 5;
    text-align: left;
    .color-blue {
        color: #34BBFF;
    }
    .visits-box-wrap {
        position: absolute;
        right: 10px;
        top: 0;
    }
}
@media all and (max-width: 760px) {
    #footer {
      font-size: 0.8em;
      padding: 10px 20px;
    }
}
</style>
