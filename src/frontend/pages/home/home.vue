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
      <h1 class='title is-4'>
        <a class='button is-dark' @click='search = ""'>
          <b-icon icon='arrow-left' />
        </a>
        <span>Search</span>
      </h1>
      <!-- search results --->
      <div>
        <tem-card v-for='tem of searchResults' :key='tem.id' :tem='tem' />
        <span v-if='searchResults.length <= 0' style='width: 100%; text-align: center'>Nothing found!</span>
      </div>
    </div>
    <div v-else id='home-body'>
      <h1 class='title is-4'>Recent Listings</h1>
      <div>
        <tem-listing-card v-for='list of recent' :key='list.id' :listing='list' @click='click(list)' />
      </div>
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
    > h1 {
      display: flex;
      align-items: center;
      margin-bottom: 1rem;

      > span {
        margin-left: 1rem;
      }
    }
    > div {
      display: flex;
      display: flex;
      flex-wrap: wrap;
    }
  }
  > div#home-body {
    > h1 {
      margin-bottom: 1rem;
      margin-top: 0.5rem;
      margin-left: 1rem;
    }
    > div { // list
      display: flex;
      flex-wrap: wrap;
    } // list
  }
}
</style>
