/**
 * @file This is our cool script.
 * @copyright AKALIA Slimane
*/

//Global variables
var keysConfig    = null;
var defaultValues = null;
var valuesConfig  = null;
var blockFunction = null;
var uniqueTag = 0;

//Call the initBackground function
initBackground();

//Function for initialize the background side
function initBackground()
{
  //Initialize global arrays for parameters
  keysConfig    = [TIMEZONE_KEY, DST_KEY, FORMAT_KEY, METHOD_KEY, NOTICE_ACTIVE_KEY,
                   AUDIO_ACTIVE_KEY, ACTIONS_KEY, BLOCK_PERIOD_KEY];
  defaultValues = [TIMEZONE_DEFAULT, DST_DEFAULT, FORMAT_DEFAULT, METHOD_DEFAULT, NOTICE_ACTIVE_DEFAULT,
                   AUDIO_ACTIVE_DEFAULT, ACTIONS_DEFAULT, BLOCK_PERIOD_DEFAULT];
  valuesConfig  = {};
  //Global variable for manage actions after adhan
  blockFunction = function(details) { return {redirectUrl: chrome.extension.getURL(REDIRECT_PAGE) }; };
  //Call a function for loading the configuration from local storage
  loadConfig();
  //Initialize the static configuration (adhan audio link)
  valuesConfig.AUDIO_KEY     = AUDIO_DEFAULT;
  valuesConfig.AUDIO_KEY.src = AUDIO_SRC;
  //Set the calculation method of prayer times  
  prayTimes.setMethod(valuesConfig.METHOD_KEY);
  //Initialize the listener of communication between the background and the popup
  chrome.runtime.onMessage.addListener( function(request, sender, sendResponse){
      replyRequest(request, sendResponse);
  });
  //Set the current alarm
  removeSetAlarm();
  //Add a listener on prayer alarm
  chrome.alarms.onAlarm.addListener(function callb(alarm){
    manageAlarms(alarm);
  });
}

//Set alarm function
function setAlarm()
{
  //Local variables
  var times, nextPrayer, date_prayer;
  //Get prayer times by latitude and longitude
  times = prayTimes.getTimes (new Date(), [valuesConfig.LATITUDE_KEY, valuesConfig.LONGITUDE_KEY],
                                           valuesConfig.TIMEZONE_KEY, valuesConfig.DST_KEY, valuesConfig.FORMAT_KEY);
  //Get the next prayer
  nextPrayer = getNextPrayer(times);
  //Title of logo
  chrome.browserAction.setTitle({title : "Next prayer is "+nextPrayer.prayerName.capitalize()});
  date_prayer = new Date(nextPrayer.date_prayer);
  date_prayer = dateFromHourMinuteString(date_prayer, nextPrayer.time);
  //Set an alarm for the next prayer
  setupAlarm(date_prayer, nextPrayer.prayerName.capitalize());
}

//Load configuration function
function loadConfig()
{
  //Local variables
  var val;
  //Get the configuration from localstorage
  val = getFromStorage(VALUES_CONFIG_KEY);
  //If the configuration exist then load the configuration
  if (val)
  {
    valuesConfig = val;
    /* If the place setup is automatic then verify the internet connection
       and modify the latitude and the longitude parameters */
    if (valuesConfig.PLACE_TYPE_KEY == AUTOMATIC)
    {
      $.ajax({ url: CNX_TST_URL, context: document.body,
        success: function() { getPositionOnLine(); }
      });
    }
  }
  /* If the configuration doesn't exist (first use for example) then we should write 
     the default configuration in localstorage */
  else
    initFirstTime();
}

//Initialize the default configuration for the first time
function initFirstTime()
{
  //Local variables
  var key, i;
  //Loop to initialize the configuration
  for (i = 0; i < keysConfig.length; ++i)
  {
    key = keysConfig[i];
    valuesConfig[key] = defaultValues[i];
  }
  //Use the default latitude and longitude
  updatePositionValues(PLACE_TYPE_DEFAULT, LATITUDE_DEFAULT, LONGITUDE_DEFAULT);
  //Try to fetch the current position by internet
  $.ajax({ url: CNX_TST_URL, context: document.body,
    success: function() { getPositionOnLine(); }
  });
}

//Function to update the position online
function updatePositionOnline(position) { updatePositionValues(AUTOMATIC, position.coords.latitude, position.coords.longitude); }

