var removeClass = function(el, className){
    if (el.classList) el.classList.remove(className);
    else el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
}

var addClass = function(el, className){
    if (el.classList) el.classList.add(className);
    else el.className += ' ' + className;
}

module.exports.removeClass = removeClass;
module.exports.addClass = addClass;