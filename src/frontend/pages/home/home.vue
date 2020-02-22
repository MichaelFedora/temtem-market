<template>
<div id='tem-home'>
  <div id='splash'>
    <div></div>
    <div>
      <b-field>
        <b-input
          v-model='search'
          placeholder='Search'
          type='search'
          icon='magnify'
        />
      </b-field>
    </div>
    <!-- splash & search bar -->
  </div>
  <transition>
    <div v-if='search' id='search-body'>
      <!-- search results --->
      <router-link v-for='tem of searchResults' :key='tem.id' :to='"/tem/" + tem.id'>
        <div><img :src='getTemIcon(tem.id)' /></div>
        <div>
          <div>
            <h3>{{ tem.name }}&nbsp;<img v-for='type of tem.types' :key='type' :src='"/" + type + ".png"'></h3>
            <span>&nbsp;- <b-icon icon='star' />&nbsp;{{ tem.score }}</span>
          </div>
          <div>
            <span v-for='stat of ["hp", "sta", "spd", "atk", "def", "spatk", "spdef"]' :key='stat'>
              <span>{{ stat.toUpperCase() }}:</span>
              <span
                :class='{
                  "stat-red": tem.stats[stat] < 33,
                  "stat-orange": tem.stats[stat] < 66,
                  "stat-green": tem.stats[stat] < 100,
                  "stat-blue": tem.stats[stat] >= 100
                }'>&nbsp;{{ tem.stats[stat] }}</span>
              </span>
          </div>
        </div>
      </router-link>
    </div>
    <div v-else id='home-body'>
      <h1>Recent Listings</h1>
      <ul>
        <div v-for='list of recent' :key='list.id'>
          <div><img :src='getTemIcon(list.temID, list.luma)'></div>
          <div>
            <h3>{{ list.name }}</h3>
            <span v-for='badge of list.badges' :key='badge'>{{ badge }}</span>
          </div>
          <div>
            <span>
              <span><img src='/assets/pansun.png'></span>
              <span>&nbsp;{{ list.price }}</span>
            </span>
            <span>
              <b-icon icon='star-circle-outline' />
              <span>&nbsp;{{ list.score }}</span>
              <span v-if='list.score_evo'>({{ list.score_evo }})</span>
            </span>
            <span
              :class='{
                "status-offline": list.status === "offline",
                "status-online": list.status === "online",
                "status-in-game": list.status === "in_game"
              }'
            >
              <b-icon :icon='getStatusIcon(list.status)' />
              <span>&nbsp;{{ list.user }}</span>
            </span>
          </div>
        </div>
      </ul>
    </div>
  </transition>
</div>
</template>
<script src='./home.ts'></script>
<style lang='scss'>
div#tem-home {
  > div#splash {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;

    max-height: 600px;
    height: 50vh;
    min-height: 8rem;

    background-image: url('/assets/splash.jpg');
    background-position: center;
    background-size: cover;

    > div:last-child {
      max-width: 90vw;
      width: 40rem;
      min-width: 20rem;
    }
  }
  > div#search-body {

  }
  > div#home-body {

  }
}
</style>
