<template>
<table id='tem-tem-table'>
  <thead>
    <th></th> <!-- tem avatar -->
    <th></th> <!-- tem name -->
    <th></th> <!-- types -->
    <th></th> <!-- traits -->
    <th></th> <!-- score -->
    <th class='is-hidden-touch'></th> <!-- sv -->
    <th class='is-hidden-touch'></th> <!-- sv -->
    <th class='is-hidden-touch'></th> <!-- sv -->
    <th class='is-hidden-touch'></th> <!-- sv -->
    <th class='is-hidden-touch'></th> <!-- sv -->
    <th class='is-hidden-touch'></th> <!-- sv -->
    <th class='is-hidden-touch'></th> <!-- sv -->
  </thead>
  <tbody>
    <tr
      v-for='tem of tems'
      :key='"tem-" + tem.id'
      :class='{
        "hover": hover === tem.id,
      }'
      @click='$emit("click", tem)'
      @mouseenter='hover = tem.id'
      @mouseleave='hover = hover === tem.id ? "" : hover'
    >
      <td>
        <figure class='avatar'>
          <img :src='getTemIcon(tem.id)'>
        </figure>
      </td> <!-- tem avatar -->
      <td> {{ tem.name }} </td> <!-- tem name -->
      <td>
        <div style='display:flex'>
          <figure v-for='type of tem.type' :key='"tem-" + tem.id + "-" + type'>
            <img :alt='type' :title='type' :src='"/assets/types/" + type.toLowerCase() + ".png"'>
          </figure>
        </div>
      </td>
      <td>
        <div style='display:flex'>
          <div
            v-for='(trait, i) of tem.traits'
            :key='"tem-" + tem.id + "-trait-" + i'
            style='display: flex; white-space: nowrap'
            :style='{ "margin-left": i > 0 ? "0.5em" : "" }'
          >
            <b-icon icon='star-face' />&nbsp;{{ trait }}
          </div>
        </div>
      </td>
      <td>
        <div style='display: flex;'>
          <b-icon icon='star-circle-outline' />&nbsp;{{ tem.score }}
        </div>
      </td>
      <td
        v-for='stat of ["hp", "sta", "spd", "atk", "def", "spatk", "spdef"]'
        :key='"tem-" + tem.id + "-" + stat'
        :class='{
          "stat-red": tem.stats[stat] < 33,
          "stat-orange": tem.stats[stat] >= 33 && tem.stats[stat] < 66,
          "stat-green": tem.stats[stat] >= 66 && tem.stats[stat] < 100,
          "stat-blue": tem.stats[stat] >= 100
        }'
        class='is-hidden-touch stat'
        :title='stat'
      >
        <span>{{ tem.stats[stat] }}</span>
      </td>
    </tr>
  </tbody>
</table>
</template>
<script src='./tem-table.ts'></script>
<style lang='scss'>
@import '~colors.scss';

table#tem-tem-table {

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
  }
}
</style>
