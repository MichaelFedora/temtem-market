<template>
<div id='tem-privacy' class='content'>
  <h1>Privacy Policy</h1>
  <p>
    There isn't much to write about here, because your data is not given,
    sold to or exchanged with any foreign service. But since you are already
    here, I'll give you the run down of what data is collected, what it
    is used for, and how to view and delete it.
  </p>
  <h3>Data Collection</h3>
  <p>
    There are three main sections of data that is collected: User data,
    session data, and listing data.
  </p>
  <h4>User data</h4>
  <p>
    This is the section you are probably looking for, as it is what data is
    collected about you, the user. For starters, authenticating with Discord
    gives me your Discord ID, Username (that was used at the time of
    authentication), and Avatar hash (which is used to access the avatar at
    the time of authentication). Any time you login the Username and Avatar hash
    are updated to whatever you are using at the time, but it is not updated
    inbetween authentication flows.
    <br><br>
    In addition, at the time of registering, you put in your Temtem Trainer ID
    and Temtem Trainer Name, which are (unfortunately) not verified in any way
    and can have anything placed in there. This can also be updated at any time
    from the <router-link to='/me'>user page</router-link>. This information is
    also not shown to anyone else right now, for better or worse.
    <br><br>
    Finally, the two most privacy-important pieces of information that are collected
    relate to your online status within the website. This is the "status" and the
    "heartbeat." The latter is the last time a session "checked in" to the API that
    it is still active and therefore the user will still be "online" instead of
    offline / idle. The status is more of a setting to what the user would like
    to show up as: if the user is invisible, the user will always appear offline to
    everyone else; if the user is in game or online, then the user will appear as
    their setting whenever their heartbeat says they are online.
  </p>
  <h4>Session Data</h4>
  <p>
    These are small packets that are created whenever you sign in to a location,
    and they include three pieces of data: your user ID, the session ID, and
    the creation date of the session. These are used for all the API requests,
    and expire after a set amount of time.
  </p>
  <h4>Listing Data</h4>
  <p>
    The core of the website, this is all of the data used for displaying the
    actual listings, whether those created for the sale of in game creatures
    or otherwise. This includes the id of the creature, your user id,
    the creature's, level, gender, whether or not it is a luma, its trait, SVs,
    TVs, and price.
  </p>
  <h3>Viewing your Data</h3>
  <p>
    When signed in, in the footer of the website, you can click on the
    "GPDR data" link and that will take you to an raw JSON view of all
    of your data that is stored (and deleted when asked).
  </p>
  <h3>Deleting your Data</h3>
  <p>
    When logged in with your account, go to your profile page by clicking the
    account card in the nav menu dropdown, click edit, click delete, and click
    confirm. This will remove your account, your listings, and your session ids.
    <br><br>
    Re-signing into the site with your Discord account will start the registration
    flow all over again because the data that was there is gone!
  </p>
  <h3>Accidental Data Persistence</h3>
  <p>
    Sometime in the future I may make backups of the database. If this is the case,
    your data may exist in backup form for some time before being deleted again. This
    policy will be updated when that happens.
  </p>
  <h3>Conclusion</h3>
  <p>
    Temtem.market isn't here to make money off of you or your data &mdash; it's
    a fan site dedicated to providing a service to the community, making it
    easier to trade Temtem to each other. As a privacy-concious developer, I
    try to make your data ownership as easy as possible. If you have any
    suggestions, let me know in the support discord linked in the footer.
  </p>
</div>
</template>
<script src='./privacy.vue'></script>
<style lang='scss'>
div#tem-privacy {
  padding: 2rem;
}
</style>
