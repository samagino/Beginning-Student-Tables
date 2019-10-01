// Number String -> (String -> Side Effect)
function makeSendifier (delay, sessionID) {
    const url = "http://107.170.76.216:8000/log/session" + sessionID;
    let item = false;

    function setItem (news) {
        item = news;
    }

    function sendItem () {
        if (item) {
            const sent = item;
            fetch(url, { method: 'POST', // or 'PUT'
                         body: sent, // data can be `string` or {object}!
                         mode: 'no-cors',
                         headers: { 'Content-Type': 'application/json' } })
            .then(function () {
                      setTimeout(sendItem, delay);
                  },
                  function () {
                      if (!item) item = sent;
                      setTimeout(sendItem, delay);
                  });
            item = false;
        } else {
            setTimeout(sendItem, delay);
        }
    }

    sendItem();

    return setItem;
}

export default makeSendifier;
