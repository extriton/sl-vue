<template>
    <div class="profile-page">
        <h3 class="profile-page__caption">
            {{ dict.menu_profile.toUpperCase() }}
        </h3>
        <div class="profile-page__referal-link">
            <div class="profile-page__referal-link-caption">
                {{ dict.profile_referal_link }}
            </div>
            <div class="profile-page__referal-link-input">
                {{ referalLink }}
            </div>
        </div>
    </div>
</template>

<script>
import config from '../../config/config'
import { mapGetters } from 'vuex'

// https://smart-lotto.org?r=0x203bF6B46508eD917c085F50F194F36b0a62EB02

export default {
    name: 'ProfilePage',
    computed: {
        dict () {
            return this.$store.state.dict
        },
        referalLink () {
            if (!this.user.address)
                return ''
            else
                return `${config.domain}?r=${this.user.address}`
        },
        ...mapGetters(['user'])
    },
    watch: {
        'referalLink': function (value) {
            console.log(value)
            if (!value) this.$router.push('/')

        }
    }
}
</script>

<style lang="scss">
.profile-page {
    user-select: text;
    -moz-user-select: text;
    -webkit-user-select: text;
    -ms-user-select: text;
    background: linear-gradient(to right, black -50%, rgb(17, 46, 61) 150%);
    max-width: 800px;
    margin: 0 auto;
    height: calc(100vh - 90px - 58px - 5px);
    &__caption {
        padding: 10px;
        background: linear-gradient(to left, rgba(0,0,0,.3), rgba(0,0,0,.0) 50%, rgba(0,0,0,.3)), linear-gradient(#d77d31, #fe8417, #d77d31);
        box-shadow: inset #6e5a24 0 -1px 1px, #663c12 0 0 0 1px, #000 0 10px 15px -10px;
        color: #000;
        margin-bottom: 3px;
    }
    &__referal-link {
        width: calc(100% - 20px);
        margin: 20px auto 0 auto;
        background: rgba(0, 0, 0, .5);
        border-radius: 15px;
        padding: 20px;
        &-caption {
            margin-bottom: 10px;
        }
        &-input {
            padding: 10px;
            background-color: #111;
            color: #34bbff;
            text-align: center;
            border: 1px solid #34bbff;
            border-radius: 10px;
        }
    }
}
@media all and (max-width: 760px) {
    .profile-page {
        &__referal-link {
            width: 100%;
            margin-top: 10px;
            padding: 10px;
            font-size: 14px;
            &-input {
                padding: 5px;
                font-size: 10px;
            }
        }
    }
}
</style>
