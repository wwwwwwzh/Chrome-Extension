# Tutorial Initialization Problem
One central problem is persistence of tutorial objects. Tutorials are represented as an array of tutorial object which contains an array of steps. They are managed by a TutorialModel singleton object which is the single source of truth in the MVC design. On a broader level, tutorials can appear in three places: cloud (firebase), chrome storage (background storage, persist across pages), and local cache (TutorialModel). 

It’s easy to start organizing the project by having a function that fetches from firebase every-time the user enters the page and initilize local tutorial array.

```javascript
function initTutorialsFromCloud() {
    TutorialModel.tutorials = await firebaseGetDocument()
}
```

The next step is to persist the tutorial when the tutorial involves multiple webpages. First, loadTutorialsFromCloud function will also store tutorials to chrome storage. 

```javascript
function initTutorialsFromCloud() {
    const tutorials = await firebaseGetDocument()
    TutorialModel.tutorials = tutorials
    chrome.storage.sync.set('TUTORIALS_KEY', tutorials)
}
```

Then tutorials need to be loaded at the right time. When the user enters another page, it can be that th user is following a tutorial or it's just another new page. Thus we need a user status singleton object and persist it in background. 
```javascript
class UserStatus {
    static status: NOT_FOLLOWING_TUTORIAL | AUTO_FOLLOWING | MANUAL_FOLLOWING
}
```
When a webpage is loaded, the first thing to do is to check status. If it's not following, a initTutorialFromCloud happens. If it's following, then a initTutorialFromStorage happens. 

However, if the user is refreshing the page when not following the tutorial, it's costly to load from cloud. Instead, a check function that checks if website has changed or certain wait timer has expired is used.

```javascript
function checkIfReloadFromCloudIsNeeded() {
    return isWebsiteChanged || isTimerExpired
}
```

This function is also useful when the user has just finished one tutorial. If the tutorial involves only one page, upon completion, the local cache is still correct. If page has changed, loadFromCloud is needed. 

All these functions can be organized into a smartInit function to provide a cleaner API

```javascript
function smartInit {
    if checkIfReloadFromCloudIsNeeded() {
        initTutorialsFromCloud()
    } else {
        initTutorialsFromStorage()
    }
}
```

# Event Listener Management
Another problem involves listening to events both during following and recording. In normal web development, event listeners are bound to specific UI element (buttons, link, etc.). However, the extension needs to listen to every click and input event. When following tutorial, the extension checks if the right element is clicked. When recording, it has to both record the element being clicked on and "hijack" the event from propagating. This is mainly because the default event on an element might be a page redirect. If default behavior is allowed, the recorder can't preview this particular step while editing. 

This can be divided into 2 subproblems:
1. when and what listener should be added
2. when is hijacking needed

There are 4 states a user can be in:
```js
STATUS: {
    DOING_NOTHING,
    IS_RECORDING,
    IS_MANUALLY_FOLLOWING_TUTORIAL,
    IS_AUTO_FOLLOWING_TUTORIAL,
},
```
IS_RECORDING and IS_MANUALLY_FOLLOWING_TUTORIAL means a global event listener is needed. IS_RECORDING also needs hijacking. DOING_NOTHING means listener should be removed.

This can be implemented by simply adding and removing listeners when state changes. However, state change occurs in many classes and occurs often. Thus, listener handling should be added the UserState class. Whenever the state changes, an onChange function is called and checks what listener should be added or removed. 

A minor problem is the UserState class doesn't and shouldn't know how to implement the listener. It only manages adding and removing. Delegation is used to solve this. Classes controlling following and recording tutorial will make themselves as delegate of UserState. Since a user can't record and follow tutorial at the same time, there won't be delegation conflict. The delegate should implement two methods: shouldHijackDefault and handleEvent. 

```js
class UserState {
    static delegate
    static userStateCache = TUTORIAL_STATUS.BEFORE_INIT;
    static isRecorderHighlighting = false

    static setUserStateCache(userState) {
        //set cache and store in chrome storage
        UserState.#onChange();
    }

    static setUserStateCache(userState) {
        //set cache and store in chrome storage
        UserState.#onChange();
    }

    //other state setting functions


    static #onChange() {
        //call addGlobalEventListeners or removeGlobalEventListeners depending on state
    }

    static #addGlobalEventListeners() {
        document.addEventListener("click", UserState.#clickListener, true);
    }

    static #removeGlobalEventListeners() {
        document.removeEventListener("click", UserState.#clickListener, true);
    }


    static #clickListener(event) {
        UserState.#preventDefaultHelper(event);
        UserState.#processEventHelper(event);
        UserState.#logHelper(event)
    }

    static #logHelper(event) {}

    static #processEventHelper(event) {
        // do some initial event proccessing
        UserState.UserStateDelegate.handleEvent(event)
    }

    static #preventDefaultHelper(event) {
        if (UserState.UserStateDelegate.shouldHijackDefault(event)) {
            // prevent default behavior
        }
    }
}
```

This also makes other state related event handling easy and makes logger easy to implement. 