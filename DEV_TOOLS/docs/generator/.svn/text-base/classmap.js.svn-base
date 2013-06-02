YAHOO.env.classMap = {"Chatbeat": "chatbeat", "Chatbeat.window": "chatbeat", "Chatbeat.pages": "chatbeat", "Chatbeat.player": "chatbeat", "Chatbeat.playlist": "chatbeat", "Chatbeat.handlers": "chatbeat", "Chatbeat.cache": "chatbeat", "Chatbeat.offline": "chatbeat"};

YAHOO.env.resolveClass = function(className) {
    var a=className.split('.'), ns=YAHOO.env.classMap;

    for (var i=0; i<a.length; i=i+1) {
        if (ns[a[i]]) {
            ns = ns[a[i]];
        } else {
            return null;
        }
    }

    return ns;
};
