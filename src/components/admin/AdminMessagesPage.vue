<template>
    <div class="admin-messages-page">
        <h3 class="admin-messages-page__title">Сообщения</h3>
    </div>
</template>

<script>
export default {
    name: 'AdminMessagesPage',
    data () {
        return {
        }
    },
    methods: {
        updateAdminMessagesData () {
            this.$socket.emit('getAdminMessagesData', {})
        },
    },
    mounted () {
        this.updateAdminMessagesData()
    },
    sockets: {
        getAdminMessagesDataSuccess (data) {
            return
        }
    }
}
</script>

<style lang="scss">
.admin-messages-page {
    padding-top: 20px;
}
</style>
