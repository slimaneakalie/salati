const POPUP_SENDER          = 0;
const INIT_PRAY_REQUEST     = POPUP_SENDER + 1;
const PRAY_REQUEST          = INIT_PRAY_REQUEST + 1;

const AUTOMATIC    = "automatic";
const MANUAL       = "manual";
const NOTHING_ACTION          = "nothingAction";
const BLOCK_NAVIGATION_ACTION = "blockNavigationAction";
const CLOSE_BROWSER_ACTION    = "closeBrowserAction";

const FORMAT_24H   = "24h";
const FORMAT_12H   = "12h";

const PLACE_TYPE_KEY        = "PLACE_TYPE_KEY";//automatique or manual
const LATITUDE_KEY          = "LATITUDE_KEY";
const LONGITUDE_KEY         = "LONGITUDE_KEY";
const TIMEZONE_KEY          = "TIMEZONE_KEY";
const DST_KEY               = "DST_KEY";
const FORMAT_KEY            = "FORMAT_KEY";
const METHOD_KEY            = "METHOD_KEY";
const NOTICE_ACTIVE_KEY     = "NOTICE_ACTIVE_KEY";
const AUDIO_ACTIVE_KEY      = "AUDIO_ACTIVE_KEY";
const AUDIO_KEY             = "AUDIO_KEY";
const ACTIONS_KEY           = "ACTIONS_KEY";
const BLOCK_PERIOD_KEY      = "BLOCK_PERIOD_KEY";
const VALUES_CONFIG_KEY     = "VALUES_CONFIG_KEY";

const PLACE_TYPE_DEFAULT    = MANUAL;
const LATITUDE_DEFAULT      = 33.700411;
const LONGITUDE_DEFAULT     = -7.357492;
const TODAY                 = new Date();
const TIMEZONE_DEFAULT      = TODAY.getTimezoneOffset();
const DST_DEFAULT           = 0;
const FORMAT_DEFAULT        = FORMAT_24H;
const METHOD_DEFAULT        = 'MWL';
const NOTICE_TITLE          = 'Salati';
const NOTICE_ACTIVE_DEFAULT = true;
const AUDIO_ACTIVE_DEFAULT  = true;
const AUDIO_DEFAULT         = new Audio();
const ACTIONS_DEFAULT 		= NOTHING_ACTION;
const BLOCK_PERIOD_DEFAULT  = 5;

const GRANTED               = "granted";
const NOTICE_ICON           = "../res/noticeIcon.png";
const AUDIO_SRC             = "../res/adhan.mp3";

const DATE_FORMAT_ERROR     = "Date format error";

const WEB_URLS              = ["http://*/*", "https://*/*"];
const REDIRECT_PAGE			= "../pages/redirectPage.html";

const COUNT_DOWN_ELEM_ID = "countdown";
const ROW_EXTENSION      = "Row";
const COLOR              = "rgba(0, 0, 0, 0.1)";

const DATE_FIELD_ID      = "datePrayer";
const NOTICES_CHECK_ID   = "notices";
const ADHAN_CHECK_ID     = "adhan";
const DST_CHECK_BOX_ID   = "dst";
const LATITUDE_FIELD_ID  = "latitude";
const LONGITUDE_FIELD_ID = "longitude";
const METHOD_SELECT_ID   = "calculMethod";
const ACTIONS_SELECT_ID  = "afterAdhanActions";
const BLOCK_PERIOD_ID    = "blockNavigationPeriod";
const BLOCK_PERIOD_LABEL_ID = "blockPeriodLabel";
const FOOTER_ID          = 'footer';
const OPTION_TAG_NAME    = "option";
const CNX_TST_URL = "http://www.google.com";

const PLACE_TYPE_CLASS   = "placeOption";
const TIME_FORMAT_CLASS  = "timeFormat";
const CONTENT_CLASS_NAME = "tabcontent";
const ABOUT_CLASS_NAME   =  "externalLink";
const LINKS_CLASS_NAME   = "tablinks";
const NONE_DISPLAY_CSS   = "none";
const BLOCK_DISPLAY_CSS  = "block";
const ACTIVE_CLASS       = " active";
const LINK               = "Link";
const TAB                = "Tab";

const CORDONATES_TEXT_FIELD_CLASS = "cordonates";

const INTERNET_CONNECTION_ERROR = "You don't have an internet connection";

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}