/*
 * Welcome crazy boy
 * @file This is our cool script, be hungry to read it and to feel it.
 * @copyright AKALIA Slimane
*/

//Global variables
var bkg, dateField, countDownInterval;

//DOMContentLoaded listener
document.addEventListener('DOMContentLoaded',initPopup);

//Function to initialize the popup page
function initPopup()
{
  //Get the background page
  if (!bkg)
    bkg = chrome.extension.getBackgroundPage();
  //Load settings from the background page
  popSettings();
  //Initialize the listener to navigate between tabs
  initTabs();
  //Initialize the date text field
  initDateField();
  //Write data into prayer times table
  initPrayersTabs();
  //Initialize the footer
  initFooter()
}

//Function to load settings from the background page
function popSettings()
{
  //Initialize the place fields
  popPlace();
  //Initialize the general settings
  popGeneral();
  //Initialize the notification fields
  popNotifications();
  //Initialize the action select box 
  popActions();
}

//Function to initialize the place fields
function popPlace()
{
  //Local variables
  var i, tabTypes;
  //Add listeners on radio buttons of place type
  tabTypes = byName(PLACE_TYPE_CLASS);
  for (i = 0; i < tabTypes.length; ++i)
  {
    tabTypes[i].onchange = function(){
       if (!this.checked) return;

       setCordonatesTextField(bkg.getLatitude(), bkg.getLongitude() );
       switch (this.value)
       {
          case AUTOMATIC :
            $.ajax({ url: CNX_TST_URL, context: document.body,
              success: function() { bkg.getPositionOnLine(); },
              error : function() { showError(INTERNET_CONNECTION_ERROR); }
            });

            showField(CORDONATES_TEXT_FIELD_CLASS, NONE_DISPLAY_CSS);
          break;

          case MANUAL :
            showField(CORDONATES_TEXT_FIELD_CLASS, BLOCK_DISPLAY_CSS);
            bkg.modifyPlaceType(MANUAL);
          break;
       }
     };
    //Check the current place type mode (manual or automatic)
    tabTypes[i].checked = bkg.checkPlaceType(tabTypes[i].value);
    //If the current mode is manual then show the latitude and longitude text fields
    if (tabTypes[i].checked && tabTypes[i].value == AUTOMATIC)
      showField(CORDONATES_TEXT_FIELD_CLASS, NONE_DISPLAY_CSS);
  }
  //write data into the latitude and longitude text fields
  initCordonatesTextField();
}

//Function to write data into the location text fields
function initCordonatesTextField()
{
  //Local variables
  var latitudeField, longitudeField;
  //Get fields by IDs
  latitudeField  = byId(LATITUDE_FIELD_ID);
  longitudeField = byId(LONGITUDE_FIELD_ID);
  //Modify the content of text fields
  latitudeField.value  = bkg.getLatitude();
  longitudeField.value = bkg.getLongitude();
  //Add listeners
  latitude.oninput  = function(){ 
      if (this.value.toString().length)
      {
        bkg.setLatitude(this.value);
        initPrayersTabs();
      }
  };

  longitude.oninput = function()
  {
      if (this.value.toString().length)
      {
        bkg.setLongitude(this.value);
        initPrayersTabs();
      }
  };
}

//Initialize the general settings (daylight saving time, time format, calculation method)
function popGeneral()
{
  //Initialize the daylight saving time configuration
  dstCheckBox = byId(DST_CHECK_BOX_ID);
  dstCheckBox.checked = bkg.checkDST();
  //Add a listener on daylight saving time checkbox
  dstCheckBox.onchange = function()
  {
    bkg.modifyDST(this.checked);
    initPrayersTabs();
  }
  //Initialize the time format configuration
  timeFormatTab = byName(TIME_FORMAT_CLASS);
  //Add listener on every time format radio button
  for (i = 0; i < timeFormatTab.length; ++i)
  {
    timeFormatTab[i].onchange = function(){
      if (this.checked)
      {
        bkg.setTimeFormat(this.value);
        refreshPrayerTimes();
      }
    };
    //Check the appropriate radio button
    timeFormatTab[i].checked = bkg.checkTimeFormat(timeFormatTab[i].value);
  }
  //Initialize the calculation method configuration
  methodSelect = byId(METHOD_SELECT_ID);
  //Add listener on calculation method select box
  methodSelect.onchange = function(){
    options = this.getElementsByTagName(OPTION_TAG_NAME);    
    bkg.setCalculMethod(options[this.selectedIndex].value);
    initPrayersTabs();
  };
  //Check the appropriate choice
  selectOptionByValue(methodSelect, bkg.getMethod());
}