//Function to update the position global
function updatePositionValues(placeType, latitude, longitude)
{
  //Update the configuration array
  valuesConfig.PLACE_TYPE_KEY  = placeType;
  valuesConfig.LATITUDE_KEY    = latitude;
  valuesConfig.LONGITUDE_KEY   = longitude;
  //Update the local storage
  updateStorage(VALUES_CONFIG_KEY, valuesConfig);
}

//Global function to update a specific configuration
function updateConfig(key, value, critical)
{
  //Set new alarm if we have a critical parameter
  if (critical)
    removeSetAlarm();
  //Update the configuration array
  valuesConfig[key] = value;
  //Update the local storage
  updateStorage(VALUES_CONFIG_KEY, valuesConfig);
}

//Function to update the local storage
function updateStorage(key, value)
{
  //Get the string value from a JSON object
  var stringValue = JSON.stringify(value);
  //Store into the localstorage
  localStorage.setItem(key, stringValue);
}

//Get from localstorage function
function getFromStorage(key)
{
  //Get the string from the storage
  value = localStorage.getItem(key);
  //Parse the string value to a JSON object
  jsonValue = JSON.parse(value);
  //Return the result
  return jsonValue;
}

//Functions to update a specific configuration
function modifyNotices(checked) { updateConfig(NOTICE_ACTIVE_KEY, checked); }
function modifyDST(checked){ updateConfig(DST_KEY, checked, true); }
function modifyPlaceType(placeType){ updateConfig(PLACE_TYPE_KEY, placeType); }
function setTimeFormat(format){ updateConfig(FORMAT_KEY, format); }
function setCalculMethod(method)
{ 
  updateConfig(METHOD_KEY, method, true);
  prayTimes.setMethod(method);
}

function setBlockPeriod(period){ updateConfig(BLOCK_PERIOD_KEY, period); }
function setAction(action){ updateConfig(ACTIONS_KEY, action); }
function setLatitude(latitude){ updateConfig(LATITUDE_KEY, latitude, true); }
function setLongitude(longitude){ updateConfig(LONGITUDE_KEY, longitude, true); }
function modifyAdhan(checked)
{
  updateConfig(AUDIO_ACTIVE_KEY, checked);
  if (checked == false)
    valuesConfig.AUDIO_KEY.pause();
}

//Getters
function getActiveNotice(){ return valuesConfig.NOTICE_ACTIVE_KEY; }
function getActiveAdhan(){ return valuesConfig.AUDIO_ACTIVE_KEY; }
function getMethod(){ return valuesConfig.METHOD_KEY; }

function getPositionOnLine()
{
  if (navigator.geolocation)
    navigator.geolocation.getCurrentPosition(updatePositionOnline, null);
}

function getKeysArray()
{
  var keysArray = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"];
  return keysArray
}

function getPrayTimes(date)
{
  times = prayTimes.getTimes (date, [valuesConfig.LATITUDE_KEY, valuesConfig.LONGITUDE_KEY],
                              valuesConfig.TIMEZONE_KEY, valuesConfig.DST_KEY, valuesConfig.FORMAT_KEY);
  return times;
}

//Get the next prayer
function getNextPrayer(prayertimes)
{
  //Local variables
  var obj = timesToArrays(prayertimes);
  var date = new Date();
  var i = 0;

  //Find the next prayer
  while(i < obj.keys.length)
  {
    //Get the prayer time by index i
    tmp_time  = obj.prayerTimes[ obj.keys[i] ];
    //Get the current time
    tmp = new Date();
    tmp = dateFromHourMinuteString(tmp, tmp_time);
    //Compare the current time with the prayer time by index i
    if (date.getTime() <= tmp.getTime())
        break;
    //If we didn't found the appropriate prayer then pass to the next prayer
    i++;
  }

  //Fajr case
  if (i != obj.keys.length)
    nextPrayer = {prayerName : obj.keys[i], time : obj.prayerTimes[ obj.keys[i] ], date_prayer : date.toJSON()};
  else
  {
    date.setDate(date.getDate()+1);
    tomorrowPTimes = getPrayTimes(date);
    nextPrayer = {prayerName : obj.keys[0], time : tomorrowPTimes.fajr, date_prayer : date.toJSON()};
  }
  //Return the next prayer
  return nextPrayer;
}

