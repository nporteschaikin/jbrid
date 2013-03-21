## What is this?
 
jbrid is a fully-customizable hybrid HTML5 and Flash video player.  By default, jbrid determines whether the web browser is HTML5- or Flash-compatible and builds the applicable player.  
 
## How it works
 
Rather than using a <video> or <object> tag directly, jbrid takes simple elements and equips them as aspects of a video player.  Only an "src" attribute and a "stage" element is required to create the video player; however, there are several controls and meters that can be added simply by creating elements with an associated selector.  

## Using jbrid

jbrid's appearance and functionality is entirely built on simple HTML and CSS.  To built a player with solely a stage, write the following HTML:

```html
 <div class="myvideoelement" data-src="video.mp4">
  <div class="stage"></div>
 </div>
```

You will want to add CSS attributes to at least give the player some width and height:

```css
 .myvideoelement { width: 600px; height: 400px; }
 .myvideoelement .stage { width: 100%; height: 100%; } 
```

Finally, build jbrid:

```javascript
$(document).ready(
 function () {
  $('.myvideoelement').jbrid(); 
 } 
)
```

By default, jbrid will determine whether to render an HTML5 <video> or Flash object; if both are compatible, the player will use HTML5.

### Elements

jbrid allows you to add several elements to enhance the functionality of your player.

(The following elements are labeled with their default CSS class selectors (i.e. _".stage"_)
* __stage:__ _(required)_ The element where the <video> or <object> will be placed.  The player is placed with reset CSS and are set to width: 100%, height: 100%, and background: transparent, so as to inherit the stage's attributes.
* __play:__ An element that, when clicked, will play the video.
* __pause:__ An element that, when clicked, will pause the video.
* __playpause:__ An element that, when clicked, will toggle between play and pause.
* __buffer:__ An element that grows in percentage (up to 100%) based on the percentage of the video that has been buffered.
* __progress:__ An element that grows in percentage (up to 100%) based on the percentage of the video which has been played.
* __seeker:__ An element that can be dragged to navigate to a certain point in the video.
* __volume:__ An element that grows in percentage (up to 100%) based on the volume level.
* __volumectrl:__ An element that can be dragged to control the volume.
* __time:__ An element containing the time elapsed in the video.
* __duration:__ An element containing the duration of the video.
