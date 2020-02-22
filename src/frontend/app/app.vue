<template>
<div id='app'>
  <nav class='navbar' role='navigation' aria-label='main navigation'>
    <div class='navbar-brand'>
      <router-link class='navbar-item hover-underline-child' to='/' @click.native='updateShowMenu(false)'>
        <img src='assets/images/icon-48.png' alt='ttm'>
        <span class='title is-5' style='position: relative'>Temtem Market</span>
      </router-link>
      <a
        role='button'
        class='navbar-burger'
        :class='{ "is-active": showMenu }'
        aria-label='menu'
        aria-expanded='false'
        @click='updateShowMenu(!showMenu)'
      >
        <span aria-hidden='true'></span>
        <span aria-hidden='true'></span>
        <span aria-hidden='true'></span>
      </a>
    </div>
    <div class='navbar-menu' :class='{ "is-active": showMenu }'>
      <div class='navbar-start' style='flex-grow: 1'>
        <div v-if='showSearch' class='navbar-item' style='flex-grow: 1; justify-content: center'>
          <b-field style='width: 100%'>
            <b-input
              v-model='search'
              name='search'
              placeholder='search temtem'
              type='search'
              icon='magnify'
              style='border:none'
            />
          </b-field>
        </div>
      </div>

      <div class='navbar-end'>
        <a v-if='!loggedIn' class='navbar-item has-icon' :href='discordLoginURL'>
          <b-icon icon='discord' />
          <span>&nbsp;Login</span>
        </a>
        <template v-else>
          <b-dropdown id='settings-dropdown' ref='dropdown' class='is-hidden-touch' position='is-bottom-left' @active-change='dropdownChange($event)'>
            <a slot='trigger' class='navbar-item nav-avatar is-hidden-touch' title='Profile'>
              <figure v-if='avatar' class='avatar'><img :src='avatar'></figure>
              <div v-else class='avatar'>
                <span>{{ (name || '?')[0] }}</span>
              </div>
            </a>

            <b-dropdown-item class='profile-container' @click='gotoProfile()'>
              <figure v-if='avatar'><img :src='avatar'></figure>
              <div v-else>
                <span>{{ (name || '?')[0] }}</span>
              </div>
              <div>
                <span>{{ name }}</span>
                <span title='Tamer Name &amp; ID'>{{ tamerName }} - {{ tamerID }}</span>
              </div>
            </b-dropdown-item>
            <b-dropdown-item
              class='has-icon status-in-game'
              :class='{ active: status === "in_game" }'
              @click='setStatus("in_game")'
            >
              <b-icon icon='gamepad-variant' />&nbsp;In Game
            </b-dropdown-item>
            <b-dropdown-item
              class='has-icon status-online'
              :class='{ active: status === "online" }'
              @click='setStatus("online")'
            >
              <b-icon icon='web' />&nbsp;Online (Web)
            </b-dropdown-item>
            <b-dropdown-item
              class='has-icon  status-invisible'
              :class='{ active: status === "invisible" }'
              @click='setStatus("invisible")'
            >
              <b-icon icon='eye-off' />&nbsp;Invisible
            </b-dropdown-item>
            <b-dropdown-item class='has-icon' @click='logout()'><b-icon icon='logout-variant' />&nbsp;Logout</b-dropdown-item>
          </b-dropdown>

          <router-link class='navbar-item is-hidden-desktop profile-container' style='border-bottom: 2px solid rgba(0,0,0,0.1)' to='/me' @click.native='updateShowMenu(false)'>
            <figure v-if='avatar'><img :src='avatar'></figure>
            <div v-else>
              <span>{{ (name || '?')[0] }}</span>
            </div>
            <div>
              <span>{{ name }}</span>
              <span title='Tamer Name &amp; ID'>{{ tamerName }} - {{ tamerID }}</span>
            </div>
          </router-link>

          <a class='navbar-item flex-item is-hidden-desktop status-in-game' :class='{ active: status === "in_game" }' @click='setStatus("in_game")'>
            <b-icon icon='gamepad-variant' />
            <span style='font-weight:600'>&nbsp;In Game</span>
          </a>

          <a class='navbar-item flex-item is-hidden-desktop status-online' :class='{ active: status === "online" }' @click='setStatus("online")'>
            <b-icon icon='web' />
            <span style='font-weight:600'>&nbsp;Online (Web)</span>
          </a>

          <a class='navbar-item flex-item is-hidden-desktop status-invisible' :class='{ active: status === "invisible" }' @click='setStatus("invisible")'>
            <b-icon icon='eye-off' />
            <span style='font-weight:600'>&nbsp;Invisible</span>
          </a>

          <a class='navbar-item flex-item is-hidden-desktop' @click='logout()'>
            <b-icon icon='logout-variant' />
            <span style='font-weight:600'>&nbsp;Logout</span>
          </a>
        </template>
      </div>
    </div>
  </nav>

  <div id='body'>
    <router-view />
  </div>

  <div id='footer'>
    <div>
      <h3>Disclaimer</h3>
      <span>
        Crema, Temtem and the logo Temtem are registered trademarks. All rights are
        reserved worldwide. This site has no official link with Crema or Temtem. All
        artwork, screenshots, characters or other recognizable features of the
        intellectual property relating to these trademarks are likewise the intellectual
        property of Crema.
      </span>
    </div>
  </div>
