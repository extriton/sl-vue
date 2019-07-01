<template>
    <div class="game-wrapper">
        <TheHeader />
        <GameMenu />
        <transition name="fade" mode="out-in">
          <div :key="$route.params.id">
            <router-view></router-view>
          </div>
        </transition>
    </div>
</template>

<script>
import TheHeader from '@/components/TheHeader.vue'
import GameMenu from '@/components/GameMenu.vue'

export default {
  name: 'Game',
  components: {
    TheHeader,
    GameMenu
  },
  data () {
    return {}
  },
}
</script>

<style lang="scss">
.game-wrapper {
  background-color: rgba(16, 24, 30, 0.98);
  -moz-user-select: none;
  -webkit-user-select: none;
  .template-color {
    color: #34bbff;
  }
}
.fade-enter-active, .fade-leave-active {
    transition: opacity 1s
}
.fade-enter, .fade-leave-active {
    opacity: 0
}
/*
.slide-right-leave-active,
.slide-right-enter-active,
.slide-left-leave-active,
.slide-left-enter-active {
  transition: 1s;
}
.slide-right-enter {
  transform: rotateY(90deg);
}
.slide-right-leave-to {
  transform: rotateY(90deg);
}
.slide-left-enter {
  transform: rotateY(-90deg);
}
.slide-left-leave-to {
  transform: rotateY(-90deg);
}
*/
/*
.fade-enter-active {
  transition: all .3s ease;
}
.fade-leave-active {
  transition: all .8s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.fade-enter, .fade-leave-to
  transform: translateX(10px);
  opacity: 0;
}
*/
/*
.fade-enter-active {
  animation: bounce-in .5s;
}
.fade-leave-active {
  animation: bounce-in .5s reverse;
}
@keyframes bounce-in {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.5);
  }
  100% {
    transform: scale(1);
  }
}
*/
</style>

