<template>
<div id='tem-me'>
  <div
    id='header'
    :class='{
      "status-offline": user.status === "offline",
      "status-online": user.status === "online",
      "status-in-game": user.status === "in_game"
    }'
  >
    <figure><img alt='' :src='user.discordAvatar ? user.discordAvatar + "?size=256" : ""'></figure>
    <div>
      <!-- discord name, status -->
      <div class='discord'>
        <h1 class='title is-3'>
          {{ user.discordName }}<b-icon style='margin-left: 1rem' :icon='getStatusIcon(user.status)' size='is-medium' />
        </h1>
      </div>
      <!-- tamer name & id -->
      <div class='temtem'>
        <span v-if='!editing || !self' title='Tamer Info' class='title is-5'>{{ user.temUserName }} - {{ user.temUserID }}</span>
        <template v-else>
          <b-input v-model='tamerName' size='is-small' :disabled='working' placeholder='Tamer Name' />
          <b-input v-model='tamerID' size='is-small' :disabled='working' placeholder='Tamer ID' />
        </template>
      </div>
      <div v-if='self' class='btns'>
        <button v-if='!editing' style='align-self: flex-end' class='button is-primary is-small' @click='edit()'>Edit</button>
        <template v-else>
          <button class='button is-small' style='align-self: flex-end' :disabled='working' @click='cancel()'>Cancel</button>
          <button class='button is-primary is-small' :class='{ "is-loading": working }' :disabled='working' @click='save()'>Save</button>
          <button class='button is-danger is-small' :class='{ "is-loading": working }' :disabled='working' @click='del()'>
            Delete Account
          </button>
        </template>
      </div>
    </div>
  </div>
  <div id='listings'>
    <h1 class='title is-4'>
      <span>Listings</span>
      <button class='button is-dark' :class='{ "is-loading": working }' @click='refresh()'><b-icon icon='refresh' /></button>
    </h1>
    <div>
      <tem-listing-card v-for='list of listings' :key='list.id' :listing='list' @click='click(list)' />
    </div>
  </div>
</div>
</template>
<script src='./user.ts'></script>
<style lang='scss'>
$in_game: hsl(171, 100%, 41%);
$online: hsl(217, 71%, 53%);
$offline: hsl(348, 86%, 61%);

div#tem-me {
  > div#header {
    display: flex;
    color: white;
    background-color: hsl(0, 0%, 14%);
    padding: 0.5rem;
    box-shadow: inset 0 1px 5px rgba(0,0,0,0.33);
    justify-content: center;

    &.status-in-game {
      > figure:first-child {
        border-color: $in_game;
        > img {
          height: 100%;
          max-width: 100%;
        }
      }
      > div:nth-child(2) > div.discord > h1 > span.icon {
        color: $in_game;
      }
    }
    &.status-online {
      > figure:first-child {
        border-color: $online;
      }
      > div:nth-child(2) > div.discord > h1 > span.icon {
        color: $online;
      }
    }
    &.status-offline {
      > figure:first-child {
        border-color: $offline;
      }
      > div:nth-child(2) > div.discord > h1 > span.icon {
        color: $offline;
      }
    }

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

      > div.temtem,
      > div.btns {
        display: flex;
        align-items: center;
        margin-top: 1rem;

        > span.title {
          margin-bottom: 0;
        }
        > :not(:last-child) {
          margin-right: 1rem;
        }
      }
    }
  }
  > div#listings {
    > h1 {
      display: flex;
      align-items: center;
      margin-bottom: 1rem;

      > span {
        margin-left: 1rem;
        margin-right: 1rem;
      }
    }
    > div { // list
      display: flex;
      flex-wrap: wrap;
    } // list
  }
}
</style>
