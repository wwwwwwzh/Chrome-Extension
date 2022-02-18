
// // var str = "eh as AbstractUserDataWriter, Yc as Bytes, Nc as CACHE_SIZE_UNLIMITED, Ac as CollectionReference, Tc as DocumentReference, Du as DocumentSnapshot, Hc as FieldPath, Xc as FieldValue, xc as Firestore, K as FirestoreError, Zc as GeoPoint, Cc as LoadBundleTask, Ic as Query, Ou as QueryConstraint, Cu as QueryDocumentSnapshot, Nu as QuerySnapshot, Su as SnapshotMetadata, st as Timestamp, Th as Transaction, ih as WriteBatch, uc as _DatabaseId, Pt as _DocumentKey, lt as _FieldPath, mc as _cast, B as _debugAssert, dt as _isBase64Available, O as _logWarn, fc as _validateIsNotUsedTogether, mh as addDoc, bh as arrayRemove, Ph as arrayUnion, Uc as clearIndexedDbPersistence, Rc as collection, Pc as collectionGroup, Ec as connectFirestoreEmulator, _h as deleteDoc, Ah as deleteField, jc as disableNetwork, bc as doc, Jc as documentId, Mc as enableIndexedDbPersistence, Lc as enableMultiTabIndexedDbPersistence, Kc as enableNetwork, Ju as endAt, Hu as endBefore, Oc as ensureFirestoreConfigured, ph as executeWrite, oh as getDoc, ch as getDocFromCache, uh as getDocFromServer, hh as getDocs, lh as getDocsFromCache, fh as getDocsFromServer, $c as getFirestore, vh as increment, kc as initializeFirestore, Ku as limit, ju as limitToLast, Wc as loadBundle, Gc as namedQuery, gh as onSnapshot, yh as onSnapshotsInSync, Uu as orderBy, Fu as query, Vc as queryEqual, vc as refEqual, Ih as runTransaction, Rh as serverTimestamp, dh as setDoc, x as setLogLevel, ku as snapshotEqual, Gu as startAfter, Wu as startAt, Qc as terminate, wh as updateDoc, qc as waitForPendingWrites, Lu as where, Vh as writeBatch"

// // var bySemi = str.split(',')

// // var result = ''
// // bySemi.forEach(sentence => {
// //     var clauses = sentence.split(' as ')
// //     var temp = clauses[1] + ' = ' + clauses[0] + '\n'
// //     result += temp
// // })

// // console.log(result)


//^(http|https):\/\/(\w*[.])?\w*[.]\w*(\/.*)?$
//(http|https):\/\/(.*[.])+.*?\/courses/\d*/assignments\/\d*/outline/edit
//https:\/\/www.gradescope.com\/courses\/322028\/assignments\/[0-9]+?\/outline\/edit\/
// var urlToMatch = '/https:\/\/www.gradescope.com\/courses\/322028\/assignments\/[0-9]+?\/outline\/edit\//'
// const regex1 = new RegExp(urlToMatch.substr(1, urlToMatch.length - 2));
// let regex = new RegExp('https:\/\/www.gradescope.com\/courses\/322028\/assignments\/[0-9]+?\/outline\/edit\/')
// console.log(regex instanceof RegExp)
// console.log(regex.test('https://www.gradescope.com/courses/322028/assignments/1547768/outline/edit/'))

// var mystring = 'https://www.gradescope.com/courses/274825'
// mystring = mystring.replace(/(http|https):\/\//g, '*');
// console.log(mystring)


// function getMedian(array) {
//     array.sort();
//     const middleIndex = Math.floor(array.length / 2);
//     if (array.length % 2 === 0) {
//         return (array[middleIndex - 1] + array[middleIndex]) / 2;
//     } else {
//         return array[middleIndex];
//     }
// }

// console.log(getMedian([3,2,5,7,4,2,7,5]))

// var array = new Uint32Array(10);
// self.crypto.getRandomValues(array);

// for (var i = 0; i < array.length; i++) {
//     console.log(array[i]);
// }

// function uuidv4() {
//     return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
//         (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
//     );
// }

function newPose(ICC, rotation, angle, position) {
    const left = [[Math.cos(rotation), -Math.sin(rotation), 0], [Math.sin(rotation), Math.cos(rotation), 0], [0, 0, 1]]
    const right = [[position.x - ICC.x], [position.y - ICC.y], [angle]]
    return add(multiply(left, right), [[ICC.x], [ICC.y], [rotation]])
}

function add(a, b) {
    var aNumRows = a.length, aNumCols = a[0].length,
        bNumRows = b.length, bNumCols = b[0].length,
        m = new Array(aNumRows);  // initialize array of rows
    for (var r = 0; r < aNumRows; ++r) {
        m[r] = new Array(aNumRows); // initialize the current row
        for (var c = 0; c < aNumCols; ++c) {
            m[r][c] = a[r][c] + b[r][c];             // initialize the current cell
        }
    }
    return m;
}

function multiply(a, b) {
    var aNumRows = a.length, aNumCols = a[0].length,
        bNumRows = b.length, bNumCols = b[0].length,
        m = new Array(aNumRows);  // initialize array of rows
    for (var r = 0; r < aNumRows; ++r) {
        m[r] = new Array(bNumCols); // initialize the current row
        for (var c = 0; c < bNumCols; ++c) {
            m[r][c] = 0;             // initialize the current cell
            for (var i = 0; i < aNumCols; ++i) {
                m[r][c] += a[r][i].toFixed(2) * b[i][c].toFixed(2);
            }
        }
    }
    return m;
}

function angleToHeading(angle) {
    return [Math.cos(angle), Math.sin(angle)]
}

function goStraight(position, angle, length) {
    return [position.x + length * Math.cos(angle), position.y + length * Math.sin(angle)]
}

const ICC = { x: 0, y: 0.4 }
const rotation = Math.sqrt(2) / 8
const angle = 0
const position = { x: 0, y: 0 }
const pose = newPose(ICC, rotation, angle, position)
console.log(pose)
console.log(angleToHeading(pose[2][0]))
console.log(goStraight({ x: pose[0][0], y: pose[1][0] }, pose[2][0], -0.1))
