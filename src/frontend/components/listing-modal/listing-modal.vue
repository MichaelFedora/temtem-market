<template>
<div id='tem-listing-modal' class='modal-card' style='width: auto'>
  <header class='modal-card-head'>
    <p class='modal-card-title'>{{ title }}</p>
  </header>

  <!-- form -->
  <section v-if='editing' class='modal-card-body form'>
    <div>
      <!-- icon, type, trait -->
      <div>
        <figure><img :src='temIcon'></figure>
        <div>
          <div>
            <h1 class='title is-4'>{{ tem.name }}</h1>
            <figure v-for='type of tem.type' :key='type' style='height: 2em'>
              <img :alt='type' :title='type' :src='"/assets/types/" + type.toLowerCase() + ".png"'>
            </figure>
          </div>
          <div class='field'>
            <b-select v-model='partial.trait' placeholder='Trait' icon='star-face'>
              <option v-for='trait of tem.traits' :key='trait' :value='trait'>
                {{ trait }}
              </option>
            </b-select>
          </div>
        </div>
      </div>
      <!-- luma, sex, level -->
      <div>
        <div class='field'>
          <b-checkbox v-model='partial.luma'><figure><img src='/assets/luma.png'></figure></b-checkbox>
        </div>
        <div class='field'>
          <b-icon icon='gender-male' />
          <b-switch v-model='partial.sex' style='margin-left: 0.5em' false-value='m' true-value='f' :rounded='true' />
          <b-icon icon='gender-female' />
        </div>
        <div class='field' style='width: 6em'>
          <span>Lv</span>
          <b-input v-model.number='partial.level' type='number' min='1' />
        </div>
      </div>
      <!-- stats -->
      <div>
        <!-- svs -->
        <div>
          <h3 class='title is-5'>SVs</h3>
          <div>
            <template v-for='stat of ["hp", "sta", "spd", "atk", "def", "spatk", "spdef"]'>
              <span :key='stat + "-label"'>{{ stat.toUpperCase() }}</span>
              <b-input
                :key='stat + "-input"'
                v-model.number='partial.svs[stat]'
                type='number'
                min='1'
                max='50'
              />
            </template>
          </div>
        </div>
        <!-- tvs -->
        <div>
          <h3 class='title is-5'>TVs</h3>
          <div>
            <template v-for='stat of ["hp", "sta", "spd", "atk", "def", "spatk", "spdef"]'>
              <span :key='stat + "-label"'>{{ stat.toUpperCase() }}</span>
              <b-input
                :key='stat + "-input"'
                v-model.number='partial.tvs[stat]'
                type='number'
                min='0'
                max='500'
              />
            </template>
          </div>
        </div>
      </div>
      <!-- bred techniques -->
      <div v-if='tem.bred_techniques.length'>
        <h3 class='title is-5'><b-icon icon='egg-easter' />&nbsp;Bred Techniques</h3>
        <b-checkbox
          v-for='tech of tem.bred_techniques'
          :key='tech'
          v-model='partial.bred_techniques'
          :native-value='tech'
        >
          {{ tech }}
        </b-checkbox>
      </div>
      <!-- price -->
      <div>
        <figure><img src='/assets/pansun.png'></figure>
        <b-input v-model.number='partial.price' type='number' min='0' />
      </div>
    </div>
  </section>
  <!-- detail -->
  <section v-else-if='listing' class='modal-card-body detail'>
    <div>
      <!-- image, name, types, luma, sex, level, trait -->
      <div class='header'>
        <figure><img :src='temIcon'></figure>
        <div>
          <router-link :to='"/tem/" + tem.id' class='hover-underline' @click.native='cancel()'>
            <h1 class='title is-4'>{{ tem.name }}</h1>
            <figure v-for='type of tem.type' :key='type' style='height: 2em'>
              <img :alt='type' :title='type' :src='"/assets/types/" + type.toLowerCase() + ".png"'>
            </figure>
          </router-link>
          <div>
            <figure v-if='listing.luma'>
              <img src='assets/luma.png'>
            </figure>
            <b-icon :icon='listing.sex === "m" ? "gender-male" : listing.sex === "f" ? "gender-female" : "help"' />
            <div>
              <span style='font-size: 0.7rem; font-weight: bold;'>Lv</span>
              <span>{{ listing.level }}</span>
            </div>
          </div>
          <div>
            <b-icon icon='star-face' />
            <span>{{ listing.trait }}</span>
          </div>
        </div>
      </div>
      <!-- stats -->
      <div class='stats'>
        <!-- svs -->
        <div>
          <h3 class='title is-5'>SVs</h3>
          <div>
            <template v-for='stat of ["hp", "sta", "spd", "atk", "def", "spatk", "spdef"]'>
              <span :key='stat + "-label"'>{{ stat.toUpperCase() }}</span>
              <span
                :key='stat + "-value"'
                :class='{
                  "stat-red": listing.svs[stat] < 20,
                  "stat-orange": listing.svs[stat] >= 20 && listing.svs[stat] < 35,
                  "stat-green": listing.svs[stat] >= 35 && listing.svs[stat] < 50,
                  "stat-blue": listing.svs[stat] >= 50
                }'
              >{{ listing.svs[stat] }}</span>
            </template>
          </div>
        </div>
        <div>
          <h3 class='title is-5'>TVs</h3>
          <div>
            <template v-for='stat of ["hp", "sta", "spd", "atk", "def", "spatk", "spdef"]'>
              <span :key='stat + "-label"'>{{ stat.toUpperCase() }}</span>
              <span
                :key='stat + "-value"'
                :class='{
                  "stat-red": listing.tvs[stat] < 50,
                  "stat-orange": listing.tvs[stat] >= 50 && listing.tvs[stat] < 200,
                  "stat-green": listing.tvs[stat] >= 200 && listing.tvs[stat] < 500,
                  "stat-blue": listing.tvs[stat] >= 500
                }'
              >{{ listing.tvs[stat] }}</span>
            </template>
          </div>
        </div>
      </div>
      <!--  bred techniques -->
      <div v-if='listing.bred_techniques.length' class='bred-techniques'>
        <h3 class='title is-5'><b-icon icon='egg-easter' />&nbsp;Bred Techniques</h3>
        <div>
          <div v-for='tech of listing.bred_techniques' :key='tech'>
            <b-icon icon='egg-easter' />
            <span>{{ tech }}</span>
          </div>
        </div>
      </div>
      <!-- price -->
      <div class='price'>
        <figure><img src='/assets/pansun.png'></figure>
        <span>{{ listing.price.toLocaleString() }}</span>
      </div>
      <!-- user row -->
      <router-link v-if='!owned' :to='"/user/" + listing.userID' class='user' @click.native='cancel()'>
        <figure v-if='listing.avatar' class='avatar'>
          <img alt='' :src='listing.avatar' :onerror='listing.avatar = ""'>
        </figure>
        <div v-else class='avatar'>
          <span>{{ (listing.user || '?')[0] }}</span>
        </div>
        <span>{{ listing.user }}</span>
      </router-link>
    </div>
  </section>
  <section v-else class='modal-card-body'>
    <!-- error -->
  </section>

  <footer class='modal-card-foot'>
    <div v-show='error && editing'>
      {{ error }}
    </div>
    <div>
      <button class='button' :disabled='working' @click='cancel()'>{{ editing ? "Cancel" : "Close " }}</button>
      <template v-if='owned'>
        <template v-if='!editing'>
          <button class='button is-primary' :class='{ "is-loading": working }' :disabled='working' @click='edit()'>Edit</button>
          <button class='button is-danger' :class='{ "is-loading": working }' :disabled='working' @click='del()'>Delete</button>
        </template>
        <button v-else class='button is-primary' :class='{ "is-loading": working }' :disabled='!valid || working' @click='save()'>
          Save
        </button>
      </template>
    </div>
  </footer>
