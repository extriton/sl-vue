<template>
    <div class="admin-page">
        <h3>Уникальных ползьзователей: {{ uniqueUsers }}</h3>
        <h3>Количество посещений: {{ lookCount }}</h3>
        <h3>Уникальных ползьзователей за период: {{ uniqueUsersByPeriod }}</h3>
    </div>
</template>

<script>
export default {
    name: 'AdminPage',
    data () {
        return {
            uniqueUsers: 0,
            lookCount: 0,
            uniqueUsersByPeriod: 0,
            dateFrom: 0,
            dateTo: 0
        }
    },
    methods: {
        updateAdminData () {
            this.$socket.emit('getAdminData', { dateFrom: this.dateFrom, dateTo: this.dateTo })
        },
    },
    mounted () {
        this.dateTo = new Date()
        this.dateFrom = (new Date()).setDate(1)
        this.updateAdminData()
    },
    sockets: {
        getAdminDataSuccess (data) {
            this.uniqueUsers = data.uniqueUsers
            this.lookCount = data.lookCount
            this.uniqueUsersByPeriod = data.uniqueUsersByPeriod
        }
    }
}
</script>

<style lang="scss">

</style>