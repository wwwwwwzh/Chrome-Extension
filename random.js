function onClick(fn) {
    console.log(0)
    fn('abc')
}

onClick((arg) => {
    console.log(arg)
})