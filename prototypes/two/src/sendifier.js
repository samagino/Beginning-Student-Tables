// Number -> (String -> Side Effect)
function makeSendifier (delay) {
    let item = false;

    function setItem (nuveau) {
        item = nuveau;
    }

    function sendItem () {
        if (item) {
            fetch("http://107.170.76.216:8000/log/foo", { method: 'POST', // or 'PUT'
                                                          body: item, // data can be `string` or {object}!
                                                          mode: 'no-cors',
                                                          headers: { 'Content-Type': 'application/json' } });
        }

        item = false;
    }

    setInterval(sendItem, delay);

    return setItem;
}

export default makeSendifier;
