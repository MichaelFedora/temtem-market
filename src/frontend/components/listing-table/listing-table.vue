<template>
<table id='tem-listing-table'>
  <thead>
    <th></th> <!-- user avatar -->
    <th></th> <!-- user -->
    <template v-if='extended'>
      <th></th> <!-- tem avatar -->
      <th></th> <!-- tem name -->
      <th></th> <!-- types -->
    </template>
    <th></th> <!-- luma -->
    <th></th> <!-- gender -->
    <th></th> <!-- level -->
    <th></th> <!-- fertility -->
    <th></th> <!-- trait -->
    <th></th> <!-- score -->
    <th v-if='hasEvo'></th> <!-- evo score -->
    <th class='is-hidden-touch'></th> <!-- sv -->
    <th class='is-hidden-touch'></th> <!-- sv -->
    <th class='is-hidden-touch'></th> <!-- sv -->
    <th class='is-hidden-touch'></th> <!-- sv -->
    <th class='is-hidden-touch'></th> <!-- sv -->
    <th class='is-hidden-touch'></th> <!-- sv -->
    <th class='is-hidden-touch'></th> <!-- sv -->
    <th></th> <!-- status -->
  </thead>
  <tbody>
    <tr
      v-for='listing of listings'
      :key='listing.id'
      :class='{
        "status-online": listing.status === "online",
        "status-in-game": listing.status === "in_game",
        "status-offline": listing.status === "offline",
        "hover": hover === listing.id,
      }'
      @click='$emit("click", listing)'
      @mouseenter='hover = listing.id'
      @mouseleave='hover = hover === listing.id ? "" : hover'
    >
      <td>
        <figure v-if='listing.avatar' class='avatar'>
          <img alt='' :src='listing.avatar' @error='listing.avatar = ""'>
        </figure>
        <div v-else class='avatar'>
          <span>{{ (listing.user || '?')[0] }}</span>
        </div>
      </td>
      <td :title='listing.user' class='user'>
        {{ listing.user }}
      </td>
      <template v-if='extended'>
        <td>
          <figure class='avatar'>
            <img :src='getTemIcon(listing.temID, listing.ignoreLuma ? false : listing.luma)' @error='$set(listing, "ignoreLuma", true)'>
          </figure>
        </td> <!-- tem avatar -->
        <td> {{ listing.temName }} </td> <!-- tem name -->
        <td>
          <div style='display:flex'>
            <figure v-for='type of listing.temType' :key='type'>
              <img :alt='type' :title='type' :src='"/assets/types/" + type.toLowerCase() + ".png"'>
            </figure>
          </div>
        </td> <!-- types -->
      </template>
      <td title='Luma'>
        <figure v-if='listing.luma'>
          <img src='/assets/luma.png'>
        </figure>
      </td>
      <td title='Sex'>
        <b-icon :icon='listing.sex === "m" ? "gender-male" : listing.sex === "f" ? "gender-female" : "help"' />
      </td>
      <td title='Level'>
        <span style='font-size: 0.7rem; font-weight: bold;'>Lv</span><span>{{ listing.level }}</span>
      </td>
      <td title='Fertility'>
        <div style='display: flex; align-items: center'>
          <span style='font-size: 0.7rem; font-weight: bold;'>{{ listing.fertility || '?' }}x</span><b-icon icon='leaf' />
        </div>
      </td>
      <td>
        <div style='display: flex; white-space: nowrap'>
          <b-icon icon='star-face' />&nbsp;{{ listing.trait }}
        </div>
      </td>
      <td title='Score'>
        <div style='display: flex;'>
          <b-icon icon='star-circle-outline' />&nbsp;{{ listing.score }}
        </div>
      </td>
      <td v-if='hasEvo' title='Evo Score'>
        ({{ listing.score_evo }})
      </td>
      <td
        v-for='stat of ["hp", "sta", "spd", "atk", "def", "spatk", "spdef"]'
        :key='stat'
        :class='{
          "stat-red": listing.svs[stat] < 20,
          "stat-orange": listing.svs[stat] >= 20 && listing.svs[stat] < 35,
          "stat-green": listing.svs[stat] >= 35 && listing.svs[stat] < 50,
          "stat-blue": listing.svs[stat] >= 50
        }'
        class='is-hidden-touch stat'
        :title='stat'
      >
        <span>{{ listing.svs[stat] }}</span>
      </td>
      <td title='Price'>
        <div style='display: flex;'>
          <figure><img src='/assets/pansun.png'></figure>
          <span>{{ listing.price.toLocaleString() }}</span>
        </div>
      </td>
      <td :title='listing.status'>
        <b-icon :icon='getStatusIcon(listing.status)' />
      </td>
    </tr>
  </tbody>
</table>
</template>
<script src='./listing-table.ts'></script>
<style lang='scss'>
@import '~colors.scss';

table#tem-listing-table {

  border-radius: 3px;
  overflow: hidden;

  > tbody > tr {
    position: relative;
    transition: box-shadow, background-color, top, 0.15s;
    box-shadow: 0 0 0 rgba(0,0,0,0.33);
    background-color: $grey-dark;
    top: 0;

    user-select: none;
    cursor: pointer;

    figure {
      height: 1.5em;
      width: 1.5em;
      overflow: hidden;
      > img {
        max-height: 100%;
      }
    }

    > td {
      &:not(:last-child) {
        margin-right: 1rem;
      }
      padding: 0.5em;

      &.user {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 10em;
      }

      &.stat {

        padding: 0.25em;
        vertical-align: middle;

        &.stat-red > span { color: hsl(348, 86%, 61%); }
        &.stat-orange > span { color: hsl(24, 80%, 61%); }
        &.stat-green > span { color: hsl(141, 53%, 53%); }
        &.stat-blue > span { background-color: hsl(204, 71%, 53%); color: #47ff47; }

        > span {
          display: block;
          background-color: hsl(0, 0%, 14%);
          padding: 0.15rem 0.3rem;
          border-radius: 3px;
          width: 2.25em;
          text-align: center;
        }
      }
    }

    &.hover {
      box-shadow: 0 3px 8px rgba(0,0,0,0.33);
      background-color: $grey;
      top: -2px;
      z-index: 1;
    }

    &.status-online {
      > td:last-child {
        color: $blue;
      }
    }
    &.status-in-game {
      > td:last-child {
        color: $turquoise;
      }
    }
    &.status-offline {
      > td:last-child {
        color: $red;
      }
    }
  }
}
</style>
