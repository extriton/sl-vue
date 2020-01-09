<template>
    <div class="admin-users-page">
        <h3 class="admin-users-page__title">Пользователи</h3>
    </div>
</template>

<script>
export default {
    name: 'AdminUsersPage',
    data () {
        return {
        }
    },
    methods: {
        updateAdminUsersData () {
            this.$socket.emit('getAdminUsersData', {})
        },
    },
    mounted () {
        this.updateAdminUsersData()
    },
    sockets: {
        getAdminUsersDataSuccess (data) {
            return
        }
    }
}
</script>

<style lang="scss">
.admin-users-page {
    padding-top: 20px;
}
</style>