</div>
</template>
<script src='./app.ts'></script>
<style lang='scss'>

#app {
  display: flex;
  flex-flow: column;
  min-height: 100vh;
  align-items: center;

  > nav {
    width: 100%;
    height: 3.25rem;
    border-bottom: 2px solid rgba(0,0,0,0.1);
    > * {
      height: 100%;
    }
  }

  div.navbar-menu {
    box-shadow: none;

    > div {
      background-color: inherit;
    }

    &.is-active > div.navbar-end {
      @media(max-width: 1087px) {
        border-bottom: 2px solid rgba(0,0,0,0.1)
      }
    }

    a, span {
      &.has-icon {
        display: flex;
        align-items: center;
      }
    }

    a {
      &.status-in-game {
        color:  hsl(171, 100%, 41%) ;
        &.active {
          background-color:  hsl(171, 100%, 41%) ;
          color: white;
        }
      }
      &.status-online {
        color:  hsl(217, 71%, 53%) ;
        &.active {
          background-color:  hsl(217, 71%, 53%) ;
          color: white;
        }
      }
      &.status-invisible {
        color:  hsl(348, 86%, 61%) ;
        &.active {
          background-color:  hsl(348, 86%, 61%) ;
          color: white;
        }
      }
    }
  }

  div.navbar-brand > a.navbar-item:first-child {
    display: flex;
    align-items: center;

    > img {
      height: 1.5em;
      width: 1.5em;
      margin-right: 0.5em;
    }
    > h4 {
      line-height: 1;
      width: auto;
      margin: 0;
    }
  }

  > a.nav-avatar {
    display: flex;
    align-items: center;
    padding-right: 1rem;
  }

  figure.avatar {
    height: 24px;
    width: 24px;
    display: flex;
    justify-content: center;
    align-content: center;
    border-radius: 50%;
    overflow: hidden;
    > img {
      align-self: center;
    }
  }

  div.avatar {
    border-radius: 50%;
    height: 24px;
    width: 24px;

    display: flex;
    align-items: center;
    justify-content: center;
    text-transform: uppercase;
    text-shadow: 1px 1px 1px rgba(0,0,0,0.1);
    line-height: 1;
    color: white;
    background-color: #75fdfd;
    font-size: 12px;
  }

  .profile-container {
    display: flex;
    align-items: center;
    padding-right: 1rem;

    > div:nth-child(2) {
      margin-left: 0.5rem;
      display: flex;
      flex-flow: column;
      > span:first-child {
        font-weight: 600
      }
      > span:last-child {
        font-size: 0.67em;
      }
    }

    > div:nth-child(3) {
      height: 100%;
      margin-left: 0.5rem;
      padding: 0 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .small-icon-text {
    line-height: 1;
    padding-top: 0.5em;
    padding-bottom: 0.5em;
  }

  .flex-item {
    display: flex;
    align-items: center;
  }

  #settings-dropdown {
    width: 100%;
    margin: 0;
    > div.dropdown-menu {
      right: 2px;
    }
    > div.dropdown-trigger {
      width: 100%;
    }
  }

  > div#body {
    position: relative;
    flex-grow: 1;
    align-self: stretch;
    overflow: auto;
    // margin: 16px;
    //margin-top: 8px;
    > * {
      position: absolute;
      top: 0;
      left: 0;
      min-width: 100%;
      min-height: 100%;
    }
  }

  > div#footer {
    display: none; // flex
    align-items: center;
    flex-direction: column;

    padding: 1em;
    font-size: 12px;
    width: 100%;
  }
}
</style>
