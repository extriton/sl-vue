<template>
    <div class="paginator-box-bottom">
        <div class="paginator-button m-btn left" 
            :class="{ disabled: page === 1 }"
            @click="prevPage">
            <i class="glyphicon glyphicon-menu-left"></i> 
        </div>
        <div class="paginator-counter">
            <span class="counter">{{ page }}</span> / {{ maxPage }}
        </div>
        <div class="paginator-button m-btn right" 
            :class="{ disabled: page === maxPage || maxPage === 1 }"
            @click="nextPage">
            <i class="glyphicon glyphicon-menu-right"></i>
        </div>
    </div>
</template>

<script>
/* eslint-disable */
/* eslint linebreak-style: ["error", "windows"] */
export default {
    name: 'ThePaginator',
    props: {
        maxPage: Number,
        onChange: Function
    },
    data () {
        return {
            page: 1
        }
    },
    methods: {
        prevPage () {
            if (this.page === 1) return
            this.page--
            this.onChange(this.page)
        },
        nextPage () {
            if (this.page === this.maxPage) return
            this.page++
            this.onChange(this.page)
        },
    },
    watch: {
        maxPage: function(value) {
            this.page = 1
        }
    }
}
</script>

<style lang="scss">
.paginator-box-bottom {
    position: relative;
    margin: 15px auto 10px auto;
    width: 220px;
    height: 50px;
    font-size: 20px;
    .paginator-button {
        display: block;
        position: absolute;
        padding-top: 8px;
        width: 40px;
        height: 40px;
        text-align: center;
        color: #34BBFF;
        top: 0;
        &.left {
            left: 0;
        }
        &.right {
            right: 0;
        }
        &:hover {
            cursor: pointer;
            color: #71E0FB;
            border-color: #71E0FB;
        }
        &.disabled {
            color: #333;
            border-color: #333;
        }
        &.disabled:hover {
            cursor: default;
        }

    }
    .paginator-counter {
        display: block;
        width: 120px;
        height: 40px;
        margin: 0 auto;
        padding-top: 6px;
        color: #878787;
        text-align: center;
        border: 1px solid #878787;
    }
}
</style>