// var str = "eh as AbstractUserDataWriter, Yc as Bytes, Nc as CACHE_SIZE_UNLIMITED, Ac as CollectionReference, Tc as DocumentReference, Du as DocumentSnapshot, Hc as FieldPath, Xc as FieldValue, xc as Firestore, K as FirestoreError, Zc as GeoPoint, Cc as LoadBundleTask, Ic as Query, Ou as QueryConstraint, Cu as QueryDocumentSnapshot, Nu as QuerySnapshot, Su as SnapshotMetadata, st as Timestamp, Th as Transaction, ih as WriteBatch, uc as _DatabaseId, Pt as _DocumentKey, lt as _FieldPath, mc as _cast, B as _debugAssert, dt as _isBase64Available, O as _logWarn, fc as _validateIsNotUsedTogether, mh as addDoc, bh as arrayRemove, Ph as arrayUnion, Uc as clearIndexedDbPersistence, Rc as collection, Pc as collectionGroup, Ec as connectFirestoreEmulator, _h as deleteDoc, Ah as deleteField, jc as disableNetwork, bc as doc, Jc as documentId, Mc as enableIndexedDbPersistence, Lc as enableMultiTabIndexedDbPersistence, Kc as enableNetwork, Ju as endAt, Hu as endBefore, Oc as ensureFirestoreConfigured, ph as executeWrite, oh as getDoc, ch as getDocFromCache, uh as getDocFromServer, hh as getDocs, lh as getDocsFromCache, fh as getDocsFromServer, $c as getFirestore, vh as increment, kc as initializeFirestore, Ku as limit, ju as limitToLast, Wc as loadBundle, Gc as namedQuery, gh as onSnapshot, yh as onSnapshotsInSync, Uu as orderBy, Fu as query, Vc as queryEqual, vc as refEqual, Ih as runTransaction, Rh as serverTimestamp, dh as setDoc, x as setLogLevel, ku as snapshotEqual, Gu as startAfter, Wu as startAt, Qc as terminate, wh as updateDoc, qc as waitForPendingWrites, Lu as where, Vh as writeBatch"

// var bySemi = str.split(',')

// var result = ''
// bySemi.forEach(sentence => {
//     var clauses = sentence.split(' as ')
//     var temp = clauses[1] + ' = ' + clauses[0] + '\n'
//     result += temp
// })

// console.log(result)


//^(http|https):\/\/(\w*[.])?\w*[.]\w*(\/.*)?$
//(http|https):\/\/(.*[.])+.*?\/courses/\d*/assignments\/\d*/outline/edit
//https:\/\/www.gradescope.com\/courses\/322028\/assignments\/[0-9]+?\/outline\/edit\/
var urlToMatch = '/https:\/\/www.gradescope.com\/courses\/322028\/assignments\/[0-9]+?\/outline\/edit\//'
const regex1 = new RegExp(urlToMatch.substr(1, urlToMatch.length - 2));
let regex = new RegExp('https:\/\/www.gradescope.com\/courses\/322028\/assignments\/[0-9]+?\/outline\/edit\/')
console.log(regex instanceof RegExp)
console.log(regex.test('https://www.gradescope.com/courses/322028/assignments/1547768/outline/edit/'))
