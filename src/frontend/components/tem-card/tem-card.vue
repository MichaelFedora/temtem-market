<template>
<router-link class='tem-tem-card' :to='"/tem/" + tem.id'>
  <div><img :src='getTemIcon(tem.id)'></div>
  <div>
    <div>
      <h3 class='title is-5'>{{ tem.name }}&nbsp;</h3>
      <figure v-for='type of tem.type' :key='type'>
        <img :alt='type' :src='"/assets/types/" + type.toLowerCase() + ".png"'>
      </figure>
      <span style='flex-grow: 1'></span>
      <span title='Score'>
        <b-icon icon='star-circle-outline' />
        <span class='title is-5'>&nbsp;{{ tem.score }}</span>
      </span>
    </div>
    <div>
      <span v-for='trait of tem.traits' :key='trait' title='Trait'>
        <b-icon icon='star-face' />&nbsp;{{ trait }}
      </span>
    </div>
    <div>
      <span
        v-for='stat of ["hp", "sta", "spd", "atk", "def", "spatk", "spdef"]'
        :key='stat'
        :class='{
          "stat-red": tem.stats[stat] < 33,
          "stat-orange": tem.stats[stat] >= 33 && tem.stats[stat] < 66,
          "stat-green": tem.stats[stat] >= 66 && tem.stats[stat] < 100,
          "stat-blue": tem.stats[stat] >= 100
        }'
        :title='stat'
      >
        {{ tem.stats[stat] }}
      </span>
    </div>
  </div>
</router-link>
</template>
<script src='./tem-card.ts'></script>
<style lang='scss'>
a.tem-tem-card {
  display: flex;
  color: white;
  background-color: hsl(0, 0%, 29%);
  padding: 0.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 5px rgba(0,0,0,0.33);
  margin: 1rem;
  width: 480px;
  height: 112px;

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
      > img {
        max-height: 100%;
        width: auto;
      }
    }

    > div:first-child { // name, max score
      display: flex;
      align-items: center;

      > h3 {
        margin: 0;
      }
      > span:last-child {
        display: flex;
        align-items: flex-start;
      }
    }
    > div:nth-child(2) { // traits
      display: flex;
      align-items: center;

      > span {
        display: inline-flex;
        align-items: center;

        &:not(:last-child) {
          margin-right: 0.5rem;
        }
      }
    }
    > div:last-child { // stats
      display: flex;
      > span {
        &:not(:last-child) {
          margin-right: 0.5rem;
        }
        background-color: hsl(0, 0%, 14%);
        padding: 0.15rem 0.3rem;
        border-radius: 3px;
        width: 2.5em;
        text-align: center;

        &.stat-red { color: hsl(348, 86%, 61%); }
        &.stat-orange { color: hsl(24, 80%, 61%); }
        &.stat-green { color: hsl(141, 53%, 53%); }
        &.stat-blue { background-color: hsl(204, 71%, 53%); color: #47ff47; }
      }
    }
  } // body
}
</style>
