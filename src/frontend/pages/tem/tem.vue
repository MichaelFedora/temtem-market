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
          <img :alt='type' :title='type' :src='"/assets/types/" + type.toLowerCase() + ".png"'>
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
          <h3 class='title is-5'>50SV Score: <b-icon icon='star-circle-outline' />&nbsp;{{ tem.score }}</h3>
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
    <div v-if='evoTem'>
      <b-icon icon='chevron-double-right' size='is-large' />
      <router-link :to='"/tem/" + evoTem.id'>
        <figure><img :alt='evoTem.name' :src='evoTemIcon'></figure>
        <div>
          <h1 class='title is-5'>{{ evoTem.name }}</h1>
          <figure v-for='type of evoTem.type' :key='type'>
            <img :alt='type' :title='type' :src='"/assets/types/" + type.toLowerCase() + ".png"'>
          </figure>
        </div>
        <div class='stats'>
          <template v-for='stat of ["hp", "sta", "spd", "atk", "def", "spatk", "spdef"]'>
            <span :key='stat + "-stat"'>{{ stat.toUpperCase() }}</span>
            <span :key='stat + "-bar"' :class='[getStatClass(evoTem.stats[stat])]' :style='{ width: evoTem.stats[stat] + "px" }'></span>
            <span :key='stat + "-num"' :class='[getStatClass(evoTem.stats[stat])]'>{{ evoTem.stats[stat] }}</span>
          </template>
        </div>
      </router-link>
    </div>
  </div>
  <div id='body'>
    <div>
      <h1 class='title is-4'>
        <span>Listings</span>
        <button class='button is-dark' :class='{ "is-loading": working }' @click='refresh()'><b-icon icon='refresh' /></button>
      </h1>
      <b-button v-if='loggedIn' class='is-hidden-desktop' type='is-primary' icon-left='plus' @click='addListing()'>
        Add
      </b-button>
    </div>
    <div>
      <p v-if='listings.length <= 0' style='margin: 0; text-align: center'>Nothing found!</p>
      <template v-else>
        <tem-listing-table :listings='listings' @click='click($event)' />
        <button v-if='more' class='button is-dark' @click='fetchMore()'><b-icon icon='chevron-down' /></button>
      </template>
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
    justify-content: center;

    // image
    > figure:first-child {
      // image
      height: 192px;
      width: 192px;
      margin: 1rem;
      border: 0.7rem solid hsl(0, 0%, 29%);
      background-color: rgba(0, 0, 0, 0.33);
      border-radius: 50%;
      overflow: hidden;
      flex-shrink: 0;
    }

    > div:nth-child(2) { // infos

      display: flex;
      flex-flow: column;

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
            &.stat-blue {
              background-color: hsl(204, 71%, 53%);;
            }
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

    > div:nth-child(3) {
      display: flex;
      align-items: center;

      > a:nth-child(2) {
        display: flex;
        align-items: center;
        flex-flow: column;
        margin-left: 1rem;
        color: inherit;
        &:hover > div:nth-child(2) > h1 {
          text-decoration: underline;
        }

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
            margin-bottom: 0.5rem;
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
          font-size: 0.75em;
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
            &.stat-blue {
              background-color: hsl(204, 71%, 53%);
            }
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

    display: flex;
    flex-flow: column;
    align-items: center;

    margin-bottom: 1rem;

    > div:first-child {
      width: 100%;
      margin-top: 0;
      margin-bottom: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;

      > h1 {
        display: flex;
        align-items: center;
        margin-bottom: 1rem;

        > span {
          margin-left: 1rem;
          margin-right: 1rem;
        }
      }
    }

    > div:last-child {
      margin-left: 0.5rem;
      margin-right: 0.5rem;
      margin-bottom: 1rem;

      > button {
        width: calc(100% - 1rem);
        margin-top: 1rem;
      }
    }
  }
}
</style>