//Getters
function getLatitude(){ return valuesConfig.LATITUDE_KEY; }
function getLongitude(){ return valuesConfig.LONGITUDE_KEY; }
function getActions(){ return valuesConfig.ACTIONS_KEY; }
function getBlockPeriod(){ return valuesConfig.BLOCK_PERIOD_KEY; }
function checkPlaceType(value){ return (value == valuesConfig.PLACE_TYPE_KEY); }
function checkTimeFormat(value){ return (value == valuesConfig.FORMAT_KEY); }
function checkDST(){ return (valuesConfig.DST_KEY == 1); }

//Notification function
function Notifier(prayerName)
{
  //If the text notification is active then push a new notification
  if (valuesConfig.NOTICE_ACTIVE_KEY == true)
    textNotification(prayerName);
  //If the audio notification is active and we are not in sunrise then play the adhan
  if ( (valuesConfig.AUDIO_ACTIVE_KEY == true) && (prayerName != "sunrise") )
    audioNotification();
  //Manage actions in prayer time
  if (valuesConfig.ACTIONS_KEY != NOTHING_ACTION)
    manageActions();
}

//Function to manage actions in prayer time
function manageActions()
{
  //Switch the configuration item
  switch(valuesConfig.ACTIONS_KEY)
  {
    //Block internet case
    case BLOCK_NAVIGATION_ACTION :
      if (!chrome.webRequest.onBeforeRequest.hasListener(blockFunction))
        chrome.webRequest.onBeforeRequest.addListener(blockFunction, {urls: WEB_URLS}, ["blocking"]);

      x = setInterval(function(){
          clearInterval(x);
          chrome.webRequest.onBeforeRequest.removeListener(blockFunction);
        }, valuesConfig.BLOCK_PERIOD_KEY*60*1000);
    break;
    //Close browser case
    case CLOSE_BROWSER_ACTION :
      closeBrowser();
    break;
  }
}

//Manage the moment of alarm
function manageAlarms(alarm)
{
  //Call the notifier function
  Notifier(alarm.name);
  //Set the next alarm for the next prayer
  chrome.alarms.clearAll(
    function(wasCleared){
      setTimeout(function(){ setAlarm(); }, 2000);
    });
}

//Push text notification function
function textNotification(prayerName)
{
  //Local variables
  var notification;
  //Verify the notification permission
  if (Notification.permission != GRANTED)
    Notification.requestPermission();
  else
  {
    //Push the notification
    notification = new Notification(NOTICE_TITLE, {
      icon: NOTICE_ICON,
      body: notificationBody(prayerName),
      tag : uniqueTag+""
    });
    //Modify the uniqueTag variable
    uniqueTag++;
  }
}

//Function to construct the text notification body
function notificationBody(prayerName){ return "It's "+prayerName+" time"; }

//Function to play the adhan
function audioNotification(){ valuesConfig.AUDIO_KEY.play(); }

//Setup alarm by prayer time and name
function setupAlarm(timePrayer, alarmName) { chrome.alarms.create(alarmName, {when: Date.parse(timePrayer)} ); }

//Function to clear previous alarms
function removeSetAlarm(){
  chrome.alarms.clearAll(
    function(wasCleared){
      setAlarm();
    });
}

//Function to reply the other pages requests
function replyRequest(request, sendResponse)
{
  switch (request.sender_msg)
  {
      case POPUP_SENDER :
          replyPopupRequest(request, sendResponse);
      break;
  }
}

//Function to reply popup.js requests
function replyPopupRequest(request, sendResponse)
{
  date = new Date(request.date);
  prayertimes = getPrayTimes(date);
  switch (request.type)
  {
    case INIT_PRAY_REQUEST :
      sendResponse({times : prayertimes, nextPrayer : getNextPrayer(prayertimes)});
    break;

    case PRAY_REQUEST :
      sendResponse({times : prayertimes});
    break;
  }
}

//Get date object from a string prayer time
function dateFromHourMinuteString(date, str){
    var arr = str.split(':');
    if(arr == null){
      alert(DATE_FORMAT_ERROR);
      return null;
    }
    
    var hours = arr[0];
    var minutes = arr[1];
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(0);
    return date;
}

//Function to get prayer names
function timesToArrays(times)
{
  var prayerTimesArray = { "fajr" : times.fajr, "sunrise" : times.sunrise, "dhuhr" : times.dhuhr, "asr" : times.asr,
                            "maghrib" : times.maghrib, "isha" : times.isha };

  return {prayerTimes : prayerTimesArray, keys :getKeysArray()};
}

//Function to close browser
function closeBrowser()
{
  chrome.windows.getCurrent({}, function(window) {
    chrome.windows.remove(window.id);
  });
}