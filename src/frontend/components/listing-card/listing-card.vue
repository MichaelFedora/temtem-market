<template>
<button
  class='tem-listing-card'
  :class='{
    "status-offline": listing.status === "offline",
    "status-online": listing.status === "online",
    "status-in-game": listing.status === "in_game"
  }'
  @click='() => $emit("click")'
>
  <div><img :src='getTemIcon(listing.temID, !listing.ignoreLuma ? listing.luma : false)' @error='$set(listing, "ignoreLuma", true)'></div>
  <div>
    <div>
      <figure v-if='listing.luma' style='margin-right: 0.3rem'>
        <img src='/assets/luma.png'>
      </figure>
      <h3 class='title is-5'>
        <span>{{ listing.temName }}</span>

        <b-icon :icon='listing.sex === "m" ? "gender-male" : listing.sex === "f" ? "gender-female" : "help"' />

        <span style='font-size: 0.7rem; font-weight: bold; margin-right: -0.5em'>Lv</span>
        <span>{{ listing.level }}</span>
      </h3>
      <span style='flex-grow: 1;'></span>
      <span title='Score' style='display: inline-flex; align-items: center; margin-right: 0.5em'>
        <b-icon icon='star-circle-outline' />
        <span>&nbsp;{{ listing.score }}</span>
        <span v-if='listing.score_evo' title='Evolved Score'>&nbsp;({{ listing.score_evo }})</span>
      </span>
      <b-icon
        :class='{
          "status-offline": listing.status === "offline",
          "status-online": listing.status === "online",
          "status-in-game": listing.status === "in_game"
        }'
        :title='listing.status.replace("_", " ")'
        :icon='getStatusIcon(listing.status)'
      />
    </div>
    <div>
      <span title='Trait'>
        <b-icon icon='star-face' />&nbsp;{{ listing.trait }}
      </span>
      <span title='Fertility'>
        <span style='font-size: 0.7rem; font-weight: bold'>{{ listing.fertility || 0 }}x</span>
        <b-icon icon='leaf' />
      </span>
      <span title='Price'>
        <figure><img src='/assets/pansun.png'></figure>
        <span>&nbsp;{{ listing.price.toLocaleString() }}</span>
      </span>
    </div>
    <div>
      <figure v-if='listing.avatar' class='avatar'>
        <img alt='' :src='listing.avatar' @error='listing.avatar = ""'>
      </figure>
      <div v-else class='avatar'>
        <span>{{ (listing.user || '?')[0] }}</span>
      </div>
      <span>&nbsp;{{ listing.user }}</span>
      <span style='flex-grow:1'></span>
      <span v-for='badge of listing.badges' :key='badge' class='badge' :class='[badge]'>{{ badge }}</span>
    </div>
  </div>
</button>
</template>
<script src='./listing-card.ts'></script>
<style lang='scss'>

$in_game: hsl(171, 100%, 41%);
$online: hsl(217, 71%, 53%);
$offline: hsl(348, 86%, 61%);

button.tem-listing-card {
  display: flex;
  color: white;
  background-color: hsl(0, 0%, 29%);
  padding: 0.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 5px rgba(0,0,0,0.33);
  margin: 1rem;
  width: 480px;
  height: 112px;

  border: none;
  cursor: pointer;


  &.status-in-game {
    border-right: 8px solid $in_game;
  }
  &.status-online {
    border-right: 8px solid $online;
  }
  &.status-offline {
    border-right: 8px solid $offline;
  }

  > div:first-child { // image
    height: 96px;
    width: 96px;
    border: 0.4rem solid rgba(0, 0, 0, 0.96);
    background-color: rgba(0, 0, 0, 0.33);
    border-radius: 50%;
    overflow: hidden;
  }

  > div:last-child { // body
    display: flex;
    flex-grow: 1;
    flex-flow: column;
    margin-left: 1rem;
    justify-content: space-between;

    figure {
      height: 1.5em;
      width: 1.5em;
      overflow: hidden;
    }

    > div:first-child { // name, badges
      display: flex;
      align-items: center;
      white-space: nowrap;

      > h3 {
        margin: 0;
        // display: flex;
        // align-items: baseline;
      }
      > span.icon { // status
        align-self: flex-end;
        &.status-in-game {
          color: $in_game;
        }
        &.status-online {
          color: $online;
        }
        &.status-offline {
          color: $offline;
        }
      }
    }
    > div:nth-child(2) { // price, score
      display: flex;
      align-items: center;
      figure {
        height: 1.5em;
        width: 1.5em;
        overflow: hidden;
        &.avatar {
          border-radius: 50%;
        }
      }
      > span {
        display: flex;
        align-items: center;
        &:not(:last-child) {
          margin-right: 1rem;
        }
      }
    } // price, score, user
    > div:last-child { // user
      display: flex;
      align-items: center;


      > span.badge { // badge
        margin-left: 0.5rem;
        font-size: 0.7rem;
        padding: 0.15rem 0.3rem;
        border: 1px solid;
        border-radius: 3px;
        &.prime, &.perfect {
          color: hsl(48, 100%, 67%) ;
        }
        &.perfected, &.specialized {
          color: hsl(171, 100%, 41%) ;
        }
        &.clean, &.untrained {
          color: hsl(204, 71%, 53%) ;
        }
        &.trained {
          color: hsl(256, 100%, 72%) ;
        }
      }
    }
  } // body
}
</style>
