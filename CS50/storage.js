var count = 0

function getCount() {
    const temp = localStorage.getItem('counter')
    if (temp) {
        count = temp
    } else {
        localStorage.setItem('counter', 0)
    }
}
var isCounting = true
var counter
function startCounter() {
    counter = setInterval(() => {
        count++
        document.querySelector('#counter').innerHTML = count
        localStorage.setItem('counter', count)
    }, 1000);
}

function toogleCounter() {
    isCounting = !isCounting
    if (isCounting) {
        startCounter()
    } else {
        clearInterval(counter)
    }
}

document.addEventListener('DOMContentLoaded', () => {
    getCount()
    startCounter()
    document.querySelector('#counter-switch').onclick = () => {
        toogleCounter();
        document.querySelector('#counter-switch').innerHTML = isCounting ? 'Stop' : 'Resume'
    }
})