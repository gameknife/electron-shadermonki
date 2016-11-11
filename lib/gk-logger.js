/**
 * Created by gameKnife on 2016/11/11.
 */
var logger = logger || {};

logger.window = null;
logger.console = null;
logger.logcache = new Array();

logger.LOGTYPE_INFO = 0;
logger.LOGTYPE_WARN = 1;
logger.LOGTYPE_ERRO = 2;

logger.init = function( window ) {

    this.window = window;
    this.console = bid('console-log-container');
};

logger.info = function( logstr ) {
    logger.logcache.unshift([logger.LOGTYPE_INFO, logstr]);
    logger.refreshLog();
};

logger.warn = function( logstr ) {
    logger.logcache.unshift([logger.LOGTYPE_WARN, logstr]);
    logger.refreshLog();
};

logger.error = function( logstr ) {
    logger.logcache.unshift([logger.LOGTYPE_ERRO, logstr]);
    logger.refreshLog();
};

logger.refreshLog = function()
{
    while (this.console.firstChild) {
        this.console.removeChild(this.console.firstChild);
    }

    if( logger.logcache.length > 50 )
    {
        var deleteCount = logger.logcache.length - 50;
        logger.logcache.splice(50, deleteCount);
    }

    var count = 0;
    logger.logcache.forEach( function(line)
    {
        var log_line = document.createElement('div');
        if(count++ % 2 === 0)
        {
            log_line.className = 'log-line-s';
        }
        else
        {
            log_line.className = 'log-line-d';
        }

        var infotype = line[0];
        var log_icon = document.createElement('i');

        switch( infotype )
        {
            case logger.LOGTYPE_INFO:
                log_icon.className = 'btm bt-info-circle';
                log_line.style.color = '#fff';
                break;
            case logger.LOGTYPE_WARN:
                log_icon.className = 'bts bt-exclamation-triangle';
                log_line.style.color = '#ff3';
                break;
            case logger.LOGTYPE_ERRO:
                log_icon.className = 'bts bt-ban';
                log_line.style.color = '#f33';
                break;
        }

        log_line.appendChild(log_icon);

        var log_text = document.createTextNode(' ' + line[1]);
        log_line.appendChild(log_text);

        logger.console.appendChild(log_line);
    });

};

function bid(id){return document.getElementById(id);}