//Function to initialize the action select box
function popActions()
{
  //Get the action select box by Id
  actionSelect = byId(ACTIONS_SELECT_ID);
  //Add a change listener
  actionSelect.onchange = function(){
      bkg.setAction(this.value);
      
      display = (this.value == BLOCK_NAVIGATION_ACTION) ? BLOCK_DISPLAY_CSS : NONE_DISPLAY_CSS;
      showField(BLOCK_PERIOD_LABEL_ID, display);
      showField(BLOCK_PERIOD_ID, display);
  };
  //Select the appropriate option
  actions = bkg.getActions();
  selectOptionByValue(actionSelect, actions);
  //Hide the block internet fields
  if (actions != BLOCK_NAVIGATION_ACTION)
  {
    showField(BLOCK_PERIOD_LABEL_ID, NONE_DISPLAY_CSS);
    showField(BLOCK_PERIOD_ID, NONE_DISPLAY_CSS);
  }
  //Add listener on the select box of block internet period
  blockPeriod = byId(BLOCK_PERIOD_ID);
  blockPeriod.onchange = function(){
      bkg.setBlockPeriod(this.value);
  };
  selectOptionByValue(blockPeriod, bkg.getBlockPeriod());
}

//Function to select option into a select box
function selectOptionByValue(select, value)
{
  //Local variables
  var options, i;
  //Get the array of options 
  options = select.getElementsByTagName(OPTION_TAG_NAME);
  //Loop to select the appropriate value
  for(i = 0; i < options.length; ++i)
  {
      if (options[i].value == value)
      {
        options[i].selected = true;
        return;
      }
  }
}

//Function to refresh prayer times, we use this function after a change of configuration
function refreshPrayerTimes()
{
  //Local variables
  var dateField;
  //Get the date value
  dateField = byId(DATE_FIELD_ID);
  setPrayersTabsByDate(dateField.value);
}

//Function to show error
function showError(error){ alert(error); }

//Modify longitude and latitude text fields
function setCordonatesTextField(latitude, longitude)
{
  //Local variables
  var latitudeField, longitudeField;
  //Get elements by ID
  latitudeField  = byId(LATITUDE_FIELD_ID);
  longitudeField = byId(LONGITUDE_FIELD_ID);
  //Modify the value
  latitudeField.value = latitude;
  longitudeField.value = longitude;
}

//Fonction to show / hide a text field
function showField(id, display)
{
  //Local variables
  var field;
  //Get elements by ID
  field = byId(id);
  //Show / hide
  field.style.display = display;
}

//Function to initialize the notification fields
function popNotifications()
{
  //Local variables
  var notices, adhan;
  //Get elements by ID
  notices = byId(NOTICES_CHECK_ID);
  adhan = byId(ADHAN_CHECK_ID);
  //Add on change listeners
  notices.onchange = function(){ bkg.modifyNotices(this.checked); };
  adhan.onchange   = function(){ bkg.modifyAdhan(this.checked); };
  //Check the checkBoxes
  notices.checked = bkg.getActiveNotice();
  adhan.checked = bkg.getActiveAdhan();
}

//Function to initialize the listener to navigate between tabs
function initTabs()
{
  //Local variables
  var i, tablinks;
  //Get elements by class name
  tabLinks = byClass(LINKS_CLASS_NAME);
  //Loop to add onclick listeners 
  for (i = 0; i < tabLinks.length; i++)
    tabLinks[i].onclick = function(){ openTab(this); };
  //Add listeners to open a link by chrome
  //Get the list of links
  var tabALinks = byClass(ABOUT_CLASS_NAME);
  for (i = 0; i < tabALinks.length; i++)
    tabALinks[i].onclick = function(){ openLink(this.href); };
}

