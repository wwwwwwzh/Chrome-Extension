// function uuidv4fourDigit() {
//     return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
//         (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
//     );
// }

// console.log(uuidv4fourDigit())
// function c(anything) {
//     console.log(anything)
// }
// var myAtoi = function (s) {
//     var isPositive = true;
//     var result = 0;
//     var hasStarted = false;
//     for (var i = 0; i < s.length; i++) {
//         const char = s[i];
//         if (char === ' ') {
//             if (hasStarted) i = s.length;
//         } else if (char === '-') {
//             if (hasStarted) {
//                 i = s.length;
//             } else {
//                 hasStarted = true;
//             }
//             isPositive = false;
//         } else if (char <= 9 && char >= 0) {
//             hasStarted = true
//             result *= 10;
//             result += char.charCodeAt(0) - 48;
//         } else {
//             if (hasStarted) {
//                 i = s.length;
//             } else {
//                 return 0;
//             }
//         }

//     }
//     result = isPositive ? result : -result;
//     if (result < -2147483648) result = -2147483648;
//     if (result > 2147483647) result = 2147483647;
//     return result
// };

// console.log(myAtoi('+1'))

function regexFromUrl(url) {
    let subs = url.split('/')
    console.log(subs)
    var regex = subs[0]
    for (let index = 1; index < subs.length; index++) {
        let sub = subs[index];
        if (/^[a-z]+$/i.test(sub)) {
            regex += '/A';
        } else if (/^[0-9]+$/i.test(sub)) {
            regex += '/0';
        } else {
            regex += '/X';
        }
    }

    return '$' + regex + '$'
}


console.log(regexFromUrl('console.firebase.google.com/u/2/project/test-e7bb0/firestore/data/~2FSimple%20Tutorials~2FNqfh2JF8i1ndQiAIaUAC'))