<template>
<div id='tem-tem'>
  <div id='header'>
    <figure><img :alt='tem.name' :src='temIcon'></figure>
    <div>
      <!-- infos -->
      <div>
        <!-- name, type -->
        <h1 class='title is-3'>{{ tem.name }}</h1>
        <figure v-for='type of tem.type' :key='type'>
          <img :alt='type' :src='"/assets/types/" + type.toLowerCase() + ".png"'>
        </figure>
      </div>
      <!-- stats, traits & score -->
      <div>
        <div class='stats'>
          <template v-for='stat of ["hp", "sta", "spd", "atk", "def", "spatk", "spdef"]'>
            <span :key='stat + "-stat"'>{{ stat.toUpperCase() }}</span>
            <span :key='stat + "-bar"' :class='[getStatClass(tem.stats[stat])]' :style='{ width: tem.stats[stat] + "px" }'></span>
            <span :key='stat + "-num"' :class='[getStatClass(tem.stats[stat])]'>{{ tem.stats[stat] }}</span>
          </template>
        </div>
        <div>
          <h3 class='title is-5'>Max Score: <b-icon icon='star-circle-outline' />&nbsp;{{ tem.score }}</h3>
          <div>
            <span v-for='trait of tem.traits' :key='trait' title='Trait'>
              <b-icon icon='star-face' />&nbsp;{{ trait }}
            </span>
          </div>
          <div>
            <span v-for='teq of tem.bred_techniques' :key='teq' title='Bred Technique'>
              <b-icon icon='egg-easter' />&nbsp;{{ teq }}
            </span>
          </div>
        </div>
      </div>
    </div>
    <!-- evolvution -->
    <router-link v-if='evoTem' :to='"/tem/" + evoTem.id'>
      <b-icon icon='chevron-double-right' size='is-large' />
      <div>
        <figure><img :alt='evoTem.name' :src='evoTemIcon'></figure>
        <div>
          <h1 class='title is-5'>{{ evoTem.name }}</h1>
          <figure v-for='type of evoTem.type' :key='type'>
            <img :alt='type' :src='"/assets/types/" + type.toLowerCase() + ".png"'>
          </figure>
        </div>
        <div class='stats'>
          <template v-for='stat of ["hp", "sta", "spd", "atk", "def", "spatk", "spdef"]'>
            <span :key='stat + "-stat"'>{{ stat.toUpperCase() }}</span>
            <span :key='stat + "-bar"' :class='[getStatClass(evoTem.stats[stat])]' :style='{ width: evoTem.stats[stat] + "px" }'></span>
            <span :key='stat + "-num"' :class='[getStatClass(evoTem.stats[stat])]'>{{ evoTem.stats[stat] }}</span>
          </template>
        </div>
      </div>
    </router-link>
  </div>
  <div id='body'>
    <h1 class='title is-4'>Listings</h1>
    <div>
      <span v-if='listings.length <= 0' style='width: 100%; text-align: center'>Nothing found!</span>
    </div>
  </div>
</div>
</template>
<script src='./tem.ts'></script>
<style lang='scss'>
div#tem-tem {

  > div#header {

    display: flex;
    color: white;
    background-color: hsl(0, 0%, 14%);
    padding: 0.5rem;
    box-shadow: inset 0 1px 5px rgba(0,0,0,0.33);

    // image
    > figure:first-child {
      // image
      height: 256px;
      width: 256px;
      margin-top: 1rem;
      margin-left: 1rem;
      border: 0.7rem solid hsl(0, 0%, 29%);
      background-color: rgba(0, 0, 0, 0.33);
      border-radius: 50%;
      overflow: hidden;
      flex-shrink: 0;
    }

    > div:nth-child(2) { // infos

      display: flex;
      flex-flow: column;

      margin-left: 1rem;

      > div:first-child { // name, types
        display: flex;
        align-items: flex-start;

        > h1 {
          margin-right: 0.5rem;
        }

        figure {
          height: 2.5em;
          width: auto;
          overflow: hidden;
          > img {
            width: auto;
            max-height: 100%;
          }
        }
      }

      // stats etc
      > div:last-child {
        display: flex;
        margin-left: 1rem;
        flex-wrap: wrap;
        align-items: flex-start;

        // stats
        > div:first-child {
          display: grid;
          grid-template-columns: auto auto auto;
          gap: 0.5em;
          margin-right: 1em;
          align-items: center;

          > span { background-color: black; }
          > span.stat-red { color: hsl(348, 86%, 61%); }
          > span.stat-orange { color: hsl(24, 80%, 61%); }
          > span.stat-green { color: hsl(141, 53%, 53%); }
          > span.stat-blue {
            background-color: hsl(204, 71%, 53%);
            color: #47ff47;
          }

          > span:nth-child(3n + 1) {
            padding: 0.15rem 0.5rem;
            border-radius: 3px;
            text-align: center;
          }
          > span:nth-child(3n + 2) {
            display: block;
            height: 4px;
            background-color: currentColor;
          }
          > span:nth-child(3n + 3) {
            padding: 0.15rem 0.3rem;
            border-radius: 3px;
            width: 2.5em;
            text-align: center;
          }
        }

        // score, traits, bred techniques (?)
        > div:nth-child(2) {
          margin-left: 1rem;
          flex-shrink: 1;
          flex-grow: 1;
          flex-basis: 0;
          max-width: 16em;

           > h3 {
             margin-bottom: 1rem;
             white-space: nowrap;
           }

            > div {
              display: flex;
              align-items: flex-start;
              flex-wrap: wrap;
              > * {
                margin-bottom: 1rem;
                margin-right: 1rem;
                display: flex;
                white-space: nowrap;
              }
            }
        }
      }
    }

    > a:nth-child(3) {
      margin-left: 1rem;
      display: flex;
      align-items: center;
      color: inherit;

      > div:nth-child(2) {
        display: flex;
        align-items: center;
        flex-flow: column;
        margin-left: 1rem;

        > figure {
          // image
          height: 96px;
          width: 96px;
          border: 0.4rem solid hsl(0, 0%, 29%);
          background-color: rgba(0, 0, 0, 0.33);
          border-radius: 50%;
          overflow: hidden;
        }

        > div:nth-child(2) { // name, types (evo)
          display: flex;
          align-items: flex-start;

          > h1 {
            margin-right: 0.5rem;
          }

          figure {
            height: 1.5em;
            width: auto;
            overflow: hidden;
            > img {
              width: auto;
              max-height: 100%;
            }
          }
        }
        > div:last-child {
          display: grid;
          grid-template-columns: auto auto auto;
          gap: 0.25em;
          align-items: center;

          > span { background-color: black; }
          > span.stat-red { color: hsl(348, 86%, 61%); }
          > span.stat-orange { color: hsl(24, 80%, 61%); }
          > span.stat-green { color: hsl(141, 53%, 53%); }
          > span.stat-blue {
            background-color: hsl(204, 71%, 53%);
            color: #47ff47;
          }

          > span:nth-child(3n + 1) {
            padding: 0.15rem 0.5rem;
            border-radius: 3px;
            text-align: center;
          }
          > span:nth-child(3n + 2) {
            display: block;
            height: 4px;
            background-color: currentColor;
          }
          > span:nth-child(3n + 3) {
            padding: 0.15rem 0.3rem;
            border-radius: 3px;
            width: 2.5em;
            text-align: center;
          }
        }
      }
    }
  }

  > div#body {
    > h1 {
      margin-top: 0.5rem;
      margin-bottom: 1rem;
      margin-left: 1rem;
    }

    > div {
      display: flex;
    }
  }
}
</style>
