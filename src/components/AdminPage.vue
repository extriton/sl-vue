<template>
    <div class="admin-page">
        <h3 class="admin-page__summary">
            <span class="admin-page__new-users">Новые пользователи: <i class="value">{{ newUsers }}</i></span>
            <span class="admin-page__visits">Посещения: <i class="value">{{ visits }}</i></span>
        </h3>
        <hr class="clearfix" />
        <IpStat />
    </div>
</template>

<script>
import IpStat from '@/components/IpStat'

export default {
    name: 'AdminPage',
    components: {
      IpStat
    },
    data () {
        return {
            newUsers: 0,
            visits: 0,
        }
    },
    methods: {
        updateAdminData () {
            this.$socket.emit('getAdminData', {})
        },
    },
    mounted () {
        this.updateAdminData()
    },
    sockets: {
        getAdminDataSuccess (data) {
            this.newUsers = data.newUsers
            this.visits = data.visits
        }
    }
}
</script>

<style lang="scss">
.admin-page {
    padding-top: 20px;
    &__summary {
        height: 20px;
        .value {
            color: green;
        }
    }
    &__new-users {
        float: left;
    }
    &__visits {
        float: right;
    }
}
/*
.clearfix {
    clear: both;
}
*/
</style>