module.exports = function(err){
    var stack = require('stack-trace').parse(err)

    var str = `${err} \n `
    stack.forEach(function(stack){
        str += '\n' +stack.fileName + ' on line ' + stack.lineNumber + ' column ' + stack.columnNumber + '\n'
    })

    return str
}