//Function to open a tab into the tabs menu
function openTab(linkButton)
{
  //Local variables
  var i, tabContent, tabLinks;
  //Get the content of every tab by class name
  tabContent = byClass(CONTENT_CLASS_NAME);
  //Hide every tab
  for (i = 0; i < tabContent.length; i++) {
      tabContent[i].style.display = NONE_DISPLAY_CSS;
  }
  //Get the links by class name
  tabLinks = byClass(LINKS_CLASS_NAME);
  //Remove the active class from every link
  for (i = 0; i < tabLinks.length; i++) {
      tabLinks[i].className = tabLinks[i].className.replace(ACTIVE_CLASS, "");
  }
  //Get the tab associated to the link button clicked
  tabId = linkButton.id.replace(LINK, TAB);
  //Show the selected tab
  byId(tabId).style.display = BLOCK_DISPLAY_CSS;
  //Set the link button active
  linkButton.className += ACTIVE_CLASS;
}

//Function to open a link
function openLink(link){ chrome.tabs.create({ url: link }); }

//Dom getters
function byId(id) { return document.getElementById(id); }
function byName(name) { return document.getElementsByName(name); }
function byClass(className) { return document.getElementsByClassName(className); }

//Initialize the date picker
function initDateField()
{
  //Get element by Id
  dateField = byId(DATE_FIELD_ID);
  //Write the date of today into the date picker
  dateField.valueAsDate = new Date();
  //Add onchange listener
  dateField.onchange = function (){
    setPrayersTabsByDate(this.value);
  };
}

//Function to write data into prayer times table
function initPrayersTabs()
{
  //Get the date of today
  now = new Date();
  //Get prayer times from the background page
  sendRequest(now, INIT_PRAY_REQUEST, true);
}

function setPrayersTabsByDate(dateNew)
{
  //Get the date object from the parameter
  dateObj = new Date(dateNew);
  //Send a request to the background page
  sendRequest(dateObj, PRAY_REQUEST, false);
}

//Function to send a request to the background page
function sendRequest(dateObj, type, init)
{
  chrome.runtime.sendMessage({ sender_msg : POPUP_SENDER, date : dateObj.toJSON(), type : type},
    function(response) {
      setPrayersTime(response.times);
      if (init == true)
        setPrayerCountDown(response.nextPrayer);
   });
}

//Modify the prayer time table
function setPrayersTime(times)
{
  var obj = bkg.timesToArrays(times);

  for (i = 0; i < obj.keys.length; ++i)
  {
    tmp = byId(obj.keys[i]);
    tmp.innerHTML = obj.prayerTimes[obj.keys[i]];
  }
}

//Function to set a countdown to the next prayer
function setPrayerCountDown(nextPrayer)
{
  //Get the date object associated to the next prayer
  var date_prayer = new Date(nextPrayer.date_prayer);
  bkg.dateFromHourMinuteString(date_prayer, nextPrayer.time);
  //Get the date in milliseconds
  var countDownDate = date_prayer.getTime();
  //Setup the countdown
  clearInterval(countDownInterval);
  countDownInterval = setInterval(function(){
      var now = new Date().getTime();
      var distance = countDownDate - now;
      var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      var seconds = Math.floor((distance % (1000 * 60)) / 1000);

      countdownElem = byId(COUNT_DOWN_ELEM_ID);
      countdownElem.innerHTML = nextPrayer.prayerName.capitalize()+" after "+ hours + "h " + minutes + "m " + seconds + "s ";
      if (distance <= 0)
      {
        clearInterval(countDownInterval);
        countdownElem.innerHTML="";
        initPopup();
      }
  }, 80);
  //Color the lign of next prayer 
  keysArray = bkg.getKeysArray();
  for (i = 0; i < keysArray.length; ++i)
  {
    tmp = byId(keysArray[i]+ROW_EXTENSION);
    if (keysArray[i] == nextPrayer.prayerName)
        tmp.style.backgroundColor = COLOR;
    else
        tmp.style.backgroundColor = null;
  }
}

//Function to initialize the footer
function initFooter() {
  //Get the footer element
  var footer = byId(FOOTER_ID);
  //Set the copyright label
  if (footer){
    //Get the current year
    var year = new Date().getFullYear();
    //Modify the label
    footer.innerHTML = "&copy; "+year+", AKALIA Slimane";
  }
}