</div>
</template>
<script src='./listing-modal.ts'></script>
<style lang='scss'>
div#tem-listing-modal {

  figure {
    height: 1.5em;
    width: 1.5em;
    overflow: hidden;
  }

  section.modal-card-body {
    min-width: 24rem;
  }

  section.modal-card-body.form {
    display: flex;
    justify-content: center;

    > div {
      display: flex;
      flex-flow: column;
      justify-content: stretch;

      > :not(:first-child) {
        margin-top: 0.5rem;
      }

      // image, name, types, trait
      > div:first-child {

        display: flex;

        // image
        > figure {
          height: 96px;
          width: 96px;
          border: 0.4rem solid hsl(0, 0%, 29%);
          background-color: rgba(0, 0, 0, 0.33);
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
          margin-right: 1em;
        }

        > div {
          display: flex;
          flex-flow: column;
          overflow: hidden;

          > div:first-child {
            // name, types
            display: flex;
            align-items: flex-start;

            > h1 {
              margin-right: 0.5rem;
            }

            > figure {
              height: 2em;
              width: auto;
              overflow: hidden;
              > img {
                width: auto;
                max-height: 100%;
              }
            }
          }
        }
      }
      // luma, sex, level
      > div:nth-child(2) {
        display: flex;
        align-items: center;
        justify-content: space-between;

        > div {
          display: flex;
          align-items: center;
          &:not(:last-child) {
            margin-right: 1em;
          }
          margin-bottom: 0;
        }
      }
      // stats
      > div:nth-child(3) {
        display: flex;
        flex-wrap: wrap;

        > div {
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
          &:not(:last-child) {
            margin-right: 2rem;
          }

          > div {
            display: grid;
            grid-template-columns: auto auto;
            align-items: center;
            grid-gap: 0.25em;

            > h3 {
              margin-right: 1rem;
              text-align: center;
            }
            > div {
              max-width: 6em;
            }
          }
        }
      }
      // bred techniques
      > div:nth-child(4):not(:last-child) {
        display: flex;
        flex-flow: column;
        margin-bottom: 1rem;
        > h3 {
          margin-bottom: 0.5rem;
        }
        > *:not(:first-child) {
          margin: 0;
          margin-top: 0.5rem;
        }
      }
      // price
      > div:last-child{
        display: flex;
        align-items: center;
        padding-bottom: 1rem;

        > figure {
          height: 2em;
          width: 2em;
          margin-right: 1rem;
        }
      }
    }
  }

  section.modal-card-body.detail {
    display: flex;
    justify-content: center;

    > div {
      display: flex;
      flex-flow: column;
      justify-content: stretch;

      > :not(:first-child) {
        margin-top: 0.5rem;
      }

      // image, name, types, trait
      > div.header {

        display: flex;

        // image
        > figure {
          height: 96px;
          width: 96px;
          border: 0.4rem solid hsl(0, 0%, 29%);
          background-color: rgba(0, 0, 0, 0.33);
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
          margin-right: 1em;
        }

        > div {
          display: flex;
          flex-flow: column;
          overflow: hidden;

          > a:first-child {
            // name, types
            display: flex;
            align-items: flex-start;
            position: relative;
            margin-bottom: 0.5rem;

            > h1 {
              margin-right: 0.5rem;
              margin-bottom: 0;
            }

            > figure {
              height: 2em;
              width: auto;
              overflow: hidden;
              > img {
                width: auto;
                max-height: 100%;
              }
            }
          }
          > div:nth-child(2) {
            display: flex;
            align-items: center;
            margin-bottom: 0.5rem;
            > :not(:last-child) {
              margin-right: 1rem;
            }
            > div {
              display: flex;
              align-items: baseline;
            }
          }
          > div:last-child {
            display: flex;
            > span:last-child {
              margin-left: 0.5rem;
            }
          }
        }
      }

      > div.stats {
        display: flex;
        flex-wrap: wrap;
        margin-top: 0;

        > div {
          margin: 1em;
          > h3 {
            margin-bottom: 1rem;
            margin-top: 0;
          }
          > div {
            display: grid;
            grid-template-columns: auto auto;
            grid-gap: 0.25em;
            align-items: center;
            justify-items: center;

            > span:nth-child(2n + 2) {

              &.stat-red { color: hsl(348, 86%, 61%); }
              &.stat-orange { color: hsl(24, 80%, 61%); }
              &.stat-green { color: hsl(141, 53%, 53%); }
              &.stat-blue { background-color: hsl(204, 71%, 53%); color: #47ff47; }

              display: block;
              background-color: hsl(0, 0%, 14%);
              padding: 0.15rem 0.3rem;
              border-radius: 3px;
              width: 2.25em;
              text-align: center;
            }
          }
        }
      }
      > div.bred-techniques {
        > div {
          display: flex;
          flex-wrap: wrap;
          > :not(:last-child) {
            margin-right: 0.5rem;
            margin-bottom: 0.5rem;
          }
        }
      }
      > div.price {
        display: flex;
        align-items: center;

        > figure {
          height: 2em;
          width: 2em;
          margin-right: 0.5rem;
        }
      }
      > a.user {
        display: flex;
        color: inherit;

        &:hover {
          color: hsl(256, 60%, 59%);
        }

        > :first-child {
          margin-right: 0.5rem;
        }
      }
      > a:last-child, > div:last-child {
        padding-bottom: 1rem;
      }
    }
  }

  > footer {
    display: flex;
    flex-flow: column;
    justify-content: unset;
    align-items: flex-end;

    > div:first-child {
      color: hsl(348, 86%, 61%);
      margin-bottom: 0.5em;
    }
    > div:last-child {
      display: flex;
      justify-content: flex-end;
    }
  }
}
</style>
